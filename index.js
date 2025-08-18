require ("dotenv").config();
const cors = require("cors");
const express = require("express");
const multer = require('multer');
const app = express();
app.use(express.json());
app.use(cors());

require('./db');
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

const authRoutes = require('./routes/user.routes');
const roleRoutes = require('./routes/role.routes');
const hospitalRoutes = require('./routes/hospital.routes');
const protectedRoutes = require('./routes/protected.routes');
const loginRoutes = require('./routes/authentication.routes');
const appointmentRoutes = require('./routes/appointment.routes')
const file_uploadRoutes = require('./routes/uploadedFiles.routes')
const predictionRoute = require('./routes/prediction.routes')

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/roles', roleRoutes);
app.use('/banks', hospitalRoutes);
app.use('/user', loginRoutes);
app.use('/protected', protectedRoutes);
app.use('/appointment', appointmentRoutes);
app.use('/files',file_uploadRoutes);
app.use('/prediction',predictionRoute)


const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}...`, { port }));

