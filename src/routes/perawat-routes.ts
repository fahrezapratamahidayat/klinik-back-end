import { Router, RequestHandler } from "express";
import { getEncounterPatientRegistrationById, getHistoryEncounter, getPatientRegistration, getPatientRegistrationById, updateEncounterPatientRegistration, getQueueInfo } from "../controllers/perawat/patient-registration";
import { getAllPatients, getPatientById } from "../controllers/perawat/patient-controller";

export const PerawatRoutes: Router = Router();

// queue
PerawatRoutes.get("/queue-info", getQueueInfo as RequestHandler);

// patient
PerawatRoutes.get("/patient", getAllPatients as RequestHandler);
PerawatRoutes.get("/patient/:id", getPatientById as RequestHandler);

// patient registration
PerawatRoutes.get("/patient-registration", getPatientRegistration as RequestHandler);
PerawatRoutes.get("/patient-registration/:id", getPatientRegistrationById as RequestHandler);

// encounter
PerawatRoutes.get("/encounter/:id", getEncounterPatientRegistrationById as RequestHandler);
PerawatRoutes.get("/encounter/history/:id", getHistoryEncounter as RequestHandler);
PerawatRoutes.put("/encounter/:id", updateEncounterPatientRegistration as RequestHandler);
