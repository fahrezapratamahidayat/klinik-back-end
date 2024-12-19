import { Router } from "express";

export const MainRouter: Router = Router();

MainRouter.get('/', (req, res) => {
    res.send("Welcome to Klinik API")
});

