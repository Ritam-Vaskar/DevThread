"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@apollo/client"
import { Plus, Loader2 } from "lucide-react"
import Sidebar from "../../components/Sidebar"
import PostCard from "../../components/PostCard"
import ReelCard from "../../components/ReelCard"
import TagBar from "../../components/TagBar"
import PostModal from "../../components/PostModal"
import { FEED_QUERY, REELS_QUERY } from "../../lib/queries"

export default function FeedPage() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState("all")
  const [contentType, setContentType] = useState("posts") // 'posts' or 'reels'
  const [showPostModal, setShowPostModal] = useState(false)
  const [modalType, setModalType] = useState("post")

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      router.push("/")
    }
  }, [router])

  const { data: postsData, loading: postsLoading, refetch: refetchPosts } = useQuery(FEED_QUERY, {
    variables: {
      filter: activeFilter === "trending" ? "TRENDING" : "LATEST",
      limit: 20,
    },
    skip: contentType !== "posts",
  })

  const { data: reelsData, loading: reelsLoading, refetch: refetchReels } = useQuery(REELS_QUERY, {
    variables: {
      limit: 20,
    },
    skip: contentType !== "reels",
  })

  const handlePostSuccess = () => {
    refetchPosts()
    refetchReels()
  }

  const handleCreatePost = () => {
    setModalType("post")
    setShowPostModal(true)
  }

  const handleCreateReel = () => {
    setModalType("reel")
    setShowPostModal(true)
  }

  const posts = postsData?.feed?.posts || []
  const reels = reelsData?.reels || []
  const loading = postsLoading || reelsLoading

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Feed */}
      <main className="flex-1 max-w-2xl border-r border-border">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">DevThreads</h2>
              <p className="text-xs text-muted-foreground">Latest from your community</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreatePost}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all glow-cyan"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Post</span>
              </button>
              <button
                onClick={handleCreateReel}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary font-semibold hover:bg-primary/10 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Reel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Type Tabs */}
        <div className="flex gap-2 border-b border-border px-4 py-3">
          <button
            onClick={() => setContentType("posts")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              contentType === "posts"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            DevTweets
          </button>
          <button
            onClick={() => setContentType("reels")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              contentType === "reels"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            DevReels
          </button>
        </div>

        {/* Filter Tabs (only for posts) */}
        {contentType === "posts" && (
          <div className="flex gap-2 border-b border-border px-4 py-3 overflow-x-auto">
            {[
              { id: "latest", label: "Latest" },
              { id: "trending", label: "Trending" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                  activeFilter === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Content Feed */}
        <div className="divide-y divide-border">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : contentType === "posts" ? (
            posts.length > 0 ? (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
              </div>
            )
          ) : (
            reels.length > 0 ? (
              reels.map((reel) => <ReelCard key={reel.id} reel={reel} />)
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No reels yet. Create the first one!</p>
              </div>
            )
          )}
        </div>
      </main>

      {/* Right Sidebar - Tags & Suggestions */}
      <div className="hidden lg:block w-80 border-l border-border p-4 max-h-screen overflow-y-auto">
        <TagBar />
      </div>

      {/* Post/Reel Modal */}
      <PostModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSuccess={handlePostSuccess}
        type={modalType}
      />
    </div>
  )
}
