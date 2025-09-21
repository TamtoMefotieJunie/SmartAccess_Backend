const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

let hospitals = [];
const specialistToHospitalKeywords = {
    'Allergist': ['allergy'],
    'Cardiologist': ['cardiology', 'hypertension', 'heart_attack', 'vascular_surgery', 'rehabilitation_services', 'cardiovascular'],
    'Dermatologist': ['dermatology', 'acne', 'fungal_infection', 'psoriasis', 'skin'],
    'Endocrinologist': ['diabetes', 'endocrinology', 'metabolic_disorders', 'hypothyroidism', 'hyperthyroidism'],
    'Gastroenterologist': ['gastroenterology', 'gerd', 'peptic_ulcer', 'jaundice', 'piles', 'gastroenteritis', 'chronic_cholestasis', 'liver'],
    'Gynecologist': ['gynecology', 'maternity', 'urinary_tract_infection', 'obstetrics'],
    'Hepatologist': ['hepatology', 'liver_diseases', 'hepatitis', 'alcoholic_hepatitis', 'chronic_cholestasis'],
    'Internal Medcine': ['internal_medicine', 'malaria', 'dengue', 'hiv/aids', 'general_medicine', 'family_medicine'],
    'Neurologist': ['neurology', 'sclérose_en_plaques', 'maladie_de_parkinson', 'migraine', 'cervical_spondylosis', 'paralysis', 'epilepsy'],
    'Osteopathic': ['hiv/aids'],
    'Otolaryngologist': ['ent', 'vertigo', 'common_cold', 'ear', 'nose', 'throat'],
    'Pediatrician': ['pediatric_care', 'neonatology', 'child_health', 'vaccinations', 'typhoid', 'pediatrics'],
    'Phlebologist': ['varicose_veins', 'veins'],
    'Pulmonologist': ['pulmonology', 'tuberculosis', 'respiratory_diseases', 'bronchial_asthma', 'pneumonia', 'chronic_respiratory_diseases', 'lung'],
    'Rheumatologists': ['rheumatology', 'osteoarthristis', 'arthritis', 'joint'],
    'Tuberculosis': ['tuberculosis', 'maladies_pulmonaires'],
    'Oncologist': ['oncology', 'cancer', 'chemotherapy', 'radiation_therapy', 'palliative_care', 'tumor'],
    'Orthopedic Surgeon': ['orthopedics', 'surgical_services', 'emergency_care', 'fracture', 'bone'],
    'Nephrologist': ['nephrology', 'chronic_kidney_disease', 'renal_failure', 'dialysis_services', 'kidney'],
    'Psychiatrist': ['psychiatry', 'mental_health', 'psychology', 'depression', 'anxiety'],
    'Surgeon': ['surgery', 'surgical_services', 'emergency_services', 'general_surgery'],
    'General Physician': ['general_medicine', 'family_medicine', 'internal_medicine', 'primary_care'],
    'General Practitioner': ['general_medicine', 'family_medicine', 'primary_care', 'médecine_générale'],
};

// ✅ Initialize hospital data from CSV
const initializeHospitalData = () => {
    return new Promise((resolve, reject) => {
        const results = [];
        const csvPath = path.join(__dirname, '../data/Hospitals data.csv');

        if (!fs.existsSync(csvPath)) {
            console.error(`❌ Hospital CSV not found at: ${csvPath}`);
            return resolve();
        }

        fs.createReadStream(csvPath)
            .pipe(csv())
            .on('data', (row) => {
                // Clean specialties field (handle quotes, brackets, etc.)
                let specialtiesRaw = row.specialties || row.Specialties || row.specialty_list || '';

                let specialties = [];
                try {
                    // Try to parse as JSON array
                    if (specialtiesRaw.startsWith('[') && specialtiesRaw.endsWith(']')) {
                        specialties = JSON.parse(specialtiesRaw);
                    } else {
                        // Fallback: split by comma
                        specialties = specialtiesRaw.split(',').map(s => s.trim());
                    }
                } catch (e) {
                    // Last resort: split by comma
                    specialties = specialtiesRaw.split(',').map(s => s.trim());
                }

                // Normalize to lowercase + trim
                specialties = specialties
                    .filter(s => s && s.length > 0)
                    .map(s => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim());

                results.push({
                    hospital_name: row.hospital_name || row['Hospital Name'] || 'Unnamed Hospital',
                    city: row.city || row.City || '',
                    region: row.region || row.Region || '',
                    specialties: specialties,
                    website_or_page: row.website_or_page || row['Website'] || '',
                    map_link: row.map_link || row['Map Link'] || '',
                    ownership: row.ownership || row.Ownership || '',
                    level: row.level || row.Level || '',
                    longitude: parseFloat(row.Longitude) || parseFloat(row.longitude) || null,
                    latitude: parseFloat(row.Latitude) || parseFloat(row.latitude) || null,
                });
            })
            .on('end', () => {
                hospitals = results;
                console.log(`✅ Loaded ${hospitals.length} hospitals with normalized specialties.`);
                resolve();
            })
            .on('error', (err) => {
                console.error('❌ Error reading hospital CSV:', err);
                reject(err);
            });
    });
};

// ✅ Match hospitals using specialist → keyword mapping (like your Kaggle notebook)
const matchHospitalsBySpecialty = (specialist, topN = 5) => {
    if (!specialist) return [];

    const keywords = specialistToHospitalKeywords[specialist] || [];
    let matches = [];

    if (keywords.length === 0) {
        console.warn(`⚠️ No keywords mapped for specialist: ${specialist}. Returning all hospitals.`);
        matches = [...hospitals];
    } else {
        matches = hospitals.filter(hospital =>
            hospital.specialties.some(hospitalSpec =>
                keywords.some(keyword =>
                    hospitalSpec.includes(keyword.replace(/_/g, ' '))
                )
            )
        );

        if (matches.length === 0) {
            console.warn(`⚠️ No hospitals found for specialist "${specialist}" using keywords: [${keywords.join(', ')}]. Returning all hospitals.`);
            matches = [...hospitals];
        }
    }

    console.log(`🔍 Found ${matches.length} hospitals for specialist: "${specialist}"`);

    return matches.slice(0, topN).map(hospital => ({
        hospital_list: {
            hospital_name: hospital.hospital_name,
            city: hospital.city,
            region: hospital.region,
            specialties: hospital.specialties,
            website_or_page: hospital.website_or_page,
            map_link: hospital.map_link,
            ownership: hospital.ownership,
            level: hospital.level,
            longitude: hospital.longitude,
            latitude: hospital.latitude,
        },
        matched_specialty_ids: [] 
    }));
};

module.exports = {
    initializeHospitalData,
    matchHospitalsBySpecialty
};