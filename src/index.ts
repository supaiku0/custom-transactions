import { Container, Logger } from "@arkecosystem/core-interfaces";
import { Handlers } from "@arkecosystem/core-transactions";
import { defaults } from "./defaults";
import { BusinessRegistrationTransactionHandler } from "./handlers";

export const plugin: Container.IPluginDescriptor = {
    pkg: require("../package.json"),
    defaults,
    alias: "custom-transactions",
    async register(container: Container.IContainer, options) {
        container.resolvePlugin<Logger.ILogger>("logger").info("Registering custom transactions");
        Handlers.Registry.registerCustomTransactionHandler(BusinessRegistrationTransactionHandler);
    },
    async deregister(container: Container.IContainer, options) {
        container.resolvePlugin<Logger.ILogger>("logger").info("Deregistering custom transactions");
        Handlers.Registry.deregisterCustomTransactionHandler(BusinessRegistrationTransactionHandler);
    },
};
