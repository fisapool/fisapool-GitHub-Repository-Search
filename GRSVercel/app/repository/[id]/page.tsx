import Link from "next/link"
import RepositoryDetailView from "../../../components/repository-detail-view"

export default function RepositoryDetailPage({ params }: { params: { id: string } }) {
  return (
    <main className="container mx-auto px-4 py-8">
      <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
        ← Back to Search
      </Link>
      <RepositoryDetailView id={params.id} />
    </main>
  )
}

