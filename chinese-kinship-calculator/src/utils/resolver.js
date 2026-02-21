// Version 1 resolver (MVP)
// - Input: path array of tokens
// - Resolve: join tokens with "_" and lookup in relationshipMap
// - No recursion, no generation math, no gender logic

export const BUTTON_SECTIONS = [
  {
    title: '父母',
    buttons: [
      { label: '爸爸', token: 'father' },
      { label: '妈妈', token: 'mother' },
    ],
  },
  {
    title: '姻亲',
    buttons: [
      { label: '老公', token: 'husband' },
      { label: '老婆', token: 'wife' },
    ],
  },
  {
    title: '兄弟姐妹',
    buttons: [
      { label: '哥哥', token: 'older_brother' },
      { label: '弟弟', token: 'younger_brother' },
      { label: '姐姐', token: 'older_sister' },
      { label: '妹妹', token: 'younger_sister' },
    ],
  },
  {
    title: '子女',
    buttons: [
      { label: '儿子', token: 'son' },
      { label: '女儿', token: 'daughter' },
    ],
  },
]

const relationshipMap = {
  // Single token (optional but helpful UX)
  paternal_grandfather: '爷爷',
  paternal_grandmother: '奶奶',
  maternal_grandfather: '外公',
  maternal_grandmother: '外婆',
  father: '爸爸',
  mother: '妈妈',
  older_brother: '哥哥',
  younger_brother: '弟弟',
  older_sister: '姐姐',
  younger_sister: '妹妹',
  son: '儿子',
  daughter: '女儿',

  // Parent's siblings (father side)
  father_older_brother: '伯伯',
  father_younger_brother: '叔叔',
  father_older_sister: '姑姑',
  father_younger_sister: '姑姑',

  // Parent's siblings (mother side)
  mother_older_brother: '舅舅',
  mother_younger_brother: '舅舅',
  mother_older_sister: '阿姨',
  mother_younger_sister: '阿姨',

  // Parent's parent (direct)
  father_father: '爷爷',
  father_mother: '奶奶',
  mother_father: '外公',
  mother_mother: '外婆',

  // Grandchildren
  son_son: '孙子',
  son_daughter: '孙女',
  daughter_son: '外孙',
  daughter_daughter: '外孙女',

  // Nephews / nieces (brothers)
  older_brother_son: '侄子',
  older_brother_daughter: '侄女',
  younger_brother_son: '侄子',
  younger_brother_daughter: '侄女',

  // Nephews / nieces (sisters)
  older_sister_son: '外甥',
  older_sister_daughter: '外甥女',
  younger_sister_son: '外甥',
  younger_sister_daughter: '外甥女',
}

export function isCousinScenario(path) {
  if (!Array.isArray(path) || path.length !== 3) return false

  const [t1, t2, t3] = path
  const isParent = t1 === 'father' || t1 === 'mother'
  const isParentSibling =
    t2 === 'older_brother' ||
    t2 === 'younger_brother' ||
    t2 === 'older_sister' ||
    t2 === 'younger_sister'
  const isChild = t3 === 'son' || t3 === 'daughter'

  return isParent && isParentSibling && isChild
}

// ============ SPOUSE & IN-LAW DETECTION ============

/**
 * Check if path starts with spouse token (husband or wife)
 */
function isSpouseBranch(path) {
  return path.length > 0 && (path[0] === 'husband' || path[0] === 'wife')
}

/**
 * Check if path has pattern: sibling + spouse
 * e.g., [older_brother, wife] or [younger_sister, husband]
 */
function isSiblingSpouse(path) {
  if (path.length !== 2) return false
  const [t1, t2] = path
  const isSibling =
    t1 === 'older_brother' ||
    t1 === 'younger_brother' ||
    t1 === 'older_sister' ||
    t1 === 'younger_sister'
  const isSpouse = t2 === 'husband' || t2 === 'wife'
  return isSibling && isSpouse
}

/**
 * Check if path[1] and path[2] form parent + parent's sibling
 * Used for: spouse → parent → parent's sibling
 */
