import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';
import { User, KeyRound, Mail, Phone, Calendar, MapPin, CreditCard, Users as UsersIcon } from 'lucide-react';

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const [passwords, setPasswords] = useState({ oldPin: '', newPin: '', confirmPin: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Refresh user data on mount to ensure we have everything
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        console.error("Failed to refresh user data", err);
      }
    };
    fetchUserData();
  }, [setUser]);

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const InfoItem = ({ icon: Icon, label, value, mono = false }) => (
    <div className="flex gap-3">
      <div className="mt-1 text-muted-foreground">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{label}</p>
        <p className={`text-foreground font-medium ${mono ? 'font-mono' : ''}`}>{value || 'N/A'}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">User Profile</h2>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${user?.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
          {user?.role} Account
        </span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                <User size={48} />
              </div>
              <div className="text-center md:text-left space-y-2">
                <h3 className="text-3xl font-bold text-foreground">{user?.fullName}</h3>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard size={18} />
                    <span className="font-mono bg-secondary px-2 py-0.5 rounded text-secondary-foreground">{user?.memberId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar size={18} />
                    <span>Joined: {formatDate(user?.joiningDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal & Contact */}
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 space-y-6">
              <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Phone size={20} className="text-primary" /> Contact & Personal
              </h4>
              <div className="space-y-4">
                <InfoItem icon={Phone} label="Mobile Number" value={user?.mobileNo} />
                <InfoItem icon={Mail} label="Email Address" value={user?.email} />
                <InfoItem icon={User} label="Father's Name" value={user?.fatherName} />
              </div>
            </div>

            {/* Address & Identity */}
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 space-y-6">
              <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
                <MapPin size={20} className="text-primary" /> Address & Identity
              </h4>
              <div className="space-y-4">
                <InfoItem icon={MapPin} label="Present Address" value={user?.presentAddress} />
                <InfoItem icon={CreditCard} label="NID Number" value={user?.nidNo} />
              </div>
            </div>

            {/* Nominee Info */}
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 space-y-6 md:col-span-2">
              <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
                <UsersIcon size={20} className="text-primary" /> Nominee Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoItem icon={User} label="Nominee Name" value={user?.nomineeName} />
                <InfoItem icon={CreditCard} label="Nominee NID" value={user?.nomineeNidNo} />
                <InfoItem icon={UsersIcon} label="Relation" value={user?.relationWithNominee} />
              </div>
            </div>
          </div>
        </div>

        {/* Action Column */}
        <div className="space-y-6">
          {/* Change PIN */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <KeyRound className="text-primary" />
              <h3 className="text-lg font-bold text-foreground">Security</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-6 text-center">Change your 4-digit PIN code to secure your account.</p>

            {message.text && (
              <div className={`p-3 rounded-lg mb-6 text-sm flex items-center gap-2 ${message.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-700'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Current PIN</label>
                <input type="password" name="oldPin" maxLength="4" value={passwords.oldPin} onChange={handleChange} required className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none tracking-widest text-center text-lg" placeholder="••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">New PIN</label>
                <input type="password" name="newPin" maxLength="4" value={passwords.newPin} onChange={handleChange} required className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none tracking-widest text-center text-lg" placeholder="••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Confirm New PIN</label>
                <input type="password" name="confirmPin" maxLength="4" value={passwords.confirmPin} onChange={handleChange} required className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none tracking-widest text-center text-lg" placeholder="••••" />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-primary/30 mt-2 flex items-center justify-center gap-2"
              >
                {loading ? 'Updating...' : 'Update Security PIN'}
              </button>
            </form>
          </div>

          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
            <h4 className="font-bold text-primary mb-2">Need help?</h4>
            <p className="text-sm text-primary/70">If you need to update your official bio-data, please contact the system administrator.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
