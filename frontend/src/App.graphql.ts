import { gql } from "@apollo/client";

export const HEALTH_CHECK_QUERY = gql`
  query HealthCheck {
    ok
  }
`

export const IS_USER_AUTHENTICATED_QUERY = gql`
  query IsUserAuthenticated {
    isUserAuthenticated
  }
`
