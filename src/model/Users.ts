import { WillBeRead, WillBeWrite } from "../repository/IRepository";
import { Model } from "./Model";

export type Users = WillBeRead &
    WillBeWrite &
    Model & {
        id?: string | undefined;
        name?: string | undefined;
        uname?: string | undefined;
        passwd?: string | undefined;
    };
