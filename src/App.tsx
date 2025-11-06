import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './app/login/page';
import OAuthCallbackPage from './app/oauth/callback/page';
import DashboardPage from './pages/DashboardPage';
import BoardPage from './pages/BoardPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicOnlyRoute } from './routes/PublicOnlyRoute';

function App(): JSX.Element {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/boards/:boardId" element={<BoardPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
