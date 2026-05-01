import Icon from '../ui/Icon'
import SectionHeader from '../ui/SectionHeader'
import articles from '../../data/articles.json'

function ArticleRow({ article }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group grid md:grid-cols-[100px_1fr_auto] gap-4 items-start py-6 border-b border-zinc-800/60 last:border-b-0 hover:bg-zinc-900/30 -mx-4 px-4 rounded-lg transition-colors"
    >
      {/* Date */}
      <span className="font-mono text-xs text-zinc-600 md:pt-0.5 shrink-0">
        {article.date}
      </span>

      {/* Content */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-300 group-hover:text-amber-400 transition-colors mb-1 leading-snug">
          {article.title}
        </h3>
        <p className="text-xs text-zinc-600 leading-relaxed mb-2.5">
          {article.description}
        </p>
        <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-700">
          <span className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: article.platformColor }}
              aria-hidden="true"
            />
            {article.platform}
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Icon name="clock" className="w-3 h-3" />
            {article.readTime}
          </span>
        </div>
      </div>

      {/* Arrow */}
      <Icon
        name="arrowRight"
        className="w-3.5 h-3.5 text-zinc-700 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all mt-1 shrink-0"
      />
    </a>
  )
}

export default function Articles() {
  return (
    <section id="articles" aria-label="Sarwar Hossain | Sarwar Asik Articles and Writing" className="py-24 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-3xl">
          <SectionHeader
            label="05 · writing"
            title="Articles"
            description="Writing about distributed systems, real-time architecture, and the hard problems I've solved in production."
          />

          {articles.length > 0 ? (
            <>
              <div>
                {articles.map(a => (
                  <ArticleRow key={a.id} article={a} />
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800/60">
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                >
                  all_articles()
                  <Icon name="arrowRight" className="w-3 h-3" />
                </a>
              </div>
            </>
          ) : (
            <div className="py-12 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg text-center">
              <p className="font-mono text-sm text-zinc-400 dark:text-zinc-600">// coming_soon()</p>
              <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-700">
                Articles on microservices, real-time systems, and payment integrity — in progress.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
