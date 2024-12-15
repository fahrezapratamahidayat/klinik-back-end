import { NextFunction, Request, Response } from "express";
import { endOfDay, parseISO, startOfDay } from "date-fns";
import prisma from "../lib/prisma";
import { PaymentStatus, RegistrationStatus } from "@prisma/client";

class ReportController {
  async getPatientVisitReport(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        from,
        to,
        all,
        page = 1,
        limit = 10,
      } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      let startDate: Date;
      let endDate: Date;

      if (from) {
        startDate = startOfDay(parseISO(from as string));
        endDate = to ? endOfDay(parseISO(to as string)) : endOfDay(startDate);
      } else if (all) {
        startDate = startOfDay(new Date(2024, 0, 1));
        endDate = endOfDay(new Date());
      } else {
        // Jika tidak ada parameter tanggal, gunakan hari ini
        startDate = startOfDay(new Date());
        endDate = endOfDay(new Date());
      }

      const totalData = await prisma.patientRegistration.count({
        where: {
          registrationDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const totalPages = Math.ceil(totalData / Number(limit));

      const visits = await prisma.patientRegistration.findMany({
        where: {
          registrationDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          id: true,
          registrationNumber: true,
          registrationType: true,
          registrationDate: true,
          status: true,
          patient: {
            select: {
              name: true,
              gender: true,
              address: {
                select: {
                  city: true,
                },
              },
            },
          },
          doctor: {
            select: {
              name: true,
              specialization: true,
            },
          },
          room: {
            select: {
              name: true,
              installation: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: Number(limit),
        orderBy: {
          registrationDate: "asc",
        },
      });

      if (visits.length === 0) {
        return res.status(404).json({
          status: false,
          statusCode: 404,
          message: "data tidak ditemukan",
          data: [],
          pagination: {
            totalItems: totalData,
            totalPages,
            page: Number(page),
            limit: Number(limit),
          },
        });
      }

      const summary = {
        totalVisit: visits.length,
        byRegistrationType: {
          offline: visits.filter((v) => v.registrationType === "offline")
            .length,
          online: visits.filter((v) => v.registrationType === "online").length,
        },
        byStatus: {
          draft: visits.filter((v) => v.status === "draft").length,
          dalam_antrian: visits.filter((v) => v.status === "dalam_antrian")
            .length,
          selesai: visits.filter((v) => v.status === "selesai").length,
          cancel: visits.filter((v) => v.status === "cancel").length,
        },
      };
      res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Success",
        data: {
          date: {
            from: startDate,
            to: endDate,
          },
          summary,
          visits,
        },
        pagination: {
          totalItems: totalData,
          totalPages,
          page: Number(page),
          limit: Number(limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getIncomeReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { from, to, all, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      let startDate: Date;
      let endDate: Date;

      if (from) {
        startDate = startOfDay(parseISO(from as string));
        endDate = to ? endOfDay(parseISO(to as string)) : endOfDay(startDate);
      } else if (all) {
        startDate = startOfDay(new Date(2024, 0, 1));
        endDate = endOfDay(new Date());
      } else {
        startDate = startOfDay(new Date());
        endDate = endOfDay(new Date());
      }

      const totalData = await prisma.payment.count({
        where: {
          paidAt: {
            gte: startDate,
            lte: endDate,
          },
          paymentStatus: PaymentStatus.paid,
        },
      });

      const getIncome = await prisma.payment.findMany({
        where: {
          paidAt: {
            gte: startDate,
            lte: endDate,
          },
          paymentStatus: PaymentStatus.paid,
        },
        include: {
          encounter: {
            include: {
              patientRegistration: {
                include: {
                  patient: {
                    select: {
                      name: true,
                      medicalRecordNumber: true,
                    },
                  },
                },
              },
            },
          },
        },
        skip,
        take: Number(limit),
        orderBy: {
          createdAt: "desc",
        },
      });

      const transformedIncome = getIncome.map((payment) => ({
        id: payment.id,
        paymentNumber: payment.paymentNumber,
        paymentStatus: payment.paymentStatus,
        paymentUrl: payment.paymentUrl,
        patientName: payment.encounter.patientRegistration.patient.name,
        medicalRecordNumber:
          payment.encounter.patientRegistration.patient.medicalRecordNumber,
        payerName: payment.firstName + " " + payment.lastName,
        email: payment.email,
        phone: payment.phone,
        totalAmount: payment.totalAmount,
        paidAt: payment.paidAt,
        paidBy: payment.paidBy,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      }));

      const totalIncome = transformedIncome.reduce(
        (sum, payment) => sum + payment.totalAmount,
        0
      );

      const totalPages = Math.ceil(totalData / Number(limit));

      res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Success",
        data: {
          date: {
            from: startDate,
            to: endDate,
          },
          totalIncome,
          payments: transformedIncome,
        },
        pagination: {
          totalItems: totalData,
          totalPages,
          page: Number(page),
          limit: Number(limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactionHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, search, startDate, endDate } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      // Buat filter dasar
      let whereClause: any = {};
      // Tambah filter pencarian jika ada
      if (search) {
        whereClause.OR = [
          {
            encounter: {
              patientRegistration: {
                patient: {
                  name: {
                    contains: search as string,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
          {
            paymentNumber: {
              contains: search as string,
              mode: "insensitive",
            },
          },
        ];
      }
      // Tambah filter tanggal jika ada
      if (startDate && endDate) {
        whereClause.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }
      // Ambil total data
      const totalData = await prisma.payment.count({
        where: whereClause,
      });
      // Ambil data transaksi
      const transactions = await prisma.payment.findMany({
        where: whereClause,
        include: {
          encounter: {
            include: {
              patientRegistration: {
                include: {
                  patient: {
                    select: {
                      name: true,
                      medicalRecordNumber: true,
                    },
                  },
                  doctor: {
                    select: {
                      name: true,
                      specialization: true,
                    },
                  },
                },
              },
            },
          },
          paymentDetail: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: Number(limit),
      });
      const totalPages = Math.ceil(totalData / Number(limit));
      res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Berhasil mengambil riwayat transaksi",
        data: {
          transactions,
          pagination: {
            totalItems: totalData,
            totalPages,
            currentPage: Number(page),
            itemsPerPage: Number(limit),
          },
        },
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export default new ReportController();
