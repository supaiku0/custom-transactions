import {
    schemas,
    Transaction,
} from "@arkecosystem/crypto";
import bs58check from "bs58check";
import ByteBuffer from "bytebuffer";

const { transactionBaseSchema, extend } = schemas;

const DUMMY_TRANSACTION_TYPE = 100;

export class DummyTransaction extends Transaction {
    public static type = DUMMY_TRANSACTION_TYPE;

    public static getSchema(): schemas.TransactionSchema {
        return extend(transactionBaseSchema, {
            $id: "dummy",
            required: ["recipientId", "asset"],
            properties: {
                type: { transactionType: DUMMY_TRANSACTION_TYPE },
                amount: { bignumber: { minimum: 0, maximum: 0 } },
                recipientId: { $ref: "address" },
                asset: {
                    type: "object",
                    required: ["test"],
                    properties: {
                        test: {
                            type: "number",
                        },
                    },
                },
            },
        });
    }

    public serialize(): ByteBuffer {
        const { data } = this;
        const buffer = new ByteBuffer(25, true);
        buffer.append(bs58check.decode(data.recipientId));
        buffer.writeInt32(data.asset.test);

        return buffer;
    }

    public deserialize(buf: ByteBuffer): void {
        const { data } = this;
        data.recipientId = bs58check.encode(buf.readBytes(21).toBuffer());
        data.asset = {
            test: buf.readInt32(),
        };
    }
}