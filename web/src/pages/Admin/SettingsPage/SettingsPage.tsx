import { useState, useEffect } from 'react'

import { Metadata } from '@cedarjs/web'
import type { CellSuccessProps, CellFailureProps } from '@cedarjs/web'
import { createCell } from '@cedarjs/web'
import { useMutation } from '@cedarjs/web'
import { toast, Toaster } from '@cedarjs/web/toast'
import { Save, Truck, Mail } from 'lucide-react'

import { useAuth } from 'src/auth'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from 'src/components/ui/card'

const QUERY = gql`
  query AdminSettingsQuery {
    siteSettings {
      key
      value
    }
  }
`

const UPDATE_SETTINGS = gql`
  mutation UpdateSiteSettings($settings: [UpdateSettingsInput!]!) {
    updateSiteSettings(settings: $settings) {
      key
      value
    }
  }
`

const Loading = () => (
  <div className="grid gap-6 md:grid-cols-2">
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={i}><CardContent className="p-6"><div className="h-32 animate-pulse rounded bg-white/5" /></CardContent></Card>
    ))}
  </div>
)

const Failure = ({ error }: CellFailureProps) => (
  <div className="text-racing-red">Error: {error?.message}</div>
)

const Success = ({ siteSettings: settings }: CellSuccessProps) => {
  const { currentUser } = useAuth()

  const getSetting = (key: string, fallback: string) => {
    const found = settings.find((s) => s.key === key)
    return found ? found.value : fallback
  }

  const [adminEmail, setAdminEmail] = useState(getSetting('admin_email', ''))

  const [shippingAu, setShippingAu] = useState(
    (parseInt(getSetting('shipping_rate_au', '1000'), 10) / 100).toFixed(2)
  )
  const [shippingIntl, setShippingIntl] = useState(
    (parseInt(getSetting('shipping_rate_intl', '2500'), 10) / 100).toFixed(2)
  )

  const [updateSettings, { loading }] = useMutation(UPDATE_SETTINGS, {
    onCompleted: () => toast.success('Settings saved'),
    onError: (err) => toast.error(err.message),
    refetchQueries: ['AdminSettingsQuery'],
  })

  const handleSaveShipping = () => {
    updateSettings({
      variables: {
        settings: [
          { key: 'shipping_rate_au', value: String(Math.round(parseFloat(shippingAu) * 100)) },
          { key: 'shipping_rate_intl', value: String(Math.round(parseFloat(shippingIntl) * 100)) },
        ],
      },
    })
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-white/40" />
            Shipping Rates
          </CardTitle>
          <CardDescription>Flat-rate shipping. Per-product surcharges are set on each product.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Australia (AUD)</Label>
              <Input
                type="number"
                step="0.01"
                value={shippingAu}
                onChange={(e) => setShippingAu(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>International (AUD)</Label>
              <Input
                type="number"
                step="0.01"
                value={shippingIntl}
                onChange={(e) => setShippingIntl(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button onClick={handleSaveShipping} disabled={loading} size="sm">
              <Save className="mr-2 h-3 w-3" />
              {loading ? 'Saving...' : 'Save Rates'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-white/40" />
            Email Notifications
          </CardTitle>
          <CardDescription>Order confirmation emails are sent to both the customer and this admin address.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Admin Email</Label>
              <Input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="mt-1"
                placeholder="admin@kaidonbrownracing.com"
              />
              <p className="mt-1 text-xs text-white/30">Receives a notification for every new order.</p>
            </div>
            <Button
              onClick={() =>
                updateSettings({
                  variables: { settings: [{ key: 'admin_email', value: adminEmail }] },
                })
              }
              disabled={loading}
              size="sm"
            >
              <Save className="mr-2 h-3 w-3" />
              {loading ? 'Saving...' : 'Save Email'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your admin account</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-white/40">Email</dt>
              <dd className="text-white">{currentUser?.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/40">Role</dt>
              <dd className="text-white">{currentUser?.roles || 'admin'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stripe</CardTitle>
          <CardDescription>Payment configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-white/40">Mode</dt>
              <dd className="text-white">
                {process.env.STRIPE_PUBLISHABLE_KEY?.startsWith('pk_live') ? 'Live' : 'Test'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/40">Publishable Key</dt>
              <dd className="max-w-[180px] truncate text-white/50">
                {process.env.STRIPE_PUBLISHABLE_KEY ? '••••' + process.env.STRIPE_PUBLISHABLE_KEY.slice(-8) : 'Not set'}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}

const SettingsCell = createCell({ QUERY, Loading, Failure, Success })

const AdminSettingsPage = () => (
  <>
    <Metadata title="Settings - Admin" />
    <Toaster />
    <h1 className="mb-6 font-heading text-2xl font-bold tracking-wider text-white">Settings</h1>
    <SettingsCell />
  </>
)

export default AdminSettingsPage
