// controller/Profile.ts
import { PoolClient } from "pg";
import { Sign } from "./Sign";
import { Users } from "../model/Users";
import { Connection } from "../Connection";
import { authUser, sessDecryption } from "../utils";
import { UserRepository } from "../repository/UserRepository";
import { Messages } from "../repository/IRepository";

type Respons = {
    httpCode: number;
    result: string;
    data?: Users | undefined;
};

enum Results {
    GetSucceed,
    GetFailed,
    UpdateSucceed,
    UpdateFailed,
    MissingRequiredField,
    AuthFailed
}

export class Profile {
    private userRepo: UserRepository<PoolClient>;

    constructor(private conn: Connection) {
        this.userRepo = new UserRepository();
    }

    public async getUser(key: string | undefined): Promise<Respons> {
        if (!key) {
            return {
                httpCode: 403,
                result: Results[Results.MissingRequiredField]
            };
        }

        let auth = await authUser(key);
        if (auth) {
            const userProfile: Users = {
                id: auth.id,
                uname: auth.uname
            }
            const res = await this.userRepo.read(await this.conn.connect(), userProfile);
            if (res.messages !== Messages.OkRead || !res.data) {
                return {
                    httpCode: 417,
                    result: Results[Results.GetFailed]
                };
            }

            const user = res.data[0];
            // delete user.passwd; // Jangan mengembalikan password
            return {
                httpCode: 200,
                result: Results[Results.GetSucceed],
                data: user
            };
        }

        return {
            httpCode: 401,
            result: Results[Results.AuthFailed]
        };
    }

    public async updateUser(user: Users, key: string | undefined): Promise<Respons> {
        if (!key) {
            return {
                httpCode: 403,
                result: Results[Results.MissingRequiredField]
            };
        }

        let auth = await authUser(key);
        if (auth) {
            user.id = auth.id; // Pastikan ID user tetap
            user.uname = auth.uname;

            const res = await this.userRepo.update(await this.conn.connect(), user);
            if (res.messages !== Messages.OkUpdate) {
                return {
                    httpCode: 400,
                    result: Results[Results.UpdateFailed]
                };
            }

            return {
                httpCode: 200,
                result: Results[Results.UpdateSucceed]
            };
        }

        return {
            httpCode: 401,
            result: Results[Results.AuthFailed]
        };
    }
}
