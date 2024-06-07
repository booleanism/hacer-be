export type WillBeWrite = {};
export type WillBeRead = {
    id?: string | undefined;
};

export type WillBeRet<T> = {
    messages: Messages;
    data?: T[] | undefined;
};

export type Query = {
    str: string;
    args: string[];
};

export enum Messages {
    OkCreate, // 0x00
    ErrCreate, // 0x01
    OkRead, // 0x02
    ErrRead, // 0x03
    OkUpdate, // 0x04
    ErrUpdate, // 0x05
    OkDelete, // 0x06
    ErrDelete, // 0x07
    NoEntry, // 0x08
    MissingField // 0x09
}

export interface IRepository<U, Conn> {
    create<R extends WillBeRet<U>>(conn: Conn, data: U): Promise<R>;
    read<R extends WillBeRet<U>>(conn: Conn, data: U): Promise<R>;
    update<R extends WillBeRet<U>>(conn: Conn, data: U): Promise<R>;
    delete<R extends WillBeRet<U>>(conn: Conn, data: U): Promise<R>;
}
