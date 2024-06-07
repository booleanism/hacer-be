import { PoolClient, QueryResult } from "pg";
import { Model } from "../model/Model";
import { Messages, Query, WillBeRet } from "./IRepository";

export abstract class Repository<
    T extends Query,
    U extends Model,
    C extends PoolClient
> {
    protected async crud<R extends WillBeRet<U>>(
        data: T,
        conn: C,
        succMess: Messages
    ): Promise<R> {
        try {
            const result: QueryResult<U> = await conn.query(
                data.str,
                data.args
            );
            conn.release();
            if (result.rows) {
                return {
                    messages: succMess,
                    data: result.rows
                } as unknown as R;
            }
        } catch (e) {
            console.log(e);
        }

        return {
            messages: succMess + 1,
            data: undefined
        } as R;
    }
}
