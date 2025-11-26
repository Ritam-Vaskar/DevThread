import { gql } from '@apollo/client'

// ========== Comment Subscriptions ==========

export const COMMENT_ADDED_SUBSCRIPTION = gql`
  subscription CommentAdded($postId: ID, $reelId: ID) {
    commentAdded(postId: $postId, reelId: $reelId) {
      id
      content
      createdAt
      likesCount
      author {
        id
        username
        displayName
        avatarUrl
      }
    }
  }
`

// ========== Post Subscriptions ==========

export const POST_LIKED_SUBSCRIPTION = gql`
  subscription PostLiked($postId: ID!) {
    postLiked(postId: $postId)
  }
`

// ========== Notification Subscriptions ==========

export const NOTIFICATION_RECEIVED_SUBSCRIPTION = gql`
  subscription NotificationReceived($userId: ID!) {
    notificationReceived(userId: $userId) {
      id
      type
      content
      relatedId
      read
      createdAt
    }
  }
`
