import type { APIGatewayEvent } from 'aws-lambda'
import { put } from '@vercel/blob'

import { logger } from 'src/lib/logger.js'

export const handler = async (event: APIGatewayEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  // TODO: Add auth check here for production
  const filename = event.queryStringParameters?.filename
  const contentType = event.headers['content-type'] || 'image/webp'

  if (!filename) {
    return { statusCode: 400, body: JSON.stringify({ error: 'filename is required' }) }
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'BLOB_READ_WRITE_TOKEN not configured' }),
    }
  }

  try {
    const body = event.isBase64Encoded
      ? Buffer.from(event.body!, 'base64')
      : Buffer.from(event.body!, 'binary')

    const blob = await put(`products/${Date.now()}-${filename}`, body, {
      access: 'public',
      contentType,
      addRandomSuffix: true,
    })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: blob.url }),
    }
  } catch (err) {
    logger.error(err, 'Image upload failed')
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Upload failed' }),
    }
  }
}
