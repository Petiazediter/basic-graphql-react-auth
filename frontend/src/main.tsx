import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from '@/App'
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, from, fromPromise, Observable } from "@apollo/client";
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const httpLink = createHttpLink({
  uri: '/api/graphql',
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if ( error ) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    failedQueue = [];
}

const getRefreshToken = async (): Promise<string | null> => {
    try {
        const response = await fetch(`/api/refresh-token`,{
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        })
  
        if ( !response.ok ) {
          console.log('Response not ok:', response.status, response.statusText);
          throw new Error("Failed to refresh token");
        }

        const data = await response.json();
        return data.accessToken ?? null;
    } catch (error) {
        localStorage.removeItem('accessToken');
        return null;
    }
}

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem("accessToken");
  
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `${token}` : "",
    }
  }
});

const refreshTokenLink = onError(({ graphQLErrors, operation, forward }) => {
  console.log('refreshTokenLink', { graphQLErrors });
  if ( graphQLErrors ) {
    graphQLErrors.forEach((error) => {
      if ( error.extensions?.code === "UNAUTHORIZED") {
        // Validation of the access token failed on the backend;
        // probably expired, so should try the refresh token;

        // refresh token is already present in the http cookie headers for the /refresh-token endpoint, so just ping it.
        // and if it succeeds, the refresh token will be updated, and the access token will be returned;
        // and the request can be retried;
        // if the refresh token is also expired, the user will be logged out;

        if ( !isRefreshing ) {
          isRefreshing = true;

          return fromPromise(
            getRefreshToken().then((token) => {
              processQueue(null, token);
              isRefreshing = false;

              if ( token ) {
                const oldHeaders = operation.getContext().headers;
                localStorage.setItem('accessToken', token);
                operation.setContext({
                  headers: {
                    ...oldHeaders,
                    authorization: token ?? ""
                  },
                });

                return forward(operation)
              } else {
                console.log('token refresh failed');
                return;
              }
              
            }).catch((error) => {
              console.log('token refresh failed with error', error);
              processQueue(error, null);
              isRefreshing = false;

              localStorage.removeItem('accessToken');
              // window.location.href = "/login";
              return;
            })
          )
        } else {
          console.log('token refresh already in progress');

          return new Observable((observer) => {
            failedQueue.push({
              resolve: (token) => {
                if (token) {
                  const oldHeaders = operation.getContext().headers;
                  operation.setContext({
                    headers: {
                      ...oldHeaders,
                      authorization: token,
                    },
                  });
                  forward(operation).subscribe(observer);
                } else {
                  observer.error(new Error('Token refresh failed'));
                }
              },
              reject: (error) => {
                observer.error(error);
              }
            })
          })
        }
      }
    })
  } else {
    console.log('no graphql errors');
  }
});

const apolloClient = new ApolloClient({
  link: from([refreshTokenLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
    <App />
    </ApolloProvider>
  </StrictMode>,
)
