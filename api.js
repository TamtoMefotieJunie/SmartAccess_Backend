    var express = require('express');
    var lowdb = require('lowdb');
    var filesync = require('lowdb/adapters/FileSync');
    var { v4: uuidv4 } = require('uuid');
    var bodyParser = require('body-parser');
    // const hospitalservice = require("services/hospital.service.js");
    const specialtyService = require("./services/specialty.service");
    const HospitalSpecialtyOffering = require('./models/HospitalSpecialtyOffering.model')

    var app = express();

    var adapter = new filesync('db.json');
    var db = lowdb(adapter);

    db.defaults({
        posts: [],
    }).write();

    app.use(bodyParser.json());


    app.post('/add-task', function(req, res) {
        var title = req.body.title;
        var id = uuidv4();
        if (!title || title === undefined) {
            res.status(400).end();
        } else {
            db.get('posts').push({ id, title }).write();
            return res.status(201).end();
        }
    });

    app.get('/tasks', function(req, res) {
        return res.json(db.getState());
    });

    app.get('/tasks/:id', function(req, res) {
        var id = req.params.id;
        let a = db.get('posts').find({ id: id });
        if (a) {
            return res.json(a);
        }
        return res.status(404).end();
    });

    app.put('/tasks/:id', function(req, res) {
        var update = req.body.title;
        if (!update || update === undefined) {
            res.status(400).end();
        } else {
            db.get('posts').find({ id: req.params.id }).assign({ title: update }).write();
            return res.status(200).end();
        }
    });

    app.delete('/tasks/:id', function(req, res) {
        db.get('posts').remove({ id: req.params.id }).write();
        return res.status(200).end();
    });

    app.get('/allHospital', function(req, res) {
        const hospitals = [
            {
                name: "Hôpital Central Yaoundé",
                city: "Yaoundé",
                region: "Center",
                specialties: ["diabetes", "hypertension", "HIV/AIDS", "chronic kidney disease", "cancer"]
            },
            {
                name: "Hôpital Général de Douala",
                city: "Douala",
                region: "Littoral",
                specialties: ["diabetes", "hypertension", "HIV/AIDS", "chronic respiratory diseases", "cancer"]
            },
            {
                name: "Regional Hospital Maroua",
                city: "Maroua",
                region: "Far North",
                specialties: ["diabetes", "hypertension", "HIV/AIDS", "Maternity"]
            }
        ];
        res.status(200).json(hospitals);
    });


    app.get('/fetch/specialty/:id', async (req, res) => {
        const { id } = req.params;

        // ✅ 1. Validate ObjectId format FIRST
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                error: "Invalid specialty ID format"
            });
        }

        try {
            // ✅ 2. Query your HospitalSpecialtyOffering model
            // Replace 'HospitalSpecialtyOffering' with your actual model name
            const offerings = await HospitalSpecialtyOffering.find({ speciality: id })
                .populate('hospital', 'hospital_name city region service_name') // Populate only needed fields
                .lean(); // Optional: returns plain JS objects (faster)

            // ✅ 3. If no offerings found, return 404
            if (!offerings || offerings.length === 0) {
                return res.status(404).json({
                    error: "No hospitals found for this specialty"
                });
            }

            // ✅ 4. SUCCESS: Send response
            return res.status(200).json({
                message: "Offerings fetched successfully!",
                data: offerings
            });

        } catch (err) {
            // ✅ 5. Log error for debugging
            console.error("🔥 Server Error in /fetch/specialty/:id:", err);

            // ✅ 6. ALWAYS send a response to prevent timeout
            return res.status(500).json({
                error: "An error occurred while fetching offerings."
            });
        }
    });

    app.post('/login', function(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        if (email === "lady2@gmail.com" && password === "lady2@123") {
            return res.status(200).json({
                message: "Login successful",
                token: "mock-jwt-token-12345"
            });
        } else {
            return res.status(401).json({ error: "Invalid credentials" });
        }
    });

    app.get('/', function(req, res) {
        const roles = [
            { id: 1, name: "Admin" },
            { id: 2, name: "HospitalAdmin" },
            { id: 3, name: "Citizen" },
            { id: 4, name: "Local_Authority" }
        ];
        res.status(200).json(roles);
    });

    const server = app.listen(3000, function() {
        console.log('API up and running on port 3000');
    });

    module.exports = server; 