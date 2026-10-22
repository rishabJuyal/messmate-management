import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Users, CalendarCheck, IndianRupee, Search, Plus, Utensils, Check, X,
  CalendarDays, Trash2, RotateCcw, Menu, Pencil, CircleAlert, MessageSquare,
  Send, LayoutDashboard, Wallet, TrendingUp, ArrowRight, Download, FileText,
  Sparkles, Eye, CheckCircle2, ChevronLeft, ChevronRight
} from 'lucide-react';
import './styles.css';

const FEE = 2800;
const DAILY_RATE = Math.round((FEE / 30) * 100) / 100; // ₹93.33/day
const STORAGE_KEY = 'mess-manager-v7';

// Date & Formatting Helpers
const todayISO = () => new Date().toISOString().slice(0, 10);
const dateShift = (date, n) => {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const monthKey = d => String(d).slice(0, 7);
const monthLabel = m => new Date(`${m}-01T12:00:00`).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
const shortDate = d => d ? new Date(`${d}T12:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';
const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(Number(n || 0)));
const compactMoney = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 1 }).format(Number(n || 0));
const initials = name => name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
const phoneDigits = phone => String(phone || '').replace(/\D/g, '');
const intlPhone = phone => {
  const d = phoneDigits(phone);
  return d.length === 10 ? `91${d}` : d;
};
const nextMonthKey = m => {
  const [year, mon] = m.split('-').map(Number);
  const d = new Date(year, mon, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
const prevMonthKey = m => {
  const [year, mon] = m.split('-').map(Number);
  const d = new Date(year, mon - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

// CSV Export Utility
function exportToCSV(filename, headers, rows) {
  const escapeCell = val => `"${String(val ?? '').replace(/"/g, '""')}"`;
  const csvContent = '\uFEFF' + [
    headers.map(escapeCell).join(','),
    ...rows.map(row => row.map(escapeCell).join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function WhatsAppIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z"/>
    </svg>
  );
}

function MonthSwitcher({ month, setMonth }) {
  const isCurrentMonth = month === monthKey(todayISO());
  return (
    <div className="month-switcher">
      <button
        type="button"
        className="month-switcher-nav"
        title="Previous month"
        aria-label="Previous month"
        onClick={() => setMonth(prevMonthKey(month))}
      >
        <ChevronLeft size={16} />
      </button>
      <label className="month-switcher-label" title="Click to choose month">
        <CalendarDays size={15} />
        <span>{monthLabel(month)}</span>
        <input
          type="month"
          aria-label="Choose month"
          value={month}
          onChange={e => e.target.value && setMonth(e.target.value)}
        />
      </label>
      <button
        type="button"
        className="month-switcher-nav"
        title="Next month"
        aria-label="Next month"
        onClick={() => setMonth(nextMonthKey(month))}
      >
        <ChevronRight size={16} />
      </button>
      {!isCurrentMonth && (
        <button
          type="button"
          className="month-switcher-today"
          onClick={() => setMonth(monthKey(todayISO()))}
          title="Jump to current month"
        >
          Today
        </button>
      )}
    </div>
  );
}


// ============================================================
// DYNAMIC MONTHLY ABSENT DAYS & BONUS ENGINE (CALCULATED FROM ATTENDANCE)
// ============================================================
function getStudentMonthAbsents(attendanceList, studentId, month) {
  const absentRecords = (attendanceList || []).filter(
    a => a.studentId === studentId && a.status === 'Absent' && a.date.startsWith(month)
  );
  const absentDays = absentRecords.length;
  // Condition: strictly > 7 total absent days in the month
  const isEligible = absentDays > 7;
  // Rule: calculated from Day 1 at ₹93.33/day (₹2,800/30)
  const amount = isEligible ? Math.round(absentDays * (FEE / 30)) : 0;
  // Automatically credited to next month's Paid amount
  const targetMonth = nextMonthKey(month);
  return { studentId, month, absentDays, isEligible, amount, targetMonth };
}

// Dynamic Credit Resolver for a Student in a Target Month
function getStudentMonthCredit(db, studentId, targetMonth) {
  // Check for manual user override
  const override = (db.customCredits || []).find(c => c.studentId === studentId && c.targetMonth === targetMonth);
  if (override !== undefined) {
    return {
      amount: Number(override.amount || 0),
      isOverride: true,
      absentDays: override.absentDays || 0,
      note: override.note || 'Custom override'
    };
  }

  // Purely dynamic calculation from previous month's total absent days
  const prevMonth = prevMonthKey(targetMonth);
  const calc = getStudentMonthAbsents(db.attendance, studentId, prevMonth);

  return {
    amount: calc.amount,
    isOverride: false,
    absentDays: calc.absentDays,
    fromMonth: prevMonth,
    note: calc.isEligible ? (calc.absentDays + ' days absent in ' + monthLabel(prevMonth)) : ''
  };
}

// Initial Sample Data (With 30 days of dynamic attendance records)
const seed = () => {
  const today = todayISO();
  const currentMonth = monthKey(today);
  const prevMonth = prevMonthKey(currentMonth);

  const students = [
    { id: 's1', name: 'Aarav Sharma', phone: '98765 43210', joined: '2026-06-01', status: 'Active', room: 'Room 101' },
    { id: 's2', name: 'Priya Verma', phone: '98765 12340', joined: '2026-07-15', status: 'Active', room: 'Room 204' },
    { id: 's3', name: 'Rohan Gupta', phone: '98111 22334', joined: '2026-05-20', status: 'Active', room: 'Room 102' },
    { id: 's4', name: 'Ananya Singh', phone: '98990 11223', joined: '2026-08-02', status: 'Active', room: 'Room 305' },
    { id: 's5', name: 'Kabir Mehta', phone: '98000 56789', joined: '2026-09-01', status: 'Active', room: 'Room 108' },
    { id: 's6', name: 'Ishita Jain', phone: '97770 11122', joined: '2026-04-12', status: 'Inactive', room: 'Room 202' },
  ];

  const attendance = [];
  const activeIds = ['s1', 's2', 's3', 's4', 's5'];

  // Rohan Gupta (s3): 9 consecutive absent days in prevMonth (credited to currentMonth)
  const prevMonthEnd = prevMonth + '-28';
  const rohanAbsentDates = new Set(Array.from({ length: 9 }, (_, i) => dateShift(prevMonthEnd, -i)));

  // Kabir Mehta (s5): 3 consecutive absent days ending today
  const kabirAbsentDates = new Set([today, dateShift(today, -1), dateShift(today, -2)]);

  // Aarav Sharma (s1): 2 isolated absent days
  const aaravAbsentDates = new Set([dateShift(today, -8), dateShift(today, -16)]);

  // Generate full daily attendance records for past 30 days
  for (let i = 30; i >= 0; i--) {
    const curDate = dateShift(today, -i);
    activeIds.forEach(sid => {
      let status = 'Present';
      if (sid === 's3' && rohanAbsentDates.has(curDate)) status = 'Absent';
      else if (sid === 's5' && kabirAbsentDates.has(curDate)) status = 'Absent';
      else if (sid === 's1' && aaravAbsentDates.has(curDate)) status = 'Absent';

      attendance.push({
        id: 'seed-' + sid + '-' + curDate,
        studentId: sid,
        date: curDate,
        status
      });
    });
  }

  const payments = [
    { id: 'p1', studentId: 's1', amount: 2800, date: dateShift(today, -2), month: currentMonth, method: 'UPI', note: 'Monthly fee' },
    { id: 'p2', studentId: 's2', amount: 2800, date: dateShift(today, -1), month: currentMonth, method: 'Cash', note: 'Monthly fee' },
    { id: 'p3', studentId: 's5', amount: 1500, date: dateShift(today, -3), month: currentMonth, method: 'UPI', note: 'Partial fee' },
    { id: 'p4', studentId: 's3', amount: 2800, date: dateShift(today, -35), month: prevMonth, method: 'UPI', note: 'Previous month fee' },
  ];

  return { students, attendance, payments, customCredits: [] };
};

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return seed();
    const parsed = JSON.parse(saved);
    if (!parsed.customCredits) parsed.customCredits = [];
    return parsed;
  } catch {
    return seed();
  }
}

