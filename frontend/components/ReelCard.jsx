"use client"

import { Play, Heart, MessageCircle, Share2 } from "lucide-react"
import { useState } from "react"
import { useMutation } from "@apollo/client"
import { LIKE_REEL_MUTATION } from "../lib/mutations"
import { formatTimeAgo, formatNumber } from "../lib/utils"

export default function ReelCard({ reel, onCommentClick }) {
  const [liked, setLiked] = useState(reel.viewerLiked || false)
  const [likeCount, setLikeCount] = useState(reel.likesCount || 0)

  const [likeReel] = useMutation(LIKE_REEL_MUTATION)

  const handleLike = async (e) => {
    e.stopPropagation()
    const newLiked = !liked
    setLiked(newLiked)
    setLikeCount(newLiked ? likeCount + 1 : likeCount - 1)

    try {
      await likeReel({ variables: { id: reel.id } })
    } catch (error) {
      setLiked(!newLiked)
      setLikeCount(newLiked ? likeCount - 1 : likeCount + 1)
    }
  }

  return (
    <div className="p-4 hover:bg-card/50 transition-colors border-b border-border/50 cursor-pointer group">
      {/* Header */}
      <div className="flex gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
          {reel.author?.displayName?.[0] || reel.author?.username?.[0] || '?'}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground hover:underline">
              {reel.author?.displayName || reel.author?.username}
            </span>
            <span className="text-muted-foreground text-sm">@{reel.author?.username}</span>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-muted-foreground text-sm">{formatTimeAgo(reel.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Video Thumbnail */}
      <div className="relative rounded-lg overflow-hidden mb-3 group/video">
        {reel.thumbnailUrl ? (
          <img
            src={reel.thumbnailUrl}
            alt={reel.title || 'Reel'}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-cyan-900 to-blue-900 flex items-center justify-center">
            <Play className="w-16 h-16 text-white/50" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity bg-black/30">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center glow-cyan">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs font-medium">
          {Math.floor(reel.duration / 60)}:{String(reel.duration % 60).padStart(2, '0')}
        </div>
      </div>

      {/* Title & Description */}
      {reel.title && (
        <h3 className="text-base font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
          {reel.title}
        </h3>
      )}
      {reel.description && (
        <p className="text-sm text-muted-foreground mb-3">{reel.description}</p>
      )}

      {/* Tags */}
      {reel.tags && reel.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {reel.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground hover:text-primary hover:bg-muted/80 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-4 text-xs text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <Play className="w-4 h-4" />
          <span>{formatNumber(reel.viewsCount || 0)} views</span>
        </div>
        <div className="flex items-center gap-1">
          <Heart className="w-4 h-4" />
          <span>{formatNumber(likeCount)} likes</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4" />
          <span>{formatNumber(reel.commentsCount || 0)} comments</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between text-muted-foreground">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onCommentClick && onCommentClick(reel)
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted hover:text-primary transition-all group/btn"
        >
          <MessageCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          <span className="text-xs">Comment</span>
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
