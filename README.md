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
ORM.createSchema({id: "ID", name: "NAME", autoCreate: false/true, columns: [{COLUMN_NAME: "VARCHAR(100)/INT/DATE"}, {COLUMN_TWO_NAME: "VARCHAR(100)/INT/DATE"}], autoInsert: [{COLUMN_NAME: "VALUE", COLUMN_TWO_NAME: "VALUE"}, {COLUMN_NAME: "VALUE", COLUMN_TWO_NAME: "VALUE"}]})
```

id
- Mandatory
- Type: String
- With what you will be able to retrieve this schema to interact with it

name
- Not mandatory
- Type: String
- Used to name the sql table if the module has to create it (if there is no name, the id will be used)

autoCreate
- Not mandatory
- Type: Boolean
- Tells the module wether or not to create the table if it doesn't not exist.

columns
- Mandatory
- Array
- Here, you specify each column of the table and its associated value

autoInsert
- Not mandatory
- Array
- Here, you specify what the module should insert in the table if it doesn't contains it


### Use the schema
The schema has the same functionnalities as the basic ORM. 
You just don't have to specify the table.
(The table has to be created)

```js
let test = 
ORM.createSchema({id: "ID", name: "NAME", autoCreate: false/true, columns: [{COLUMN_NAME: "VARCHAR(100)/INT/DATE"}, {COLUMN_TWO_NAME: "VARCHAR(100)/INT/DATE"}], autoInsert: [{COLUMN_NAME: "VALUE", COLUMN_TWO_NAME: "VALUE"}, {COLUMN_NAME: "VALUE", COLUMN_TWO_NAME: "VALUE"}]})
test.select({"COLUMN NAME": "VALUE"})
//Exemple: test.select({"ID": "54212154"})
```

### Create the schema
Another way to create a schema without the autoCreate is the create method.
If you gave an id/name and you want it to be the name of your table don't touch anything.
You can also specify a new name to give to the table.

```js
    test.create()
    //OR
    test.create("NEW_NAME")
```

### Get/Delete Schema

```js
    ORM.deleteSchema("ID")
    ORM.getSchema("ID")
```

### General Use
All the SQL methods are available for use.

```js
ORM.select("TABLE NAME", {"COLUMN NAME": "VALUE"})
//Exemple: ORM.select("login", {"ID": "54212154"})
```