# app.py
from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np
from collections import Counter
import ast
import traceback
import os

app = Flask(__name__)

# =============================
# 🧩 LOAD MODELS & MAPPINGS
# =============================

# Paths (adjust if needed)
MODEL_DIR = "./"  # or "/kaggle/working/" if running in Kaggle
CSV_DIR = "./"    # where your CSVs are

# Load all 6 models
model_names = [
    "Logistic_Regression_model.joblib",
    "Decision_Tree_model.joblib",
    "Random_Forest_model.joblib",
    "SVM_model.joblib",
    "NaiveBayes_model.joblib",
    "K-Nearest_Neighbors_model.joblib"
]

models = {}
for filename in model_names:
    try:
        model = joblib.load(os.path.join(MODEL_DIR, filename))
        models[filename] = model
        print(f"✅ Loaded {filename}")
    except Exception as e:
        print(f"❌ Failed to load {filename}: {e}")

if len(models) == 0:
    raise Exception("NO MODELS LOADED. Check paths and filenames.")

# Load LabelEncoder
try:
    le = joblib.load(os.path.join(MODEL_DIR, "label_encoder.joblib"))
    print("✅ LabelEncoder loaded.")
except Exception as e:
    raise Exception(f"Failed to load LabelEncoder: {e}")

# Load doctor mapping
doc_data = pd.read_csv(os.path.join(CSV_DIR, "Doctor_Versus_Disease.csv"), encoding='latin1', names=['Disease','Specialist'])
doc_data['Specialist'] = np.where(doc_data['Disease'] == 'Tuberculosis', 'Pulmonologist', doc_data['Specialist'])

# Load disease description (optional for future)
des_data = pd.read_csv(os.path.join(CSV_DIR, "Disease_Description.csv"))

# Load hospitals data
hospitals_df = pd.read_csv(os.path.join(CSV_DIR, "Hospitals data.csv"))

# Clean & parse specialties
def clean_quotes(text):
    if isinstance(text, str):
        return text.replace('‘', "'").replace('’', "'").replace('“', '"').replace('”', '"')
    return text

hospitals_df['specialties_clean'] = hospitals_df['specialties'].apply(clean_quotes)

def safe_literal_eval(val):
    try:
        return ast.literal_eval(val)
    except:
        if isinstance(val, str):
            val = val.replace(",'", "','")
            try:
                return ast.literal_eval(val)
            except:
                pass
        return []

hospitals_df['specialty_list'] = hospitals_df['specialties_clean'].apply(safe_literal_eval)
hospitals_df['specialty_list'] = hospitals_df['specialty_list'].apply(
    lambda lst: [item.strip().lower() for item in lst] if isinstance(lst, list) else []
)

# Specialist → Hospital keyword mapping
specialist_to_hospital_keywords = {
    'Allergist': ['allergy'],
    'Cardiologist': ['cardiology', 'hypertension', 'heart_attack', 'vascular_surgery', 'rehabilitation_services'],
    'Dermatologist': ['dermatology', 'acne', 'fungal_infection', 'psoriasis'],
    'Endocrinologist': ['diabetes', 'endocrinology', 'metabolic_disorders', 'hypothyroidism', 'hyperthyroidism'],
    'Gastroenterologist': ['gastroenterology', 'gerd', 'peptic_ulcer', 'jaundice', 'piles', 'gastroenteritis', 'chronic_cholestasis'],
    'Gynecologist': ['gynecology', 'maternity', 'urinary_tract_infection'],
    'Hepatologist': ['hepatology', 'liver_diseases', 'hepatitis', 'alcoholic_hepatitis', 'chronic_cholestasis'],
    'Internal Medcine': ['internal_medicine', 'malaria', 'dengue', 'hiv/aids', 'general_medicine', 'family_medicine'],
    'Neurologist': ['neurology', 'sclérose_en_plaques', 'maladie_de_parkinson', 'migraine', 'cervical_spondylosis', 'paralysis'],
    'Osteopathic': ['hiv/aids'],
    'Otolaryngologist': ['ent', 'vertigo', 'common_cold'],
    'Pediatrician': ['pediatric_care', 'neonatology', 'child_health', 'vaccinations', 'typhoid'],
    'Phlebologist': ['varicose_veins'],
    'Pulmonologist': ['pulmonology', 'tuberculosis', 'respiratory_diseases', 'bronchial_asthma', 'pneumonia', 'chronic_respiratory_diseases'],
    'Rheumatologists': ['rheumatology', 'osteoarthristis', 'arthritis'],
    'Tuberculosis': ['tuberculosis', 'maladies_pulmonaires'],
    'Oncologist': ['oncology', 'cancer', 'chemotherapy', 'radiation_therapy', 'palliative_care'],
    'Orthopedic Surgeon': ['orthopedics', 'surgical_services', 'emergency_care'],
    'Nephrologist': ['nephrology', 'chronic_kidney_disease', 'renal_failure', 'dialysis_services'],
    'Psychiatrist': ['psychiatry', 'mental_health', 'psychology'],
    'Surgeon': ['surgery', 'surgical_services', 'emergency_services'],
    'General Physician': ['general_medicine', 'family_medicine', 'internal_medicine'],
}