function isParentSibling(path) {
  if (path.length !== 3) return false
  const [, t2, t3] = path
  const isParent = t2 === 'father' || t2 === 'mother'
  const isSibling =
    t3 === 'older_brother' ||
    t3 === 'younger_brother' ||
    t3 === 'older_sister' ||
    t3 === 'younger_sister'
  return isParent && isSibling
}

// ============ SPOUSE BRANCH RESOLVER ============

/**
 * Resolve spouse's parent's siblings (grandparent-level relatives)
 * Paths: [spouse, parent, parent's sibling]
 * 
 * Rules: Do NOT differentiate spouse type (wife/husband) since outputs are identical
 * 
 * Examples:
 * - wife → mother → older_brother → 舅公
 * - husband → mother → older_brother → 舅公 (same result)
 * - wife → father → younger_brother → 叔公
 * - husband → father → younger_brother → 叔公 (same result)
 */
function resolveSpouseParentSibling(path) {
  const [, parent, sibling] = path
  
  const isFather = parent === 'father'
  const isMother = parent === 'mother'
  
  const isMaleSibling = 
    sibling === 'older_brother' || sibling === 'younger_brother'
  const isFemaleSibling = 
    sibling === 'older_sister' || sibling === 'younger_sister'

  // === Mother's siblings → 舅公/姨婆 ===
  if (isMother) {
    if (isMaleSibling) return '舅公'      // Mother's brother
    if (isFemaleSibling) return '姨婆'    // Mother's sister
  }

  // === Father's siblings → 伯公/叔公/姑婆 ===
  if (isFather) {
    if (sibling === 'older_brother') return '伯公'     // Father's older brother
    if (sibling === 'younger_brother') return '叔公'   // Father's younger brother
    if (isFemaleSibling) return '姑婆'                 // Father's sister
  }

  return null
}

/**
 * Resolve direct spouse relatives (depth 2)
 * A) Spouse's Parents
 * B) Spouse's Siblings
 */
function resolveSpouseDirect(path) {
  const [t1, t2] = path
  const isWife = t1 === 'wife'
  const isHusband = t1 === 'husband'

  // === A) Spouse's Parents ===
  if (t2 === 'father') {
    return isWife ? '岳父' : '公公'
  }
  if (t2 === 'mother') {
    return isWife ? '岳母' : '婆婆'
  }

  // === B) Wife's Siblings ===
  if (isWife) {
    if (t2 === 'older_brother') return '大舅子'
    if (t2 === 'younger_brother') return '小舅子'
    if (t2 === 'older_sister') return '姨子'
    if (t2 === 'younger_sister') return '姨子'
  }

  // === B) Husband's Siblings ===
  if (isHusband) {
    if (t2 === 'older_brother') return '大伯'
    if (t2 === 'younger_brother') return '小叔'
    if (t2 === 'older_sister') return '姑仔'
    if (t2 === 'younger_sister') return '姑仔'
  }

  return '关系太复杂，我也不敢乱叫'
}

/**
 * Resolve in-law relationships starting with spouse token
 * Modular depth-based routing:
 * - Depth 1: Single spouse token (老婆/老公)
 * - Depth 2: Spouse + direct relative (parents/siblings)
 * - Depth 3: Spouse + parent + parent's sibling
 * - Depth > 3: Not supported
 */
function resolveSpouseBranch(path) {
  // Depth guard
  if (path.length > 3) {
    return '关系太复杂，我也不敢乱叫'
  }

  const [t1] = path
  const isWife = t1 === 'wife'
  const isHusband = t1 === 'husband'

  // === Depth 1: Single spouse token ===
  if (path.length === 1) {
    return isWife ? '老婆' : '老公'
  }

  // === Depth 2: Direct relatives ===
  if (path.length === 2) {
    return resolveSpouseDirect(path)
  }

  // === Depth 3: Parent's siblings ===
  if (path.length === 3 && isParentSibling(path)) {
    const result = resolveSpouseParentSibling(path)
    if (result !== null) return result
  }

  return '关系太复杂，我也不敢乱叫'
}

// ============ SIBLING SPOUSE RESOLVER ============

/**
 * Resolve sibling's spouse relationships
 * Supported: [sibling, spouse]
 * e.g., older_brother + wife → 嫂子
 */
