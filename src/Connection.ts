import { Pool } from "pg";

export class Connection extends Pool {
    constructor() {
        super({
            host: process.env.PGHOST,
            user: process.env.PGUSER,
            password: process.env.PGPASSWORD,
            database: process.env.PGDATABASE
        });

        this.on("error", (err, client) => {
            console.error("Unexpected error on idle client", err);
            process.exit(-1);
        });
    }
}
