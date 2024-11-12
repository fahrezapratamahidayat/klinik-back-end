import { RequestHandler, Router } from "express";
import { createMedicine, getAllMedicine, getMedicineById, updateMedicine, deleteMedicine } from "../controllers/farmasi/medicine-controller";
import { getPatientRegistration, updatePatientRegistrationStatus, getQueueInfo, getPatientRegistrationById } from "../controllers/farmasi/patient-registration-contoller";
import { getHistoryEncounter, getEncounterPatientRegistrationById, updateEncounterPatientRegistration } from "../controllers/farmasi/encounter-controller";
import {
    confirmPrescription,
    processPrescription,
    dispensePrescription,
    getPendingPrescriptions,
    getMedicineTransactions
  } from '../controllers/farmasi/pharmacy-controller';
export const FarmasiRoutes = Router();

// Medicine
FarmasiRoutes.get("/medicine", getAllMedicine as RequestHandler);
FarmasiRoutes.get("/medicine/:id", getMedicineById as RequestHandler);
FarmasiRoutes.post("/medicine", createMedicine as RequestHandler);
FarmasiRoutes.put("/medicine/:id", updateMedicine as RequestHandler);
FarmasiRoutes.delete("/medicine/:id", deleteMedicine as RequestHandler);

// Patient Registration
FarmasiRoutes.get("/patient-registration", getPatientRegistration as RequestHandler);
FarmasiRoutes.get("/patient-registration/:id", getPatientRegistrationById as RequestHandler);
FarmasiRoutes.patch("/patient-registration/status/:id", updatePatientRegistrationStatus as RequestHandler);

// Queue Info
FarmasiRoutes.get("/queue-info", getQueueInfo as RequestHandler);

// Encounter
FarmasiRoutes.get("/encounter/history/:id", getHistoryEncounter as RequestHandler);
FarmasiRoutes.get("/encounter/:id", getEncounterPatientRegistrationById as RequestHandler);
FarmasiRoutes.put("/encounter/:id", updateEncounterPatientRegistration as RequestHandler);

// Pharmacy
FarmasiRoutes.get('/prescriptions/pending', getPendingPrescriptions as RequestHandler);
FarmasiRoutes.get('/medicine-transactions', getMedicineTransactions as RequestHandler);
FarmasiRoutes.patch('/prescriptions/:prescriptionId/confirm', confirmPrescription as RequestHandler);
FarmasiRoutes.patch('/prescriptions/:prescriptionId/process', processPrescription as RequestHandler);
FarmasiRoutes.patch('/prescriptions/:prescriptionId/dispense', dispensePrescription as RequestHandler);


