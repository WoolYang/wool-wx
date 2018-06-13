const fs = require('fs')
const path = require('path');
const mkdirp = require('mkdirp'); //创建中间层级文件夹

const transform = require('./transform-wx.js');

function buildBundle(bundle) {
    //重新转换bundle
    const modules = {}
    const referenced = {}
    const mainId = bundle.modules[bundle.modules.length - 1].id
    const transformedModules = {}
    const src = path.join('./src')
    const target = path.join('./dist')

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
            resolvedIds: resolvedIds //被引用源
        }
    })
    //生成新的bundle
    generator(mainId, modules, transformedModules, { target, src }, referenced)
    //console.log(transformedModules)
}

function generator(id, modules, transformedModules, paths, referenced) {
    //console.log(id)
    const { depended, code } = modules[id] //主bundle code 依赖
    if (depended.length) {
        depended.reduce((transformedModules, id) => generator(id, modules, transformedModules, paths, referenced), transformedModules) //递归处理主模块依赖模块
        if (!transformedModules[id]) {
            const dependedModules = depended.reduce((dependedModules, dependedId) => (dependedModules[dependedId] = transformedModules[dependedId]) && dependedModules, {})
            transformedModules[id] = Object.assign({ id }, transform({ id, code, dependedModules, referencedBy: referenced[id], sourcePath: paths.src }))
            writeOutput(transformedModules[id], paths)
        }
    } else {
        if (!transformedModules[id]) {
            transformedModules[id] = Object.assign({ id }, transform({ id, code, referencedBy: referenced[id], sourcePath: paths.src }))
            writeOutput(transformedModules[id], paths)
        }
    }
    return transformedModules
}

function writeOutput(output, paths) {
    try {
        const { id, type, js } = output //输出内容
        const { target, src } = paths //目标，源路径
        const { name, dir } = path.parse(path.join(target, path.relative(src, id))) // 路径对接

        if (type) {
            if (!fs.existsSync(dir)) mkdirp.sync(dir) //构建目录
            Object.entries(output).forEach(function ([fileSuffix, data]) {
                if (data && /json|js|wxml|wxss|css/.test(fileSuffix)) {
                    const filePath = path.join(dir, `${name}.${fileSuffix}`)
                    fs.writeFileSync(filePath, data) //输出文件
                }
            })
        } else {
            //error(id, js)
        }
    } catch (e) {
        console.log(e)
    }
}

module.exports = buildBundle;