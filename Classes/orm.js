const Connect = require("./Connection")
const Schemas = require("./Schema")
const Base = require("./basic")
class ORM extends Base{
    constructor(connection){
        super(new Connect(connection))
        this.schemas = new Map()
    }
    
    createSchema(elements){
        if(!this.connectionState) return "No SQL connection"
        if(this.schemas.get(elements.id)) return "Already Exists"
        let datas = Schemas.checkDatas(elements)
        if(datas.code !== 0) return datas.error
        let nouvSche = new Schemas(datas.schema, this._connection)
        this.schemas.set(elements.id, nouvSche)
        return nouvSche
    }

    deleteSchema(id){
        if(!this.connectionState) return "No SQL connection"
        if(!this.schemas.get(id)) return "Doesn't Exist"
        this.schemas.delete(id)
    }

    getSchema(id){
        if(!this.connectionState) return "No SQL connection"
        if(!this.schemas.get(id)) return "Doesn't Exist"
        return this.schemas.get(id)
    }
}

module.exports = ORM