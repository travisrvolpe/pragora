// lib/graphql/apollo-client.ts
import { ApolloClient, InMemoryCache, split, HttpLink, from } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { toast } from '@/lib/hooks/use-toast';
import { authService } from '@/lib/services/auth/authService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

let _apolloClient: ApolloClient<any> | null = null;

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}, Operation: ${operation.operationName}`
      );

      if (typeof window !== 'undefined') {
        toast({
          title: "GraphQL Error",
          description: message,
          variant: "destructive"
        });
      }
    });
  }
  if (networkError) {
    console.error(`[Network error]:`, networkError);
    if (typeof window !== 'undefined') {
      toast({
        title: "Network Error",
        description: "Connection problem. Please check your internet connection.",
        variant: "destructive"
      });
    }
  }
});

function createApolloClient() {
  const httpLink = new HttpLink({
    uri: API_ENDPOINTS.GRAPHQL,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    fetch: async (uri, options = {}) => {
      const token = authService.getToken();
      const headers = new Headers(options.headers || {});
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      const response = await fetch(uri, {
        ...options,
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('GraphQL Response Error:', {
          status: response.status,
          statusText: response.statusText
        });
      }

      return response;
    }
  });

  // Create WebSocket link only in browser
  let finalLink = from([errorLink, httpLink]);

  if (typeof window !== 'undefined') {
    const wsLink = new GraphQLWsLink(
      createClient({
        url: API_ENDPOINTS.GRAPHQL_WS,
        connectionParams: () => {
          const token = authService.getToken();
          console.log('WS Connection:', { hasToken: !!token });
          return {
            Authorization: token ? `Bearer ${token}` : '',
            credentials: 'include'
          };
        },
        retryAttempts: 5,
        shouldRetry: (errOrCloseEvent) => {
          console.error('WS Connection error:', errOrCloseEvent);
          return true;
        },
        on: {
          connected: () => console.log('✅ WS Connected'),
          error: (error) => {
            console.error('❌ WS Error:', error);
            const token = authService.getToken();
            console.error('Auth state during WS error:', { hasToken: !!token });
          },
          closed: () => console.log('WS Closed')
        }
      })
    );

    finalLink = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      finalLink
    );
  }

  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          comments: {
            merge(existing = [], incoming) {
              return incoming;
            }
          },
          posts: {
            merge(existing = [], incoming) {
              return incoming;
            }
          }
        }
      }
    }
  });

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: finalLink,
    cache,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      }
    },
    connectToDevTools: process.env.NODE_ENV === 'development'
  });
}

function initializeApollo(initialState = null) {
  const client = _apolloClient ?? createApolloClient();

  // If your page has Next.js data fetching methods that use Apollo Client,
  // the initial state gets hydrated here
  if (initialState) {
    client.cache.restore(initialState);
  }

  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return client;

  // Create the Apollo Client once in the client
  if (!_apolloClient) _apolloClient = client;

  return client;
}

// Add client-side error handling
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
    if (event.reason?.networkError || event.reason?.graphQLErrors) {
      console.error('Apollo Error:', {
        networkError: event.reason.networkError,
        graphQLErrors: event.reason.graphQLErrors
      });
    }
  });
}

// Export a single instance
export const apolloClient = initializeApollo();