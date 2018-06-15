
const fs = require('fs')
const _path = require('path');
const babylon = require('babylon') //用于解析代码生产AST
const traverse = require('babel-traverse').default //用于遍历AST合成新的AST
const t = require('babel-types') //用于访问AST
const generate = require('babel-generator').default //用于AST生产代码
const babel = require('babel-core')

const prettifyXml = require('prettify-xml')

//数组合并，类似python zip
const zip = arrays => {
    let shortest = arrays.length == 0 ? [] : arrays.reduce((a, b) => a.length < b.length ? a : b);
    return shortest.map((_, i) => arrays.map(array => array[i]));
}

const parse = src => {
    const options = {
        babelrc: false,
        sourceType: 'module',
        plugins: ['jsx', 'objectRestSpread', 'classProperties'],
    }
    return babylon.parse(src, options)
}

const transform = ({ id, code, dependedModules = {}, referencedBy = [], sourcePath }) => {
    const Attrs = [] //收集class 下属性
    const Methods = [] //收集component组件下方法
    const ImportPages = []     //收集导入页面
    const ImportComponents = {} //收集导入组件
    const ImportTemplates = {} //收集导入模板
    const Properties = {} //收集组件属性/默认值
    const ComponentRelations = {} //收集组件关联
    const JSONAttrs = {} //收集json
    const ImportSources = []
    const output = { type: 'local_module' }

    const isTemplate = function () {
        return output.type === 'template'
    }
    const isComponent = function () {
        return output.type === 'component'
    }
    const isPage = function () {
        return output.type === 'page'
    }
    const isApp = function () {
        return output.type === 'app'
    }

    const visitJSX = {
        JSXOpeningElement(path) { //jsx标签转义
            //template标签转义
            if (ImportTemplates[path.node.name.name]) {
                const templateName = path.node.name.name
                path.node.name.name = 'template'
                //
                const templateData = path.node.attributes
                    .reduce((all, x) => {
                        if (x.type === 'JSXSpreadAttribute')
                            all.push(`...${x.argument.name}`)
                        else if (x.value.type === 'StringLiteral')
                            all.push(`${x.name.name}: '${x.value.value}'`)
                        else if (x.value.type === 'JSXExpressionContainer') {
                            const v = generate(x.value.expression).code
                            if (x.value.expression.type === 'Identifier' && v === x.name.name)
                                all.push(`${v}`)
                            else if (
                                x.value.expression.type === 'Identifier' &&
                                v !== x.name.name
                            ) {
                                return all // attribute MUST be defined
                            }
                            else all.push(`${x.name.name}: ${v}`)
                        }
                        return all
                    }, []).join(',')
                path.node.attributes = [
                    t.jSXAttribute(t.jSXIdentifier('is'), t.stringLiteral(templateName)),
                    t.jSXAttribute(
                        t.jSXIdentifier('data'),
                        t.stringLiteral(`{{${templateData}}}`)
                    ),
                ]
                path.node.selfClosing = false
                path.parent.closingElement = t.jSXClosingElement(
                    t.jSXIdentifier('template')
                )
            }
            //过滤条件标签
            if (path.node.name.name === 'if' || path.node.name.name === 'elif') {
                const result = path.node.attributes.find(x => x.name.name === 'condition')
                const condition = generate(result.value, { concise: true }).code; //提取条件中的condition
                const subResult = path.parent.children.find(x => x.type === 'JSXElement') //提取
                subResult.openingElement.attributes.unshift(('body', t.jSXAttribute(t.JSXIdentifier(`${path.node.name.name}`), t.StringLiteral(`{${condition}}`))))
                path.parent.openingElement = ''
            } else if (path.node.name.name === 'else') {
                const subResult = path.parent.children.find(x => x.type === 'JSXElement') //提取
                subResult.openingElement.attributes.unshift(('body', t.jSXAttribute(t.JSXIdentifier(`${path.node.name.name}`))))
                path.parent.openingElement = ''
            }
        },
        JSXClosingElement(path) {
            if (path.node.name.name === 'if' || path.node.name.name === 'elif') {
                path.parent.closingElement = ''
            } else if (path.node.name.name === 'else') {
                path.parent.openingElement = ''
            }
        },
        JSXExpressionContainer(path) { //jsx容器表达式转义
            if (path.node.expression.type === 'ConditionalExpression') { //条件表达式
                if (path.node.expression.consequent.type === 'JSXElement') {
                    const condition = generate(path.node.expression.test, { concise: true }).code;
                    path.node.expression.consequent.openingElement.attributes.unshift(('body', t.jSXAttribute(t.JSXIdentifier(`if`), t.StringLiteral(`{{${condition}}}`))))
                    path.node.expression.alternate.openingElement.attributes.unshift(('body', t.jSXAttribute(t.JSXIdentifier(`else`))))
                    path.replaceWithMultiple([
                        path.node.expression.consequent,
                        path.node.expression.alternate,
                    ])
                } else {
                    path.node.expression = t.identifier(
                        `{${generate(path.node.expression).code}}`
                    )
                }

            } else {
                path.node.expression = t.identifier(
                    `{${generate(path.node.expression).code}}`
                )
            }
        },
        JSXAttribute(path) {
            const { name, value } = path.node
            //属性key转义
            if (/if|elif|else|for|key|for-index|for-item/.test(name.name)) {
                path.node.name.name = `wx:${name.name}`
            } else if (/^on(\w*)$/.test(name.name)) {
                const nameNode = t.JSXIdentifier(name.name.replace(/^on(\w*)$/, 'bind:$1').toLowerCase())
                const valueNode = t.StringLiteral(value.expression.name)
                path.replaceWith(t.jSXAttribute(nameNode, valueNode))

            } else {
                path.node.name.name = name.name
            }
            //属性value转义
            if (value && !value.expression) return
            if (!value) {
                if (/else/.test(name.name)) return
                path.node.value = t.stringLiteral('{{true}}')
            } else if (t.isObjectExpression(value.expression)) {
                path.node.value = t.stringLiteral(`{${generate(value.expression, { concise: true }).code}}`)
            } else if (t.isTemplateLiteral(value.expression)) {
                //处理模板语法
                path.node.value = t.stringLiteral(
                    zip([
                        value.expression.quasis.map(x => x.value.raw),
                        value.expression.expressions.map(x => x.name)
                    ]).reduce((v, [raw, name]) => {
                        return !raw && !name ? v : name ? v + `${raw}{{${name}}}` : v + raw
                    }, '')
                )
            } else if (/^bind:(\w*)|^on(\w*)$/.test(name.name)) { //on bind事件字符串替换，替换后原on节点依旧存在，待优化
                path.node.value = t.stringLiteral(`${generate(value.expression).code}`)
            } else {
                path.node.value = t.stringLiteral(`{{${generate(value.expression).code}}}`)
            }
        }
    }

    const visitor = {
        CallExpression(path) { //调用表达式转义
            if (
                path.get('callee').isMemberExpression() &&
                path.node.callee.property.name === 'setState'
            ) {
                path.node.callee.property.name = 'setData'
            }

        },
        MemberExpression(path) { //state转义
            if (path.node.property.name === 'state') {
                console.log(path.node.property.name)
                path.node.property.name = 'data'
            }
        },
        ClassProperty(path) {
            //处理自定义组件默认值
            if (isComponent() && /defaultProps/.test(path.node.key.name)) {
                path.node.value.properties.forEach(property => {
                    const value = property.value
                    const key = property.key.name
                    Properties[key] = Properties[key] || {}
                    Properties[key].value = value
                })
            } else if (isComponent() && /propTypes/.test(path.node.key.name)) {
                path.node.value.properties.forEach(property => {
                    const value = property.value
                    const key = property.key.name
                    Properties[key] = Properties[key] || {}
                    if (value.object.name === 'PropTypes') {
                        const type = propTypes[value.property.name]
                        if (!type) return
                        Properties[key].type = t.identifier(type)
                    }
                })
            } else if (isApp()) { //app页转义类属性
                Attrs.push(
                    t.objectProperty(t.identifier(path.node.key.name), path.node.value)
                )
            }
        },
        ClassMethod: { //属性方法访问器转义
            enter(path) {
                const methodName = path.node.key.name

                if (methodName === 'render') {
                    if (path.node.body.body.length > 1) {
                        console.error('render 方法只能 return !')
                    }
                    return
                }
            },
            exit(path) {
                const methodName = path.node.key.name
                if (methodName === 'render') {
                    const result = path.node.body.body.find(
                        x => x.type === 'ReturnStatement'
                    )
                    if (!result) return
                    if (result.argument.type === 'JSXElement') {
                        const code = generate(result.argument, { concise: true }).code.replace(/\n(\n)*( )*(\n)*\n/g, "\n")
                        output.wxml = prettifyXml(code, { indent: 4 })
                        path.remove()
                    }
                } else if (methodName === 'constructor') {
                    const data = path.node.body.body.find(
                        x => x.expression.left && x.expression.left.property.name === 'data'
                    )
                    Attrs.push(t.objectProperty(t.identifier('data'), data.expression.right))
                } else if (/created|attached|ready|moved|detached/.test(methodName)) { //自定义组件生命周期
                    if (!isComponent()) return
                    const fn = t.objectProperty(
                        t.identifier(methodName),
                        t.functionExpression(null, path.node.params, path.node.body, path.node.generator, path.node.async)
                    )
                    Attrs.push(fn)
                } else if (isComponent()) { //自定义组件方法
                    const fn = t.objectProperty(
                        t.identifier(methodName),
                        t.functionExpression(null, path.node.params, path.node.body, path.node.generator, path.node.async)
                    )
                    Methods.push(fn)
                } else {
                    const fn = t.objectProperty(
                        t.identifier(methodName),
                        t.functionExpression(null, path.node.params, path.node.body, path.node.generator, path.node.async)
                    )
                    Attrs.push(fn)
                }
            }
        },
        ExportDefaultDeclaration: { //导出表达式转义
            enter(path) {
                const { node: { declaration } } = path
                const { superClass } = declaration
                //标识template
                if (t.isFunctionDeclaration(declaration) || t.isArrowFunctionExpression(declaration)) {
                    const returned = declaration.body.body.find(t.isReturnStatement)
                    if (!returned) return
                    if (t.isJSXElement(returned.argument)) {
                        output.type = 'template'
                    }
                }
                //标识页面类型
                if (superClass && /App|Page|Component/.test(superClass.name)) {
                    output.type = superClass.name.toLowerCase()
                }
            },
            exit(path) {
                const { node: { declaration } } = path
                const { superClass } = declaration
                //替换templete
                if (isTemplate()) {
                    const returned = declaration.body.body.find(t.isReturnStatement)
                    if (declaration.id) output.name = declaration.id.name
                    output.wxml = prettifyXml(
                        `<template name="${output.name}">\n ${
                        generate(returned.argument, { concise: true }).code
                        } \n</template>`,
                        { indent: 2 }
                    )
                    path.remove()
                }

                if (isComponent()) {
                    const objProps = []
                    referencedBy.forEach(function (referencedId) {
                        const { dir, name } = _path.parse(referencedId)
                        const componentPath = _path.format({ dir, name }).split('\\').join('/')
                        ComponentRelations[componentPath] = { type: 'parent' }
                    })

                    Object.keys(ComponentRelations).forEach(key => {
                        if (/pages/.test(key)) return
                        const { name } = _path.parse(key)
                        const componentPath = _path.format({ dir: key, name })
                        objProps.push(
                            t.objectProperty(
                                t.stringLiteral(componentPath),
                                t.objectExpression([
                                    t.objectProperty(
                                        t.identifier('type'),
                                        t.stringLiteral(ComponentRelations[key].type)
                                    ),
                                ])
                            )
                        )
                    })
                    objProps.length && Attrs.push(
                        t.objectProperty(
                            t.identifier('relations'),
                            t.objectExpression(objProps)
                        )
                    )
                }

                const componentProperties = []
                Object.keys(Properties).forEach(key => {
                    const { type, value } = Properties[key]
                    const property = []
                    property.push(t.objectProperty(t.identifier('type'), type))
                    value && property.push(t.objectProperty(t.identifier('value'), value))

                    componentProperties.push(
                        t.objectProperty(t.identifier(key), t.objectExpression(property))
                    )
                })

                if (Methods.length) {
                    Attrs.push(t.objectProperty(t.identifier('methods'), t.objectExpression(Methods)))
                }

                if (componentProperties.length) {
                    Attrs.push(t.objectProperty(t.identifier('properties'), t.objectExpression(componentProperties)))
                }

                //替换super结构体
                if (superClass && /App|Page|Component/.test(superClass.name)) {
                    path.replaceWith(
                        t.CallExpression(t.identifier(superClass.name), [
                            t.objectExpression(Attrs)
                        ])
                    )
                }
            }
        },
        ImportDeclaration(path) { //引入表达式转义
            const source = path.node.source.value
            let moduleName = path.node.specifiers.length ? path.node.specifiers[0].local.name : ''
            let typedModule
            if (id) {
                const { dir } = _path.parse(id)
                let dependedModuleId = _path.resolve(dir, source).split('\\').join('/');
                typedModule = dependedModules[dependedModuleId]
            } else {
                typedModule = dependedModules[source]
            }
            if (typedModule) {
                switch (typedModule.type) {
                    case 'template': {
                        const { dir, name } = _path.parse(source)
                        const modulePath = _path.join('..', dir, `${name}.wxml`)
                        ImportTemplates[moduleName] = modulePath
                        path.remove()
                        break
                    }
                    case 'page': {
                        const { dir, name } = _path.parse(source)
                        const pagePath = _path.join(dir.replace(`.${_path.sep}`, ''), name)
                        ImportPages.push(pagePath)
                        path.remove()
                        break
                    }
                    case 'component': {
                        const { dir, name } = _path.parse(source)
                        const componentPath = _path.format({ dir, name })
                        const modulePath = _path.join('..', componentPath)
                        ImportComponents[moduleName] = modulePath
                        ComponentRelations[_path.join('..', componentPath)] = { type: 'child' }
                        path.remove()
                        break
                    }
                }
            }
            if (/base/.test(source)) {
                path.remove()
            }

        }
    }
    //代码转换为AST语法树
    try {
        const AST = parse(code); //构建AST
        traverse(AST, Object.assign({}, visitor, visitJSX)) //生成新AST

        if (Object.keys(ImportTemplates).length) {
            output.wxml = Object.entries(ImportTemplates).map(([, src]) => `<import src="${src.split('\\').join('/')}" />\n`).join('') + output.wxml
        }

        output.js = isTemplate() //新AST=>代码
            ? null
            : babel.transform(generate(AST).code, {
                babelrc: false,
                plugins: [
                    "transform-class-properties", "transform-object-rest-spread", "transform-es2015-modules-commonjs"
                ],
            }).code.replace("'use strict';\n\n", '')
        return output
    } catch (e) {
        console.error(e);
    }
}

module.exports = transform