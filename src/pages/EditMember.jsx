import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';

export default function EditMember() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    fullName: '', memberId: '', mobileNo: '', email: '', fatherName: '', presentAddress: '',
    nidNo: '', nomineeName: '', nomineeNidNo: '', relationWithNominee: '', joiningDate: '', pinCode: '', role: 'User'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== 'Admin') {
      navigate('/');
    } else {
      fetchUser();
    }
  }, [user, navigate, id]);

  const fetchUser = async () => {
    try {
      const res = await api.get(`/auth/user/${id}`);
      const userData = res.data;
      // Format date for input field
      if (userData.joiningDate) {
        userData.joiningDate = new Date(userData.joiningDate).toISOString().split('T')[0];
      }
      setFormData({
        ...formData,
        ...userData,
        pinCode: '' // Keep pin blank unless they want to change it
      });
    } catch (err) {
      setError('Failed to fetch user details');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (formData.pinCode && formData.pinCode.length !== 4) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    setLoading(true);

    try {
      await api.put(`/auth/user/${id}`, formData);
      setSuccess('User details updated successfully!');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (user && user.role !== 'Admin') return null;

  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Edit Member Data</h1>
            <p className="text-muted-foreground">Update bio data for {formData.fullName}</p>
          </div>
          
          {error && <div className="bg-destructive/10 text-destructive p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}
          {success && <div className="bg-green-500/10 text-green-600 p-3 rounded-lg mb-6 text-sm text-center font-medium">{success}</div>}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Full Name *</label>
              <input type="text" name="fullName" value={formData.fullName} required onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Member ID *</label>
              <input type="text" name="memberId" value={formData.memberId} required onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Mobile No *</label>
              <input type="text" name="mobileNo" value={formData.mobileNo} required onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Father's Name</label>
              <input type="text" name="fatherName" value={formData.fatherName || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">NID No</label>
              <input type="text" name="nidNo" value={formData.nidNo || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">Present Address</label>
              <input type="text" name="presentAddress" value={formData.presentAddress || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
            </div>

            <div className="pt-4 border-t border-border md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-foreground">Nominee Information</h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nominee Name</label>
                <input type="text" name="nomineeName" value={formData.nomineeName || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nominee NID No</label>
                <input type="text" name="nomineeNidNo" value={formData.nomineeNidNo || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Relation with Nominee</label>
                <input type="text" name="relationWithNominee" value={formData.relationWithNominee || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
              </div>
            </div>

            <div className="pt-4 border-t border-border md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Joining Date *</label>
                <input type="date" name="joiningDate" value={formData.joiningDate} required onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">4-Digit PIN Code (Leave blank to keep old PIN)</label>
                <input type="password" name="pinCode" value={formData.pinCode} maxLength="4" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none tracking-widest" placeholder="••••" />
              </div>
            </div>

            <div className="md:col-span-2 mt-4 flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold py-3 px-4 rounded-lg transition-colors border border-border"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-primary/30"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
