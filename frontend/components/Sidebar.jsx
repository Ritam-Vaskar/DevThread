"use client"

import { Home, Search, Bookmark, Users, User, LogOut, Zap, Shield } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const navItems = [
    { icon: Home, label: "Home", href: "/feed" },
    { icon: Search, label: "Explore", href: "/explore" },
    { icon: Bookmark, label: "Bookmarks", href: "/bookmarks" },
    { icon: Users, label: "Community", href: "/community" },
  ]

  const isActive = (href) => pathname === href

  const handleLogout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <aside className="hidden md:flex w-64 border-r border-border flex-col sticky top-0 h-screen bg-card p-4">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          DevThreads
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Developer Community</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}

        {user?.isAdmin && (
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
              isActive("/admin")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Shield className="w-5 h-5" />
            <span className="font-medium">Admin</span>
          </Link>
        )}
      </nav>

      {/* User Section */}
      <div className="space-y-2 border-t border-border pt-4">
        {user && (
          <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-primary/50">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-foreground">
                Level {Math.floor(user.reputation / 100) + 1}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{user.reputation} Reputation</p>
            <div className="w-full h-1 bg-background rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary"
                style={{ width: `${(user.reputation % 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        <Link
          href="/profile"
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <User className="w-5 h-5" />
          <span className="font-medium">Profile</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-all text-left"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}
