"use client"

import { useState } from "react"
import { X, Code2, Image as ImageIcon, Video } from "lucide-react"
import { useMutation } from "@apollo/client"
import { CREATE_POST_MUTATION, CREATE_REEL_MUTATION } from "../lib/mutations"

export default function PostModal({ isOpen, onClose, onSuccess, type = "post" }) {
  const [content, setContent] = useState("")
  const [codeSnippet, setCodeSnippet] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [tags, setTags] = useState("")
  const [showCodeBlock, setShowCodeBlock] = useState(false)

  // Reel specific
  const [reelTitle, setReelTitle] = useState("")
  const [reelVideoUrl, setReelVideoUrl] = useState("")
  const [reelDuration, setReelDuration] = useState(30)

  const [createPost, { loading: postLoading }] = useMutation(CREATE_POST_MUTATION, {
    onCompleted: () => {
      onSuccess()
      handleClose()
    },
  })

  const [createReel, { loading: reelLoading }] = useMutation(CREATE_REEL_MUTATION, {
    onCompleted: () => {
      onSuccess()
      handleClose()
    },
  })

  const loading = postLoading || reelLoading

  const handleClose = () => {
    setContent("")
    setCodeSnippet("")
    setLanguage("javascript")
    setTags("")
    setShowCodeBlock(false)
    setReelTitle("")
    setReelVideoUrl("")
    setReelDuration(30)
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (type === "post") {
      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t)

      await createPost({
        variables: {
          input: {
            content,
            codeSnippet: codeSnippet || null,
            language: language || null,
            tags: tagsArray.length > 0 ? tagsArray : null,
            visibility: "PUBLIC",
          },
        },
      })
    } else {
      // Create Reel
      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t)

      await createReel({
        variables: {
          input: {
            title: reelTitle || null,
            description: content || null,
            videoUrl: reelVideoUrl,
            duration: parseInt(reelDuration),
            tags: tagsArray.length > 0 ? tagsArray : null,
            visibility: "PUBLIC",
          },
        },
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 shadow-2xl animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-lg font-bold text-foreground">
            {type === "post" ? "Create Post" : "Create DevReel"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {type === "reel" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={reelTitle}
                  onChange={(e) => setReelTitle(e.target.value)}
                  placeholder="Give your reel a catchy title..."
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all text-foreground placeholder-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Video URL *
                </label>
                <input
                  type="url"
                  value={reelVideoUrl}
                  onChange={(e) => setReelVideoUrl(e.target.value)}
                  placeholder="https://cloudinary.com/..."
                  required
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all text-foreground placeholder-muted-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload your video to Cloudinary and paste the URL here
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Duration (seconds) *
                </label>
                <input
                  type="number"
                  value={reelDuration}
                  onChange={(e) => setReelDuration(e.target.value)}
                  min="1"
                  max="60"
                  required
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all text-foreground"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              {type === "post" ? "What's on your mind?" : "Description"}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                type === "post"
                  ? "Share your thoughts, code, or insights with the community..."
                  : "Tell us about your reel..."
              }
              required={type === "post"}
              rows={type === "post" ? 4 : 3}
              maxLength={280}
              className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all text-foreground placeholder-muted-foreground resize-none"
            />
            <div className="text-xs text-muted-foreground text-right mt-1">
              {content.length} / 280
            </div>
          </div>

          {type === "post" && showCodeBlock && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none transition-all text-foreground"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="css">CSS</option>
                  <option value="html">HTML</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Code Snippet
                </label>
                <textarea
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder="Paste your code here..."
                  rows={6}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all text-foreground placeholder-muted-foreground font-mono text-sm resize-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="react, typescript, webdev"
              className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all text-foreground placeholder-muted-foreground"
            />
          </div>

          {type === "post" && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCodeBlock(!showCodeBlock)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                  showCodeBlock
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span className="text-sm">Code</span>
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (type === "post" && !content) || (type === "reel" && !reelVideoUrl)}
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all disabled:opacity-50 glow-cyan"
            >
              {loading ? "Publishing..." : type === "post" ? "Post" : "Create Reel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
