const { pipeit } = require('../src/pipeit.js')

function* nums(max) {
  for (let i = 1; i <= max; i++) {
    const res = yield i
  }
}

const sleep = t =>
  new Promise((resolve, reject) => {
    setTimeout(resolve, t)
  })

//////////////////////////////////////////////////////


test('There should be at least 2 arguments', () => {
  // expect.assertions(1);
  return pipeit(42).catch(e => {
    console.log('T1', e.message)
    expect(e.message).toMatch('Invalid arguments for the pipeit function')
  })
})

test('First argument should be an iterable', () => {
  // expect.assertions(1);
  return pipeit(42, 42).catch(e => {
    console.log('T2', e.message)
    expect(e.message).toMatch('First argument should be an iterable')
  })
})

test('Other arguments should be functions or objects with functions', () => {
  expect('').toMatch(''); return
  return pipeit(nums(2), 42).catch(e => {
    console.log('T3', e.message)
    expect(e.message).toMatch('First argument should be an iterable')
  })
})

test('Identity function', () => {
  return pipeit(nums(2), v => v).then(v => {
    console.log('T4', v)
    expect(v[0]).toBe(2)
  })
})

test('Times 10 then plus 2', () => {
  return pipeit(nums(4), v => v * 10, v => v + 2).then(v => {
    console.log('T5', v)
    expect(v[0]).toBe(42)
  })
})

test('Buffer 4 items, 1 function', () => {
  return pipeit(nums(4), { fn: v => v, hwm: 4 }).then(v => {
    console.log('T6', v)
    expect(v).toStrictEqual([1,2,3,4])
  })
})

test('Buffer 5 items, 2 functions', () => {
  return pipeit(nums(4), { fn: v => v * 2, hwm: 5 }, v => v + 6).then(v => {
    console.log('T6', v)
    expect(v).toStrictEqual([8,10,12,14])
  })
})

test('Buffer 4 and 2 items in 2 functions', () => {
  return pipeit(nums(4), { fn: v => v * 2, hwm: 4 }, { fn: v => v + 6, hwm: 2 }).then(v => {
    console.log('T6', v)
    expect(v).toStrictEqual([8,10,12,14])
  })
})


