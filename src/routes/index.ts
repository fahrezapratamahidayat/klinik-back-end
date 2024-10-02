import { Application, Router } from "express";
import { PatientRoutes } from "./patient-routes";
import { MainRouter } from "./main-route";

const _routes: Array<[string, Router]> = [
    ['/', MainRouter],
    ['/api/patient', PatientRoutes]
]

export const routes = (app: Application) => {
    _routes.forEach((route) => {
        const [url, router] = route
        app.use(url, router)
    })
}
