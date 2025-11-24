import { Pool, QueryResult } from "pg";
import { Model } from "../model/Model";
import { Messages, Query, WillBeRet } from "./IRepository";

export abstract class Repository<
    T extends Query,
    U extends Model,
    C extends Pool
> {
    constructor(private conn: C) {}
    protected async crud<R extends WillBeRet<U>>(
        data: T,
        succMess: Messages
    ): Promise<R> {
        try {
            const conn = await this.conn.connect();
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