function resolveSiblingSpouse(path) {
  const [t1, t2] = path
  const isWife = t2 === 'wife'
  const isHusband = t2 === 'husband'

  // === Sibling's Wife ===
  if (isWife) {
    if (t1 === 'older_brother') return '嫂子'
    if (t1 === 'younger_brother') return '弟媳'
    if (t1 === 'older_sister') return null // invalid
    if (t1 === 'younger_sister') return null // invalid
  }

  // === Sibling's Husband ===
  if (isHusband) {
    if (t1 === 'older_sister') return '姐夫'
    if (t1 === 'younger_sister') return '妹夫'
    if (t1 === 'older_brother') return null // invalid
    if (t1 === 'younger_brother') return null // invalid
  }

  return null
}

function resolveFirstCousin(path, relativeAge) {
  // path: [father|mother] + [parent's sibling] + [son|daughter]
  // relativeAge: 'older' | 'younger'
  const [t1, t2, t3] = path

  const isFatherSide = t1 === 'father'
  const isBrother = t2 === 'older_brother' || t2 === 'younger_brother'
  const isSister = t2 === 'older_sister' || t2 === 'younger_sister'

  // 堂 = father's brother's children
  // 表 = father's sister's children, and all mother's siblings' children
  const familyPrefix = isFatherSide && isBrother ? '堂' : '表'

  const cousinGender = t3 === 'son' ? 'male' : 'female'
  const age = relativeAge === 'older' ? 'older' : relativeAge === 'younger' ? 'younger' : null
  if (!age) return '关系太复杂，我也不敢乱叫'

  const title =
    cousinGender === 'male'
      ? age === 'older'
        ? '哥'
        : '弟'
      : age === 'older'
        ? '姐'
        : '妹'

  // If someone passes an invalid path (e.g. t2 not sibling), just fail safe.
  if (!(isBrother || isSister)) return '关系太复杂，我也不敢乱叫'
  return `${familyPrefix}${title}`
}

// ============ GRAND-UNCLE / AUNT RULES ============

/**
 * Detect pattern: [parent, parent, parent's sibling]
 * Examples:
 * - father, father, older_brother  (爸爸的爸爸的哥哥)
 * - father, mother, older_brother  (爸爸的妈妈的哥哥)
 * - mother, father, older_sister  (妈妈的爸爸的姐姐)
 */
function isGrandparentSibling(path) {
  if (!Array.isArray(path) || path.length !== 3) return false
  const [t1, t2, t3] = path
  const isParent = t1 === 'father' || t1 === 'mother'
  const isGrand = t2 === 'father' || t2 === 'mother'
  const isSibling =
    t3 === 'older_brother' ||
    t3 === 'younger_brother' ||
    t3 === 'older_sister' ||
    t3 === 'younger_sister'
  return isParent && isGrand && isSibling
}

/**
 * Resolve grand-uncles / grand-aunts (grandparent's siblings)
 * Uses rule composition rather than hardcoded full strings.
 * Comments explain mapping decisions and fallbacks.
 */
function resolveGrandparentSibling(path) {
  const [parent, grandparent, sibling] = path

  const isPaternalSide = parent === 'father'
  const isMaternalSide = parent === 'mother'
  const isGrandfather = grandparent === 'father'
  const isGrandmother = grandparent === 'mother'

  const isMaleSibling = sibling === 'older_brother' || sibling === 'younger_brother'
  const isFemaleSibling = sibling === 'older_sister' || sibling === 'younger_sister'

  // Father-side (爸爸 branch)
  if (isPaternalSide) {
    // 爸爸的爸爸 (paternal grandfather) siblings
    if (isGrandfather) {
      if (sibling === 'older_brother') return '伯公'
      if (sibling === 'younger_brother') return '叔公'
      if (isFemaleSibling) return '姑婆' // grandfather's sister
    }
    // 爸爸的妈妈 (paternal grandmother) siblings
    if (isGrandmother) {
      if (isMaleSibling) return '舅公'
      if (isFemaleSibling) return '姨婆'
    }
  }

  // Mother-side (妈妈 branch)
  if (isMaternalSide) {
    // 妈妈的爸爸 (maternal grandfather) siblings
    if (isGrandfather) {
      if (isMaleSibling) return '舅公'
      if (isFemaleSibling) return '姑婆'
    }
    // 妈妈的妈妈 (maternal grandmother) siblings
    if (isGrandmother) {
      if (isMaleSibling) return '舅公'
      if (isFemaleSibling) return '姨婆'
    }
  }

  // Fallback: if unmatched, signal unresolved
  return '关系太复杂，我也不敢乱叫'
}

