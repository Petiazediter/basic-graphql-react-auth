import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { type Test } from '@basic-graphql-react-auth/utils'
import './App.css'
import { useQuery } from '@apollo/client'
import { HEALTH_CHECK_QUERY } from './App.graphql'
import { type HealthCheckQuery, type HealthCheckQueryVariables } from './__generated__/App.graphql'

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
      <div>
        GRAPHQL HEALTH CHECK: { data.ok ? 'OK' : 'NOT OK' }
      </div>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          { userTest.userId }, { userTest.emailAddress }
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
