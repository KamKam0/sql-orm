const Base = require("./basic")
class Schema extends Base{
    #checked;
    constructor(elements, connection){
        super(connection)
        this.id = elements.id
        this.name = elements.name
        this.columns = elements.columns
        this.#checked = this.#deploy()
    }

    select(options){
        return this._treat(this.name, "select", options)
    }

    update(options1, options2){
        return this._treat(this.name, "update", options1, options2)
    }

    insert(options){
        return this._treat(this.name, "insert", options)
    }

    delete(options){
        return this._treat(this.name, "delete", options)
    }

    create(name){
        let colus = {}
        this.columns.forEach(col => colus[col.name] = col.value)
        return this._treat((name || this.name), "create", colus)
    }

    truncate(){
        return this._treat(this.name, "truncate")
    }

    drop(){
        return this._treat(this.name, "drop")
    }

    describe(){
        return this._treat(this.name, "describe")
    }

    alterAdd(options){
        return this._treat(this.name, "alter_add", options)
    }

    alterModify(options){
        return this._treat(this.name, "alter_modify", options)
    }

    alterDrop(options){
        return this._treat(this.name, "alter_drop", options)
    }

    show(){
        return this._treat(this.name, "show")
    }

    #deploy(){
        if(!this.connectionState) return "No SQL connection"
        this.show()
        .then(datas => {
            datas = datas.map(e => Object.values(e)[0])
            if(!datas.includes(this.name)) this.create().catch(err => {})
            else{
                this.describe()
                .then(datas2 => {
                    datas2 = datas2.map(e => {return {name: e.Field.toLowerCase(), value: e.Type.toLowerCase()}})
                    this.columns.filter(col => !datas2.find(e => col.name.toLowerCase() === e.name && col.value.toLowerCase() === e.value.toLowerCase())).forEach(col => {let e = {}; e[col.name] = col.value; this.alterAdd(e) })
                    datas2.filter(col => !this.columns.find(e => col.name.toLowerCase() === e.name && col.value.toLowerCase() === e.value.toLowerCase())).forEach(col => this.alterDrop(col))
                })
                .catch(err => {})
            }
        })
        .catch(err => {})
        return true
    }

    static checkDatas(datas){
        if(!datas) return {error: "No datas", code: 1}
        if(typeof datas !== "object") return {error: "Type of datas is not an object", code: 2}
        if(!datas.id) return {error: "No id in datas", code: 3}
        if(typeof datas.id !== "string") return {error: "Type of id is not a string", code: 4}
        if(!datas.name) return {error: "No name in datas", code: 5}
        if(typeof datas.name !== "string") return {error: "Type of name is not a string", code: 6}
        if(!datas.columns) return {error: "No columns in datas", code: 7}
        if(!Array.isArray(datas.columns)) return {error: "Type of columns is not an Array", code: 8}
        let def_cols = datas.columns.filter(column =>  column.name && column.value && typeof column.name === "string" && typeof column.value === "string" && column.value.toLowerCase().startsWith("varchar") || ["int", "date"].includes(column.value.toLowerCase()))
        if(def_cols.length === 0)  return {error: "No valid column registered", code: 9}
        return {schema: {id: datas.id, name: datas.name, columns: def_cols}, code: 0}
    }
}

module.exports = Schema