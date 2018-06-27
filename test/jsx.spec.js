const transform = require('../tools/transform-wx')

describe('模块转义', () => {
    test('App页面', () => {
        const source = `
            export default class extends App {}
            `
        const target = { js: `App({});` }
        const output = transform({ code: source })
        expect(target.js === output.js).toBe(true)
    })
    test('Page页面', () => {
        const source = `
            export default class extends Page {}
            `
        const target = { js: `Page({});` }
        const output = transform({ code: source })
        expect(target.js === output.js).toBe(true)
    })
    test('Component页面', () => {
        const source = `
            export default class extends Component {}
            `
        const target = { js: `Component({});` }
        const output = transform({ code: source })
        expect(target.js === output.js).toBe(true)
    })
})