import { RequestHandler, Router } from "express";
import { createNewbornPatient, createPatient, deletePatient, getAllPatients, getPatientById } from "../controllers/pendaftaran/patient-controller";
import { createPatientRegistration, getPatientRegistrations, getPatientRegistrationById, getQueueInfo, updatePatientRegistrationStatus } from "../controllers/pendaftaran/patient-registration";

export const PendaftaranRoutes: Router = Router();

PendaftaranRoutes.post('/patient', createPatient as RequestHandler);
PendaftaranRoutes.post('/patient/newborn', createNewbornPatient as RequestHandler)
PendaftaranRoutes.get('/patient', getAllPatients as RequestHandler);
PendaftaranRoutes.get('/patient/:id', getPatientById as RequestHandler);
PendaftaranRoutes.delete('/patient/:id', deletePatient as RequestHandler);

PendaftaranRoutes.post('/patient-registration', createPatientRegistration as RequestHandler);
PendaftaranRoutes.get('/patient-registration', getPatientRegistrations as RequestHandler);
PendaftaranRoutes.get('/patient-registration/:id', getPatientRegistrationById as RequestHandler);
PendaftaranRoutes.get('/queue-info', getQueueInfo as RequestHandler);
PendaftaranRoutes.patch('/patient-registration/status/:id', updatePatientRegistrationStatus  as RequestHandler);
