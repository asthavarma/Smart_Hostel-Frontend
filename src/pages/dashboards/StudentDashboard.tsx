import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CreditCard, ShieldAlert, Users, CalendarCheck, CheckCircle2, Download, Camera, Loader2, Phone, Mail, RefreshCw, ArrowRight } from 'lucide-react';
import api from '../../services/api';

interface RoommateStudent {
  id: string;
  studentId: string;
  phone?: string;
  department?: string;
  user: { name: string; email: string };
}

interface StudentProfile {
  id: string;
  studentId: string;
  department: string;
  semester: number;
  phone?: string;
  emergencyContact?: string;
  roomAllocations: Array<{
    id: string;
    isActive: boolean;
    room: {
      id: string;
      roomNumber: string;
      building: string;
      floor: number;
      roomType: string;
      baseFee: number;
      roomAllocations: Array<{
        id: string;
        student: RoommateStudent;
      }>;
    };
  }>;
  fees: Array<{
    id: string;
    amount: number;
    utilityCharges: number;
    miscCharges: number;
    lateFee: number;
    status: string;
    billingPeriod: string;
    dueDate: string;
  }>;
  attendance: Array<{
    date: string;
    status: string;
  }>;
}

const StudentDashboard: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  // Payment modal state
  const [showPayModal, setShowPayModal] = useState(false);
  const [payMethod, setPayMethod] = useState('ONLINE');
  const [payTxnRef, setPayTxnRef] = useState('');
  const [submittingPay, setSubmittingPay] = useState(false);
  const [submittingQR, setSubmittingQR] = useState(false);

  const fetchStudentData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const userJson = localStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;
      if (user && user.studentProfileId) {
        const res = await api.get(`/students/${user.studentProfileId}`);
        setProfile(res.data);
      } else if (user) {
        // Fallback: search student list by user email or id
        const studentsRes = await api.get('/students');
        const match = studentsRes.data.find((s: any) => s.user.email === user.email);
        if (match) {
          const detailRes = await api.get(`/students/${match.id}`);
          setProfile(detailRes.data);
        } else {
          setErrorMsg('No active student profile linked to your account.');
        }
      }
    } catch (err: any) {
      console.error('Error fetching student dashboard data', err);
      setErrorMsg(err.response?.data?.error || 'Failed to load student dashboard details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const handleSimulateQR = async () => {
    setSubmittingQR(true);
    setActionMsg('');
    try {
      const res = await api.post('/attendance/qr-scan', {
        qrToken: 'AEGIS-GATE-CORRIDOR-2026'
      });
      setActionMsg(`Attendance marked successfully via QR scan (${res.data.status})`);
      fetchStudentData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'QR scan failed');
    } finally {
      setSubmittingQR(false);
    }
  };

  const handlePayInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!latestFee) return;
    setSubmittingPay(true);
    setErrorMsg('');
    try {
      await api.post('/fees/pay', {
        feeId: latestFee.id,
        paymentMethod: payMethod,
        transactionReference: payTxnRef
      });
      setShowPayModal(false);
      setPayTxnRef('');
      setActionMsg('Payment logged successfully! Receipt generated.');
      fetchStudentData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Payment logging failed');
    } finally {
      setSubmittingPay(false);
    }
  };

  const handleDownloadPdf = (feeId: string, billingPeriod: string) => {
    api.get(`/fees/${feeId}/pdf`, { responseType: 'blob' })
      .then((res) => {
        const blob = new Blob([res.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Invoice-${billingPeriod.replace(' ', '_')}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => console.error('Error downloading invoice pdf', err));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-xs text-muted-foreground font-semibold">Loading Student Portal...</p>
      </div>
    );
  }

  if (errorMsg && !profile) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl border border-border space-y-4 page-fade max-w-lg mx-auto mt-12">
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-lg text-foreground">Profile Error</h3>
        <p className="text-xs text-muted-foreground">{errorMsg}</p>
        <button
          onClick={fetchStudentData}
          className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-xl hover:bg-primary/95 shadow-md flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" /> Retry Connection
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl border border-border max-w-lg mx-auto mt-12">
        <h3 className="font-bold text-lg">No Profile Registered</h3>
        <p className="text-sm text-muted-foreground mt-1">Contact Hostel Administration to register your student profile details.</p>
      </div>
    );
  }

  // Get active room allocation details
  const activeAlloc = profile.roomAllocations?.find(a => a.isActive);
  const room = activeAlloc?.room;
  const roommates = room?.roomAllocations?.filter(a => a.student?.id !== profile.id) || [];

  // Get latest fee invoice
  const latestFee = profile.fees?.[0];
  const totalDue = latestFee ? (latestFee.amount + latestFee.utilityCharges + latestFee.miscCharges + latestFee.lateFee) : 0;

  // Attendance metrics
  const totalAttendance = profile.attendance?.length || 0;
  const presentCount = profile.attendance?.filter(a => a.status === 'PRESENT').length || 0;
  const lateCount = profile.attendance?.filter(a => a.status === 'LATE').length || 0;
  const attendanceRate = totalAttendance > 0 ? Math.round(((presentCount + lateCount * 0.75) / totalAttendance) * 100) : 100;

  return (
    <div className="space-y-8 page-fade">
      {/* Action Notification Badges */}
      {actionMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs py-3 px-4 rounded-xl font-semibold flex justify-between items-center">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg('')} className="text-xs font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Banner Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-8 rounded-2xl border border-blue-200 shadow-lg shadow-blue-500/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 min-h-[140px]">
        <img 
          src="https://images.unsplash.com/photo-1527853787696-f7be74f2e39a?w=1200&auto=format&fit=crop&q=80" 
          alt="Student Banner" 
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/40 to-transparent" />
        
        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold tracking-tight">Welcome Back to Claria University Hostel</h1>
          <p className="text-sm text-blue-100 mt-1">Roll Number: {profile.studentId} | Dept: {profile.department} (Semester {profile.semester})</p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-2">
          <button
            onClick={handleSimulateQR}
            disabled={submittingQR}
            className="px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-xs transition-all hover:bg-primary/95 shadow-md flex items-center gap-2"
          >
            {submittingQR ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            <span>QR Attendance Check-In</span>
          </button>

          <div className="flex gap-2 text-xs font-bold px-3 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl items-center backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Residency Active
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Allocated Room Card */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 text-primary p-4 rounded-2xl">
              <Home className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">My Allocated Room</span>
              {room ? (
                <h3 className="text-2xl font-extrabold tracking-tight mt-0.5">{room.roomNumber} ({room.building})</h3>
              ) : (
                <h3 className="text-lg font-bold text-red-500 mt-0.5">Unassigned</h3>
              )}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border/60 flex justify-between items-center text-xs font-semibold">
            <span className="text-muted-foreground">Floor: {room?.floor || 'N/A'} | Type: {room?.roomType || 'N/A'}</span>
            <NavLink to="/rooms" className="text-primary hover:underline flex items-center gap-1">
              Room Details <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>

        {/* Current Fee Status Card */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/10 text-emerald-500 p-4 rounded-2xl">
              <CreditCard className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Current Fee Status</span>
              {latestFee ? (
                <h3 className="text-xl font-extrabold tracking-tight mt-0.5 flex items-center gap-2">
                  ₹{totalDue.toFixed(2)}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    latestFee.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                    'bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse'
                  }`}>
                    {latestFee.status}
                  </span>
                </h3>
              ) : (
                <h3 className="text-base font-bold text-muted-foreground mt-0.5">No Invoices</h3>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/60 flex justify-between items-center gap-2 text-xs">
            {latestFee && latestFee.status !== 'PAID' ? (
              <button
                onClick={() => setShowPayModal(true)}
                className="px-3 py-1.5 bg-emerald-600 text-white font-semibold rounded-xl text-xs hover:bg-emerald-550 transition-colors shadow-md"
              >
                Pay Now (₹{totalDue.toFixed(2)})
              </button>
            ) : latestFee ? (
              <button
                onClick={() => handleDownloadPdf(latestFee.id, latestFee.billingPeriod)}
                className="px-3 py-1.5 bg-secondary border border-border text-foreground font-semibold rounded-xl text-xs hover:bg-secondary/80 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> PDF Receipt
              </button>
            ) : null}
            <NavLink to="/fees" className="text-xs font-semibold text-primary hover:underline ml-auto">
              View All Invoices
            </NavLink>
          </div>
        </div>

        {/* 30-Day Attendance Rate Card */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-500/10 text-indigo-500 p-4 rounded-2xl">
              <CalendarCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">30-Day Attendance</span>
              <h3 className="text-3xl font-extrabold tracking-tight mt-0.5">{attendanceRate}%</h3>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border/60 flex justify-between items-center text-xs font-semibold text-muted-foreground">
            <span>Presents: {presentCount} | Lates: {lateCount}</span>
            <NavLink to="/attendance" className="text-primary hover:underline">Log History</NavLink>
          </div>
        </div>
      </div>

      {/* Details Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Roommate Directory */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-foreground">Roommate Directory</h3>
            <span className="text-xs font-semibold text-muted-foreground">{roommates.length} Resident(s)</span>
          </div>

          <div className="space-y-4">
            {roommates.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground italic">
                No roommates currently sharing this room.
              </div>
            ) : (
              roommates.map((rm) => (
                <div key={rm.id} className="p-4 bg-secondary/30 rounded-xl border border-border/60 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-sm flex-shrink-0">
                      {rm.student.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{rm.student.user.name}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span>Roll: {rm.student.studentId}</span>
                        {rm.student.department && <span>| {rm.student.department}</span>}
                      </p>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-primary" /> {rm.student.user.email}</span>
                        {rm.student.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-emerald-500" /> {rm.student.phone}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
          <h3 className="font-bold text-base text-foreground">Quick Action Shortcuts</h3>
          <div className="grid grid-cols-2 gap-4">
            <NavLink to="/complaints" className="p-4 bg-secondary/40 border border-border hover:bg-secondary/80 rounded-xl transition-all flex flex-col justify-between h-28 group">
              <ShieldAlert className="w-6 h-6 text-rose-500 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="text-xs font-bold text-foreground">File Complaint</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Report room & facility issues.</p>
              </div>
            </NavLink>

            <NavLink to="/visitors" className="p-4 bg-secondary/40 border border-border hover:bg-secondary/80 rounded-xl transition-all flex flex-col justify-between h-28 group">
              <Users className="w-6 h-6 text-indigo-500 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="text-xs font-bold text-foreground">Visitor Passes</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Generate QR code entry pass.</p>
              </div>
            </NavLink>

            <NavLink to="/fees" className="p-4 bg-secondary/40 border border-border hover:bg-secondary/80 rounded-xl transition-all flex flex-col justify-between h-28 group">
              <CreditCard className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="text-xs font-bold text-foreground">Fees & Invoices</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">View payment receipts & dues.</p>
              </div>
            </NavLink>

            <NavLink to="/attendance" className="p-4 bg-secondary/40 border border-border hover:bg-secondary/80 rounded-xl transition-all flex flex-col justify-between h-28 group">
              <CalendarCheck className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="text-xs font-bold text-foreground">Attendance Logs</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Check daily check-in status.</p>
              </div>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Pay Invoice Modal */}
      {showPayModal && latestFee && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden page-fade text-left">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/20">
              <h3 className="font-bold text-base text-foreground">Pay Fee Invoice: {latestFee.billingPeriod}</h3>
              <button onClick={() => setShowPayModal(false)} className="text-xs font-semibold text-muted-foreground">Close</button>
            </div>
            <form onSubmit={handlePayInvoice} className="p-6 space-y-4">
              <div className="bg-secondary/40 p-4 rounded-xl border border-border/60 text-xs space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Room Rent:</span><span className="font-bold">₹{latestFee.amount.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Utility Charges:</span><span className="font-bold">₹{latestFee.utilityCharges.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Misc & Late Fees:</span><span className="font-bold">₹{(latestFee.miscCharges + latestFee.lateFee).toFixed(2)}</span></div>
                <div className="flex justify-between pt-2 border-t border-border font-extrabold text-sm text-foreground"><span>Total Payable:</span><span className="text-emerald-500">₹{totalDue.toFixed(2)}</span></div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-semibold">Payment Method</label>
                <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className="w-full bg-secondary/30 border border-border rounded-xl py-2.5 px-3 text-sm focus:outline-none">
                  <option value="ONLINE">Online Banking Portal</option>
                  <option value="CARD">Debit / Credit Card</option>
                  <option value="BANK_TRANSFER">Direct Bank Transfer</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-semibold">Transaction Reference Number</label>
                <input
                  type="text"
                  required
                  value={payTxnRef}
                  onChange={(e) => setPayTxnRef(e.target.value)}
                  className="w-full bg-secondary/30 border border-border rounded-xl py-2.5 px-3 text-sm focus:outline-none"
                  placeholder="e.g. TXN-9843-REF"
                />
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-2 -mx-6 -mb-6 p-4 bg-muted/10">
                <button type="button" onClick={() => setShowPayModal(false)} className="px-4 py-2 border border-border text-sm font-semibold rounded-xl text-muted-foreground">Cancel</button>
                <button type="submit" disabled={submittingPay} className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-550 shadow-md">
                  {submittingPay ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
