import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { loginValidation } from '../validations/auth-validation';

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginValidation.parse(req.body);
    if(!email || !password) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Email atau password tidak boleh kosong"
      });
    }

    // Cari user berdasarkan username
    const user = await prisma.account.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        status: false,
        statusCode: 401,
        message: 'Email atau password salah' 
      });
    }

    // Validasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        status: false,
        statusCode: 401,
        message: 'Password salah' 
      });
    }

    // Cek apakah user aktif
    if (!user.isActive) {
      return res.status(401).json({
        status: false,
        statusCode: 401,
        message: 'Akun tidak aktif' 
      });
    }

    // Update last login
    await prisma.account.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate token
    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: '7d' }
    );

    // Update refresh token di database
    await prisma.account.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    res.json({
      status: true,
      statusCode: 200,
      message: 'Login berhasil',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role?.toLowerCase(),
          accessToken: token,
          refreshToken,
        }
      }
    });
  } catch (error: any) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Refresh token tidak boleh kosong"
      });
    }

    // Cari user berdasarkan refresh token
    const user = await prisma.account.findFirst({
      where: { refreshToken }
    });

    if (!user) {
      return res.status(401).json({
        status: false,
        statusCode: 401,
        message: 'Refresh token tidak valid'
      });
    }

    // Verifikasi refresh token
    try {
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);
    } catch (error) {
      return res.status(401).json({
        status: false,
        statusCode: 401,
        message: 'Refresh token expired'
      });
    }

    // Generate token baru
    const newAccessToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    // Generate refresh token baru
    const newRefreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: '7d' }
    );

    // Update refresh token di database
    await prisma.account.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken }
    });

    res.json({
      status: true,
      statusCode: 200,
      message: 'Refresh token berhasil',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error: any) {
    next(error);
  }
};