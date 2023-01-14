/**
 * 
 * @param {string} query 
 * @returns {boolean}
 */
module.exports = (query) => {
    if(typeof query !== "string") return true
    if(query.includes("'")) return false
    return true
}