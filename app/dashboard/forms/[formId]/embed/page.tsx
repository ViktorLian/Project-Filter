'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'

export default function FormEmbedPage({ params }: { params: { formId: string } }) {
  const [form, setForm] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/forms/${params.formId}`)
      .then(r => r.json())
      .then(data => setForm(data))
  }, [params.formId])

  if (!form) return <div>Loading...</div>

  const embedCode = `<script src="${process.env.NEXT_PUBLIC_APP_URL}/embed/${form.id}.js"></script>
<div id="projectfilter-form-${form.id}"></div>`

  const iframeCode = `<iframe 
  src="${process.env.NEXT_PUBLIC_APP_URL}/f/${form.slug}" 
  width="100%" 
  height="600" 
  frameborder="0"
></iframe>`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Embed Form: {form.name}</h1>
        <p className="text-muted-foreground">Add this form to any website</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>JavaScript Embed (Recommended)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Copy this code and paste it into your website's HTML where you want the form to appear.
          </p>
          <div className="relative">
            <pre className="bg-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{embedCode}</code>
            </pre>
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2"
              onClick={() => navigator.clipboard.writeText(embedCode)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>iFrame Embed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Alternative method using an iframe. Works on all platforms.
          </p>
          <div className="relative">
            <pre className="bg-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{iframeCode}</code>
            </pre>
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2"
              onClick={() => navigator.clipboard.writeText(iframeCode)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Direct Link</CardTitle>
        </CardHeader>
        <CardContent>
          <a 
            href={`${process.env.NEXT_PUBLIC_APP_URL}/f/${form.slug}`}
            target="_blank"
            className="text-blue-600 hover:underline"
          >
            {process.env.NEXT_PUBLIC_APP_URL}/f/{form.slug}
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
