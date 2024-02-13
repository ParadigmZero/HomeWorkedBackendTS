import express, {Express, Request, Response} from "express";
import cors from "cors";
import bodyParser from "body-parser";
const port : number = 7012;
const app : Express = express();
import "dotenv-defaults/config";
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";



// used for settings for Swagger
const options = {
    failOnErrors: true,
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Webpage word counter API",
        version: process.env.npm_package_version as string,
      },
    },
    apis: ['./src/index.ts']
  };
  
const openapiSpecification = swaggerJsDoc(options);



// REDO  as client

// PostgreSQL database:
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
  });

// Middleware
// allow requests from same origin ( e.g. localhost)
app.use(cors());
// parse JSON in request bodies
app.use(bodyParser.json());

app.use("/api", swaggerUI.serve, swaggerUI.setup(openapiSpecification));

/**
 * @openapi
 * /:
 *   get:
 *     description: Get all homework
 *     summary: Get all homework
 *     responses:
 *       200:
 *         description: Success - got all homework
 *
 */
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
app.delete("/:id", async (req: Request, res: Response)=>{
    await pool.execute(`DELETE FROM childrensHomework WHERE homeworkid=$1;`,
    [req.params.id]);

    await pool.execute(`DELETE FROM homework WHERE id=$1;`,
    [req.params.id]);
});


app.listen(port, ()=>{
    console.log(`Listening on port ${port}`)
});