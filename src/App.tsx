import { Suspense } from 'react';
import { useRoute, navigate } from '@core/router/hashRoute';
import { hasProject } from './app/registry';
import { Gallery } from './app/gallery/Gallery';
import { ProjectRoute } from './app/ProjectRoute';
import { RouteErrorBoundary } from './app/ErrorBoundary';
import { Loading } from './app/Loading';

export default function App() {
  const { projectId } = useRoute();

  if (!projectId || !hasProject(projectId)) return <Gallery />;

  return (
    <RouteErrorBoundary onReset={() => navigate(null)}>
      <Suspense fallback={<Loading />}>
        <ProjectRoute id={projectId} />
      </Suspense>
    </RouteErrorBoundary>
  );
}
