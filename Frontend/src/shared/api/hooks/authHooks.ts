import { useMutation } from '@tanstack/react-query'
import { authApi, type LoginResponse, type SignupResponse } from '@/shared/api/authApi'
import { useToast } from '@/shared/ui/toast'

export function useLogin() {
  const toast = useToast()

  return useMutation<LoginResponse, Error, { email: string; password: string }>(
    (payload) => authApi.login(payload),
    {
      onError: (err) => {
        toast({ title: 'Login failed', description: err?.message ?? 'Unable to sign in', type: 'error' })
      },
      onSuccess: (res) => {
        toast({ title: 'Signed in', description: `Welcome ${res.user.full_name ?? res.user.email}`, type: 'success' })
      },
    },
  )
}

export function useSignup() {
  const toast = useToast()

  return useMutation<SignupResponse, Error, Parameters<typeof authApi.signup>[0]>(
    (payload) => authApi.signup(payload),
    {
      onError: (err) => toast({ title: 'Signup failed', description: err?.message ?? 'Unable to create account', type: 'error' }),
      onSuccess: (res) => toast({ title: 'Account created', description: `Account created for ${res.user_id}`, type: 'success' }),
    },
  )
}

export default { useLogin, useSignup }
