import { useState } from 'react'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Icon from '../ui/Icon'
import SectionHeader from '../ui/SectionHeader'
import projects from '../../data/projects.json'

function ProjectCard({ project, index }) {
  return (
    <article className="group relative flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 overflow-hidden">
      {/* Top accent line — colored per project */}
      <div
        className="h-px w-0 group-hover:w-full transition-all duration-500"
        style={{ background: `linear-gradient(to right, ${project.gradientFrom}, ${project.gradientTo})` }}
        aria-hidden="true"
      />

      <div className="flex flex-col flex-1 p-6">
        {/* Row: index + links */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-2xl font-bold text-zinc-800 group-hover:text-zinc-700 transition-colors select-none">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="flex items-center gap-1">
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} source code on GitHub`}
                className="w-7 h-7 flex items-center justify-center rounded text-zinc-600 hover:text-amber-400 hover:bg-zinc-800 transition-colors">
                <Icon name="github" className="w-3.5 h-3.5" />
              </a>
            )}
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} live demo`}
                className="w-7 h-7 flex items-center justify-center rounded text-zinc-600 hover:text-amber-400 hover:bg-zinc-800 transition-colors">
                <Icon name="externalLink" className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors mb-2 leading-snug">
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-zinc-500 leading-relaxed mb-4 flex-1">
          {project.description}
        </p>

        {/* Impact */}
        {project.impact && (
          <div className="font-mono text-xs text-amber-500/70 border-l-2 border-amber-500/30 pl-2.5 mb-4 italic">
            {project.impact}
          </div>
        )}

        {/* Tech */}
        <div className="flex flex-wrap gap-1.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          {project.tech.map(t => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>
      </div>
    </article>
  )
}

export default function Projects() {
  const [showAll, setShowAll] = useState(false)
  const featured = projects.filter(p => p.featured)
  const rest     = projects.filter(p => !p.featured)
  const visible  = showAll ? projects : featured

  return (
    <section id="projects" aria-label="Sarwar Hossain Selected Projects" className="py-24 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader
          label="03 · work"
          title="Selected Projects"
          description="Things I've built that I'm proud of — open source tools, production infrastructure, developer platforms."
        />

        {/* Mobile swipe hint */}
        <div className="sm:hidden flex items-center gap-2 mb-4 text-zinc-600 font-mono text-[10px]">
          <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          swipe to browse · {visible.length} projects
        </div>

        {/* Mobile: horizontal snap-scroll carousel */}
        <div className="sm:hidden overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-6">
          <div className="flex gap-3 px-6 pb-2">
            {visible.map((p, i) => (
              <div key={p.id} className="snap-start shrink-0 w-[82vw]">
                <ProjectCard project={p} index={i} />
              </div>
            ))}
            {/* Trailing spacer so last card isn't flush with edge */}
            <div className="shrink-0 w-2" aria-hidden="true" />
          </div>
        </div>

        {/* Tablet+: grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>

        {rest.length > 0 && (
          <div className="mt-8 text-center">
            <Button variant="ghost" onClick={() => setShowAll(v => !v)}>
              {showAll ? 'Show less' : `+ ${rest.length} more projects`}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
