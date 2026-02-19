// Version 1 resolver (MVP)
// - Input: path array of tokens
// - Resolve: join tokens with "_" and lookup in relationshipMap
// - No recursion, no generation math, no gender logic

export const BUTTON_SECTIONS = [
  {
    title: '祖父母',
    buttons: [
      { label: '爷爷', token: 'paternal_grandfather' },
      { label: '奶奶', token: 'paternal_grandmother' },
      { label: '外公', token: 'maternal_grandfather' },
      { label: '外婆', token: 'maternal_grandmother' },
    ],
  },
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

// ============ SPOUSE BRANCH RESOLVER ============

/**
 * Resolve in-law relationships starting with spouse token
 * Supported paths:
 * A) wife + [father/mother] → 岳父/岳母
 * B) husband + [father/mother] → 公公/婆婆
 * C) wife + [sibling] → 大舅子/小舅子/姨子
 * D) husband + [sibling] → 大伯/小叔/姑仔
 */
function resolveSpouseBranch(path) {
  // Depth restriction: max 2 levels (spouse + one relative)
  if (path.length > 2) {
    return '暂不支持更深层的姻亲关系'
  }

  const [t1, t2] = path
  const isWife = t1 === 'wife'
  const isHusband = t1 === 'husband'

  // Single token spouse
  if (path.length === 1) {
    return isWife ? '老婆' : '老公'
  }

  // === A) Spouse's Parents ===
  if (t2 === 'father') {
    return isWife ? '岳父' : '公公'
  }
  if (t2 === 'mother') {
    return isWife ? '岳母' : '婆婆'
  }

  // === C) Wife's Siblings ===
  if (isWife) {
    if (t2 === 'older_brother') return '大舅子'
    if (t2 === 'younger_brother') return '小舅子'
    if (t2 === 'older_sister') return '姨子'
    if (t2 === 'younger_sister') return '姨子'
  }

  // === D) Husband's Siblings ===
  if (isHusband) {
    if (t2 === 'older_brother') return '大伯'
    if (t2 === 'younger_brother') return '小叔'
    if (t2 === 'older_sister') return '姑仔'
    if (t2 === 'younger_sister') return '姑仔'
  }

  return '暂时无法解析'
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
  if (!age) return '暂时无法解析'

  const title =
    cousinGender === 'male'
      ? age === 'older'
        ? '哥'
        : '弟'
      : age === 'older'
        ? '姐'
        : '妹'

  // If someone passes an invalid path (e.g. t2 not sibling), just fail safe.
  if (!(isBrother || isSister)) return '暂时无法解析'
  return `${familyPrefix}${title}`
}

export function resolveRelationship(pathArray, relativeAge) {
  if (!Array.isArray(pathArray) || pathArray.length === 0) return ''

  // === Route to appropriate resolver ===

  // Spouse branch: wife/husband + ...
  if (isSpouseBranch(pathArray)) {
    return resolveSpouseBranch(pathArray)
  }

  // Sibling's spouse: sibling + wife/husband
  if (isSiblingSpouse(pathArray)) {
    const result = resolveSiblingSpouse(pathArray)
    if (result !== null) return result
    return '暂时无法解析'
  }

  // First cousin: parent + parent's sibling + child
  if (isCousinScenario(pathArray)) {
    return resolveFirstCousin(pathArray, relativeAge)
  }

  // Blood relations (direct mapping)
  const key = pathArray.join('_')
  return relationshipMap[key] ?? '暂时无法解析'
}

