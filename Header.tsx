import React, { useState } from "react";
import { Film, Menu, X, ShieldAlert, Cpu } from "lucide-react";

interface HeaderProps {
  activePage: string;
  setActivePage: (page: string) => void;
  onGetQuoteClick: () => void;
}

export default function Header({ activePage, setActivePage, onGetQuoteClick }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { id: "home", label: "Home" },
    { id: "services", label: "Services" },
    { id: "portfolio", label: "Portfolio" },
    { id: "pricing", label: "Pricing" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
  ];

  const handleNavClick = (pageId: string) => {
    setActivePage(pageId);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-20 items-center justify-between px-6 lg:px-8">
        
        {/* SULFS Branding */}
        <button
          onClick={() => handleNavClick("home")}
          className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
          id="header-logo"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.1)] transition-transform group-hover:scale-105">
            <Film className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="block text-xl font-bold tracking-tight text-white font-display">
              SULFS
            </span>
            <span className="block text-[10px] tracking-widest text-slate-400 font-medium">
              FILM STUDIO
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navigationItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? "text-blue-400 bg-blue-500/5 border border-blue-500/10"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/45"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onGetQuoteClick}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/15 hover:bg-blue-500 hover:shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
          >
            Get a Free Quote
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-lg border border-slate-800 cursor-pointer"
            id="mobile-menu-btn"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 p-6 space-y-4">
          <div className="flex flex-col gap-1.5">
            {navigationItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-base font-semibold transition-all ${
                    isActive
                      ? "text-blue-400 bg-blue-500/5 border-l-2 border-blue-500"
                      : "text-slate-300 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          
          <div className="pt-4 border-t border-slate-900 flex flex-col gap-3">
            <button
              onClick={() => {
                setIsOpen(false);
                onGetQuoteClick();
              }}
              className="w-full text-center py-3 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-500"
            >
              Get a Free Quote
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
