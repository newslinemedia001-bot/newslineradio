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

interface ArticleEditorProps {
  onSave: (article: any) => void
  initialData?: any
  onCancel: () => void
}

export default function ArticleEditor({ onSave, initialData, onCancel }: ArticleEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '')
  const [category, setCategory] = useState(initialData?.category || 'General')
  const [author, setAuthor] = useState(initialData?.author || 'Newsline Team')
  const [featuredImage, setFeaturedImage] = useState(initialData?.imageUrl || '')
  const [uploading, setUploading] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
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
    },
  })

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        const data = await response.json()
        if (featuredImage === '') {
          setFeaturedImage(data.url)
        }
        editor?.chain().focus().setImage({ src: data.url }).run()
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }, [editor, featuredImage])

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

  const handleSave = () => {
    if (!title.trim() || !editor?.getHTML()) {
      alert('Please fill in title and content')
      return
    }

    const article = {
      id: initialData?.id || Date.now().toString(),
      title: title.trim(),
      content: editor.getHTML(),
      excerpt: excerpt.trim() || editor.getText().substring(0, 150) + '...',
      category: category.trim(),
      author: author.trim(),
      imageUrl: featuredImage,
      publishedAt: initialData?.publishedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    onSave(article)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Politics, Sports, Technology"
              />
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

          {/* Image Upload Area */}
          <div>
            <label className="block text-sm font-medium mb-2">Upload Images</label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
              } ${uploading ? 'opacity-50' : ''}`}
            >
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
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
  )
}