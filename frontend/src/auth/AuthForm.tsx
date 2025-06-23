import { useCallback } from 'react';
import { Controller, FormProvider, useForm, type SubmitHandler } from 'react-hook-form';

type InputForm = {
  email: string;
  password: string;
}

export const AuthForm = () => {
  const form = useForm<InputForm>({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit: SubmitHandler<InputForm> = useCallback((formData, event) => {
    event?.preventDefault();
    console.log('Data!', formData);
  },[])

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
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
        <button type='submit'>Submit button</button>
      </form>
    </FormProvider>
  )
}