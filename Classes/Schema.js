const Base = require("./basic")
class Schema extends Base{
    #checked;
    constructor(elements, connection){
        super(connection)
        this.id = elements.id
        this.name = elements.name || elements.id
        this.columns = elements.columns
        this.autoCreate = elements.autoCreate || false
        this.autoInsert = elements.autoInsert || []
        this.#checked = this.#deploy()
    }

    #deploy(){
        if(!this.connectionState) return "No SQL connection"
        this.show()
        .then(datas => {
            if(!datas.includes(this.name)) this.autoCreate ? (this.create().then(() => this.autoInsert[0] ? this.autoInsert.forEach(insert => this.select(insert).then(e => e[0] ?? this.insert(insert)) ) : "")) : ""
            else{
                this.describe()
                .then(datas2 => {
                    datas2 = datas2.map(e => {return {name: e.Field, value: e.Type}})
                    let comparecolumns = this.columns.map(e => {return {name: Object.keys(e)[0], value: Object.values(e)[0]}})
                    comparecolumns.filter(col => datas2.find(e => col.name.toLowerCase() === e.name.toLowerCase() && col.name !== e.name)).forEach(col => this.alterModify({statment: "name", modif: [datas2.find(e => col.name.toLowerCase() === e.name.toLowerCase() && col.name !== e.name).name, col.name, col.value]}))
                    comparecolumns.filter(col => datas2.find(e => col.name === e.name && col.value !== e.value)).forEach(col => this.alterModify({statment: "value", modif: [col.name, col.value]}))
                    comparecolumns.filter(col => !datas2.find(e => col.name.toLowerCase() === e.name.toLowerCase())).forEach(col => this.alterAdd(this.columns.find(e => Object.keys(e)[0] === col.name)))
                    datas2.filter(col => !comparecolumns.find(e => col.name.toLowerCase() === e.name.toLowerCase())).forEach(col => this.alterDrop(col))
                    if(this.autoInsert[0]) this.autoInsert.forEach(insert => this.select(insert).then(e => e[0] ?? this.insert(insert)) )
                })
                .catch(err => {})
            }
        })
        .catch(err => {})
        return true
    }

    /**
     * 
     * @returns {object}
     */
    columnsToJSON(){
        return this.columns.map(e => {return {name: Object.keys(e)[0], value: Object.values(e)[0]}})
    }

    /**
     * 
     * @param {object} elements 
     * @param {string} elements.id
     * @param {string} [elements.name]
     * @param {boolean} [elements.autoCreate]
     * @param {object[]} [elements.autoInsert]
     * @param {object[]} elements.columns
     * @returns {object[]}
     */
    static checkDatas(datas){
        if(!datas) return {error: "No datas", code: 1}
        if(typeof datas !== "object") return {error: "Type of datas is not an object", code: 2}
        if(!datas.id) return {error: "No id in datas", code: 3}
        if(typeof datas.id !== "string") return {error: "Type of id is not a string", code: 4}
        if(datas.name && typeof datas.name !== "string") return {error: "Type of name is not a string", code: 6}
        if(!datas.columns) return {error: "No columns in datas", code: 7}
        if(!Array.isArray(datas.columns)) return {error: "Type of columns is not an Array", code: 8}
        if(!datas.columns[0]) return {error: "Columns array must contain at least one object", code: 11}
        let def_cols = datas.columns.filter(column => typeof column === "object" && Object.keys(column)[0] && Object.values(column)[0] && typeof Object.keys(column)[0] === "string" && typeof Object.values(column)[0] === "string" && Object.values(column)[0].toLowerCase().startsWith("varchar") || ["int", "date"].includes(Object.values(column)[0].toLowerCase()))
        if(def_cols.length === 0)  return {error: "No valid column registered", code: 9}
        if(!datas.columns[0]) return {error: "Columns array must contain at least one object", code: 11}
        if(datas.autoInsert && !Array.isArray(datas.autoInsert)) return {error: "Type of autoInsert is not an Array", code: 8}
        if(datas.autoInsert && !datas.autoInsert[0]) return {error: "Columns array must contain at least one object", code: 11}
        let def_insert = datas.autoInsert ? datas.autoInsert.filter(insert => typeof insert === "object" && Object.values(insert).filter(ins => typeof ins === "string").length === Object.values(insert).length) : []
        if(datas.autoInsert && def_insert.length === 0)  return {error: "No valid insert registered", code: 9}
        if(datas.autoCreate && typeof datas.autoCreate !== "boolean") return {error: "Type of autoCreate is not boolean", code: 10}
        return {schema: {id: datas.id, name: datas.name, autoCreate: datas.autoCreate, columns: def_cols, autoInsert: def_insert}, code: 0}
    }
}

module.exports = Schema