import { Pool } from "pg";
import { CheckLists } from "../model/CheckLists";
import { IRepository, Messages, Query, WillBeRet } from "./IRepository";
import { Repository } from "./Repository";

export type UCheckLists = CheckLists & {
    user_id: string;
    importance_id: number;
};

type U = UCheckLists;

export class CheckListRepository<C extends Pool>
    extends Repository<Query, U, C>
    implements IRepository<U>
{
    constructor(conn: C) {
        super(conn);
    }

    public async create<R extends WillBeRet<U>>(data: CheckLists): Promise<R> {
        if (
            !(
                data.subject &&
                data.description &&
                data.date &&
                data.importanceId &&
                data.userId
            ) ||
            !(
                typeof data.importanceId.id !== "undefined" &&
                typeof data.userId.uname !== "undefined"
            )
        ) {
            return {
                messages: Messages.MissingField
            } as R;
        }

        const query: Query = {
            str: "INSERT INTO CheckLists (subject, description, date, importance_id, user_id) (SELECT $1, $2, $3, $4, Users.id FROM Users WHERE uname = $5) RETURNING *",
            args: [
                data.subject,
                data.description,
                data.date.toISOString(),
                data.importanceId.id.toString(),
                data.userId.uname
            ]
        };
        return this.crud(query, Messages.OkCreate);
    }

    public async readAll<R extends WillBeRet<U>>(): Promise<R> {
        const query: Query = {
            str: "SELECT * FROM CheckLists",
            args: []
        };

        return super.crud(query, Messages.OkRead);
    }

    public async read<R extends WillBeRet<U>>(data: U): Promise<R> {
        if (!data.id) {
            return {
                messages: Messages.MissingField
            } as R;
        }

        const query: Query = {
            str: "SELECT * FROM CheckLists WHERE id = $1",
            args: [data.id]
        };

        return super.crud(query, Messages.OkRead);
    }

    public async update<R extends WillBeRet<U>>(data: CheckLists): Promise<R> {
        if (
            !(
                data.id &&
                data.subject &&
                data.description &&
                data.date &&
                data.importanceId
            ) ||
            typeof data.importanceId.id !== "number"
        ) {
            return {
                messages: Messages.MissingField
            } as R;
        }

        const query: Query = {
            str: "UPDATE CheckLists SET subject = $1, description = $2, date = $3, importance_id = $4 WHERE id = $5 RETURNING *",
            args: [
                data.subject,
                data.description,
                data.date.toISOString(),
                data.importanceId.id?.toString(),
                data.id
            ]
        };
        return super.crud(query, Messages.OkUpdate);
    }

    public async delete<R extends WillBeRet<U>>(data: CheckLists): Promise<R> {
        if (!(data.id && typeof data.userId?.id !== "undefined")) {
            return {
                messages: Messages.MissingField
            } as R;
        }

        const query: Query = {
            str: "DELETE FROM CheckLists WHERE id = $1 AND user_id = $2 RETURNING *",
            args: [data.id, data.userId?.id]
        };

        return super.crud(query, Messages.OkDelete);
    }
}
