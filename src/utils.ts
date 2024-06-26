import crypto from "crypto";
import { CheckLists, Importances } from "./model/CheckLists";
import { Auth, Sign } from "./controller/Sign";

export async function authUser(
    key: string
): Promise<{ id: string; uname: string; exp: string } | undefined> {
    const usersSession = await Sign.getUserSession();
    const dec = sessDecryption(key);
    return (await Sign.getUserSession()).get(dec.id) === key
        ? { id: dec.id, uname: dec.uname, exp: dec.exp }
        : undefined;
}

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
        id: body.importance_id
    };

    let data: CheckLists = {
        id: body.id,
        subject: body.subject,
        date: new Date(body.date),
        description: body.description,
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
