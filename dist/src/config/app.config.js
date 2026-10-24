"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
const appConfig = () => ({
    app: {
        name: process.env.APP_NAME || 'NeuroOption',
        env: process.env.NODE_ENV || 'development',
        port: parseInt(process.env.PORT || '3000', 10),
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    },
});
exports.appConfig = appConfig;
//# sourceMappingURL=app.config.js.map