# Hospital recommendation function
def recommend_hospital_for_specialist_final(specialist, top_n=5):
    keywords = specialist_to_hospital_keywords.get(specialist, [])
    if not keywords:
        filtered_hospitals = hospitals_df.copy()
    else:
        filtered_hospitals = hospitals_df[
            hospitals_df['specialty_list'].apply(
                lambda hospital_specs: any(
                    any(keyword in spec for keyword in keywords) for spec in hospital_specs
                )
            )
        ]
    
    if filtered_hospitals.empty:
        filtered_hospitals = hospitals_df.copy()

    available_columns = ['hospital_name', 'city', 'region', 'ownership', 'level', 'website_or_page', 'map_link', 'latitude', 'longitude']
    output_columns = [col for col in available_columns if col in filtered_hospitals.columns]
    return filtered_hospitals[output_columns].head(top_n).to_dict(orient='records')

# Get column names (symptoms) from training data — IMPORTANT!
# Since you didn't save the column names, we reconstruct from model input shape
# But better: save X.columns during training! For now, we infer from one model.

# Let's get feature names from Logistic Regression model (assuming it has feature_names_in_)
sample_model = next(iter(models.values()))
if hasattr(sample_model, 'feature_names_in_'):
    ALL_SYMPTOMS = sample_model.feature_names_in_.tolist()
else:
    # Fallback: load from your dis_sym_data_v1 columns (you must save this during training!)
    # For now, we'll assume you have a file or reconstruct — but this is risky.
    # ⚠️ STRONGLY RECOMMEND saving symptom_columns.pkl during training
    # Example: joblib.dump(X.columns.tolist(), 'symptom_columns.pkl')
    # For demo, we'll try to load from CSV if exists, else fail.
    # Load symptom feature names (the exact columns model was trained on)
    try:
        ALL_SYMPTOMS = joblib.load(os.path.join(MODEL_DIR, "model_features.joblib"))
        print(f"✅ Loaded {len(ALL_SYMPTOMS)} symptom features from model_features.joblib")
    except Exception as e:
        raise Exception(f"Failed to load symptom features. Did you save model_features.joblib during training? Error: {e}")
    print(f"✅ Model expects {len(ALL_SYMPTOMS)} symptoms.")

# =============================
# 🚀 PREDICTION ENDPOINT
# =============================

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data received"}), 400

        symptoms_list = data.get("symptoms", [])
        if not isinstance(symptoms_list, list):
            return jsonify({"error": "'symptoms' must be a list of strings"}), 400

        # Create binary feature vector
        test_data = {symptom: 1 if symptom in symptoms_list else 0 for symptom in ALL_SYMPTOMS}
        test_df = pd.DataFrame([test_data])

        # Predict with all 6 models
        predicted_diseases = []
        for model_name, model in models.items():
            try:
                pred = model.predict(test_df)
                disease_name = le.inverse_transform(pred)[0]
                predicted_diseases.append(disease_name)
            except Exception as e:
                print(f"ModelError in {model_name}: {e}")
                continue

        if len(predicted_diseases) == 0:
            raise Exception("All models failed to predict.")

        # Ensemble: Count votes
        disease_counts = Counter(predicted_diseases)
        total_models = len(models)
        percentage_per_disease = {disease: (count / total_models) * 100 for disease, count in disease_counts.items()}
        
        # Get top prediction
        top_disease = max(percentage_per_disease, key=percentage_per_disease.get)
        confidence = percentage_per_disease[top_disease] / 100.0  # 0.0 to 1.0

        # Get specialist
        specialist_row = doc_data[doc_data['Disease'] == top_disease]
        if not specialist_row.empty:
            specialist = specialist_row.iloc[0]['Specialist']
        else:
            specialist = "General Physician"

        # Get raw hospital list
        raw_hospitals = recommend_hospital_for_specialist_final(specialist, top_n=5)

        # ✅ WRAP each hospital inside "hospital_list" to match Node.js schema
        recommended_hospitals = [{"hospital_list": hospital} for hospital in raw_hospitals]

        # Build reasoning
        reasoning_factors = [
            f"Predicted based on {len(symptoms_list)} symptoms: {', '.join(symptoms_list[:5])}{'...' if len(symptoms_list) > 5 else ''}",
            f"Ensemble prediction from {len(predicted_diseases)} models.",
            f"Top prediction: {top_disease} ({confidence:.1%} agreement).",
            f"Recommended specialist: {specialist}."
        ]

        # ✅ RETURN STRUCTURE YOUR NODE.JS BACKEND EXPECTS
        response = {
            "predicted_disease": top_disease,
            "recommended_specialist": specialist,
            "confidence": confidence,
            "decision_reason": {
                "factors": reasoning_factors
            },
            "recommended_hospitals": recommended_hospitals  # List of dicts
        }

        return jsonify(response)

    except Exception as e:
        error_trace = traceback.format_exc()
        print("❌ Server Error:", error_trace)
        return jsonify({
            "error": "Prediction failed",
            "details": str(e)
        }), 500

# =============================
# 🧪 OPTIONAL: HEALTH CHECK
# =============================

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "status": "AI Service Running ✅",
        "models_loaded": len(models),
        "symptoms_expected": len(ALL_SYMPTOMS),
        "sample_symptoms": ALL_SYMPTOMS[:5]
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)