import { PoolClient } from "pg";
import { CheckListRepository } from "./CheckListRepository";
import { CheckLists } from "../model/CheckLists";
import { Messages, Query, WillBeRet } from "./IRepository";

type U = CheckLists;

export enum FilterMode {
    All,
    ByDate
}

export class CheckListByUserRepository<
    C extends PoolClient
> extends CheckListRepository<C> {
    constructor() {
        super();
    }

    public async read<R extends WillBeRet<U>>(
        conn: C,
        data: U,
        mode: FilterMode
    ): Promise<R> {
        if (data.userId?.id) {
            if (mode === FilterMode.All) {
                const query: Query = {
                    str: "SELECT cl.* FROM CheckLists as cl INNER JOIN Users as u ON cl.user_id = u.id WHERE u.id = $1",
                    args: [data.userId.id]
                };

                return super.crud(query, conn, Messages.OkRead);
            }

            throw new Error("implement please");
            // edit me
            // const query: Query = {
            //     str: 'SELECT cl.* FROM CheckLists as cl INNER JOIN Users as u ON cl.userId = u.id WHERE u.id = $1',
            //     args: [data.userId?.id]
            // };

            // return super.crud(query, conn, Messages.OkRead);
        }

        return {
            messages: Messages.MissingField
        } as R;
    }
}
