"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation } from "@apollo/client"
import { Code2, Zap, Users } from "lucide-react"
import { LOGIN_MUTATION } from "../lib/mutations"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  
  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      localStorage.setItem("accessToken", data.login.accessToken)
      localStorage.setItem("refreshToken", data.login.refreshToken)
      localStorage.setItem("user", JSON.stringify(data.login.user))
      router.push("/feed")
    },
    onError: (error) => {
      setError(error.message)
    },
  })

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    
    await login({
      variables: {
        input: { email, password },
      },
    })
  }

  const handleGithubLogin = () => {
    window.location.href = "http://localhost:8080/auth/github"
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border border-cyan-400 glow-cyan">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              DevThreads
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">Developer-First Community Platform</p>
        </div>

        {/* Auth Card */}
        <div className="border border-border rounded-xl p-8 bg-card backdrop-blur-lg shadow-2xl border-glow">
          <h2 className="text-xl font-bold mb-6 text-foreground">Sign In</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/20 border border-destructive text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dev@example.com"
                required
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all text-foreground placeholder-muted-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all text-foreground placeholder-muted-foreground"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all disabled:opacity-50 mt-6 glow-cyan"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-xs text-muted-foreground">or continue with</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <button
            onClick={handleGithubLogin}
            className="w-full py-2 px-4 rounded-lg border border-border bg-background hover:bg-muted transition-all font-medium text-foreground flex items-center justify-center gap-2"
          >
            <Code2 className="w-4 h-4" />
            GitHub
          </button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline font-semibold">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Features teaser */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-card border border-border/50 text-center">
            <Zap className="w-5 h-5 mx-auto mb-2 text-primary" />
            <p className="text-xs font-medium text-foreground">Post & Share</p>
          </div>
          <div className="p-3 rounded-lg bg-card border border-border/50 text-center">
            <Users className="w-5 h-5 mx-auto mb-2 text-secondary" />
            <p className="text-xs font-medium text-foreground">Connect</p>
          </div>
        </div>
      </div>
    </div>
  )
}
