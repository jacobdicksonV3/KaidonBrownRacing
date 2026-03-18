import sgMail from '@sendgrid/mail'

import { db } from './db.js'
import { logger } from './logger.js'

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@kaidonbrownracing.com'
const FROM_NAME = 'Kaidon Brown Racing'

async function getAdminEmail(): Promise<string> {
  const setting = await db.siteSetting.findUnique({ where: { key: 'admin_email' } })
  return setting?.value || ''
}

interface OrderEmailData {
  orderId: number
  customerName: string
  customerEmail: string
  totalAmount: number
  shippingAddress: string | null
  deliveryMethod?: string
  couponCode?: string | null
  discountAmount?: number
  items: {
    name: string
    quantity: number
    size: string | null
    price: number
  }[]
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

function buildItemsTable(items: OrderEmailData['items']): string {
  return items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #222;">${item.name}${item.size ? ` (${item.size})` : ''}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #222;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #222;text-align:right;">${formatPrice(item.price * item.quantity)}</td>
        </tr>`
    )
    .join('')
}

function formatAddress(addressJson: string | null): string {
  if (!addressJson) return 'Not provided'
  try {
    const a = JSON.parse(addressJson)
    return [a.line1, a.line2, `${a.city}, ${a.state} ${a.postal_code}`, a.country]
      .filter(Boolean)
      .join('<br>')
  } catch {
    return 'Not provided'
  }
}

function buildEmailHtml(
  heading: string,
  intro: string,
  order: OrderEmailData
): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <!-- Header -->
    <div style="text-align:center;padding:24px 0;border-bottom:2px solid #dc2626;">
      <h1 style="margin:0;color:#ffffff;font-size:24px;letter-spacing:2px;">KAIDON BROWN RACING</h1>
    </div>

    <!-- Content -->
    <div style="padding:32px 0;">
      <h2 style="color:#ffffff;font-size:20px;margin:0 0 8px;">${heading}</h2>
      <p style="color:#999;font-size:14px;margin:0 0 24px;">${intro}</p>

      <!-- Order details -->
      <div style="background-color:#111;border-radius:8px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;font-size:13px;color:#ccc;">
          <tr>
            <td style="padding:4px 0;color:#666;">Order Number</td>
            <td style="padding:4px 0;text-align:right;color:#fff;font-weight:bold;">#${order.orderId}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#666;">Customer</td>
            <td style="padding:4px 0;text-align:right;color:#fff;">${order.customerName}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#666;">Email</td>
            <td style="padding:4px 0;text-align:right;color:#fff;">${order.customerEmail}</td>
          </tr>
        </table>
      </div>

      <!-- Items -->
      <table style="width:100%;border-collapse:collapse;font-size:13px;color:#ccc;">
        <thead>
          <tr style="border-bottom:2px solid #333;">
            <th style="padding:8px 12px;text-align:left;color:#666;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Item</th>
            <th style="padding:8px 12px;text-align:center;color:#666;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Qty</th>
            <th style="padding:8px 12px;text-align:right;color:#666;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${buildItemsTable(order.items)}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:12px;text-align:right;color:#fff;font-weight:bold;font-size:15px;">Total</td>
            <td style="padding:12px;text-align:right;color:#dc2626;font-weight:bold;font-size:15px;">${formatPrice(order.totalAmount)}</td>
          </tr>
        </tfoot>
      </table>

      ${order.discountAmount && order.discountAmount > 0 ? `
      <!-- Discount -->
      <div style="background-color:#111;border-radius:8px;padding:20px;margin-top:24px;">
        <p style="margin:0 0 8px;color:#666;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Discount${order.couponCode ? ` (${order.couponCode})` : ''}</p>
        <p style="margin:0;color:#22c55e;font-size:15px;font-weight:bold;">-${formatPrice(order.discountAmount)}</p>
      </div>` : ''}

      <!-- Delivery -->
      <div style="background-color:#111;border-radius:8px;padding:20px;margin-top:24px;">
        <p style="margin:0 0 8px;color:#666;font-size:11px;text-transform:uppercase;letter-spacing:1px;">${order.deliveryMethod === 'pickup' ? 'Delivery Method' : 'Shipping Address'}</p>
        <p style="margin:0;color:#ccc;font-size:13px;line-height:1.6;">${order.deliveryMethod === 'pickup' ? 'Pickup from Track' : formatAddress(order.shippingAddress)}</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #222;padding:24px 0;text-align:center;">
      <p style="margin:0;color:#444;font-size:12px;">&copy; ${new Date().getFullYear()} Kaidon Brown Racing. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
}

export async function sendOrderConfirmationEmail(order: OrderEmailData): Promise<void> {
  if (!process.env.SENDGRID_API_KEY) {
    logger.warn('SENDGRID_API_KEY not set, skipping order confirmation email')
    return
  }

  // Customer email
  if (order.customerEmail) {
    try {
      await sgMail.send({
        to: order.customerEmail,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: `Order Confirmed - #${order.orderId}`,
        html: buildEmailHtml(
          'Order Confirmed!',
          order.deliveryMethod === 'pickup'
            ? 'Thanks for your order. You can collect it at the next race meet.'
            : 'Thanks for your order. We\'ll get it packed and shipped as soon as possible.',
          order
        ),
      })
      logger.info({ orderId: order.orderId, to: order.customerEmail }, 'Customer order email sent')
    } catch (err) {
      logger.error(err, 'Failed to send customer order email')
    }
  }

  // Admin email
  const adminEmail = await getAdminEmail()
  if (adminEmail) {
    try {
      await sgMail.send({
        to: adminEmail,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: `New Order #${order.orderId} - ${formatPrice(order.totalAmount)}`,
        html: buildEmailHtml(
          'New Order Received',
          `${order.customerName} just placed an order.`,
          order
        ),
      })
      logger.info({ orderId: order.orderId, to: adminEmail }, 'Admin order email sent')
    } catch (err) {
      logger.error(err, 'Failed to send admin order email')
    }
  }
}

