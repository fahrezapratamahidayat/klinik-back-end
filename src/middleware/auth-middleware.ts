import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ 
        status: false,
        statusCode: 401,
        message: "Autentikasi tidak ditemukan"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    const user = await prisma.account.findUnique({
      where: { id: (decoded as any).id }
    });

    if (!user) {
      return res.status(401).json({ 
        status: false,
        statusCode: 401,
        message: "User tidak ditemukan" 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ 
      status: false,
      statusCode: 401,
      message: "Token tidak valid" 
    });
  }
};

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        status: false,
        statusCode: 403,
        message: "Anda tidak memiliki akses ke resource ini" 
      });
    }
    next();
  };
};