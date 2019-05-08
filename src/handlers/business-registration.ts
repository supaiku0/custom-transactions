import { Database, TransactionPool, State, EventEmitter } from "@arkecosystem/core-interfaces";
import { Handlers, } from "@arkecosystem/core-transactions";
import { BusinessRegistrationTransaction } from "../transactions";
import { Transactions, Interfaces } from "@arkecosystem/crypto";
import { BusinessRegistrationAssetError, WalletIsAlreadyABusiness } from "../errors";


export class BusinessRegistrationTransactionHandler extends Handlers.TransactionHandler {

    public getConstructor(): Transactions.TransactionConstructor {
        return BusinessRegistrationTransaction;
    }

    public async bootstrap(connection: Database.IConnection, walletManager: State.IWalletManager): Promise<void> {
        const transactions = await connection.transactionsRepository.getAssetsByType(this.getConstructor().type);

        for (const transaction of transactions) {
            const wallet = walletManager.findByPublicKey(transaction.senderPublicKey);
            (wallet as any).business = transaction.asset.businessRegistration;
        }
    }

    public canBeApplied(
        transaction: Interfaces.ITransaction,
        wallet: State.IWallet,
        databaseWalletManager: State.IWalletManager,
    ): boolean {
        const { data }: Interfaces.ITransaction = transaction;

        const { name, website }: { name: string, website: string } = data.asset.businessRegistration;
        if (!name || !website) {
            throw new BusinessRegistrationAssetError();
        }

        if ((wallet as any).business) {
            throw new WalletIsAlreadyABusiness();
        }


        return super.canBeApplied(transaction, wallet, databaseWalletManager);
    }

    public emitEvents(transaction: Interfaces.ITransaction, emitter: EventEmitter.EventEmitter): void {
        emitter.emit("business.registered", transaction.data);
    }

    public canEnterTransactionPool(
        data: Interfaces.ITransactionData,
        pool: TransactionPool.IConnection,
        processor: TransactionPool.IProcessor,
    ): boolean {
        if (this.typeFromSenderAlreadyInPool(data, pool, processor)) {
            return false;
        }

        const { name }: { name: string } = data.asset.businessRegistration;
        const businessRegistrationsSameNameInPayload = processor
            .getTransactions()
            .filter(tx => tx.type === this.getConstructor().type && tx.asset.businessRegistration.name === name);

        if (businessRegistrationsSameNameInPayload.length > 1) {
            processor.pushError(
                data,
                "ERR_CONFLICT",
                `Multiple business registrations for "${name}" in transaction payload`,
            );
            return false;
        }

        const businessRegistrationsInPool: Interfaces.ITransactionData[] = Array.from(
            pool.getTransactionsByType(this.getConstructor().type),
        ).map((memTx: Interfaces.ITransaction) => memTx.data);

        const containsBusinessRegistrationForSameNameInPool: boolean = businessRegistrationsInPool.some(
            transaction => transaction.asset.businessRegistration.name === name,
        );
        if (containsBusinessRegistrationForSameNameInPool) {
            processor.pushError(data, "ERR_PENDING", `Business registration for "${name}" already in the pool`);
            return false;
        }

        return true;
    }

    protected applyToSender(transaction: Interfaces.ITransaction, walletManager: State.IWalletManager): void {
        super.applyToSender(transaction, walletManager);

        const sender: State.IWallet = walletManager.findByPublicKey(transaction.data.senderPublicKey);
        (sender as any).business = transaction.data.asset.businessRegistration;
    }

    protected revertForSender(transaction: Interfaces.ITransaction, walletManager: State.IWalletManager): void {
        super.revertForSender(transaction, walletManager);

        const sender: State.IWallet = walletManager.findByPublicKey(transaction.data.senderPublicKey);

        (sender as any).business = undefined;
    }

    protected applyToRecipient(transaction: Interfaces.ITransaction, walletManager: State.IWalletManager): void {
        return;
    }

    protected revertForRecipient(transaction: Interfaces.ITransaction, walletManager: State.IWalletManager): void {
        return;
    }

}