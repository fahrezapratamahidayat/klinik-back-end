"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendaftaranRoutes = void 0;
const express_1 = require("express");
const patient_controller_1 = require("../controllers/pendaftaran/patient-controller");
const patient_registration_1 = require("../controllers/pendaftaran/patient-registration");
const doctor_schedule_controller_1 = require("../controllers/admin/doctor-schedule-controller");
const report_services_1 = __importDefault(require("../services/report-services"));
exports.PendaftaranRoutes = (0, express_1.Router)();
// Patient Routes
exports.PendaftaranRoutes.post('/patient', patient_controller_1.createPatient);
exports.PendaftaranRoutes.post('/patient/newborn', patient_controller_1.createNewbornPatient);
exports.PendaftaranRoutes.get('/patient', patient_controller_1.getAllPatients);
exports.PendaftaranRoutes.get('/patient/:id', patient_controller_1.getPatientById);
exports.PendaftaranRoutes.delete('/patient/:id', patient_controller_1.deletePatient);
// Patient Registration Routes
exports.PendaftaranRoutes.post('/patient-registration', patient_registration_1.createPatientRegistration);
exports.PendaftaranRoutes.get('/patient-registration', patient_registration_1.getPatientRegistrations);
exports.PendaftaranRoutes.get('/patient-registration/:id', patient_registration_1.getPatientRegistrationById);
exports.PendaftaranRoutes.get('/queue-info', patient_registration_1.getQueueInfo);
exports.PendaftaranRoutes.patch('/patient-registration/status/:id', patient_registration_1.updatePatientRegistrationStatus);
// Doctor Schedule Routes
exports.PendaftaranRoutes.get('/doctor-schedule', doctor_schedule_controller_1.getDoctorSchedules);
// Report routes
exports.PendaftaranRoutes.get("/patient-visit-report", report_services_1.default.getPatientVisitReport);
