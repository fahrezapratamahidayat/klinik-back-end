import { RequestHandler, Router } from "express";
import { createNewbornPatient, createPatient, deletePatient, getAllPatients, getPatientById } from "../controllers/pendaftaran/patient-controller";
import { createPatientRegistration, getPatientRegistrations, getPatientRegistrationById, getQueueInfo, updatePatientRegistrationStatus } from "../controllers/pendaftaran/patient-registration";
import { getDoctorSchedules } from "../controllers/admin/doctor-schedule-controller";
import ReportController from "../services/report-services"

export const PendaftaranRoutes: Router = Router();

// Patient Routes
PendaftaranRoutes.post('/patient', createPatient as RequestHandler);
PendaftaranRoutes.post('/patient/newborn', createNewbornPatient as RequestHandler)
PendaftaranRoutes.get('/patient', getAllPatients as RequestHandler);
PendaftaranRoutes.get('/patient/:id', getPatientById as RequestHandler);
PendaftaranRoutes.delete('/patient/:id', deletePatient as RequestHandler);

// Patient Registration Routes
PendaftaranRoutes.post('/patient-registration', createPatientRegistration as RequestHandler);
PendaftaranRoutes.get('/patient-registration', getPatientRegistrations as RequestHandler);
PendaftaranRoutes.get('/patient-registration/:id', getPatientRegistrationById as RequestHandler);
PendaftaranRoutes.get('/queue-info', getQueueInfo as RequestHandler);
PendaftaranRoutes.patch('/patient-registration/status/:id', updatePatientRegistrationStatus  as RequestHandler);

// Doctor Schedule Routes
PendaftaranRoutes.get('/doctor-schedule', getDoctorSchedules as RequestHandler);

// Report routes
PendaftaranRoutes.get("/patient-visit-report", ReportController.getPatientVisitReport as RequestHandler);
