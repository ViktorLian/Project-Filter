import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { allPosts } from '@/lib/blog';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = allPosts.find((p) => p.slug === params.slug);
  if (!post) return {};
  return {
    title: `${post.title} | FlowPilot Blogg`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

/** Very lightweight markdown → HTML converter for our subset of markdown */
function markdownToHtml(md: string): string {
  return md
    .split('\n')
    .map((line) => {
      if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
      if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`;
      if (line.startsWith('#### ')) return `<h4>${line.slice(5)}</h4>`;
      if (line.startsWith('- ')) {
        const inner = inlineFormat(line.slice(2));
        return `<li>${inner}</li>`;
      }
      if (/^\d+\.\s/.test(line)) {
        const inner = inlineFormat(line.replace(/^\d+\.\s/, ''));
        return `<li>${inner}</li>`;
      }
      if (line.startsWith('|') && line.endsWith('|')) {
        const cells = line
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());
        if (cells.every((c) => /^[-:]+$/.test(c))) return ''; // separator row
        const tag = cells[0] === cells[0].toUpperCase() && cells.length === 1 ? 'th' : 'td';
        return `<tr>${cells.map((c) => `<${tag}>${inlineFormat(c)}</${tag}>`).join('')}</tr>`;
      }
      if (line.trim() === '') return '<br/>';
      return `<p>${inlineFormat(line)}</p>`;
    })
    .join('\n')
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/(<tr>.*<\/tr>\n?)+/g, (match) => `<table>${match}</table>`);
}

function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
}

const categoryColors: Record<string, string> = {
  'Grunnleggende CRM': 'bg-blue-100 text-blue-700',
  'Kundebevaring': 'bg-green-100 text-green-700',
  'Nisje-guider': 'bg-purple-100 text-purple-700',
  'Automatisering': 'bg-orange-100 text-orange-700',
  'Salg': 'bg-red-100 text-red-700',
  'Leadsgenerering': 'bg-yellow-100 text-yellow-700',
  'Økonomi': 'bg-emerald-100 text-emerald-700',
  'Digital markedsføring': 'bg-pink-100 text-pink-700',
  'Teknologi': 'bg-cyan-100 text-cyan-700',
  'Analyse': 'bg-indigo-100 text-indigo-700',
  'Vekst': 'bg-teal-100 text-teal-700',
  'Produktsammenligninger': 'bg-amber-100 text-amber-700',
  'Om FlowPilot': 'bg-violet-100 text-violet-700',
};

export default function BlogPostPage({ params }: Props) {
  const post = allPosts.find((p) => p.slug === params.slug);
  if (!post) notFound();

  const html = markdownToHtml(post.content);
  const catColor = categoryColors[post.category] ?? 'bg-gray-100 text-gray-700';

  const related = allPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Back */}
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          ← Tilbake til blogg
        </Link>
      </div>

      {/* Header */}
      <header className="max-w-4xl mx-auto px-4 py-8">
        <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4 ${catColor}`}>
          {post.category}
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
          {post.title}
        </h1>
        <p className="text-lg text-gray-600 mb-6">{post.excerpt}</p>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>
            {new Date(post.date).toLocaleDateString('nb-NO', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <span>·</span>
          <span>{post.readTime} min lesing</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pb-16 grid lg:grid-cols-[1fr_280px] gap-10">
        {/* Article */}
        <article
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 prose prose-gray max-w-none
            prose-headings:font-bold prose-h2:text-xl prose-h3:text-lg
            prose-li:my-0.5 prose-ul:pl-5 prose-table:text-sm
            prose-strong:text-gray-900 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* CTA card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6">
            <h3 className="font-bold text-base mb-2">Prøv FlowPilot gratis</h3>
            <p className="text-slate-300 text-sm mb-4">
              14 dager gratis. Ingen betalingskort. Kanseller når du vil.
            </p>
            <Link
              href="/register"
              className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
            >
              Kom i gang →
            </Link>
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-sm text-gray-700 mb-4">
                Relaterte artikler
              </h3>
              <ul className="space-y-3">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/blog/${r.slug}`}
                      className="text-sm text-gray-700 hover:text-blue-600 transition-colors font-medium leading-snug"
                    >
                      {r.title}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">{r.readTime} min</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Newsletter */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <h3 className="font-bold text-sm text-blue-900 mb-1">
              📬 Nyhetsbrev
            </h3>
            <p className="text-xs text-blue-700 mb-3">
              Få de beste SMB-tipsene rett i innboksen, én gang i uken.
            </p>
            <Link
              href="/#nyhetsbrev"
              className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors"
            >
              Abonner gratis
            </Link>
          </div>
        </aside>
      </div>

      {/* More posts */}
      {related.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-16">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Flere artikler om {post.category}
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-all"
              >
                <p className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors leading-snug mb-2">
                  {r.title}
                </p>
                <p className="text-xs text-gray-400">{r.readTime} min lesing</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
