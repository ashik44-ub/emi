import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';
import { Users, Wallet, CalendarDays, ArrowUpRight, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const paymentEndpoint = user?.role === 'Admin' ? '/payments/all' : '/payments/history';
        const [statsRes, paymentsRes, membersRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get(paymentEndpoint),
          api.get('/dashboard/members')
        ]);
        setStats(statsRes.data);
        setPayments(paymentsRes.data);
        setMembers(membersRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2);
    return `${day}-${month}-${year}`;
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text(user?.role === 'Admin' ? 'All Payments Statement' : 'Payment Statement', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Name: ${user.fullName}`, 14, 32);
    doc.text(`Member ID: ${user.memberId}`, 14, 38);
    
    if (user?.role !== 'Admin') {
      doc.text(`Total Paid: BDT ${stats?.userTotalPaid || 0}`, 14, 44);
    }

    const tableColumn = user?.role === 'Admin' 
      ? ["Date", "Member Name", "Member ID", "Period", "Amount", "Method", "Txn ID"]
      : ["Date", "Month", "Year", "Amount", "Method", "Txn ID"];
      
    const tableRows = [];

    payments.forEach(payment => {
      let paymentData;
      if (user?.role === 'Admin') {
        paymentData = [
          formatDate(payment.paymentDate || payment.createdAt),
          payment.userId?.fullName || 'N/A',
          payment.userId?.memberId || 'N/A',
          `${payment.month} ${payment.year}`,
          `BDT ${payment.amount}`,
          payment.paymentMethod,
          payment.transactionId
        ];
      } else {
        paymentData = [
          formatDate(payment.paymentDate || payment.createdAt),
          payment.month,
          payment.year,
          `BDT ${payment.amount}`,
          payment.paymentMethod,
          payment.transactionId
        ];
      }
      tableRows.push(paymentData);
    });

    doc.autoTable({
      startY: 50,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save(`${user.memberId}_statement.pdf`);
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
        <div className="flex gap-3">
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium flex items-center gap-2">
            <Users size={18} /> Total Members: {stats?.totalMembers || 0}
          </div>
          {user?.role === 'Admin' && (
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium flex items-center gap-2">
              <Wallet size={18} /> Total Collection: BDT {stats?.totalCollection || 0}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-xl text-primary">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Balance Paid</p>
            <h3 className="text-2xl font-bold text-foreground">BDT {stats?.userTotalPaid || 0}</h3>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex items-center gap-4">
          <div className="p-4 bg-orange-500/10 rounded-xl text-orange-500">
            <CalendarDays size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Paid This Month ({stats?.currentMonth})</p>
            <h3 className="text-2xl font-bold text-foreground">BDT {stats?.paidThisMonth || 0}</h3>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex items-center gap-4">
          <div className="p-4 bg-green-500/10 rounded-xl text-green-500">
            <ArrowUpRight size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Paid This Year ({stats?.currentYear})</p>
            <h3 className="text-2xl font-bold text-foreground">BDT {stats?.paidThisYear || 0}</h3>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-bold text-foreground">{user?.role === 'Admin' ? 'All Payment Statements' : 'Your Payment Statement'}</h3>
          <button 
            onClick={downloadPDF}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-border"
          >
            <FileDown size={16} /> Download PDF
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-sm">
                <th className="p-4 font-medium border-b border-border">Date</th>
                {user?.role === 'Admin' && (
                  <>
                    <th className="p-4 font-medium border-b border-border">Member Name</th>
                    <th className="p-4 font-medium border-b border-border">Member ID</th>
                  </>
                )}
                <th className="p-4 font-medium border-b border-border">Period</th>
                <th className="p-4 font-medium border-b border-border">Amount</th>
                <th className="p-4 font-medium border-b border-border">Method</th>
                <th className="p-4 font-medium border-b border-border">Transaction ID</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan={user?.role === 'Admin' ? "7" : "5"} className="p-8 text-center text-muted-foreground">No payments found.</td></tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 border-b border-border text-sm">{formatDate(payment.paymentDate || payment.createdAt)}</td>
                    {user?.role === 'Admin' && (
                      <>
                        <td className="p-4 border-b border-border text-sm font-medium">{payment.userId?.fullName || 'N/A'}</td>
                        <td className="p-4 border-b border-border text-sm font-mono text-muted-foreground">{payment.userId?.memberId || 'N/A'}</td>
                      </>
                    )}
                    <td className="p-4 border-b border-border text-sm">{payment.month} {payment.year}</td>
                    <td className="p-4 border-b border-border font-medium text-primary">BDT {payment.amount}</td>
                    <td className="p-4 border-b border-border text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                        {payment.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 border-b border-border text-sm font-mono text-muted-foreground">{payment.transactionId}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-bold text-foreground">All Members</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-sm">
                <th className="p-4 font-medium border-b border-border">Name</th>
                <th className="p-4 font-medium border-b border-border">Member ID</th>
                <th className="p-4 font-medium border-b border-border">Mobile</th>
                <th className="p-4 font-medium border-b border-border">Joining Date</th>
                {user?.role === 'Admin' && <th className="p-4 font-medium border-b border-border text-right">Action</th>}
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr><td colSpan={user?.role === 'Admin' ? "5" : "4"} className="p-8 text-center text-muted-foreground">No members found.</td></tr>
              ) : (
                members.map((m) => (
                  <tr key={m._id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 border-b border-border font-medium">{m.fullName}</td>
                    <td className="p-4 border-b border-border text-sm font-mono">{m.memberId}</td>
                    <td className="p-4 border-b border-border text-sm">{m.mobileNo}</td>
                    <td className="p-4 border-b border-border text-sm">{formatDate(m.joiningDate)}</td>
                    {user?.role === 'Admin' && (
                      <td className="p-4 border-b border-border text-right">
                        <button 
                          onClick={() => window.location.href = `/edit-member/${m._id}`}
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
      </div>
    </div>
  );
}
