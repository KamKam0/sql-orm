class Basic{
    constructor(connection){
        this._connection = connection
    }

    get connectionState(){
        return this._connection.state
    }
    
    select(table, options){
        return this.#treat((this.name || table), "select", (this.name ? table : options))
    }

    update(table, options1, options2){
        return this.#treat((this.name || table), "update", (this.name ? table : options1), (this.name ? options1 : options2))
    }

    insert(table, options){
        return this.#treat((this.name || table), "insert", (this.name ? table : options))
    }

    delete(table, options){
        return this.#treat((this.name || table), "delete", (this.name ? table : options))
    }

    create(table, options){
        if(this.id){
            let cols = {}
            this.columns.forEach(col => cols[Object.keys(col)[0]] = Object.values(col)[0])
            return this.#treat((table|| this.name), "create", cols)
        }
        return this.#treat((this.name || table), "create", (this.name ? table : options))
    }

    truncate(table){
        return this.#treat((this.name || table), "truncate")
    }

    drop(table){
        return this.#treat((this.name || table), "drop")
    }

    describe(table){
        return this.#treat((this.name || table), "describe")
    }

    alterAdd(table, options){
        return this.#treat((this.name || table), "alter_add", (this.name ? table : options))
    }

    alterModify(table, options){
        return this.#treat((this.name || table), "alter_modify", (this.name ? table : options))
    }

    alterDrop(table, options){
        return this.#treat((this.name || table), "alter_drop", (this.name ? table : options))
    }

    show(){
        return this.#treat(null, "show")
    }

    #treat(table, argu, options1, options2){
        return new Promise((resolve, reject) => {
            if(!this.connectionState) return reject("No SQL connection")
            let query = Basic.getQuery(table, argu, options1, options2)
            if(query.code !== 0) return reject(query.error)
            this.query(query.query)
            .then(datas => resolve(datas))
            .catch(datas =>  reject(datas))
        })
    }

    async query(query){
        return new Promise((resolve, reject) => {
            this._connection.connection.query(query, function(err, data){
                if(err) return reject(err)
                return resolve(data)
            })
        })
    }

    static getQuery(table, argu, object1, object2){
        if(!table && argu !== "show") return {error: "No table", code: 2}
        if(typeof table !== "string" && argu !== "show") return {error: "Table is not a string", code: 3}
        if(!argu) return {error: "No action", code: 4}
        if(typeof argu !== "string") return {error: "action is not a string", code: 5}

        argu = argu.toLowerCase()
        object1 = check(object1, argu)
        object2 = check(object2, argu)

        if(object1){
            let text = []
            let join;
            switch(argu){
                case("insert"):
                    let text2 = []
                    object1.forEach(ob => {
                        text.push(ob[0])
                        text2.push(`'${ob[1]}'`)
                    })
                    text = {keys: `(${text.join(", ")})`, values: `(${text2.join(", ")})`}
                break;
                case("create"):
                    object1.filter(da => da[1].toLowerCase().startsWith("varchar") || ["int", "date"].includes(da[1].toLowerCase())).forEach(ob =>  text.push(`${ob[0]} ${(!ob[1] || ob[1] == "") ? "VARCHAR(255)" : ob[1]}`) )
                    join = ", "
                break;
                case("alter_add"):
                    object1.filter(da => da[1].toLowerCase().startsWith("varchar") || ["int", "date"].includes(da[1].toLowerCase())).forEach(ob =>  text.push(`${ob[0]} ${(!ob[1] || ob[1] == "") ? "VARCHAR(255)" : ob[1]}`) )
                    join = ", "
                break;
                case("alter_modify"):
                    if(object1.statment === "name") object1.modif = `${object1.modif[0]} ${object1.modif[1]} ${object1.modif[2]}`
                    if(object1.statment === "value") object1.modif = `${object1.modif[0]} ${object1.modif[1]};`
                    if(object1.statment === "value") object1.statment = " MODIFY COLUMN "
                    if(object1.statment === "name") object1.statment = " CHANGE "
                    text = object1
                break;
                case("alter_drop"):
                    text = Object.values(object1)[0]
                break;
                default:
                    object1.forEach(ob => text.push(`${ob[0]} = '${ob[1]}'`) )
                    if(argu === "update") join = ",  "
                    else join = " and "
                break;
            }
            if(join) object1 = text.join(join)
            else object1 = text
        }

        if(object2){
            let text = []
            object2.forEach(ob => text.push(`${ob[0]} = '${ob[1]}'`) )
            object2 = text.join(" and ")
        }

        let final;
        switch(argu){
            case("select"):
                final = `${argu.toUpperCase()} * FROM ${table}${object1 ? " WHERE "+object1 : ""}`
            break;
            case("update"):
                if(!object1) return {error: `Set object is needed for ${argu} argument`, code: 7}
                final = `${argu.toUpperCase()} ${table}${" SET "+object1 + " "}${object2 ? " WHERE "+object2 : ""}`
            break;
            case("insert"):
                if(!object1) return {error: `Values object is needed for ${argu} argument`, code: 8}
                final = `${argu.toUpperCase()} INTO ${table}${" "+object1.keys} VALUES ${object1.values}`
            break;
            case("delete"):
                if(!object1) return {error: `Where object is needed for ${argu} argument`, code: 9}
                final = `${argu.toUpperCase()} FROM ${table}${object1 ? " WHERE "+object1.replaceAll("null", null) : ""}`
            break;
            case("truncate"):
                final = `${argu.toUpperCase()} ${table}`
            break;
            case("drop"):
                final = `${argu.toUpperCase()} TABLE ${table}`
            break;
            case("create"):
                if(!object1) return {error: `Values object is needed for ${argu} argument`, code: 9}
                final = `${argu.toUpperCase()} TABLE ${table} (${object1})`
            break;
            case("show"):
                final = `${argu.toUpperCase()} TABLES`
            break;
            case("describe"):
                final = `${argu.toUpperCase()} ${table}`
            break;
            case("alter_add"):
                if(!object1) return {error: `Values object is needed for ${argu} argument`, code: 9}
                final = `${argu.toUpperCase().split("_")[0]} TABLE ${table} ${argu.toUpperCase().split("_")[1]} ${object1}`
            break;
            case("alter_drop"):
                if(!object1) return {error: `Values object is needed for ${argu} argument`, code: 9}
                final = `${argu.toUpperCase().split("_")[0]} TABLE ${table} ${argu.toUpperCase().split("_")[1]} ${object1}`
            break;
            case("alter_modify"):
                if(!object1) return {error: `Values object is needed for ${argu} argument`, code: 9}
                final = `${argu.toUpperCase().split("_")[0]} TABLE ${table}${object1.statment}${object1.modif}`
            break;
            default:
                return {error: "action is not valid", code: 6}
            break;
        }
        return {query: final, code: 0}
    }
}

function check(object, argu){
    if(argu === "alter_modify"){
        if(object && typeof object === "object") return object
        return null
    }
    if(argu === "alter_drop"){
        if(object) return object
        return null
    }
    const verif = require("../injections")
    if(object && typeof object === "object"){
        object = Object.entries(object)
        if(object.length > 0 && object.filter(e => (["string", "boolean", "number"].includes(typeof e[1]) || e[1] === null) && verif(e[1]).length === object.length)) return object
    } 
    return null
}

module.exports = Basic