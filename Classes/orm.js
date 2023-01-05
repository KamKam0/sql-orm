const Connect = require("./Connection")
const Schemas = require("./Schema")
const Base = require("./basic")
class ORM extends Base{
    constructor(connection){
        super(new Connect(connection))
        this.schemas = new Map()
    }
    
    /**
     * 
     * @param {object} elements 
     * @param {string} elements.id
     * @param {string} [elements.name]
     * @param {boolean} [elements.autoCreate]
     * @param {object[]} [elements.autoInsert]
     * @param {object[]} elements.columns
     * @returns {object[]|string}
     */
    createSchema(elements){
        if(!this.connectionState) return "No SQL connection"
        let datas = Schemas.checkDatas(elements)
        if(datas.code !== 0) return datas.error
        if(this.schemas.get(elements.id)) return "Already Exists"
        if([...this.schemas.values()].find(e => (e.name === elements.id || e.id === elements.id) || (e.name === elements.name || e.id === elements.name))) return "Already Exists with name"
        let nouvSche = new Schemas(datas.schema, this._connection)
        this.schemas.set(elements.id, nouvSche)
        return nouvSche
    }

    /**
     * 
     * @param {string} id 
     * @returns 
     */
    deleteSchema(id){
        if(!this.connectionState) return "No SQL connection"
        if(!this.schemas.get(id)) return "Doesn't Exist"
        this.schemas.delete(id)
    }

    /**
     * 
     * @param {string} id 
     * @returns {object[]|string}
     */
    getSchema(id){
        if(!this.connectionState) return "No SQL connection"
        if(!this.schemas.get(id)) return "Doesn't Exist"
        return this.schemas.get(id)
    }
}

module.exports = ORM