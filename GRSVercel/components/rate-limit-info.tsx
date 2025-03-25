"use client"

import { useState, useEffect } from "react"
import { GitHubService } from "../services/GitHubService"

export default function RateLimitInfo() {
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    remaining: number
    limit: number
    resetTime: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchRateLimitInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch("https://api.github.com/rate_limit", {
        headers: GitHubService["getHeaders"](),
      })

      if (response.ok) {
        const data = await response.json()
        const { rate } = data

        setRateLimitInfo({
          remaining: rate.remaining,
          limit: rate.limit,
          resetTime: new Date(rate.reset * 1000).toLocaleTimeString(),
        })
      }
    } catch (error) {
      console.error("Error fetching rate limit info:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRateLimitInfo()

    // Refresh rate limit info every minute
    const intervalId = setInterval(fetchRateLimitInfo, 60000)

    return () => clearInterval(intervalId)
  }, [])

  if (loading || !rateLimitInfo) {
    return null
  }

  return (
    <div className="text-xs text-gray-500 mt-1">
      GitHub API Rate Limit: {rateLimitInfo.remaining} / {rateLimitInfo.limit} requests remaining
      {rateLimitInfo.remaining < 10 && <span className="text-red-500 ml-1">(Resets at {rateLimitInfo.resetTime})</span>}
    </div>
  )
}

