"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerawatRoutes = void 0;
const express_1 = require("express");
const patient_registration_1 = require("../controllers/perawat/patient-registration");
const patient_controller_1 = require("../controllers/perawat/patient-controller");
const encounter_controller_1 = require("../controllers/perawat/encounter-controller");
const report_services_1 = __importDefault(require("../services/report-services"));
exports.PerawatRoutes = (0, express_1.Router)();
// queue
exports.PerawatRoutes.get("/queue-info", patient_registration_1.getQueueInfo);
// patient
exports.PerawatRoutes.get("/patient", patient_controller_1.getAllPatients);
exports.PerawatRoutes.get("/patient/:id", patient_controller_1.getPatientById);
// patient registration
exports.PerawatRoutes.get("/patient-registration", patient_registration_1.getPatientRegistration);
exports.PerawatRoutes.get("/patient-registration/:id", patient_registration_1.getPatientRegistrationById);
// update status 
exports.PerawatRoutes.patch("/patient-registration/status/:id", patient_registration_1.updatePatientRegistrationStatus);
// encounter
exports.PerawatRoutes.get("/encounter/:id", encounter_controller_1.getEncounterPatientRegistrationById);
exports.PerawatRoutes.get("/encounter/history/:id", encounter_controller_1.getHistoryEncounter);
exports.PerawatRoutes.put("/encounter/:id", encounter_controller_1.updateEncounterPatientRegistration);
// Report Routes
exports.PerawatRoutes.get("/patient-visit-report", report_services_1.default.getPatientVisitReport);
