"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation } from "@apollo/client"
import { Code2, Zap, Users } from "lucide-react"
import { SIGNUP_MUTATION } from "../../lib/mutations"
import { validateEmail, validateUsername } from "../../lib/utils"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    displayName: "",
  })
  const [error, setError] = useState("")
  
  const [signup, { loading }] = useMutation(SIGNUP_MUTATION, {
    onCompleted: (data) => {
      localStorage.setItem("accessToken", data.signup.accessToken)
      localStorage.setItem("refreshToken", data.signup.refreshToken)
      localStorage.setItem("user", JSON.stringify(data.signup.user))
      router.push("/feed")
    },
    onError: (error) => {
      setError(error.message)
    },
  })

  const handleSignup = async (e) => {
    e.preventDefault()
    setError("")

    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address")
      return
    }

    if (!validateUsername(formData.username)) {
      setError("Username must be 3-20 characters and contain only letters, numbers, and underscores")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    await signup({
      variables: {
        input: formData,
      },
    })
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
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
          <p className="text-muted-foreground text-sm">Join the Developer Community</p>
        </div>

        <div className="border border-border rounded-xl p-8 bg-card backdrop-blur-lg shadow-2xl border-glow">
          <h2 className="text-xl font-bold mb-6 text-foreground">Create Account</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/20 border border-destructive text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe"
                required
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all text-foreground placeholder-muted-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Display Name</label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all text-foreground placeholder-muted-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all text-foreground placeholder-muted-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
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
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/" className="text-primary hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-card border border-border/50 text-center">
            <Zap className="w-5 h-5 mx-auto mb-2 text-primary" />
            <p className="text-xs font-medium text-foreground">Share Code</p>
          </div>
          <div className="p-3 rounded-lg bg-card border border-border/50 text-center">
            <Users className="w-5 h-5 mx-auto mb-2 text-secondary" />
            <p className="text-xs font-medium text-foreground">Learn Together</p>
          </div>
        </div>
      </div>
    </div>
  )
}
