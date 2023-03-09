import express, {Express, Request, Response} from "express";
const cors = require('cors');
const bodyParser = require('body-parser')
const port : number = 7012;
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

    res.send(aux.rows);
});

// Add a single piece of homework, and return the added homework
app.post("/", async (req: Request, res: Response)=>{

    // req.body is that right?
    let homework = await pool.query(`INSERT INTO homework (Name, Image, Datedue, Comment) VALUES ($1,$2,$3,$4) RETURNING *;`,
    [req.body.name,req.body.image, req.body.dateDue, req.body.comment]);
    let children = await pool.query(`SELECT * FROM children;`);

    console.log(homework);
    console.log(children);

    for(let i=0; i < children.length; i++)
    {
        await pool.query(`INSERT INTO childrensHomework (homeworkid, childid) VALUES ($1,$2);`,[homework.id, children[i].id]);
    }


    res.send(homework);
});


// Update a child's homework, and return the updated value
app.put("/:homeworkId/:childId", async (req: Request, res: Response)=>{
    let child = await pool.query(`UPDATE childrensHomework 
    SET image = $1, comment = $2, annotation = $3 
    WHERE homeworkid= $4 AND childid = $5 RETURNING *;`,
    [req.body.image,req.body.comment,req.body.comment,req.params.homeworkId,req.params.childId]);

    res.send(child);
});

app.get("/test", async (req: Request, res: Response)=>{
    res.send([1,2,3])
});

// Delete single homework, and childrens homework
app.listen(port, ()=>{
    console.log(`Listening on port ${port}`)
});