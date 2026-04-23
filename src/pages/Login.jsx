import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';

export default function Login() {
  const [mobileNo, setMobileNo] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { mobileNo, pinCode });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your EMI account</p>
          </div>
          
          {error && <div className="bg-destructive/10 text-destructive p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Mobile No</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="Enter mobile number"
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">4-Digit PIN</label>
              <input
                type="password"
                maxLength="4"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all tracking-widest text-lg"
                placeholder="••••"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2 mt-4 shadow-lg shadow-primary/30"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
}
