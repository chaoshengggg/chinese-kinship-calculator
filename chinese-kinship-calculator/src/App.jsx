import { useState } from 'react'
import { resolveKinship, getAvailableRelationships } from './utils/kinshipResolver'
import './App.css'

function App() {
  const [relationships, setRelationships] = useState([])
  const [result, setResult] = useState('')

  const handleRelationshipClick = (rel) => {
    const newRelationships = [...relationships, rel]
    setRelationships(newRelationships)
    const resolved = resolveKinship(newRelationships)
    setResult(resolved)
  }

  const handleClear = () => {
    setRelationships([])
    setResult('')
  }

  const handleBackspace = () => {
    if (relationships.length > 0) {
      const newRelationships = relationships.slice(0, -1)
      setRelationships(newRelationships)
      if (newRelationships.length === 0) {
        setResult('')
      } else {
        const resolved = resolveKinship(newRelationships)
        setResult(resolved)
      }
    }
  }

  const availableRelationships = getAvailableRelationships()

  // Group relationships by category for better UI organization
  const groupedRelationships = {
    parents: availableRelationships.filter(r => ['爸爸', '妈妈'].includes(r)),
    siblings: availableRelationships.filter(r => ['哥哥', '弟弟', '姐姐', '妹妹'].includes(r)),
    grandparents: availableRelationships.filter(r => ['爷爷', '奶奶', '外公', '外婆'].includes(r)),
    unclesAunts: availableRelationships.filter(r => ['伯伯', '叔叔', '姑姑', '舅舅', '阿姨'].includes(r)),
    cousins: availableRelationships.filter(r => ['堂哥', '堂弟', '堂姐', '堂妹', '表哥', '表弟', '表姐', '表妹'].includes(r)),
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-white mb-2">
          华人关系计算器
        </h1>
        <p className="text-center text-gray-400 text-sm mb-6">
          Chinese Kinship Calculator
        </p>

        {/* Calculator Display */}
        <div className="bg-gray-800 rounded-lg shadow-2xl p-6 mb-4">
          {/* Display Screen */}
          <div className="bg-gray-900 rounded-lg p-4 mb-4 min-h-[120px] flex flex-col justify-end">
            {/* Relationship Chain */}
            <div className="text-gray-400 text-sm mb-2 min-h-[20px]">
              {relationships.length > 0 ? (
                <span className="flex flex-wrap gap-1">
                  {relationships.map((rel, index) => (
                    <span key={index} className="text-gray-500">
                      {rel}
                      {index < relationships.length - 1 && <span className="mx-1">的</span>}
                    </span>
                  ))}
                </span>
              ) : (
                <span className="text-gray-600">输入关系...</span>
              )}
            </div>
            
            {/* Result Display */}
            <div className="text-white text-3xl font-bold text-right break-all">
              {result || '0'}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={handleClear}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 active:scale-95"
            >
              清除 (C)
            </button>
            <button
              onClick={handleBackspace}
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 active:scale-95"
            >
              删除 (⌫)
            </button>
          </div>

          {/* Relationship Buttons */}
          <div className="space-y-3">
            {/* Parents */}
            {groupedRelationships.parents.length > 0 && (
              <div>
                <div className="text-gray-400 text-xs mb-1 px-1">父母</div>
                <div className="grid grid-cols-2 gap-2">
                  {groupedRelationships.parents.map((rel) => (
                    <button
                      key={rel}
                      onClick={() => handleRelationshipClick(rel)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 active:scale-95 shadow-md"
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Siblings */}
            {groupedRelationships.siblings.length > 0 && (
              <div>
                <div className="text-gray-400 text-xs mb-1 px-1">兄弟姐妹</div>
                <div className="grid grid-cols-4 gap-2">
                  {groupedRelationships.siblings.map((rel) => (
                    <button
                      key={rel}
                      onClick={() => handleRelationshipClick(rel)}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-2 rounded-lg transition-all duration-200 active:scale-95 shadow-md text-sm"
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Grandparents */}
            {groupedRelationships.grandparents.length > 0 && (
              <div>
                <div className="text-gray-400 text-xs mb-1 px-1">祖父母</div>
                <div className="grid grid-cols-4 gap-2">
                  {groupedRelationships.grandparents.map((rel) => (
                    <button
                      key={rel}
                      onClick={() => handleRelationshipClick(rel)}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-2 rounded-lg transition-all duration-200 active:scale-95 shadow-md text-sm"
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Uncles & Aunts */}
            {groupedRelationships.unclesAunts.length > 0 && (
              <div>
                <div className="text-gray-400 text-xs mb-1 px-1">叔叔阿姨</div>
                <div className="grid grid-cols-5 gap-2">
                  {groupedRelationships.unclesAunts.map((rel) => (
                    <button
                      key={rel}
                      onClick={() => handleRelationshipClick(rel)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-2 rounded-lg transition-all duration-200 active:scale-95 shadow-md text-xs"
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cousins */}
            {groupedRelationships.cousins.length > 0 && (
              <div>
                <div className="text-gray-400 text-xs mb-1 px-1">堂表兄弟姐妹</div>
                <div className="grid grid-cols-4 gap-2">
                  {groupedRelationships.cousins.map((rel) => (
                    <button
                      key={rel}
                      onClick={() => handleRelationshipClick(rel)}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-2 rounded-lg transition-all duration-200 active:scale-95 shadow-md text-sm"
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center text-gray-500 text-xs">
          <p>点击关系按钮来计算最终称呼</p>
          <p className="mt-1">Click relationship buttons to calculate the final term</p>
        </div>
      </div>
    </div>
  )
}

export default App
