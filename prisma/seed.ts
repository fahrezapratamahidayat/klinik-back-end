import { PrismaClient } from "@prisma/client";

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

  for (const method of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { name: method.name },
      update: {},
      create: method,
    });
  }

  console.log("Seeder PaymentMethod berhasil dijalankan");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
