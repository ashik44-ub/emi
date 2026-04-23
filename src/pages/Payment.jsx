import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { CreditCard, CheckCircle2 } from 'lucide-react';

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function Payment() {
  const [formData, setFormData] = useState({
    amount: '', month: months[new Date().getMonth()], year: new Date().getFullYear().toString(),
    paymentMethod: '', transactionId: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/payments/create', {
        ...formData,
        amount: Number(formData.amount),
        year: Number(formData.year)
      });
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit payment');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="text-green-500 w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Payment Successful!</h2>
        <p className="text-muted-foreground">Your payment has been recorded. Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
            <div className="p-4 bg-primary/10 rounded-xl text-primary">
              <CreditCard size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Make a Payment</h2>
              <p className="text-muted-foreground">Submit your monthly EMI deposit</p>
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
                    <input type="radio" name="paymentMethod" value={method} className="hidden" onChange={handleChange} required />
                    <span className="font-medium">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.paymentMethod && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="block text-sm font-medium text-foreground mb-1">
                  {formData.paymentMethod === 'Cash' ? 'Receipt Number / Reference' : 'Transaction ID / Reference Number'}
                </label>
                <input type="text" name="transactionId" value={formData.transactionId} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono tracking-wider" placeholder={formData.paymentMethod === 'Cash' ? "Enter Receipt No" : "Enter TrxID"} />
              </div>
            )}

            <div className="pt-4 mt-8 border-t border-border">
              <button
                type="submit"
                disabled={loading || !formData.paymentMethod}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-4 rounded-xl transition-all shadow-lg shadow-primary/30 disabled:opacity-50 disabled:shadow-none"
              >
                {loading ? 'Processing...' : 'Submit Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
