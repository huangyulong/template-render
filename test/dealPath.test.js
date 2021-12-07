const dealPath = require('../server/utils/dealPath')
const path = require('path')

const pageone = path.join(__dirname, '../pages/home/index.html')
test('find page name', () => {
    expect(dealPath.findCurPage(pageone)).toBe('home')
})

test('http://localhost:3333/pageInfo', () => {
    expect(dealPath.findUrlPathname('http://localhost:3333/pageInfo')).toBe('pageInfo')
})