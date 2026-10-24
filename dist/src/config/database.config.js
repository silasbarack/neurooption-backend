"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = void 0;
const databaseConfig = () => ({
    database: {
        url: process.env.DATABASE_URL,
    },
});
exports.databaseConfig = databaseConfig;
//# sourceMappingURL=database.config.js.map