"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
describe('password reset cleanup (placeholder)', () => {
    it('connects to prisma and can query PasswordResetToken', async () => {
        const prisma = new client_1.PrismaClient();
        try {
            const count = await prisma.passwordResetToken.count();
            expect(typeof count).toBe('number');
        }
        finally {
            await prisma.$disconnect();
        }
    });
});
//# sourceMappingURL=auth.reset.spec.js.map