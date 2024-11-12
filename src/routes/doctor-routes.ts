import { Router, RequestHandler } from "express";
import { getPatientRegistration,getPatientRegistrationById, getQueueInfo, updatePatientRegistrationStatus } from "../controllers/dokter/patient-registration-controller";
import { getAllPatients } from "../controllers/dokter/patient-controller";
import { getPatientById } from "../controllers/dokter/patient-controller";
import { getAllMedicine } from "../controllers/dokter/medicine-controller";
import { getHistoryEncounter, updateEncounterPatientRegistration, getEncounterPatientRegistrationById, getIcd10, getIcd9 } from "../controllers/dokter/encounter-controller";

export const doctorRoutes: Router = Router();

// Patient
doctorRoutes.get("/patient", getAllPatients as RequestHandler);
doctorRoutes.get("/patient/:id", getPatientById as RequestHandler);

// Patient Registration
doctorRoutes.get("/patient-registration", getPatientRegistration as RequestHandler);
doctorRoutes.get("/patient-registration/:id", getPatientRegistrationById as RequestHandler);
doctorRoutes.patch("/patient-registration/status/:id", updatePatientRegistrationStatus as RequestHandler);

// Queue Info
doctorRoutes.get("/queue-info", getQueueInfo as RequestHandler);

// Encounter
doctorRoutes.get("/encounter/:id", getEncounterPatientRegistrationById as RequestHandler);
doctorRoutes.get("/encounter/history/:id", getHistoryEncounter as RequestHandler);
doctorRoutes.put("/encounter/:id", updateEncounterPatientRegistration as RequestHandler);

// Medicine
doctorRoutes.get("/medicine", getAllMedicine as RequestHandler);

// icd 10
doctorRoutes.get("/icd10", getIcd10 as RequestHandler);

// icd 9
doctorRoutes.get("/icd9", getIcd9 as RequestHandler);

