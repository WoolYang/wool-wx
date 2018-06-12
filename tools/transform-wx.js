
const fs = require('fs')
const path = require('path');
const babylon = require('babylon') //用于解析代码生产AST
const traverse = require('babel-traverse').default //用于遍历AST合成新的AST
const t = require('babel-types') //用于访问AST
const generate = require('babel-generator').default //用于AST生产代码
const babel = require('babel-core')

const prettifyXml = require('prettify-xml')

const parse = src => {
    const options = {
        babelrc: false,
        sourceType: 'module',
        plugins: ['jsx', 'objectRestSpread', 'classProperties'],
    }
    return babylon.parse(src, options)
}

const transform = ({ id, code, dependedModules = {}, referencedBy = [], sourcePath }) => {
    //console.log(id)
    const Attrs = []
    const Methods = []
    const Properties = {}
    const ImportPages = []
    const ImportComponents = {}
    const ImportTemplates = {}
    const ImportSources = []
    const ComponentRelations = {}
    const JSONAttrs = {}
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
            if (ImportTemplates[path.node.name.name]) {
                const templateName = path.node.name.name
                path.node.name.name = 'template'

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
                    }, [])
                    .join(', ') //?

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
        },
        JSXExpressionContainer(path) { //jsx容器表达式转义
            path.node.expression = t.identifier(
                `{${generate(path.node.expression).code}}`
            )
        },
        JSXAttribute(path) {
            const { name, value } = path.node
            console.log(path.node.name.name)
            path.node.name.name = /if|elif|else|for|key|for-index|for-item/.test(name.name)
                ? `wx:${name.name}`
                : /^on(\w*)$/.test(name.name)
                    ? name.name.replace(/^on(\w*)$/, 'bind$1').toLowerCase()
                    : name.name
            if (value && !value.expression) return
            if (!value) {
                if (/else/.test(name.name)) return
                path.node.value = t.stringLiteral('{{true}}')
            } else if (t.isTemplateLiteral(value.expression)) {
                path.node.value = t.stringLiteral(
                    zip(
                        value.expression.quasis.map(x => x.value.raw),
                        value.expression.expressions.map(x => x.name)
                    ).reduce((v, [raw, name]) => {
                        return !raw && !name ? v : name ? v + `${raw}{{${name}}}` : v + raw
                    }, '')
                )
            } else if (t.isObjectExpression(value.expression)) {
                const newValue = generate(value.expression, { concise: true }).code
                path.node.value = t.stringLiteral(`{${newValue}}`)
            } else if (/^bind/.test(path.node.name.name)) {
                const newValue = generate(value.expression).code
                path.node.value = t.stringLiteral(newValue.replace('this.', ''))
            } else {
                const newValue = generate(value.expression).code
                path.node.value = t.stringLiteral(`{{${newValue}}}`)
            }
        }
    }

    const visitor = {
        CallExpression(path) { //调用表达式转义
            if (
                t.isMemberExpression(path.node.callee) &&
                path.node.callee.property.name === 'setState'
            ) {
                path.node.callee.property.name = 'setData'
            }
        },
        ClassMethod: { //属性方法访问器
            enter(path) {
                const methodName = path.node.key.name

                if (methodName === 'render') {
                    if (path.node.body.body.length > 1) {
                        console.error('render 方法只能 return !')
                    }
                    return
                } else if (/created|attached|ready|moved|detached/.test(methodName)) {

                    if (!isComponent()) return
                    const fn = t.objectProperty(
                        t.identifier(methodName),
                        t.functionExpression(null, path.node.params, path.node.body, path.node.generator, path.node.async)
                    )
                    Attrs.push(fn)
                } else if (isComponent()) {
                    const fn = t.objectProperty(
                        t.identifier(methodName),
                        t.functionExpression(null, path.node.params, path.node.body, path.node.generator, path.node.async)
                    )
                    Methods.push(fn)
                    // } else if (t.isClassMethod(path.node, { async: true })) {
                    // console.log('method', methodName, path.node)
                } else {
                    const fn = t.objectProperty(
                        t.identifier(methodName),
                        t.functionExpression(null, path.node.params, path.node.body, path.node.generator, path.node.async)
                    )
                    Attrs.push(fn)
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
                        output.wxml = prettifyXml(
                            generate(result.argument, { concise: true }).code,
                            { indent: 2 }
                        )
                        path.remove()
                    }
                }
            },
        },
    }
    //代码转换为AST语法树
    try {
        const AST = parse(code); //构建AST
        traverse(AST, Object.assign({}, visitor, visitJSX)) //生成新AST
        output.js = isTemplate() //新AST=>代码
            ? null
            : babel.transform(generate(AST).code, {
                babelrc: false,
                presets: [
                    "react"
                ],
                plugins: [
                    "transform-class-properties", "transform-class-properties"
                ],
            }).code.replace('"use strict";\n\n', '')
        return output
    } catch (e) {
        console.error(e);
    }
}

module.exports = transform