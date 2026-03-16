import { useRef } from 'react'

import { Form, TextField, TextAreaField, Submit, FieldError, Label } from '@cedarjs/forms'
import { useMutation } from '@cedarjs/web'
import { toast, Toaster } from '@cedarjs/web/toast'

import Turnstile from 'src/components/Turnstile/Turnstile'

const CREATE_CONTACT = gql`
  mutation CreateContactMutation($input: CreateContactMessageInput!) {
    createContactMessage(input: $input) {
      id
    }
  }
`

const ContactForm = () => {
  const turnstileToken = useRef<string>('')

  const [create, { loading }] = useMutation(CREATE_CONTACT, {
    onCompleted: () => {
      toast.success('Message sent! We\'ll get back to you soon.')
    },
    onError: (error) => {
      toast.error(error.message || 'Something went wrong. Please try again.')
    },
  })

  const onSubmit = (data: Record<string, string>) => {
    create({
      variables: {
        input: {
          ...data,
          turnstileToken: turnstileToken.current || undefined,
        },
      },
    })
  }

  return (
    <>
      <Toaster />
      <Form onSubmit={onSubmit} className="mx-auto max-w-lg space-y-6">
        <div>
          <Label name="name" className="mb-1 block text-sm font-medium text-gray-300">
            Name
          </Label>
          <TextField
            name="name"
            validation={{ required: true }}
            className="w-full rounded border border-white/10 bg-surface px-4 py-3 text-white placeholder-gray-500 focus:border-gold focus:outline-none"
            placeholder="Your name"
          />
          <FieldError name="name" className="mt-1 text-sm text-racing-red" />
        </div>

        <div>
          <Label name="email" className="mb-1 block text-sm font-medium text-gray-300">
            Email
          </Label>
          <TextField
            name="email"
            validation={{ required: true, pattern: { value: /^\S+@\S+$/i, message: 'Please enter a valid email' } }}
            className="w-full rounded border border-white/10 bg-surface px-4 py-3 text-white placeholder-gray-500 focus:border-gold focus:outline-none"
            placeholder="your@email.com"
          />
          <FieldError name="email" className="mt-1 text-sm text-racing-red" />
        </div>

        <div>
          <Label name="message" className="mb-1 block text-sm font-medium text-gray-300">
            Message
          </Label>
          <TextAreaField
            name="message"
            validation={{ required: true }}
            className="w-full rounded border border-white/10 bg-surface px-4 py-3 text-white placeholder-gray-500 focus:border-gold focus:outline-none"
            rows={5}
            placeholder="Your message..."
          />
          <FieldError name="message" className="mt-1 text-sm text-racing-red" />
        </div>

        <Turnstile
          onVerify={(token) => { turnstileToken.current = token }}
          onExpire={() => { turnstileToken.current = '' }}
        />

        <Submit
          disabled={loading}
          className="w-full rounded bg-racing-red px-8 py-3 font-heading text-sm tracking-wider text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'SENDING...' : 'SEND MESSAGE'}
        </Submit>
      </Form>
    </>
  )
}

export default ContactForm
