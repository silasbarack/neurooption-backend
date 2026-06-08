"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
exports.env = {
    PORT: Number(process.env.PORT || 4000),
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
    PLATFORM_BASE_CURRENCY: process.env.PLATFORM_BASE_CURRENCY || 'KES',
};
//# sourceMappingURL=env.js.map