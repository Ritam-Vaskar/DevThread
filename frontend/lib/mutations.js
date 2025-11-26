import { gql } from '@apollo/client'

// ========== Auth Mutations ==========

export const SIGNUP_MUTATION = gql`
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      accessToken
      refreshToken
      user {
        id
        username
        email
        displayName
        avatarUrl
        reputation
      }
    }
  }
`

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      user {
        id
        username
        email
        displayName
        avatarUrl
        reputation
        isAdmin
      }
    }
  }
`

export const LOGIN_WITH_GITHUB_MUTATION = gql`
  mutation LoginWithGithub($code: String!) {
    loginWithGithub(code: $code) {
      accessToken
      refreshToken
      user {
        id
        username
        email
        displayName
        avatarUrl
        reputation
      }
    }
  }
`

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`

// ========== Post Mutations ==========

export const CREATE_POST_MUTATION = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
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
      author {
        id
        username
        displayName
        avatarUrl
      }
    }
  }
`

export const UPDATE_POST_MUTATION = gql`
  mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) {
      id
      content
      codeSnippet
      language
      tags
      updatedAt
    }
  }
`

export const DELETE_POST_MUTATION = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`

export const LIKE_POST_MUTATION = gql`
  mutation LikePost($id: ID!) {
    likePost(id: $id)
  }
`

export const UPVOTE_POST_MUTATION = gql`
  mutation UpvotePost($id: ID!) {
    upvotePost(id: $id)
  }
`

// ========== Reel Mutations ==========

export const CREATE_REEL_MUTATION = gql`
  mutation CreateReel($input: CreateReelInput!) {
    createReel(input: $input) {
      id
      title
      description
      videoUrl
      thumbnailUrl
      duration
      tags
      createdAt
      author {
        id
        username
        displayName
        avatarUrl
      }
    }
  }
`

export const LIKE_REEL_MUTATION = gql`
  mutation LikeReel($id: ID!) {
    likeReel(id: $id)
  }
`

export const DELETE_REEL_MUTATION = gql`
  mutation DeleteReel($id: ID!) {
    deleteReel(id: $id)
  }
`

// ========== Comment Mutations ==========

export const CREATE_COMMENT_MUTATION = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
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

export const DELETE_COMMENT_MUTATION = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id)
  }
`

export const LIKE_COMMENT_MUTATION = gql`
  mutation LikeComment($id: ID!) {
    likeComment(id: $id)
  }
`

// ========== Profile Mutations ==========

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      displayName
      bio
      avatarUrl
      updatedAt
    }
  }
`

// ========== Notification Mutations ==========

export const MARK_NOTIFICATION_READ_MUTATION = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id)
  }
`

export const MARK_ALL_NOTIFICATIONS_READ_MUTATION = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`

// ========== Admin Mutations ==========

export const ADMIN_BAN_USER_MUTATION = gql`
  mutation AdminBanUser($input: AdminBanUserInput!) {
    adminBanUser(input: $input)
  }
`

export const ADMIN_UNBAN_USER_MUTATION = gql`
  mutation AdminUnbanUser($userId: ID!) {
    adminUnbanUser(userId: $userId)
  }
`

export const ADMIN_DELETE_POST_MUTATION = gql`
  mutation AdminDeletePost($postId: ID!, $reason: String!) {
    adminDeletePost(postId: $postId, reason: $reason)
  }
`

export const ADMIN_UPDATE_USER_REPUTATION_MUTATION = gql`
  mutation AdminUpdateUserReputation($userId: ID!, $reputation: Int!) {
    adminUpdateUserReputation(userId: $userId, reputation: $reputation)
  }
`
