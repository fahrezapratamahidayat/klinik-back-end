import { RequestHandler, Router } from "express";
import { createMedicine, getAllMedicine, getMedicineById, updateMedicine, deleteMedicine } from "../controllers/farmasi/medicine-controller";
import { getPatientRegistration, updatePatientRegistrationStatus, getQueueInfo } from "../controllers/farmasi/patient-registration-contoller";
import { getHistoryEncounter, getEncounterPatientRegistrationById } from "../controllers/farmasi/encounter-controller";

export const FarmasiRoutes = Router();

FarmasiRoutes.get("/medicine", getAllMedicine as RequestHandler);
FarmasiRoutes.get("/medicine/:id", getMedicineById as RequestHandler);
FarmasiRoutes.post("/medicine", createMedicine as RequestHandler);
FarmasiRoutes.put("/medicine/:id", updateMedicine as RequestHandler);
FarmasiRoutes.delete("/medicine/:id", deleteMedicine as RequestHandler);

FarmasiRoutes.get("/patient-registration", getPatientRegistration as RequestHandler);
FarmasiRoutes.put("/patient-registration/:id", updatePatientRegistrationStatus as RequestHandler);
FarmasiRoutes.get("/queue-info", getQueueInfo as RequestHandler);

FarmasiRoutes.get("/encounter/history/:id", getHistoryEncounter as RequestHandler);
FarmasiRoutes.get("/encounter/:id", getEncounterPatientRegistrationById as RequestHandler);


