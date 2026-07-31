import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import QuotationPage from './pages/QuotationPage';
import QuotationNewPage from './pages/QuotationNewPage';
import ImportPage from './pages/ImportPage';
import RecordsPage from './pages/RecordsPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import VolumePage from './pages/VolumePage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/quotation" element={<QuotationPage />} />
          <Route path="/quotation/new" element={<QuotationNewPage />} />
          <Route path="/products/import" element={<ImportPage />} />
          <Route path="/volume" element={<VolumePage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/quotation" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
