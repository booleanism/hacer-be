import { Connection } from "./Connection";
import { Sign } from "./controller/Sign";
import express, { NextFunction, Request, Response } from "express";
import { Users } from "./model/Users";
import { CheckList } from "./controller/CheckList";
import { CheckLists, Importances } from "./model/CheckLists";
import { formatCheckListBody } from "./utils";

(async () => {
    const app = express();
    app.use(express.json());
    const conn = new Connection();
    const sign = new Sign(conn);
    const checklist = new CheckList(conn);

    app.use((req: Request, res: Response, next: NextFunction) => {
        res.setHeader(
            "Access-Control-Allow-Origin",
            `http://${process.env.FE_HOST}:${process.env.FE_PORT}`
        );
        res.setHeader(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
        );
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        next();
    });

    // done
    // required field { uname, passwd, name }
    app.post("/user/signup", async (req: Request, res: Response) => {
        let user = req.body as Users;
        let up = await sign.up(user);
        res.statusCode = up.httpCode;
        // res.header("Access-Control-Allow-Origin", "http://localhost:5173")

        res.send(up);
    });

    // done
    // required field { uname, passwd }
    app.post("/user/signin", async (req: Request, res: Response) => {
        let in_ = await sign.in(req.body as Users);
        res.statusCode = in_.httpCode;
        res.send(in_);
    });

    // done
    // required field { key }
    app.delete("/user/signout", async (req: Request, res: Response) => {
        let out = await sign.out(req.body.key);
        res.statusCode = out.httpCode;
        res.send(out);
    });

    // done
    // required field { data: CheckLists key: string }
    app.get("/checklist", async (req: Request, res: Response) => {
        const data = formatCheckListBody(req.body);
        let read = await checklist.readAll(data, req.body.key);
        res.statusCode = read.httpCode;
        res.send(read);
    });

    // todo
    // required field { data: CheckLists, key: string }
    app.get("/checklist/filter", async (req: Request, res: Response) => {
        // let filter = await checklist.filter(req.body.data as CheckLists, req.body.key)
        // res.statusCode = filter.httpCode;
        // res.send(filter);
    });

    // done
    // required field { data: CheckLists, key: string }
    app.post("/checklist/add", async (req: Request, res: Response) => {
        const data = formatCheckListBody(req.body);
        let add = await checklist.add(data, req.body.key);

        res.statusCode = add.httpCode;
        res.send(add);
    });

    // done
    // required field { data: CheckLists, key: string }
    app.delete("/checklist/remove", async (req: Request, res: Response) => {
        const data = formatCheckListBody(req.body);
        let delete_ = await checklist.remove(data, req.body.key);
        res.statusCode = delete_.httpCode;
        res.send(delete_);
    });

    // done
    // required field { data: CheckLists, key: string }
    app.patch("/checklist/edit", async (req: Request, res: Response) => {
        const data = formatCheckListBody(req.body);
        let edit = await checklist.edit(data, req.body.key);
        res.statusCode = edit.httpCode;
        res.send(edit);
    });

    app.listen(process.env.APP_PORT, () => {
        console.log(`http://${process.env.APP_HOST}:${process.env.APP_PORT}`);
    });
})();
