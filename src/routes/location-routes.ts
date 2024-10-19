import { RequestHandler, Router } from "express";
import { getProvince, getDistrict, getSubdistrict, getVillage } from "../controllers/location-controller";

export const LocationRoutes: Router = Router();

LocationRoutes.get('/provinces', getProvince as RequestHandler);
LocationRoutes.get('/districts/:provinceId', getDistrict as RequestHandler);
LocationRoutes.get('/subdistricts/:districtId', getSubdistrict as RequestHandler);
LocationRoutes.get('/villages/:subdistrictId', getVillage as RequestHandler);  
