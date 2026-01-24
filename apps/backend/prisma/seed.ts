import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany({});

  const users = [
    { name: "John Doe", email: "john@x.com", role: Role.admin, active: true },
    { name: "Jane Smith", email: "jane@x.com", role: Role.viewer, active: false },
    { name: "Aisha Rahman", email: "aisha@x.com", role: Role.editor, active: true },
    { name: "Tanvir Hasan", email: "tanvir@x.com", role: Role.viewer, active: true },
    { name: "Michael Chen", email: "michael@x.com", role: Role.admin, active: true },
    { name: "Sarah Johnson", email: "sarah@x.com", role: Role.editor, active: true },
    { name: "David Kim", email: "david@x.com", role: Role.viewer, active: false },
    { name: "Emily Davis", email: "emily@x.com", role: Role.editor, active: true },
    { name: "Robert Wilson", email: "robert@x.com", role: Role.viewer, active: true },
    { name: "Lisa Anderson", email: "lisa@x.com", role: Role.admin, active: false },
    { name: "James Taylor", email: "james@x.com", role: Role.editor, active: true },
    { name: "Maria Garcia", email: "maria@x.com", role: Role.viewer, active: true },
    { name: "William Brown", email: "william@x.com", role: Role.admin, active: true },
    { name: "Jennifer Martinez", email: "jennifer@x.com", role: Role.editor, active: false },
    { name: "Christopher Lee", email: "chris@x.com", role: Role.viewer, active: true },
    { name: "Amanda White", email: "amanda@x.com", role: Role.editor, active: true },
    { name: "Daniel Harris", email: "daniel@x.com", role: Role.viewer, active: false },
    { name: "Michelle Clark", email: "michelle@x.com", role: Role.admin, active: true },
    { name: "Kevin Lewis", email: "kevin@x.com", role: Role.editor, active: true },
    { name: "Stephanie Walker", email: "stephanie@x.com", role: Role.viewer, active: true },
    { name: "Brian Hall", email: "brian@x.com", role: Role.admin, active: false },
    { name: "Nicole Young", email: "nicole@x.com", role: Role.editor, active: true },
    { name: "Jason Allen", email: "jason@x.com", role: Role.viewer, active: true },
    { name: "Rebecca King", email: "rebecca@x.com", role: Role.admin, active: true },
    { name: "Ryan Scott", email: "ryan@x.com", role: Role.viewer, active: false }
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
