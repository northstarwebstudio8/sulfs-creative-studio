import React, { useState, useEffect } from "react";
import { 
  Lock, ShieldCheck, Mail, Globe, MapPin, Layers, Calendar, 
  DollarSign, AlertCircle, RefreshCw, Tag, Search, Filter, 
  Download, Edit3, Trash2, Plus, FileText, CheckSquare, Square, 
  UserCheck, Copy, ExternalLink, CheckCircle, HelpCircle, Phone
} from "lucide-react";
import { Enquiry } from "../types";

interface LeadDashboardProps {
  onAuthenticated: (token: string) => void;
  authToken: string | null;
}

const ALL_STATUSES = ['New', 'Contacted', 'Quoted', 'In Progress', 'Delivered', 'Closed', 'Rejected'] as const;
type StatusType = typeof ALL_STATUSES[number];

export default function LeadDashboard({ onAuthenticated, authToken }: LeadDashboardProps) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  
  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [nicheFilter, setNicheFilter] = useState<string>("All");

  // Selected enquiry details/editor state
  const [activeEnquiryId, setActiveEnquiryId] = useState<string | null>(null);
  const [notesState, setNotesState] = useState<Record<string, string>>({});
  const [savingNotes, setSavingNotes] = useState<string | null>(null);

  // Quote Creator State
  const [creatingQuoteId, setCreatingQuoteId] = useState<string | null>(null);
  const [quoteAmount, setQuoteAmount] = useState("299");
  const [quoteTaxTreatment, setQuoteTaxTreatment] = useState("No VAT (Small Business Exemption)");
  const [quoteDeposit, setQuoteDeposit] = useState("50");
  const [quoteDueDate, setQuoteDueDate] = useState("");
  const [quoteScope, setQuoteScope] = useState("Professional bespoke 30-second vertical social advertisement containing high-resolution transitions, fully licensed royalty-free background audio track, tailored hooks, and premium AI voiceover narration.");

  // Feedback notifications
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchEnquiries = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/enquiries", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (response.ok) {
        setEnquiries(data.enquiries || []);
        // Initialize notes state
        const notesObj: Record<string, string> = {};
        (data.enquiries || []).forEach((e: Enquiry) => {
          if (e.id) notesObj[e.id] = e.internalNotes || "";
        });
        setNotesState(notesObj);
      } else {
        setError(data.error || "Failed to load enquiries database.");
      }
    } catch (err) {
      setError("Unable to connect to the backend secure database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchEnquiries(authToken);
    }
  }, [authToken]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        onAuthenticated(data.token);
        fetchEnquiries(data.token);
      } else {
        setError(data.error || "Authentication failed. Incorrect passcode.");
      }
    } catch (err) {
      setError("Server connection failure. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Status modifier
  const handleUpdateStatus = async (enquiryId: string, status: StatusType) => {
    if (!authToken) return;
    try {
      const response = await fetch("/api/admin/enquiry/update", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ enquiryId, status }),
      });
      if (response.ok) {
        setEnquiries(prev => prev.map(e => e.id === enquiryId ? { ...e, status } : e));
      } else {
        const d = await response.json();
        alert(d.error || "Failed to update status.");
      }
    } catch (err) {
      alert("Error reaching the operator API.");
    }
  };

  // Notes saver
  const handleSaveNotes = async (enquiryId: string) => {
    if (!authToken) return;
    setSavingNotes(enquiryId);
    const notes = notesState[enquiryId] || "";
    try {
      const response = await fetch("/api/admin/enquiry/update", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ enquiryId, internalNotes: notes }),
      });
      if (response.ok) {
        setEnquiries(prev => prev.map(e => e.id === enquiryId ? { ...e, internalNotes: notes } : e));
      } else {
        const d = await response.json();
        alert(d.error || "Failed to save internal notes.");
      }
    } catch (err) {
      alert("Error reaching the notes API.");
    } finally {
      setSavingNotes(null);
    }
  };

  // Deletion retention controls
  const handleDeleteEnquiry = async (enquiryId: string) => {
    if (!authToken) return;
    const confirmDelete = window.confirm("⚠️ GDPR RETENTION CONTROL:\n\nAre you absolutely sure you want to permanently delete and purge this enquiry from persistent studio records? This action is irreversible.");
    if (!confirmDelete) return;

    try {
      const response = await fetch("/api/admin/enquiry/delete", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ enquiryId }),
      });
      if (response.ok) {
        setEnquiries(prev => prev.filter(e => e.id !== enquiryId));
        if (activeEnquiryId === enquiryId) setActiveEnquiryId(null);
      } else {
        const d = await response.json();
        alert(d.error || "Failed to delete lead records.");
      }
    } catch (err) {
      alert("Error reaching the deletion API.");
    }
  };

  // Quotation Submission
  const handleCreateQuote = async (e: React.FormEvent, enquiryId: string) => {
    e.preventDefault();
    if (!authToken) return;

    try {
      const response = await fetch("/api/admin/enquiry/quote", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          enquiryId,
          amount: parseFloat(quoteAmount),
          taxTreatment: quoteTaxTreatment,
          depositRequired: parseFloat(quoteDeposit),
          dueDate: quoteDueDate,
          scope: quoteScope,
          status: "Sent"
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setEnquiries(prev => prev.map(enq => enq.id === enquiryId ? { ...enq, quotes: data.quotes, status: "Quoted" } : enq));
        setCreatingQuoteId(null);
        alert("Success! Quote reference generated and applied to this client record. The lead status has transitioned to 'Quoted'.");
      } else {
        const d = await response.json();
        alert(d.error || "Failed to generate quote.");
      }
    } catch (err) {
      alert("Error reaching the quotation API.");
    }
  };

  // Update Quote Status (Draft, Sent, Approved, Paid, Cancelled)
  const handleUpdateQuoteStatus = async (enquiryId: string, quoteRef: string, newStatus: any) => {
    if (!authToken) return;
    const enq = enquiries.find(e => e.id === enquiryId);
    if (!enq || !enq.quotes) return;

    const targetQuote = enq.quotes.find(q => q.quoteRef === quoteRef);
    if (!targetQuote) return;

    try {
      const response = await fetch("/api/admin/enquiry/quote", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          enquiryId,
          quoteRef,
          amount: targetQuote.amount,
          taxTreatment: targetQuote.taxTreatment,
          depositRequired: targetQuote.depositRequired,
          dueDate: targetQuote.dueDate,
          scope: targetQuote.scope,
          status: newStatus
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setEnquiries(prev => prev.map(enq => enq.id === enquiryId ? { ...enq, quotes: data.quotes } : enq));
      } else {
        const d = await response.json();
        alert(d.error || "Failed to update quote status.");
      }
    } catch (err) {
      alert("Error reaching the quote updates API.");
    }
  };

  // Operator Checklist Item Toggle
  const handleToggleChecklist = async (enquiryId: string, field: string, currentValue: boolean) => {
    if (!authToken) return;
    const checklistUpdate = { [field]: !currentValue };
    
    try {
      const response = await fetch("/api/admin/enquiry/update", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          enquiryId, 
          checklist: {
            ...checklistUpdate,
            [`${field}By`]: "Studio Operator",
            [`${field}At`]: new Date().toISOString()
          } 
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setEnquiries(prev => prev.map(e => e.id === enquiryId ? { ...e, checklist: data.enquiry.checklist } : e));
      } else {
        const d = await response.json();
        alert(d.error || "Failed to update operator verification checklist.");
      }
    } catch (err) {
      alert("Error communicating verification checklist update.");
    }
  };

  // Safe RFC 4180 CSV Exporter with injection formula prevention
  const handleCSVExport = () => {
    if (enquiries.length === 0) return;

    // Helper to sanitize fields to prevent CSV formula injection (CVE-2014-1466, Excel injections)
    // If field starts with =, +, -, or @, prefix with a single quote to neutralize
    const escapeCSVField = (val: any): string => {
      if (val === null || val === undefined) return "";
      let str = String(val).trim();
      // Replace double quotes with duplicate double quotes to escape inside CSV
      str = str.replace(/"/g, '""');
      
      // Inject safety prefix if starting with formula triggers
      if (/^[=\+\-\@\r]/.test(str)) {
        str = `'${str}`;
      }
      return `"${str}"`;
    };

    const headers = [
      "Enquiry ID", "Created At", "Status", "Full Name", "Business Name", 
      "Email Address", "Phone", "UK Location", "Website", "Industry", 
      "Service Requested", "Budget Tier", "Video Objective", "Preferred Format", 
      "Desired Timeline", "Brief Description", "Consent Captured IP", "Consent Time", "Internal Notes"
    ];

    const csvRows = [headers.join(",")];

    enquiries.forEach(e => {
      const row = [
        escapeCSVField(e.id),
        escapeCSVField(e.createdAt),
        escapeCSVField(e.status || "New"),
        escapeCSVField(e.fullName),
        escapeCSVField(e.businessName),
        escapeCSVField(e.email),
        escapeCSVField(e.phone || "Not provided"),
        escapeCSVField(e.location),
        escapeCSVField(e.websiteUrl || "Not provided"),
        escapeCSVField(e.niche),
        escapeCSVField(e.serviceRequired),
        escapeCSVField(e.budgetRange),
        escapeCSVField(e.videoObjective || "N/A"),
        escapeCSVField(e.preferredFormat || "N/A"),
        escapeCSVField(e.desiredTimeline || "N/A"),
        escapeCSVField(e.projectDescription),
        escapeCSVField(e.consentRecord?.ip || "N/A"),
        escapeCSVField(e.consentRecord?.timestamp || "N/A"),
        escapeCSVField(e.internalNotes || "")
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sulfs_studio_enquiries_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to copy Client Portal link
  const copyClientPortalLink = (enqId: string) => {
    const origin = window.location.origin;
    const url = `${origin}?page=client-portal&id=${enqId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(enqId);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  // Filter logic
  const filteredEnquiries = enquiries.filter(enq => {
    const matchesSearch = 
      enq.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enq.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enq.projectDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enq.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || (enq.status || "New") === statusFilter;
    const matchesNiche = nicheFilter === "All" || enq.niche === nicheFilter;

    return matchesSearch && matchesStatus && matchesNiche;
  });

  // Extract unique niches for filtering list
  const uniqueNiches = Array.from(new Set(enquiries.map(e => e.niche))).filter(Boolean);

  // Login Form Screen
  if (!authToken) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 mb-6">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 font-display">Operator Security Gate</h2>
        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          Enter the secure studio passcode to access incoming UK contractor leads, quote management, and the Google Veo generation terminal.
        </p>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Studio Passcode
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 text-center bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-lg font-mono tracking-widest"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/5 border border-red-500/10 p-3 rounded-lg text-xs text-left">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Access Control Gate"}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-900/80 pt-4 text-[10px] text-slate-500 italic">
          Operators configure custom passwords via the <code>ADMIN_PASCODE</code> environment variable on Cloud Run.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-slate-900 bg-slate-950/40">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Total Enquiries</span>
          <span className="text-3xl font-bold text-white font-display">{enquiries.length}</span>
        </div>
        <div className="p-5 rounded-xl border border-slate-900 bg-slate-950/40">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Active Quoted</span>
          <span className="text-3xl font-bold text-blue-500 font-display">
            {enquiries.filter(e => e.status === 'Quoted').length}
          </span>
        </div>
        <div className="p-5 rounded-xl border border-slate-900 bg-slate-950/40">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Completed / Closed</span>
          <span className="text-3xl font-bold text-emerald-500 font-display">
            {enquiries.filter(e => e.status === 'Closed').length}
          </span>
        </div>
        <div className="p-5 rounded-xl border border-slate-900 bg-slate-950/40 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Authorization Status</span>
          <span className="text-[11px] font-semibold text-emerald-400 inline-flex items-center gap-1 bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1 rounded-full self-start">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified Operator
          </span>
        </div>
      </div>

      {/* Control Actions & Filtering Panels */}
      <div className="bg-slate-950/30 border border-slate-900 rounded-xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto flex-1">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by client or town..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Status filter dropdown */}
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 appearance-none"
            >
              <option value="All">All Statuses</option>
              {ALL_STATUSES.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Industry niche dropdown */}
          <div className="relative">
            <Layers className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-500" />
            <select
              value={nicheFilter}
              onChange={(e) => setNicheFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 appearance-none"
            >
              <option value="All">All Niches</option>
              {uniqueNiches.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Global actions: CSV Export, Refresh */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCSVExport}
            className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer active:scale-[0.98] transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            Export Safe CSV
          </button>

          <button
            onClick={() => fetchEnquiries(authToken)}
            disabled={loading}
            className="p-2.5 text-slate-400 hover:text-white rounded-lg border border-slate-800 hover:bg-slate-900 cursor-pointer disabled:opacity-50"
            title="Refresh database"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Enquiries Section */}
      <div className="border border-slate-900 bg-slate-950/20 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-900 bg-slate-950/40">
          <h3 className="text-base font-bold text-white font-display">Incoming Enquiries Database</h3>
        </div>

        {filteredEnquiries.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No entries found matching specified search criteria or database is empty.
          </div>
        ) : (
          <div className="divide-y divide-slate-900">
            {filteredEnquiries.map((enq) => {
              const isActive = activeEnquiryId === enq.id;
              const hasQuotes = enq.quotes && enq.quotes.length > 0;
              const hasChecklist = enq.checklist;

              return (
                <div key={enq.id} className="p-6 hover:bg-slate-950/10 transition-colors">
                  
                  {/* Summary / Top Card segment */}
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Brand / Lead identity */}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold text-white font-display">{enq.fullName}</h4>
                        
                        {/* Status badge and update control */}
                        <div className="relative group">
                          <select
                            value={enq.status || "New"}
                            onChange={(e) => handleUpdateStatus(enq.id!, e.target.value as StatusType)}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded border cursor-pointer focus:outline-none uppercase ${
                              enq.status === 'Closed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                              enq.status === 'Quoted' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                              enq.status === 'In Progress' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                              enq.status === 'Contacted' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                              enq.status === 'Rejected' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                              'bg-slate-900 border-slate-800 text-slate-300'
                            }`}
                          >
                            {ALL_STATUSES.map(st => (
                              <option key={st} value={st} className="bg-slate-950 text-slate-200">{st}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <span className="text-xs text-blue-400 font-medium">{enq.businessName}</span>
                    </div>

                    {/* Meta info tags */}
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                        <MapPin className="h-3 w-3 text-red-500" />
                        {enq.location}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                        <Tag className="h-3 w-3 text-yellow-500" />
                        {enq.niche}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                        <DollarSign className="h-3 w-3 text-emerald-500" />
                        Budget: {enq.budgetRange}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                        <Calendar className="h-3 w-3" />
                        {enq.createdAt ? new Date(enq.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        }) : ""}
                      </span>
                    </div>
                  </div>

                  {/* Primary Project Description Brief */}
                  <div className="mt-4 bg-slate-950/40 border border-slate-900/60 p-4 rounded-xl text-xs space-y-3">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Project Brief Description</span>
                      <p className="text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">{enq.projectDescription}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-900/40 text-slate-400">
                      <div>
                        <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Video Objective</span>
                        <span className="text-slate-200">{enq.videoObjective || "Not selected"}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Preferred Aspect Ratio</span>
                        <span className="text-slate-200">{enq.preferredFormat || "Not selected"}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Desired Timeline</span>
                        <span className="text-slate-200">{enq.desiredTimeline || "Not selected"}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-4 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        Email: <a href={`mailto:${enq.email}`} className="text-blue-400 hover:underline">{enq.email}</a>
                      </span>
                      {enq.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          Phone: <span className="text-slate-300">{enq.phone}</span>
                        </span>
                      )}
                      {enq.websiteUrl && (
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          Website: <a href={enq.websiteUrl.startsWith('http') ? enq.websiteUrl : `https://${enq.websiteUrl}`} target="_blank" rel="referrer" className="text-slate-400 hover:text-white hover:underline">{enq.websiteUrl}</a>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar (Expand Details, Create Quote, Copy Portal link, Purge lead) */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-900/40">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveEnquiryId(isActive ? null : enq.id!)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 rounded-md border border-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-3 w-3 text-blue-400" />
                        {isActive ? "Collapse Workspace" : "Manage lead workspace"}
                      </button>

                      <button
                        onClick={() => copyClientPortalLink(enq.id!)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 rounded-md border border-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="h-3 w-3 text-purple-400" />
                        {copiedId === enq.id ? "Link copied!" : "Copy Client Portal link"}
                      </button>
                    </div>

                    {/* Danger retention button */}
                    <button
                      onClick={() => handleDeleteEnquiry(enq.id!)}
                      className="p-1.5 hover:bg-red-500/10 text-slate-600 hover:text-red-400 border border-transparent hover:border-red-500/10 rounded-md cursor-pointer transition-all"
                      title=" GDPR Purge record"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  {/* ACTIVE WORKSPACE DRAWER PANEL */}
                  {isActive && (
                    <div className="mt-6 bg-slate-950/60 rounded-xl border border-blue-500/10 p-5 space-y-6 animate-fadeIn">
                      <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">Operator Workspace for Enquiry ID: {enq.id}</span>
                        <span className="text-[10px] text-slate-500 font-mono">Captured Visitor IP: {enq.consentRecord?.ip || "Unknown"}</span>
                      </div>

                      {/* Workspace Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Left column: Notes Editor & Compliance Checklist */}
                        <div className="space-y-6">
                          
                          {/* Notes editor */}
                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Operator Internal Log Notes</label>
                            <textarea
                              rows={4}
                              value={notesState[enq.id!] || ""}
                              onChange={(e) => setNotesState({ ...notesState, [enq.id!]: e.target.value })}
                              placeholder="Add follow up logs, call notes, custom package requests..."
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
                            />
                            <button
                              onClick={() => handleSaveNotes(enq.id!)}
                              disabled={savingNotes === enq.id}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-[10px] text-white font-semibold rounded cursor-pointer disabled:opacity-50"
                            >
                              {savingNotes === enq.id ? "Saving logs..." : "Save Operator Notes"}
                            </button>
                          </div>

                          {/* Sector Review Checklist */}
                          <div className="space-y-3">
                            <div>
                              <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">UK Advertising & Compliance Checklist</h5>
                              <p className="text-[10px] text-slate-500 leading-normal">
                                Ensure script contains no unapproved claims or misleading before-after mock testimonials prior to video release.
                              </p>
                            </div>

                            <div className="space-y-2 bg-slate-950/80 p-3.5 rounded-lg border border-slate-900 text-xs">
                              <button
                                type="button"
                                onClick={() => handleToggleChecklist(enq.id!, "scriptApproved", !!enq.checklist?.scriptApproved)}
                                className="flex items-center gap-2.5 text-left text-slate-300 hover:text-white w-full py-1 cursor-pointer"
                              >
                                {enq.checklist?.scriptApproved ? (
                                  <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0" />
                                ) : (
                                  <Square className="h-4 w-4 text-slate-600 shrink-0" />
                                )}
                                <div>
                                  <span className={enq.checklist?.scriptApproved ? "line-through text-slate-500" : ""}>Script & Visual Direction verified compliant</span>
                                  {enq.checklist?.scriptApproved && (
                                    <span className="block text-[9px] text-emerald-500">Checked by {enq.checklist.scriptApprovedBy}</span>
                                  )}
                                </div>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleChecklist(enq.id!, "claimsVerified", !!enq.checklist?.claimsVerified)}
                                className="flex items-center gap-2.5 text-left text-slate-300 hover:text-white w-full py-1 cursor-pointer"
                              >
                                {enq.checklist?.claimsVerified ? (
                                  <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0" />
                                ) : (
                                  <Square className="h-4 w-4 text-slate-600 shrink-0" />
                                )}
                                <div>
                                  <span className={enq.checklist?.claimsVerified ? "line-through text-slate-500" : ""}>No unauthorized likenesses or misleading statements</span>
                                  {enq.checklist?.claimsVerified && (
                                    <span className="block text-[9px] text-emerald-500">Checked by {enq.checklist.claimsVerifiedBy}</span>
                                  )}
                                </div>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleChecklist(enq.id!, "logoApproved", !!enq.checklist?.logoApproved)}
                                className="flex items-center gap-2.5 text-left text-slate-300 hover:text-white w-full py-1 cursor-pointer"
                              >
                                {enq.checklist?.logoApproved ? (
                                  <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0" />
                                ) : (
                                  <Square className="h-4 w-4 text-slate-600 shrink-0" />
                                )}
                                <div>
                                  <span className={enq.checklist?.logoApproved ? "line-through text-slate-500" : ""}>Asset ownership and brand logos verified</span>
                                  {enq.checklist?.logoApproved && (
                                    <span className="block text-[9px] text-emerald-500">Checked by {enq.checklist.logoApprovedBy}</span>
                                  )}
                                </div>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleChecklist(enq.id!, "voiceoverApproved", !!enq.checklist?.voiceoverApproved)}
                                className="flex items-center gap-2.5 text-left text-slate-300 hover:text-white w-full py-1 cursor-pointer"
                              >
                                {enq.checklist?.voiceoverApproved ? (
                                  <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0" />
                                ) : (
                                  <Square className="h-4 w-4 text-slate-600 shrink-0" />
                                )}
                                <div>
                                  <span className={enq.checklist?.voiceoverApproved ? "line-through text-slate-500" : ""}>AI voiceover model approved for UK deployment</span>
                                  {enq.checklist?.voiceoverApproved && (
                                    <span className="block text-[9px] text-emerald-500">Checked by {enq.checklist.voiceoverApprovedBy}</span>
                                  )}
                                </div>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleChecklist(enq.id!, "finalApproved", !!enq.checklist?.finalApproved)}
                                className="flex items-center gap-2.5 text-left text-slate-300 hover:text-white w-full py-1 cursor-pointer"
                              >
                                {enq.checklist?.finalApproved ? (
                                  <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0" />
                                ) : (
                                  <Square className="h-4 w-4 text-slate-600 shrink-0" />
                                )}
                                <div>
                                  <span className={enq.checklist?.finalApproved ? "line-through text-slate-500" : ""}>Final ad creative rendered & verified</span>
                                  {enq.checklist?.finalApproved && (
                                    <span className="block text-[9px] text-emerald-500">Checked by {enq.checklist.finalApprovedBy}</span>
                                  )}
                                </div>
                              </button>
                            </div>
                          </div>

                        </div>

                        {/* Right column: Quotations / Invoices and Quote generator */}
                        <div className="space-y-6">
                          
                          {/* List of quotes for this client */}
                          <div className="space-y-3">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Agreed Quotes & Invoices</span>
                            
                            {!hasQuotes ? (
                              <div className="p-4 rounded-lg bg-slate-950 border border-slate-900 text-center text-slate-500 text-xs">
                                No quotations generated yet for this client campaign brief.
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {enq.quotes?.map(q => (
                                  <div key={q.quoteRef} className="p-3 bg-slate-950 border border-slate-900 rounded-lg text-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-slate-200 font-mono">{q.quoteRef}</span>
                                      
                                      <select
                                        value={q.status}
                                        onChange={(e) => handleUpdateQuoteStatus(enq.id!, q.quoteRef, e.target.value)}
                                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                          q.status === 'Paid' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                          q.status === 'Approved' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                          q.status === 'Sent' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                                          q.status === 'Cancelled' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                          'bg-slate-900 border-slate-800 text-slate-400'
                                        }`}
                                      >
                                        <option value="Draft" className="bg-slate-950">Draft</option>
                                        <option value="Sent" className="bg-slate-950">Sent</option>
                                        <option value="Approved" className="bg-slate-950">Approved</option>
                                        <option value="Paid" className="bg-slate-950">Paid</option>
                                        <option value="Cancelled" className="bg-slate-950">Cancelled</option>
                                      </select>
                                    </div>

                                    <div className="text-slate-400 space-y-1">
                                      <div className="flex justify-between">
                                        <span>Amount:</span>
                                        <span className="font-bold text-slate-200">£{q.amount.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Tax Treatment:</span>
                                        <span>{q.taxTreatment}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Deposit due ({quoteDeposit}%):</span>
                                        <span>£{((q.amount * q.depositRequired) / 100).toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Due Date:</span>
                                        <span>{q.dueDate}</span>
                                      </div>
                                      <div className="border-t border-slate-900/60 pt-1.5 mt-1">
                                        <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Agreed Scope</span>
                                        <span className="text-slate-300 text-[10px] line-clamp-2">{q.scope}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Show/Hide Quote creator button */}
                            {creatingQuoteId !== enq.id ? (
                              <button
                                onClick={() => {
                                  setCreatingQuoteId(enq.id!);
                                  setQuoteDueDate(new Date(Date.now() + 7 * 24 * 3600000).toISOString().split('T')[0]);
                                }}
                                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg border border-slate-800 flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Generate New Quotation
                              </button>
                            ) : (
                              <form onSubmit={(e) => handleCreateQuote(e, enq.id!)} className="bg-slate-950 p-4 border border-blue-500/10 rounded-xl space-y-3">
                                <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-900 pb-1.5">
                                  <span>Generate Quote Draft</span>
                                  <button type="button" onClick={() => setCreatingQuoteId(null)} className="text-slate-500 hover:text-white">Cancel</button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">GBP Amount (£)</label>
                                    <input
                                      type="number"
                                      value={quoteAmount}
                                      onChange={(e) => setQuoteAmount(e.target.value)}
                                      required
                                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Deposit Required (%)</label>
                                    <input
                                      type="number"
                                      value={quoteDeposit}
                                      onChange={(e) => setQuoteDeposit(e.target.value)}
                                      required
                                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tax Treatment</label>
                                  <select
                                    value={quoteTaxTreatment}
                                    onChange={(e) => setQuoteTaxTreatment(e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300"
                                  >
                                    <option value="No VAT (Small Business Exemption)">No VAT (Small Business Exemption)</option>
                                    <option value="Standard Rate VAT (20%)">Standard Rate VAT (20%)</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Payment Due Date</label>
                                  <input
                                    type="date"
                                    value={quoteDueDate}
                                    onChange={(e) => setQuoteDueDate(e.target.value)}
                                    required
                                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Agreed Production Scope</label>
                                  <textarea
                                    rows={3}
                                    value={quoteScope}
                                    onChange={(e) => setQuoteScope(e.target.value)}
                                    required
                                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white leading-normal"
                                  />
                                </div>

                                <button
                                  type="submit"
                                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded text-xs cursor-pointer active:scale-[0.99] transition-all"
                                >
                                  Commit Quotation & Transition Status
                                </button>
                              </form>
                            )}

                          </div>

                        </div>

                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
