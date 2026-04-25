import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { CreditCard, Save, X } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function EditPayment() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    amount: '', month: '', year: '',
    paymentMethod: '', transactionId: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [memberName, setMemberName] = useState('');

  useEffect(() => {
    if (user && user.role !== 'Admin') {
      navigate('/');
      return;
    }
    fetchPayment();
  }, [id, user]);

  const fetchPayment = async () => {
    try {
      const res = await api.get(`/payments/${id}`);
      const p = res.data;
      setFormData({
        amount: p.amount,
        month: p.month,
        year: p.year.toString(),
        paymentMethod: p.paymentMethod,
        transactionId: p.transactionId
      });
      setMemberName(p.userId?.fullName || 'N/A');
    } catch (err) {
      setError('Failed to fetch payment details');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.put(`/payments/${id}`, {
        ...formData,
        amount: Number(formData.amount),
        year: Number(formData.year)
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update payment');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
            <div className="p-4 bg-primary/10 rounded-xl text-primary">
              <CreditCard size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Edit Payment</h2>
              <p className="text-muted-foreground">Updating payment for <span className="text-foreground font-semibold">{memberName}</span></p>
            </div>
          </div>

          {error && <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Month</label>
                <select name="month" value={formData.month} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Year</label>
                <input type="number" name="year" value={formData.year} onChange={handleChange} required min="2000" max="2100" className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Amount (BDT)</label>
              <input type="number" name="amount" value={formData.amount} onChange={handleChange} required min="1" className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-lg font-semibold" placeholder="e.g. 500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Payment Method</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {['bKash', 'Nagad', 'Bank', 'Cash'].map(method => (
                  <label key={method} className={`cursor-pointer border rounded-xl p-4 text-center transition-all ${formData.paymentMethod === method ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50 text-foreground'}`}>
                    <input type="radio" name="paymentMethod" value={method} className="hidden" onChange={handleChange} required checked={formData.paymentMethod === method} />
                    <span className="font-medium">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Transaction ID / Reference Number</label>
              <input type="text" name="transactionId" value={formData.transactionId} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono tracking-wider" placeholder="Enter TrxID" />
            </div>

            <div className="pt-4 mt-8 border-t border-border flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold py-4 px-4 rounded-xl transition-all border border-border flex items-center justify-center gap-2"
              >
                <X size={20} /> Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-4 rounded-xl transition-all shadow-lg shadow-primary/30 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={20} /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
