"use client"

import { TrendingUp, Hash } from "lucide-react"

const TRENDING_TAGS = [
  { tag: "react", count: 1234 },
  { tag: "typescript", count: 987 },
  { tag: "nextjs", count: 856 },
  { tag: "nodejs", count: 743 },
  { tag: "python", count: 692 },
  { tag: "golang", count: 581 },
  { tag: "webdev", count: 524 },
  { tag: "javascript", count: 489 },
]

export default function TagBar() {
  return (
    <div className="space-y-4">
      {/* Trending Tags */}
      <div className="border border-border rounded-xl p-4 bg-card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Trending Tags</h3>
        </div>

        <div className="space-y-3">
          {TRENDING_TAGS.map((item, index) => (
            <div
              key={item.tag}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground w-6">
                  {index + 1}
                </span>
                <Hash className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {item.tag}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {item.count.toLocaleString()} posts
              </span>
            </div>
          ))}
        </div>

        <button className="w-full mt-4 text-sm text-primary hover:underline font-medium">
          Show more
        </button>
      </div>

      {/* Suggested Users */}
      <div className="border border-border rounded-xl p-4 bg-card">
        <h3 className="font-bold text-foreground mb-4">Who to Follow</h3>

        <div className="space-y-3">
          {[
            { name: "Sarah Dev", username: "sarahdev", avatar: "👩‍💻" },
            { name: "Mike Code", username: "mikecode", avatar: "👨‍💻" },
            { name: "Alex Tech", username: "alextech", avatar: "🧑‍💻" },
          ].map((user) => (
            <div
              key={user.username}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="text-2xl">{user.avatar}</div>
                <div>
                  <p className="font-medium text-foreground text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </div>
              </div>
              <button className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
