import { gql } from '@apollo/client'

// ========== Auth Queries ==========

export const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
      displayName
      avatarUrl
      bio
      reputation
      isAdmin
      createdAt
      badges {
        id
        name
        description
        icon
        earnedAt
      }
    }
  }
`

// ========== Post Queries ==========

export const FEED_QUERY = gql`
  query Feed($filter: FeedFilter, $limit: Int, $cursor: ID) {
    feed(filter: $filter, limit: $limit, cursor: $cursor) {
      posts {
        id
        content
        codeSnippet
        language
        tags
        createdAt
        likesCount
        commentsCount
        viewsCount
        upvotesCount
        viewerLiked
        viewerUpvoted
        author {
          id
          username
          displayName
          avatarUrl
          reputation
        }
      }
      hasMore
      cursor
    }
  }
`

export const POST_QUERY = gql`
  query Post($id: ID!) {
    post(id: $id) {
      id
      content
      codeSnippet
      language
      tags
      visibility
      createdAt
      updatedAt
      likesCount
      commentsCount
      viewsCount
      upvotesCount
      viewerLiked
      viewerUpvoted
      author {
        id
        username
        displayName
        avatarUrl
        reputation
      }
      comments {
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
        replies {
          id
          content
          createdAt
          author {
            id
            username
            displayName
            avatarUrl
          }
        }
      }
    }
  }
`

export const USER_POSTS_QUERY = gql`
  query UserPosts($userId: ID!, $limit: Int, $cursor: ID) {
    userPosts(userId: $userId, limit: $limit, cursor: $cursor) {
      posts {
        id
        content
        codeSnippet
        language
        tags
        createdAt
        likesCount
        commentsCount
        viewsCount
        upvotesCount
      }
      hasMore
      cursor
    }
  }
`

export const SEARCH_POSTS_QUERY = gql`
  query SearchPosts($query: String!, $limit: Int) {
    searchPosts(query: $query, limit: $limit) {
      id
      content
      codeSnippet
      tags
      createdAt
      likesCount
      commentsCount
      author {
        id
        username
        displayName
        avatarUrl
      }
    }
  }
`

// ========== Reel Queries ==========

export const REELS_QUERY = gql`
  query Reels($limit: Int, $cursor: ID) {
    reels(limit: $limit, cursor: $cursor) {
      id
      title
      description
      videoUrl
      thumbnailUrl
      duration
      tags
      createdAt
      likesCount
      commentsCount
      viewsCount
      viewerLiked
      author {
        id
        username
        displayName
        avatarUrl
        reputation
      }
    }
  }
`

export const REEL_QUERY = gql`
  query Reel($id: ID!) {
    reel(id: $id) {
      id
      title
      description
      videoUrl
      thumbnailUrl
      duration
      tags
      createdAt
      likesCount
      commentsCount
      viewsCount
      viewerLiked
      author {
        id
        username
        displayName
        avatarUrl
        reputation
      }
      comments {
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
  }
`

export const TRENDING_REELS_QUERY = gql`
  query TrendingReels($limit: Int) {
    trendingReels(limit: $limit) {
      id
      title
      videoUrl
      thumbnailUrl
      duration
      likesCount
      viewsCount
      author {
        id
        username
        displayName
        avatarUrl
      }
    }
  }
`

// ========== User Queries ==========

export const USER_QUERY = gql`
  query User($id: ID, $username: String) {
    user(id: $id, username: $username) {
      id
      username
      displayName
      email
      avatarUrl
      bio
      reputation
      isAdmin
      createdAt
      badges {
        id
        name
        description
        icon
        earnedAt
      }
    }
  }
`

export const SEARCH_USERS_QUERY = gql`
  query SearchUsers($query: String!, $limit: Int) {
    searchUsers(query: $query, limit: $limit) {
      id
      username
      displayName
      avatarUrl
      reputation
    }
  }
`

// ========== Comment Queries ==========

export const COMMENTS_QUERY = gql`
  query Comments($postId: ID, $reelId: ID, $limit: Int) {
    comments(postId: $postId, reelId: $reelId, limit: $limit) {
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
      replies {
        id
        content
        createdAt
        author {
          id
          username
          displayName
          avatarUrl
        }
      }
    }
  }
`

// ========== Notification Queries ==========

export const NOTIFICATIONS_QUERY = gql`
  query Notifications($limit: Int, $unreadOnly: Boolean) {
    notifications(limit: $limit, unreadOnly: $unreadOnly) {
      id
      type
      content
      relatedId
      read
      createdAt
    }
  }
`

export const UNREAD_NOTIFICATIONS_COUNT_QUERY = gql`
  query UnreadNotificationsCount {
    unreadNotificationsCount
  }
`

// ========== Admin Queries ==========

export const ADMIN_STATS_QUERY = gql`
  query AdminStats {
    adminStats {
      totalUsers
      activeUsers7d
      totalPosts
      totalReels
      newSignupsToday
      postsToday
      reelsToday
      totalEngagements
      trendingPosts {
        id
        content
        likesCount
        commentsCount
        viewsCount
        author {
          username
        }
      }
      trendingReels {
        id
        title
        likesCount
        viewsCount
        author {
          username
        }
      }
    }
  }
`

export const ADMIN_USERS_QUERY = gql`
  query AdminUsers($limit: Int, $cursor: ID, $filter: String) {
    adminUsers(limit: $limit, cursor: $cursor, filter: $filter) {
      id
      username
      email
      displayName
      reputation
      isAdmin
      bannedUntil
      createdAt
    }
  }
`

export const ADMIN_POSTS_QUERY = gql`
  query AdminPosts($limit: Int, $cursor: ID, $filter: String) {
    adminPosts(limit: $limit, cursor: $cursor, filter: $filter) {
      id
      content
      author {
        id
        username
      }
      createdAt
      likesCount
      commentsCount
      viewsCount
    }
  }
`

export const ADMIN_MODERATION_LOGS_QUERY = gql`
  query AdminModerationLogs($limit: Int) {
    adminModerationLogs(limit: $limit) {
      id
      action
      targetType
      targetId
      reason
      createdAt
      admin {
        username
      }
    }
  }
`

// ========== Cloudinary ==========

export const GET_CLOUDINARY_SIGNATURE_QUERY = gql`
  query GetCloudinarySignature($folder: String!) {
    getCloudinarySignature(folder: $folder) {
      signature
      timestamp
      cloudName
      apiKey
      folder
    }
  }
`
