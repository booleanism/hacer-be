import { Connection } from "../Connection";
import { Users } from "../model/Users";
import { UserRepository } from "../repository/UserRepository";
import { Messages } from "../repository/IRepository";
import { sessDecryption, sessEncryption } from "../utils";

export type UserMap = Map<string, string>;

enum Results {
    SignUpFailed,
    SignUpSucceed,
    SignInFailed,
    SignInSucceed,
    SignOutFailed,
    SignOUtSucceed,
    MissingRequiredField
}

export type Auth = {
    id: string;
    uname: string;
    exp: string;
};

type Respons = {
    httpCode: number;
    result: string;
    key?: string | undefined;
};

export class Sign {
    private static userSession: UserMap;

    constructor(private users: UserRepository<Connection>) {
        Sign.userSession = new Map<string, string>();
    }

    public async up(reqObj: Users): Promise<Respons> {
        const res = await this.users.create(reqObj);
        if (res.messages !== Messages.OkCreate) {
            return {
                httpCode: 400,
                result: Results[Results.SignUpFailed]
            };
        }

        return {
            httpCode: 201,
            result: Results[Results.SignUpSucceed]
        };
    }

    public async in(reqObj: Users): Promise<Respons> {
        const res = await this.users.read(reqObj);
        if (res.messages !== Messages.OkRead || !res.data) {
            return {
                httpCode: 401,
                result: Results[Results.SignInFailed]
            };
        }

        if (!(res.data[0].uname && res.data[0].passwd && res.data[0].id)) {
            return {
                httpCode: 401,
                result: Results[Results.SignInFailed]
            };
        }

        if (reqObj.passwd !== res.data[0].passwd) {
            return {
                httpCode: 401,
                result: Results[Results.SignInFailed]
            };
        }

        let key = sessEncryption(res.data[0].id, res.data[0].uname);
        Sign.userSession.set(res.data[0].id, key);

        return {
            httpCode: 200,
            result: Results[Results.SignInSucceed],
            key: key
        };
    }

    public async out(key: string | undefined): Promise<Respons> {
        if (!key) {
            return {
                httpCode: 406,
                result: Results[Results.MissingRequiredField]
            };
        }

        let dec = sessDecryption(key);
        if (Sign.userSession.delete(dec.uname)) {
            return {
                httpCode: 200,
                result: Results[Results.SignOUtSucceed]
            };
        }

        return {
            httpCode: 401,
            result: Results[Results.SignOutFailed]
        };
    }

    public static async getUserSession(): Promise<UserMap> {
        return Sign.userSession;
    }
}
