# SQL-ORM
SQL-ORM is a module that allows you to interact very simply with your database


## Installation
```js
npm install @kamkam1_0/sql-orm
```

## Functionalities
- Create schemas
- Make requests to your database easily

## How to use

### Required infos

```js
const SQLORM = require("@kamkam1_0/sql-orm")
let ORM = new ORM({
    host: "127.0.0.1",
    user: "root",
    port: 3306,
    database: "NAME OF DATABASE"
})
```

### Create a schema
Schemas allow you to create a pattern that you can create at any moment with a different name. 
It automatically create the missing columns, delete the ones not in your schema and update the others if needed.

```js
ORM.createSchema({id: "ID", name: "NAME", autoCreate: false/true, columns: [{COLUMN_NAME: "VARCHAR(100)/INT/DATE"}]})
```

autoCreate tells the module wether or not to create the table if it doesn't not exists

### Use the schema
The schema has the same functionnalities as the basic ORM. 
You just don't have to specify the table.
(The table has to be created)

```js
let test = ORM.createSchema({id: "ID", name: "NAME", autoCreate: false/true, columns: [{COLUMN_NAME: "VARCHAR(100)/INT/DATE"}]})
test.select({"COLUMN NAME": "VALUE"})
//Exemple: test.select({"ID": "54212154"})
```

### General Use
All the SQL methods are available for use.

```js
ORM.select("TABLE NAME", {"COLUMN NAME": "VALUE"})
//Exemple: ORM.select("login", {"ID": "54212154"})
```