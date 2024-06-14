import crypto from "crypto";
import { CheckLists, Importances } from "./model/CheckLists";
import { Auth } from "./controller/Sign";

export function sessDecryption(key: string): Auth {
    const dec = decryptData(key);
    return JSON.parse(dec);
}

export function sessEncryption(id: string, uname: string): string {
    return encryptData(
        `{"id": "${id}", "uname":"${uname}", "exp":"${new Date(+new Date() + 1000 * 60 * 60)}"}`
    );
}

export function formatCheckListBody(body: any): CheckLists {
    let importances: Importances = {
        id: body.data.importance_id
    };

    let data: CheckLists = {
        id: body.data.id,
        subject: body.data.subject,
        date: new Date(body.data.date),
        description: body.data.description,
        importanceId: importances
    };

    return data;
}

const key = crypto
    .createHash("sha512")
    .update(process.env.CRYPTOKEY ?? "")
    .digest("hex")
    .substring(0, 32);
const iv = crypto
    .createHash("sha512")
    .update(process.env.CRYPTOIV ?? "")
    .digest("hex")
    .substring(0, 16);

function encryptData(data: string): string {
    if (process.env.CRYPTO_KEY && process.env.CRYPTO_IV) {
        const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

        return Buffer.from(
            cipher.update(data, "utf8", "hex") + cipher.final("hex")
        ).toString("base64");
    }

    throw new Error("crypto key or iv undefined");
}

function decryptData(data: string) {
    if (process.env.CRYPTO_KEY && process.env.CRYPTO_IV) {
        const buff = Buffer.from(data, "base64");
        const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

        return (
            decipher.update(buff.toString("utf8"), "hex", "utf8") +
            decipher.final("utf8")
        );
    }

    throw new Error("crypto key or iv undefined");
}
