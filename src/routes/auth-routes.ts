import { Router, RequestHandler } from "express";
import login from "../controllers/auth-controller";

export const AuthRoutes = Router();

AuthRoutes.post("/login", login as RequestHandler);
    