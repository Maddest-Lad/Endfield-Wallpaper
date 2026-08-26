import { useState } from 'react';
import type { AnyProject } from '@core/project/defineProject';
import { Button } from '@core/ui/Button';
import { exportPng } from '@core/render/exportPng';

export function ActionButtons({ project }: { project: AnyProject }) {
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportPng(project);
    } finally {
      setExporting(false);
    }
  };

  const handleCopyLink = async () => {
    const { origin, pathname } = window.location;
    await navigator.clipboard.writeText(`${origin}${pathname}#${project.encodeConfig()}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleExport} disabled={exporting}>
        {exporting ? 'EXPORTING...' : 'EXPORT PNG'}
      </Button>
      <Button variant="secondary" onClick={handleCopyLink}>
        {copied ? 'COPIED!' : 'COPY LINK'}
      </Button>
    </div>
  );
}
