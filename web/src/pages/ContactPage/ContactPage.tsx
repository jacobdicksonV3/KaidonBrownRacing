import { Metadata } from '@cedarjs/web'

import SectionHeading from 'src/components/SectionHeading/SectionHeading'
import ContactForm from 'src/components/ContactForm/ContactForm'

const ContactPage = () => {
  return (
    <>
      <Metadata title="Contact" description="Get in touch with Kaidon Brown Racing" />

      <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <SectionHeading title="CONTACT US" subtitle="Get in touch with the team" />
        <ContactForm />
      </section>
    </>
  )
}

export default ContactPage
