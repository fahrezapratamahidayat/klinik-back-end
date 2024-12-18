"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorRoutes = void 0;
const express_1 = require("express");
const patient_registration_controller_1 = require("../controllers/dokter/patient-registration-controller");
const patient_controller_1 = require("../controllers/dokter/patient-controller");
const patient_controller_2 = require("../controllers/dokter/patient-controller");
const medicine_controller_1 = require("../controllers/dokter/medicine-controller");
const encounter_controller_1 = require("../controllers/dokter/encounter-controller");
exports.doctorRoutes = (0, express_1.Router)();
// Patient
exports.doctorRoutes.get("/patient", patient_controller_1.getAllPatients);
exports.doctorRoutes.get("/patient/:id", patient_controller_2.getPatientById);
// Patient Registration
exports.doctorRoutes.get("/patient-registration", patient_registration_controller_1.getPatientRegistration);
exports.doctorRoutes.get("/patient-registration/:id", patient_registration_controller_1.getPatientRegistrationById);
exports.doctorRoutes.patch("/patient-registration/status/:id", patient_registration_controller_1.updatePatientRegistrationStatus);
// Queue Info
exports.doctorRoutes.get("/queue-info", patient_registration_controller_1.getQueueInfo);
// Encounter
exports.doctorRoutes.get("/encounter/:id", encounter_controller_1.getEncounterPatientRegistrationById);
exports.doctorRoutes.get("/encounter/history/:id", encounter_controller_1.getHistoryEncounter);
exports.doctorRoutes.put("/encounter/:id", encounter_controller_1.updateEncounterPatientRegistration);
// Medicine
exports.doctorRoutes.get("/medicine", medicine_controller_1.getAllMedicine);
// icd 10
exports.doctorRoutes.get("/icd10", encounter_controller_1.getIcd10);
// icd 9
exports.doctorRoutes.get("/icd9", encounter_controller_1.getIcd9);
