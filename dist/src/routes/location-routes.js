"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationRoutes = void 0;
const express_1 = require("express");
const location_controller_1 = require("../controllers/location-controller");
exports.LocationRoutes = (0, express_1.Router)();
exports.LocationRoutes.get('/provinces', location_controller_1.getProvince);
exports.LocationRoutes.get('/districts/:provinceId', location_controller_1.getDistrict);
exports.LocationRoutes.get('/subdistricts/:districtId', location_controller_1.getSubdistrict);
exports.LocationRoutes.get('/villages/:subdistrictId', location_controller_1.getVillage);