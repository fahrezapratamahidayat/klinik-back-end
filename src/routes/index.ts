import { Application, Router, RequestHandler } from "express";
import { LocationRoutes } from "./location-routes";
import { MainRouter } from "./main-route";
import { AdminRoutes } from "./admin-routes";
import { PendaftaranRoutes } from "./pendaftaran-routes";
import { PerawatRoutes } from "./perawat-routes";
import { AuthRoutes } from "./auth-routes";
import { FarmasiRoutes } from "./farmasi-routes";
import { doctorRoutes } from "./doctor-routes";
import { KasirRoutes } from "./kasir-routes";
import { authenticate, authorizeRoles } from "../middleware/auth-middleware";

const _routes: Array<[string, RequestHandler | Router, ...RequestHandler[]]> = [
  ["/", MainRouter],
  ["/api/pendaftaran", authenticate as RequestHandler, authorizeRoles("Pendaftaran") as RequestHandler, PendaftaranRoutes],
  ["/api/perawat", authenticate as RequestHandler, authorizeRoles("Perawat") as RequestHandler, PerawatRoutes],
  ["/api/admin", authenticate as RequestHandler, authorizeRoles("Admin") as RequestHandler, AdminRoutes],
  ["/api/locations", LocationRoutes],
  ["/api/auth", AuthRoutes],
  ["/api/farmasi", authenticate as RequestHandler, authorizeRoles("Farmasi") as RequestHandler, FarmasiRoutes],
  ["/api/dokter", authenticate as RequestHandler, authorizeRoles("Dokter") as RequestHandler, doctorRoutes],
  ["/api/kasir", authenticate as RequestHandler, authorizeRoles("Kasir") as RequestHandler, KasirRoutes],
];

// const _routes: Array<[string, RequestHandler | Router, ...RequestHandler[]]> = [
//   ["/", MainRouter],
//   ["/api/pendaftaran", PendaftaranRoutes],
//   ["/api/perawat", PerawatRoutes],
//   ["/api/admin", AdminRoutes],
//   ["/api/locations", LocationRoutes],
//   ["/api/auth", AuthRoutes],
//   ["/api/farmasi", FarmasiRoutes],
//   ["/api/dokter", doctorRoutes],
//   ["/api/kasir", KasirRoutes],
// ];

export const routes = (app: Application) => {
  _routes.forEach((route) => {
    const [url, ...middlewares] = route;
    const router = middlewares.pop();
    app.use(url, ...middlewares, router as Router);
  });
};