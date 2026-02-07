import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = createAdminClient()
  
  const { data: form } = await supabase
    .from('forms')
    .select('*, questions(*)')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (!form) {
    return new Response('Form not found', { status: 404 })
  }

  // Return HTML page with form
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${form.name}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; }
    body { 
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 600px;
      margin: 40px auto;
      padding: 20px;
      background: #f8f9fa;
    }
    .form-container {
      background: white;
      padding: 32px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 { margin: 0 0 8px; font-size: 24px; }
    .description { color: #666; margin-bottom: 24px; }
    .field { margin-bottom: 20px; }
    label { display: block; font-weight: 500; margin-bottom: 8px; }
    input, textarea, select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
    }
    textarea { min-height: 100px; resize: vertical; }
    button {
      width: 100%;
      padding: 12px;
      background: #000;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
    }
    button:hover { background: #333; }
    button:disabled { background: #ccc; cursor: not-allowed; }
    .success { 
      background: #d4edda;
      color: #155724;
      padding: 16px;
      border-radius: 6px;
      margin-bottom: 16px;
    }
    .error {
      background: #f8d7da;
      color: #721c24;
      padding: 16px;
      border-radius: 6px;
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <div class="form-container">
    <h1>${form.name}</h1>
    ${form.description ? `<p class="description">${form.description}</p>` : ''}
    
    <div id="message"></div>
    
    <form id="leadForm">
      ${form.questions.sort((a: any, b: any) => a.order - b.order).map((q: any) => {
        const required = q.required ? 'required' : '';
        const label = q.label + (q.required ? ' *' : '');
        
        if (q.type === 'textarea') {
          return `<div class="field">
            <label>${label}</label>
            <textarea name="${q.id}" ${required}></textarea>
          </div>`;
        } else if (q.type === 'select' && q.options) {
          return `<div class="field">
            <label>${label}</label>
            <select name="${q.id}" ${required}>
              <option value="">Select...</option>
              ${q.options.map((opt: any) => `<option value="${opt}">${opt}</option>`).join('')}
            </select>
          </div>`;
        } else {
          return `<div class="field">
            <label>${label}</label>
            <input type="${q.type}" name="${q.id}" ${required}>
          </div>`;
        }
      }).join('')}
      
      <button type="submit" id="submitBtn">Submit</button>
    </form>
  </div>

  <script>
    document.getElementById('leadForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const btn = document.getElementById('submitBtn');
      const msg = document.getElementById('message');
      btn.disabled = true;
      btn.textContent = 'Submitting...';
      
      const formData = new FormData(e.target);
      const answers = {};
      formData.forEach((value, key) => {
        answers[key] = value;
      });
      
      try {
        const res = await fetch('/api/forms/${form.id}/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers })
        });
        
        if (res.ok) {
          msg.innerHTML = '<div class="success">Thank you! Your submission has been received.</div>';
          e.target.reset();
        } else {
          const err = await res.json();
          msg.innerHTML = '<div class="error">' + (err.error || 'Submission failed') + '</div>';
        }
      } catch (error) {
        msg.innerHTML = '<div class="error">Network error. Please try again.</div>';
      }
      
      btn.disabled = false;
      btn.textContent = 'Submit';
    });
  </script>
</body>
</html>
  `

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  })
}
