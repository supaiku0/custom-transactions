import { Container, Logger } from "@arkecosystem/core-interfaces";
import { TransactionHandlerRegistry } from "@arkecosystem/core-transactions";
import { defaults } from "./defaults";
import { DummyTransactionHandler } from "./handlers";

export const plugin: Container.PluginDescriptor = {
    pkg: require("../package.json"),
    defaults,
    alias: "custom-transactions",
    async register(container: Container.IContainer, options) {
        container.resolvePlugin<Logger.ILogger>("logger").info("Registering custom transactions");
        TransactionHandlerRegistry.registerCustomTransactionHandler(DummyTransactionHandler);
    },
    async deregister(container: Container.IContainer, options) {
        container.resolvePlugin<Logger.ILogger>("logger").info("Deregistering custom transactions");
        TransactionHandlerRegistry.deregisterCustomTransactionHandler(DummyTransactionHandler);
    },
};
