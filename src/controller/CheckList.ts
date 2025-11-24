import {
    CheckListRepository,
    UCheckLists
} from "../repository/CheckListRepository";
import { CheckLists } from "../model/CheckLists";
import { Connection } from "../Connection";
import { Messages } from "../repository/IRepository";
import { authUser } from "../utils";
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
    constructor(
        private clRepo: CheckListRepository<Connection>,
        private userRepo: UserRepository<Connection>
    ) {}

    private async readUserCb(i: number, ucl: UCheckLists[]) {
        let usr: Users = {
            id: ucl[i].user_id
        };
        const userRes = await this.userRepo.readById(usr);
        if (userRes.data) {
            ucl[i].userId = userRes.data[0];
        }
    }

    private async processData(
        ucl: UCheckLists[],
        readUserCb?: (i: number, ucl: UCheckLists[]) => void
    ) {
        for (let i = 0; i < ucl.length; i++) {
            if (typeof ucl[i].user_id === "string") {
                if (readUserCb) {
                    readUserCb(i, ucl);
                } else {
                    ucl[i].userId = {
                        id: ucl[i].user_id
                    };
                }
            }

            if (typeof ucl[i].importance_id === "number") {
                ucl[i].importanceId = {
                    id: ucl[i].importance_id
                };
            }
        }
    }

    public async readAll(
        key: string | undefined,
        _?: CheckLists | undefined
    ): Promise<Respons> {
        if (!key) {
            return {
                httpCode: 403,
                result: Results[Results.MissingRequiredField]
            };
        }

        if (key === process.env.BOT_KEY) {
            const res = await this.clRepo.readAll();
            if (res.messages !== Messages.OkRead || !res.data) {
                return {
                    httpCode: 417,
                    result: Results[Results.ReadFailed]
                };
            }

            this.processData(res.data, this.readUserCb);

            return {
                httpCode: 200,
                result: Results[Results.ReadSucceed],
                data: res.data
            };
        }

        let auth = await authUser(key);
        if (!auth) {
            return {
                httpCode: 401,
                result: Results[Results.AuthFailed]
            };
        }

        const reqObj: CheckLists = {};

        reqObj.userId = {
            uname: auth.uname,
            id: auth.id
        };
        const res = await this.clRepo.read(reqObj as UCheckLists);
        if (res.messages !== Messages.OkRead || !res.data) {
            return {
                httpCode: 417,
                result: Results[Results.ReadFailed]
            };
        }

        this.processData(res.data);

        return {
            httpCode: 200,
            result: Results[Results.ReadSucceed],
            data: res.data
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
        if (!auth) {
            return {
                httpCode: 401,
                result: Results[Results.AuthFailed]
            };
        }

        reqObj.userId = {
            uname: auth.uname,
            id: auth.id
        };

        const res = await this.clRepo.create(reqObj);
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
        if (!auth) {
            return {
                httpCode: 401,
                result: Results[Results.AuthFailed]
            };
        }

        let user: Users = {
            uname: auth.uname,
            id: auth.id
        };
        reqObj.userId = user;
        const res = await this.clRepo.update(reqObj);

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

    public async remove(
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
        if (!auth) {
            return {
                httpCode: 401,
                result: Results[Results.AuthFailed]
            };
        }

        reqObj.userId = {
            uname: auth.uname,
            id: auth.id
        };
        const res = await this.clRepo.delete(reqObj);
        if (!res.data) {
            return {
                httpCode: 400,
                result: Results[Results.RemoveFailed]
            };
        }

        if (res.messages !== Messages.OkDelete || res.data.length < 1) {
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
        if (!auth) {
            return {
                httpCode: 401,
                result: Results[Results.AuthFailed]
            };
        }

        reqObj.userId = {
            uname: auth.uname,
            id: auth.id
        };

        const res = await this.clRepo.read(reqObj as UCheckLists);
        if (!res.data) {
            return {
                httpCode: 400,
                result: Results[Results.RemoveFailed]
            };
        }

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
}
