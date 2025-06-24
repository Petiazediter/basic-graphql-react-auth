import './App.css'
import { useQuery } from '@apollo/client'
import { HEALTH_CHECK_QUERY, IS_USER_AUTHENTICATED_QUERY } from './App.graphql'
import { type IsUserAuthenticatedQuery, type HealthCheckQuery, type HealthCheckQueryVariables } from './__generated__/App.graphql'
import { AuthForm } from '@/auth/AuthForm'
import { useAuth } from './auth/useAuth'

function App() {
  const { isAuthenticated } = useAuth();

  const { data, loading, error } = useQuery<HealthCheckQuery, HealthCheckQueryVariables>(HEALTH_CHECK_QUERY);
  const { data: isAuthenticatedData } = useQuery<IsUserAuthenticatedQuery>(IS_USER_AUTHENTICATED_QUERY);
  
  if ( loading ) {
    return <div>Loading...</div>
  }

  if ( !data || error ) {
    return <div>Something went wrong...</div>
  }
  
  return (
    <>
      { (!isAuthenticated || isAuthenticatedData?.isUserAuthenticated === false) && <AuthForm /> }
      <div>
        GRAPHQL HEALTH CHECK: { data.ok ? 'OK' : 'NOT OK' }
        IS USER AUTHENTICATED: { isAuthenticatedData?.isUserAuthenticated ? 'YES' : 'NO' }
      </div>
    </>
  )
}

export default App
