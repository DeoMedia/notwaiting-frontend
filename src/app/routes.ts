import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import Root from './layouts/Root';

// Every page below is lazy-loaded so the homepage's critical path doesn't
// ship Dashboard's recharts, AI page's questionnaire, GetMark's qrcode +
// html2canvas, etc. The shared layout (Root) is kept eager because it's on
// every screen and we'd otherwise pay a Suspense fallback on every paint.
//
// React.lazy emits one chunk per route. Vite/Rollup names them by source
// path, so the dist tree ends up with /assets/Home-<hash>.js, About-<hash>.js
// and so on. Repeat visits hit the immutable cache configured in .htaccess.
const Home          = lazy(() => import('./pages/Home'));
const About         = lazy(() => import('./pages/About'));
const Manifesto     = lazy(() => import('./pages/Manifesto'));
// const Stories       = lazy(() => import('./pages/Stories')); // route commented out
const Partners      = lazy(() => import('./pages/Partners'));
const Contact       = lazy(() => import('./pages/Contact'));
const GetMark       = lazy(() => import('./pages/GetMark'));
const Dashboard     = lazy(() => import('./pages/Dashboard'));
const FAQ           = lazy(() => import('./pages/FAQ'));
const Privacy       = lazy(() => import('./pages/Privacy'));
const AiPrompt      = lazy(() => import('./pages/AiPrompt'));
const Welcome       = lazy(() => import('./pages/Welcome'));
const Gallery       = lazy(() => import('./pages/Gallery'));

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: 'about', Component: About },
      { path: 'manifesto', Component: Manifesto },
      // { path: 'stories', Component: Stories }, // route commented out
      { path: 'partners', Component: Partners },
      { path: 'contact', Component: Contact },
      { path: 'dashboard', Component: Dashboard },
      { path: 'faq', Component: FAQ },
      { path: 'privacy', Component: Privacy },
      { path: 'ai-prompt', Component: AiPrompt },
      { path: 'welcome', Component: Welcome },
      { path: 'gallery', Component: Gallery },
    ]
  },
  {
    path: '/get-mark',
    Component: GetMark
  },
]);