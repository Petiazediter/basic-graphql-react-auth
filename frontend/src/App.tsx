import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { type Test } from '@basic-graphql-react-auth/utils'
import './App.css'
import { useQuery } from '@apollo/client'
import { HEALTH_CHECK_QUERY } from './App.graphql'
import { type HealthCheckQuery, type HealthCheckQueryVariables } from './__generated__/App.graphql'
import { AuthForm } from '@/auth/AuthForm'

function App() {
  const [count, setCount] = useState(0)

  const { data, loading, error } = useQuery<HealthCheckQuery, HealthCheckQueryVariables>(HEALTH_CHECK_QUERY);

  const userTest: Test = {
    userId: '123',
    emailAddress: 'test@test.com'
  }

  if ( loading ) {
    return <div>Loading...</div>
  }

  if ( !data || error ) {
    return <div>Something went wrong...</div>
  }
  
  return (
    <>
      <AuthForm />
      <div>
        GRAPHQL HEALTH CHECK: { data.ok ? 'OK' : 'NOT OK' }
      </div>
    </>
  )
}

export default App
