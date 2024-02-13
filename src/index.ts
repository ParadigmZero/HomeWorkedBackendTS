import express, { Express, Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import "dotenv-defaults/config";
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
const port: number = Number(process.env.PORT);
const app: Express = express();

// used for settings for Swagger
const options = {
  failOnErrors: true,
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HomeWorked backend",
      version: process.env.npm_package_version as string,
    },
  },
  apis: ["./src/index.ts"],
};

const openapiSpecification = swaggerJsDoc(options);

// Consider redo PostgreSQL as client

// PostgreSQL database:
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
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
 *     responses:
 *       200:
 *         description: Success - got all homework
 */
app.get("/", async (req: Request, res: Response) => {
  var aux = await pool.query("SELECT * FROM Homework;");
  res.send(aux.rows);
});

/**
 * @openapi
 * /{id}:
 *     get:
 *       description: Get all the children's homework for a given piece of homework
 *       parameters:
 *       - in: path
 *         description: id for the piece of homework
 *         name: id
 *         schema:
 *          type: integer
 *         example: 1
 *         required: true
 *       responses:
 *          200:
 *              description: Success - got all homework
 */
app.get("/:id", async (req: Request, res: Response) => {
  console.log(req.params.id);
  let aux = await pool.query(
    `
    SELECT children.id, children.name, children.avatar, childrensHomework.image,
    childrensHomework.comment, childrensHomework.annotation
    FROM children
    FULL OUTER JOIN
    childrensHomework
    ON
    children.id = childrensHomework.childId
    WHERE homeworkId=$1 ORDER BY id;`,
    [req.params.id]
  );

  console.log(aux);

  res.status(200).send(aux.rows);
});

/**
 * @openapi
 * /:
 *     post:
 *       description: Add homework to database. Will populate empty children's entries also. Will return the homework.
 *       requestBody:
 *        content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *               dateDue:
 *                type: string
 *               comment:
 *                type: string
 *             example:
 *               name: test name
 *               image: test homework image
 *               dateDue: test date due
 *               comment: test comment
 *       responses:
 *          201:
 *              description: Success - homework entry created and empty children's homework entries setup
 */
app.post("/", async (req: Request, res: Response) => {
  let homework = await pool.query(
    `INSERT INTO homework (Name, Image, Datedue, Comment) VALUES ($1,$2,$3,$4) RETURNING *;`,
    [req.body.name, req.body.image, req.body.dateDue, req.body.comment]
  );
  let children = await pool.query(`SELECT * FROM children;`);

  console.log(homework);
  console.log(children);

  for (let i = 0; i < children.length; i++) {
    await pool.query(
      `INSERT INTO childrensHomework (homeworkid, childid) VALUES ($1,$2);`,
      [homework.id, children[i].id]
    );
  }

  homework = homework.rows[0];

  res.status(201).send(homework);
});

/**
 * @openapi
 * /{homeworkId}/{childId}:
 *     put:
 *       description: Update a child's homework, and return the updated value
 *       parameters:
 *       - in: path
 *         description: id for the piece of homework
 *         name: homeworkId
 *         schema:
 *          type: integer
 *         required: true
 *         example: 1
 *       - in: path
 *         description: id for the piece of child's homework
 *         name: childId
 *         schema:
 *          type: integer
 *         example: 1
 *         required: true
 *       requestBody:
 *        content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                type: string
 *               comment:
 *                type: string
 *               annotation:
 *                type: string
 *             example:
 *               image: test homework image
 *               comment: test comment
 *               annotation: test annotation
 *       responses:
 *          200:
 *              description: Success - TODO
 */
app.put("/:homeworkId/:childId", async (req: Request, res: Response) => {
  let child = await pool.query(
    `UPDATE childrensHomework 
    SET image = $1, comment = $2, annotation = $3 
    WHERE homeworkid= $4 AND childid = $5 RETURNING *;`,
    [
      req.body.image,
      req.body.comment,
      req.body.annotation,
      req.params.homeworkId,
      req.params.childId,
    ]
  );

  res.status(200).send(child.rows[0]);
});

/**
 * @openapi
 * /{id}:
 *     delete:
 *       description: Delete single homework and associated childrens homework
 *       parameters:
 *       - in: path
 *         description: id for the piece of homework
 *         name: id
 *         schema:
 *          type: integer
 *         required: true
*       responses:
 *          204:
 *              description: Deletion successful
 */
app.delete("/:id", async (req: Request, res: Response) => {

  await pool.query(`DELETE FROM childrensHomework WHERE homeworkid=$1;`, [
    req.params.id,
  ]);

  await pool.query(`DELETE FROM homework WHERE id=$1;`, [req.params.id]);

  res.sendStatus(204);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
