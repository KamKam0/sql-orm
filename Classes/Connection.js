const Events = require("node:events")
class Connection extends Events{
    constructor(elements){
        super()
        this.state = false
        this.connection = null
        this.elements = elements
        this.deployed = this.create(elements)
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
        this.connection = co
        this.state = true
        return true
    }

    #retry(error){
        /*console.log(error)
        console.log(error.code)
        console.log(error.name)
        console.log(error.message)
        console.log(error.content)*/
        let fatal = ["PROTOCOL_CONNECTION_LOST", "ECONNRESET", "read ECONNRESET"]
        if(fatal.includes(error.code) || fatal.includes(error.message)){
            //console.log(26)
            this.destroy()
            //console.log(26)
            this.create(this.elements)
            //console.log(26)
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