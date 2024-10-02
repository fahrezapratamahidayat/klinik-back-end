import { Router } from "express";

export const MainRouter: Router = Router();

MainRouter.get('/', (req, res) => {
    res.status(200).json({
        message: "Welcome to Klinik API",
        version: "1.0.0",
        author: "Klinik"
    })
});

