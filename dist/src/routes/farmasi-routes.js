"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FarmasiRoutes = void 0;
const express_1 = require("express");
const medicine_controller_1 = require("../controllers/farmasi/medicine-controller");
const patient_registration_contoller_1 = require("../controllers/farmasi/patient-registration-contoller");
const encounter_controller_1 = require("../controllers/farmasi/encounter-controller");
const pharmacy_controller_1 = require("../controllers/farmasi/pharmacy-controller");
exports.FarmasiRoutes = (0, express_1.Router)();
// Medicine
exports.FarmasiRoutes.get("/medicine", medicine_controller_1.getAllMedicine);
exports.FarmasiRoutes.get("/medicine/:id", medicine_controller_1.getMedicineById);
exports.FarmasiRoutes.post("/medicine", medicine_controller_1.createMedicine);
exports.FarmasiRoutes.put("/medicine/:id", medicine_controller_1.updateMedicine);
exports.FarmasiRoutes.delete("/medicine/:id", medicine_controller_1.deleteMedicine);
// Patient Registration
exports.FarmasiRoutes.get("/patient-registration", patient_registration_contoller_1.getPatientRegistration);
exports.FarmasiRoutes.get("/patient-registration/:id", patient_registration_contoller_1.getPatientRegistrationById);
exports.FarmasiRoutes.patch("/patient-registration/status/:id", patient_registration_contoller_1.updatePatientRegistrationStatus);
// Queue Info
exports.FarmasiRoutes.get("/queue-info", patient_registration_contoller_1.getQueueInfo);
// Encounter
exports.FarmasiRoutes.get("/encounter/history/:id", encounter_controller_1.getHistoryEncounter);
exports.FarmasiRoutes.get("/encounter/:id", encounter_controller_1.getEncounterPatientRegistrationById);
exports.FarmasiRoutes.put("/encounter/:id", encounter_controller_1.updateEncounterPatientRegistration);
// Pharmacy
exports.FarmasiRoutes.get('/prescriptions/pending', pharmacy_controller_1.getPendingPrescriptions);
exports.FarmasiRoutes.get('/medicine-transactions', pharmacy_controller_1.getMedicineTransactions);
exports.FarmasiRoutes.patch('/prescriptions/:prescriptionId/confirm', pharmacy_controller_1.confirmPrescription);
exports.FarmasiRoutes.patch('/prescriptions/:prescriptionId/process', pharmacy_controller_1.processPrescription);
exports.FarmasiRoutes.patch('/prescriptions/:prescriptionId/dispense', pharmacy_controller_1.dispensePrescription);
