Backend (NodeJS with TypeScript) to the HomeWorked, frontend found here: <https://github.com/ParadigmZero/HomeWorkedFrontend>

This is a re-working of the original C# .NET Core project, it is designed to do exactly the same thing:
<https://github.com/ParadigmZero/HomeWorkedBackend>

Plus some added quality of life features for developers.

# Setup

Node/npm must be installed first.

(
Optional: recommended to have Node Version Manager installed, so you can run the following step:
`nvm use`
)

Install all the necessary packages (from project root directory)

`npm i`

# Running

`npm run start`

or for development (watches code changes with Nodemon):

`npm run dev`

By default it will accessible at:

<http://localhost:7012>

# API docs/testing

API docs will be at:

`<HOST>/api`

# Database info

## Local Docker database setup

A local PostgreSQL database and sample data can be spun up with Docker. You will need Docker installed.

Spin up database container and entry sample data (see `./db/dump.sql`):

`npm run dbup`

Spin-down database container:

`npm run dbdown`

## Setting up environmental variables for another database source

If using the local Docker database you do not need to do anything extra, as the connection info is contained in the `.env.defaults` file. If you are using another source, create a `.env` file and over-ride the defaults as needed (use `.env.defaults` as your guide).


## Tips for setting up your database from another source

If you want to setup your database in another way, see `./db/dump.sql` for assistance on making the correct tables within your database.

I have used a free tier of ElephantSQL for deployment. If you also choose to use this service here are some tips on getting the correct data:

HOST=<server url>
DATABASE=<default database, same value as user>
PORT=5432

On the ElephantSQL portal you can easily use the "BROWSER" to setup your database (and query it directly) .