export async function sendReadyForCollectionEmail(
  orderId: number,
  customerEmail: string,
  customerName: string
): Promise<void> {
  if (!process.env.SENDGRID_API_KEY || !customerEmail) return

  try {
    await sgMail.send({
      to: customerEmail,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: `Your Order #${orderId} is Ready for Collection!`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="text-align:center;padding:24px 0;border-bottom:2px solid #dc2626;">
      <h1 style="margin:0;color:#ffffff;font-size:24px;letter-spacing:2px;">KAIDON BROWN RACING</h1>
    </div>
    <div style="padding:32px 0;">
      <h2 style="color:#ffffff;font-size:20px;margin:0 0 8px;">Your Order is Ready!</h2>
      <p style="color:#999;font-size:14px;margin:0 0 24px;">Hey ${customerName || 'there'}, your order #${orderId} is packed and ready for collection at the next race meet.</p>
      <div style="background-color:#111;border-radius:8px;padding:20px;text-align:center;">
        <p style="margin:0 0 8px;color:#666;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Order Number</p>
        <p style="margin:0;color:#facc15;font-size:24px;font-weight:bold;font-family:monospace;">#${orderId}</p>
        <p style="margin:16px 0 0;color:#999;font-size:13px;">Show this email when you collect your order.</p>
      </div>
    </div>
    <div style="border-top:1px solid #222;padding:24px 0;text-align:center;">
      <p style="margin:0;color:#444;font-size:12px;">&copy; ${new Date().getFullYear()} Kaidon Brown Racing. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    })
    logger.info({ orderId, to: customerEmail }, 'Ready for collection email sent')
  } catch (err) {
    logger.error(err, 'Failed to send ready for collection email')
  }
}

