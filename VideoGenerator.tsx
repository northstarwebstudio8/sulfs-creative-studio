import React, { useState, useEffect } from "react";
import { Sparkles, Play, RotateCcw, AlertTriangle, Cpu, CheckCircle, Video, Info } from "lucide-react";
import { VideoGenerationParams, GenerationStatus } from "../types";

interface VideoGeneratorProps {
  authToken: string | null;
}

export default function VideoGenerator({ authToken }: VideoGeneratorProps) {
  const [params, setParams] = useState<VideoGenerationParams>({
    businessType: "Home Improvement",
    adObjective: "Lead Generation",
    videoPrompt: "Create a premium 15-second vertical advertisement for Oakline Reno, a high-end UK kitchen renovation company. Show a tasteful kitchen transformation, elegant shaker cabinets, detailed quartz craftsmanship, clean cinematic camera movement, and a final call to action: Claim Free Design. Do not show fake testimonials, invented claims, or misleading results.",
    aspectRatio: "9:16",
    resolution: "720p",
    visualStyle: "Cinematic Modern",
    ctaText: "Claim Free Design"
  });

  const [status, setStatus] = useState<GenerationStatus>({ status: "idle" });
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isSimulatedRun, setIsSimulatedRun] = useState(false);

  // Clear polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [pollingInterval]);

  const loadHomeImprovementPrompt = () => {
    setParams({
      ...params,
      videoPrompt: "Create a premium 15-second vertical advertisement for Oakline Reno, a high-end UK kitchen renovation company. Show a tasteful kitchen transformation, elegant shaker cabinets, detailed quartz craftsmanship, clean cinematic camera movement, and a final call to action: Claim Free Design. Do not show fake testimonials, invented claims, or misleading results.",
      businessType: "Home Improvement",
      ctaText: "Claim Free Design"
    });
  };

  const loadRealEstatePrompt = () => {
    setParams({
      ...params,
      videoPrompt: "Create a luxurious 15-second portrait ad for Northstar Property, showcasing a modern UK penthouse apartment. Focus on open-plan layout, panoramic city views, high-end marble worktops, and perfect warm lighting. Final text overlay: Book Private Viewing.",
      businessType: "Real Estate",
      ctaText: "Book Private Viewing"
    });
  };

  const loadDentalPrompt = () => {
    setParams({
      ...params,
      videoPrompt: "Create a reassuring 15-second video ad for Harbour Smile Clinic, a premium dental & aesthetic clinic. Capture a clean clinic lobby, state-of-the-art scanning suite, friendly dental professionals, and a beautiful final smiling portrait. Final text overlay: Book Consultation.",
      businessType: "Dental & Aesthetic Clinics",
      ctaText: "Book Consultation"
    });
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status.status === "generating" || status.status === "polling") return;

    setStatus({ status: "validating", progressMessage: "Validating prompt parameters..." });
    setProgressPercent(5);
    setIsSimulatedRun(false);

    try {
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ params }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation endpoint returned a bad response.");
      }

      const opName = data.operationName;
      const isSim = !!data.isSimulated;
      setIsSimulatedRun(isSim);

      setStatus({
        status: "polling",
        operationName: opName,
        progressMessage: isSim 
          ? "API Key not configured. Initiating premium SULFS demonstration video fallback..." 
          : "Google Veo Operation launched. Requesting video-generation queue...",
      });

      // Poll status every 3 seconds
      const interval = setInterval(() => {
        pollStatus(opName, isSim);
      }, 3000);

      setPollingInterval(interval);

    } catch (err: any) {
      setStatus({
        status: "error",
        errorDetails: err.message || "Failed to reach generation API. Ensure server is online."
      });
    }
  };

  const pollStatus = async (opName: string, isSim: boolean) => {
    try {
      const response = await fetch("/api/video-status", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ operationName: opName }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed polling status.");
      }

      if (data.done) {
        // Clear interval
        if (pollingInterval) clearInterval(pollingInterval);
        
        // Success
        setStatus({
          status: "success",
          videoUrl: data.videoUrl || data.downloadUrl,
          progressMessage: "Video successfully processed and rendered."
        });
        setProgressPercent(100);
      } else {
        // Update progress if provided
        if (data.progress !== undefined) {
          setProgressPercent(data.progress);
        } else {
          // Slowly tick up progress to keep user relaxed
          setProgressPercent(prev => Math.min(prev + 2, 98));
        }
        
        setStatus(prev => ({
          ...prev,
          progressMessage: data.progressMessage || "Google Veo is model-rendering your video layers..."
        }));
      }
    } catch (err: any) {
      if (pollingInterval) clearInterval(pollingInterval);
      setStatus({
        status: "error",
        errorDetails: err.message || "Lost connection with Veo polling service."
      });
    }
  };

  const handleReset = () => {
    if (pollingInterval) clearInterval(pollingInterval);
    setStatus({ status: "idle" });
    setProgressPercent(0);
    setIsSimulatedRun(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Parameter Form Panel */}
      <div className="lg:col-span-7 bg-slate-950/30 border border-slate-900 rounded-2xl p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <h3 className="text-xl font-bold text-white font-display">Veo Studio Director</h3>
        </div>
        
        <p className="text-xs text-slate-400 leading-relaxed">
          Configure prompt elements to initiate Google Veo generation. The server coordinates prompt orchestration, rate limiting, and streams the compiled frames.
        </p>

        {/* Quick Sample Prompts */}
        <div className="space-y-1.5">
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quick Preset Prompts</span>
          <div className="flex flex-wrap gap-2">
            <button 
              type="button" 
              onClick={loadHomeImprovementPrompt}
              className="px-2.5 py-1 text-xs rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-blue-500/40 cursor-pointer"
            >
              Home Improvement
            </button>
            <button 
              type="button" 
              onClick={loadRealEstatePrompt}
              className="px-2.5 py-1 text-xs rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-blue-500/40 cursor-pointer"
            >
              Real Estate
            </button>
            <button 
              type="button" 
              onClick={loadDentalPrompt}
              className="px-2.5 py-1 text-xs rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-blue-500/40 cursor-pointer"
            >
              Dental & Aesthetics
            </button>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Business Category</label>
              <select
                value={params.businessType}
                onChange={(e) => setParams({...params, businessType: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-blue-500"
              >
                <option value="Home Improvement">Home Improvement</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Dental & Aesthetic Clinics">Dental & Aesthetic Clinics</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Campaign Objective</label>
              <select
                value={params.adObjective}
                onChange={(e) => setParams({...params, adObjective: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-blue-500"
              >
                <option value="Lead Generation">Lead Generation (Quotes)</option>
                <option value="Brand Awareness">Brand Awareness</option>
                <option value="Before / After Portfolio">Before / After Showcase</option>
                <option value="Bespoke Craftsmanship Focus">Bespoke Craftsmanship</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 font-display">Generation Prompt</label>
            <textarea
              rows={4}
              value={params.videoPrompt}
              onChange={(e) => setParams({...params, videoPrompt: e.target.value})}
              required
              placeholder="Describe the scenes, camera angles, materials, and lighting..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Aspect Ratio</label>
              <select
                value={params.aspectRatio}
                onChange={(e) => setParams({...params, aspectRatio: e.target.value as "16:9" | "9:16"})}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-blue-500"
              >
                <option value="9:16">9:16 (Social Stories / Vertical)</option>
                <option value="16:9">16:9 (Landscape / Website)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Max Resolution</label>
              <select
                value={params.resolution}
                onChange={(e) => setParams({...params, resolution: e.target.value as "720p" | "1080p"})}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-blue-500"
              >
                <option value="720p">720p (High-Definition)</option>
                <option value="1080p">1080p (Full-HD Veo)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Creative Style</label>
              <input
                type="text"
                value={params.visualStyle}
                onChange={(e) => setParams({...params, visualStyle: e.target.value})}
                placeholder="Cinematic Modern"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Button Text / CTA Overlay</label>
            <input
              type="text"
              value={params.ctaText}
              onChange={(e) => setParams({...params, ctaText: e.target.value})}
              placeholder="e.g. Request a Free Quote"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-blue-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={status.status === "generating" || status.status === "polling" || status.status === "validating"}
              className="w-full py-4.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-900 disabled:text-slate-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10 cursor-pointer active:scale-[0.99] transition-all"
            >
              <Video className="h-4.5 w-4.5" />
              {status.status === "validating" ? "Validating Parameters..." : 
               status.status === "polling" ? "Rendering AI Frame Sequences..." : 
               "Generate Google Veo Advertisement"}
            </button>
          </div>

        </form>
      </div>

      {/* Generation Status & Preview Monitor */}
      <div className="lg:col-span-5 flex flex-col h-full min-h-[480px]">
        <div className="flex-1 bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden flex flex-col">
          
          {/* Monitor Header */}
          <div className="px-6 py-4 border-b border-slate-900 bg-slate-950/40 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-blue-500" />
              SULFS Rendering Terminal
            </span>
            {isSimulatedRun && (
              <span className="text-[10px] font-bold text-yellow-400 bg-yellow-500/5 border border-yellow-500/15 px-2 py-0.5 rounded">
                DEMO FALLBACK
              </span>
            )}
          </div>

          {/* Monitor Display */}
          <div className="flex-1 p-6 flex flex-col items-center justify-center bg-slate-950 text-center relative min-h-[300px]">
            
            {status.status === "idle" && (
              <div className="space-y-3 p-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-slate-500">
                  <Video className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-semibold text-white">No Active Generation</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Describe your campaign parameters and trigger the Veo generation pipeline to render files.
                </p>
              </div>
            )}

            {(status.status === "validating" || status.status === "polling") && (
              <div className="w-full space-y-6 px-4">
                
                {/* Loader Graphics */}
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500/10 border-t-blue-500 animate-spin"></div>
                  <Sparkles className="h-6 w-6 text-blue-400 animate-pulse" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">
                    Rendering Progress: {progressPercent}%
                  </span>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto italic">
                    "{status.progressMessage}"
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-xs mx-auto bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800/80">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {status.operationName && (
                  <div className="text-[10px] font-mono text-slate-500 truncate max-w-xs mx-auto">
                    ID: {status.operationName}
                  </div>
                )}
              </div>
            )}

            {status.status === "error" && (
              <div className="space-y-4 p-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/5 border border-red-500/15 text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Generation Hold</h4>
                  <p className="text-xs text-red-400/80 max-w-xs mx-auto mt-1 leading-relaxed">
                    {status.errorDetails}
                  </p>
                </div>
                
                <div className="border border-slate-900 bg-slate-950/40 p-3 rounded-lg text-left space-y-1.5 max-w-xs mx-auto">
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    How to solve this?
                  </span>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    This typically occurs when your Google Gemini/Veo quota is exhausted or if the server's API key is unconfigured.
                  </p>
                </div>

                <div className="flex justify-center gap-2">
                  <button 
                    onClick={handleReset}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white rounded-lg border border-slate-800 cursor-pointer"
                  >
                    Clear Terminal
                  </button>
                </div>
              </div>
            )}

            {status.status === "success" && status.videoUrl && (
              <div className="w-full h-full flex flex-col justify-between p-2">
                
                {/* Rendered Playback view */}
                <div className="relative aspect-[9/16] max-h-[380px] w-auto mx-auto rounded-xl overflow-hidden bg-black border border-slate-900 shadow-xl flex items-center justify-center">
                  <video 
                    src={status.videoUrl} 
                    controls 
                    autoPlay 
                    loop 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Floating CTA Overlay demo */}
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 backdrop-blur-sm border border-slate-800/80 p-2.5 rounded-lg flex items-center justify-between text-left">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">PROPOSED CALL-TO-ACTION</span>
                      <span className="text-[11px] font-bold text-white font-display">{params.ctaText}</span>
                    </div>
                    <span className="bg-blue-600 text-[10px] font-semibold text-white px-2.5 py-1 rounded">
                      GO
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-xs font-semibold">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Ad Compiled Successfully
                  </div>
                  
                  {isSimulatedRun && (
                    <p className="text-[10px] text-yellow-400/80 max-w-xs mx-auto italic">
                      "AI-generated demonstration — fallback model loaded successfully."
                    </p>
                  )}

                  <div className="flex justify-center gap-2 pt-2">
                    <button 
                      onClick={handleReset}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white rounded-lg border border-slate-800 flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Create New Ad
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}
