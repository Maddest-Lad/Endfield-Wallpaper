import type { AnyProject } from '@core/project/defineProject';
import { SectionHeader } from '@core/ui/Section';
import { ResolutionPicker } from './ResolutionPicker';
import { ActionButtons } from './ActionButtons';

/** Resolution + export/share — identical for every project. */
export function OutputSection({ project }: { project: AnyProject }) {
  return (
    <>
      <SectionHeader>Output</SectionHeader>
      <ResolutionPicker project={project} />
      <div className="mt-2">
        <ActionButtons project={project} />
      </div>
    </>
  );
}