function App() {
  const [db, setDb] = useState(loadData);
  const [page, setPage] = useState('Dashboard');
  const [query, setQuery] = useState('');
  const [month, setMonth] = useState(monthKey(todayISO()));
  const [showStudentModal, setShowStudentModal] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(null);
  const [showEditCreditModal, setShowEditCreditModal] = useState(null);
  const [toast, setToast] = useState('');
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }, [db]);

  const notify = msg => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2500);
  };

  const update = fn => setDb(old => fn(structuredClone(old)));
  const getStudent = id => db.students.find(s => s.id === id) || { name: 'Unknown', phone: '', room: '' };
  const activeStudents = db.students.filter(s => s.status === 'Active');

  function markAttendance(studentId, date, status) {
    update(d => {
      const existing = d.attendance.find(a => a.studentId === studentId && a.date === date);
      d.attendance = d.attendance.filter(a => !(a.studentId === studentId && a.date === date));
      if (existing?.status !== status) {
        d.attendance.push({ id: crypto.randomUUID(), studentId, date, status });
      }
      return d;
    });
  }

  function markAllPresent(date) {
    update(d => {
      const activeIds = d.students.filter(s => s.status === 'Active').map(s => s.id);
      d.attendance = d.attendance.filter(a => !(a.date === date && activeIds.includes(a.studentId)));
      activeIds.forEach(id => {
        d.attendance.push({ id: crypto.randomUUID(), studentId: id, date, status: 'Present' });
      });
      return d;
    });
    notify(`All ${activeStudents.length} students marked Present.`);
  }

  function deleteStudent(student) {
    if (!confirm(`Delete ${student.name}?`)) return;
    update(d => {
      d.students = d.students.filter(s => s.id !== student.id);
      d.attendance = d.attendance.filter(a => a.studentId !== student.id);
      d.payments = d.payments.filter(p => p.studentId !== student.id);
      d.customCredits = (d.customCredits || []).filter(c => c.studentId !== student.id);
      return d;
    });
    notify('Student deleted.');
  }

  function resetDemo() {
    if (confirm('Reset to sample data?')) {
      setDb(seed());
      setMonth(monthKey(todayISO()));
      notify('Data reset.');
    }
  }

  function saveCreditOverride({ studentId, month: targetMonth, amount, note, absentDays }) {
    update(d => {
      if (!d.customCredits) d.customCredits = [];
      const index = d.customCredits.findIndex(c => c.studentId === studentId && c.targetMonth === targetMonth);
      const record = { studentId, targetMonth, amount: Number(amount), note, absentDays };
      if (index >= 0) d.customCredits[index] = record;
      else d.customCredits.push(record);
      return d;
    });
    setShowEditCreditModal(null);
    notify(`Credit for ${monthLabel(targetMonth)} updated to ₹${amount}.`);
  }

  function resetToDynamicCredit(studentId, targetMonth) {
    update(d => {
      d.customCredits = (d.customCredits || []).filter(c => !(c.studentId === studentId && c.targetMonth === targetMonth));
      return d;
    });
    setShowEditCreditModal(null);
    notify(`Reset to dynamic attendance calculation.`);
  }

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Attendance', icon: CalendarCheck },
    { label: 'Fee Payments', icon: IndianRupee },
    { label: 'Students', icon: Users },
    { label: 'Reports', icon: FileText }
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-icon"><Utensils size={21} /></div>
          <div><strong>Mess Manager</strong><span>MANAGEMENT</span></div>
          <button className="mobile-close" onClick={() => setMobileNav(false)}><X size={18} /></button>
        </div>

        <div className="nav-label">MENU</div>
        <nav>
          {navItems.map(item => (
            <button
              key={item.label}
              className={`nav-item ${page === item.label ? 'active' : ''}`}
              onClick={() => { setPage(item.label); setMobileNav(false); }}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={resetDemo}>
            <RotateCcw size={13} /> Reset sample data
          </button>
        </div>
      </aside>

      {mobileNav && <div className="scrim" onClick={() => setMobileNav(false)} />}

      <main className="main-content">
        <header className="topbar">
          <div className="top-left">
            <button
              type="button"
              className="mobile-menu"
              aria-label="Toggle menu"
              onClick={() => setMobileNav(true)}
            >
              <Menu size={20} />
            </button>
            <div className="breadcrumb">Mess Manager <span>/</span> <strong>{page}</strong></div>
          </div>
          <div className="top-actions">
            <button
              type="button"
              className="top-reset-btn"
              onClick={resetDemo}
              title="Reset sample data"
            >
              <RotateCcw size={13} />
              <span className="top-reset-text">Reset</span>
            </button>
            <div className="top-avatar" title="Mess Admin">MA</div>
          </div>
        </header>

        <div className="page-wrap">
          {page === 'Dashboard' && (
            <DashboardPage
              db={db}
              month={month}
              setMonth={setMonth}
              getStudent={getStudent}
              setPage={setPage}
              setShowPayment={setShowPaymentModal}
            />
          )}
          {page === 'Attendance' && (
            <AttendancePage
              students={activeStudents}
              db={db}
              markAttendance={markAttendance}
              markAllPresent={markAllPresent}
              setPage={setPage}
            />
          )}
          {page === 'Fee Payments' && (
            <PaymentsPage
              db={db}
              month={month}
              setMonth={setMonth}
              getStudent={getStudent}
              setShowPayment={setShowPaymentModal}
              onEditCredit={setShowEditCreditModal}
              notify={notify}
              update={update}
              setPage={setPage}
            />
          )}
          {page === 'Students' && (
            <StudentsPage
              students={db.students}
              query={query}
              setQuery={setQuery}
              setShowStudent={setShowStudentModal}
              setShowHistory={setShowHistoryModal}
              onDelete={deleteStudent}
            />
          )}
          {page === 'Reports' && (
            <ReportsPage
              db={db}
              month={month}
              setMonth={setMonth}
              getStudent={getStudent}
            />
          )}
        </div>

        <footer className="footer">
          <span>© 2026 Mess Manager</span>
          <span><span className="green-dot" /> Auto-saved</span>
        </footer>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="mobile-bottom-bar" aria-label="Mobile Navigation">
          {navItems.map(item => {
            const isActive = page === item.label;
            return (
              <button
                key={item.label}
                type="button"
                className={`mobile-bottom-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setPage(item.label);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <div className="mobile-bottom-icon">
                  <item.icon size={19} />
                </div>
                <span>{item.label === 'Fee Payments' ? 'Fees' : item.label}</span>
              </button>
            );
          })}
        </nav>
      </main>

      {/* Add / Edit Student Modal */}
      {showStudentModal && (
        <StudentModal
          student={showStudentModal === 'new' ? null : showStudentModal}
          onClose={() => setShowStudentModal(null)}
          onSave={form => {
            update(d => {
              if (showStudentModal === 'new') {
                d.students.unshift({ ...form, id: crypto.randomUUID() });
              } else {
                const s = d.students.find(x => x.id === showStudentModal.id);
                if (s) Object.assign(s, form);
              }
              return d;
            });
            setShowStudentModal(null);
            notify(showStudentModal === 'new' ? 'Student added.' : 'Student updated.');
          }}
        />
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          payment={showPaymentModal === 'new' ? null : showPaymentModal}
          students={db.students}
          month={month}
          db={db}
          onClose={() => setShowPaymentModal(null)}
          onSave={form => {
            update(d => {
              const record = { ...form, id: form.id || crypto.randomUUID() };
              const index = d.payments.findIndex(p => p.id === record.id);
              if (index >= 0) d.payments[index] = record;
              else d.payments.unshift(record);
              return d;
            });
            setShowPaymentModal(null);
            notify('Payment saved.');
          }}
        />
      )}

      {/* Edit Absent Credit Modal */}
      {showEditCreditModal && (
        <EditCreditModal
          data={showEditCreditModal}
          onClose={() => setShowEditCreditModal(null)}
          onSave={saveCreditOverride}
          onResetDynamic={resetToDynamicCredit}
        />
      )}

      {/* Student 360° History Modal */}
      {showHistoryModal && (
        <StudentHistoryModal
          student={showHistoryModal}
          db={db}
          onClose={() => setShowHistoryModal(null)}
          onRecordPayment={student => {
            setShowHistoryModal(null);
            setShowPaymentModal({ studentId: student.id, month });
          }}
        />
      )}

      {toast && (
        <div className="toast">
          <Check size={17} />{toast}
        </div>
      )}
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><CalendarDays size={20} /></div>
      <p>{text}</p>
    </div>
  );
}

// ==========================================
// 1. DASHBOARD PAGE
// ==========================================
function DashboardPage({ db, month, setMonth, getStudent, setPage, setShowPayment }) {
  const activeStudents = db.students.filter(s => s.status === 'Active');
  const monthPayments = db.payments.filter(p => p.month === month).sort((a, b) => b.date.localeCompare(a.date));

  // Dynamic calculations for each student in the selected month
  const studentLedger = activeStudents.map(s => {
    const dynamicCredit = getStudentMonthCredit(db, s.id, month);
    const cashPaid = monthPayments.filter(p => p.studentId === s.id).reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const totalPaid = cashPaid + dynamicCredit.amount;
    const pendingDue = Math.max(0, FEE - totalPaid);
    return {
      student: s,
      cashPaid,
      credit: dynamicCredit,
      totalPaid,
      pending: pendingDue,
      isFullyPaid: totalPaid >= FEE
    };
  });

  const totalCollected = studentLedger.reduce((sum, item) => sum + item.totalPaid, 0);
  const totalCredits = studentLedger.reduce((sum, item) => sum + item.credit.amount, 0);
  const totalPending = studentLedger.reduce((sum, item) => sum + item.pending, 0);
  const fullyPaidCount = studentLedger.filter(item => item.isFullyPaid).length;
  const pendingCount = studentLedger.filter(item => item.pending > 0).length;

  const today = todayISO();
  const presentToday = db.attendance.filter(a => a.date === today && a.status === 'Present').length;
  const absentToday = db.attendance.filter(a => a.date === today && a.status === 'Absent').length;
  const unmarkedToday = Math.max(0, activeStudents.length - (presentToday + absentToday));
  const attendanceRate = activeStudents.length ? Math.round((presentToday / activeStudents.length) * 100) : 0;

  // Students with dynamic absent credit in the selected month
  const creditedStudents = studentLedger.filter(item => item.credit.amount > 0);

  // 6-Month Chart
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(`${month}-01T12:00:00`);
    d.setMonth(d.getMonth() - (5 - i));
    return d.toISOString().slice(0, 7);
  });
  const totals = months.map(m => {
    const cash = db.payments.filter(p => p.month === m).reduce((a, p) => a + Number(p.amount), 0);
    const cred = activeStudents.reduce((sum, s) => sum + getStudentMonthCredit(db, s.id, m).amount, 0);
    return cash + cred;
  });
  const chartMax = Math.max(...totals, activeStudents.length * FEE, 1);
  const monthShort = m => new Date(`${m}-01T12:00:00`).toLocaleDateString('en-IN', { month: 'short' });

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">OVERVIEW</div>
          <h1>Dashboard</h1>
          <p>{monthLabel(month)} summary</p>
        </div>
        <div className="heading-actions">
          <MonthSwitcher month={month} setMonth={setMonth} />
          <button className="btn btn-secondary" onClick={() => setPage('Attendance')}>
            <CalendarCheck size={16} /> Attendance
          </button>
          <button className="btn btn-primary" onClick={() => setShowPayment('new')}>
            <Plus size={16} /> Record payment
          </button>
        </div>
      </div>

      {/* Dynamic Absent Credit Banner for Selected Month */}
      {creditedStudents.length > 0 && (
        <div className="bonus-banner">
          <div className="bonus-banner-icon"><Sparkles size={20} /></div>
          <div className="bonus-banner-content">
            <h3>{creditedStudents.length} Student(s) with Dynamic Absent Credit for {monthLabel(month)}</h3>
            <p>
              {creditedStudents.map(e => `${e.student.name} (${e.credit.absentDays}d absent in ${monthLabel(prevMonthKey(month))} → ${money(e.credit.amount)} credited to Paid)`).join(', ')}.
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage('Fee Payments')}>
            View in Fee Payments <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* Upcoming Earned Absent Credits Banner */}
      {(() => {
        const upcomingCredits = [];
        activeStudents.forEach(s => {
          const info = getStudentMonthAbsents(db.attendance, s.id, month);
          if (info.isEligible) {
            upcomingCredits.push({ student: s, absentDays: info.absentDays, amount: info.amount, targetMonth: info.targetMonth });
          }
        });
        if (!upcomingCredits.length) return null;
        return (
          <div className="upcoming-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <Sparkles size={16} color="#6b42b7" />
              <span style={{ fontSize: 11, color: '#4b376b' }}>
                <strong>Upcoming for {monthLabel(nextMonthKey(month))}:</strong>{' '}
                {upcomingCredits.map(u => `${u.student.name} (${u.absentDays}d absent in ${monthLabel(month)} → ${money(u.amount)} credit)`).join(', ')}.
              </span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => { setMonth(nextMonthKey(month)); setPage('Fee Payments'); }}>
              View in Fee Payments <ArrowRight size={13} />
            </button>
          </div>
        );
      })()}

      {/* 4 Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon blue"><Users size={18} /></div>
            <span className="stat-trend">{activeStudents.length} Active</span>
          </div>
          <div className="stat-label">Students</div>
          <div className="stat-value">{db.students.length}</div>
          <div className="stat-footer">{activeStudents.length} active · {db.students.length - activeStudents.length} inactive</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon green"><Wallet size={18} /></div>
            <span className="stat-trend">{fullyPaidCount} Paid</span>
          </div>
          <div className="stat-label">Total Paid</div>
          <div className="stat-value">{money(totalCollected)}</div>
          <div className="stat-footer">{totalCredits > 0 ? `Includes ${money(totalCredits)} dynamic absent credit` : `${monthPayments.length} cash/UPI payments`}</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon orange"><CircleAlert size={18} /></div>
            <span className="stat-trend">{pendingCount} Pending</span>
          </div>
          <div className="stat-label">Pending Dues</div>
          <div className="stat-value">{money(totalPending)}</div>
          <div className="stat-footer">{monthLabel(month)} · Fee ₹{FEE}/student</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon purple"><CalendarCheck size={18} /></div>
            <span className="stat-trend">{attendanceRate}% Rate</span>
          </div>
          <div className="stat-label">Today's Attendance</div>
          <div className="stat-value">{presentToday} Present</div>
          <div className="stat-footer">{absentToday} Absent · {unmarkedToday} Unmarked</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Collection Chart */}
        <div className="panel collection-panel">
          <div className="panel-heading">
            <div>
              <h2>Collection Trend</h2>
            </div>
            <button className="panel-link" style={{ width: 'auto', borderTop: 0, paddingTop: 0 }} onClick={() => setPage('Fee Payments')}>
              Fee Payments <ArrowRight size={13} />
            </button>
          </div>
          <div className="collection-total">
            <strong>{money(totalCollected)}</strong>
            <span className="positive"><TrendingUp size={12} /> {Math.round((totalCollected / (activeStudents.length * FEE || 1)) * 100)}%</span>
          </div>
          <div className="chart">
            <div className="chart-y">
              <span>{compactMoney(chartMax)}</span>
              <span>{compactMoney(chartMax / 2)}</span>
              <span>₹0</span>
            </div>
            <div className="chart-main">
              <div className="chart-lines"><i /><i /><i /></div>
              <div className="chart-bars">
                {months.map((m, i) => (
                  <div className="bar-group" key={m} title={`${monthLabel(m)}: ${money(totals[i])}`}>
                    <div
                      className={`bar ${m === month ? 'bar-highlight' : ''}`}
                      style={{ height: `${Math.max(4, (totals[i] / chartMax) * 100)}%` }}
                    />
                    <span>{monthShort(m)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pending Defaulters List */}
        <div className="panel alerts-panel">
          <div className="panel-heading">
            <div>
              <h2>Pending Fees</h2>
            </div>
            <span className="alert-count">{pendingCount} pending</span>
          </div>
          <div className="alert-list">
            {studentLedger.filter(x => x.pending > 0).slice(0, 5).map(item => (
              <div className="alert-row" key={item.student.id}>
                <div className="student-avatar small">{initials(item.student.name)}</div>
                <div className="alert-info">
                  <strong>{item.student.name}</strong>
                  <span>{item.student.room || item.student.phone} • Paid: <strong className="paid-amount">{money(item.totalPaid)}</strong></span>
                </div>
                <div className="alert-right">
                  <span className="status-pill status-warning">Due {money(item.pending)}</span>
                </div>
              </div>
            ))}
            {pendingCount === 0 && (
              <div className="alert-row">
                <div className="alert-info">
                  <strong>All Cleared</strong>
                  <span>All active students have paid for {monthLabel(month)}.</span>
                </div>
              </div>
            )}
          </div>
          <button className="panel-link" onClick={() => setPage('Fee Payments')}>
            View Ledger <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="panel activity-panel">
        <div className="panel-heading">
          <div>
            <h2>Recent Payments</h2>
          </div>
          <button className="panel-link" style={{ width: 'auto', borderTop: 0, paddingTop: 0 }} onClick={() => setPage('Fee Payments')}>
            View all <ArrowRight size={13} />
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>STUDENT</th>
                <th>DATE</th>
                <th>MODE</th>
                <th>NOTE</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {monthPayments.slice(0, 5).map(p => (
                <tr key={p.id}>
                  <td data-label="STUDENT">
                    <div className="person-cell">
                      <div className="student-avatar">{initials(getStudent(p.studentId).name)}</div>
                      <div>
                        <strong>{getStudent(p.studentId).name}</strong>
                        <span>{getStudent(p.studentId).room || getStudent(p.studentId).phone}</span>
                      </div>
                    </div>
                  </td>
                  <td data-label="DATE">{shortDate(p.date)}</td>
                  <td data-label="MODE"><span className="method-label">{p.method}</span></td>
                  <td data-label="NOTE">{p.note || 'Monthly fee'}</td>
                  <td className="amount-cell paid-green" data-label="AMOUNT">{money(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!monthPayments.length && <Empty text="No payments recorded this month." />}
        </div>
      </div>
    </>
  );
}

// ==========================================
// 2. ATTENDANCE PAGE
// ==========================================
function AttendancePage({ students, db, markAttendance, markAllPresent, setPage }) {
  const [date, setDate] = useState(todayISO());
  const [filter, setFilter] = useState('All');

  const getStatus = id => db.attendance.find(a => a.studentId === id && a.date === date)?.status || 'Unmarked';
  const filtered = students.filter(s => filter === 'All' || getStatus(s.id) === filter);

  const presentCount = students.filter(s => getStatus(s.id) === 'Present').length;
  const absentCount = students.filter(s => getStatus(s.id) === 'Absent').length;
  const unmarkedCount = students.filter(s => getStatus(s.id) === 'Unmarked').length;

  const targetMonth = monthKey(date);
  const getMonthAbsentCount = id => db.attendance.filter(a => a.studentId === id && a.status === 'Absent' && a.date.startsWith(targetMonth)).length;

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">OPERATIONS</div>
          <h1>Attendance</h1>
          <p>Mark daily attendance</p>
        </div>
        <div className="heading-actions">
          <div className="date-nav">
            <button
              type="button"
              className="date-nav-btn"
              title="Previous day"
              aria-label="Previous day"
              onClick={() => setDate(dateShift(date, -1))}
            >
              <ChevronLeft size={17} />
            </button>
            <div
              className="date-field"
              title="Click to change date"
              onClick={() => {
                const el = document.getElementById('attendance-date-input');
                if (el) {
                  try {
                    el.showPicker();
                  } catch (_) {
                    el.focus();
                  }
                }
              }}
            >
              <CalendarDays size={16} />
              <input
                id="attendance-date-input"
                type="date"
                aria-label="Attendance date"
                value={date}
                onChange={e => setDate(e.target.value)}
                onClick={e => {
                  try {
                    e.currentTarget.showPicker();
                  } catch (_) {}
                }}
              />
            </div>
            <button
              type="button"
              className="date-nav-btn"
              title="Next day"
              aria-label="Next day"
              onClick={() => setDate(dateShift(date, 1))}
            >
              <ChevronRight size={17} />
            </button>
          </div>
          <button className="btn btn-secondary" onClick={() => markAllPresent(date)}>
            <CheckCircle2 size={15} /> Mark All Present
          </button>
        </div>
      </div>

      <div className="mini-stats">
        <div className="mini-stat">
          <span className="mini-status-dot present" />
          <span>Present</span>
          <strong>{presentCount}</strong>
        </div>
        <div className="mini-stat">
          <span className="mini-status-dot absent" />
          <span>Absent</span>
          <strong>{absentCount}</strong>
        </div>
        <div className="mini-stat">
          <span className="mini-status-dot unmarked" />
          <span>Unmarked</span>
          <strong>{unmarkedCount}</strong>
        </div>
      </div>

      <div className="panel table-panel">
        <div className="table-toolbar">
          <div>
            <h2 className="toolbar-title">Register: {shortDate(date)}</h2>
          </div>
          <select className="select-control" value={filter} onChange={e => setFilter(e.target.value)}>
            <option>All</option>
            <option>Present</option>
            <option>Absent</option>
            <option>Unmarked</option>
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>STUDENT</th>
                <th>TODAY</th>
                <th>MONTH ABSENT</th>
                <th>MARK</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const status = getStatus(s.id);
                const absentInfo = getStudentMonthAbsents(db.attendance, s.id, targetMonth);

                return (
                  <tr key={s.id}>
                    <td data-label="STUDENT">
                      <div className="person-cell">
                        <div className="student-avatar">{initials(s.name)}</div>
                        <div>
                          <strong>{s.name}</strong>
                          <span>{s.room ? `${s.room} · ` : ''}{s.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td data-label="TODAY">
                      <span className={`status-pill ${status === 'Present' ? 'status-paid' : status === 'Absent' ? 'status-warning' : 'status-inactive'}`}>
                        {status}
                      </span>
                    </td>
                    <td data-label="MONTH ABSENT">
                      {absentInfo.absentDays > 0 ? (
                        <span className={`streak-pill ${absentInfo.isEligible ? 'streak-bonus' : 'streak-active'}`}>
                          {absentInfo.absentDays} day{absentInfo.absentDays > 1 ? 's' : ''}
                          {absentInfo.isEligible && ` · ₹${absentInfo.amount} credit in ${monthLabel(nextMonthKey(targetMonth))}`}
                        </span>
                      ) : (
                        <span className="streak-pill">0 days</span>
                      )}
                    </td>
                    <td data-label="MARK">
                      <div className="attendance-actions">
                        <button
                          title="Present"
                          className={`attendance-btn present ${status === 'Present' ? 'selected' : ''}`}
                          onClick={() => markAttendance(s.id, date, 'Present')}
                        >
                          <Check size={15} />
                          <span className="attendance-btn-label">Present</span>
                        </button>
                        <button
                          title="Absent"
                          className={`attendance-btn absent ${status === 'Absent' ? 'selected' : ''}`}
                          onClick={() => markAttendance(s.id, date, 'Absent')}
                        >
                          <X size={15} />
                          <span className="attendance-btn-label">Absent</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!filtered.length && <Empty text="No students found." />}
        </div>
      </div>
    </>
  );
}

// ==========================================
// 3. FEES MANAGEMENT (DYNAMIC CALCULATION)
// ==========================================
function PaymentsPage({ db, month, setMonth, getStudent, setShowPayment, onEditCredit, notify, update, setPage }) {
  const [activeTab, setActiveTab] = useState('summary');
  const activeStudents = db.students.filter(s => s.status === 'Active');
  const monthPayments = db.payments.filter(p => p.month === month).sort((a, b) => b.date.localeCompare(a.date));

  // Dynamic calculations for each student in the selected month
  const studentRows = activeStudents.map(s => {
    const dynamicCredit = getStudentMonthCredit(db, s.id, month);
    const cashPaid = monthPayments.filter(p => p.studentId === s.id).reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const totalPaid = cashPaid + dynamicCredit.amount;
    const pending = Math.max(0, FEE - totalPaid);

    let status = 'Unpaid';
    if (totalPaid >= FEE) status = 'Paid';
    else if (totalPaid > 0) status = 'Partial';

    return {
      student: s,
      fee: FEE,
      cashPaid,
      credit: dynamicCredit,
      totalPaid,
      pending,
      status
    };
  });

  const totalCollected = studentRows.reduce((a, b) => a + b.totalPaid, 0);
  const totalCredits = studentRows.reduce((a, b) => a + b.credit.amount, 0);
  const totalPending = studentRows.reduce((a, b) => a + b.pending, 0);

  // Students with dynamic credit for this month
  const creditedStudentsThisMonth = studentRows.filter(r => r.credit.amount > 0);

  // Students who earned > 7 total absent days IN THIS MONTH (credited to NEXT MONTH)
  const upcomingCredits = [];
  activeStudents.forEach(s => {
    const info = getStudentMonthAbsents(db.attendance, s.id, month);
    if (info.isEligible) {
      upcomingCredits.push({ student: s, absentDays: info.absentDays, amount: info.amount, targetMonth: info.targetMonth });
    }
  });

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">FINANCE</div>
          <h1>Fee Payments</h1>
          <p>{monthLabel(month)} fee status</p>
        </div>
        <div className="heading-actions">
          <MonthSwitcher month={month} setMonth={setMonth} />
          <button className="btn btn-primary" onClick={() => setShowPayment('new')}>
            <Plus size={16} /> Record payment
          </button>
        </div>
      </div>

      {/* Dynamic Absent Credit Banner (Strictly for this Month) */}
      {creditedStudentsThisMonth.length > 0 && (
        <div className="bonus-banner">
          <div className="bonus-banner-icon"><Sparkles size={20} /></div>
          <div className="bonus-banner-content">
            <h3>Dynamically Credited to {monthLabel(month)} Paid (&gt; 7 Days Absent)</h3>
            <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
              {creditedStudentsThisMonth.map((item, i) => (
                <div
                  key={`${item.student.id}-${i}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#fff',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #dcd1f6',
                    flexWrap: 'wrap',
                    gap: 8
                  }}
                >
                  <div>
                    <strong>{item.student.name}</strong>
                    <span style={{ fontSize: 11, color: '#68548c', marginLeft: 8 }}>
                      ({item.credit.absentDays} days absent{item.credit.isOverride ? ' · Custom' : ' · Dynamic'})
                    </span>
                    <span className="bonus-pill" style={{ marginLeft: 8 }}>
                      Credit: {money(item.credit.amount)}
                    </span>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onEditCredit({
                      studentId: item.student.id,
                      studentName: item.student.name,
                      month,
                      currentAmount: item.credit.amount,
                      absentDays: item.credit.absentDays,
                      isOverride: item.credit.isOverride,
                      note: item.credit.note
                    })}
                  >
                    <Pencil size={12} /> {item.credit.isOverride ? 'Edit Override' : 'Customize'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Earned Absent Credits Banner */}
      {upcomingCredits.length > 0 && (
        <div className="upcoming-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Sparkles size={16} color="#6b42b7" />
            <span style={{ fontSize: 11, color: '#4b376b' }}>
              <strong>Upcoming for {monthLabel(nextMonthKey(month))}:</strong>{' '}
              {upcomingCredits.map(u => `${u.student.name} (${u.absentDays}d absent in ${monthLabel(month)} → ${money(u.amount)} credit)`).join(', ')}.
            </span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setMonth(nextMonthKey(month))}>
            View {monthLabel(nextMonthKey(month))} Ledger <ArrowRight size={13} />
          </button>
        </div>
      )}

      <div className="mini-stats">
        <div className="mini-stat">
          <span className="mini-status-dot present" />
          <span>Expected</span>
          <strong>{money(activeStudents.length * FEE)}</strong>
        </div>
        <div className="mini-stat">
          <span className="mini-status-dot present" />
          <span>Paid</span>
          <strong className="paid-amount">{money(totalCollected)}</strong>
        </div>
        <div className="mini-stat">
          <span className="mini-status-dot absent" />
          <span>Pending</span>
          <strong>{money(totalPending)}</strong>
        </div>
        {totalCredits > 0 && (
          <div className="mini-stat">
            <Sparkles size={14} color="#6b42b7" />
            <span>Dynamic Credits</span>
            <strong>{money(totalCredits)}</strong>
          </div>
        )}
      </div>

      <div className="view-tabs">
        <button
          className={`view-tab ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          <Users size={16} /> Ledger ({activeStudents.length})
        </button>
        <button
          className={`view-tab ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          <IndianRupee size={16} /> Transactions ({monthPayments.length})
        </button>
      </div>

      {activeTab === 'summary' ? (
        <div className="panel table-panel">
          <div className="table-toolbar">
            <h2 className="toolbar-title">{monthLabel(month)}</h2>
            <span className="muted-text">{studentRows.filter(s => s.status === 'Paid').length} of {studentRows.length} paid</span>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>STUDENT</th>
                  <th>FEE</th>
                  <th>PAID AMOUNT</th>
                  <th>PENDING DUE</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {studentRows.map(row => (
                  <tr key={row.student.id}>
                    <td data-label="STUDENT">
                      <div className="person-cell">
                        <div className="student-avatar">{initials(row.student.name)}</div>
                        <div>
                          <strong>{row.student.name}</strong>
                          <span>{row.student.room || row.student.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td data-label="FEE">{money(row.fee)}</td>
                    <td className="amount-cell paid-green" data-label="PAID AMOUNT">
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span>{money(row.totalPaid)}</span>
                        {row.credit.amount > 0 && (
                          <span
                            className="bonus-pill"
                            title={`${money(row.credit.amount)} dynamically credited from >7 days absent`}
                            onClick={() => onEditCredit({
                              studentId: row.student.id,
                              studentName: row.student.name,
                              month,
                              currentAmount: row.credit.amount,
                              absentDays: row.credit.absentDays,
                              isOverride: row.credit.isOverride,
                              note: row.credit.note
                            })}
                            style={{ cursor: 'pointer' }}
                          >
                            incl. {money(row.credit.amount)} credit <Pencil size={10} />
                          </span>
                        )}
                        {row.credit.amount === 0 && (
                          <button
                            className="table-action"
                            style={{ padding: '2px 5px', fontSize: 9 }}
                            title="Add custom credit"
                            onClick={() => onEditCredit({
                              studentId: row.student.id,
                              studentName: row.student.name,
                              month,
                              currentAmount: 0,
                              absentDays: 0,
                              isOverride: false,
                              note: 'Manual credit'
                            })}
                          >
                            + credit
                          </button>
                        )}
                      </div>
                    </td>
                    <td data-label="PENDING DUE">
                      <strong style={{ color: row.pending > 0 ? '#c77b42' : '#16866d' }}>
                        {money(row.pending)}
                      </strong>
                    </td>
                    <td data-label="STATUS">
                      <span className={`status-pill ${row.status === 'Paid' ? 'status-paid' : row.status === 'Partial' ? 'status-warning' : 'status-inactive'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td data-label="ACTION">
                      {row.pending > 0 && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setShowPayment({ studentId: row.student.id, amount: row.pending, month })}
                        >
                          <Plus size={13} /> Pay Due
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="panel table-panel">
          <div className="table-toolbar">
            <h2 className="toolbar-title">Transactions: {monthLabel(month)}</h2>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>STUDENT</th>
                  <th>DATE</th>
                  <th>MODE</th>
                  <th>NOTE</th>
                  <th>AMOUNT</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {monthPayments.map(p => (
                  <tr key={p.id}>
                    <td data-label="STUDENT">
                      <div className="person-cell">
                        <div className="student-avatar">{initials(getStudent(p.studentId).name)}</div>
                        <div>
                          <strong>{getStudent(p.studentId).name}</strong>
                          <span>{getStudent(p.studentId).room || getStudent(p.studentId).phone}</span>
                        </div>
                      </div>
                    </td>
                    <td data-label="DATE">{shortDate(p.date)}</td>
                    <td data-label="MODE"><span className="method-label">{p.method}</span></td>
                    <td data-label="NOTE">{p.note || '—'}</td>
                    <td className="amount-cell paid-green" data-label="AMOUNT">{money(p.amount)}</td>
                    <td data-label="ACTIONS">
                      <div className="attendance-actions">
                        <button title="Edit" className="table-action" onClick={() => setShowPayment(p)}>
                          <Pencil size={15} />
                        </button>
                        <button
                          title="Delete"
                          className="table-action danger-text"
                          onClick={() => {
                            if (confirm('Delete payment?')) {
                              update(d => {
                                d.payments = d.payments.filter(x => x.id !== p.id);
                                return d;
                              });
                              notify('Payment deleted.');
                            }
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!monthPayments.length && <Empty text="No payments recorded." />}
          </div>
        </div>
      )}
    </>
  );
}

// ==========================================
// EDIT / OVERRIDE ABSENT CREDIT MODAL
// ==========================================
function EditCreditModal({ data, onClose, onSave, onResetDynamic }) {
  const [formMonth, setFormMonth] = useState(data.month);
  const [amount, setAmount] = useState(String(data.currentAmount ?? ''));
  const [note, setNote] = useState(data.note || 'Absent credit override');
  const [error, setError] = useState('');

  return (
    <Modal title="Absent Credit" subtitle={`${data.studentName} · For ${monthLabel(formMonth)}`} onClose={onClose}>
      <form onSubmit={e => {
        e.preventDefault();
        const val = Number(amount);
        if (isNaN(val) || val < 0) {
          setError('Enter a valid amount.');
          return;
        }
        if (val > FEE) {
          setError(`Cannot exceed monthly fee of ${money(FEE)}.`);
          return;
        }
        onSave({
          studentId: data.studentId,
          month: formMonth,
          amount: val,
          note,
          absentDays: data.absentDays
        });
      }}>
        <div className="form-row">
          <label>
            Credit Amount (₹) *
            <input
              type="number"
              min="0"
              max={FEE}
              autoFocus
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </label>
          <label>
            Apply To Month *
            <input
              type="month"
              value={formMonth}
              onChange={e => setFormMonth(e.target.value)}
            />
          </label>
        </div>

        <label>
          Note
          <input value={note} onChange={e => setNote(e.target.value)} />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          {data.isOverride && (
            <button
              type="button"
              className="btn btn-secondary danger-text"
              style={{ marginRight: 'auto' }}
              onClick={() => onResetDynamic(data.studentId, formMonth)}
            >
              Reset to Dynamic
            </button>
          )}
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" type="submit">
            <Check size={16} /> Save to {monthLabel(formMonth)} Paid
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ==========================================
// 4. STUDENTS MANAGEMENT
// ==========================================
function StudentsPage({ students, query, setQuery, setShowStudent, setShowHistory, onDelete }) {
  const [filter, setFilter] = useState('All');
  const [contact, setContact] = useState(null);

  const filtered = students.filter(s => {
    const matchQuery = `${s.name} ${s.phone} ${s.room || ''}`.toLowerCase().includes(query.toLowerCase());
    const matchFilter = filter === 'All' || s.status === filter;
    return matchQuery && matchFilter;
  });

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">ROSTER</div>
          <h1>Students</h1>
          <p>{students.length} students</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowStudent('new')}>
          <Plus size={16} /> Add student
        </button>
      </div>

      <div className="panel table-panel">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={17} />
            <input placeholder="Search name, phone, room..." value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <select className="select-control" value={filter} onChange={e => setFilter(e.target.value)}>
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>STUDENT</th>
                <th>ROOM</th>
                <th>PHONE</th>
                <th>JOINED</th>
                <th>FEE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td data-label="STUDENT">
                    <div className="person-cell">
                      <div className="student-avatar">{initials(s.name)}</div>
                      <div>
                        <strong>{s.name}</strong>
                      </div>
                    </div>
                  </td>
                  <td data-label="ROOM">{s.room || '—'}</td>
                  <td data-label="PHONE">{s.phone || '—'}</td>
                  <td data-label="JOINED">{shortDate(s.joined)}</td>
                  <td data-label="FEE">{money(FEE)}</td>
                  <td data-label="STATUS">
                    <span className={`status-pill ${s.status === 'Active' ? 'status-paid' : 'status-inactive'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td data-label="ACTIONS">
                    <div className="attendance-actions">
                      <button
                        title="History"
                        className="table-action"
                        style={{ color: '#16866d', background: '#eef8f3' }}
                        onClick={() => setShowHistory(s)}
                      >
                        <Eye size={15} /> History
                      </button>
                      <button title="WhatsApp" className="table-action wa" onClick={() => setContact({ student: s, channel: 'whatsapp' })}>
                        <WhatsAppIcon size={14} />
                      </button>
                      <button title="SMS" className="table-action msg" onClick={() => setContact({ student: s, channel: 'sms' })}>
                        <MessageSquare size={15} />
                      </button>
                      <button title="Edit" className="table-action" onClick={() => setShowStudent(s)}>
                        <Pencil size={15} />
                      </button>
                      <button title="Delete" className="table-action danger-text" onClick={() => onDelete(s)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <Empty text="No students match search." />}
        </div>
      </div>

      {contact && (
        <ContactModal
          student={contact.student}
          channel={contact.channel}
          onClose={() => setContact(null)}
        />
      )}
    </>
  );
}

// ==========================================
// 5. REPORTS & CSV EXPORT
// ==========================================
function ReportsPage({ db, month, setMonth, getStudent }) {
  const [reportType, setReportType] = useState('attendance');
  const activeStudents = db.students.filter(s => s.status === 'Active');

  const monthAttendance = db.attendance.filter(a => a.date.startsWith(month));
  const monthPayments = db.payments.filter(p => p.month === month).sort((a, b) => b.date.localeCompare(a.date));

  // Attendance Report
  const attendanceReportRows = activeStudents.map(s => {
    const studentRecords = monthAttendance.filter(a => a.studentId === s.id);
    const present = studentRecords.filter(a => a.status === 'Present').length;
    const absent = studentRecords.filter(a => a.status === 'Absent').length;
    const totalMarked = present + absent;
    const rate = totalMarked ? Math.round((present / totalMarked) * 100) : 0;
    return { student: s, present, absent, totalMarked, rate };
  });

  // Pending Report (Dynamic Calculation)
  const pendingReportRows = activeStudents.map(s => {
    const dynamicCredit = getStudentMonthCredit(db, s.id, month);
    const cashPaid = monthPayments.filter(p => p.studentId === s.id).reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const totalPaid = cashPaid + dynamicCredit.amount;
    const pending = Math.max(0, FEE - totalPaid);
    let status = 'Unpaid';
    if (totalPaid >= FEE) status = 'Paid';
    else if (totalPaid > 0) status = 'Partial';

    return { student: s, fee: FEE, totalPaid, absentCredit: dynamicCredit.amount, pending, status };
  });

  // Absent credits report derived from students with > 7 total absent days in previous month
  const prevMonth = prevMonthKey(month);
  const absentCreditRows = activeStudents
    .map(s => {
      const info = getStudentMonthAbsents(db.attendance, s.id, prevMonth);
      return { student: s, ...info };
    })
    .filter(r => r.isEligible);

  function handleExport() {
    if (reportType === 'attendance') {
      const headers = ['Student', 'Phone', 'Room', 'Month', 'Present', 'Absent', 'Total', 'Rate'];
      const rows = attendanceReportRows.map(r => [
        r.student.name, r.student.phone, r.student.room || '—', monthLabel(month), r.present, r.absent, r.totalMarked, `${r.rate}%`
      ]);
      exportToCSV(`Attendance_${month}`, headers, rows);
    } else if (reportType === 'fees') {
      const headers = ['Date', 'Student', 'Method', 'Amount', 'Note'];
      const rows = monthPayments.map(p => {
        const s = getStudent(p.studentId);
        return [p.date, s.name, p.method, p.amount, p.note || ''];
      });
      exportToCSV(`Collections_${month}`, headers, rows);
    } else if (reportType === 'pending') {
      const headers = ['Student', 'Phone', 'Fee', 'Paid', 'Dynamic Absent Credit', 'Pending Due', 'Status'];
      const rows = pendingReportRows.map(r => [
        r.student.name, r.student.phone, r.fee, r.totalPaid, r.absentCredit, r.pending, r.status
      ]);
      exportToCSV(`Pending_${month}`, headers, rows);
    } else if (reportType === 'bonus') {
      const headers = ['Student', 'Absent Month', 'Total Absent Days', 'Calculated Credit Amount', 'Credited Month'];
      const rows = absentCreditRows.map(b => [
        b.student.name, monthLabel(b.month), b.absentDays, b.amount, monthLabel(b.targetMonth)
      ]);
      exportToCSV(`Absent_Credits_${month}`, headers, rows);
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">EXPORT</div>
          <h1>Reports</h1>
          <p>{monthLabel(month)} data</p>
        </div>
        <div className="heading-actions">
          <MonthSwitcher month={month} setMonth={setMonth} />
          <button className="btn-export" onClick={handleExport}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="view-tabs">
        <button className={`view-tab ${reportType === 'attendance' ? 'active' : ''}`} onClick={() => setReportType('attendance')}>
          Attendance
        </button>
        <button className={`view-tab ${reportType === 'fees' ? 'active' : ''}`} onClick={() => setReportType('fees')}>
          Collections
        </button>
        <button className={`view-tab ${reportType === 'pending' ? 'active' : ''}`} onClick={() => setReportType('pending')}>
          Pending
        </button>
        <button className={`view-tab ${reportType === 'bonus' ? 'active' : ''}`} onClick={() => setReportType('bonus')}>
          Absent Credits
        </button>
      </div>

      {reportType === 'attendance' && (
        <div className="panel table-panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>STUDENT</th>
                  <th>ROOM</th>
                  <th>PRESENT</th>
                  <th>ABSENT</th>
                  <th>ATTENDANCE %</th>
                </tr>
              </thead>
              <tbody>
                {attendanceReportRows.map(r => (
                  <tr key={r.student.id}>
                    <td data-label="STUDENT"><strong>{r.student.name}</strong></td>
                    <td data-label="ROOM">{r.student.room || '—'}</td>
                    <td style={{ color: '#16866d', fontWeight: 700 }} data-label="PRESENT">{r.present} days</td>
                    <td style={{ color: '#c77b42', fontWeight: 700 }} data-label="ABSENT">{r.absent} days</td>
                    <td data-label="ATTENDANCE %"><span className="status-pill status-paid">{r.rate}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'fees' && (
        <div className="panel table-panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>STUDENT</th>
                  <th>MODE</th>
                  <th>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {monthPayments.map(p => (
                  <tr key={p.id}>
                    <td data-label="DATE">{shortDate(p.date)}</td>
                    <td data-label="STUDENT"><strong>{getStudent(p.studentId).name}</strong></td>
                    <td data-label="MODE"><span className="method-label">{p.method}</span></td>
                    <td className="amount-cell paid-green" data-label="AMOUNT">{money(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!monthPayments.length && <Empty text="No payments recorded." />}
          </div>
        </div>
      )}

      {reportType === 'pending' && (
        <div className="panel table-panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>STUDENT</th>
                  <th>FEE</th>
                  <th>PAID</th>
                  <th>PENDING</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {pendingReportRows.map(r => (
                  <tr key={r.student.id}>
                    <td data-label="STUDENT"><strong>{r.student.name}</strong></td>
                    <td data-label="FEE">{money(r.fee)}</td>
                    <td className="amount-cell paid-green" data-label="PAID">{money(r.totalPaid)}</td>
                    <td data-label="PENDING"><strong style={{ color: r.pending > 0 ? '#c77b42' : '#16866d' }}>{money(r.pending)}</strong></td>
                    <td data-label="STATUS"><span className={`status-pill ${r.status === 'Paid' ? 'status-paid' : 'status-warning'}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'bonus' && (
        <div className="panel table-panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>STUDENT</th>
                  <th>ABSENT MONTH</th>
                  <th>TOTAL ABSENT</th>
                  <th>CREDIT AMOUNT</th>
                  <th>CREDITED INTO</th>
                </tr>
              </thead>
              <tbody>
                {absentCreditRows.map((b, idx) => (
                  <tr key={`${b.studentId}-${idx}`}>
                    <td data-label="STUDENT"><strong>{b.student.name}</strong></td>
                    <td data-label="ABSENT MONTH">{monthLabel(b.month)}</td>
                    <td data-label="TOTAL ABSENT">{b.absentDays} days</td>
                    <td className="amount-cell paid-green" data-label="CREDIT AMOUNT">{money(b.amount)}</td>
                    <td data-label="CREDITED INTO">{monthLabel(b.targetMonth)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!absentCreditRows.length && <Empty text="No students with > 7 total absent days." />}
          </div>
        </div>
      )}
    </>
  );
}

// ==========================================
// STUDENT HISTORY MODAL (WITH DYNAMIC CALCULATION)
// ==========================================
function StudentHistoryModal({ student, db, onClose, onRecordPayment }) {
  const [tab, setTab] = useState('payments');
  const studentPayments = db.payments.filter(p => p.studentId === student.id).sort((a, b) => b.date.localeCompare(a.date));
  const lifetimePaid = studentPayments.reduce((a, b) => a + Number(b.amount), 0);

  const studentAttendance = db.attendance.filter(a => a.studentId === student.id).sort((a, b) => b.date.localeCompare(a.date));
  const totalPresent = studentAttendance.filter(a => a.status === 'Present').length;
  const totalAbsent = studentAttendance.filter(a => a.status === 'Absent').length;

  // All months with > 7 total absent days
  const allMonths = Array.from(new Set(studentAttendance.map(a => a.date.slice(0, 7)))).sort().reverse();
  const eligibleMonths = allMonths.map(m => getStudentMonthAbsents(db.attendance, student.id, m)).filter(x => x.isEligible);

  return (
    <Modal title={student.name} subtitle={`${student.room || 'No room'} · ${student.phone || 'No phone'}`} onClose={onClose}>
      <div className="profile-stats-grid">
        <div className="profile-stat-box">
          <span>Total Paid</span>
          <strong className="paid-amount">{money(lifetimePaid)}</strong>
        </div>
        <div className="profile-stat-box">
          <span>Attendance</span>
          <strong>{totalPresent}P / {totalAbsent}A</strong>
        </div>
        <div className="profile-stat-box">
          <span>Eligible Months (&gt;7d)</span><strong>{eligibleMonths.length}</strong>
        </div>
      </div>

      <div className="view-tabs" style={{ marginBottom: 12 }}>
        <button className={`view-tab ${tab === 'payments' ? 'active' : ''}`} onClick={() => setTab('payments')}>
          Payments ({studentPayments.length})
        </button>
        <button className={`view-tab ${tab === 'attendance' ? 'active' : ''}`} onClick={() => setTab('attendance')}>
          Attendance ({studentAttendance.length})
        </button>
        <button className={`view-tab ${tab === 'credits' ? 'active' : ''}`} onClick={() => setTab('credits')}>
          Absent Credits ({eligibleMonths.length})
        </button>
      </div>

      <div className="profile-tab-content">
        {tab === 'payments' && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>DATE</th><th>MONTH</th><th>MODE</th><th>AMOUNT</th></tr>
              </thead>
              <tbody>
                {studentPayments.map(p => (
                  <tr key={p.id}>
                    <td data-label="DATE">{shortDate(p.date)}</td>
                    <td data-label="MONTH">{monthLabel(p.month)}</td>
                    <td data-label="MODE"><span className="method-label">{p.method}</span></td>
                    <td className="amount-cell paid-green" data-label="AMOUNT">{money(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!studentPayments.length && <Empty text="No payments." />}
          </div>
        )}

        {tab === 'attendance' && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>DATE</th><th>STATUS</th></tr></thead>
              <tbody>
                {studentAttendance.slice(0, 25).map(a => (
                  <tr key={a.id}>
                    <td data-label="DATE">{shortDate(a.date)}</td>
                    <td data-label="STATUS"><span className={`status-pill ${a.status === 'Present' ? 'status-paid' : 'status-warning'}`}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'credits' && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>ABSENT MONTH</th><th>TOTAL ABSENT</th><th>CREDIT AMOUNT</th><th>CREDITED INTO</th></tr></thead>
              <tbody>
                {eligibleMonths.map((c, idx) => (
                  <tr key={idx}>
                    <td data-label="ABSENT MONTH">{monthLabel(c.month)}</td>
                    <td data-label="TOTAL ABSENT">{c.absentDays} days</td>
                    <td className="amount-cell paid-green" data-label="CREDIT AMOUNT">{money(c.amount)}</td>
                    <td data-label="CREDITED INTO">{monthLabel(c.targetMonth)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!eligibleMonths.length && <Empty text="No months with > 7 total absent days." />}
          </div>
        )}
      </div>
    </Modal>
  );
}

// ==========================================
// STUDENT MODAL
// ==========================================
function StudentModal({ student, onClose, onSave }) {
  const editing = Boolean(student);
  const [form, setForm] = useState({
    name: student?.name || '',
    phone: student?.phone || '',
    room: student?.room || '',
    joined: student?.joined || todayISO(),
    status: student?.status || 'Active'
  });
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal title={editing ? 'Edit Student' : 'Add Student'} onClose={onClose}>
      <form onSubmit={e => {
        e.preventDefault();
        if (!form.name.trim()) {
          setError('Name is required.');
          return;
        }
        onSave(form);
      }}>
        <label>
          Full Name *
          <input autoFocus value={form.name} onChange={e => set('name', e.target.value)} />
        </label>
        <label>
          Phone
          <input value={form.phone} onChange={e => set('phone', e.target.value)} />
        </label>
        <div className="form-row">
          <label>
            Joined
            <input type="date" value={form.joined} onChange={e => set('joined', e.target.value)} />
          </label>
          <label>
            Status
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </label>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" type="submit">
            {editing ? 'Save' : 'Add'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ==========================================
// PAYMENT MODAL
// ==========================================
function PaymentModal({ payment, students, month, db, onClose, onSave }) {
  const editing = Boolean(payment?.id);
  const defaultStudentId = payment?.studentId || students[0]?.id || '';

  const getPending = (sId, m) => {
    const dynamicCredit = getStudentMonthCredit(db, sId, m).amount;
    const cashPaid = (db?.payments || [])
      .filter(p => p.month === m && p.studentId === sId && p.id !== payment?.id)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    return Math.max(0, FEE - (cashPaid + dynamicCredit));
  };

  const initialAmount = payment?.amount !== undefined
    ? String(payment.amount)
    : String(getPending(defaultStudentId, payment?.month || month) || FEE);

  const [form, setForm] = useState({
    studentId: defaultStudentId,
    amount: initialAmount,
    date: payment?.date || todayISO(),
    month: payment?.month || month,
    method: payment?.method || 'UPI',
    note: payment?.note || 'Monthly fee'
  });
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal title={editing ? 'Edit Payment' : 'Record Payment'} onClose={onClose}>
      <form onSubmit={e => {
        e.preventDefault();
        if (!form.studentId) {
          setError('Select a student.');
          return;
        }
        if (!(Number(form.amount) > 0)) {
          setError('Enter a valid amount.');
          return;
        }
        onSave({ ...form, amount: Number(form.amount), id: payment?.id });
      }}>
        <label>
          Student *
          <select
            value={form.studentId}
            onChange={e => {
              const newId = e.target.value;
              set('studentId', newId);
              if (!editing) set('amount', String(getPending(newId, form.month) || FEE));
            }}
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} {s.room ? `(${s.room})` : ''} · Due: {money(getPending(s.id, form.month))}
              </option>
            ))}
          </select>
        </label>

        <div className="form-row">
          <label>
            Amount (₹) *
            <input type="number" min="1" step="1" value={form.amount} onChange={e => set('amount', e.target.value)} />
          </label>
          <label>
            Date
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </label>
        </div>

        <div className="form-row">
          <label>
            Month
            <input
              type="month"
              value={form.month}
              onChange={e => {
                const newMonth = e.target.value;
                set('month', newMonth);
                if (!editing) set('amount', String(getPending(form.studentId, newMonth) || FEE));
              }}
            />
          </label>
          <label>
            Method
            <select value={form.method} onChange={e => set('method', e.target.value)}>
              <option>UPI</option>
              <option>Cash</option>
              <option>Bank Transfer</option>
              <option>Card</option>
            </select>
          </label>
        </div>

        <label>
          Note
          <input value={form.note} onChange={e => set('note', e.target.value)} />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" type="submit">Save</button>
        </div>
      </form>
    </Modal>
  );
}

// ==========================================
// CONTACT MODAL
// ==========================================
function ContactModal({ student, channel, onClose }) {
  const defaultMsg = `Hello ${student.name}, monthly mess fee of ₹${FEE} is pending. Kindly pay at your earliest convenience. Thank you!`;
  const [message, setMessage] = useState(defaultMsg);
  const [error, setError] = useState('');
  const isWhatsApp = channel === 'whatsapp';
  const phone = phoneDigits(student.phone);

  function send() {
    if (!message.trim()) { setError('Message empty.'); return; }
    if (!phone) { setError('No phone number.'); return; }
    const text = encodeURIComponent(message.trim());
    if (isWhatsApp) window.open(`https://wa.me/${intlPhone(student.phone)}?text=${text}`, '_blank', 'noopener');
    else window.location.href = `sms:${intlPhone(student.phone)}?body=${text}`;
    onClose();
  }

  return (
    <Modal title={isWhatsApp ? 'WhatsApp' : 'SMS'} subtitle={student.name} onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); send(); }}>
        <label>
          Message
          <textarea rows={4} autoFocus value={message} onChange={e => setMessage(e.target.value)} />
        </label>
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setMessage(defaultMsg)}>Reset</button>
          <button className="btn btn-secondary" type="button" onClick={onClose}>Cancel</button>
          <button className={`btn ${isWhatsApp ? 'btn-whatsapp' : 'btn-primary'}`} type="submit">
            {isWhatsApp ? <WhatsAppIcon size={15} /> : <Send size={15} />} Send
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ==========================================
// GENERIC MODAL
// ==========================================
function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
