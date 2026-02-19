# In-Law Relationships Implementation Guide

## Overview

This document explains the architecture for supporting in-law (姻亲) relationships in the Chinese Kinship Calculator.

---

## Architecture

### Core Principle: Modular Detection & Resolution

The resolver is built on a **4-tier detection** system:

```
resolveRelationship(pathArray, relativeAge)
    ↓
    ├─→ isSpouseBranch(path) → resolveSpouseBranch()
    ├─→ isSiblingSpouse(path) → resolveSiblingSpouse()
    ├─→ isCousinScenario(path) → resolveFirstCousin()
    └─→ default → relationshipMap lookup
```

**Benefits:**
- Clean separation of concerns
- No giant mapping object for in-laws
- Easy to extend with new logic

---

## 1. Spouse Branch (`wife` / `husband` + relatives)

### Detection
**`isSpouseBranch(path)`**
- Checks if `path[0] === 'husband'` OR `path[0] === 'wife'`
- Can expand up to 2 levels max

### Supported Paths & Outputs

#### A) Spouse's Parents
| Path | Output |
|------|--------|
| `wife` → `father` | 岳父 |
| `wife` → `mother` | 岳母 |
| `husband` → `father` | 公公 |
| `husband` → `mother` | 婆婆 |

#### B) Spouse's Siblings
| Path | Output |
|------|--------|
| `wife` → `older_brother` | 大舅子 |
| `wife` → `younger_brother` | 小舅子 |
| `wife` → `older_sister` | 姨子 |
| `wife` → `younger_sister` | 姨子 |
| `husband` → `older_brother` | 大伯 |
| `husband` → `younger_brother` | 小叔 |
| `husband` → `older_sister` | 姑仔 |
| `husband` → `younger_sister` | 姑仔 |

#### C) Single Token
| Path | Output |
|------|--------|
| `wife` | 老婆 |
| `husband` | 老公 |

### Depth Restriction
```javascript
if (path.length > 2) {
  return '暂不支持更深层的姻亲关系'
}
```
This prevents unsupported paths like `wife` → `father` → `brother`.

---

## 2. Sibling's Spouse (`sibling` + spouse)

### Detection
**`isSiblingSpouse(path)`**
- Checks if `path.length === 2`
- `path[0]` is a sibling token
- `path[1]` is a spouse token

### Supported Paths & Outputs

#### Sibling's Wife
| Path | Output |
|------|--------|
| `older_brother` → `wife` | 嫂子 |
| `younger_brother` → `wife` | 弟媳 |

#### Sibling's Husband
| Path | Output |
|------|--------|
| `older_sister` → `husband` | 姐夫 |
| `younger_sister` → `husband` | 妹夫 |

#### Invalid Combinations
```
older_brother → husband  → null (invalid)
older_sister → wife     → null (invalid)
```

---

## 3. Cousin Logic (Existing, Unchanged)

**`isCousinScenario(path)` & `resolveFirstCousin(path, relativeAge)`**

Handles: `parent` → `parent's sibling` → `child` (+ age toggle)

Outputs: 堂哥、表哥、堂妹、表妹, etc.

---

## 4. Blood Relations (Existing Map)

**Default fallback:** Direct mapping via `relationshipMap`

Handles: direct parents, siblings, grandchildren, nephews, etc.

---

## Resolution Flow Example

### Example 1: Wife's Father
```
Input: [wife, father]
↓
isSpouseBranch([wife, father]) → true
↓
resolveSpouseBranch([wife, father])
  ├─ path.length = 2 ✓
  ├─ t1 = wife ✓
  ├─ t2 = father ✓
  └─ return '岳父'
```

### Example 2: Older Brother's Wife
```
Input: [older_brother, wife]
↓
isSpouseBranch() → false (doesn't start with spouse)
↓
isSiblingSpouse() → true
↓
resolveSiblingSpouse([older_brother, wife])
  ├─ t1 = older_brother ✓
  ├─ t2 = wife ✓
  └─ return '嫂子'
```

