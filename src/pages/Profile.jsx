import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';
import { User, KeyRound } from 'lucide-react';

export default function Profile() {
  const { user } = useAuthStore();
  const [passwords, setPasswords] = useState({ oldPin: '', newPin: '', confirmPin: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (passwords.newPin !== passwords.confirmPin) {
      setMessage({ type: 'error', text: 'New PINs do not match' });
      return;
    }
    if (passwords.newPin.length !== 4) {
      setMessage({ type: 'error', text: 'PIN must be exactly 4 digits' });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/change-pin', {
        oldPin: passwords.oldPin,
        newPin: passwords.newPin
      });
      setMessage({ type: 'success', text: res.data.message });
      setPasswords({ oldPin: '', newPin: '', confirmPin: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change PIN' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-foreground">User Profile</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="md:col-span-2 bg-card rounded-2xl shadow-sm border border-border p-8">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <User size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">{user?.fullName}</h3>
              <p className="text-muted-foreground flex items-center gap-2">
                Member ID: <span className="font-mono bg-secondary px-2 py-0.5 rounded text-secondary-foreground">{user?.memberId}</span>
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Mobile Number</p>
              <p className="font-medium text-foreground">{user?.mobileNo}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Role</p>
              <p className="font-medium text-foreground">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user?.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                  {user?.role}
                </span>
              </p>
            </div>
            {/* Additional info could be fetched from /api/auth/me if needed */}
          </div>
        </div>

        {/* Change PIN */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          <div className="flex items-center gap-3 mb-6">
            <KeyRound className="text-primary" />
            <h3 className="text-lg font-bold text-foreground">Change PIN</h3>
          </div>

          {message.text && (
            <div className={`p-3 rounded-lg mb-6 text-sm ${message.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-700'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Current PIN</label>
              <input type="password" name="oldPin" maxLength="4" value={passwords.oldPin} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none tracking-widest" placeholder="••••" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">New PIN</label>
              <input type="password" name="newPin" maxLength="4" value={passwords.newPin} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none tracking-widest" placeholder="••••" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Confirm New PIN</label>
              <input type="password" name="confirmPin" maxLength="4" value={passwords.confirmPin} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none tracking-widest" placeholder="••••" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 px-4 rounded-lg transition-colors mt-2"
            >
              {loading ? 'Updating...' : 'Update PIN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
