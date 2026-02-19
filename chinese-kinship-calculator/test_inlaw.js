// Quick test harness for in-law relationships
// Run this with: node test_inlaw.js

// Import the resolver functions
import { resolveRelationship, isCousinScenario, BUTTON_SECTIONS } from './src/utils/resolver.js'

console.log('=== In-Law Relationship Testing ===\n')

// Test cases
const testCases = [
  // Spouse's Parents
  { path: ['wife', 'father'], expected: '岳父', label: "Wife's Father" },
  { path: ['wife', 'mother'], expected: '岳母', label: "Wife's Mother" },
  { path: ['husband', 'father'], expected: '公公', label: "Husband's Father" },
  { path: ['husband', 'mother'], expected: '婆婆', label: "Husband's Mother" },

  // Spouse's Siblings
  { path: ['wife', 'older_brother'], expected: '大舅子', label: "Wife's older brother" },
  { path: ['wife', 'younger_brother'], expected: '小舅子', label: "Wife's younger brother" },
  { path: ['wife', 'older_sister'], expected: '姨子', label: "Wife's older sister" },
  { path: ['wife', 'younger_sister'], expected: '姨子', label: "Wife's younger sister" },

  { path: ['husband', 'older_brother'], expected: '大伯', label: "Husband's older brother" },
  { path: ['husband', 'younger_brother'], expected: '小叔', label: "Husband's younger brother" },
  { path: ['husband', 'older_sister'], expected: '姑仔', label: "Husband's older sister" },
  { path: ['husband', 'younger_sister'], expected: '姑仔', label: "Husband's younger sister" },

  // Sibling's Spouse
  { path: ['older_brother', 'wife'], expected: '嫂子', label: "Older brother's wife" },
  { path: ['younger_brother', 'wife'], expected: '弟媳', label: "Younger brother's wife" },
  { path: ['older_sister', 'husband'], expected: '姐夫', label: "Older sister's husband" },
  { path: ['younger_sister', 'husband'], expected: '妹夫', label: "Younger sister's husband" },

  // Single tokens
  { path: ['wife'], expected: '老婆', label: "Wife (single)" },
  { path: ['husband'], expected: '老公', label: "Husband (single)" },

  // Invalid cases
  { path: ['wife', 'father', 'brother'], expected: '暂不支持更深层的姻亲关系', label: "Too deep (>2)" },
  { path: ['older_brother', 'husband'], expected: '暂时无法解析', label: "Invalid: older_brother + husband" },

  // Existing blood relations (sanity check)
  { path: ['father'], expected: '爸爸', label: "Father (existing)" },
  { path: ['older_brother'], expected: '哥哥', label: "Older brother (existing)" },
  { path: ['son'], expected: '儿子', label: "Son (existing)" },
]

let passed = 0
let failed = 0

testCases.forEach(({ path, expected, label }) => {
  const result = resolveRelationship(path, null)
  const status = result === expected ? '✓' : '✗'
  if (result === expected) {
    passed++
  } else {
    failed++
  }
  console.log(`${status} ${label}`)
  if (result !== expected) {
    console.log(`    Expected: "${expected}"`)
    console.log(`    Got:      "${result}"`)
  }
})

console.log(`\n=== Summary ===`)
console.log(`Passed: ${passed}/${testCases.length}`)
console.log(`Failed: ${failed}/${testCases.length}`)

if (failed === 0) {
  console.log('\n✓ All tests passed!')
  process.exit(0)
} else {
  console.log('\n✗ Some tests failed')
  process.exit(1)
}
