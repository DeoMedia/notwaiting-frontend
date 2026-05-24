import { Suspense } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';

// Top-level Suspense boundary catches lazy chunks for routes that don't
// render inside the Root layout (e.g. /get-mark). Routes that DO render
// inside Root have a nicer per-route fallback there.
export default function App() {
  return (
    <Suspense fallback={null}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
