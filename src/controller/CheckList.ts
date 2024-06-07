import { PoolClient } from "pg";
import { CheckListRepository } from "../repository/CheckListRepository";
import { Sign } from "./Sign";
import { CheckLists } from "../model/CheckLists";
import { Connection } from "../Connection";
import { Messages } from "../repository/IRepository";
import { sessDecryption } from "../utils";
import {
    CheckListByUserRepository,
    FilterMode
} from "../repository/CheckListUserRepository";
import { Users } from "../model/Users";

type Respons = {
    httpCode: number;
    result: string;
    data?: CheckLists[] | undefined;
};

enum Results {
    AddSuccees,
    AddFailed,
    EditSucceed,
    EditFailed,
    RemoveSecceed,
    RemoveFailed,
    FilterSucceed,
    FilterFailed,
    ReadSucceed,
    ReadFailed,
    MissingRequiredField,
    AuthFailed
}

export class CheckList {
    private clRepo: CheckListRepository<PoolClient>;

    constructor(private conn: Connection) {
        this.clRepo = new CheckListRepository();
    }

    public async readAll(
        reqObj: CheckLists,
        key: string | undefined
    ): Promise<Respons> {
        if (!key || typeof reqObj.userId?.uname === "undefined") {
            return {
                httpCode: 403,
                result: Results[Results.MissingRequiredField]
            };
        }

        let auth = await this.auth(reqObj.userId?.uname, key);
        // console.log(auth);
        if (auth) {
            reqObj.userId = {
                uname: auth.uname,
                id: auth.id
            };
            // console.log(reqObj)
            const res = await new CheckListByUserRepository().read(
                await this.conn.connect(),
                reqObj,
                FilterMode.All
            );
            if (res.messages !== Messages.OkRead) {
                return {
                    httpCode: 417,
                    result: Results[Results.ReadFailed]
                };
            }

            return {
                httpCode: 200,
                result: Results[Results.ReadSucceed],
                data: res.data
            };
        }

        return {
            httpCode: 401,
            result: Results[Results.AuthFailed]
        };
    }

    public async add(
        reqObj: CheckLists,
        key: string | undefined
    ): Promise<Respons> {
        if (!key || typeof reqObj.userId?.uname === "undefined") {
            return {
                httpCode: 403,
                result: Results[Results.MissingRequiredField]
            };
        }

        let auth = await this.auth(reqObj.userId.uname, key);
        if (auth) {
            reqObj.userId = {
                uname: auth.uname,
                id: auth.id
            };

            const res = await this.clRepo.create(
                await this.conn.connect(),
                reqObj
            );
            if (res.messages !== Messages.OkCreate) {
                return {
                    httpCode: 400,
                    result: Results[Results.AddFailed]
                };
            }

            return {
                httpCode: 201,
                result: Results[Results.AddSuccees]
            };
        }

        return {
            httpCode: 401,
            result: Results[Results.AuthFailed]
        };
    }

    public async edit(
        reqObj: CheckLists,
        key: string | undefined
    ): Promise<Respons> {
        if (!key || typeof reqObj.userId?.uname === "undefined") {
            return {
                httpCode: 403,
                result: Results[Results.MissingRequiredField]
            };
        }

        let auth = await this.auth(reqObj.userId.uname, key);
        if (auth) {
            let user: Users = {
                uname: auth.uname,
                id: auth.id
            };
            reqObj.userId = user;
            const res = await this.clRepo.update(
                await this.conn.connect(),
                reqObj
            );
            if (res.messages !== Messages.OkUpdate) {
                return {
                    httpCode: 400,
                    result: Results[Results.EditFailed]
                };
            }

            return {
                httpCode: 200,
                result: Results[Results.EditSucceed]
            };
        }

        return {
            httpCode: 401,
            result: Results[Results.AuthFailed]
        };
    }

    public async remove(
        reqObj: CheckLists,
        key: string | undefined
    ): Promise<Respons> {
        if (!key || typeof reqObj.userId?.uname === "undefined") {
            return {
                httpCode: 403,
                result: Results[Results.MissingRequiredField]
            };
        }

        let auth = await this.auth(reqObj.userId.uname, key);
        if (auth) {
            reqObj.userId = {
                uname: auth.uname,
                id: auth.id
            };
            const res = await this.clRepo.delete(
                await this.conn.connect(),
                reqObj
            );
            if (res.messages !== Messages.OkDelete) {
                return {
                    httpCode: 400,
                    result: Results[Results.RemoveFailed]
                };
            }

            return {
                httpCode: 200,
                result: Results[Results.RemoveSecceed],
                data: res.data
            };
        }

        return {
            httpCode: 401,
            result: Results[Results.AuthFailed]
        };
    }

    public async filter(
        reqObj: CheckLists,
        key: string | undefined
    ): Promise<Respons> {
        if (!key || typeof reqObj.userId?.uname === "undefined") {
            return {
                httpCode: 403,
                result: Results[Results.MissingRequiredField]
            };
        }

        let auth = await this.auth(reqObj.userId.uname, key);
        if (auth) {
            reqObj.userId = {
                uname: auth.uname,
                id: auth.id
            };

            const res = await new CheckListByUserRepository().read(
                await this.conn.connect(),
                reqObj,
                FilterMode.ByDate
            );
            if (res.messages !== Messages.OkRead) {
                return {
                    httpCode: 417,
                    result: Results[Results.ReadFailed]
                };
            }

            return {
                httpCode: 200,
                result: Results[Results.ReadSucceed],
                data: res.data
            };
        }

        return {
            httpCode: 401,
            result: Results[Results.AuthFailed]
        };
    }

    private async auth(
        uname: string,
        key: string
    ): Promise<{ id: string; uname: string; exp: string } | undefined> {
        const usersSession = await Sign.getUserSession();
        const dec = sessDecryption(key);

        return (await Sign.getUserSession()).get(uname) === key
            ? { id: dec.id, uname: dec.uname, exp: dec.exp }
            : undefined;
    }
}