"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConfig = void 0;
const jwtConfig = () => ({
    jwt: {
        secret: process.env.JWT_SECRET || 'change-this-secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
        adminExpiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '12h',
    },
});
exports.jwtConfig = jwtConfig;
//# sourceMappingURL=jwt.config.js.map