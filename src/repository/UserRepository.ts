import { PoolClient } from "pg";
import { Users } from "../model/Users";
import { Repository } from "./Repository";
import { IRepository, Messages, Query, WillBeRet } from "./IRepository";

type U = Users;

export class UserRepository<C extends PoolClient>
    extends Repository<Query, Users, C>
    implements IRepository<Users, C>
{
    constructor() {
        super();
    }

    public async create<R extends WillBeRet<U>>(conn: C, data: U): Promise<R> {
        if (data.uname && data.passwd && data.name) {
            const query: Query = {
                str: "INSERT INTO Users (uname, passwd, name) VALUES ($1, $2, $3) RETURNING *",
                args: [data.uname, data.passwd, data.name]
            };

            return super.crud(query, conn, Messages.OkCreate);
        }

        return {
            messages: Messages.MissingField
        } as R;
    }

    public async read<R extends WillBeRet<U>>(conn: C, data: U): Promise<R> {
        if (data.uname) {
            const query: Query = {
                str: "SELECT * FROM Users WHERE uname = $1",
                args: [data.uname]
            };

            return super.crud(query, conn, Messages.OkRead);
        }

        return {
            messages: Messages.MissingField
        } as R;
    }

    public async update<R extends WillBeRet<U>>(conn: C, data: U): Promise<R> {
        if (data.name && data.passwd && data.passwd && data.uname) {
            const query: Query = {
                str: "UPDATE FROM Users SET name = $1, passwd = $2 WHERE uname = $3 RETURNING *",
                args: [data.name, data.passwd, data.uname]
            };

            return super.crud(query, conn, Messages.OkUpdate);
        }

        return {
            messages: Messages.MissingField
        } as R;
    }

    public async delete<R extends WillBeRet<U>>(conn: C, data: U): Promise<R> {
        if (data.uname) {
            const query: Query = {
                str: "DELETE FROM Users WHERE uname = $1 RETURNING *",
                args: [data.uname]
            };

            return super.crud(query, conn, Messages.OkDelete);
        }

        return {
            messages: Messages.MissingField
        } as R;
    }
}
