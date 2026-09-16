import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, Clock, Calendar, FileText, CheckCircle, AlertCircle, 
  ExternalLink, Layers, DollarSign, MapPin, Award, UserCheck, RefreshCw, Sparkles 
} from "lucide-react";
import { Enquiry, QuoteInvoice } from "../types";

interface ClientPortalProps {
  enquiryId: string;
}

export default function ClientPortal({ enquiryId }: ClientPortalProps) {
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Signature Sign-off state
  const [signerName, setSignerName] = useState("");
  const [signingField, setSigningField] = useState<string | null>(null);
  const [submittingSign, setSubmittingSign] = useState(false);

  const fetchClientRecord = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/client/enquiry?id=${enquiryId}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setEnquiry(data.enquiry);
      } else {
        setError(data.error || "Unable to retrieve your secure studio campaign records.");
      }
    } catch (err) {
      setError("Server connection issue. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enquiryId) {
      fetchClientRecord();
    }
  }, [enquiryId]);

  // Digital Signature Approval handler
  const handleClientApprove = async (e: React.FormEvent, field: string) => {
    e.preventDefault();
    if (!signerName.trim()) {
      alert("Please provide your full legal name as a digital signature.");
      return;
    }
    setSubmittingSign(true);

    try {
      const response = await fetch("/api/client/checklist/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiryId,
          field,
          signerName
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setEnquiry(data.enquiry);
        setSigningField(null);
        setSignerName("");
        alert("Campaign item authorized! Your secure digital signature has been recorded and submitted to SULFS operators.");
      } else {
        alert(data.error || "Approval submission failed.");
      }
    } catch (err) {
      alert("Error reaching the authentication endpoint.");
    } finally {
      setSubmittingSign(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto" />
        <p className="text-slate-400 text-xs tracking-wider uppercase font-bold">Initialising Secure Portal...</p>
      </div>
    );
  }

  if (error || !enquiry) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-2xl border border-red-500/10 bg-red-500/5 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white font-display">Client Workspace Restricted</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {error || "Invalid or deactivated secure link reference. Please contact SulfsCreativeStudio@outlook.com to receive an active campaign portal link."}
          </p>
        </div>
      </div>
    );
  }

  // Calculate status percentage progress
  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'New': return { pct: 15, label: "Enquiry Registered" };
      case 'Contacted': return { pct: 40, label: "Operator Consultation" };
      case 'Quoted': return { pct: 60, label: "Quotation Generated" };
      case 'In Progress': return { pct: 80, label: "In Remote Production" };
      case 'Delivered': return { pct: 95, label: "Review Deliverables ready" };
      case 'Closed': return { pct: 100, label: "Campaign Signed & Dispatched" };
      default: return { pct: 10, label: "Pending Setup" };
    }
  };

  const progress = getStatusProgress(enquiry.status || "New");

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-10 animate-fadeIn">
      
      {/* Client Portal Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-900 bg-slate-950/40 p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest block">Client Campaign Portal</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">{enquiry.businessName}</h1>
            <p className="text-xs text-slate-400">
              Welcome, <span className="text-slate-200 font-semibold">{enquiry.fullName}</span>. Track production progress, inspect agreed GBP pricing, and digitalise compliance checklists below.
            </p>
          </div>
          
          <div className="text-left md:text-right shrink-0">
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Client Campaign reference</span>
            <span className="text-sm font-bold text-white font-mono block mt-1">{enquiry.id?.slice(0, 13).toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Progress Tracker Card */}
      <div className="p-6 rounded-xl border border-slate-900 bg-slate-950/20 space-y-4">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-400">Production Pipeline Status: <span className="text-blue-400 font-bold uppercase">{enquiry.status || "New"}</span></span>
          <span className="text-slate-500">{progress.label}</span>
        </div>

        {/* Dynamic progress bar */}
        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out rounded-full shadow-lg shadow-blue-500/20"
            style={{ width: `${progress.pct}%` }}
          />
        </div>

        <div className="grid grid-cols-5 text-[9px] text-center text-slate-500 uppercase font-bold tracking-wider pt-1">
          <span className={progress.pct >= 15 ? "text-blue-400" : ""}>Received</span>
          <span className={progress.pct >= 40 ? "text-blue-400" : ""}>Consulted</span>
          <span className={progress.pct >= 60 ? "text-blue-400" : ""}>Quoted</span>
          <span className={progress.pct >= 80 ? "text-blue-400" : ""}>In Production</span>
          <span className={progress.pct >= 95 ? "text-emerald-400" : ""}>Dispatched</span>
        </div>
      </div>

      {/* Grid split: Left Column: Brief details & Quotations. Right: Verification Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column */}
        <div className="space-y-8">
          
          {/* Brief specifications card */}
          <div className="p-6 rounded-xl border border-slate-900 bg-slate-950/30 space-y-4">
            <h3 className="text-sm font-bold text-white font-display border-b border-slate-900 pb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Campaign Specifications Brief
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
              <div>
                <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Industry Niche</span>
                <span className="text-slate-200">{enquiry.niche}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Target Location</span>
                <span className="text-slate-200">{enquiry.location}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Video Aspect Ratio</span>
                <span className="text-slate-200">{enquiry.preferredFormat || "Not selected"}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Estimated Duration</span>
                <span className="text-slate-200">{enquiry.desiredTimeline || "Not selected"}</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Creative Narrative Description</span>
              <p className="text-slate-300 text-xs leading-relaxed font-mono whitespace-pre-wrap bg-slate-950/50 p-3 rounded border border-slate-900">{enquiry.projectDescription}</p>
            </div>
          </div>

          {/* Quotations / Invoicing Details */}
          <div className="p-6 rounded-xl border border-slate-900 bg-slate-950/30 space-y-4">
            <h3 className="text-sm font-bold text-white font-display border-b border-slate-900 pb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              Agreed Quotation & Invoice
            </h3>

            {(!enquiry.quotes || enquiry.quotes.length === 0) ? (
              <p className="text-xs text-slate-500 text-center py-4">
                Your campaign quote is currently being calculated by SULFS operators.
              </p>
            ) : (
              <div className="space-y-4">
                {enquiry.quotes.map((q: QuoteInvoice) => {
                  const isSent = q.status === "Sent";
                  const isApproved = q.status === "Approved" || q.status === "Paid";
                  
                  return (
                    <div key={q.quoteRef} className="p-4 bg-slate-950 border border-slate-900 rounded-lg space-y-3 text-xs">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                        <span className="font-bold text-slate-200 font-mono text-[11px]">Ref: {q.quoteRef}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          q.status === 'Paid' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                          q.status === 'Approved' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' :
                          q.status === 'Sent' ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400' :
                          'bg-slate-900 border border-slate-800 text-slate-500'
                        }`}>{q.status}</span>
                      </div>

                      <div className="text-slate-400 space-y-1.5">
                        <div className="flex justify-between">
                          <span>Introductory Flat Rate:</span>
                          <span className="font-bold text-white">£{q.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span>VAT Treatment:</span>
                          <span>{q.taxTreatment}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Production Deposit ({enquiry.budgetRange === 'trial' ? '100' : '50'}%):</span>
                          <span className="font-semibold text-slate-300">£{((q.amount * q.depositRequired) / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Deposit Due Date:</span>
                          <span>{q.dueDate}</span>
                        </div>

                        <div className="pt-2 border-t border-slate-900/60">
                          <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Agreed Work Scope</span>
                          <p className="text-[11px] text-slate-300 leading-normal bg-slate-950 p-2 rounded">{q.scope}</p>
                        </div>
                      </div>

                      {/* Approve Quote Button */}
                      {isSent && (
                        <div className="pt-2">
                          {signingField !== "quoteApproved" ? (
                            <button
                              onClick={() => setSigningField("quoteApproved")}
                              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded transition-all cursor-pointer"
                            >
                              Authorize Digital Quote Acceptance
                            </button>
                          ) : (
                            <form onSubmit={(e) => handleClientApprove(e, "quoteApproved")} className="bg-slate-950 p-3 rounded border border-blue-500/20 space-y-3">
                              <div>
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Legal Signature (Type Full Name)</label>
                                <input
                                  type="text"
                                  value={signerName}
                                  onChange={(e) => setSignerName(e.target.value)}
                                  required
                                  placeholder="e.g. David Higgins"
                                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="submit"
                                  disabled={submittingSign}
                                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold rounded cursor-pointer disabled:opacity-50"
                                >
                                  {submittingSign ? "Submitting..." : "Sign Acceptance"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSigningField(null)}
                                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] rounded"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      )}

                      {isApproved && (
                        <div className="pt-1.5 text-center text-emerald-400 bg-emerald-500/5 p-2 rounded border border-emerald-500/10 flex items-center justify-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          <span>Acceptance registered on {enquiry.checklist?.quoteApprovedAt ? new Date(enquiry.checklist.quoteApprovedAt).toLocaleDateString("en-GB") : ""}</span>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-8">
          
          {/* Ad Verification & Compliance Checklist Card */}
          <div className="p-6 rounded-xl border border-slate-900 bg-slate-950/30 space-y-4">
            <h3 className="text-sm font-bold text-white font-display border-b border-slate-900 pb-2 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
              UK Trade & Compliance Checklist
            </h3>
            
            <p className="text-[11px] text-slate-500 leading-normal">
              Sulfs operates under strict compliance with the UK Code of Non-broadcast Advertising (CAP Code). All claim statements, visual transitions, and AI narration assets must be verified and signed before campaign release.
            </p>

            <div className="space-y-3 text-xs">
              
              {/* Script approved */}
              <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg flex items-start gap-3">
                <div className="mt-0.5">
                  {enquiry.checklist?.scriptApproved ? (
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
                  ) : (
                    <Clock className="h-4.5 w-4.5 text-slate-600" />
                  )}
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-200">1. Script & Visual Concept Checked</span>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Factual details verified accurate. The direction contains no unapproved claims or misleading trade assertions.
                  </p>
                  {enquiry.checklist?.scriptApproved && (
                    <span className="text-[9px] text-emerald-500 block">Verified by SULFS Operator ({enquiry.checklist.scriptApprovedBy})</span>
                  )}
                </div>
              </div>

              {/* Claims checked */}
              <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg flex items-start gap-3">
                <div className="mt-0.5">
                  {enquiry.checklist?.claimsVerified ? (
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
                  ) : (
                    <Clock className="h-4.5 w-4.5 text-slate-600" />
                  )}
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-200">2. Licensing & Trademark Verification</span>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Confirm all overlay corporate branding logos are genuine client assets, with zero unauthorized trade likenesses.
                  </p>
                  {enquiry.checklist?.claimsVerified && (
                    <span className="text-[9px] text-emerald-500 block">Verified by SULFS Operator ({enquiry.checklist.claimsVerifiedBy})</span>
                  )}
                </div>
              </div>

              {/* Voiceover approved */}
              <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg flex items-start gap-3">
                <div className="mt-0.5">
                  {enquiry.checklist?.voiceoverApproved ? (
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
                  ) : (
                    <Clock className="h-4.5 w-4.5 text-slate-600" />
                  )}
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-200">3. Narrator & Subtitle Approval</span>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    AI premium narration voice model and subtitles checked for clear UK trade pronunciation and exact script sync.
                  </p>
                  {enquiry.checklist?.voiceoverApproved && (
                    <span className="text-[9px] text-emerald-500 block">Verified by SULFS Operator ({enquiry.checklist.voiceoverApprovedBy})</span>
                  )}
                </div>
              </div>

              {/* Customer Sign-off final approved */}
              <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg space-y-2">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {enquiry.checklist?.finalApproved ? (
                      <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
                    ) : (
                      <Clock className="h-4.5 w-4.5 text-slate-600" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-slate-200">4. Customer Campaign Sign-off</span>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Authorize digital acceptance for the completed video and concept files to transition your project to delivery.
                    </p>
                    {enquiry.checklist?.finalApproved && (
                      <div className="bg-emerald-500/5 border border-emerald-500/10 p-2 rounded text-[10px] text-emerald-400 leading-relaxed font-mono">
                        <span>SIGNED BY: {enquiry.checklist.finalApprovedBy}</span>
                        <span className="block text-[9px] text-slate-500">Timestamp: {new Date(enquiry.checklist.finalApprovedAt || "").toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Show approve signoff form */}
                {!enquiry.checklist?.finalApproved && (
                  <div className="pt-2 border-t border-slate-900/60">
                    {signingField !== "finalApproved" ? (
                      <button
                        onClick={() => setSigningField("finalApproved")}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded cursor-pointer"
                      >
                        Authorize Campaign Sign-off
                      </button>
                    ) : (
                      <form onSubmit={(e) => handleClientApprove(e, "finalApproved")} className="bg-slate-950 p-3 rounded border border-blue-500/20 space-y-3 text-xs">
                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Type Full Legal Name as Signature</label>
                          <input
                            type="text"
                            value={signerName}
                            onChange={(e) => setSignerName(e.target.value)}
                            required
                            placeholder="e.g. David Higgins"
                            className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={submittingSign}
                            className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold rounded cursor-pointer disabled:opacity-50"
                          >
                            {submittingSign ? "Signing..." : "Authorize Sign-off"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSigningField(null)}
                            className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
