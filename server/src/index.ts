import express, { type Request, type Response } from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("active");
})

app.listen(PORT, () => {
    console.log(`server running at port ${PORT}`);
})