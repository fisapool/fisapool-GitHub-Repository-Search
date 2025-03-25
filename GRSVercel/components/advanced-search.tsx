"use client"

import { useState } from "react"
import { dorkOperators, commonDorks, type DorkTemplate, dorkCategories } from "../utils/githubDorks"

interface AdvancedSearchProps {
  onSearch: (query: string) => void
  onClose: () => void
}

export default function AdvancedSearch({ onSearch, onClose }: AdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDork, setSelectedDork] = useState<DorkTemplate | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("Security")
  const [searchDorks, setSearchDorks] = useState("")

  // Advanced search options
  const [language, setLanguage] = useState("")
  const [minStars, setMinStars] = useState("")
  const [updatedAfter, setUpdatedAfter] = useState("")
  const [searchInName, setSearchInName] = useState(true)
  const [searchInDescription, setSearchInDescription] = useState(true)
  const [searchInReadme, setSearchInReadme] = useState(false)

  // Filter dorks by category and search term
  const filteredDorks = commonDorks.filter((dork) => {
    const matchesCategory = activeCategory === "All" || dork.category === activeCategory
    const matchesSearch =
      searchDorks === "" ||
      dork.name.toLowerCase().includes(searchDorks.toLowerCase()) ||
      dork.description.toLowerCase().includes(searchDorks.toLowerCase()) ||
      dork.query.toLowerCase().includes(searchDorks.toLowerCase())

    return matchesCategory && matchesSearch
  })

  // Group operators by category
  const operatorsByCategory = dorkOperators.reduce(
    (acc, op) => {
      if (!acc[op.category]) {
        acc[op.category] = []
      }
      acc[op.category].push(op)
      return acc
    },
    {} as Record<string, typeof dorkOperators>,
  )

  const handleDorkSelect = (dork: DorkTemplate) => {
    setSelectedDork(dork)
    setSearchQuery(dork.query)
  }

  const handleAddOperator = (operator: string) => {
    setSearchQuery((prev) => `${prev} ${operator}`.trim())
  }

  const buildQuery = () => {
    let query = searchQuery.trim()

    // Add language filter
    if (language) {
      query += ` language:${language}`
    }

    // Add star count filter
    if (minStars) {
      query += ` stars:>=${minStars}`
    }

    // Add date filter
    if (updatedAfter) {
      query += ` pushed:>${updatedAfter}`
    }

    // Add search scope
    if (searchInName) {
      query += " in:name"
    }
    if (searchInDescription) {
      query += " in:description"
    }
    if (searchInReadme) {
      query += " in:readme"
    }

    return query.trim()
  }

  const handleSearch = () => {
    const finalQuery = buildQuery()
    onSearch(finalQuery)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Advanced GitHub Search</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Query</label>
          <textarea
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border rounded-md h-24"
            placeholder="Enter your search query with GitHub dorks (e.g., 'react stars:>1000 language:javascript')"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Programming Language</label>
            <input
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="e.g., javascript, python"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stars</label>
            <input
              type="number"
              value={minStars}
              onChange={(e) => setMinStars(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="e.g., 1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Updated After Date</label>
            <input
              type="date"
              value={updatedAfter}
              onChange={(e) => setUpdatedAfter(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="flex flex-col justify-end">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search In</label>
            <div className="space-y-1">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="searchInName"
                  checked={searchInName}
                  onChange={(e) => setSearchInName(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="searchInName">Repository Name</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="searchInDescription"
                  checked={searchInDescription}
                  onChange={(e) => setSearchInDescription(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="searchInDescription">Repository Description</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="searchInReadme"
                  checked={searchInReadme}
                  onChange={(e) => setSearchInReadme(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="searchInReadme">README Files</label>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Dork Templates</h3>
            <input
              type="text"
              value={searchDorks}
              onChange={(e) => setSearchDorks(e.target.value)}
              className="p-1 border rounded-md text-sm w-64"
              placeholder="Search dorks..."
            />
          </div>

          <div className="flex space-x-2 mb-3 overflow-x-auto pb-2">
            <button
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                activeCategory === "All" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => setActiveCategory("All")}
            >
              All
            </button>
            {dorkCategories.map((category, idx) => (
              <button
                key={idx}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                  activeCategory === category ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {filteredDorks.map((dork, index) => (
              <div
                key={index}
                className={`p-2 border rounded-md cursor-pointer hover:bg-gray-100 ${
                  selectedDork?.name === dork.name ? "bg-blue-50 border-blue-300" : ""
                }`}
                onClick={() => handleDorkSelect(dork)}
              >
                <div className="font-medium">{dork.name}</div>
                <div className="text-sm text-gray-600">{dork.description}</div>
                <div className="text-xs text-gray-500 mt-1 font-mono">{dork.query}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Search Operators</h3>

          <div className="space-y-3">
            {Object.entries(operatorsByCategory).map(([category, operators]) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-gray-700 mb-1">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {operators.map((op, index) => (
                    <div
                      key={index}
                      className="px-2 py-1 bg-gray-100 rounded-md text-sm cursor-pointer hover:bg-gray-200"
                      onClick={() => handleAddOperator(op.operator)}
                      title={op.description}
                    >
                      {op.operator}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-100">
            Cancel
          </button>
          <button onClick={handleSearch} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Search
          </button>
        </div>
      </div>
    </div>
  )
}

