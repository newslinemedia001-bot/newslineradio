"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, AlertCircle, Target } from 'lucide-react'

interface InvictusSEOProps {
  title: string
  content: string
  slug: string
  onMetaChange: (meta: { seoTitle: string; seoDescription: string; focusKeyword: string }) => void
  initialMeta?: {
    seoTitle?: string
    seoDescription?: string
    focusKeyword?: string
  }
}

interface SEOCheck {
  id: string
  label: string
  status: 'pass' | 'fail' | 'warning'
  message: string
}

export default function InvictusSEO({ 
  title, 
  content, 
  slug, 
  onMetaChange,
  initialMeta 
}: InvictusSEOProps) {
  const [focusKeyword, setFocusKeyword] = useState(initialMeta?.focusKeyword || '')
  const [seoTitle, setSeoTitle] = useState(initialMeta?.seoTitle || '')
  const [seoDescription, setSeoDescription] = useState(initialMeta?.seoDescription || '')
  const [checks, setChecks] = useState<SEOCheck[]>([])
  const [score, setScore] = useState(0)

  useEffect(() => {
    onMetaChange({ seoTitle, seoDescription, focusKeyword })
  }, [seoTitle, seoDescription, focusKeyword, onMetaChange])

  useEffect(() => {
    if (!seoTitle && title) {
      setSeoTitle(title)
    }
  }, [title, seoTitle])

  useEffect(() => {
    const newChecks = performSEOAnalysis()
    setChecks(newChecks)
    
    const passCount = newChecks.filter(c => c.status === 'pass').length
    const totalCount = newChecks.length
    const calculatedScore = Math.round((passCount / totalCount) * 100)
    setScore(calculatedScore)
  }, [title, content, slug, focusKeyword, seoTitle, seoDescription])

  const performSEOAnalysis = (): SEOCheck[] => {
    const checks: SEOCheck[] = []
    const plainText = content.replace(/<[^>]*>/g, '').trim()
    const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length
    const keyword = focusKeyword.toLowerCase().trim()
    const titleLower = title.toLowerCase()
    const contentLower = plainText.toLowerCase()
    const seoTitleLower = seoTitle.toLowerCase()
    const seoDescLower = seoDescription.toLowerCase()

    // Focus Keyword Check
    if (keyword) {
      checks.push({
        id: 'focus-keyword',
        label: 'Focus Keyword Set',
        status: 'pass',
        message: `Focus keyword: "${focusKeyword}"`
      })
    } else {
      checks.push({
        id: 'focus-keyword',
        label: 'Focus Keyword',
        status: 'fail',
        message: 'Set a focus keyword to optimize your content'
      })
    }

    // Keyword in Title
    if (keyword && titleLower.includes(keyword)) {
      checks.push({
        id: 'keyword-in-title',
        label: 'Keyword in Title',
        status: 'pass',
        message: 'Focus keyword found in article title'
      })
    } else if (keyword) {
      checks.push({
        id: 'keyword-in-title',
        label: 'Keyword in Title',
        status: 'fail',
        message: 'Add focus keyword to your article title'
      })
    }

    // Keyword in SEO Title
    if (keyword && seoTitle && seoTitleLower.includes(keyword)) {
      checks.push({
        id: 'keyword-in-seo-title',
        label: 'Keyword in SEO Title',
        status: 'pass',
        message: 'Focus keyword found in SEO title'
      })
    } else if (keyword && seoTitle) {
      checks.push({
        id: 'keyword-in-seo-title',
        label: 'Keyword in SEO Title',
        status: 'fail',
        message: 'Add focus keyword to your SEO title'
      })
    }

    // SEO Title Length
    if (seoTitle.length >= 50 && seoTitle.length <= 60) {
      checks.push({
        id: 'seo-title-length',
        label: 'SEO Title Length',
        status: 'pass',
        message: `Perfect length: ${seoTitle.length} characters`
      })
    } else if (seoTitle.length > 0 && seoTitle.length < 50) {
      checks.push({
        id: 'seo-title-length',
        label: 'SEO Title Length',
        status: 'warning',
        message: `Too short: ${seoTitle.length}/50-60 characters`
      })
    } else if (seoTitle.length > 60) {
      checks.push({
        id: 'seo-title-length',
        label: 'SEO Title Length',
        status: 'warning',
        message: `Too long: ${seoTitle.length}/50-60 characters (may be truncated)`
      })
    } else {
      checks.push({
        id: 'seo-title-length',
        label: 'SEO Title Length',
        status: 'fail',
        message: 'Add an SEO title (50-60 characters)'
      })
    }

    // Keyword in Meta Description
    if (keyword && seoDescription && seoDescLower.includes(keyword)) {
      checks.push({
        id: 'keyword-in-description',
        label: 'Keyword in Description',
        status: 'pass',
        message: 'Focus keyword found in meta description'
      })
    } else if (keyword && seoDescription) {
      checks.push({
        id: 'keyword-in-description',
        label: 'Keyword in Description',
        status: 'fail',
        message: 'Add focus keyword to meta description'
      })
    }

    // Meta Description Length
    if (seoDescription.length >= 150 && seoDescription.length <= 160) {
      checks.push({
        id: 'description-length',
        label: 'Description Length',
        status: 'pass',
        message: `Perfect length: ${seoDescription.length} characters`
      })
    } else if (seoDescription.length > 0 && seoDescription.length < 150) {
      checks.push({
        id: 'description-length',
        label: 'Description Length',
        status: 'warning',
        message: `Too short: ${seoDescription.length}/150-160 characters`
      })
    } else if (seoDescription.length > 160) {
      checks.push({
        id: 'description-length',
        label: 'Description Length',
        status: 'warning',
        message: `Too long: ${seoDescription.length}/150-160 characters (may be truncated)`
      })
    } else {
      checks.push({
        id: 'description-length',
        label: 'Meta Description',
        status: 'fail',
        message: 'Add a meta description (150-160 characters)'
      })
    }

    // Keyword in URL
    if (keyword && slug.toLowerCase().includes(keyword.replace(/\s+/g, '-'))) {
      checks.push({
        id: 'keyword-in-url',
        label: 'Keyword in URL',
        status: 'pass',
        message: 'Focus keyword found in URL slug'
      })
    } else if (keyword) {
      checks.push({
        id: 'keyword-in-url',
        label: 'Keyword in URL',
        status: 'warning',
        message: 'Consider adding keyword to URL slug'
      })
    }

    // Keyword in First Paragraph
    const firstParagraph = plainText.substring(0, 200).toLowerCase()
    if (keyword && firstParagraph.includes(keyword)) {
      checks.push({
        id: 'keyword-in-intro',
        label: 'Keyword in Introduction',
        status: 'pass',
        message: 'Focus keyword found in first paragraph'
      })
    } else if (keyword && plainText.length > 0) {
      checks.push({
        id: 'keyword-in-intro',
        label: 'Keyword in Introduction',
        status: 'fail',
        message: 'Add focus keyword to the first paragraph'
      })
    }

    // Keyword Density
    if (keyword && wordCount > 0) {
      const keywordCount = (contentLower.match(new RegExp(keyword, 'g')) || []).length
      const density = (keywordCount / wordCount) * 100

      if (density >= 0.5 && density <= 2.5) {
        checks.push({
          id: 'keyword-density',
          label: 'Keyword Density',
          status: 'pass',
          message: `Good density: ${density.toFixed(1)}% (${keywordCount} times)`
        })
      } else if (density > 2.5 && density <= 3.5) {
        checks.push({
          id: 'keyword-density',
          label: 'Keyword Density',
          status: 'warning',
          message: `High density: ${density.toFixed(1)}% - avoid keyword stuffing`
        })
      } else if (density > 3.5) {
        checks.push({
          id: 'keyword-density',
          label: 'Keyword Density',
          status: 'fail',
          message: `Too high: ${density.toFixed(1)}% - keyword stuffing detected`
        })
      } else if (keywordCount > 0) {
        checks.push({
          id: 'keyword-density',
          label: 'Keyword Density',
          status: 'warning',
          message: `Low density: ${density.toFixed(1)}% - use keyword more`
        })
      } else if (keyword) {
        checks.push({
          id: 'keyword-density',
          label: 'Keyword Density',
          status: 'fail',
          message: 'Focus keyword not found in content'
        })
      }
    }

    // Content Length
    if (wordCount >= 300) {
      checks.push({
        id: 'content-length',
        label: 'Content Length',
        status: 'pass',
        message: `Good length: ${wordCount} words`
      })
    } else if (wordCount >= 150) {
      checks.push({
        id: 'content-length',
        label: 'Content Length',
        status: 'warning',
        message: `Short content: ${wordCount} words (aim for 300+)`
      })
    } else {
      checks.push({
        id: 'content-length',
        label: 'Content Length',
        status: 'fail',
        message: `Too short: ${wordCount} words (minimum 300 recommended)`
      })
    }

    // Headings Check
    const h2Count = (content.match(/<h2/gi) || []).length
    const h3Count = (content.match(/<h3/gi) || []).length
    const totalHeadings = h2Count + h3Count

    if (totalHeadings >= 2) {
      checks.push({
        id: 'headings',
        label: 'Headings Structure',
        status: 'pass',
        message: `Good structure: ${h2Count} H2, ${h3Count} H3 headings`
      })
    } else if (totalHeadings === 1) {
      checks.push({
        id: 'headings',
        label: 'Headings Structure',
        status: 'warning',
        message: 'Add more headings (H2, H3) to structure content'
      })
    } else {
      checks.push({
        id: 'headings',
        label: 'Headings Structure',
        status: 'fail',
        message: 'Add headings (H2, H3) to structure your content'
      })
    }

    // Images Check
    const imageCount = (content.match(/<img/gi) || []).length
    if (imageCount >= 1) {
      checks.push({
        id: 'images',
        label: 'Images',
        status: 'pass',
        message: `${imageCount} image${imageCount > 1 ? 's' : ''} found`
      })
    } else {
      checks.push({
        id: 'images',
        label: 'Images',
        status: 'warning',
        message: 'Add images to make content more engaging'
      })
    }

    // Links Check
    const linkCount = (content.match(/<a/gi) || []).length
    if (linkCount >= 1) {
      checks.push({
        id: 'links',
        label: 'Links',
        status: 'pass',
        message: `${linkCount} link${linkCount > 1 ? 's' : ''} found`
      })
    } else {
      checks.push({
        id: 'links',
        label: 'Links',
        status: 'warning',
        message: 'Add internal or external links'
      })
    }

    return checks
  }

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = () => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-300'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-red-100 text-red-800 border-red-300'
  }

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Invictus SEO</span>
          </div>
          <Badge className={`${getScoreBadge()} text-lg font-bold px-3 py-1`}>
            {score}/100
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {/* Focus Keyword */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            Focus Keyword *
          </label>
          <Input
            value={focusKeyword}
            onChange={(e) => setFocusKeyword(e.target.value)}
            placeholder="e.g., Gatanga land"
            className="border-gray-300"
          />
          <p className="text-xs text-gray-500 mt-1">
            The main keyword you want to rank for
          </p>
        </div>

        {/* SEO Title */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            SEO Title
          </label>
          <Input
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder="Enter SEO title..."
            className="border-gray-300"
            maxLength={70}
          />
          <p className="text-xs text-gray-500 mt-1">
            {seoTitle.length}/60 characters (50-60 optimal)
          </p>
        </div>

        {/* Meta Description */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            Meta Description
          </label>
          <Textarea
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            placeholder="Enter meta description..."
            className="border-gray-300"
            rows={3}
            maxLength={170}
          />
          <p className="text-xs text-gray-500 mt-1">
            {seoDescription.length}/160 characters (150-160 optimal)
          </p>
        </div>

        {/* SEO Analysis */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-700 mb-3">SEO Analysis</h4>
          <div className="space-y-2">
            {checks.map((check) => (
              <div
                key={check.id}
                className="flex items-start space-x-2 text-sm"
              >
                {check.status === 'pass' && (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                )}
                {check.status === 'fail' && (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                {check.status === 'warning' && (
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-medium text-gray-700">{check.label}</p>
                  <p className="text-gray-600 text-xs">{check.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Score Summary */}
        <div className="border-t pt-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Overall SEO Score</p>
            <p className={`text-4xl font-bold ${getScoreColor()}`}>{score}</p>
            <p className="text-xs text-gray-500 mt-2">
              {score >= 80 && '🎉 Excellent! Your content is well optimized'}
              {score >= 60 && score < 80 && '👍 Good! A few improvements needed'}
              {score < 60 && '⚠️ Needs work. Follow the suggestions above'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
