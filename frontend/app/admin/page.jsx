"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "@apollo/client"
import {
  Users,
  FileText,
  Video,
  TrendingUp,
  Shield,
  Ban,
  Trash2,
  CheckCircle,
  Activity,
} from "lucide-react"
import Sidebar from "../../components/Sidebar"
import {
  ADMIN_STATS_QUERY,
  ADMIN_USERS_QUERY,
  ADMIN_POSTS_QUERY,
  ADMIN_MODERATION_LOGS_QUERY,
  ME_QUERY,
} from "../../lib/queries"
import {
  ADMIN_BAN_USER_MUTATION,
  ADMIN_UNBAN_USER_MUTATION,
  ADMIN_DELETE_POST_MUTATION,
} from "../../lib/mutations"
import { formatTimeAgo, formatNumber } from "../../lib/utils"

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedUser, setSelectedUser] = useState(null)
  const [banReason, setBanReason] = useState("")
  const [banDuration, setBanDuration] = useState(7)

  const { data: userData } = useQuery(ME_QUERY)
  const { data: statsData, loading: statsLoading } = useQuery(ADMIN_STATS_QUERY)
  const { data: usersData, loading: usersLoading, refetch: refetchUsers } = useQuery(ADMIN_USERS_QUERY, {
    variables: { limit: 50 },
  })
  const { data: postsData, loading: postsLoading, refetch: refetchPosts } = useQuery(ADMIN_POSTS_QUERY, {
    variables: { limit: 50 },
  })
  const { data: logsData } = useQuery(ADMIN_MODERATION_LOGS_QUERY, {
    variables: { limit: 20 },
  })

  const [banUser] = useMutation(ADMIN_BAN_USER_MUTATION, {
    onCompleted: () => {
      refetchUsers()
      setSelectedUser(null)
      setBanReason("")
    },
  })

  const [unbanUser] = useMutation(ADMIN_UNBAN_USER_MUTATION, {
    onCompleted: () => {
      refetchUsers()
    },
  })

  const [deletePost] = useMutation(ADMIN_DELETE_POST_MUTATION, {
    onCompleted: () => {
      refetchPosts()
    },
  })

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      router.push("/")
      return
    }

    if (userData?.me && !userData.me.isAdmin) {
      router.push("/feed")
    }
  }, [router, userData])

  const handleBanUser = async () => {
    if (!selectedUser || !banReason) return

    await banUser({
      variables: {
        input: {
          userId: selectedUser.id,
          reason: banReason,
          duration: parseInt(banDuration),
        },
      },
    })
  }

  const handleUnbanUser = async (userId) => {
    await unbanUser({
      variables: { userId },
    })
  }

  const handleDeletePost = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return

    await deletePost({
      variables: {
        postId,
        reason: "Violates community guidelines",
      },
    })
  }

  const stats = statsData?.adminStats
  const users = usersData?.adminUsers || []
  const posts = postsData?.adminPosts || []
  const logs = logsData?.adminModerationLogs || []

  if (!userData?.me?.isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      <main className="flex-1 max-w-6xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Admin Portal</h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: "dashboard", label: "Dashboard", icon: Activity },
              { id: "users", label: "Users", icon: Users },
              { id: "posts", label: "Posts", icon: FileText },
              { id: "logs", label: "Logs", icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "cyan" },
                  { label: "Total Posts", value: stats?.totalPosts, icon: FileText, color: "blue" },
                  { label: "Total Reels", value: stats?.totalReels, icon: Video, color: "purple" },
                  {
                    label: "Active Users (7d)",
                    value: stats?.activeUsers7d,
                    icon: TrendingUp,
                    color: "green",
                  },
                ].map((stat, idx) => {
                  const Icon = stat.icon
                  return (
                    <div
                      key={idx}
                      className="border border-border rounded-xl p-6 bg-card hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-5 h-5 text-${stat.color}-500`} />
                      </div>
                      <p className="text-3xl font-bold text-foreground">{formatNumber(stat.value || 0)}</p>
                      <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                  )
                })}
              </div>

              {/* Activity Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-border rounded-xl p-4 bg-card">
                  <p className="text-sm text-muted-foreground mb-1">New Signups Today</p>
                  <p className="text-2xl font-bold text-primary">{stats?.newSignupsToday || 0}</p>
                </div>
                <div className="border border-border rounded-xl p-4 bg-card">
                  <p className="text-sm text-muted-foreground mb-1">Posts Today</p>
                  <p className="text-2xl font-bold text-primary">{stats?.postsToday || 0}</p>
                </div>
                <div className="border border-border rounded-xl p-4 bg-card">
                  <p className="text-sm text-muted-foreground mb-1">Reels Today</p>
                  <p className="text-2xl font-bold text-primary">{stats?.reelsToday || 0}</p>
                </div>
              </div>

              {/* Trending Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-border rounded-xl p-4 bg-card">
                  <h3 className="font-bold text-foreground mb-4">Trending Posts</h3>
                  <div className="space-y-3">
                    {stats?.trendingPosts?.slice(0, 5).map((post) => (
                      <div
                        key={post.id}
                        className="p-3 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors"
                      >
                        <p className="text-sm text-foreground mb-2 line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>@{post.author?.username}</span>
                          <span>·</span>
                          <span>{formatNumber(post.likesCount)} likes</span>
                          <span>·</span>
                          <span>{formatNumber(post.viewsCount)} views</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-border rounded-xl p-4 bg-card">
                  <h3 className="font-bold text-foreground mb-4">Trending Reels</h3>
                  <div className="space-y-3">
                    {stats?.trendingReels?.slice(0, 5).map((reel) => (
                      <div
                        key={reel.id}
                        className="p-3 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors"
                      >
                        <p className="text-sm font-semibold text-foreground mb-2">{reel.title}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>@{reel.author?.username}</span>
                          <span>·</span>
                          <span>{formatNumber(reel.likesCount)} likes</span>
                          <span>·</span>
                          <span>{formatNumber(reel.viewsCount)} views</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">User Management</h3>
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">User</th>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">Email</th>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">Reputation</th>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">Status</th>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-muted/50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-foreground">{user.displayName || user.username}</p>
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{user.email}</td>
                        <td className="p-4 text-sm font-semibold text-primary">{user.reputation}</td>
                        <td className="p-4">
                          {user.bannedUntil && new Date(user.bannedUntil) > new Date() ? (
                            <span className="px-2 py-1 rounded text-xs bg-destructive/20 text-destructive">
                              Banned
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-500">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {user.bannedUntil && new Date(user.bannedUntil) > new Date() ? (
                              <button
                                onClick={() => handleUnbanUser(user.id)}
                                className="p-2 rounded hover:bg-green-500/20 text-green-500"
                                title="Unban"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => setSelectedUser(user)}
                                className="p-2 rounded hover:bg-destructive/20 text-destructive"
                                title="Ban"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Ban User Modal */}
              {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <div className="bg-card border border-border rounded-xl w-full max-w-md p-6">
                    <h3 className="text-lg font-bold text-foreground mb-4">
                      Ban User: @{selectedUser.username}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Reason</label>
                        <textarea
                          value={banReason}
                          onChange={(e) => setBanReason(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none"
                          rows={3}
                          placeholder="Enter reason for ban..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Duration (days)</label>
                        <input
                          type="number"
                          value={banDuration}
                          onChange={(e) => setBanDuration(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setSelectedUser(null)}
                          className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleBanUser}
                          disabled={!banReason}
                          className="flex-1 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 disabled:opacity-50"
                        >
                          Ban User
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === "posts" && (
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">Content Management</h3>
              <div className="space-y-3">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="border border-border rounded-xl p-4 bg-card hover:border-primary/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-foreground mb-2">{post.content}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>@{post.author?.username}</span>
                          <span>·</span>
                          <span>{formatTimeAgo(post.createdAt)}</span>
                          <span>·</span>
                          <span>{formatNumber(post.likesCount)} likes</span>
                          <span>·</span>
                          <span>{formatNumber(post.viewsCount)} views</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 rounded hover:bg-destructive/20 text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === "logs" && (
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">Moderation Logs</h3>
              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="border border-border rounded-lg p-4 bg-card text-sm"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">@{log.admin?.username}</span>
                      <span className="text-muted-foreground">performed</span>
                      <span className="px-2 py-0.5 rounded bg-primary/20 text-primary font-medium">
                        {log.action}
                      </span>
                    </div>
                    {log.reason && (
                      <p className="text-muted-foreground mb-1">Reason: {log.reason}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{formatTimeAgo(log.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
