const Events = require("node:events")
class Connection extends Events{
    constructor(elements){
        super()
        this.connection = this.create(elements)
        this.state = false
    }

    create(elements){
        const mysql = require("mysql2")
        let co =  mysql.createConnection(elements)
        this.#checkError(co)
        co.addListener("error", this.#retry)
        co.once("close", () => {
            this.emit("CLOSE")
            console.log("SQL CLOSED")
        })
        this.state = true
        return co
    }

    #retry(error){
        console.log(error)
        console.log(error.code)
        console.log(error.name)
        console.log(error.message)
        console.log(error.content)
        if(error.code === "PROTOCOL_CONNECTION_LOST" || error.message === "PROTOCOL_CONNECTION_LOST"){
            console.log(26)
            this.destroy()
            console.log(26)
            this.connection.removeListener("error", this.#retry)
            console.log(26)
            this.connection = this.create(elements)
            console.log(26)
        }
        else this.emit("ERROR", error)
    }

    #checkError(connection){
        connection.query("SHOW TABLES", function(err, result){
            if(err?.code === "ECONNREFUSED"){
                console.log("Pas de connection à une base sql !")
                process.exit()
            }
            else if(err?.code === "ER_BAD_DB_ERROR"){
                console.log("Aucune base de données présente")
                process.exit()
            }
            else if(err){
                console.log(err)
                process.exit()
            }

        })
    }

    end(){
        this.state = false
        this.connection.end()
    }

    destroy(){
        this.state = false
        this.connection.destroy()
    }
}

module.exports = Connection