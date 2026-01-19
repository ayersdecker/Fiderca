import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import CirclesList from './pages/CirclesList';
import CircleDetail from './pages/CircleDetail';
import Invites from './pages/Invites';
import Connections from './pages/Connections';
import Vaults from './pages/Vaults';
import Calendar from './pages/Calendar';
import Login from './pages/Login';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter basename="/Fiderca">
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="circles" element={<CirclesList />} />
          <Route path="circles/:circleId" element={<CircleDetail />} />
          <Route path="invites" element={<Invites />} />
          <Route path="connections" element={<Connections />} />
          <Route path="vaults" element={<Vaults />} />
          <Route path="calendar" element={<Calendar />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
