import { Database, TransactionPool } from "@arkecosystem/core-interfaces";
import { TransactionHandler } from "@arkecosystem/core-transactions";
import {
    ITransactionData,
    Transaction,
    TransactionConstructor,
} from "@arkecosystem/crypto";
import { DummyTransaction } from "../transactions";


export class DummyTransactionHandler extends TransactionHandler {
    public getConstructor(): TransactionConstructor {
        return DummyTransaction;
    }

    public apply(transaction: Transaction, wallet: Database.IWallet): void {
        wallet.balance = wallet.balance.times(2);
        return;
    }
    public revert(transaction: Transaction, wallet: Database.IWallet): void {
        wallet.balance = wallet.balance.dividedBy(2);
        return;
    }

    public canEnterTransactionPool(data: ITransactionData, guard: TransactionPool.ITransactionGuard): boolean {
        return true;
    }
}