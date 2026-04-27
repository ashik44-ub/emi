import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FileText, Search, LayoutGrid, List } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Navigate } from 'react-router-dom';
import { formatCurrency } from '../utils/format';

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function Reports() {
  const { user } = useAuthStore();
  const [deposits, setDeposits] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('summary'); // Default to summary
  const [filter, setFilter] = useState({ year: new Date().getFullYear().toString(), month: '' });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.year) params.append('year', filter.year);
      
      if (viewMode === 'list') {
        if (filter.month) params.append('month', filter.month);
        const res = await api.get(`/reports/all-deposits?${params.toString()}`);
        setDeposits(res.data);
      } else {
        const res = await api.get(`/reports/yearly-summary?${params.toString()}`);
        setSummary(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filter, viewMode]);

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <FileText size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Collection Reports</h2>
            <p className="text-muted-foreground">Monitor and analyze member payments</p>
          </div>
        </div>

        <div className="flex bg-muted p-1 rounded-xl self-start md:self-center">
          <button 
            onClick={() => setViewMode('summary')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'summary' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <LayoutGrid size={18} />
            Yearly Summary
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <List size={18} />
            Collection List
          </button>
        </div>
      </div>

      <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-1">Select Year</label>
            <input 
              type="number" 
              name="year" 
              value={filter.year} 
              onChange={handleFilterChange} 
              className="w-full px-4 py-2 rounded-lg border border-border bg-background outline-none focus:border-primary"
            />
          </div>
          {viewMode === 'list' && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-1">Filter by Month</label>
              <select 
                name="month" 
                value={filter.month} 
                onChange={handleFilterChange}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background outline-none focus:border-primary"
              >
                <option value="">All Months</option>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          )}
        </div>

        {viewMode === 'list' ? (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground text-sm">
                  <th className="p-4 font-medium border-b border-border">Member Name</th>
                  <th className="p-4 font-medium border-b border-border">Member ID</th>
                  <th className="p-4 font-medium border-b border-border">Period</th>
                  <th className="p-4 font-medium border-b border-border text-right">Amount</th>
                  {user?.role === 'Admin' && <th className="p-4 font-medium border-b border-border text-right">Action</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="p-8 text-center text-muted-foreground">Loading reports...</td></tr>
                ) : deposits.length === 0 ? (
                  <tr><td colSpan="4" className="p-8 text-center text-muted-foreground">No deposits found for this period.</td></tr>
                ) : (
                  deposits.map((deposit, index) => (
                    <tr key={index} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 border-b border-border font-medium">{deposit.fullName}</td>
                      <td className="p-4 border-b border-border font-mono text-sm">{deposit.memberId}</td>
                      <td className="p-4 border-b border-border text-sm font-bold">{deposit.month} {deposit.year}</td>
                      <td className="p-4 border-b border-border font-bold text-primary text-right">BDT {formatCurrency(deposit.totalAmount)}</td>
                      {user?.role === 'Admin' && (
                        <td className="p-4 border-b border-border text-right">
                          <button 
                            onClick={() => window.location.href = `/edit-payment/${deposit._id}`}
                            className="text-primary hover:underline text-sm font-medium"
                          >
                            Edit
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground text-[10px] uppercase tracking-wider">
                  <th className="p-3 font-bold border-b border-border sticky left-0 bg-muted/50 z-10">Member Name</th>
                  {months.map(m => (
                    <th key={m} className="p-3 font-bold border-b border-border text-center whitespace-nowrap">{m.substring(0, 3)}</th>
                  ))}
                  <th className="p-3 font-bold border-b border-border text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="14" className="p-8 text-center text-muted-foreground">Loading summary...</td></tr>
                ) : summary.length === 0 ? (
                  <tr><td colSpan="14" className="p-8 text-center text-muted-foreground">No data found for this year.</td></tr>
                ) : (
                  summary.map((user, index) => {
                    const rowTotal = Object.values(user.payments).reduce((sum, val) => sum + val, 0);
                    return (
                      <tr key={index} className="hover:bg-muted/30 transition-colors text-sm">
                        <td className="p-3 border-b border-border font-medium sticky left-0 bg-card z-10 border-r border-border/50 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                          <div className="flex flex-col">
                            <span>{user.fullName}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{user.memberId}</span>
                          </div>
                        </td>
                        {months.map(m => {
                          const amount = user.payments[m] || 0;
                          return (
                            <td key={m} className={`p-3 border-b border-border text-center ${amount > 0 ? 'bg-green-100 text-green-700 font-bold' : ''}`}>
                              {amount > 0 ? formatCurrency(amount) : ''}
                            </td>
                          );
                        })}
                        <td className="p-3 border-b border-border font-bold text-right bg-primary/5">
                          {rowTotal > 0 ? `BDT ${formatCurrency(rowTotal)}` : '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
