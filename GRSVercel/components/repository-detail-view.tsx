"use client"

import { useState, useEffect } from "react"
import { GitHubService } from "../services/GitHubService"
import type { Repository } from "../services/GitHubService"

interface RepositoryDetailViewProps {
  id: string
}

export default function RepositoryDetailView({ id }: RepositoryDetailViewProps) {
  const [repository, setRepository] = useState<Repository | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRepository() {
      setIsLoading(true)
      try {
        const repo = await GitHubService.getRepositoryById(id)
        setRepository(repo)
      } catch (err) {
        setError("Failed to load repository details")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRepository()
  }, [id])

  if (isLoading) {
    return <div className="text-center py-8">Loading repository details...</div>
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
  }

  if (!repository) {
    return <div className="text-center py-8">Repository not found</div>
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center mb-4">
        <img
          src={repository.owner.avatar_url || "/placeholder.svg"}
          alt={repository.owner.login}
          className="w-12 h-12 rounded-full mr-4"
        />
        <div>
          <h1 className="text-2xl font-bold">{repository.name}</h1>
          <p className="text-gray-600">by {repository.owner.login}</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-700 mb-4">{repository.description || "No description available"}</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="bg-gray-100 px-3 py-1 rounded-full">⭐ {repository.stargazers_count} stars</div>
          <div className="bg-gray-100 px-3 py-1 rounded-full">🍴 {repository.forks_count} forks</div>
          {repository.language && <div className="bg-gray-100 px-3 py-1 rounded-full">🔠 {repository.language}</div>}
        </div>
      </div>

      <a
        href={repository.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        View on GitHub
      </a>
    </div>
  )
}

