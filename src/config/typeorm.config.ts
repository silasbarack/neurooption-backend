import 'reflect-metadata';
import 'dotenv/config';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { User } from '../modules/users/user.entity';
import { Trade } from '../modules/trading/trade.entity';
import { Payment } from '../modules/payments/payment.entity';
import { Signal } from '../modules/signals/signal.entity';
import { AuditLog } from '../modules/audit/audit.entity';

// Used by the TypeORM CLI (npm run migration:generate / migration:run).
// Keep `entities` in sync with the entities registered via TypeOrmModule.forFeature().
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'neurooption',
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_NAME || 'neurooption',
  entities: [User, Trade, Payment, Signal, AuditLog],
  migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
});
