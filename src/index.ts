import express, {Express, Request, Response} from "express";
const cors = require('cors');
const bodyParser = require('body-parser')
const port : number = 3000;
const app : Express = express();
require('dotenv').config();

// PostgreSQL database:
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.HOST,
    user: process.env.USER,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT
  });

// Middleware
// allow requests from same origin ( e.g. localhost)
app.use(cors());
// parse JSON in request bodies
app.use(bodyParser.json());

// Get ALL Homework
app.get("/", async (req: Request, res: Response)=>{
    var aux = await pool.query('SELECT * FROM Homework;');
    res.send(aux.rows);
});

// Get single homework with corresponding children
app.get("/:id", async (req: Request, res: Response)=>{
    let aux = await pool.query(`
    SELECT children.id, children.name, children.avatar, childrensHomework.image,
    childrensHomework.comment, childrensHomework.annotation
    FROM children
    FULL OUTER JOIN
    childrensHomework
    ON
    children.id = childrensHomework.childId
    WHERE homeworkId=$1 ORDER BY id;`,[req.params.id]);

    res.send(aux);
});

// Delete single homework, and childrens homework

app.listen(port, ()=>{
    console.log(`Listening on port ${port}`)
})