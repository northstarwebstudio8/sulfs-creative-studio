import React from "react";
import { Film, Mail, ArrowUp, HelpCircle } from "lucide-react";

interface FooterProps {
  setActivePage: (page: string) => void;
}

export default function Footer({ setActivePage }: FooterProps) {
  const handlePageClick = (pageId: string) => {
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-slate-900 bg-slate-950/80 text-slate-400">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Studio Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-500">
                <Film className="h-4.5 w-4.5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white font-display">SULFS</span>
            </div>
            <p className="text-sm leading-relaxed max-w-md text-slate-400">
              Smart User-Led Film Studio (SULFS) is a premium AI-assisted video advertising agency designing high-converting, cinematic advertisements remotely for Home Improvement, Real Estate, and Dental & Aesthetic Clinic businesses in the UK.
            </p>
            <p className="text-xs text-slate-500 italic max-w-md">
              Disclaimer: SULFS operates as an international remote production partner and does not imply UK registration or permanent establishment unless factually established.
            </p>
          </div>

          {/* Quick Nav Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Agency</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <button onClick={() => handlePageClick("home")} className="hover:text-white cursor-pointer transition-colors text-left">Home</button>
              </li>
              <li>
                <button onClick={() => handlePageClick("services")} className="hover:text-white cursor-pointer transition-colors text-left">Services</button>
              </li>
              <li>
                <button onClick={() => handlePageClick("portfolio")} className="hover:text-white cursor-pointer transition-colors text-left">Client Work</button>
              </li>
              <li>
                <button onClick={() => handlePageClick("pricing")} className="hover:text-white cursor-pointer transition-colors text-left">GBP Pricing</button>
              </li>
            </ul>
          </div>

          {/* Contact / Help */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Connect</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <button onClick={() => handlePageClick("about")} className="hover:text-white cursor-pointer transition-colors text-left">About Studio</button>
              </li>
              <li>
                <button onClick={() => handlePageClick("contact")} className="hover:text-white cursor-pointer transition-colors text-left">Enquiry Form</button>
              </li>
              <li className="flex items-center gap-2 text-blue-400">
                <Mail className="h-3.5 w-3.5" />
                <a href="mailto:SulfsCreativeStudio@outlook.com" className="text-xs hover:underline">
                  SulfsCreativeStudio@outlook.com
                </a>
              </li>
              <li className="text-[11px] text-slate-500">
                We usually respond within 1–2 working days.
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} SULFS (Smart User-Led Film Studio). AI-Powered Stories. Real Business Impact. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
              <button onClick={() => handlePageClick("terms")} className="hover:text-slate-300 cursor-pointer">Terms & Conditions</button>
              <span>•</span>
              <button onClick={() => handlePageClick("privacy")} className="hover:text-slate-300 cursor-pointer">Privacy Policy</button>
              <span>•</span>
              <button onClick={() => handlePageClick("refunds")} className="hover:text-slate-300 cursor-pointer">Refund Policy</button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              Back to Top
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
