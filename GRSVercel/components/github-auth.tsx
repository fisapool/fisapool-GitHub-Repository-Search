"use client"

import { useState, useEffect } from "react"
import { GitHubService } from "../services/GitHubService"

export default function GitHubAuth() {
  const [token, setToken] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showTokenInput, setShowTokenInput] = useState(false)

  useEffect(() => {
    // Check if already authenticated
    const isAuth = GitHubService.isAuthenticated()
    setIsAuthenticated(isAuth)
  }, [])

  const handleSaveToken = () => {
    if (token.trim()) {
      GitHubService.saveAuthToken(token)
      setIsAuthenticated(true)
      setShowTokenInput(false)
      setToken("")
    }
  }

  const handleLogout = () => {
    GitHubService.clearAuthToken()
    setIsAuthenticated(false)
  }

  return (
    <div className="mb-4">
      {isAuthenticated ? (
        <div className="flex items-center">
          <span className="text-sm text-green-600 mr-2">✓ Using authenticated GitHub API (higher rate limits)</span>
          <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-700">
            Logout
          </button>
        </div>
      ) : (
        <div>
          {showTokenInput ? (
            <div className="flex items-center">
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your GitHub token"
                className="border rounded py-1 px-2 text-sm mr-2"
              />
              <button
                onClick={handleSaveToken}
                className="bg-blue-500 hover:bg-blue-700 text-white text-sm py-1 px-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setShowTokenInput(false)}
                className="text-gray-500 hover:text-gray-700 text-sm ml-2"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              <span className="text-sm text-yellow-600 mr-2">
                ⚠️ Using unauthenticated GitHub API (limited to 60 requests/hour)
              </span>
              <button onClick={() => setShowTokenInput(true)} className="text-xs text-blue-500 hover:text-blue-700">
                Add Token
              </button>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Create a GitHub token
            </a>{" "}
            with public_repo scope for higher rate limits (5000 requests/hour).
          </p>
        </div>
      )}
    </div>
  )
}

