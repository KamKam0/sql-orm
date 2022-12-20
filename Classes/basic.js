class Basic{
    constructor(connection){
        this._connection = connection
    }

    checkConnection(){
        return Boolean(this._connection.state)
    }

    _treat(table, argu, options1, options2){
        return new Promise((resolve, reject) => {
            if(!this.checkConnection()) return reject("No SQL connection")
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
        if(object1 && typeof object1 === "object" && Object.entries(object1).length > 0 && Object.entries(object1).filter(e => typeof e[1] === "string").length > 0){
            if(argu === "insert"){
                let text1 = []
                let text2 = []
                Object.entries(object1).filter(e => typeof e[1] === "string").forEach(ob => {
                    text1.push(ob[0])
                    text2.push(`'${ob[1]}'`)
                })
                object1 = {keys: `(${text1.join(", ")})`, values: `(${text2.join(", ")})`}
                console.log(object1)
            }else if(argu ===  "create" || argu ===  "alter_add"){
                let text = []
                Object.entries(object1).filter(e => typeof e[1] === "string").filter(da => da[1].toLowerCase().startsWith("varchar") || ["int", "date"].includes(da[1].toLowerCase())).forEach(ob => {
                    text.push(`${ob[0]} ${(!ob[1] || ob[1] == "") ? "VARCHAR(255)" : ob[1]}`)
                })
                text = text.join(", ")
                object1 = text
            }else if(argu === "alter_drop") object1 = Object.values(object1)[0]
            else{
                let text = []
                Object.entries(object1).filter(e => typeof e[1] === "string").forEach(ob => {
                    text.push(`${ob[0]} = '${ob[1]}'`)
                })
                text = text.join(" and ")
                object1 = text
            }
        }else object1 = undefined
        if(object2 && typeof object2 === "object" && Object.entries(object2).length > 0 && Object.entries(object2).filter(e => typeof e[1] === "string").length > 0){
            let text = []
            Object.entries(object2).filter(e => typeof e[1] === "string").forEach(ob => {
                text.push(`${ob[0]} = '${ob[1]}'`)
            })
            text = text.join(" and ")
            object2 = text
        }else object2 = undefined
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
                console.log(object1)
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
                final = `${argu.toUpperCase().split("_")[0]} TABLE ${table} ${argu.toUpperCase().split("_")[1]} ${object1}`
            break;
            default:
                return {error: "action is not valid", code: 6}
            break;
        }
        return {query: final, code: 0}
    }
}

module.exports = Basic