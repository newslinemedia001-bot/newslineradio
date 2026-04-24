"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Youtube from '@tiptap/extension-youtube'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Youtube as YoutubeIcon,
  Upload
} from 'lucide-react'
import { generateSlug, ensureUniqueSlug } from '@/lib/slug-utils'
import InvictusSEO from './InvictusSEO'

interface ArticleEditorProps {
  onSave: (article: any) => void
  initialData?: any
  onCancel: () => void
}

export default function ArticleEditor({ onSave, initialData, onCancel }: ArticleEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '')
  const [category, setCategory] = useState(initialData?.category || 'News')
  const [author, setAuthor] = useState(initialData?.author || 'Newsline Team')
  const [featuredImage, setFeaturedImage] = useState(initialData?.imageUrl || '')
  const [uploading, setUploading] = useState(false)
  const [seoMeta, setSeoMeta] = useState({
    seoTitle: initialData?.seoTitle || '',
    seoDescription: initialData?.seoDescription || '',
    focusKeyword: initialData?.focusKeyword || ''
  })

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Configure paragraph handling to preserve line breaks
        paragraph: {
          HTMLAttributes: {
            class: 'mb-4',
          },
        },
        // Enable hard breaks for line breaks
        hardBreak: {
          keepMarks: true,
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        HTMLAttributes: {
          class: 'text-purple-600 hover:text-purple-800 underline',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Youtube.configure({
        width: 640,
        height: 480,
        HTMLAttributes: {
          class: 'rounded-lg',
        },
      }),
    ],
    content: initialData?.content || '<p>Start writing your article...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-4 min-h-[300px] border border-gray-200 rounded-lg',
      },
      // Handle paste to preserve formatting and line breaks
      handlePaste: (view, event) => {
        const clipboardData = event.clipboardData
        if (!clipboardData) return false

        // Get both HTML and plain text
        const html = clipboardData.getData('text/html')
        const text = clipboardData.getData('text/plain')

        // If HTML is available, let TipTap handle it normally (preserves formatting)
        if (html) {
          return false // Let default handler process HTML
        }

        // For plain text, convert line breaks to proper paragraphs
        if (text) {
          event.preventDefault()
          
          // Split by line breaks and create paragraphs
          const lines = text.split(/\r?\n/)
          const { state, dispatch } = view
          const { tr } = state
          
          // Get current position
          const { from } = state.selection
          
          // Insert content with proper paragraph structure
          lines.forEach((line, index) => {
            if (line.trim()) {
              // Insert text
              tr.insertText(line, tr.mapping.map(from))
            }
            // Add paragraph break between lines (except for the last one)
            if (index < lines.length - 1) {
              const pos = tr.mapping.map(from) + line.length
              tr.split(pos)
            }
          })
          
          dispatch(tr)
          return true
        }

        return false
      },
    },
  })

  const uploadImage = useCallback(async (file: File, setAsFeatured: boolean = false) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      
      // Set as featured image if no featured image exists or if explicitly requested
      if (setAsFeatured || featuredImage === '') {
        setFeaturedImage(data.url)
      }
      
      // Insert image at current cursor position
      editor?.chain().focus().setImage({ 
        src: data.url,
        alt: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension for alt text
        title: file.name.replace(/\.[^/.]+$/, ''),
      }).run()
      
      return data.url
    } catch (error) {
      console.error('Upload failed:', error)
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return null
    } finally {
      setUploading(false)
    }
  }, [editor, featuredImage])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    
    await uploadImage(file, false)
  }, [uploadImage])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false
  })

  const addLink = () => {
    const url = window.prompt('Enter URL:')
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run()
    }
  }

  const addYoutube = () => {
    const url = window.prompt('Enter YouTube URL:')
    if (url) {
      editor?.commands.setYoutubeVideo({ src: url })
    }
  }

  const handleSave = async () => {
    if (!title.trim() || !editor?.getHTML()) {
      alert('Please fill in title and content')
      return
    }

    const baseSlug = generateSlug(title.trim())
    const slug = initialData?.slug || await ensureUniqueSlug(baseSlug)
    const publishedAt = initialData?.publishedAt || new Date().toISOString()

    const article = {
      title: title.trim(),
      content: editor.getHTML(),
      excerpt: excerpt.trim() || editor.getText().substring(0, 150) + '...',
      category: category.trim(),
      author: author.trim(),
      imageUrl: featuredImage,
      publishedAt,
      updatedAt: new Date().toISOString(),
      slug,
      // SEO Meta Data
      seoTitle: seoMeta.seoTitle || title.trim(),
      seoDescription: seoMeta.seoDescription,
      focusKeyword: seoMeta.focusKeyword,
      // Keep old date fields if editing existing article with dates
      ...(initialData?.year && { year: initialData.year }),
      ...(initialData?.month && { month: initialData.month }),
      ...(initialData?.day && { day: initialData.day }),
    }

    onSave(article)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Editor - 2/3 width */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Article Editor</CardTitle>
          </CardHeader>
        <CardContent className="space-y-4">
          {/* Title and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title*</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title..."
                className="text-lg font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="News">News</option>
                <option value="Politics">Politics</option>
                <option value="Gossip">Gossip</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Media">Media</option>
                <option value="Bizna">Bizna</option>
                <option value="Sports">Sports</option>
                <option value="Videos">Videos</option>
                <option value="Lifestyle">Lifestyle</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Author</label>
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Article author"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Featured Image URL</label>
              <Input
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium mb-2">Excerpt (Optional)</label>
            <Textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary of the article..."
              rows={3}
            />
          </div>

          {/* Featured Image Preview */}
          {featuredImage && (
            <div>
              <label className="block text-sm font-medium mb-2">Featured Image Preview</label>
              <div className="relative inline-block">
                <img 
                  src={featuredImage} 
                  alt="Featured image preview" 
                  className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300"
                />
                <button
                  onClick={() => setFeaturedImage('')}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm"
                  title="Remove featured image"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Image Upload Area */}
          <div>
            <label className="block text-sm font-medium mb-2">Upload Images</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Button
                type="button"
                onClick={() => document.getElementById('featured-image-upload')?.click()}
                variant="outline"
                className="flex items-center space-x-2"
                disabled={uploading}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Set Featured Image</span>
              </Button>
              <Button
                type="button"
                onClick={() => document.getElementById('content-image-upload')?.click()}
                variant="outline"
                className="flex items-center space-x-2"
                disabled={uploading}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Add Image to Content</span>
              </Button>
            </div>
            <input
              id="featured-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (file) {
                  await uploadImage(file, true)
                  e.target.value = '' // Reset input
                }
              }}
            />
            <input
              id="content-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (file) {
                  await uploadImage(file, false)
                  e.target.value = '' // Reset input
                }
              }}
            />
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
              } ${uploading ? 'opacity-50' : ''}`}
            >
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {uploading ? 'Uploading...' : 'Drag & drop images here, or click to select'}
              </p>
            </div>
          </div>

          {/* Editor Toolbar */}
          <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={editor?.isActive('bold') ? 'bg-blue-100' : ''}
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={editor?.isActive('italic') ? 'bg-blue-100' : ''}
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={editor?.isActive('bulletList') ? 'bg-blue-100' : ''}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={editor?.isActive('orderedList') ? 'bg-blue-100' : ''}
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={addLink}>
              <LinkIcon className="w-4 h-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={addYoutube}>
              <YoutubeIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* Editor */}
          <div>
            <label className="block text-sm font-medium mb-2">Content*</label>
            <EditorContent editor={editor} />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              {initialData ? 'Update Article' : 'Publish Article'}
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Invictus SEO Panel - 1/3 width */}
      <div className="lg:col-span-1">
        <div className="sticky top-6">
          <InvictusSEO
            title={title}
            content={editor?.getHTML() || ''}
            slug={generateSlug(title)}
            onMetaChange={setSeoMeta}
            initialMeta={seoMeta}
          />
        </div>
      </div>
    </div>
  )
}