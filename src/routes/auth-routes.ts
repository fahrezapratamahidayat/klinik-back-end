import { Router, RequestHandler } from "express";
import { login, refreshToken } from "../controllers/auth-controller";

export const AuthRoutes = Router();

AuthRoutes.post("/login", login as RequestHandler);
AuthRoutes.post("/refresh-token", refreshToken as RequestHandler);

    