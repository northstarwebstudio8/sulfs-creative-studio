import React, { useState, useEffect } from "react";
import { 
  Film, Sparkles, Video, Play, Pause, Volume2, VolumeX, Mail, 
  MapPin, Clock, Check, HelpCircle, Shield, CheckCircle, 
  ArrowRight, Users, MessageSquare, Flame, CheckCircle2, Award, 
  Cpu, Layout, Eye, ChevronRight, Smartphone, AlertCircle,
  Home, Building, Heart, X
} from "lucide-react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LeadDashboard from "./components/LeadDashboard";
import VideoGenerator from "./components/VideoGenerator";
import DemoVideoPlayer from "./components/DemoVideoPlayer";
import ClientPortal from "./components/ClientPortal";
import { VideoAd, PricingTier } from "./types";

const industries = [
  {
    id: "home_improvement",
    name: "Home Improvement",
    demoBusiness: "Oakline Renovations",
    demoTitle: "Oakline Renovations — Transform Your Home",
    desc: "Premium video advertisements for renovation, roofing, extensions, kitchens, bathrooms, flooring, and decorating businesses.",
    icon: Home,
    cta: "Request a Free Quote",
    videoUrl: "/demos/oakline-renovations-8s.mp4.mp4",
    adText: "Highlight stunning aesthetic transitions, shaker cabinetry details, and meticulous craftsmanship that build ultimate domestic trust."
  },
  {
    id: "real_estate",
    name: "Real Estate",
    demoBusiness: "Northstar Property Group",
    demoTitle: "Northstar Property Group — Find Your Next Home",
    desc: "Cinematic property showcase videos designed to attract viewing enquiries and property leads.",
    icon: Building,
    cta: "Book a Viewing",
    videoUrl: "/demos/northstar-property-8s.mp4",
    adText: "Create smooth wide-angle virtual walkthroughs and twilight architectural shots to attract serious domestic buyers."
  },
  {
    id: "dental_clinics",
    name: "Dental & Aesthetic Clinics",
    demoBusiness: "Harbour Smile Clinic",
    demoTitle: "Harbour Smile Clinic — Confidence Starts Here",
    desc: "Trust-focused video advertisements for dental, cosmetic, skincare, and aesthetic clinics.",
    icon: Heart,
    cta: "Book Your Consultation",
    videoUrl: "/demos/harbour-smile-clinic-8s.mp4.mp4",
    adText: "Convey patient comfort, modern clinical hygiene, and friendly specialist expertise with accurate medical copywriting."
  }
];

