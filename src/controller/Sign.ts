import { PoolClient } from "pg";
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
    private users: UserRepository<PoolClient>;

    constructor(private conn: Connection) {
        this.users = new UserRepository();
        Sign.userSession = new Map<string, string>();
    }

    public async up(reqObj: Users): Promise<Respons> {
        const res = await this.users.create(await this.conn.connect(), reqObj);
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
        const res = await this.users.read(await this.conn.connect(), reqObj);
        if (res.messages !== Messages.OkRead) {
            return {
                httpCode: 401,
                result: Results[Results.SignInFailed]
            };
        }

        if (res.data) {
            if (res.data[0].uname && res.data[0].passwd && res.data[0].id) {
                if (reqObj.passwd === res.data[0].passwd) {
                    let key = sessEncryption(res.data[0].id, res.data[0].uname);
                    Sign.userSession.set(res.data[0].uname, key);
                    // console.log(Sign.userSession);

                    return {
                        httpCode: 200,
                        result: Results[Results.SignInSucceed],
                        key: key
                    };
                }

                return {
                    httpCode: 401,
                    result: Results[Results.SignInFailed]
                };
            }

            return {
                httpCode: 401,
                result: Results[Results.SignInFailed]
            };
        }

        return {
            httpCode: 406,
            result: Results[Results.MissingRequiredField]
        };
    }

    public async out(key: string | undefined): Promise<Respons> {
        if (key) {
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

        return {
            httpCode: 406,
            result: Results[Results.MissingRequiredField]
        };
    }

    public static async getUserSession(): Promise<UserMap> {
        return Sign.userSession;
    }
}
