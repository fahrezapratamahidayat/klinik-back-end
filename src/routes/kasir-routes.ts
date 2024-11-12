import { RequestHandler, Router } from "express";
import { getPatientRegistration, updatePatientRegistrationStatus, getQueueInfo, getPatientRegistrationById } from "../controllers/kasir/patient-registration-contoller";
export const KasirRoutes = Router();


// Patient Registration
KasirRoutes.get("/patient-registration", getPatientRegistration as RequestHandler);
KasirRoutes.get("/patient-registration/:id", getPatientRegistrationById as RequestHandler);
KasirRoutes.patch("/patient-registration/status/:id", updatePatientRegistrationStatus as RequestHandler);

// Queue Info
KasirRoutes.get("/queue-info", getQueueInfo as RequestHandler); 