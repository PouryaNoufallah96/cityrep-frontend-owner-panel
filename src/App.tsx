import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { GuestRoute, GymOwnerRoute, RegisterRoute } from './components/RouteGuards';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import SchedulePage from './pages/Schedule/SchedulePage';
import ProfilePage from './pages/Profile/ProfilePage';
import ClassesPage from './pages/Classes/ClassesPage';
import ReservationsPage from './pages/Reservations/ReservationsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Guest-only routes (redirect to dashboard if logged in) */}
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <LoginPage />
                </GuestRoute>
              }
            />

            {/* Register route (only accessible if authenticated but has NO gym) */}
            <Route
              path="/register"
              element={
                <RegisterRoute>
                  <RegisterPage />
                </RegisterRoute>
              }
            />

            {/* Gym owner routes (require authentication AND at least one gym) */}
            <Route
              path="/dashboard"
              element={
                <GymOwnerRoute>
                  <DashboardPage />
                </GymOwnerRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <GymOwnerRoute>
                  <ProfilePage />
                </GymOwnerRoute>
              }
            />
            <Route
              path="/schedule"
              element={
                <GymOwnerRoute>
                  <SchedulePage />
                </GymOwnerRoute>
              }
            />
            <Route
              path="/classes"
              element={
                <GymOwnerRoute>
                  <ClassesPage />
                </GymOwnerRoute>
              }
            />
            <Route
              path="/reservations"
              element={
                <GymOwnerRoute>
                  <ReservationsPage />
                </GymOwnerRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>

        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
