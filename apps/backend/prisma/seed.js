"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    await prisma.user.deleteMany({});
    const users = [
        { name: "John Doe", email: "john@x.com", role: client_1.Role.admin, active: true },
        { name: "Jane Smith", email: "jane@x.com", role: client_1.Role.viewer, active: false },
        { name: "Aisha Rahman", email: "aisha@x.com", role: client_1.Role.editor, active: true },
        { name: "Tanvir Hasan", email: "tanvir@x.com", role: client_1.Role.viewer, active: true },
        { name: "Michael Chen", email: "michael@x.com", role: client_1.Role.admin, active: true },
        { name: "Sarah Johnson", email: "sarah@x.com", role: client_1.Role.editor, active: true },
        { name: "David Kim", email: "david@x.com", role: client_1.Role.viewer, active: false },
        { name: "Emily Davis", email: "emily@x.com", role: client_1.Role.editor, active: true },
        { name: "Robert Wilson", email: "robert@x.com", role: client_1.Role.viewer, active: true },
        { name: "Lisa Anderson", email: "lisa@x.com", role: client_1.Role.admin, active: false },
        { name: "James Taylor", email: "james@x.com", role: client_1.Role.editor, active: true },
        { name: "Maria Garcia", email: "maria@x.com", role: client_1.Role.viewer, active: true },
        { name: "William Brown", email: "william@x.com", role: client_1.Role.admin, active: true },
        { name: "Jennifer Martinez", email: "jennifer@x.com", role: client_1.Role.editor, active: false },
        { name: "Christopher Lee", email: "chris@x.com", role: client_1.Role.viewer, active: true },
        { name: "Amanda White", email: "amanda@x.com", role: client_1.Role.editor, active: true },
        { name: "Daniel Harris", email: "daniel@x.com", role: client_1.Role.viewer, active: false },
        { name: "Michelle Clark", email: "michelle@x.com", role: client_1.Role.admin, active: true },
        { name: "Kevin Lewis", email: "kevin@x.com", role: client_1.Role.editor, active: true },
        { name: "Stephanie Walker", email: "stephanie@x.com", role: client_1.Role.viewer, active: true },
        { name: "Brian Hall", email: "brian@x.com", role: client_1.Role.admin, active: false },
        { name: "Nicole Young", email: "nicole@x.com", role: client_1.Role.editor, active: true },
        { name: "Jason Allen", email: "jason@x.com", role: client_1.Role.viewer, active: true },
        { name: "Rebecca King", email: "rebecca@x.com", role: client_1.Role.admin, active: true },
        { name: "Ryan Scott", email: "ryan@x.com", role: client_1.Role.viewer, active: false }
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
//# sourceMappingURL=seed.js.map