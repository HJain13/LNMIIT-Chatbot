/* ============= Answer Bank Builder ============= */

module.exports = {
    build : function(namedEntities, query) {
        let answerBank = new Set();
        let queryNER = query;
        for (let group in namedEntities) {
            for (let namedEntity in namedEntities[group]) {
                if (query.search(namedEntity) != -1) {
                    answerBank.add(namedEntities[group][namedEntity]);
                    queryNER = queryNER.replace(new RegExp(namedEntity,"g"),"")
                }
            }
        }
        answerBank = Array.from(answerBank);
        return { answerBank, queryNER };
    }
};