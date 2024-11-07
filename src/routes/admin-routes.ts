import { RequestHandler, Router } from "express";
import { createDoctor, deleteDoctor, getDoctorById, getDoctors, updateDoctor } from "../controllers/admin/doctor-controller";
import { createRoom, deleteRoom, getRoomById, getRooms, updateRoom } from "../controllers/admin/room-controller";
import { createDoctorSchedule,getDoctorSchedules,getDoctorScheduleById, deleteDoctorSchedule, updateDoctorSchedule } from "../controllers/admin/doctor-schedule-controller";
import { deletePatient, getAllPatients, getPatientById } from "../controllers/admin/patient-controller";

export const AdminRoutes: Router = Router();


// Patient Routes
AdminRoutes.get("/patient", getAllPatients as RequestHandler);
AdminRoutes.get("/patient/:id", getPatientById as RequestHandler);
AdminRoutes.delete("/patient/:id", deletePatient as RequestHandler);

// Doctor Routes
AdminRoutes.post("/doctor", createDoctor as RequestHandler);
AdminRoutes.get("/doctor", getDoctors as RequestHandler);
AdminRoutes.put("/doctor/:id", updateDoctor as RequestHandler);
AdminRoutes.get("/doctor/:id", getDoctorById as RequestHandler);
AdminRoutes.delete("/doctor/:id", deleteDoctor as RequestHandler);

// Room Routes
AdminRoutes.post("/room", createRoom as RequestHandler);
AdminRoutes.get("/room", getRooms as RequestHandler);
AdminRoutes.get("/room/:id", getRoomById as RequestHandler);
AdminRoutes.put("/room/:id", updateRoom as RequestHandler);
AdminRoutes.delete("/room/:id", deleteRoom as RequestHandler);

// Doctor Schedule Routes
AdminRoutes.post("/doctor-schedule", createDoctorSchedule as RequestHandler);
AdminRoutes.get("/doctor-schedule", getDoctorSchedules as RequestHandler);
AdminRoutes.get("/doctor-schedule/:id", getDoctorScheduleById as RequestHandler);
AdminRoutes.delete("/doctor-schedule/:id", deleteDoctorSchedule as RequestHandler);
AdminRoutes.put("/doctor-schedule/:id", updateDoctorSchedule as RequestHandler);
