import {
  AccountType,
  IdentifierType,
  DoctorStatus,
  Gender,
  PrismaClient,
  UserRole,
  CitizenshipStatus,
  RelationshipType,
} from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

async function main() {
  const paymentMethods = [
    {
      name: "Tunai",
      description: "Pembayaran langsung dengan uang tunai",
      isActive: true,
    },
    {
      name: "Kartu Debit",
      description: "Pembayaran menggunakan kartu debit",
      isActive: true,
    },
    {
      name: "Kartu Kredit",
      description: "Pembayaran menggunakan kartu kredit",
      isActive: true,
    },
    {
      name: "Transfer Bank",
      description: "Pembayaran melalui transfer bank",
      isActive: true,
    },
    {
      name: "BPJS",
      description: "Pembayaran menggunakan asuransi BPJS",
      isActive: true,
    },
    {
      name: "Asuransi Swasta",
      description: "Pembayaran menggunakan asuransi swasta",
      isActive: true,
    },
  ];

  const serviceClasses = [
    {
      name: "Kelas 1",
      description: "Kelas 1",
      price: 100000,
    },
    {
      name: "Kelas 2",
      description: "Kelas 2",
      price: 200000,
    },
    {
      name: "Kelas 3",
      description: "Kelas 3",
      price: 300000,
    },
    {
      name: "Kelas 4",
      description: "Kelas 4",
      price: 400000,
    },
  ];

  for (const serviceClass of serviceClasses) {
    await prisma.serviceClass.upsert({
      where: { name: serviceClass.name },
      update: {},
      create: serviceClass,
    });
  }

  const defaultPassword = "password123"; // password default untuk semua user
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const staffData = [
    {
      account: {
        username: "admin",
        email: "admin@klinik.com",
        password: hashedPassword,
        type: "STAFF" as AccountType,
        role: "Admin" as UserRole,
        isActive: true,
      },
      staff: {
        name: "Administrator",
        nip: "ADM001",
        position: "Admin" as UserRole,
      },
    },
    {
      account: {
        username: "pendaftaran",
        email: "pendaftaran@klinik.com",
        password: hashedPassword,
        type: "STAFF" as AccountType,
        role: "Pendaftaran" as UserRole,
        isActive: true,
      },
      staff: {
        name: "Petugas Pendaftaran",
        nip: "REG001",
        position: "Pendaftaran" as UserRole,
      },
    },
    {
      account: {
        username: "perawat",
        email: "perawat@klinik.com",
        password: hashedPassword,
        type: "STAFF" as AccountType,
        role: "Perawat" as UserRole,
        isActive: true,
      },
      staff: {
        name: "Perawat Utama",
        nip: "NRS001",
        position: "Perawat" as UserRole,
      },
    },
    {
      account: {
        username: "farmasi",
        email: "farmasi@klinik.com",
        password: hashedPassword,
        type: "STAFF" as AccountType,
        role: "Farmasi" as UserRole,
        isActive: true,
      },
      staff: {
        name: "Apoteker",
        nip: "PHR001",
        position: "Farmasi" as UserRole,
      },
    },
    {
      account: {
        username: "kasir",
        email: "kasir@klinik.com",
        password: hashedPassword,
        type: "STAFF" as AccountType,
        role: "Kasir" as UserRole,
        isActive: true,
      },
      staff: {
        name: "Kasir",
        nip: "CSH001",
        position: "Kasir" as UserRole,
      },
    },
  ];

  // Seed untuk dokter contoh
  const doctorData = {
    account: {
      username: "dokter",
      email: "dokter@klinik.com",
      password: hashedPassword,
      type: "DOCTOR" as AccountType,
      role: "Dokter" as UserRole,
      isActive: true,
    },
    doctor: {
      name: "Dr. John Doe",
      nip: "DOC001",
      nik: "1234567890123456",
      sip: "SIP001",
      str: "STR001",
      specialization: "Dokter Umum",
      consultationFee: 100000,
      gender: "male" as Gender,
      birthDate: new Date("1980-01-01"),
      birthPlace: "Jakarta",
      status: "aktif" as DoctorStatus,
    },
  };

  // Seed untuk pasien contoh
  const patientData = {
    patient: {
      medicalRecordNumber: "MRN001",
      name: "John Patient",
      birthDate: new Date("1990-01-01"),
      birthPlace: "Jakarta",
      gender: "male" as Gender,
      nomorKartuKeluarga: "1234567890123456",
      multipleBirthInteger: 1,
      identifierType: "nik" as IdentifierType,
      identifier: "1234567890123456",
      citizenshipStatus: "wni" as CitizenshipStatus,
      responsiblePersonName: "Jane Doe",
      responsiblePersonRelation: "orang_tua" as RelationshipType,
      responsiblePersonPhone: "08123456789",
      isResponsiblePersonSelf: false,
    },
  };

  // Membuat staff dan akun mereka
  for (const data of staffData) {
    const account = await prisma.account.upsert({
      where: { email: data.account.email },
      update: {},
      create: data.account,
    });

    await prisma.staff.upsert({
      where: { nip: data.staff.nip },
      update: {},
      create: {
        ...data.staff,
        accountId: account.id,
      },
    });
  }

  // Membuat dokter dan akunnya
  const doctorAccount = await prisma.account.upsert({
    where: { email: doctorData.account.email },
    update: {},
    create: doctorData.account,
  });

  // Membuat alamat untuk dokter
  const doctorAddress = await prisma.address.create({
    data: {
      use: "home",
      line: "Jl. Dokter No. 1",
      city: "Jakarta",
      postalCode: "12345",
      extension: {
        create: {
          provinceCode: "32",
          districtCode: "3205",
          subdistrictCode: "3205211",
          villageCode: "3205211007",
          rt: "001",
          rw: "002",
        },
      },
    },
  });

  await prisma.doctor.upsert({
    where: { nip: doctorData.doctor.nip },
    update: {},
    create: {
      ...doctorData.doctor,
      accountId: doctorAccount.id,
      addressId: doctorAddress.id,
    },
  });

  // Membuat alamat untuk pasien
  const patientAddress = await prisma.address.create({
    data: {
      use: "home",
      line: "Jl. Pasien No. 1",
      city: "Jakarta",
      postalCode: "12345",
      extension: {
        create: {
          provinceCode: "32",
          districtCode: "3205",
          subdistrictCode: "3205211",
          villageCode: "3205211007",
          rt: "001",
          rw: "002",
        },
      },
    },
  });

  await prisma.patient.upsert({
    where: { medicalRecordNumber: patientData.patient.medicalRecordNumber },
    update: {},
    create: {
      ...patientData.patient,
      address: {
        connect: { id: patientAddress.id },
      },
    },
  });

  // Membuat staff dan akun mereka
  for (const data of staffData) {
    const account = await prisma.account.upsert({
      where: { email: data.account.email },
      update: {},
      create: data.account,
    });

    await prisma.staff.upsert({
      where: { nip: data.staff.nip },
      update: {},
      create: {
        ...data.staff,
        account: {
          connect: { id: account.id },
        },
      },
    });
  }

  console.log("Seeder berhasil dijalankan");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
