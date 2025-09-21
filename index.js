require ("dotenv").config();
const cors = require("cors");
const express = require("express");
const multer = require('multer');
const { initializeHospitalData } = require('./utils/hospitalMatcher.js');
const app = express();
app.use(express.json());
app.use(cors());

require('./db');
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
require('dotenv').config();
const { configureCloudinary } = require('./config/cloudinary');

configureCloudinary();

const authRoutes = require('./routes/user.routes');
const roleRoutes = require('./routes/role.routes');
const hospitalRoutes = require('./routes/hospital.routes');
const protectedRoutes = require('./routes/protected.routes');
const loginRoutes = require('./routes/authentication.routes');
const appointmentRoutes = require('./routes/appointment.routes')
const file_uploadRoutes = require('./routes/uploadedFiles.routes')
const predictionRoute = require('./routes/prediction.routes')
const specialtyRoute = require('./routes/specialty.routes')
const hospitalSpecialty = require('./routes/hospitalSpec.routes')
const recommendationRoutes = require('./routes/recommendation.routes')
const emergencyRoutes = require('./routes/emergencyRequest.routes')

const healthRoutes = require('./routes/health.routes.js');
const uploadRoutes = require('./routes/upload.routes.js');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

app.use('/auth', authRoutes);
app.use('/roles', roleRoutes);
app.use('/banks', hospitalRoutes);
app.use('/user', loginRoutes);
app.use('/protected', protectedRoutes);
app.use('/appointment', appointmentRoutes);
app.use('/files',file_uploadRoutes);
app.use('/prediction',predictionRoute);
app.use('/specialty',specialtyRoute)
app.use('/hospitalSpec',hospitalSpecialty)
app.use('/recommend',recommendationRoutes)
app.use('/emergency',emergencyRoutes)
app.use('/api/upload', uploadRoutes);
app.use('/api/health', healthRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

// await initializeHospitalData();
app._router.stack.forEach(layer => {
    if (layer.route) {
        console.log(`${Object.keys(layer.route.methods).join(', ').toUpperCase()} ${layer.route.path}`);
    }
});
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}...`, { port }));

