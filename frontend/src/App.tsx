import './App.css'
import { useLazyQuery, useQuery } from '@apollo/client'
import { HEALTH_CHECK_QUERY, IS_USER_AUTHENTICATED_QUERY } from './App.graphql'
import { type IsUserAuthenticatedQuery, type HealthCheckQuery, type HealthCheckQueryVariables } from './__generated__/App.graphql'
import { AuthForm } from '@/auth/AuthForm'
import { useEffect, useState } from 'react'

function App() {
  const { data, loading, error } = useQuery<HealthCheckQuery, HealthCheckQueryVariables>(HEALTH_CHECK_QUERY);
  const [isAuthenticatedQuery, { data: isAuthenticatedData, loading: isAuthenticatedLoading, error: isAuthenticatedError }] = useLazyQuery<IsUserAuthenticatedQuery>(IS_USER_AUTHENTICATED_QUERY, {
    nextFetchPolicy: 'no-cache',
    fetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Check authentication status on component mount
  useEffect( () => {
    isAuthenticatedQuery();
  }, [])

  useEffect(() => {
    if (isAuthenticatedError) {
      console.log('Authentication error detected, token refresh might be in progress...');
      setIsRefreshing(true);
      
      // Wait a bit for the refresh token mechanism to work
      const timer = setTimeout(() => {
        setIsRefreshing(false);
        // Retry the authentication query
        isAuthenticatedQuery();
      }, 2000); // Wait 2 seconds for refresh to complete
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticatedError, isAuthenticatedQuery]);

  const handleAuthSuccess = () => {
    console.log('Auth success, refetching authentication status...');
    // Force a fresh query after authentication
    isAuthenticatedQuery({ nextFetchPolicy: 'network-only', fetchPolicy: 'network-only', notifyOnNetworkStatusChange: true}).then( (result) =>{
      console.log('Auth success, refetching authentication status...', result.data);
    });
  }

  if (loading || isRefreshing) {
    return <div>Loading...</div>
  }

  if (!data || error) {
    return <div>Something went wrong...</div>
  }

  if (isAuthenticatedLoading) {
    return <div>Loading authentication status...</div>
  }

  return (
    <>
      {(!isAuthenticatedData?.isUserAuthenticated) && (
        <AuthForm onSuccess={handleAuthSuccess} />
      )}
      <div>
        GRAPHQL HEALTH CHECK: {data.ok ? 'OK' : 'NOT OK'}
        <button onClick={handleAuthSuccess}>Refetch</button>
        IS USER AUTHENTICATED: {isAuthenticatedData?.isUserAuthenticated ? 'YES' : 'NO'}
      </div>
    </>
  )
}

export default App
