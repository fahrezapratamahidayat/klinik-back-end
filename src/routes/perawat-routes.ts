import { Router, RequestHandler } from "express";
import { getPatientRegistration, getPatientRegistrationById, getQueueInfo, updatePatientRegistrationStatus } from "../controllers/perawat/patient-registration";
import { getAllPatients, getPatientById } from "../controllers/perawat/patient-controller";
import { getEncounterPatientRegistrationById, getHistoryEncounter, updateEncounterPatientRegistration } from "../controllers/perawat/encounter-controller";
import ReportController from "../services/report-services";

export const PerawatRoutes: Router = Router();

// queue
PerawatRoutes.get("/queue-info", getQueueInfo as RequestHandler);

// patient
PerawatRoutes.get("/patient", getAllPatients as RequestHandler);
PerawatRoutes.get("/patient/:id", getPatientById as RequestHandler);

// patient registration
PerawatRoutes.get("/patient-registration", getPatientRegistration as RequestHandler);
PerawatRoutes.get("/patient-registration/:id", getPatientRegistrationById as RequestHandler);

// update status 
PerawatRoutes.patch("/patient-registration/status/:id", updatePatientRegistrationStatus as RequestHandler);

// encounter
PerawatRoutes.get("/encounter/:id", getEncounterPatientRegistrationById as RequestHandler);
PerawatRoutes.get("/encounter/history/:id", getHistoryEncounter as RequestHandler);
PerawatRoutes.put("/encounter/:id", updateEncounterPatientRegistration as RequestHandler);

// Report Routes
PerawatRoutes.get("/patient-visit-report", ReportController.getPatientVisitReport as RequestHandler);

