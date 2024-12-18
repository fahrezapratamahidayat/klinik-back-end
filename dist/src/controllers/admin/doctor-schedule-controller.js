"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDoctorSchedule = exports.updateDoctorSchedule = exports.getDoctorScheduleById = exports.getDoctorSchedules = exports.createDoctorSchedule = void 0;
const client_1 = require("@prisma/client");
const doctor_validation_1 = require("../../validations/doctor-validation");
const date_fns_1 = require("date-fns");
const date_fns_2 = require("date-fns");
const prisma = new client_1.PrismaClient();
const createDoctorSchedule = async (req, res, next) => {
    const validationResult = doctor_validation_1.createDoctorScheduleValidation.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({
            status: false,
            statusCode: 400,
            message: "Data tidak valid",
            errors: validationResult.error.errors.map((error) => ({
                path: error.path.join("."),
                message: error.message,
            })),
        });
    }
    const { doctorId, roomId, schedules } = validationResult.data;
    try {
        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorId },
        });
        if (!doctor) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Dokter tidak ditemukan",
            });
        }
        // Validasi ruangan
        const room = await prisma.room.findUnique({
            where: { id: roomId },
        });
        if (!room) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Ruangan tidak ditemukan",
            });
        }
        // Proses setiap jadwal
        const createdSchedules = await Promise.all(schedules.map(async (schedule) => {
            const { date, day, startTime, endTime, offlineQuota, onlineQuota, totalQuota, } = schedule;
            // const today = new Date();
            // today.setHours(0, 0, 0, 0); // Set waktu ke 00:00:00
            // const scheduleDate = new Date(date);
            // scheduleDate.setHours(0, 0, 0, 0); // Set waktu ke 00:00:00
            // console.log("Today:", today.toISOString());
            // console.log("Schedule date:", scheduleDate.toISOString());
            // if (scheduleDate < today) {
            //   return res.status(400).json({ status: false, statusCode: 400, message: "Tanggal harus sama dengan atau melebihi tanggal hari ini" });
            // }
            // // Validasi waktu
            // const [startHour, startMinute] = startTime.split(":").map(Number);
            // const [endHour, endMinute] = endTime.split(":").map(Number);
            // if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
            //   return res.status(400).json({ status: false, statusCode: 400, message: "Waktu mulai harus sebelum waktu selesai" });
            // }
            // Cek jadwal yang sudah ada
            const existingSchedule = await prisma.doctorSchedule.findFirst({
                where: {
                    doctorId,
                    date,
                },
            });
            if (existingSchedule) {
                return res.status(400).json({
                    status: false,
                    statusCode: 400,
                    message: `Jadwal dokter untuk tanggal ${date.toISOString().split("T")[0]} sudah ada`,
                });
            }
            // Buat jadwal dokter
            return prisma.doctorSchedule.create({
                data: {
                    doctorId,
                    roomId,
                    date,
                    day,
                    startTime,
                    endTime,
                    isActive: true,
                    totalQuota,
                    offlineQuota,
                    onlineQuota,
                    remainingOfflineQuota: offlineQuota,
                    remainingOnlineQuota: onlineQuota,
                },
            });
        }));
        res.status(201).json({
            status: true,
            statusCode: 201,
            message: "Jadwal dokter berhasil dibuat",
        });
    }
    catch (error) {
        console.error(error);
        if (error instanceof Error) {
            return res
                .status(400)
                .json({ status: false, statusCode: 400, message: error.message });
        }
        return res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Terjadi kesalahan server internal",
        });
        next(error);
    }
};
exports.createDoctorSchedule = createDoctorSchedule;
const getDoctorSchedules = async (req, res, next) => {
    try {
        const { from, to } = req.query;
        let startDate;
        let endDate;
        if (from) {
            startDate = (0, date_fns_1.startOfDay)((0, date_fns_2.parseISO)(from));
            endDate = to ? (0, date_fns_1.endOfDay)((0, date_fns_2.parseISO)(to)) : (0, date_fns_1.endOfDay)(startDate);
        }
        else {
            // Jika tidak ada parameter tanggal, gunakan hari ini
            startDate = (0, date_fns_1.startOfDay)(new Date());
            endDate = (0, date_fns_1.endOfDay)(new Date());
        }
        const doctorSchedules = await prisma.doctorSchedule.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                id: true,
                date: true,
                day: true,
                startTime: true,
                endTime: true,
                totalQuota: true,
                offlineQuota: true,
                onlineQuota: true,
                remainingOfflineQuota: true,
                remainingOnlineQuota: true,
                isActive: true,
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        specialization: true,
                    },
                },
                room: {
                    select: {
                        id: true,
                        name: true,
                        installation: true,
                        operationalStatus: true,
                    },
                },
            },
        });
        if (doctorSchedules.length === 0) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: `Jadwal dokter tidak ditemukan untuk tanggal ${startDate.toISOString().split("T")[0]} sampai ${endDate.toISOString().split("T")[0]}`,
                data: [],
            });
        }
        return res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Jadwal dokter berhasil diambil",
            data: doctorSchedules,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Terjadi kesalahan server internal",
        });
    }
};
exports.getDoctorSchedules = getDoctorSchedules;
const getDoctorScheduleById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const doctorSchedule = await prisma.doctorSchedule.findUnique({
            where: {
                id,
            },
            include: {
                doctor: true,
                room: true,
            },
        });
        if (!doctorSchedule) {
            return res.status(404).json({ message: "Doctor schedule not found" });
        }
        return res.status(200).json({
            message: "Doctor schedule fetched successfully",
            data: doctorSchedule,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getDoctorScheduleById = getDoctorScheduleById;
const updateDoctorSchedule = async (req, res, next) => {
    try {
    }
    catch (error) { }
};
exports.updateDoctorSchedule = updateDoctorSchedule;
const deleteDoctorSchedule = async (req, res, next) => {
    const { id } = req.params;
    try {
        // check apakah id ada di databases
        const existingSchedule = await prisma.doctorSchedule.findUnique({
            where: { id },
        });
        if (!existingSchedule) {
            res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Doctor schedule not found",
            });
            return;
        }
        await prisma.doctorSchedule.delete({
            where: { id },
        });
        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Doctor schedule deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Internal server error",
        });
        next(error);
    }
};
exports.deleteDoctorSchedule = deleteDoctorSchedule;
