"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KasirRoutes = void 0;
const express_1 = require("express");
const patient_registration_contoller_1 = require("../controllers/kasir/patient-registration-contoller");
const encounter_controller_1 = require("../controllers/kasir/encounter-controller");
const payment_controller_1 = require("../controllers/kasir/payment-controller");
const report_services_1 = __importDefault(require("../services/report-services"));
exports.KasirRoutes = (0, express_1.Router)();
// Patient Registration
exports.KasirRoutes.get("/patient-registration", patient_registration_contoller_1.getPatientRegistration);
exports.KasirRoutes.get("/patient-registration/:id", patient_registration_contoller_1.getPatientRegistrationById);
exports.KasirRoutes.patch("/patient-registration/status/:id", patient_registration_contoller_1.updatePatientRegistrationStatus);
// Encounter
exports.KasirRoutes.get("/encounter/history/:id", encounter_controller_1.getHistoryEncounter);
exports.KasirRoutes.get("/encounter/:id", encounter_controller_1.getEncounterPatientRegistrationById);
exports.KasirRoutes.patch("/encounter/:id", encounter_controller_1.updateEncounterPatientRegistration);
// Payment
exports.KasirRoutes.get("/payment/registration/:registrationId", payment_controller_1.getPaymentByRegistrationId);
exports.KasirRoutes.post("/payment", payment_controller_1.createPayment);
exports.KasirRoutes.patch("/payment/:id/confirm", payment_controller_1.confirmPayment);
exports.KasirRoutes.post("/payment/create-midtrans", payment_controller_1.createPaymentWithMidtrans);
exports.KasirRoutes.get("/payment/status", payment_controller_1.updatePaymentStatus);
// Income Report
exports.KasirRoutes.get("/income", report_services_1.default.getIncomeReport);
exports.KasirRoutes.get("/transactions", report_services_1.default.getTransactionHistory);
// Queue Info
exports.KasirRoutes.get("/queue-info", patient_registration_contoller_1.getQueueInfo);
