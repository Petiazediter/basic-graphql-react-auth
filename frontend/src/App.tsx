import './App.css'
import { useLazyQuery, useQuery } from '@apollo/client'
import { CHECK_MY_ROLE_AGAINST_QUERY, HEALTH_CHECK_QUERY, IS_USER_AUTHENTICATED_QUERY } from './App.graphql'
import { type IsUserAuthenticatedQuery, type HealthCheckQuery, type HealthCheckQueryVariables, type CheckMyRoleAgainstQuery, type CheckMyRoleAgainstQueryVariables } from './__generated__/App.graphql'
import { AuthForm } from '@/auth/AuthForm'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './auth/context/AuthContext'
import { ApplicationAccessLevel } from './__generated__/graphql'

function App() {
  const { isAuthenticated } = useAuth();
  const { data, loading, error } = useQuery<HealthCheckQuery, HealthCheckQueryVariables>(HEALTH_CHECK_QUERY);
  const [isAuthenticatedQuery, { data: isAuthenticatedData, loading: isAuthenticatedLoading }] = useLazyQuery<IsUserAuthenticatedQuery>(IS_USER_AUTHENTICATED_QUERY, {
    nextFetchPolicy: 'no-cache',
    fetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true,
  });

  const [checkMyRoleAgainstQuery, { data: checkMyRoleAgainstData }] = useLazyQuery<CheckMyRoleAgainstQuery, CheckMyRoleAgainstQueryVariables>(CHECK_MY_ROLE_AGAINST_QUERY);
  
  // Check authentication status on component mount
  useEffect( () => {
    isAuthenticatedQuery();
  }, [])

  const handleAuthSuccess = () => {
    isAuthenticatedQuery();
  }

  const [role, setRole] = useState<ApplicationAccessLevel>(ApplicationAccessLevel.Guest);
  const [isExact, setIsExact] = useState<boolean>(false);

  const handleCheckMyRoleAgainsQuery = useCallback( () => {
    checkMyRoleAgainstQuery({
      variables: {
        role,
        isExact,
      }
    })
  }, [checkMyRoleAgainstQuery, role, isExact])

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
        <br />
        <select value={role} onChange={(e) => setRole(e.target.value as ApplicationAccessLevel)}>
          <option value={ApplicationAccessLevel.Guest}>Guest</option>
          <option value={ApplicationAccessLevel.User}>User</option>
          <option value={ApplicationAccessLevel.Admin}>Admin</option>
          <option value={ApplicationAccessLevel.SuperAdmin}>Super Admin</option>
        </select>
        <input type="checkbox" checked={isExact} onChange={(e) => setIsExact(e.target.checked)} />
        <button onClick={handleCheckMyRoleAgainsQuery}>Check</button>

        Am I {isExact ? 'exactly ': ''}{role}? Well: { checkMyRoleAgainstData ? checkMyRoleAgainstData.checkMyRoleAgainst ? 'YES' : 'NO' : "not checked"}
      </div>
    </>
  )
}

export default App
