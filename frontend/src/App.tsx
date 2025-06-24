import './App.css'
import { useLazyQuery, useQuery } from '@apollo/client'
import { HEALTH_CHECK_QUERY, IS_USER_AUTHENTICATED_QUERY } from './App.graphql'
import { type IsUserAuthenticatedQuery, type HealthCheckQuery, type HealthCheckQueryVariables } from './__generated__/App.graphql'
import { AuthForm } from '@/auth/AuthForm'
import { useEffect } from 'react'

function App() {
  const { data, loading, error } = useQuery<HealthCheckQuery, HealthCheckQueryVariables>(HEALTH_CHECK_QUERY);
  const [isAuthenticatedQuery, { data: isAuthenticatedData, loading: isAuthenticatedLoading }] = useLazyQuery<IsUserAuthenticatedQuery>(IS_USER_AUTHENTICATED_QUERY, {
    nextFetchPolicy: 'no-cache',
    fetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true,
  });
  
  // Check authentication status on component mount
  useEffect(() => {
    console.log('Component mounted, checking authentication status...');
    isAuthenticatedQuery();
  }, []); // Empty dependency array - only run once on mount

  if (loading) {
    return <div>Loading...</div>
  }

  if (!data || error) {
    return <div>Something went wrong...</div>
  }

  const handleAuthSuccess = () => {
    console.log('Auth success, refetching authentication status...');
    // Force a fresh query after authentication
    isAuthenticatedQuery({ nextFetchPolicy: 'network-only', fetchPolicy: 'network-only', notifyOnNetworkStatusChange: true}).then( (result) =>{
      console.log('Auth success, refetching authentication status...', result.data);
    });
  }

  if (isAuthenticatedLoading) {
    return <div>Loading authentication status...</div>
  }

  return (
    <>
      {(!isAuthenticatedData?.isUserAuthenticated) && <AuthForm 
        onSuccess={handleAuthSuccess} 
      />}
      <div>
        GRAPHQL HEALTH CHECK: {data.ok ? 'OK' : 'NOT OK'}
        IS USER AUTHENTICATED: {isAuthenticatedData?.isUserAuthenticated ? 'YES' : 'NO'}
      </div>
    </>
  )
}

export default App
