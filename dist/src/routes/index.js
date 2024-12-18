"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const location_routes_1 = require("./location-routes");
const main_route_1 = require("./main-route");
const admin_routes_1 = require("./admin-routes");
const pendaftaran_routes_1 = require("./pendaftaran-routes");
const perawat_routes_1 = require("./perawat-routes");
const auth_routes_1 = require("./auth-routes");
const farmasi_routes_1 = require("./farmasi-routes");
const doctor_routes_1 = require("./doctor-routes");
const kasir_routes_1 = require("./kasir-routes");
const auth_middleware_1 = require("../middleware/auth-middleware");
const _routes = [
    ["/", main_route_1.MainRouter],
    ["/api/pendaftaran", auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRoles)("Pendaftaran"), pendaftaran_routes_1.PendaftaranRoutes],
    ["/api/perawat", auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRoles)("Perawat"), perawat_routes_1.PerawatRoutes],
    ["/api/admin", auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRoles)("Admin"), admin_routes_1.AdminRoutes],
    ["/api/locations", location_routes_1.LocationRoutes],
    ["/api/auth", auth_routes_1.AuthRoutes],
    ["/api/farmasi", auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRoles)("Farmasi"), farmasi_routes_1.FarmasiRoutes],
    ["/api/dokter", auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRoles)("Dokter"), doctor_routes_1.doctorRoutes],
    ["/api/kasir", auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRoles)("Kasir"), kasir_routes_1.KasirRoutes],
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
const routes = (app) => {
    _routes.forEach((route) => {
        const [url, ...middlewares] = route;
        const router = middlewares.pop();
        app.use(url, ...middlewares, router);
    });
};
exports.routes = routes;
