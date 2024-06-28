import { PoolClient } from "pg";
import {
    CheckListRepository,
    UCheckLists
} from "../repository/CheckListRepository";
import { Sign } from "./Sign";
import { CheckLists } from "../model/CheckLists";
import { Connection } from "../Connection";
import { Messages } from "../repository/IRepository";
import { authUser, sessDecryption } from "../utils";
import {
    CheckListByUserRepository,
    FilterMode
} from "../repository/CheckListUserRepository";
import { Users } from "../model/Users";
import { UserRepository } from "../repository/UserRepository";

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
        key: string | undefined,
        reqObj?: CheckLists | undefined,
    ): Promise<Respons> {
        if (!key) {
            return {
                httpCode: 403,
                result: Results[Results.MissingRequiredField]
            };
        }

        if (key === process.env.BOT_KEY) {
            const res = await (new CheckListRepository().readAll(await this.conn.connect()));

            if (res.messages !== Messages.OkRead) {
                return {
                    httpCode: 417,
                    result: Results[Results.ReadFailed]
                }
            }

            if (res.data) {
                for (let i = 0; i < res.data.length; i++) {
                    if (typeof res.data[i].user_id === "string") {
                        let usr: Users = {
                            id: res.data[i].user_id
                        }
                        const userRes = await new UserRepository().readById(await this.conn.connect(), usr);
                        if (userRes.data) {
                            res.data[i].userId = userRes.data[0];
                        }
                    }

                    if (typeof res.data[i].importance_id === "number") {
                        res.data[i].importanceId = {
                            id: res.data[i].importance_id
                        };
                    }
                }
            }


            return {
                httpCode: 200,
                result: Results[Results.ReadSucceed],
                data: res.data
            }
        }

        let auth = await authUser(key);
        if (auth) {
            const reqObj: CheckLists = {};

            reqObj.userId = {
                uname: auth.uname,
                id: auth.id
            };
            const res = await new CheckListByUserRepository().read(
                await this.conn.connect(),
                reqObj as UCheckLists,
                FilterMode.All
            );
            if (res.messages !== Messages.OkRead) {
                return {
                    httpCode: 417,
                    result: Results[Results.ReadFailed]
                };
            }

            if (res.data) {
                for (let i = 0; i < res.data.length; i++) {
                    if (typeof res.data[i].user_id === "string") {
                        res.data[i].userId = {
                            id: res.data[i].user_id
                        };
                    }

                    if (typeof res.data[i].importance_id === "number") {
                        res.data[i].importanceId = {
                            id: res.data[i].importance_id
                        };
                    }
                }
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
        if (!key) {
            return {
                httpCode: 403,
                result: Results[Results.MissingRequiredField]
            };
        }

        let auth = await authUser(key);
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
        if (!key) {
            return {
                httpCode: 403,
                result: Results[Results.MissingRequiredField]
            };
        }

        let auth = await authUser(key);
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
        if (
            !key
        ) {
            return {
                httpCode: 403,
                result: Results[Results.MissingRequiredField]
            };
        }

        let auth = await authUser(key);
        if (auth) {
            reqObj.userId = {
                uname: auth.uname,
                id: auth.id
            };
            const res = await this.clRepo.delete(
                await this.conn.connect(),
                reqObj
            );

            if (res.data) {
                if (res.messages !== Messages.OkDelete || res.data.length < 1) {
                    return {
                        httpCode: 400,
                        result: Results[Results.RemoveFailed]
                    };
                }
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
        if (!key || typeof reqObj.userId?.id === "undefined") {
            return {
                httpCode: 403,
                result: Results[Results.MissingRequiredField]
            };
        }

        let auth = await authUser(key);
        if (auth) {
            reqObj.userId = {
                uname: auth.uname,
                id: auth.id
            };

            const res = await new CheckListByUserRepository().read(
                await this.conn.connect(),
                reqObj as UCheckLists,
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
}
