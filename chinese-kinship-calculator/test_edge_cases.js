import { resolveRelationship } from './src/utils/resolver.js'

console.log('=== Edge Case Testing ===\n')

const tests = [
  // VALID direct spouse relatives (should work)
  { path: ['husband', 'father'], expected: '公公', name: '老公 → 爸爸' },
  { path: ['husband', 'older_brother'], expected: '大伯', name: '老公 → 哥哥' },
  { path: ['wife', 'father'], expected: '岳父', name: '老婆 → 爸爸' },
  
  // INVALID combinations (should return error message, not null/"0")
  { path: ['husband', 'paternal_grandmother'], expected: '关系太复杂，我也不敢乱叫', name: '老公 → 奶奶' },
  { path: ['wife', 'son'], expected: '关系太复杂，我也不敢乱叫', name: '老婆 → 儿子' },
  { path: ['wife', 'grandfather'], expected: '关系太复杂，我也不敢乱叫', name: '老婆 → 爷爷' },
  { path: ['husband', 'grandfather'], expected: '关系太复杂，我也不敢乱叫', name: '老公 → 爷爷' },
]

let passed = 0
let failed = 0

tests.forEach(({ path, expected, name }) => {
  const result = resolveRelationship(path, 0)
  
  if (result === expected) {
    console.log(`✓ ${name}: "${result}"`)
    passed++
  } else {
    console.log(`✗ ${name}: got "${result}", expected "${expected}"`)
    failed++
  }
})

console.log(`\n=== Summary ===`)
console.log(`Passed: ${passed}/${tests.length}`)
console.log(`Failed: ${failed}/${tests.length}`)

if (failed === 0) {
  console.log('\n✓ All edge cases return proper error messages!')
  process.exit(0)
} else {
  console.log('\n✗ Some edge cases still return invalid values!')
  process.exit(1)
}
