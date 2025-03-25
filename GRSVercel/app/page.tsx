import RepositorySearch from "../components/repository-search"
import RateLimitInfo from "../components/rate-limit-info"

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">GitHub Repository Search</h1>
      <RepositorySearch />
      <div className="mt-4">
        <RateLimitInfo />
      </div>
    </main>
  )
}

