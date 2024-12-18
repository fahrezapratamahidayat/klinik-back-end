"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoutes = void 0;
const express_1 = require("express");
const doctor_controller_1 = require("../controllers/admin/doctor-controller");
const room_controller_1 = require("../controllers/admin/room-controller");
const doctor_schedule_controller_1 = require("../controllers/admin/doctor-schedule-controller");
const patient_controller_1 = require("../controllers/admin/patient-controller");
const medical_services_controller_1 = __importDefault(require("../controllers/admin/medical-services-controller"));
const report_services_1 = __importDefault(require("../services/report-services"));
exports.AdminRoutes = (0, express_1.Router)();
// Patient Routes
exports.AdminRoutes.get("/patient", patient_controller_1.getAllPatients);
exports.AdminRoutes.get("/patient/:id", patient_controller_1.getPatientById);
exports.AdminRoutes.delete("/patient/:id", patient_controller_1.deletePatient);
// Doctor Routes
exports.AdminRoutes.post("/doctor", doctor_controller_1.createDoctor);
exports.AdminRoutes.get("/doctor", doctor_controller_1.getDoctors);
exports.AdminRoutes.put("/doctor/:id", doctor_controller_1.updateDoctor);
exports.AdminRoutes.get("/doctor/:id", doctor_controller_1.getDoctorById);
exports.AdminRoutes.delete("/doctor/:id", doctor_controller_1.deleteDoctor);
// Room Routes
exports.AdminRoutes.post("/room", room_controller_1.createRoom);
exports.AdminRoutes.get("/room", room_controller_1.getRooms);
exports.AdminRoutes.get("/room/:id", room_controller_1.getRoomById);
exports.AdminRoutes.put("/room/:id", room_controller_1.updateRoom);
exports.AdminRoutes.delete("/room/:id", room_controller_1.deleteRoom);
// Doctor Schedule Routes
exports.AdminRoutes.post("/doctor-schedule", doctor_schedule_controller_1.createDoctorSchedule);
exports.AdminRoutes.get("/doctor-schedule", doctor_schedule_controller_1.getDoctorSchedules);
exports.AdminRoutes.get("/doctor-schedule/:id", doctor_schedule_controller_1.getDoctorScheduleById);
exports.AdminRoutes.delete("/doctor-schedule/:id", doctor_schedule_controller_1.deleteDoctorSchedule);
exports.AdminRoutes.put("/doctor-schedule/:id", doctor_schedule_controller_1.updateDoctorSchedule);
// Services Class Routes
exports.AdminRoutes.post("/services-class", medical_services_controller_1.default.create);
exports.AdminRoutes.get("/services-class", medical_services_controller_1.default.getAll);
exports.AdminRoutes.get("/services-class/:id", medical_services_controller_1.default.getById);
exports.AdminRoutes.put("/services-class/:id", medical_services_controller_1.default.update);
exports.AdminRoutes.delete("/services-class/:id", medical_services_controller_1.default.delete);
// Report Routes
exports.AdminRoutes.get("/patient-visit-report", report_services_1.default.getPatientVisitReport);
