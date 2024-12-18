"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePaymentNumber = void 0;
exports.generateMedicalRecordNumber = generateMedicalRecordNumber;
exports.generateRegistrationId = generateRegistrationId;
exports.generateRoomCode = generateRoomCode;
exports.generateDailyQueueNumber = generateDailyQueueNumber;
exports.generateMedicineCode = generateMedicineCode;
exports.generatePrescriptionNumber = generatePrescriptionNumber;
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const prisma = new client_1.PrismaClient();
async function generateMedicalRecordNumber() {
    try {
        const lastPatient = await prisma.patient.findFirst({
            orderBy: {
                medicalRecordNumber: "desc",
            },
            select: {
                medicalRecordNumber: true,
            },
        });
        let nextNumber = 1;
        if (lastPatient && lastPatient.medicalRecordNumber) {
            const lastNumber = parseInt(lastPatient.medicalRecordNumber.slice(2));
            nextNumber = lastNumber + 1;
        }
        const medicalRecordNumber = `RM${nextNumber.toString().padStart(6, "0")}`;
        return medicalRecordNumber;
    }
    catch (error) {
        console.error("Kesalahan saat membuat nomor rekam medis:", error);
        throw new Error("Gagal membuat nomor rekam medis");
    }
}
async function generateRegistrationId() {
    try {
        const lastRegistration = await prisma.patientRegistration.findFirst({
            orderBy: {
                registrationNumber: "desc",
            },
            select: {
                registrationNumber: true,
            },
        });
        let nextNumber = 1;
        if (lastRegistration && lastRegistration.registrationNumber) {
            const lastNumber = parseInt(lastRegistration.registrationNumber.slice(3));
            nextNumber = lastNumber + 1;
        }
        const registrationId = `REG${nextNumber.toString().padStart(6, "0")}`;
        return registrationId;
    }
    catch (error) {
        console.error("Kesalahan saat membuat ID pendaftaran:", error);
        throw new Error("Gagal membuat ID pendaftaran");
    }
}
async function generateRoomCode(installation) {
    try {
        const prefix = getInstallationPrefix(installation);
        const lastRoom = await prisma.room.findFirst({
            where: {
                installation: installation,
                identifier: {
                    startsWith: prefix,
                },
            },
            orderBy: {
                identifier: 'desc',
            },
            select: {
                identifier: true,
            },
        });
        let nextNumber = 1;
        if (lastRoom && lastRoom.identifier) {
            const lastNumber = parseInt(lastRoom.identifier.split('-')[1]);
            nextNumber = lastNumber + 1;
        }
        const roomCode = `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
        return roomCode;
    }
    catch (error) {
        console.error("Kesalahan saat membuat kode ruangan:", error);
        throw new Error("Gagal membuat kode ruangan");
    }
}
async function generateDailyQueueNumber(doctorId) {
    try {
        const today = (0, date_fns_1.startOfDay)(new Date());
        const todayEnd = (0, date_fns_1.endOfDay)(today);
        const queueNumber = await prisma.patientRegistration.count({
            where: {
                registrationDate: {
                    gte: today,
                    lte: todayEnd,
                },
                doctorId: doctorId,
            },
        }) + 1;
        return queueNumber;
    }
    catch (error) {
        console.error("Kesalahan saat membuat nomor antrian harian:", error);
        throw new Error("Gagal membuat nomor antrian harian");
    }
}
async function generateMedicineCode() {
    const lastMedicine = await prisma.medicine.findFirst({
        orderBy: {
            code: "desc",
        },
    });
    let nextNumber = 1;
    if (lastMedicine && lastMedicine.code) {
        const lastNumber = parseInt(lastMedicine.code.slice(2));
        nextNumber = lastNumber + 1;
    }
    const medicineCode = `OB${nextNumber.toString().padStart(6, '0')}`;
    return medicineCode;
}
async function generatePrescriptionNumber() {
    try {
        const date = new Date();
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const timestamp = date.getTime().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const prescriptionNumber = `RX-${year}${month}${day}-${timestamp}${random}`;
        // Verifikasi keunikan
        const exists = await prisma.prescriptions.findUnique({
            where: { prescriptionNumber },
        });
        if (exists) {
            // Jika masih ada duplikasi, generate ulang
            return generatePrescriptionNumber();
        }
        return prescriptionNumber;
    }
    catch (error) {
        console.error("Kesalahan saat membuat nomor resep:", error);
        throw new Error("Gagal membuat nomor resep");
    }
}
const generatePaymentNumber = async () => {
    const today = new Date();
    const year = today.getFullYear().toString();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    // Format: PMT/YYYYMMDD/XXXX
    const prefix = 'PMT';
    const dateString = `${year}${month}${day}`;
    // Cari nomor payment terakhir untuk hari ini
    const lastPayment = await prisma.payment.findFirst({
        where: {
            paymentNumber: {
                startsWith: `${prefix}/${dateString}/`
            }
        },
        orderBy: {
            paymentNumber: 'desc'
        }
    });
    let sequence = 1;
    if (lastPayment) {
        // Ambil nomor urut terakhir dan tambah 1
        const lastSequence = parseInt(lastPayment.paymentNumber.split('/').pop() || '0');
        sequence = lastSequence + 1;
    }
    // Format nomor urut dengan padding 4 digit
    const sequenceString = sequence.toString().padStart(4, '0');
    return `${prefix}/${dateString}/${sequenceString}`;
};
exports.generatePaymentNumber = generatePaymentNumber;
function getInstallationPrefix(installation) {
    switch (installation) {
        case 'rawat_jalan':
            return 'RJ';
        case 'rawat_inap':
            return 'RI';
        case 'gawat_darurat':
            return 'IGD';
        case 'bedah_sentral':
            return 'BS';
        case 'laboratorium':
            return 'LAB';
        case 'radiologi':
            return 'RAD';
        case 'farmasi':
            return 'FAR';
        case 'rehabilitasi_medik':
            return 'RHB';
        case 'hemodialisis':
            return 'HD';
        case 'icu':
            return 'ICU';
        case 'nicu':
            return 'NICU';
        case 'picu':
            return 'PICU';
        default:
            return 'OTH';
    }
}
