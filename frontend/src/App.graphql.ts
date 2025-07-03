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

export const CHECK_MY_ROLE_AGAINST_QUERY = gql`
  query CheckMyRoleAgainst($role: ApplicationAccessLevel!, $isExact: Boolean!) {
    checkMyRoleAgainst(role: $role, isExact: $isExact)
  }
`
