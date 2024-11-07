import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";

const prismaClient = new PrismaClient();

export default async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const users = await prismaClient.user.findFirst({
      where: {
        email: email,
      },
    });

    // Check if user exists
    if (!users) {
      return res.status(401).json({
        status: false,
        statusCode: 401,
        message: "email tidak ditemukan",
      });
    }

    // check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, users.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: false,
        statusCode: 401,
        message: "password tidak sesuai",
      });
    }

    // format data yang dibutuhkan
    const data = {
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    };

    res.status(201).json({
      status: true,
      statusCode: 201,
      message: "login berhasil",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: "internal server error",
      data: null,
    });
  }
}
