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

  if (isCousinScenario(pathArray)) {
    return resolveFirstCousin(pathArray, relativeAge)
  }

  const key = pathArray.join('_')
  return relationshipMap[key] ?? '暂时无法解析'
}

