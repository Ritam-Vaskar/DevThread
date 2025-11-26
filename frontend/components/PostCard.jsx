"use client"

import { Heart, MessageCircle, Share2, TrendingUp } from "lucide-react"
import { useState } from "react"
import { useMutation } from "@apollo/client"
import { LIKE_POST_MUTATION, UPVOTE_POST_MUTATION } from "../lib/mutations"
import { formatTimeAgo, formatNumber } from "../lib/utils"

export default function PostCard({ post, onCommentClick }) {
  const [liked, setLiked] = useState(post.viewerLiked || false)
  const [upvoted, setUpvoted] = useState(post.viewerUpvoted || false)
  const [likeCount, setLikeCount] = useState(post.likesCount || 0)
  const [upvoteCount, setUpvoteCount] = useState(post.upvotesCount || 0)

  const [likePost] = useMutation(LIKE_POST_MUTATION)
  const [upvotePost] = useMutation(UPVOTE_POST_MUTATION)

  const handleLike = async (e) => {
    e.stopPropagation()
    const newLiked = !liked
    setLiked(newLiked)
    setLikeCount(newLiked ? likeCount + 1 : likeCount - 1)

    try {
      await likePost({ variables: { id: post.id } })
    } catch (error) {
      setLiked(!newLiked)
      setLikeCount(newLiked ? likeCount - 1 : likeCount + 1)
    }
  }

  const handleUpvote = async (e) => {
    e.stopPropagation()
    const newUpvoted = !upvoted
    setUpvoted(newUpvoted)
    setUpvoteCount(newUpvoted ? upvoteCount + 1 : upvoteCount - 1)

    try {
      await upvotePost({ variables: { id: post.id } })
    } catch (error) {
      setUpvoted(!newUpvoted)
      setUpvoteCount(newUpvoted ? upvoteCount - 1 : upvoteCount + 1)
    }
  }

  return (
    <div className="p-4 hover:bg-card/50 transition-colors border-b border-border/50 cursor-pointer group">
      {/* Header */}
      <div className="flex gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
          {post.author?.displayName?.[0] || post.author?.username?.[0] || '?'}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground hover:underline">
              {post.author?.displayName || post.author?.username}
            </span>
            <span className="text-muted-foreground text-sm">@{post.author?.username}</span>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-muted-foreground text-sm">{formatTimeAgo(post.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-3">
        <p className="text-sm text-foreground leading-relaxed mb-3">{post.content}</p>

        {/* Code Block */}
        {post.codeSnippet && (
          <div className="my-3 rounded-lg bg-background border border-border p-3 overflow-x-auto">
            <div className="flex items-center justify-between mb-2">
              <code className="text-xs text-primary font-mono">{post.language || 'code'}</code>
              <button className="text-xs text-muted-foreground hover:text-foreground">Copy</button>
            </div>
            <pre className="font-mono text-xs text-foreground/80 whitespace-pre-wrap break-words">
              {post.codeSnippet}
            </pre>
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground hover:text-primary hover:bg-muted/80 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-muted-foreground mb-3 flex-wrap">
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          <span>{formatNumber(upvoteCount)} upvotes</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4" />
          <span>{formatNumber(post.commentsCount || 0)} comments</span>
        </div>
        <div className="flex items-center gap-1">
          <span>{formatNumber(post.viewsCount || 0)} views</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between text-muted-foreground">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onCommentClick && onCommentClick(post)
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted hover:text-primary transition-all group/btn"
        >
          <MessageCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          <span className="text-xs">Reply</span>
        </button>

        <button
          onClick={handleUpvote}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-all group/btn ${
            upvoted ? 'text-cyan-500' : ''
          }`}
        >
          <TrendingUp
            className={`w-4 h-4 transition-all group-hover/btn:scale-110 ${
              upvoted ? 'fill-cyan-500' : ''
            }`}
          />
          <span className="text-xs">{formatNumber(upvoteCount)}</span>
        </button>

        <button
          onClick={handleLike}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-all group/btn"
        >
          <Heart
            className={`w-4 h-4 transition-all group-hover/btn:scale-110 ${
              liked ? 'fill-red-500 text-red-500' : 'group-hover/btn:text-red-500'
            }`}
          />
          <span className={`text-xs ${liked ? 'text-red-500' : ''}`}>{formatNumber(likeCount)}</span>
        </button>

        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted hover:text-secondary transition-all group/btn">
          <Share2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          <span className="text-xs">Share</span>
        </button>
      </div>
    </div>
  )
}
