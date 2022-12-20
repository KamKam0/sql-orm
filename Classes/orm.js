const Connect = require("./Connection")
const Schemas = require("./Schema")
const Base = require("./basic")
class ORM extends Base{
    constructor(connection){
        super(new Connect(connection))
        this.schemas = new Map()
    }
    
    createScheme(elements){
        if(!this.checkConnection()) return "No SQL connection"
        if(this.schemas.get(elements.id)) return "Already Exists"
        let datas = Schemas.checkDatas(elements)
        if(datas.code !== 0) return datas.error
        let nouvSche = new Schemas(datas.schema, this._connection)
        this.schemas.set(elements.id, nouvSche)
        return nouvSche
    }

    deleteScheme(id){
        if(!this.checkConnection()) return "No SQL connection"
        if(!this.schemas.get(id)) return "Doesn't Exist"
        this.schemas.delete(id)
    }

    getScheme(id){
        if(!this.checkConnection()) return "No SQL connection"
        if(!this.schemas.get(id)) return "Doesn't Exist"
        return this.schemas.get(id)
    }

    select(table, options){
        return this._treat(table, "select", options)
    }

    update(table, options1, options2){
        return this._treat(table, "update", options1, options2)
    }

    insert(table, options){
        return this._treat(table, "insert", options)
    }

    delete(table, options){
        return this._treat(table, "delete", options)
    }

    create(table, options){
        return this._treat(table, "create", options)
    }

    truncate(table){
        return this._treat(table, "truncate")
    }

    drop(table){
        return this._treat(table, "drop")
    }

    describe(table){
        return this._treat(table, "describe")
    }

    alterAdd(table, options){
        return this._treat(table, "alter_add", options)
    }

    alterModify(table, options){
        return this._treat(table, "alter_modify", options)
    }

    alterDrop(table, options){
        return this._treat(table, "alter_drop", options)
    }

    show(){
        return this._treat(null, "show")
    }
}

module.exports = ORM