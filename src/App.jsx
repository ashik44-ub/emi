import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useEffect } from 'react';
import api from './api/axios';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Payment from './pages/Payment';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import EditMember from './pages/EditMember';
import EditPayment from './pages/EditPayment';
import Layout from './components/Layout';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  const { setUser, isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error('Failed to fetch user', err);
          useAuthStore.getState().logout();
        }
      }
    };
    fetchUser();
  }, [token, setUser]);

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />

      
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="payment" element={<Payment />} />
        <Route path="profile" element={<Profile />} />
        <Route path="add-member" element={<Register />} />
        <Route path="edit-member/:id" element={<EditMember />} />
        <Route path="edit-payment/:id" element={<EditPayment />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}

export default App;
