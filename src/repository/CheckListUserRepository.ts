import { Pool } from "pg";
import { CheckListRepository, UCheckLists } from "./CheckListRepository";
import { Messages, Query, WillBeRet } from "./IRepository";

type U = UCheckLists;

export enum FilterMode {
    All,
    ByDate
}

export class CheckListByUserRepository<
    C extends Pool
> extends CheckListRepository<C> {
    constructor(conn: C) {
        super(conn);
    }

    public async read<R extends WillBeRet<U>>(
        data: U,
        mode?: FilterMode
    ): Promise<R> {
        if (!data.userId!.id) {
            return {
                messages: Messages.MissingField
            } as R;
        }

        if (mode === FilterMode.All) {
            const query: Query = {
                str: "SELECT cl.* FROM CheckLists as cl INNER JOIN Users as u ON cl.user_id = u.id WHERE u.id = $1",
                args: [data.userId.id]
            };

            return super.crud(query, Messages.OkRead);
        }

        throw new Error("implement please");
        // edit me
        // const query: Query = {
        //     str: 'SELECT cl.* FROM CheckLists as cl INNER JOIN Users as u ON cl.userId = u.id WHERE u.id = $1',
        //     args: [data.userId?.id]
        // };

        // return super.crud(query, conn, Messages.OkRead);
    }
}
