import { RequestHandler, Router } from "express";
import {
  getPatientRegistration,
  updatePatientRegistrationStatus,
  getQueueInfo,
  getPatientRegistrationById,
} from "../controllers/kasir/patient-registration-contoller";
import {
  getEncounterPatientRegistrationById,
  getHistoryEncounter,
  updateEncounterPatientRegistration,
} from "../controllers/kasir/encounter-controller";
import {
  getPaymentByRegistrationId,
  createPayment,
  confirmPayment,
  createPaymentWithMidtrans,
  updatePaymentStatus,
} from "../controllers/kasir/payment-controller";
import ReportController from "../services/report-services";
export const KasirRoutes = Router();

// Patient Registration
KasirRoutes.get(
  "/patient-registration",
  getPatientRegistration as RequestHandler
);
KasirRoutes.get(
  "/patient-registration/:id",
  getPatientRegistrationById as RequestHandler
);
KasirRoutes.patch(
  "/patient-registration/status/:id",
  updatePatientRegistrationStatus as RequestHandler
);

// Encounter
KasirRoutes.get(
  "/encounter/history/:id",
  getHistoryEncounter as RequestHandler
);
KasirRoutes.get(
  "/encounter/:id",
  getEncounterPatientRegistrationById as RequestHandler
);
KasirRoutes.patch(
  "/encounter/:id",
  updateEncounterPatientRegistration as RequestHandler
);

// Payment
KasirRoutes.get(
  "/payment/registration/:registrationId",
  getPaymentByRegistrationId as RequestHandler
);
KasirRoutes.post("/payment", createPayment as RequestHandler);
KasirRoutes.patch("/payment/:id/confirm", confirmPayment as RequestHandler);
KasirRoutes.post(
  "/payment/create-midtrans",
  createPaymentWithMidtrans as RequestHandler
);
KasirRoutes.get(
  "/payment/status",
  updatePaymentStatus as RequestHandler
);

// Income Report
KasirRoutes.get(
  "/income",
  ReportController.getIncomeReport as RequestHandler
);
KasirRoutes.get("/transactions", ReportController.getTransactionHistory as RequestHandler)

// Queue Info
KasirRoutes.get("/queue-info", getQueueInfo as RequestHandler);