export default function App() {
  const [rawActivePage, setRawActivePage] = useState<string>("home");
  const [clientIdParam, setClientIdParam] = useState<string | null>(null);
  const [preSelectedBudget, setPreSelectedBudget] = useState<string>("starter");
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [smartphoneAdId, setSmartphoneAdId] = useState<string>("oakline");
  const [selectedLightboxVideo, setSelectedLightboxVideo] = useState<{
    videoUrl: string;
    title: string;
    niche: string;
    posterUrl?: string;
  } | null>(null);

  // Keyboard Escape listener to close video modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedLightboxVideo(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activePage = rawActivePage;

  const setActivePage = (pageId: string) => {
    setRawActivePage(pageId);
    if (pageId !== "client-portal") {
      setClientIdParam(null);
    }
    const path = pageId === "home" ? "/" : "/" + pageId;
    if (window.location.pathname !== path) {
      // Clear query string unless we're navigating to client portal
      window.history.pushState(null, "", path);
    }
  };

  // Synchronize route with pathname on load and popstate
  useEffect(() => {
    const handleLocation = () => {
      // Check query parameters first for client portal
      const params = new URLSearchParams(window.location.search);
      const queryPage = params.get("page");
      const queryId = params.get("id");
      if (queryPage === "client-portal" && queryId) {
        setRawActivePage("client-portal");
        setClientIdParam(queryId);
        return;
      }

      const path = window.location.pathname;
      if (path === "/admin") {
        setRawActivePage("admin");
      } else if (path === "/" || path === "") {
        setRawActivePage("home");
      } else {
        const cleanPath = path.replace("/", "");
        const validPages = ["services", "portfolio", "pricing", "about", "contact", "terms", "privacy", "refunds"];
        if (validPages.includes(cleanPath)) {
          setRawActivePage(cleanPath);
        } else {
          setRawActivePage("home");
        }
      }
    };

    handleLocation();
    window.addEventListener("popstate", handleLocation);
    return () => window.removeEventListener("popstate", handleLocation);
  }, []);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activePage]);

  // Contact form state
  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    email: "",
    phone: "",
    location: "",
    niche: "Home Improvement",
    serviceRequired: "AI-assisted video ad creation",
    budgetRange: "starter",
    projectDescription: "",
    websiteUrl: "",
    consent: false,
    fax_honeypot: ""
  });
  const [formStatus, setFormStatus] = useState<{
    status: "idle" | "submitting" | "success" | "error";
    message?: string;
  }>({ status: "idle" });

  const handleSelectNiche = (nicheName: string, demoName?: string) => {
    setFormData(prev => ({
      ...prev,
      niche: nicheName,
      projectDescription: demoName ? `Enquiry regarding demo template: ${demoName}.` : prev.projectDescription
    }));
    setActivePage("contact");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Portfolios
  const portfolioAds: VideoAd[] = [
    {
      id: "oakline",
      title: "Oakline Renovations",
      demoTitle: "Oakline Renovations — Transform Your Home",
      niche: "Home Improvement",
      description: "Premium video advertisements for renovation, roofing, extensions, kitchens, bathrooms, flooring, and decorating businesses.",
      videoUrl: "/demos/oakline-renovations-8s.mp4.mp4",
      posterUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600&auto=format&fit=crop",
      cta: "Request a Similar Ad",
      isDemo: true
    },
    {
      id: "northstar",
      title: "Northstar Property Group",
      demoTitle: "Northstar Property Group — Find Your Next Home",
      niche: "Real Estate",
      description: "Cinematic property showcase videos designed to attract viewing enquiries and property leads.",
      videoUrl: "/demos/northstar-property-8s.mp4",
      posterUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop",
      cta: "Request a Similar Ad",
      isDemo: true
    },
    {
      id: "harbour",
      title: "Harbour Smile Clinic",
      demoTitle: "Harbour Smile Clinic — Confidence Starts Here",
      niche: "Dental & Aesthetic Clinics",
      description: "Trust-focused video advertisements for dental, cosmetic, skincare, and aesthetic clinics.",
      videoUrl: "/demos/harbour-smile-clinic-8s.mp4.mp4",
      posterUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=600&auto=format&fit=crop",
      cta: "Request a Similar Ad",
      isDemo: true
    }
  ];

  const pricingTiers: PricingTier[] = [
    {
      id: "starter",
      name: "Starter",
      price: 49,
      duration: "One-off",
      description: "Perfect for testing high-converting video promotions locally with minimal friction.",
      features: [
        "1 short video ad",
        "Up to 15 seconds runtime",
        "One platform-ready format",
        "One creative revision cycle",
        "Delivery: 3–5 working days"
      ]
    },
    {
      id: "business",
      name: "Business",
      price: 129,
      duration: "One-off",
      badge: "Most Popular",
      description: "Our most popular package for multi-format social media campaigns.",
      features: [
        "3 short video ads",
        "Up to 15 seconds each",
        "Vertical and square formats",
        "Two revisions allowed",
        "Delivery: 5–7 working days"
      ]
    },
    {
      id: "pro",
      name: "Pro",
      price: 199,
      duration: "One-off",
      description: "High-priority, fast-turnaround complete multi-variant campaign package.",
      features: [
        "5 short video ads",
        "Up to 15 seconds each",
        "Multiple platform formats",
        "Three revisions allowed",
        "Priority project queue",
        "Delivery: 7–10 working days"
      ]
    }
  ];

  // Selected Category filter for portfolio
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Video playback overlays state
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [mutedVideos, setMutedVideos] = useState<Record<string, boolean>>({});

  const toggleMute = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMutedVideos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectPackage = (tierId: string) => {
    setFormData(prev => ({
      ...prev,
      budgetRange: tierId
    }));
    setActivePage("contact");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Submit enquiry form
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus({ status: "submitting" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        setFormStatus({
          status: "success",
          message: data.message
        });
        // Reset form
        setFormData({
          fullName: "",
          businessName: "",
          email: "",
          phone: "",
          location: "",
          niche: "Home Improvement",
          serviceRequired: "AI-assisted video ad creation",
          budgetRange: "starter",
          projectDescription: "",
          websiteUrl: "",
          consent: false,
          fax_honeypot: ""
        });
      } else {
        setFormStatus({
          status: "error",
          message: data.error || "Form submission failed."
        });
      }
    } catch (err) {
      setFormStatus({
        status: "error",
        message: "Network error. Failed to reach SULFS servers. Please try again."
      });
    }
  };

  // Render individual pages
  const renderHome = () => {
    return (
      <div className="space-y-24">
        
        {/* Cinematic Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-28" id="hero-section">
          {/* Ambient Blue Background Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Hero Copywriting */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/15 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                  SULFS — Smart User-Led Film Studio
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-none font-display">
                  AI-Powered Stories.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400">
                    Real Business Impact.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  We design high-converting, premium short-form video advertisements for ambitious UK home-improvement companies—combining advanced Google AI tools with professional, remote studio editors.
                </p>

                {/* Trust Elements */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-emerald-400" />
                    Kitchen & Bath Installers
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-emerald-400" />
                    Landscapers & Builders
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-emerald-400" />
                    Remotely Crafted in 3-5 Days
                  </span>
                </div>

                {/* Primary Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <button
                    onClick={() => setActivePage("contact")}
                    className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-8 text-sm font-semibold text-white shadow-lg shadow-blue-600/15 hover:bg-blue-500 hover:shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                  >
                    Get a Free Quote
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setActivePage("portfolio")}
                    className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 px-8 text-sm font-semibold text-slate-200 hover:bg-slate-850 hover:text-white transition-all cursor-pointer"
                  >
                    View Our Work
                  </button>
                </div>
              </div>

              {/* High-End Video Preview Panel */}
              <div className="lg:col-span-5 relative">
                {/* Smartphone Preview Selector */}
                <div className="flex justify-center gap-1.5 mb-4 bg-slate-950/40 p-1.5 rounded-2xl border border-slate-900/60 max-w-[360px] mx-auto overflow-x-auto scrollbar-none">
                  {portfolioAds.map((ad) => (
                    <button
                      key={ad.id}
                      onClick={() => setSmartphoneAdId(ad.id)}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        smartphoneAdId === ad.id
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/15"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {ad.id === "oakline" ? "Home" : ad.id === "northstar" ? "Property" : "Smile"}
                    </button>
                  ))}
                </div>

                <div className="relative mx-auto max-w-[280px] sm:max-w-[320px] aspect-[9/16] rounded-[36px] overflow-hidden border-8 border-slate-900 bg-slate-950 shadow-2xl shadow-blue-500/5 group">
                  {/* Real playable preview video using custom player in portrait ratio */}
                  {(() => {
                    const activeAd = portfolioAds.find(a => a.id === smartphoneAdId) || portfolioAds[0];
                    return (
                      <div className="w-full h-full relative">
                        <DemoVideoPlayer 
                          videoUrl={activeAd.videoUrl} 
                          title={activeAd.title} 
                          niche={activeAd.niche} 
                          id={`smartphone-${activeAd.id}`} 
                          aspectRatio="9/16"
                          posterUrl={activeAd.posterUrl}
                          isFallback={activeAd.isFallback}
                          fallbackReason={activeAd.fallbackReason}
                        />
                        
                        {/* Glass Header overlay - Floating on top of the player */}
                        <div className="absolute top-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md border border-slate-800/60 py-1.5 px-2.5 rounded-xl flex items-center justify-between z-10 pointer-events-none">
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
                            <span className="text-[9px] font-bold text-slate-200 tracking-wider font-display">SULFS LIVE</span>
                          </div>
                          <span className="text-[8px] font-semibold text-blue-400 bg-blue-500/10 px-1 py-0.5 rounded">
                            Meta Ad
                          </span>
                        </div>

                        {/* Glass Footer CTA overlay - Floating on top of player */}
                        <div className="absolute bottom-16 left-4 right-4 bg-slate-950/90 backdrop-blur-md border border-slate-800/80 p-2.5 rounded-xl z-10">
                          <span className="block text-[7px] font-bold text-slate-500 tracking-wider uppercase mb-0.5">PROSPECTIVE CUSTOMER VIEW</span>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-white font-display truncate max-w-[120px]">{activeAd.title}</span>
                            <button
                              onClick={() => handleSelectNiche(activeAd.niche, activeAd.demoTitle)}
                              className="text-[9px] font-semibold bg-blue-600 text-white px-2 py-1 rounded cursor-pointer hover:bg-blue-500 transition-colors"
                            >
                              {activeAd.cta}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Featured Video Previews Grid */}
        <section id="demo-adverts" className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
          <div className="text-center space-y-4 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-500">Premium Showcase</span>
            <h2 className="text-3xl font-bold tracking-tight text-white font-display">Demo Advertisements</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Explore our cinematic AI-assisted advertising concepts crafted for premium UK businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {portfolioAds.map((ad) => (
              <div key={ad.id} className="bg-slate-950/30 border border-slate-900 rounded-2xl overflow-hidden hover:border-slate-850 transition-all flex flex-col justify-between p-5 space-y-5">
                
                {/* Custom Video Player with onClick handler */}
                <DemoVideoPlayer 
                  videoUrl={ad.videoUrl} 
                  title={ad.title} 
                  niche={ad.niche} 
                  id={ad.id} 
                  posterUrl={ad.posterUrl}
                  isFallback={ad.isFallback}
                  fallbackReason={ad.fallbackReason}
                  onClick={() => {
                    setSelectedLightboxVideo({
                      videoUrl: ad.videoUrl,
                      title: ad.demoTitle,
                      niche: ad.niche,
                      posterUrl: ad.posterUrl
                    });
                  }}
                />
                
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{ad.niche}</span>
                    <h3 className="text-base font-bold text-white font-display leading-snug">{ad.demoTitle}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{ad.description}</p>
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLightboxVideo({
                            videoUrl: ad.videoUrl,
                            title: ad.demoTitle,
                            niche: ad.niche,
                            posterUrl: ad.posterUrl
                          });
                        }}
                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-lg cursor-pointer text-center transition-colors shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        Watch Demo
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectNiche(ad.niche, ad.demoTitle)}
                        className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-slate-200 rounded-lg cursor-pointer text-center transition-colors active:scale-95"
                      >
                        Enquire Now
                      </button>
                    </div>
                    
                    {/* Clear fictional-demo disclosure */}
                    <p className="text-[10px] text-slate-500 italic text-center leading-normal">
                      Concept Demonstration — Not a commissioned client campaign.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button 
              onClick={() => setActivePage("portfolio")}
              className="inline-flex items-center text-xs font-semibold text-blue-400 hover:text-blue-300 gap-1 cursor-pointer"
            >
              Explore Our Full Portfolio Gallery
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>

        {/* Studio Services Overview */}
        <section className="mx-auto max-w-7xl px-6 lg:px-8 py-4 border-t border-b border-slate-900/60 bg-slate-950/20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-12 items-center">
            
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold tracking-widest uppercase text-blue-500">Service Suite</span>
              <h2 className="text-3xl font-extrabold text-white font-display">Precision Production Pipeline</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                We design short-form ads customized for UK contractors. From scripting hook variations to rendering high-definition frame layers, every element is refined by a dedicated post-production editor.
              </p>
              
              <div className="pt-2">
                <button 
                  onClick={() => setActivePage("services")}
                  className="px-5 py-2.5 bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 rounded-lg hover:bg-slate-850 cursor-pointer"
                >
                  Learn About Our Process
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: "AI-Assisted Video Ads", desc: "Dynamic rendering using advanced Google Veo video generators to generate beautiful, highly-tailored visual assets of home details." },
                { title: "Hook Script Development", desc: "Crafting structured, high-conversion narratives targeting domestic property owners looking to renovate." },
                { title: "Sound Design & VO", desc: "Licensing crisp ambient music tracks paired with rich natural voiceovers to convey premium professionalism." },
                { title: "Social Campaign Optimization", desc: "Exporting multiple ad aspect ratios (9:16 vertical & 1:1 square) to suit Instagram, Meta, and local trade listings." }
              ].map((serv, idx) => (
                <div key={idx} className="p-5 rounded-xl border border-slate-900 bg-slate-950/40 space-y-2">
                  <h3 className="text-sm font-bold text-white font-display">{serv.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{serv.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* Industries We Serve Section */}
        <section className="mx-auto max-w-7xl px-6 lg:px-8 border-t border-slate-900/60 pt-20">
          <div className="text-center space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-500">Target Verticals</span>
            <h2 className="text-3xl font-extrabold text-white font-display">Industries We Serve</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              We construct custom visual script angles and bespoke motion graphics tailored specifically to 9 distinct sectors looking for domestic UK growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((ind) => {
              const IconComp = ind.icon;
              return (
                <div key={ind.id} className="p-6 rounded-2xl border border-slate-900 bg-slate-950/20 hover:border-slate-850 hover:bg-slate-950/45 transition-all flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <IconComp className="h-5.5 w-5.5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white font-display">{ind.name}</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{ind.desc}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-900/60 text-[11px] text-slate-400 italic leading-relaxed">
                      <span className="font-semibold text-slate-200 block not-italic uppercase tracking-widest text-[9px] mb-1">What we create:</span>
                      {ind.adText}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleSelectNiche(ind.name)}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-lg cursor-pointer transition-all text-center"
                    >
                      Request an Ad
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLightboxVideo({
                          videoUrl: ind.id === "home_improvement" ? "/demos/oakline-renovations-8s.mp4.mp4" : ind.id === "real_estate" ? "/demos/northstar-property-8s.mp4" : "/demos/harbour-smile-clinic-8s.mp4.mp4",
                          title: ind.demoTitle,
                          niche: ind.name,
                          posterUrl: ind.id === "home_improvement" ? "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600&auto=format&fit=crop" : ind.id === "real_estate" ? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop" : "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=600&auto=format&fit=crop"
                        });
                      }}
                      className="px-3 py-2.5 bg-slate-900 hover:bg-slate-850 text-xs font-semibold text-slate-300 rounded-lg border border-slate-800 cursor-pointer transition-all flex items-center justify-center gap-1"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      Watch Demo
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Easy Remote Workflow */}
        <section className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-500">How It Works</span>
            <h2 className="text-3xl font-extrabold text-white font-display">Remote Collaboration. Seamless Delivery.</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              SULFS operates remotely from India, delivering high-end UK English ad creatives with maximum cost savings and absolute efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              { num: "01", title: "Submit Brief", desc: "Use our quote enquiry form to select your campaign budget and specify your home-improvement trade (kitchens, landscaping, etc.)." },
              { num: "02", title: "AI Sourcing & Writing", desc: "We deploy Google Veo models to render details while writing high-impact scripts suited for UK domestic lead-capture." },
              { num: "03", title: "Editor Review & Delivery", desc: "Our Indian editing studio color-grades the footage, syncs professional sound layers, and delivers your MP4 file in 3-5 days." }
            ].map((step, idx) => (
              <div key={idx} className="relative p-6 rounded-2xl border border-slate-900 bg-slate-950/10 space-y-4">
                <span className="block text-4xl font-extrabold text-blue-500/10 font-mono leading-none">{step.num}</span>
                <h3 className="text-base font-bold text-white font-display">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Overview Mini Grid */}
        <section className="mx-auto max-w-7xl px-6 lg:px-8 border-t border-slate-900 pt-16">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-500">GBP Introductory Pricing</span>
            <h2 className="text-3xl font-extrabold text-white font-display">Tailored for Local Contractors</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pricingTiers.slice(0, 3).map((tier) => (
              <div key={tier.id} className="p-6 rounded-2xl border border-slate-900 bg-slate-950/20 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{tier.name}</h3>
                  <div className="flex items-baseline mt-2 gap-1">
                    <span className="text-3xl font-extrabold text-white">£{tier.price}</span>
                    <span className="text-xs text-slate-500">/ {tier.duration}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">{tier.description}</p>
                </div>
                
                <button 
                  onClick={() => handleSelectPackage(tier.id)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-xs font-semibold text-blue-400 rounded-lg cursor-pointer text-center"
                >
                  Select Package
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setActivePage("pricing")}
              className="inline-flex items-center text-xs font-semibold text-blue-400 hover:text-blue-300 gap-1"
            >
              See Full Revision Policies & Disclosures
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>

        {/* Trust & Professionalism Assurance */}
        <section className="mx-auto max-w-4xl px-6 lg:px-8 text-center space-y-6">
          <div className="p-8 rounded-3xl border border-slate-900 bg-gradient-to-b from-slate-950 to-slate-950/40 space-y-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Shield className="h-5.5 w-5.5" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white font-display">The SULFS Quality Standard</h3>
              <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
                While AI assists us in rendering pristine details and lighting, we guarantee that all final video files are professionally reviewed, timed, and finished manually. We never deliver raw, distorted AI exports.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-900 text-[10px] uppercase font-bold tracking-widest text-slate-400">
              <div>
                <span className="block text-white text-lg font-bold font-mono">100%</span>
                Manual Quality Audit
              </div>
              <div>
                <span className="block text-white text-lg font-bold font-mono">GBP</span>
                Clear Invoicing
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="block text-white text-lg font-bold font-mono">3-5d</span>
                Turnaround Guarantee
              </div>
            </div>
          </div>
        </section>

        {/* Final Home CTA */}
        <section className="mx-auto max-w-4xl px-6 text-center py-8">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-white font-display">Ready to Dominate Your Local Area?</h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">
              Get an introductory quotation on our Trial Ad or Starter Package and launch high-impact social media promotions next week.
            </p>
            
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setActivePage("contact")}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white rounded-xl shadow-lg shadow-blue-600/10 cursor-pointer"
              >
                Request Free Quote
              </button>
            </div>
          </div>
        </section>

      </div>
    );
  };

  const renderServices = () => {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-12">
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-500">Our Services</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">AI Video Sourcing & Professional Post-Production</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            We operate as an agile remote video studio. We specialize in taking your raw contractor project details and orchestrating them into fully finalized ad creatives that drive leads for UK domestic installation trades.
          </p>
        </div>

        {/* Service Cards Detailed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {[
            {
              title: "1. AI-Assisted Video Sourcing",
              desc: "We harness Google Veo models to render pristine details (e.g. clean shaker kitchen cabinet hinges, marble texture overlays, turf layouts) matching your specific contract. This ensures high-end visuals without the high cost of local camera crews."
            },
            {
              title: "2. Script & Storyboard Layouts",
              desc: "Our creative writers draft conversion-optimized narrative sheets detailing hook lines, benefit claims, and phone/website call-to-actions specifically optimized for UK domestic trades."
            },
            {
              title: "3. Professional Video Editing",
              desc: "An experienced remote editor reviews and cuts every asset. We color-grade, apply cinematic transitions, and polish the final composition to guarantee a natural, premium flow."
            },
            {
              title: "4. Captions & Premium Voiceovers",
              desc: "We generate rich, easy-to-read caption subtitles to capture silent social media scrolling, paired with professional voiceovers that convey trust."
            },
            {
              title: "5. Custom Branding & CTAs",
              desc: "We overlay your business logo, UK phone number, local locations served, and a clear next-step action (e.g. 'Get Your Free Consultation')."
            },
            {
              title: "6. Campaign Aspect Variations",
              desc: "We render multiple aspect ratios including 9:16 vertical (suited for TikTok/Instagram Stories) and 1:1 square (optimal for local Meta feeds and trader search engines)."
            }
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-xl border border-slate-900 bg-slate-950/20 space-y-3">
              <h3 className="text-base font-bold text-white font-display">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Industries We Serve Section on Services Page */}
        <div className="space-y-6 pt-10 border-t border-slate-900">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-500">Industry Tailored Production</span>
            <h2 className="text-2xl font-bold text-white font-display">Sectors We Optimize For</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              We focus on niches where visual engagement drives local trade growth. Here is exactly what we can produce for your sector:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((ind) => {
              const IconComp = ind.icon;
              return (
                <div key={ind.id} className="p-5 rounded-xl border border-slate-900/85 bg-slate-950/20 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                        <IconComp className="h-4.5 w-4.5" />
                      </div>
                      <h4 className="text-sm font-bold text-white font-display">{ind.name}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{ind.desc}</p>
                    <div className="text-[10px] text-slate-500 bg-slate-950/40 p-2.5 rounded border border-slate-900 leading-relaxed">
                      <span className="text-blue-400 font-semibold block uppercase tracking-wider text-[8px] mb-0.5">Campaign Direction:</span>
                      {ind.adText}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectNiche(ind.name)}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-[11px] font-semibold text-white rounded cursor-pointer text-center transition-colors"
                    >
                      Request an Ad
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLightboxVideo({
                          videoUrl: ind.id === "home_improvement" ? "/demos/oakline-renovations-8s.mp4.mp4" : ind.id === "real_estate" ? "/demos/northstar-property-8s.mp4" : "/demos/harbour-smile-clinic-8s.mp4.mp4",
                          title: ind.demoTitle,
                          niche: ind.name,
                          posterUrl: ind.id === "home_improvement" ? "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600&auto=format&fit=crop" : ind.id === "real_estate" ? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop" : "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=600&auto=format&fit=crop"
                        });
                      }}
                      className="px-2.5 py-2 bg-slate-900 hover:bg-slate-850 text-[11px] font-semibold text-slate-300 rounded border border-slate-800 cursor-pointer transition-colors flex items-center justify-center gap-1"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      Watch Demo
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Essential AI Sourcing Disclosure */}
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40 flex items-start gap-4">
          <HelpCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="space-y-1.5 text-xs text-slate-400">
            <span className="font-semibold text-slate-200 block uppercase tracking-wider text-[10px]">AI Production Transparency Policy</span>
            <p className="leading-relaxed">
              At SULFS, AI is strictly utilized as a production tool to assist with high-definition rendering, storyboard mockups, and layout pacing. All final creative deliverables are manually checked, color-stabilised, and edited by our professional remote crew in India before delivery. We do not deliver raw, distorted, or unbranded AI outputs.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderPortfolio = () => {
    // Filtered ads
    const filteredAds = selectedCategory === "all" 
      ? portfolioAds 
      : portfolioAds.filter(ad => ad.niche === selectedCategory);

    return (
      <div className="max-w-5xl mx-auto py-8 space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-500">Client Showroom</span>
            <h1 className="text-3xl font-extrabold text-white font-display">SULFS Demo Advertisements</h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Play our bespoke, high-conversion concept adverts designed for premium UK businesses. All ads utilize custom pacing and high-definition visual assets.
            </p>
          </div>

          {/* Category Selectors */}
          <div className="flex flex-wrap gap-1.5 border border-slate-900 bg-slate-950/40 p-1.5 rounded-lg">
            {[
              { id: "all", label: "All Works" },
              { id: "Home Improvement", label: "Home Improvement" },
              { id: "Real Estate", label: "Real Estate" },
              { id: "Dental & Aesthetic Clinics", label: "Dental & Aesthetics" }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  selectedCategory === cat.id 
                    ? "bg-blue-600 text-white" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
          {filteredAds.map((ad) => (
            <div key={ad.id} className="bg-slate-950/30 border border-slate-900 rounded-2xl overflow-hidden hover:border-slate-850 transition-all flex flex-col justify-between p-5 space-y-5">
              
              {/* Custom Video Player with onClick handler */}
              <DemoVideoPlayer 
                videoUrl={ad.videoUrl} 
                title={ad.title} 
                niche={ad.niche} 
                id={`port-${ad.id}`} 
                posterUrl={ad.posterUrl}
                isFallback={ad.isFallback}
                fallbackReason={ad.fallbackReason}
                onClick={() => {
                  setSelectedLightboxVideo({
                    videoUrl: ad.videoUrl,
                    title: ad.demoTitle,
                    niche: ad.niche,
                    posterUrl: ad.posterUrl
                  });
                }}
              />

              {/* Informational Details */}
              <div className="flex flex-col justify-between flex-1 space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-blue-500 tracking-wider uppercase">
                    {ad.niche}
                  </span>
                  <h3 className="text-base font-bold text-white font-display leading-snug">{ad.demoTitle}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{ad.description}</p>
                </div>

                <div className="space-y-4 pt-3 border-t border-slate-900">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLightboxVideo({
                          videoUrl: ad.videoUrl,
                          title: ad.demoTitle,
                          niche: ad.niche,
                          posterUrl: ad.posterUrl
                        });
                      }}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-lg cursor-pointer text-center transition-colors shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      Watch Demo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectNiche(ad.niche, ad.demoTitle)}
                      className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-slate-200 rounded-lg cursor-pointer text-center transition-colors active:scale-95"
                    >
                      Enquire Now
                    </button>
                  </div>

                  {/* Fictional-demo disclosure */}
                  <p className="text-[9px] text-slate-500 italic text-center leading-normal">
                    Concept Demonstration — Not a commissioned client campaign.
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPricing = () => {
    return (
      <div className="max-w-6xl mx-auto py-8 space-y-12 animate-fade-in">
        <div className="space-y-4 text-center max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-500">Introductory Pricing</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">Affordable UK Ad Packages</h1>
          <p className="text-slate-400 text-xs">
            GBP-based flat rates tailored for solo individual contractors and local brands. No agency margins, hidden setup fees, or binding monthly commitments.
          </p>
          <div className="inline-block p-4 rounded-xl border border-amber-500/15 bg-amber-500/5 text-xs text-amber-300 leading-relaxed max-w-xl mx-auto space-y-1.5 text-left">
            <p>
              <strong>Indicative testing-preview pricing — final pricing will be confirmed before any future commercial order.</strong>
            </p>
            <p className="text-[11px] text-slate-400">
              Note: Advertising budget, active campaign management, pixel installations, and guaranteed performance results are strictly not included.
            </p>
          </div>
        </div>

        {/* Pricing Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {pricingTiers.map((tier) => (
            <div 
              key={tier.id} 
              className={`p-6 rounded-2xl border flex flex-col justify-between relative ${
                tier.badge 
                  ? "border-blue-500/40 bg-slate-950/40 shadow-xl shadow-blue-500/5" 
                  : "border-slate-900 bg-slate-950/10"
              }`}
            >
              {tier.badge && (
                <span className="absolute top-4 right-4 bg-blue-600 text-[9px] font-extrabold uppercase tracking-widest text-white px-2.5 py-1 rounded-full">
                  {tier.badge}
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-500 tracking-wider uppercase block mb-1">{tier.id} package</span>
                  <h3 className="text-lg font-bold text-slate-100 font-display">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-extrabold text-white">£{tier.price}</span>
                    <span className="text-xs text-slate-500">/ {tier.duration}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{tier.description}</p>
                </div>

                {/* Features list */}
                <ul className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-slate-900/60">
                  {tier.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleSelectPackage(tier.id)}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    tier.badge 
                      ? "bg-blue-600 hover:bg-blue-500 text-white" 
                      : "bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800"
                  }`}
                >
                  Select & Enquire
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Included vs Excluded Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-900">
          <div className="p-6 rounded-2xl border border-slate-900 bg-emerald-500/[0.02] space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <Check className="h-5 w-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider font-display">What is Included</h3>
            </div>
            <p className="text-xs text-slate-400">Every package comes standard with the following core remote production services:</p>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-semibold">•</span>
                <span><strong>Concept Development:</strong> Structuring engaging storylines tailored to your specific trade.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-semibold">•</span>
                <span><strong>Creative Copywriting:</strong> Crafting hook lines and high-impact ad scripts suited for UK audiences.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-semibold">•</span>
                <span><strong>Video Compilation:</strong> Curating license-cleared royalty-free background assets or editing client-supplied smartphone clips.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-semibold">•</span>
                <span><strong>Typography Subtitles:</strong> Hardcoded on-screen captions to capture silent mobile feeds.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-semibold">•</span>
                <span><strong>Professional Voiceovers:</strong> Synthesized or remote-recorded audio narration.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-semibold">•</span>
                <span><strong>Commercial Licensing:</strong> Full rights to use your final delivered video asset in paid promotions.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl border border-slate-900 bg-red-500/[0.02] space-y-4">
            <div className="flex items-center gap-2 text-red-400">
              <X className="h-4.5 w-4.5" />
              <h3 className="text-sm font-bold uppercase tracking-wider font-display">What is Excluded</h3>
            </div>
            <p className="text-xs text-slate-400">We keep our prices flat and affordable by explicitly excluding active campaign operations:</p>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-semibold">•</span>
                <span><strong>Ad Platform Spend:</strong> All active promotion budget is paid directly by you to Meta, TikTok, or Google.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-semibold">•</span>
                <span><strong>Active Campaign Management:</strong> SULFS does not configure, run, monitor, or optimize live ad delivery bids.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-semibold">•</span>
                <span><strong>Pixel Setup & Web Tracking:</strong> Setting up analytics code, tracking tags, or pixel triggers is your responsibility.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-semibold">•</span>
                <span><strong>UK On-Site Camera Crew:</strong> We operate purely as a remote digital agency. No local videographer visits or in-person photography are included.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Essential Disclosures Notice */}
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200">Legal Disclosures & Introductory Pricing Terms</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All prices listed above are <strong>introductory estimates</strong>. Final custom quotes are provided following review of your brief and depend entirely on project layout complexity.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            SULFS Creative Studio focuses strictly on digital assets production. <strong>We do not promise or guarantee performance results</strong>, organic reach, social media engagement levels, monthly trade leads volumes, or specific revenue outcomes. All active ad platform configurations and daily spends remain the sole responsibility of the client.
          </p>
        </div>

      </div>
    );
  };

  const renderAbout = () => {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-8">
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-500">About SULFS</span>
          <h1 className="text-3xl font-extrabold text-white font-display">Smart User-Led Film Studio</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            SULFS operates at the intersection of generative technology and professional agency craftsmanship. We help small and medium-sized contractors communicate their trades with high-end, visual impact without thousands of pounds in commercial production fees.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40 space-y-4">
          <h3 className="text-sm font-bold text-white font-display">Our Focus & Location Policy</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            SULFS operates remotely from India, delivering services directly to bathroom renovators, kitchen fitters, landscapers, and domestic contractors across the United Kingdom.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Operating remotely allows us to maintain extremely competitive rates, fast turnarounds, and robust remote project management systems. We work remotely via phone, email, and shared project briefs to service all UK counties seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center pt-2">
          <div className="p-5 rounded-xl border border-slate-900">
            <span className="block text-2xl font-bold text-white font-mono">India based</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block mt-1">Operational Studio</span>
          </div>
          <div className="p-5 rounded-xl border border-slate-900">
            <span className="block text-2xl font-bold text-white font-mono">UK focused</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block mt-1">Target Client Audience</span>
          </div>
        </div>
      </div>
    );
  };

  const renderContact = () => {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-8">
        <div className="space-y-3 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-500">Get a Free Quote</span>
          <h1 className="text-3xl font-extrabold text-white font-display">Request Your Free Campaign Brief</h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Fill out the details below and SULFS will compile a free structural script layout and quotation for your home-improvement campaign.
          </p>
        </div>

        {formStatus.status === "success" ? (
          <div className="p-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">Brief Submitted Successfully</h3>
              <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                {formStatus.message}
              </p>
            </div>
            <button
              onClick={() => setFormStatus({ status: "idle" })}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-xs font-semibold text-slate-300 rounded-lg border border-slate-800 cursor-pointer"
            >
              Submit Another Brief
            </button>
          </div>
        ) : (
          <form onSubmit={handleContactSubmit} className="bg-slate-950/30 border border-slate-900 rounded-2xl p-6 sm:p-8 space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="fullName">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  placeholder="e.g. David Higgins"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="businessName">
                  Business Name *
                </label>
                <input
                  type="text"
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  required
                  placeholder="e.g. Higgins Bathroom Fitters"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="email">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="e.g. david@higginsbathrooms.co.uk"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="location">
                  UK Business Location *
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  placeholder="e.g. Cheshire / Greater Manchester"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="serviceRequired">
                  Service Required *
                </label>
                <select
                  id="serviceRequired"
                  value={formData.serviceRequired}
                  onChange={(e) => setFormData({ ...formData, serviceRequired: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="AI-assisted video ad creation">AI-assisted video ad creation</option>
                  <option value="Script and storyboard development">Script & storyboard development</option>
                  <option value="Video editing and post-production">Video editing & post-production</option>
                  <option value="Multiple ad variations for social media">Multiple ad variations</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="budgetRange">
                  Project Budget / Package *
                </label>
                <select
                  id="budgetRange"
                  value={formData.budgetRange}
                  onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-blue-500 focus:outline-none font-medium"
                >
                  <option value="trial">Trial Ad Package — £59</option>
                  <option value="starter">Starter Package — £149</option>
                  <option value="growth">Growth Bundle — £349</option>
                  <option value="monthly">Monthly Partner Plan — £699</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="niche">
                  Selected Business Niche *
                </label>
                <select
                  id="niche"
                  value={formData.niche}
                  onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="Home Improvement">Home Improvement</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Dental & Aesthetic Clinics">Dental & Aesthetic Clinics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="phone">
                  Phone / WhatsApp (Optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +44 7123 456789"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="websiteUrl">
                  Website URL (Optional)
                </label>
                <input
                  type="text"
                  id="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="e.g. higginsbathrooms.co.uk"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Anti-spam invisible honeypot field */}
              <div className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden opacity-0 pointer-events-none" aria-hidden="true">
                <label htmlFor="fax_honeypot">Fax Number (Leave Blank)</label>
                <input
                  type="text"
                  id="fax_honeypot"
                  value={formData.fax_honeypot}
                  onChange={(e) => setFormData({ ...formData, fax_honeypot: e.target.value })}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="projectDescription">
                Brief / Project Description *
              </label>
              <textarea
                id="projectDescription"
                rows={4}
                value={formData.projectDescription}
                onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                required
                placeholder="Describe your trade niche and any specific builds or features you want to focus on (e.g. kitchen islands, garden timber decking)..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all leading-relaxed"
              />
            </div>

            {/* Consent check */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="consent"
                checked={formData.consent}
                onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                required
                className="mt-1 h-4 w-4 rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="consent" className="text-xs text-slate-400 leading-relaxed select-none cursor-pointer">
                I consent to allowing SULFS Creative Studio to contact me regarding my campaign brief, script outline, and project quotation. *
              </label>
            </div>

            {formStatus.status === "error" && (
              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formStatus.message}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={formStatus.status === "submitting"}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-900 disabled:text-slate-500 text-white font-semibold rounded-xl active:scale-[0.99] transition-all cursor-pointer text-center"
              >
                {formStatus.status === "submitting" ? "Sending Request to SULFS Studio..." : "Submit Campaign Enquiry Brief"}
              </button>
            </div>

          </form>
        )}
      </div>
    );
  };

  const renderAdmin = () => {
    return (
      <div className="max-w-6xl mx-auto py-8 space-y-12">
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1">
            <Cpu className="h-4 w-4" />
            AI Video Laboratory
          </span>
          <h1 className="text-3xl font-extrabold text-white font-display">Google Veo & Enquiry Command Center</h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Authorize your studio operator credentials to review incoming property developer queries and operate the real-time video compilation renderer.
          </p>
        </div>

        {/* Secure Lead Dashboard */}
        <LeadDashboard 
          authToken={adminToken} 
          onAuthenticated={(token) => setAdminToken(token)} 
        />

        {/* Show Google Veo generator only when authenticated */}
        {adminToken && (
          <div className="pt-12 border-t border-slate-900 space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white font-display">Google Veo Video ad Generator</h2>
              <p className="text-slate-400 text-sm max-w-xl">
                Operate the active Google AI video generation endpoints to render custom-branded advertisement previews.
              </p>
            </div>
            
            <VideoGenerator authToken={adminToken} />
          </div>
        )}

      </div>
    );
  };

  const renderTerms = () => {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-8 animate-fade-in">
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-500">Legal Documents</span>
          <h1 className="text-3xl font-extrabold text-white font-display">Terms & Conditions</h1>
        </div>

        <div className="p-5 rounded-2xl border border-blue-500/10 bg-blue-500/5 text-xs text-slate-400 flex items-start gap-3 leading-relaxed">
          <HelpCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <span>
            <strong>Legal Disclaimer Notice:</strong> These pages are general business information and should be reviewed by a qualified legal professional for your exact circumstances.
          </span>
        </div>

        <div className="bg-slate-950/20 border border-slate-900 rounded-2xl p-6 sm:p-8 space-y-6 text-sm text-slate-300 leading-relaxed">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white font-display">1. Remote Base of Operations</h3>
            <p>
              SULFS (Smart User-Led Film Studio) operates as an independent, individual creative consultancy. Our core operational base and studio production facilities are located remotely in India. All digital project assets are compiled, rendered, and dispatched remotely from our India-based operational studio.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-white font-display">2. Governing Jurisdiction</h3>
            <p>
              These terms, as well as any contract, brief agreement, or legal dispute arising from the provision of remote digital creative services, shall be governed by, interpreted, and enforced in accordance with the jurisdiction of India, without reference to conflict of laws principles.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-white font-display">3. Flat Rates & Bespoke Quotes</h3>
            <p>
              All GBP pricing information displayed on the SULFS platform consists of introductory baseline estimates. SULFS reserves the right to modify estimates or deliver tailored, binding quotes following a direct, thorough review of the submitted campaign brief and project complexity.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-white font-display">4. Client Responsibilities</h3>
            <p>
              The client acknowledges and agrees that SULFS is strictly an asset production studio. The client is solely and fully responsible for:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-xs text-slate-400">
              <li>Configuring and funding all active ad delivery accounts (e.g. Meta, TikTok, Google).</li>
              <li>Installing, testing, and managing required platform tracking pixels or code snippets.</li>
              <li>Compliance with local advertising standards, trade descriptions, and domestic regulations.</li>
              <li>All paid promotion budgets and live delivery bidding settings.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-white font-display">5. Performance & Results Disclaimer</h3>
            <p>
              SULFS does not act as an active campaign manager. We provide creative asset delivery only. SULFS makes no warranties, covenants, or guarantees of any kind regarding campaign performance metrics, click-through rates (CTR), monthly trade lead volumes, local contractor bookings, or specific company revenue outcomes.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderPrivacy = () => {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-8 animate-fade-in">
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-500">Legal Documents</span>
          <h1 className="text-3xl font-extrabold text-white font-display">Privacy Policy</h1>
        </div>

        <div className="p-5 rounded-2xl border border-blue-500/10 bg-blue-500/5 text-xs text-slate-400 flex items-start gap-3 leading-relaxed">
          <HelpCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <span>
            <strong>Legal Disclaimer Notice:</strong> These pages are general business information and should be reviewed by a qualified legal professional for your exact circumstances.
          </span>
        </div>

        <div className="bg-slate-950/20 border border-slate-900 rounded-2xl p-6 sm:p-8 space-y-6 text-sm text-slate-300 leading-relaxed">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white font-display">1. Information We Collect</h3>
            <p>
              We collect data that you voluntarily submit to us via our online contact, campaign brief, and enquiry forms. This information may include:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-xs text-slate-400">
              <li>Individual business names and trader descriptions.</li>
              <li>Your full name and professional title.</li>
              <li>Email addresses and voluntary phone or WhatsApp numbers.</li>
              <li>UK geographical location served by your business.</li>
              <li>Campaign objectives and target niche details.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-white font-display">2. How We Use Collected Data</h3>
            <p>
              We utilize your submitted brief information strictly for internal processing, compiling custom video ad concepts, drafting creative scripts, and emailing introductory estimations and communications.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-white font-display">3. Secure Storage & SMTP Transmission</h3>
            <p>
              All enquiry data is stored locally in our server's internal files (`/data/enquiries.json`) and dispatched securely via standard SMTP email encryption to our primary studio communication address (SulfsCreativeStudio@outlook.com).
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-white font-display">4. Non-Disclosure & Selling Prohibition</h3>
            <p>
              SULFS Creative Studio respects your privacy. We enforce a absolute policy that we do not sell, rent, lease, trade, or share your contact credentials or business details with un-affiliated third-party agencies or advertising brokers.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderRefunds = () => {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-8 animate-fade-in">
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-500">Legal Documents</span>
          <h1 className="text-3xl font-extrabold text-white font-display">Refund & Cancellation Policy</h1>
        </div>

        <div className="p-5 rounded-2xl border border-blue-500/10 bg-blue-500/5 text-xs text-slate-400 flex items-start gap-3 leading-relaxed">
          <HelpCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <span>
            <strong>Legal Disclaimer Notice:</strong> These pages are general business information and should be reviewed by a qualified legal professional for your exact circumstances.
          </span>
        </div>

        <div className="bg-slate-950/20 border border-slate-900 rounded-2xl p-6 sm:p-8 space-y-6 text-sm text-slate-300 leading-relaxed">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white font-display">1. Strictly No Refunds Policy</h3>
            <p>
              Due to the highly personalized, bespoke, and human resource-intensive nature of custom digital ad creative production, SULFS Creative Studio maintains a **strictly non-refundable policy** once script storyboarding or video compilation operations have commenced. 
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-white font-display">2. Guaranteed Revision Cycle</h3>
            <p>
              To ensure that your final delivered video ad asset is fully aligned with your business logo, custom text details, phone numbers, and local geographic niches, SULFS guarantees one-off or package-specified revision cycles (as detailed in your chosen tier). Revisions are designed to adjust visual timing, typographic details, and caption overlays.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-white font-display">3. Deposit & Retainer Structure</h3>
            <p>
              For bespoke, custom campaigns outside our pre-packaged flat rate tiers, a **50% upfront retainer deposit** is required before script draft and concept sourcing begins. The remaining **50% final balance is due immediately** upon video draft approval, and must be settled in full prior to the export and remote delivery of finalized, un-watermarked high-definition MP4 files.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const handleGetQuoteClick = () => {
    setActivePage("contact");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#030712] text-slate-100">
      
      {/* Testing & Preview Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 border-b border-blue-500/20 px-4 py-3 text-center relative z-50 animate-fade-in">
        <p className="text-[11px] sm:text-xs text-slate-300 font-medium tracking-wide flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 max-w-5xl mx-auto">
          <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
            Testing Preview
          </span>
          <span className="leading-relaxed">
            SULFS Creative Studio is currently showcasing its services and portfolio. Online payments and commercial bookings will be added in a future version.
          </span>
        </p>
      </div>

      {/* Header bar */}
      <Header 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onGetQuoteClick={handleGetQuoteClick} 
      />

      {/* Main Canvas view */}
      <main className="flex-grow px-6 lg:px-8 py-10 max-w-7xl mx-auto w-full">
        {activePage === "home" && renderHome()}
        {activePage === "services" && renderServices()}
        {activePage === "portfolio" && renderPortfolio()}
        {activePage === "pricing" && renderPricing()}
        {activePage === "about" && renderAbout()}
        {activePage === "contact" && renderContact()}
        {activePage === "admin" && renderAdmin()}
        {activePage === "terms" && renderTerms()}
        {activePage === "privacy" && renderPrivacy()}
        {activePage === "refunds" && renderRefunds()}
        {activePage === "client-portal" && clientIdParam && (
          <ClientPortal enquiryId={clientIdParam} />
        )}
      </main>

      {/* Professional Video Lightbox Modal */}
      {selectedLightboxVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md transition-all duration-300 animate-fade-in"
          onClick={() => setSelectedLightboxVideo(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/10 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/40">
              <div>
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest block mb-0.5">
                  {selectedLightboxVideo.niche}
                </span>
                <h3 className="text-sm font-extrabold text-white font-display">
                  {selectedLightboxVideo.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLightboxVideo(null)}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-850 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Video Container in 16:9 Aspect Ratio */}
            <div className="relative aspect-[16/9] w-full bg-slate-950">
              <DemoVideoPlayer
                videoUrl={selectedLightboxVideo.videoUrl}
                title={selectedLightboxVideo.title}
                niche={selectedLightboxVideo.niche}
                id="modal-lightbox-player"
                posterUrl={selectedLightboxVideo.posterUrl}
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer bar */}
      <Footer setActivePage={setActivePage} />

    </div>
  );
}
