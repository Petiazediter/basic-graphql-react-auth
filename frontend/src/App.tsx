import './App.css'
import { useLazyQuery, useQuery } from '@apollo/client'
import { HEALTH_CHECK_QUERY, IS_USER_AUTHENTICATED_QUERY } from './App.graphql'
import { type IsUserAuthenticatedQuery, type HealthCheckQuery, type HealthCheckQueryVariables } from './__generated__/App.graphql'
import { AuthForm } from '@/auth/AuthForm'
import { useEffect } from 'react'
import { useAuth } from './auth/context/AuthContext'

function App() {
  const { isAuthenticated } = useAuth();
  const { data, loading, error } = useQuery<HealthCheckQuery, HealthCheckQueryVariables>(HEALTH_CHECK_QUERY);
  const [isAuthenticatedQuery, { data: isAuthenticatedData, loading: isAuthenticatedLoading }] = useLazyQuery<IsUserAuthenticatedQuery>(IS_USER_AUTHENTICATED_QUERY, {
    nextFetchPolicy: 'no-cache',
    fetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true,
  });
  
  // Check authentication status on component mount
  useEffect( () => {
    isAuthenticatedQuery();
  }, [])

  const handleAuthSuccess = () => {
    isAuthenticatedQuery();
  }

  if (loading) {
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
      {(!isAuthenticated) && (
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
