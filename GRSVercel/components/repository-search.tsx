"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { GitHubService, type SearchOptions } from "../services/GitHubService"
import type { Repository } from "../services/GitHubService"
import AdvancedSearch from "./advanced-search"
import GitHubAuth from "./github-auth"

export default function RepositorySearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    perPage: 12,
    page: 1,
  })
  const router = useRouter()

  const handleSearch = async (query = searchTerm, page = 1) => {
    if (!query.trim()) return

    setIsLoading(true)
    setError(null)
    setCurrentPage(page)

    try {
      const options = {
        ...searchOptions,
        page,
      }

      const results = await GitHubService.searchRepositories(query, options)
      setRepositories(results.items)
      setTotalCount(results.totalCount)

      // Save the search query to localStorage for history
      saveSearchToHistory(query)
    } catch (err: any) {
      let errorMessage = "Failed to search repositories. Please try again."

      // Handle rate limit errors specifically
      if (err.message && err.message.includes("429")) {
        errorMessage =
          "GitHub API rate limit exceeded. Please wait a few minutes before trying again or add a GitHub token for higher limits."
      }

      setError(errorMessage)
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const viewRepositoryDetails = (repo: Repository) => {
    router.push(`/repository/${repo.id}`)
  }

  const handleAdvancedSearch = (query: string) => {
    setSearchTerm(query)
    handleSearch(query)
  }

  const saveSearchToHistory = (query: string) => {
    if (!query.trim()) return

    try {
      const history = JSON.parse(localStorage.getItem("searchHistory") || "[]")
      // Add to beginning, remove duplicates, limit to 10 items
      const newHistory = [query, ...history.filter((item: string) => item !== query)].slice(0, 10)

      localStorage.setItem("searchHistory", JSON.stringify(newHistory))
    } catch (err) {
      console.error("Failed to save search history:", err)
    }
  }

  const getSearchHistory = (): string[] => {
    try {
      return JSON.parse(localStorage.getItem("searchHistory") || "[]")
    } catch {
      return []
    }
  }

  const handlePageChange = (newPage: number) => {
    handleSearch(searchTerm, newPage)
  }

  const totalPages = Math.ceil(totalCount / (searchOptions.perPage || 12))

  return (
    <div className="space-y-6">
      {/* Add the GitHub Auth component */}
      <GitHubAuth />

      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-1 flex items-center">
          <input
            type="text"
            placeholder="Search GitHub repositories (e.g., 'react stars:>1000')"
            className="border rounded-l py-2 px-4 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r"
            onClick={() => handleSearch()}
            disabled={isLoading}
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
        <button
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
          onClick={() => setShowAdvancedSearch(true)}
        >
          Advanced Search
        </button>
      </div>

      {/* Search history suggestions */}
      {searchTerm && getSearchHistory().length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Recent searches:</span>
          {getSearchHistory()
            .filter((query) => query.includes(searchTerm))
            .slice(0, 5)
            .map((query, index) => (
              <button
                key={index}
                className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                onClick={() => {
                  setSearchTerm(query)
                  handleSearch(query)
                }}
              >
                {query}
              </button>
            ))}
        </div>
      )}

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      {repositories.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Search Results ({totalCount.toLocaleString()} repositories found)</h2>
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * (searchOptions.perPage || 12) + 1} -{" "}
              {Math.min(currentPage * (searchOptions.perPage || 12), totalCount)} of {totalCount.toLocaleString()}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {repositories.map((repo) => (
              <div
                key={repo.id}
                className="border rounded p-4 hover:shadow-md cursor-pointer"
                onClick={() => viewRepositoryDetails(repo)}
              >
                <div className="flex items-center mb-2">
                  <img
                    src={repo.owner.avatar_url || "/placeholder.svg"}
                    alt={repo.owner.login}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <span className="font-medium">{repo.owner.login}</span>
                </div>
                <h3 className="text-lg font-semibold">{repo.name}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {repo.description || "No description available"}
                </p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {repo.topics &&
                    repo.topics.slice(0, 3).map((topic, index) => (
                      <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {topic}
                      </span>
                    ))}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-3">⭐ {repo.stargazers_count.toLocaleString()}</span>
                  <span className="mr-3">🍴 {repo.forks_count.toLocaleString()}</span>
                  {repo.language && <span>🔠 {repo.language}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded border ${currentPage === pageNum ? "bg-blue-500 text-white" : ""}`}
                    >
                      {pageNum}
                    </button>
                  )
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span>...</span>
                    <button onClick={() => handlePageChange(totalPages)} className="px-3 py-1 rounded border">
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      )}

      {showAdvancedSearch && (
        <AdvancedSearch onSearch={handleAdvancedSearch} onClose={() => setShowAdvancedSearch(false)} />
      )}
    </div>
  )
}

