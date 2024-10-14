import { Router } from "express";
import { getProvince } from "../controllers/location-controller";

export const LocationRoutes: Router = Router();

LocationRoutes.get("/province", getProvince);
