import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LayoutDashboard, CreditCard, User, LogOut, FileText, UserPlus } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-secondary flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card shadow-lg flex flex-col hidden md:flex">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-primary">EMI System</h1>
          <p className="text-sm text-muted-foreground mt-1">Hello, {user?.fullName}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          {user?.role !== 'Admin' && (
            <Link to="/payment" className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors">
              <CreditCard size={20} /> Payment
            </Link>
          )}
          <Link to="/reports" className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors">
            <FileText size={20} /> Reports
          </Link>
          {user?.role === 'Admin' && (
            <>
              <Link to="/add-member" className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors">
                <User size={20} /> Add Member
              </Link>
            </>
          )}
          <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors">
            <User size={20} /> Profile
          </Link>
        </nav>
        <div className="p-4 border-t border-border">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <header className="md:hidden bg-card p-4 shadow flex justify-between items-center border-b border-border">
          <h1 className="text-xl font-bold text-primary">EMI System</h1>
          <button onClick={handleLogout} className="text-destructive"><LogOut size={20}/></button>
        </header>
        
        {/* Mobile Nav (Bottom) */}
        <div className="md:hidden fixed bottom-0 w-full bg-card shadow-t flex justify-around p-3 border-t border-border z-50">
          <Link to="/" className="text-muted-foreground hover:text-primary"><LayoutDashboard size={24}/></Link>
          {user?.role !== 'Admin' && (
            <Link to="/payment" className="text-muted-foreground hover:text-primary"><CreditCard size={24}/></Link>
          )}
          <Link to="/reports" className="text-muted-foreground hover:text-primary"><FileText size={24}/></Link>
          {user?.role === 'Admin' && (
            <>
              <Link to="/add-member" className="text-muted-foreground hover:text-primary"><UserPlus size={24}/></Link>
            </>
          )}
          <Link to="/profile" className="text-muted-foreground hover:text-primary"><User size={24}/></Link>
        </div>

        <div className="p-6 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
