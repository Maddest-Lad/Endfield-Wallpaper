import { navigate } from '@core/router/hashRoute';
import { PROJECTS } from '../registry';
import { ProjectCard } from './ProjectCard';

export function Gallery() {
  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar bg-site-paper">
      <header className="bg-site-ink px-6 py-8">
        <h1 className="text-xl uppercase tracking-[0.35em] text-white">FIELDGRID</h1>
        <p className="text-[10px] text-white/50 uppercase tracking-[0.25em] mt-2">
          Generative art experiments
        </p>
      </header>
      <div className="h-1 bg-site-accent" />

      <main className="p-6">
        {/* 1px gap over a line-coloured ground gives hairline rules between cards. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-px bg-site-line border border-site-line">
          {PROJECTS.map(({ meta }) => (
            <ProjectCard key={meta.id} meta={meta} onOpen={() => navigate(meta.id)} />
          ))}
        </div>
      </main>
    </div>
  );
}
