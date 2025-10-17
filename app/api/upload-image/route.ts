import { NextRequest, NextResponse } from 'next/server'

import crypto from 'crypto'

// Generate Cloudinary signature for secure uploads
function generateSignature(timestamp: number, folder: string, apiSecret: string): string {
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`
  return crypto
    .createHash('sha1')
    .update(paramsToSign + apiSecret)
    .digest('hex')
}

// Cloudinary upload function with signed upload (no preset needed)
async function uploadToCloudinaryDirect(buffer: Buffer): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary configuration is missing')
  }

  const timestamp = Math.round(Date.now() / 1000)
  const folder = 'newsline-articles'
  const signature = generateSignature(timestamp, folder, apiSecret)

  const formData = new FormData()
  formData.append('file', new Blob([buffer]))
  formData.append('api_key', apiKey)
  formData.append('timestamp', timestamp.toString())
  formData.append('signature', signature)
  formData.append('folder', folder)

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Cloudinary upload failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return data.secure_url
  } catch (error) {
    console.error('Cloudinary signed upload error:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return NextResponse.json(
        { error: 'Image upload service not configured' },
        { status: 503 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max size is 10MB' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const imageUrl = await uploadToCloudinaryDirect(buffer)

    return NextResponse.json({ url: imageUrl })
  } catch (error) {
    console.error('Upload error details:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Upload failed'
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}