const CRUMBS = false
const crumbs = []
const _t = (m) => CRUMBS && crumbs.push(m)

const applyFunc = (fn, eFn, i) => async res => {
  try {
    const resolved = await fn(res)  
    _t(`APPLY(${i})-[${res}->${resolved}]`)
    return resolved
  } catch(e) {
    _t(`Calling error func from apply ${i}`)
    eFn(e)
    return undefined
  }
}

const transform = (iterator, fn, eFn, hwm = 1, i) => {
  eFn = eFn || ((e) => { _t(`Throwing error from index ${i}`); throw e })
      
  return (function*() {
    let buff = []
    _t(`TFRM(${i})-1111`)
    for (let av of iterator) {
      if (i === 1) // we reach the source generator. Let's promisify it and put it in an array
        av = [Promise.resolve(av)]
      _t(`TFRM(${i})-2222`)
      const res = av.map(p => p.then(applyFunc(fn, eFn, i)))
      buff = buff.concat(res)
      if (buff.length >= hwm) {
        _t(`TFRM(${i})-3333`)
        yield buff
        _t(`TFRM(${i})-4444`)
        buff = []
      }
    }
    if (buff.length > 0) {
      _t(`TFRM(${i})-EXTRA-BUFF`)
      yield buff
      buff = []
    }
    _t(`TFRM(${i})-END`)
  })()
}

const pipeit = async (...fns) => {
  if (!Array.isArray(fns) || fns.length < 2)
    throw Error('Invalid arguments for the pipeit function')
  if (typeof fns[0] !== 'object' || !fns[0].next || typeof fns[0].next !== 'function')
    throw Error('First argument should be an iterable')
  const eFn = e => console.error('Error fn:', e)
  const gIter = fns.reduce((acc, f, i) => (
    i === 0
      ? acc
      : transform(acc, f.fn || f, f.eFn || eFn, f.hwm || 1, i)), fns[0])
  let v
  for (const pv of gIter) {
    try {
      _t(`MAIN-1111`)
      v = await Promise.all(pv)
      _t(`MAIN-2222`)
    } catch (e) {
      _t('Throwing error from main pipeit func')
      throw e
    }
  }
  CRUMBS && console.log('\n\nRESULT-LOG:\n', crumbs.join('\n'))
  return v //&& v[v.length - 1]
}

module.exports = { pipeit };