export async function sendCollectedEmail(
  orderId: number,
  customerEmail: string,
  customerName: string
): Promise<void> {
  if (!process.env.SENDGRID_API_KEY || !customerEmail) return

  try {
    await sgMail.send({
      to: customerEmail,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: `Order #${orderId} Collected — Thanks, ${customerName || 'legend'}!`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="text-align:center;padding:24px 0;border-bottom:2px solid #dc2626;">
      <h1 style="margin:0;color:#ffffff;font-size:24px;letter-spacing:2px;">KAIDON BROWN RACING</h1>
    </div>
    <div style="padding:32px 0;">
      <h2 style="color:#ffffff;font-size:20px;margin:0 0 8px;">Order Collected!</h2>
      <p style="color:#999;font-size:14px;margin:0 0 24px;">Hey ${customerName || 'there'}, thanks for picking up your order #${orderId}. We hope you love your gear!</p>
      <div style="background-color:#111;border-radius:8px;padding:20px;text-align:center;">
        <p style="margin:0;color:#ccc;font-size:14px;">Thanks for supporting Kaidon Brown Racing.</p>
        <p style="margin:12px 0 0;color:#666;font-size:13px;">See you at the track! 🏁</p>
      </div>
    </div>
    <div style="border-top:1px solid #222;padding:24px 0;text-align:center;">
      <p style="margin:0;color:#444;font-size:12px;">&copy; ${new Date().getFullYear()} Kaidon Brown Racing. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    })
    logger.info({ orderId, to: customerEmail }, 'Collected email sent')
  } catch (err) {
    logger.error(err, 'Failed to send collected email')
  }
}

function getAusPostTrackingUrl(trackingNumber: string): string {
  return `https://auspost.com.au/mypost/track/#/details/${encodeURIComponent(trackingNumber)}`
}

export async function sendShippedEmail(
  orderId: number,
  customerEmail: string,
  customerName: string,
  trackingNumber: string
): Promise<void> {
  if (!process.env.SENDGRID_API_KEY || !customerEmail) return

  const trackingUrl = getAusPostTrackingUrl(trackingNumber)

  try {
    await sgMail.send({
      to: customerEmail,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: `Your Order #${orderId} Has Shipped!`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="text-align:center;padding:24px 0;border-bottom:2px solid #dc2626;">
      <h1 style="margin:0;color:#ffffff;font-size:24px;letter-spacing:2px;">KAIDON BROWN RACING</h1>
    </div>
    <div style="padding:32px 0;">
      <h2 style="color:#ffffff;font-size:20px;margin:0 0 8px;">Your Order Has Shipped!</h2>
      <p style="color:#999;font-size:14px;margin:0 0 24px;">Hey ${customerName || 'there'}, your order #${orderId} is on its way via Australia Post.</p>
      <div style="background-color:#111;border-radius:8px;padding:20px;">
        <p style="margin:0 0 8px;color:#666;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Tracking Number</p>
        <p style="margin:0;color:#facc15;font-size:18px;font-weight:bold;font-family:monospace;">${trackingNumber}</p>
        <a href="${trackingUrl}" style="display:inline-block;margin-top:16px;padding:10px 24px;background-color:#dc2626;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:bold;letter-spacing:1px;">TRACK YOUR PARCEL</a>
      </div>
      <p style="margin:16px 0 0;color:#666;font-size:12px;">Or copy this link: <a href="${trackingUrl}" style="color:#facc15;">${trackingUrl}</a></p>
    </div>
    <div style="border-top:1px solid #222;padding:24px 0;text-align:center;">
      <p style="margin:0;color:#444;font-size:12px;">&copy; ${new Date().getFullYear()} Kaidon Brown Racing. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    })
    logger.info({ orderId, to: customerEmail }, 'Shipped email sent')
  } catch (err) {
    logger.error(err, 'Failed to send shipped email')
  }
}
