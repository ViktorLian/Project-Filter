'use client';
import { useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  rating: number;
  text: string;
  customerName: string;
  jobTitle?: string;
}

interface TestimonialsWidgetProps {
  limit?: number;
  title?: string;
  className?: string;
}

export function TestimonialsWidget({ limit = 6, title = 'Hva kundene sier', className = '' }: TestimonialsWidgetProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/testimonials?approved=true')
      .then(r => r.json())
      .then(json => setTestimonials((json.testimonials || []).slice(0, limit)))
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) return (
    <div className={`py-12 ${className}`}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1,2,3].map(i => (
          <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50 p-6 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
            <div className="h-3 bg-slate-200 rounded w-full mb-2" />
            <div className="h-3 bg-slate-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );

  if (testimonials.length === 0) return null;

  return (
    <section className={`py-16 ${className}`}>
      <div className="mx-auto max-w-7xl px-6">
        {title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
            <div className="flex items-center justify-center gap-1 mt-3">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              ))}
              <span className="text-slate-500 text-sm ml-2">{testimonials.length} anmeldelser</span>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map(t => (
            <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-md transition relative">
              <Quote className="h-8 w-8 text-blue-100 absolute top-5 right-5" />
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`h-4 w-4 ${s <= Math.round(t.rating / 2) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}`} />
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed mb-4 line-clamp-4">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-2 mt-auto">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {t.customerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.customerName}</p>
                  {t.jobTitle && <p className="text-xs text-slate-400">{t.jobTitle}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
