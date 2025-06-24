import { ApolloError, useApolloClient, useMutation, type FetchResult } from '@apollo/client';
import { useCallback, useState } from 'react';
import { Controller, FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import { SIGN_IN_MUTATION, SIGN_UP_MUTATION } from './AuthForm.graphql';
import { type AuthSignInMutation, type AuthSignInMutationVariables, type AuthSignUpMutation, type AuthSignUpMutationVariables } from './__generated__/AuthForm.graphql';
import { useAuth } from './useAuth';

type InputForm = {
  email: string;
  password: string;
  passwordConfirmation: string;
}

export const AuthForm = () => {
  const form = useForm<InputForm>({
    defaultValues: {
      email: '',
      password: '',
      passwordConfirmation: ''
    }
  });

  const [isRegister, setIsRegister] = useState(false);
  const { login } = useAuth();

  const [signInMutation, { loading: isSignInMutationLoading }] = useMutation<AuthSignInMutation, AuthSignInMutationVariables>(SIGN_IN_MUTATION)
  const [signUpMutation, { loading: isSignUpMutationLoading }] = useMutation<AuthSignUpMutation, AuthSignUpMutationVariables>(SIGN_UP_MUTATION)

  const isLoading: boolean = isSignInMutationLoading || isSignUpMutationLoading;

  const onSubmit: SubmitHandler<InputForm> = (formData, event) => {
    event?.preventDefault();

    if ( !isRegister) {
      signInMutation({
        variables: {
          input: {
            email: formData.email,
            password: formData.password
          }
        }
      }).then((value) => {
        const valueData = value as FetchResult<AuthSignInMutation>
        if ( value && value.data ) {
          const token = valueData.data?.login;
          if ( token ) {
            login(token);
          } else {
            throw new Error('No token found');
          }
        }
      }).catch((reason) => {
        if ( reason instanceof ApolloError) {
          console.log({ reason: reason.message })
        } else {
          console.error('Unknown error', reason);
        }
      })
    } else {
      if ( formData.password !== formData.passwordConfirmation ) {
        throw new ApolloError({ errorMessage: "Passwords do not match" })
      }
      signUpMutation({
        variables: {
          input: {
            email: formData.email,
            password: formData.password
          }
        }
      }).then((value) => {
        const valueData = value as FetchResult<AuthSignUpMutation>
        if ( value && value.data ) {
          const token = valueData.data?.createUser;
          if ( token ) {
            login(token);
          } else {
            throw new Error('No token found');
          }
        }
      }).catch((reason) => {
        if ( reason instanceof ApolloError) {
          console.log({ reason: reason.message })
        } else {
          console.error('Unknown error', reason);
        }
      })
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '10px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px'}}>
        <Controller control={form.control} 
          name='email'
          rules={{ required: true }}
          render={({ field }) => (
            <input type='email' placeholder='Type your email...' {...field} />
          )}
        />
        <Controller control={form.control}
          name="password"
          rules={{ required: { value: true, message: "Password is required" }, minLength: { value: 8, message: "Password must be at least 8 characters long" } }}
          render={({ field }) => 
            <input type="password" placeholder='Type your password...' {...field} />
          }
        />
        { isRegister && (
          <Controller control={form.control}
            name="passwordConfirmation"
            rules={{ required: { value: true, message: "Password confirmation is required" }, minLength: { value: 8, message: "Password must be at least 8 characters long" } }}
            render={({ field }) => 
              <input type="password" placeholder='Type your password...' {...field} />
            }
          />
        )}
        <button type='submit' disabled={isLoading}>{ isRegister ? "Sign up" : "Sign in" }</button>
        <button type="button" onClick={() => setIsRegister(isRegister => !isRegister)}>I would rather {isRegister ? 'sign in' : 'register'}</button>
      </form>
    </FormProvider>
  )
}