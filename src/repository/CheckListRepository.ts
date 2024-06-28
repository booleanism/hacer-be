import { PoolClient } from "pg";
import { CheckLists } from "../model/CheckLists";
import { IRepository, Messages, Query, WillBeRet } from "./IRepository";
import { Repository } from "./Repository";
import { FilterMode } from "./CheckListUserRepository";

export type UCheckLists = CheckLists & {
    user_id: string;
    importance_id: number;
};

type U = UCheckLists;

export class CheckListRepository<C extends PoolClient>
    extends Repository<Query, U, C>
    implements IRepository<U, C> {
    constructor() {
        super();
    }

    public async create<R extends WillBeRet<U>>(
        conn: C,
        data: CheckLists
    ): Promise<R> {
        if (
            data.subject &&
            data.description &&
            data.date &&
            data.importanceId &&
            data.userId
        ) {
            if (
                typeof data.importanceId.id !== "undefined" &&
                typeof data.userId.uname !== "undefined"
            ) {
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
                return this.crud(query, conn, Messages.OkCreate);
            }
        }

        return {
            messages: Messages.MissingField
        } as R;
    }

    public async readAll<R extends WillBeRet<U>>(
        conn: C,
    ): Promise<R> {
        const query: Query = {
            str: "SELECT * FROM CheckLists",
            args: []
        };

        return super.crud(query, conn, Messages.OkRead);
    }


    public async read<R extends WillBeRet<U>>(
        conn: C,
        data: U,
        mode?: FilterMode | undefined
    ): Promise<R> {
        if (data.id) {
            const query: Query = {
                str: "SELECT * FROM CheckLists WHERE id = $1",
                args: [data.id]
            };

            return super.crud(query, conn, Messages.OkRead);
        }

        return {
            messages: Messages.MissingField
        } as R;
    }

    public async update<R extends WillBeRet<U>>(
        conn: C,
        data: CheckLists
    ): Promise<R> {
        if (
            data.id &&
            data.subject &&
            data.description &&
            data.date &&
            data.importanceId
        ) {
            if (typeof data.importanceId.id === "number") {
                console.log(data);
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
                return super.crud(query, conn, Messages.OkUpdate);
            }
        }

        return {
            messages: Messages.MissingField
        } as R;
    }

    public async delete<R extends WillBeRet<U>>(
        conn: C,
        data: CheckLists
    ): Promise<R> {
        if (data.id && typeof data.userId?.id !== "undefined") {
            const query: Query = {
                str: "DELETE FROM CheckLists WHERE id = $1 AND user_id = $2 RETURNING *",
                args: [data.id, data.userId?.id]
            };

            return super.crud(query, conn, Messages.OkDelete);
        }

        return {
            messages: Messages.MissingField
        } as R;
    }
}
