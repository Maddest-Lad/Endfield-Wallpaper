import { useState } from 'react';
import { exportWallpaper } from '@projects/endfield/export';
import { endfieldStore } from '@projects/endfield/store';
import { encodeConfig } from '@core/router/permalink';
import { Button } from '../ui/Button';

export function ActionButtons() {
  const config = endfieldStore.useConfig();
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportWallpaper(config);
    } finally {
      setExporting(false);
    }
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${encodeConfig(config)}`;
    await navigator.clipboard.writeText(url);
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
