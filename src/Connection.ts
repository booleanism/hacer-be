import { Pool } from "pg";

export class Connection extends Pool {
    constructor() {
        super({
            host: process.env.PG_HOST,
            user: process.env.PG_USER,
            password: process.env.PG_PW,
            database: process.env.PG_DB
        });

        this.on("error", (err, client) => {
            console.error("Unexpected error on idle client", err);
            process.exit(-1);
        });
    }
}
