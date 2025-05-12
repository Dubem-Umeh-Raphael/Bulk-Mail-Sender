import React, { Suspense, lazy, useState, useEffect } from 'react';
import { 
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import LoadToSIte from './animations/LoadToSIte';
// import App from '../../charles-wedding-2025/src/App';

const VerifyPage = lazy(() => import('./components/Token/VerifyToken'));
const MailPage = lazy(() => import('./components/Mail/SendBulk'));
const HomePage = lazy(() => import('./components/Home/Hero'));
const NotFoundPage = lazy(() => import('./pages/PageNotFound'));

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route index element={
          <Suspense fallback={<LoadToSIte loadText='Loading...' />}>
            <HomePage />
          </Suspense>
        } />

        <Route path='/verify' element={
          <Suspense fallback={<LoadToSIte loadText='Loading...' />}>
            <VerifyPage />
          </Suspense>
        } />

        <Route path='/send-mail' element={
          <Suspense fallback={<LoadToSIte loadText='Checking authentication...' />}>
            <ProtectedRoute>
              <MailPage />
            </ProtectedRoute>
          </Suspense>
        } />

        {/* Catch all unmatched routes */}
        <Route path='*' element={
          <Suspense fallback={<LoadToSIte loadText='404 - Page Not Found' />}>
            <NotFoundPage />
          </Suspense>
        } />
      </Route>
    ),
    {
      // Add basename for production
      basename: '/',
      // Add custom 404 handling
      errorElement: <NotFoundPage />,
    }
  );

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;