### Example 3: Complex Invalid Path (Too Deep)
```
Input: [wife, father, older_brother]
↓
isSpouseBranch([wife, father, older_brother]) → true
↓
resolveSpouseBranch()
  ├─ path.length = 3 > 2 ✗
  └─ return '暂不支持更深层的姻亲关系'
```

---

## Key Design Decisions

### 1. No Global Gender Selection
- Users don't select "I'm male" or "I'm female"
- Context is inferred from the path
- Avoids session complexity

### 2. No Deep Spouse Chaining
- Max depth = 2: `spouse + one_relative`
- Prevents exponential complexity
- Keeps logic simple and maintainable

### 3. Conditional Logic Over String Maps
- Each resolver uses readable `if` blocks
- Easy to debug and extend
- Scalable for new rules

### 4. Gender-Aware Routing (Limited)
- Sibling spouse logic checks both wife and husband separately
- Returns `null` for invalid combos
- Clean error handling

---

## Extension Points

### Adding Spouse Nephews
To support `wife` → `older_brother` → `son`:

1. In `resolveSpouseBranch()`, check if `path.length === 3`
2. Add logic:
```javascript
if (path.length === 3) {
  const [t1, t2, t3] = path
  if (isWife && t3 === 'son') {
    if (t2 === 'older_brother') return '大舅子（侄子）'
    // ... etc
  }
}
```
3. Update depth restriction to allow 3.

### Adding Extended Family
To support `father` → `wife`:

Not advised without careful architecture review, as it creates circular complexity. Would require:
- Tracking "spouse of X" vs "X of spouse"
- Rethinking path normalization

---

## Limitations & Future Work

### Current Limitations
1. **No deep spouse chains** (intentional)
   - Can't resolve: `wife` → `father` → `brother` → `son`
   - Can add up to depth 2 if needed

2. **No user gender input**
   - App uses path context only
   - Spouse token disambiguates usage

3. **No in-law remarriage scenarios**
   - Assumes single marriage context

### Future Extensions (If Needed)
- [ ] Spouse siblings' children (spouse nephews/nieces)
- [ ] Extended cousin-in-law chains
- [ ] Divorce/remarriage states
- [ ] Same-sex marriage support (easy: just swap token logic)

---

## Testing Checklist

| Category | Path | Expected Output |
|----------|------|-----------------|
| **Spouse's Parents** | `wife`, `father` | 岳父 |
| | `wife`, `mother` | 岳母 |
| | `husband`, `father` | 公公 |
| | `husband`, `mother` | 婆婆 |
| **Spouse's Siblings** | `wife`, `older_brother` | 大舅子 |
| | `wife`, `younger_brother` | 小舅子 |
| | `husband`, `older_brother` | 大伯 |
| | `husband`, `younger_brother` | 小叔 |
| **Sibling's Spouse** | `older_brother`, `wife` | 嫂子 |
| | `younger_brother`, `wife` | 弟媳 |
| | `older_sister`, `husband` | 姐夫 |
| | `younger_sister`, `husband` | 妹夫 |
| **Single Tokens** | `wife` | 老婆 |
| | `husband` | 老公 |
| **Invalid Cases** | `wife`, `father`, `brother` | 暂不支持更深层的姻亲关系 |
| | `older_brother`, `husband` | 暂时无法解析 |
| **Existing (Cousins)** | `father`, `older_brother`, `son` + older | 堂哥 |

---

## Code Organization

```
resolver.js
├─ BUTTON_SECTIONS (with 姻亲 section)
├─ relationshipMap (blood relations only)
├─ isCousinScenario() ← cousin detection
├─ isSpouseBranch() ← spouse detection
├─ isSiblingSpouse() ← sibling spouse detection
├─ resolveSpouseBranch() ← spouse logic
├─ resolveSiblingSpouse() ← sibling spouse logic
├─ resolveFirstCousin() ← cousin logic
└─ resolveRelationship() ← main router
```

Clean hierarchy, easy to navigate and maintain.
