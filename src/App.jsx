import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import AnimalDetailPage from './pages/AnimalDetailPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import AnimalCreatePage from './pages/AnimalCreatePage.jsx';
import AnimalEditPage from './pages/AnimalEditPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/animals/:id" element={<AnimalDetailPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/new" element={<AnimalCreatePage />} />
        <Route path="/admin/animals/:id/edit" element={<AnimalEditPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
} 