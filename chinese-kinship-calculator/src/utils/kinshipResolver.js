/**
 * Chinese Kinship Relationship Resolver
 * 
 * This module handles the calculation of Chinese kinship relationships
 * for Malaysian Chinese users. It processes a sequence of relationships
 * and determines what the final relative should be called.
 * 
 * Version 1 (MVP) - Basic relationships only
 */

// Basic relationship mappings
// Format: { relationship: { gender: 'm'|'f', generation: number, side: 'paternal'|'maternal'|'self' } }
const RELATIONSHIP_MAP = {
  // Self
  '我': { gender: null, generation: 0, side: 'self' },
  
  // Parents
  '爸爸': { gender: 'm', generation: 1, side: 'paternal' },
  '妈妈': { gender: 'f', generation: 1, side: 'maternal' },
  
  // Siblings
  '哥哥': { gender: 'm', generation: 0, side: 'self' },
  '弟弟': { gender: 'm', generation: 0, side: 'self' },
  '姐姐': { gender: 'f', generation: 0, side: 'self' },
  '妹妹': { gender: 'f', generation: 0, side: 'self' },
  
  // Grandparents
  '爷爷': { gender: 'm', generation: 2, side: 'paternal' },
  '奶奶': { gender: 'f', generation: 2, side: 'paternal' },
  '外公': { gender: 'm', generation: 2, side: 'maternal' },
  '外婆': { gender: 'f', generation: 2, side: 'maternal' },
  
  // Uncles and Aunts
  '伯伯': { gender: 'm', generation: 1, side: 'paternal' },
  '叔叔': { gender: 'm', generation: 1, side: 'paternal' },
  '姑姑': { gender: 'f', generation: 1, side: 'paternal' },
  '舅舅': { gender: 'm', generation: 1, side: 'maternal' },
  '阿姨': { gender: 'f', generation: 1, side: 'maternal' },
  
  // Cousins (children of uncles/aunts)
  '堂哥': { gender: 'm', generation: 0, side: 'paternal' },
  '堂弟': { gender: 'm', generation: 0, side: 'paternal' },
  '堂姐': { gender: 'f', generation: 0, side: 'paternal' },
  '堂妹': { gender: 'f', generation: 0, side: 'paternal' },
  '表哥': { gender: 'm', generation: 0, side: 'maternal' },
  '表弟': { gender: 'm', generation: 0, side: 'maternal' },
  '表姐': { gender: 'f', generation: 0, side: 'maternal' },
  '表妹': { gender: 'f', generation: 0, side: 'maternal' },
};

/**
 * Resolves a sequence of relationships to determine the final kinship term
 * @param {string[]} relationships - Array of relationship terms (e.g., ['爸爸', '哥哥'])
 * @returns {string} The kinship term for the final relative
 */
export function resolveKinship(relationships) {
  if (!relationships || relationships.length === 0) {
    return '';
  }

  // Start from self
  let currentPerson = { gender: null, generation: 0, side: 'self' };
  
  // Process each relationship in sequence
  for (const rel of relationships) {
    const relInfo = RELATIONSHIP_MAP[rel];
    if (!relInfo) {
      return '未知关系';
    }
    
    // Navigate through relationships
    // This is simplified logic for MVP - can be expanded later
    if (relInfo.side === 'self' && relInfo.generation === 0) {
      // Sibling relationship - same generation
      currentPerson = { ...currentPerson, gender: relInfo.gender };
    } else {
      // Parent/ancestor relationship - move up/down generations
      currentPerson = {
        gender: relInfo.gender,
        generation: currentPerson.generation + relInfo.generation,
        side: relInfo.side === 'self' ? currentPerson.side : relInfo.side
      };
    }
  }
  
  // Determine the final relationship term
  return getFinalRelationship(currentPerson);
}

/**
 * Gets the final relationship term based on the calculated person's attributes
 * @param {Object} person - { gender, generation, side }
 * @returns {string} The kinship term
 */
function getFinalRelationship(person) {
  const { gender, generation, side } = person;
  
  // Generation 0 - siblings or cousins
  if (generation === 0) {
    if (side === 'self') {
      return gender === 'm' ? '兄弟' : '姐妹';
    } else if (side === 'paternal') {
      return gender === 'm' ? '堂兄弟' : '堂姐妹';
    } else {
      return gender === 'm' ? '表兄弟' : '表姐妹';
    }
  }
  
  // Generation 1 - parents or uncles/aunts
  if (generation === 1) {
    if (side === 'paternal') {
      return gender === 'm' ? '爸爸' : '妈妈';
    } else if (side === 'maternal') {
      return gender === 'm' ? '舅舅' : '阿姨';
    }
  }
  
  // Generation 2 - grandparents
  if (generation === 2) {
    if (side === 'paternal') {
      return gender === 'm' ? '爷爷' : '奶奶';
    } else {
      return gender === 'm' ? '外公' : '外婆';
    }
  }
  
  // Generation -1 - children (future expansion)
  if (generation === -1) {
    return gender === 'm' ? '儿子' : '女儿';
  }
  
  // Default fallback
  return '未知关系';
}

/**
 * Gets all available relationship buttons
 * @returns {string[]} Array of relationship terms
 */
export function getAvailableRelationships() {
  return Object.keys(RELATIONSHIP_MAP).filter(rel => rel !== '我');
}
