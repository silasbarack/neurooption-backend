import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    create(dto: CreateTransactionDto): import("./transactions.service").TransactionRecord;
    findAll(query: TransactionQueryDto): import("./transactions.service").TransactionRecord[];
    findByUser(userId: string): import("./transactions.service").TransactionRecord[];
    findOne(id: string): import("./transactions.service").TransactionRecord;
    updateStatus(id: string, dto: UpdateTransactionStatusDto): import("./transactions.service").TransactionRecord;
    markProcessing(id: string): import("./transactions.service").TransactionRecord;
    markCompleted(id: string): import("./transactions.service").TransactionRecord;
    markFailed(id: string, reason?: string): import("./transactions.service").TransactionRecord;
    markRejected(id: string, reason?: string): import("./transactions.service").TransactionRecord;
    markCancelled(id: string, reason?: string): import("./transactions.service").TransactionRecord;
}
