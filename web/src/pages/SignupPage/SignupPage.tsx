import { useEffect, useRef } from 'react'

import {
  Form,
  Label,
  TextField,
  PasswordField,
  FieldError,
  Submit,
} from '@cedarjs/forms'
import { Link, navigate, routes } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'
import { toast, Toaster } from '@cedarjs/web/toast'

import { useAuth } from 'src/auth'
import Turnstile from 'src/components/Turnstile/Turnstile'

const SignupPage = () => {
  const { isAuthenticated, signUp } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      navigate(routes.home())
    }
  }, [isAuthenticated])

  const turnstileToken = useRef<string>('')

  const usernameRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    usernameRef.current?.focus()
  }, [])

  const onSubmit = async (data: Record<string, string>) => {
    const response = await signUp({
      username: data.username,
      password: data.password,
    })

    if (response.message) {
      toast(response.message)
    } else if (response.error) {
      toast.error(response.error)
    } else {
      toast.success('Welcome!')
    }
  }

  return (
    <>
      <Metadata title="Sign Up" />
      <Toaster />

      <div className="flex min-h-screen items-center justify-center bg-darker px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <img src="/images/kbr-logo.png" alt="KBR" className="mx-auto h-12" />
            <h1 className="mt-4 font-heading text-2xl font-bold tracking-wider text-white">
              SIGN UP
            </h1>
          </div>

          <div className="rounded-lg border border-white/5 bg-surface p-6">
            <Form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label
                  name="username"
                  className="mb-1 block text-sm font-medium text-white/60"
                  errorClassName="mb-1 block text-sm font-medium text-racing-red"
                >
                  Email
                </Label>
                <TextField
                  name="username"
                  className="w-full rounded border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-racing-red focus:outline-none"
                  errorClassName="w-full rounded border border-racing-red bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none"
                  ref={usernameRef}
                  placeholder="you@email.com"
                  validation={{ required: { value: true, message: 'Email is required' } }}
                />
                <FieldError name="username" className="mt-1 text-xs text-racing-red" />
              </div>

              <div>
                <Label
                  name="password"
                  className="mb-1 block text-sm font-medium text-white/60"
                  errorClassName="mb-1 block text-sm font-medium text-racing-red"
                >
                  Password
                </Label>
                <PasswordField
                  name="password"
                  className="w-full rounded border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-racing-red focus:outline-none"
                  errorClassName="w-full rounded border border-racing-red bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none"
                  autoComplete="new-password"
                  placeholder="Create a password"
                  validation={{ required: { value: true, message: 'Password is required' } }}
                />
                <FieldError name="password" className="mt-1 text-xs text-racing-red" />
              </div>

              <Turnstile
                onVerify={(token) => { turnstileToken.current = token }}
                onExpire={() => { turnstileToken.current = '' }}
              />

              <Submit className="w-full rounded bg-racing-red py-2.5 font-heading text-sm font-bold tracking-wider text-white transition-colors hover:bg-racing-red-bright">
                CREATE ACCOUNT
              </Submit>
            </Form>
          </div>

          <p className="mt-6 text-center text-sm text-white/30">
            Already have an account?{' '}
            <Link to={routes.login()} className="text-gold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}

export default SignupPage
