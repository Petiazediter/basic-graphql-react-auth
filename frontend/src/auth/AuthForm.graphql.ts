import { gql } from "@apollo/client";

export const SIGN_IN_MUTATION = gql`
  mutation AuthSignIn($input: LoginInput!) {
    login(input: $input)
  }
`

export const SIGN_UP_MUTATION = gql`
  mutation AuthSignUp($input: CreateUserInput!) {
    createUser(input: $input)
  }
`