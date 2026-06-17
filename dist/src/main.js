"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const allowedOrigins = [
        process.env.FRONTEND_URL,
        "https://neurooption-frontend.onrender.com",
        "https://neurooption.com",
        "https://www.neurooption.com",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ].filter(Boolean);
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }
            callback(new Error(`CORS blocked origin: ${origin}`), false);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
    }));
    const port = Number(process.env.PORT) || 10000;
    await app.listen(port, "0.0.0.0");
    console.log(`NeuroOption backend is running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map