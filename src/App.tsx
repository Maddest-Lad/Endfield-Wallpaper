import { WallpaperCanvas } from './components/WallpaperCanvas';
import { ControlPanel } from './components/ControlPanel';

export default function App() {
  return (
    <div className="flex h-full w-full bg-ef-light">
      <WallpaperCanvas />
      <ControlPanel />
    </div>
  );
}