// ============ UNCLE/AUNT SPOUSE RULES ============

/**
 * Detect pattern: [parent, parent's sibling, spouse]
 * Examples:
 * - father, older_brother, wife  -> 爸爸的哥哥的老婆 => 伯母
 * - mother, older_sister, husband -> 妈妈的姐姐的老公 => 姨丈
 */
function isParentSiblingSpouse(path) {
  if (!Array.isArray(path) || path.length !== 3) return false
  const [t1, t2, t3] = path
  const isParent = t1 === 'father' || t1 === 'mother'
  const isSibling =
    t2 === 'older_brother' ||
    t2 === 'younger_brother' ||
    t2 === 'older_sister' ||
    t2 === 'younger_sister'
  const isSpouse = t3 === 'wife' || t3 === 'husband'
  return isParent && isSibling && isSpouse
}

/**
 * Resolve uncle/aunt spouses according to rules:
 * - Father's older brother's wife -> 伯母
 * - Father's younger brother's wife -> 婶婶
 * - Father's sister's husband -> 姑丈
 * - Mother's brother's wife -> 舅妈
 * - Mother's sister's husband -> 姨丈
 * 
 * Fallback behavior (when older/younger not specified) documented:
 * - For brothers: default to the '叔叔' branch -> spouse = 婶婶
 * - For sisters: default to 姑姑 group -> spouse = 姑丈
 */
function resolveParentSiblingSpouse(path) {
  const [parent, sibling, spouse] = path

  const isFatherSide = parent === 'father'
  const isMotherSide = parent === 'mother'

  // Brother -> spouse (wife)
  if (sibling === 'older_brother' || sibling === 'younger_brother') {
    if (spouse !== 'wife') return '关系太复杂，我也不敢乱叫' // brother's husband invalid
    if (isFatherSide) {
      if (sibling === 'older_brother') return '伯母'
      if (sibling === 'younger_brother') return '婶婶'
      // fallback for unspecified brother -> 婶婶
      return '婶婶'
    }
    if (isMotherSide) {
      // mother's brother's wife -> 舅妈
      return '舅妈'
    }
  }

  // Sister -> spouse (husband)
  if (sibling === 'older_sister' || sibling === 'younger_sister') {
    if (spouse !== 'husband') return '关系太复杂，我也不敢乱叫' // sister's wife invalid
    if (isFatherSide) {
      // father's sister's husband -> 姑丈
      return '姑丈'
    }
    if (isMotherSide) {
      // mother's sister's husband -> 姨丈
      return '姨丈'
    }
  }

  return '关系太复杂，我也不敢乱叫'
}


export function resolveRelationship(pathArray, relativeAge) {
  if (!Array.isArray(pathArray) || pathArray.length === 0) return ''

  // === Route to appropriate resolver ===

  // Spouse branch: wife/husband + ...
  if (isSpouseBranch(pathArray)) {
    const result = resolveSpouseBranch(pathArray)
    if (result) return result
  }

  // Sibling's spouse: sibling + wife/husband
  if (isSiblingSpouse(pathArray)) {
    const result = resolveSiblingSpouse(pathArray)
    if (result !== null) return result
    return '关系太复杂，我也不敢乱叫'
  }

  // First cousin: parent + parent's sibling + child
  if (isCousinScenario(pathArray)) {
    return resolveFirstCousin(pathArray, relativeAge)
  }

  // Grandparent's sibling: parent + grandparent + grandparent's sibling
  if (isGrandparentSibling(pathArray)) {
    return resolveGrandparentSibling(pathArray)
  }

  // Parent's sibling's spouse: parent + sibling + spouse
  if (isParentSiblingSpouse(pathArray)) {
    return resolveParentSiblingSpouse(pathArray)
  }

  // Blood relations (direct mapping)
  const key = pathArray.join('_')
  return relationshipMap[key] ?? '关系太复杂，我也不敢乱叫'
}

