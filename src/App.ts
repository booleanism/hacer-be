import { Connection } from "./Connection";
import { Sign } from "./controller/Sign";
import express, { NextFunction, Request, Response } from "express";
import { Profile } from "./controller/Profile"; // Import Profile
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
    const profile = new Profile(conn);

    app.use((req: Request, res: Response, next: NextFunction) => {
        res.setHeader(
            "Access-Control-Allow-Origin",
            `http://${process.env.FE_HOST}:${process.env.FE_PORT}`
        );
        res.setHeader(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
        );
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
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
    // specs:
    // - header
    // Auhtorization: Basic {key}
    app.get("/checklist", async (req: Request, res: Response) => {
        const key = req.headers.authorization?.split(' ')[1]
        // console.log(key);
        let read = await checklist.readAll(key);
        res.statusCode = read.httpCode;
        res.send(read);
        // console.log(req.body.key);
    });

    // todo
    // required field { data: CheckLists, key: string }
    app.get("/checklist/filter", async (req: Request, res: Response) => {
        // let filter = await checklist.filter(req.body.data as CheckLists, req.body.key)
        // res.statusCode = filter.httpCode;
        // res.send(filter);
    });

    // done
    // specs:
    // - header
    // Auhtorization: Basic {key}
    // Content-Type: application/json
    // - body
    // {"subject": string, "description": string, "date": "string", "importance_id": number}
    app.post("/checklist/add", async (req: Request, res: Response) => {
        const key = req.headers.authorization?.split(' ')[1]
        const data = formatCheckListBody(req.body);
        let add = await checklist.add(data, key);

        res.statusCode = add.httpCode;
        res.send(add);
    });

    // done
    // specs:
    // - header
    // Authorization: Basic {key}
    // Content-Type: application/json
    // - body
    // {"id": string} 
    app.delete("/checklist/remove", async (req: Request, res: Response) => {
        const key = req.headers.authorization?.split(' ')[1]
        const data = formatCheckListBody(req.body);
        let delete_ = await checklist.remove(data, key);
        res.statusCode = delete_.httpCode;
        res.send(delete_);
    });

    // done
    // specs:
    // - header
    // Authorization: Basic {key}
    // Content-Type: application/json
    // - body
    // {"id": string, "subject": string, "description": string, "date": "string", "importance_id": number}
    app.patch("/checklist/edit", async (req: Request, res: Response) => {
        const key = req.headers.authorization?.split(' ')[1]
        const data = formatCheckListBody(req.body);
        let edit = await checklist.edit(data, key);
        res.statusCode = edit.httpCode;
        res.send(edit);
    });

        // Endpoint untuk mendapatkan data user
        app.get("/user/profile", async (req: Request, res: Response) => {
            try {
                const key = req.headers.authorization?.split(' ')[1];
                const user = await profile.getUser(key);
                res.statusCode = user.httpCode;
                res.send(user);
            } catch (error: any) {
                res.statusCode = 500;
                res.send({ error: error.message });
            }
        });
    
        // Endpoint untuk memperbarui data user
        app.put("/user/profile", async (req: Request, res: Response) => {
            try {
                const key = req.headers.authorization?.split(' ')[1];
                const user = req.body;
                const update = await profile.updateUser(user, key);
                res.statusCode = update.httpCode;
                res.send(update);
            } catch (error: any) {
                res.statusCode = 500;
                res.send({ error: error.message });
            }
        });

    app.listen(process.env.APP_PORT, () => {
        console.log(`http://${process.env.APP_HOST}:${process.env.APP_PORT}`);
    });
})();

//hehe