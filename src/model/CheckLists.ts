import { Model } from "./Model";
import { Users } from "./Users";

export type CheckLists = Model & {
    id?: string | undefined;
    subject?: string | undefined;
    description?: string | undefined;
    date?: Date | undefined;
    importanceId?: Importances | undefined;
    userId?: Users | undefined;
};

export type Importances = {
    id: number | undefined;
    desc?: string | undefined;
};
