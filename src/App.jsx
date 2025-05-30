import React, { Suspense, lazy, useState, useEffect } from 'react';
import { 
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './Routes/ProtectedRoute';
import LoadToSIte from './animations/LoadToSIte';
import { SmtpTokenProvider } from './context/SmtpTokenContext';
import SmtpProtectedRoute from './Routes/SmtpProtectedRoute';
// import App from '../../charles-wedding-2025/src/App';
// import App from '../../account-market/src/App';
// import MainLayOut from './Layout/MainLayOut';

// const VerifyPage = lazy(() => import('./components/Token/VerifyToken'));
const MailPage = lazy(() => import('./components/Mail/SendBulk'));
const HomePage = lazy(() => import('./components/Home/Hero'));
const NotFoundPage = lazy(() => import('./pages/PageNotFound'));
// const AddSmtpPage = lazy(() => import('./components/Smtp/AddSmtp'));
const DashBoardPage = lazy(() => import('./pages/DashBoard'));
const DemoPage = lazy(() => import('./components/Mail/DemoMail'));
const AllSmtpPage = lazy(() => import('./components/Smtp/AllSmtp'));
const AdminPage = lazy(() => import('./components/Smtp/AdminSmtp'));
// const SignUpPage = lazy(() => import('./components/SignupForm/SignUp'));
// const LogInPage = lazy(() => import('./components/LoginForm/LogIn'));;

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
        {/* <Route path='/' element={ 
          <MainLayOut>
            <Outlet />
          </MainLayOut>
        } /> */}

        <Route index element={
          <Suspense fallback={<LoadToSIte loadText='Loading...' />}>
            <HomePage />
          </Suspense>
        } />

        {/* <Route path='/login' element={
          <Suspense fallback={<LoadToSIte loadText='Loading...' />}>
            <LogInPage />
          </Suspense>
        } /> */}

        {/* <Route path='/signup' element={
          <Suspense fallback={<LoadToSIte loadText='Loading...' />}>
            <SignUpPage />
          </Suspense>
        } /> */}

        {/* <Route path='/verify' element={
          <Suspense fallback={<LoadToSIte loadText='Loading...' />}>
            <VerifyPage />
          </Suspense>
        } /> */}

        <Route path='/send-mail' element={
          <Suspense fallback={<LoadToSIte loadText='Checking authentication...' />}>
            <ProtectedRoute>
              <MailPage />
            </ProtectedRoute>
          </Suspense>
        } />

        <Route path='/dash' element={
          <Suspense fallback={<LoadToSIte loadText='Loading Dashboard...' />}>
            <DashBoardPage />
          </Suspense>
        } />

        <Route path='/demo' element={
          <Suspense fallback={<LoadToSIte loadText='Loading Demo Page...' />}>
            <DemoPage />
          </Suspense>
        } />

        <Route path='/admin' element={
          <Suspense fallback={<LoadToSIte loadText='Checking authentication...' />}>
            <SmtpTokenProvider>
              <SmtpProtectedRoute>
                <AdminPage />
              </SmtpProtectedRoute>
            </SmtpTokenProvider>
          </Suspense>
        } />

        <Route path='/smtps' element={
          <Suspense fallback={<LoadToSIte loadText='Checking authentication...' />}>
            <SmtpTokenProvider>
              <SmtpProtectedRoute>
                <AllSmtpPage />
              </SmtpProtectedRoute>
            </SmtpTokenProvider>
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
      <Toaster position='top-center' reverseOrder={false} />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;