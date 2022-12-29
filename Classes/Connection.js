const Events = require("node:events")
class Connection extends Events{
    constructor(elements){
        super()
        this.connection = this.create(elements)
        this.state = "false"
    }

    create(elements){
        const mysql = require("mysql2")
        let co =  mysql.createConnection(elements)
        this.#checkError(co)
        co.on("error", error => {
            if(error.code === "PROTOCOL_CONNECTION_LOST" || error.message === "PROTOCOL_CONNECTION_LOST"){
                this.state = "false"
                this.destroy()
                this.connection = this.create(elements)
            }
            else this.emit("ERROR", error)
            console.log(error)
        })
        co.on("close", () => {
            this.emit("CLOSE")
            console.log("SQL CLOSED")
        })
        this.state = "true"
        return co
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
        this.state = "false"
        this.connection.end()
    }

    destroy(){
        this.state = "false"
        this.connection.destroy()
    }
}

module.exports = Connection