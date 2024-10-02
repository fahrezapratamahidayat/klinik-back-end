import { Router } from "express";
import { createPatient, getPatient } from "../controllers/patient-controller";

export const PatientRoutes: Router = Router();

PatientRoutes.post('/', createPatient);
PatientRoutes.get('/:nik', getPatient);
