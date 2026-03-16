import { useEffect, useRef, useState } from 'react'

import { Form, Label, PasswordField, Submit, FieldError } from '@cedarjs/forms'
import { navigate, routes } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'
import { toast, Toaster } from '@cedarjs/web/toast'

import { useAuth } from 'src/auth'

const ResetPasswordPage = ({ resetToken }: { resetToken: string }) => {
  const { isAuthenticated, reauthenticate, validateResetToken, resetPassword } =
    useAuth()
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      navigate(routes.home())
    }
  }, [isAuthenticated])

  useEffect(() => {
    const validateToken = async () => {
      const response = await validateResetToken(resetToken)
      if (response.error) {
        setEnabled(false)
        toast.error(response.error)
      } else {
        setEnabled(true)
      }
    }
    validateToken()
  }, [resetToken, validateResetToken])

  const passwordRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    passwordRef.current?.focus()
  }, [])

  const onSubmit = async (data: Record<string, string>) => {
    const response = await resetPassword({
      resetToken,
      password: data.password,
    })

    if (response.error) {
      toast.error(response.error)
    } else {
      toast.success('Password changed!')
      await reauthenticate()
      navigate(routes.login())
    }
  }

  return (
    <>
      <Metadata title="Reset Password" />
      <Toaster />

      <div className="flex min-h-screen items-center justify-center bg-darker px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <img src="/images/kbr-logo.png" alt="KBR" className="mx-auto h-12" />
            <h1 className="mt-4 font-heading text-2xl font-bold tracking-wider text-white">
              RESET PASSWORD
            </h1>
            <p className="mt-2 text-sm text-white/40">
              Enter your new password below.
            </p>
          </div>

          <div className="rounded-lg border border-white/5 bg-surface p-6">
            <Form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label
                  name="password"
                  className="mb-1 block text-sm font-medium text-white/60"
                  errorClassName="mb-1 block text-sm font-medium text-racing-red"
                >
                  New Password
                </Label>
                <PasswordField
                  name="password"
                  autoComplete="new-password"
                  className="w-full rounded border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-racing-red focus:outline-none"
                  errorClassName="w-full rounded border border-racing-red bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none"
                  disabled={!enabled}
                  ref={passwordRef}
                  placeholder="New password"
                  validation={{ required: { value: true, message: 'New password is required' } }}
                />
                <FieldError name="password" className="mt-1 text-xs text-racing-red" />
              </div>

              <Submit
                className="w-full rounded bg-racing-red py-2.5 font-heading text-sm font-bold tracking-wider text-white transition-colors hover:bg-racing-red-bright disabled:opacity-50"
                disabled={!enabled}
              >
                RESET PASSWORD
              </Submit>
            </Form>
          </div>
        </div>
      </div>
    </>
  )
}

export default ResetPasswordPage
