const path = require('path');
function buildBundle(bundle) {
    const modules = {}
    const referenced = {}
    bundle.modules.forEach(({ id, dependencies, originalCode, resolvedIds }) => {
        dependencies.forEach(refId => {
            if (!Array.isArray(referenced[refId])) {
                referenced[refId] = []
            }
            referenced[refId].push(path.relative(refId, id))
        })

        modules[id] = {
            id, //id标识
            code: originalCode, //源代码
            depended: dependencies, //引用源
            referenced: referenced //被引用
        }
    })
    console.log(modules)
}

module.exports = buildBundle;