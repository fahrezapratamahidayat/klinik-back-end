import { Application, Router } from "express";
import { LocationRoutes } from "./location-routes";
import { MainRouter } from "./main-route";
import { AdminRoutes } from "./admin-routes";
import { PendaftaranRoutes } from "./pendaftaran-routes";
import { PerawatRoutes } from "./perawat-routes";
import { AuthRoutes } from "./auth-routes";
import { FarmasiRoutes } from "./farmasi-routes";
import { doctorRoutes } from "./doctor-routes";
import { KasirRoutes } from "./kasir-routes";

const _routes: Array<[string, Router]> = [
    ['/', MainRouter],
    ['/api/pendaftaran', PendaftaranRoutes],
    ['/api/perawat', PerawatRoutes],
    ['/api/admin', AdminRoutes],
    ['/api/locations', LocationRoutes],
    ['/api/auth', AuthRoutes],
    ['/api/farmasi', FarmasiRoutes],
    ['/api/dokter', doctorRoutes],
    ['/api/kasir', KasirRoutes]
]

export const routes = (app: Application) => {
    _routes.forEach((route) => {
        const [url, router] = route
        app.use(url, router)
    })
}
