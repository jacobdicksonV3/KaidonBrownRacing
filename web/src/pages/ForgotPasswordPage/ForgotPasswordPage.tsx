import { useEffect, useRef } from 'react'

import { Form, Label, TextField, Submit, FieldError } from '@cedarjs/forms'
import { Link, navigate, routes } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'
import { toast, Toaster } from '@cedarjs/web/toast'

import { useAuth } from 'src/auth'

const ForgotPasswordPage = () => {
  const { isAuthenticated, forgotPassword } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      navigate(routes.home())
    }
  }, [isAuthenticated])

  const usernameRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    usernameRef?.current?.focus()
  }, [])

  const onSubmit = async (data: { username: string }) => {
    const response = await forgotPassword(data.username)

    if (response.error) {
      toast.error(response.error)
    } else {
      toast.success(
        'A link to reset your password was sent to ' + response.email
      )
      navigate(routes.login())
    }
  }

  return (
    <>
      <Metadata title="Forgot Password" />
      <Toaster />

      <div className="flex min-h-screen items-center justify-center bg-darker px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <img src="/images/kbr-logo.png" alt="KBR" className="mx-auto h-12" />
            <h1 className="mt-4 font-heading text-2xl font-bold tracking-wider text-white">
              FORGOT PASSWORD
            </h1>
            <p className="mt-2 text-sm text-white/40">
              Enter your email and we&apos;ll send you a reset link.
            </p>
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

              <Submit className="w-full rounded bg-racing-red py-2.5 font-heading text-sm font-bold tracking-wider text-white transition-colors hover:bg-racing-red-bright">
                SEND RESET LINK
              </Submit>
            </Form>
          </div>

          <p className="mt-6 text-center text-sm text-white/30">
            <Link to={routes.login()} className="text-gold hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}

export default ForgotPasswordPage
