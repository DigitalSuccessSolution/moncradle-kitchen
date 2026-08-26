"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import axios from "axios";
import { Clock, Calendar, CheckCircle, LogOut, CheckCircle2, User, Phone, Briefcase } from "lucide-react";
import { format } from "date-fns";

export default function AttendancePage() {
  const [userRole, setUserRole] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // For Staff
  const [myAttendance, setMyAttendance] = useState<any[]>([]);
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [todayRecord, setTodayRecord] = useState<any>(null);

  // For Admin
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [teamAttendance, setTeamAttendance] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem("moncradel_kitchen_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserRole(user.role || "");
    }
  }, []);

  useEffect(() => {
    if (userRole === "kitchen_staff") {
      fetchMyAttendance();
    } else if (userRole === "kitchen" || userRole === "admin") {
      fetchTeamAttendance(selectedDate);
    }
  }, [userRole, selectedDate]);

  // --- STAFF FUNCTIONS ---
  const fetchMyAttendance = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("moncradel_kitchen_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await axios.get(`${apiUrl}/attendance/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMyAttendance(res.data.data);
        
        // Check if punched in today
        const todayStr = new Date().toISOString().split('T')[0];
        const todayRec = res.data.data.find((a: any) => a.date === todayStr);
        if (todayRec) {
          setTodayRecord(todayRec);
          setIsPunchedIn(!todayRec.punchOutTime);
        }
      }
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    }
    setIsLoading(false);
  };

  const handlePunchIn = async () => {
    try {
      const token = localStorage.getItem("moncradel_kitchen_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await axios.post(`${apiUrl}/attendance/punch-in`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        fetchMyAttendance();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Error punching in");
    }
  };

  const handlePunchOut = async () => {
    try {
      const token = localStorage.getItem("moncradel_kitchen_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await axios.post(`${apiUrl}/attendance/punch-out`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        fetchMyAttendance();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Error punching out");
    }
  };

  // --- ADMIN FUNCTIONS ---
  const fetchTeamAttendance = async (date: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("moncradel_kitchen_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await axios.get(`${apiUrl}/attendance?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setTeamAttendance(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch team attendance:", error);
    }
    setIsLoading(false);
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return "-";
    return format(new Date(isoString), "hh:mm a");
  };

  if (!mounted) return null;

  return (
    <ProtectedRoute allowedRoles={['kitchen', 'admin', 'superadmin', 'kitchen_staff']}>
      <div className="space-y-6 animate-fade-in-up pb-16 w-full font-sans">
        
        {/* STAFF VIEW */}
        {userRole === "kitchen_staff" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-medium text-black tracking-tight mb-1">My Attendance</h1>
              <p className="text-[15px] text-black/80 font-medium hidden md:block">Track your daily punches and hours worked.</p>
            </div>
            
            {/* Punch Card */}
            <div className="bg-white rounded-lg shadow-none border border-slate-200 p-6 md:p-10 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-10 h-10 text-brand" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                {format(new Date(), "EEEE, MMMM do, yyyy")}
              </h2>
              
              {!todayRecord ? (
                <>
                  <p className="text-slate-500 mb-8 max-w-sm">
                    You haven't punched in yet. Click the button below to start your shift and record your attendance.
                  </p>
                  <button 
                    onClick={handlePunchIn}
                    className="bg-brand text-white text-lg font-bold py-4 px-12 rounded-full shadow-lg shadow-brand/30 hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    PUNCH IN
                  </button>
                </>
              ) : (
                <>
                  {isPunchedIn ? (
                    <>
                      <p className="text-green-600 font-medium flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5" /> You are currently On-Duty
                      </p>
                      <p className="text-slate-500 mb-8">
                        Punched in at: {formatTime(todayRecord.punchInTime)}
                      </p>
                      <button 
                        onClick={handlePunchOut}
                        className="bg-red-500 text-white text-lg font-bold py-4 px-12 rounded-full shadow-lg shadow-red-500/30 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
                      >
                        <LogOut className="w-5 h-5" /> PUNCH OUT
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="bg-slate-50 p-6 rounded-xl w-full max-w-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4">Shift Completed</h3>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-500">Punch In:</span>
                          <span className="font-medium text-slate-800">{formatTime(todayRecord.punchInTime)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-slate-500">Punch Out:</span>
                          <span className="font-medium text-slate-800">{formatTime(todayRecord.punchOutTime)}</span>
                        </div>
                        <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                          <span className="font-bold text-slate-800">Total Hours:</span>
                          <span className="font-bold text-brand">{todayRecord.totalHoursWorked} hrs</span>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* History Table */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-black">Recent Attendance History</h3>
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden md:block bg-white rounded-lg border border-slate-200/80 overflow-hidden shadow-none">
                <div className="grid grid-cols-5 gap-4 p-4 border-b border-slate-200 bg-slate-50 text-[13px] font-medium text-black uppercase tracking-wider items-center">
                  <div className="col-span-1 pl-2">Date</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">Punch In</div>
                  <div className="col-span-1">Punch Out</div>
                  <div className="col-span-1 text-right pr-2">Total Hours</div>
                </div>
                <div className="divide-y divide-slate-100">
                  {myAttendance.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                      <p className="text-[14px] text-black/60">No attendance records found.</p>
                    </div>
                  ) : (
                    myAttendance.map((record: any) => (
                      <div key={record._id} className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-slate-50/60 transition-colors group">
                        <div className="col-span-1 pl-2">
                          <span className="text-[15px] font-medium text-black">{record.date}</span>
                        </div>
                        <div className="col-span-1">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[13px] font-medium capitalize ${
                            record.status === 'Present' ? 'bg-emerald-100 text-emerald-700' :
                            record.status === 'Absent' ? 'bg-rose-100 text-rose-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {record.status}
                          </span>
                        </div>
                        <div className="col-span-1 text-[14px] text-black/70 font-medium">
                          {formatTime(record.punchInTime)}
                        </div>
                        <div className="col-span-1 text-[14px] text-black/70 font-medium">
                          {formatTime(record.punchOutTime)}
                        </div>
                        <div className="col-span-1 text-right pr-2 font-medium text-black/80">
                          {record.totalHoursWorked || 0} hrs
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* MOBILE CARDS */}
              <div className="md:hidden flex flex-col gap-4">
                {myAttendance.length === 0 ? (
                  <div className="p-8 flex flex-col items-center justify-center text-center bg-white rounded-lg border border-slate-200/80">
                    <p className="text-[14px] text-black/60">No attendance records found.</p>
                  </div>
                ) : (
                  myAttendance.map((record: any) => (
                    <div key={`mob-${record._id}`} className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col">
                      <div className="px-4 py-3 flex items-center justify-between bg-slate-50/50">
                        <span className="text-[15px] font-medium text-black">{record.date}</span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium capitalize ${
                          record.status === 'Present' ? 'bg-emerald-100 text-emerald-700' :
                          record.status === 'Absent' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                      <div className="p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-center text-[14px]">
                          <span className="text-black/60 font-medium">Punch In</span>
                          <span className="text-black font-medium">{formatTime(record.punchInTime)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[14px]">
                          <span className="text-black/60 font-medium">Punch Out</span>
                          <span className="text-black font-medium">{formatTime(record.punchOutTime)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[14px] pt-2 border-t border-slate-100">
                          <span className="text-black/80 font-medium">Total Hours</span>
                          <span className="text-brand font-bold">{record.totalHoursWorked || 0} hrs</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ADMIN VIEW */}
        {(userRole === "kitchen" || userRole === "admin") && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-medium text-black tracking-tight mb-1">Team Attendance</h1>
                <p className="text-[15px] text-black/80 font-medium hidden md:block">Manage and view daily staff attendance</p>
              </div>
              
              <div className="flex items-center bg-white rounded-lg border border-slate-200 p-1 shadow-none w-full sm:w-auto">
                <div className="pl-3 pr-2 text-black/40">
                  <Calendar className="w-5 h-5" />
                </div>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent border-none text-black/80 text-[14px] font-medium focus:ring-0 cursor-pointer w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-none flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 sm:bg-transparent flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 sm:w-8 sm:h-8 text-blue-500" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col">
                  <p className="text-[11px] sm:text-[13px] text-black/70 sm:text-black font-medium sm:font-medium uppercase tracking-wider mb-1">Total Staff Present</p>
                  <h3 className="text-2xl font-medium text-black leading-none">{teamAttendance.length < 10 ? `0${teamAttendance.length}` : teamAttendance.length}</h3>
                </div>
              </div>
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block bg-white rounded-lg border border-slate-200/80 overflow-hidden shadow-none">
              <div className="grid grid-cols-6 gap-4 p-4 border-b border-slate-200 bg-slate-50 text-[13px] font-medium text-black uppercase tracking-wider items-center">
                <div className="col-span-2 pl-2">Staff Member</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1">Punch In</div>
                <div className="col-span-1">Punch Out</div>
                <div className="col-span-1 text-right pr-2">Hours</div>
              </div>
              <div className="divide-y divide-slate-100">
                {isLoading ? (
                  <div className="p-12 text-center text-black/60">Loading attendance data...</div>
                ) : teamAttendance.length === 0 ? (
                  <div className="p-12 text-center text-black/60">No staff attendance recorded for this date.</div>
                ) : (
                  teamAttendance.map((record: any) => (
                    <div key={record._id} className="grid grid-cols-6 gap-4 p-4 items-center hover:bg-slate-50/60 transition-colors group">
                      
                      <div className="col-span-2 pl-2 flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-black/60 font-medium shrink-0">
                          {record.userId?.name?.charAt(0) || 'S'}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-black text-[15px] truncate block">{record.userId?.name || 'Unknown'}</span>
                          <span className="text-[12px] text-black/60 truncate block">{record.staffId?.designation || 'Staff'} • {record.staffId?.shift}</span>
                        </div>
                      </div>

                      <div className="col-span-1">
                        <span className={`inline-block text-[13px] px-2.5 py-1 rounded-full font-medium capitalize ${
                          record.status === 'Present' ? 'bg-emerald-100 text-emerald-700' :
                          record.status === 'Absent' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {record.status}
                        </span>
                        {!record.punchOutTime && record.punchInTime && (
                          <span className="block text-[11px] text-brand mt-1 font-medium tracking-tight">On-Duty Live</span>
                        )}
                      </div>

                      <div className="col-span-1 text-[14px] font-medium text-black/70">
                        {formatTime(record.punchInTime)}
                      </div>
                      
                      <div className="col-span-1 text-[14px] font-medium text-black/70">
                        {formatTime(record.punchOutTime)}
                      </div>
                      
                      <div className="col-span-1 text-right pr-2 text-[15px] font-medium text-brand">
                        {record.totalHoursWorked || '-'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* MOBILE CARDS */}
            <div className="md:hidden flex flex-col gap-4">
              {isLoading ? (
                <div className="p-8 text-center bg-white rounded-lg border border-slate-200">Loading...</div>
              ) : teamAttendance.length === 0 ? (
                <div className="p-8 flex flex-col items-center justify-center text-center bg-white rounded-lg border border-slate-200">
                  <p className="text-[14px] text-black/60">No staff attendance recorded.</p>
                </div>
              ) : (
                teamAttendance.map((record: any) => (
                  <div key={`mob-team-${record._id}`} className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col">
                    <div className="px-4 py-3 flex items-center justify-between bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-black/70 font-medium shrink-0 text-sm">
                          {record.userId?.name?.charAt(0) || 'S'}
                        </div>
                        <span className="text-[15px] font-medium text-black">{record.userId?.name || 'Unknown'}</span>
                      </div>
                      <span className={`inline-block text-[12px] px-2.5 py-1 rounded-full font-medium capitalize ${
                        record.status === 'Present' ? 'bg-emerald-100 text-emerald-700' :
                        record.status === 'Absent' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                    <div className="p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-center text-[13px] text-black/60 font-medium">
                        <span>{record.staffId?.designation || 'Staff'}</span>
                        <span>{record.staffId?.shift}</span>
                      </div>
                      <div className="flex justify-between items-center text-[14px]">
                        <span className="text-black/60 font-medium">Punch In</span>
                        <span className="text-black font-medium">{formatTime(record.punchInTime)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[14px]">
                        <span className="text-black/60 font-medium">Punch Out</span>
                        <span className="text-black font-medium">{formatTime(record.punchOutTime)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[14px] pt-2 border-t border-slate-100">
                        <span className="text-black/80 font-medium">Total Hours</span>
                        <span className="text-brand font-bold">{record.totalHoursWorked || '-'}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
