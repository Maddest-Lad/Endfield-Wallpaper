import type { ProjectMeta } from '@core/project/defineProject';

export function ProjectCard({ meta, onOpen }: { meta: ProjectMeta; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="group bg-white text-left flex flex-col cursor-pointer transition-colors hover:bg-site-paper"
    >
      <div className="relative w-full aspect-video overflow-hidden bg-site-line/30">
        <img
          src={`${import.meta.env.BASE_URL}${meta.thumb}`}
          alt=""
          width={960}
          height={540}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
        />
      </div>

      <div className="px-4 py-3 flex-1">
        <h2 className="text-[11px] uppercase tracking-[0.3em]">
          <span className="font-bold mr-1" style={{ color: meta.cardAccent }}>{'\u203A\u203A'}</span>
          <span className="text-site-ink">{meta.title}</span>
        </h2>
        <p className="text-[10px] text-site-mid uppercase tracking-[0.2em] mt-1">
          {meta.tagline}
        </p>
      </div>

      <div className="h-1 w-full" style={{ backgroundColor: meta.cardAccent }} />
    </button>
  );
}
