# Setup

npm must be installed first.

Enter this following command (in this directory):

`npm i`

# Running

`npm run start`

or for development (watches code changes with Nodemon):

`npm run dev`

# Database info

Setup your database. Instructions on how to set it up, the schema,  and sample starting data is provided in the `./sql/.` folder.

Create your own `.env` file in this directory with details for the Postg

```
HOST=<yourvalue>
USER=<yourvalue>
DATABASE=<yourvalue>
PASSWORD=<yourvalue>
PORT=<yourvalue>
```

I have used a free tier of ElephantSQL ourselves. If you also choose to use this service here are some tips on getting the correct data:
HOST=<server url>
DATABASE=<default database, same value as user>
PORT=5432

On the ElephantSQL portal you can easily use the "BROWSER" to setup your database (and query it directly) .