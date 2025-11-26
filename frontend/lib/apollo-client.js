import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { WebSocketLink } from '@apollo/client/link/ws'
import { getMainDefinition } from '@apollo/client/utilities'

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8080/graphql',
})

const authLink = setContext((_, { headers }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

// WebSocket link for subscriptions (client-side only)
const wsLink =
  typeof window !== 'undefined'
    ? new WebSocketLink({
        uri: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL || 'ws://localhost:8080/graphql',
        options: {
          reconnect: true,
          connectionParams: () => ({
            authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          }),
        },
      })
    : null

// Split links based on operation type
const splitLink =
  typeof window !== 'undefined' && wsLink
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query)
          return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
        },
        wsLink,
        authLink.concat(httpLink),
      )
    : authLink.concat(httpLink)

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          feed: {
            keyArgs: ['filter'],
            merge(existing, incoming, { args }) {
              if (!existing) return incoming
              if (!args?.cursor) return incoming // Fresh query

              return {
                ...incoming,
                posts: [...existing.posts, ...incoming.posts],
              }
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
})

export default client
