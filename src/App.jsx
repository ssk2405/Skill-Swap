import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EditProfile from './pages/EditProfile';
import SwapRequests from './pages/SwapRequests';
import AdminPanel from './pages/AdminPanel';

function App() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Toaster />
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

        {/* PRIVATE ROUTES */}
        <Route path="/edit-profile" element={user ? <EditProfile /> : <Navigate to="/login" />} />
        <Route path="/swaps" element={user ? <SwapRequests /> : <Navigate to="/login" />} />
        <Route path="/admin" element={user?.isAdmin ? <AdminPanel /> : <Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
