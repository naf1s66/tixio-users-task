import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.count();
  if (existing > 0) return;

  const users = [
    { name: "John Doe", email: "john@x.com", role: Role.admin, active: true },
    { name: "Jane Smith", email: "jane@x.com", role: Role.viewer, active: false },
    { name: "Aisha Rahman", email: "aisha@x.com", role: Role.editor, active: true },
    { name: "Tanvir Hasan", email: "tanvir@x.com", role: Role.viewer, active: true }
  ];

  await prisma.user.createMany({ data: users });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
