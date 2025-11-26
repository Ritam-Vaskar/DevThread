"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "@apollo/client"
import { User, Mail, Calendar, Award, Edit2, Save, X } from "lucide-react"
import Sidebar from "../../components/Sidebar"
import PostCard from "../../components/PostCard"
import { ME_QUERY, USER_POSTS_QUERY } from "../../lib/queries"
import { UPDATE_PROFILE_MUTATION } from "../../lib/mutations"
import { formatTimeAgo } from "../../lib/utils"

export default function ProfilePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    avatarUrl: "",
  })

  const { data: userData, loading: userLoading, refetch } = useQuery(ME_QUERY)
  const user = userData?.me

  const { data: postsData, loading: postsLoading } = useQuery(USER_POSTS_QUERY, {
    variables: {
      userId: user?.id || "",
      limit: 20,
    },
    skip: !user?.id,
  })

  const [updateProfile, { loading: updating }] = useMutation(UPDATE_PROFILE_MUTATION, {
    onCompleted: () => {
      setIsEditing(false)
      refetch()
    },
  })

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      router.push("/")
    }
  }, [router])

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || "",
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || "",
      })
    }
  }, [user])

  const handleSave = async () => {
    await updateProfile({
      variables: {
        input: formData,
      },
    })
  }

  const posts = postsData?.userPosts?.posts || []

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      <main className="flex-1 max-w-4xl">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm p-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-primary glow-cyan">
                {user?.displayName?.[0] || user?.username?.[0] || '?'}
              </div>

              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="px-3 py-1 rounded bg-background border border-border text-foreground mb-2"
                    placeholder="Display Name"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-foreground">
                    {user?.displayName || user?.username}
                  </h1>
                )}
                <p className="text-muted-foreground">@{user?.username}</p>

                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="mt-2 w-full px-3 py-2 rounded bg-background border border-border text-foreground resize-none"
                    placeholder="Bio"
                    rows={2}
                  />
                ) : (
                  user?.bio && <p className="text-sm text-foreground mt-2">{user.bio}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-6">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Joined {formatTimeAgo(user?.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">{user?.reputation} Rep</span>
            </div>
          </div>
        </div>

        {/* Badges */}
        {user?.badges && user.badges.length > 0 && (
          <div className="border-b border-border p-4">
            <h3 className="font-bold text-foreground mb-3">Badges</h3>
            <div className="flex flex-wrap gap-3">
              {user.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-primary/50"
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts */}
        <div className="divide-y divide-border">
          <div className="p-4 border-b border-border">
            <h3 className="font-bold text-foreground">Posts ({posts.length})</h3>
          </div>

          {postsLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading posts...</div>
          ) : posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="text-center py-12 text-muted-foreground">No posts yet</div>
          )}
        </div>
      </main>
    </div>
  )
}
