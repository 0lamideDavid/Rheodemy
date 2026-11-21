"use client";

import { useState, useRef } from 'react';
import { UploadCloud, Video, ArrowLeft, FileText, Headphones, HelpCircle, DollarSign, Target, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const formats = [
  { id: 'video', label: 'Video Course', icon: Video, desc: 'MP4, MOV up to 5GB', recommendedRate: "0.12" },
  { id: 'pdf', label: 'Ebook / PDF', icon: FileText, desc: 'PDF, EPUB up to 100MB', recommendedRate: "0.05" },
  { id: 'audio', label: 'Audio / Podcast', icon: Headphones, desc: 'MP3, WAV up to 500MB', recommendedRate: "0.02" },
  { id: 'quiz', label: 'Quiz / Assessment', icon: HelpCircle, desc: 'Interactive Q&A Builder', recommendedRate: "0.00" },
];

export default function UploadCourse() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFormat, setSelectedFormat] = useState('video');
  const [isPublishing, setIsPublishing] = useState(false);
  const [fileName, setFileName] = useState("");
  
  // Form State - stored as strings so trailing decimals/zeroes aren't stripped while typing
  const [rate, setRate] = useState("0.12");
  const [cap, setCap] = useState("20.00");

  const handleFormatSelect = (formatId: string) => {
    setSelectedFormat(formatId);
    setFileName(""); // reset file when format changes
    const format = formats.find(f => f.id === formatId);
    if (format) {
      setRate(format.recommendedRate);
      if (format.id === 'quiz') setCap("0");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handlePublish = () => {
    setIsPublishing(true);
    // Simulate upload and processing time
    setTimeout(() => {
      router.push('/dashboard/creator');
    }, 2000);
  };

  const activeFormat = formats.find(f => f.id === selectedFormat);
  const parsedCap = parseFloat(cap || "0");

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/creator" className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Content</h1>
          <p className="text-muted text-sm mt-1">Upload and monetize any learning format.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Format & Upload */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Format Selection */}
          <div className="glass p-6 sm:p-8 rounded-2xl space-y-6">
            <h2 className="text-xl font-bold">1. Select Format</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formats.map((format) => {
                const Icon = format.icon;
                const isActive = selectedFormat === format.id;
                return (
                  <button
                    key={format.id}
                    onClick={() => handleFormatSelect(format.id)}
                    className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                      isActive 
                        ? 'bg-primary/5 border-primary/50 shadow-[0_0_15px_rgba(0,212,200,0.1)]' 
                        : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className={`p-3 rounded-lg ${isActive ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isActive ? 'text-foreground' : 'text-foreground/80'}`}>
                        {format.label}
                      </h3>
                      <p className="text-xs text-muted mt-1">{format.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload Zone */}
          <div 
            onClick={handleUploadClick}
            className="glass p-8 rounded-2xl space-y-6 border-dashed border-2 border-primary/30 hover:border-primary/60 transition-colors cursor-pointer group"
          >
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange} 
                accept={activeFormat?.id === 'video' ? 'video/*' : activeFormat?.id === 'pdf' ? '.pdf,.epub' : activeFormat?.id === 'audio' ? 'audio/*' : '*'} 
              />
              <div className="p-5 bg-primary/10 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-10 h-10 text-primary" />
              </div>
              
              {fileName ? (
                <>
                  <h2 className="text-xl font-bold mb-2 text-primary">{fileName}</h2>
                  <p className="text-muted mb-6 max-w-md">File ready for upload</p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-2">Drag and drop your {activeFormat?.label.split(' ')[0].toLowerCase()} here</h2>
                  <p className="text-muted mb-6 max-w-md">{activeFormat?.desc}</p>
                </>
              )}
              
              <button className="bg-primary/20 text-primary px-6 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 group-hover:bg-primary/30 transition-colors">
                {fileName ? "Change File" : "Select File"}
              </button>
            </div>
          </div>
          
        </div>

        {/* Right Column: Metadata & Monetization */}
        <div className="space-y-8">
          
          <div className="glass p-6 sm:p-8 rounded-2xl space-y-5">
            <h2 className="text-xl font-bold">2. Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Title</label>
              <input type="text" className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm" placeholder="e.g. Masterclass in TypeScript" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Description</label>
              <textarea className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 h-24 focus:outline-none focus:border-primary transition-colors text-sm" placeholder="What will students learn?"></textarea>
            </div>
          </div>

          <div className="glass p-6 sm:p-8 rounded-2xl space-y-5">
            <h2 className="text-xl font-bold">3. Monetization</h2>
            
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-1">
              <p className="text-sm font-medium text-primary flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Pay-as-you-learn active
              </p>
              <p className="text-xs text-muted">Learners are billed by the minute while actively engaged.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-2">Streaming Rate ($ / min)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">$</span>
                <input 
                  type="text" 
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  disabled={selectedFormat === 'quiz'}
                  className="w-full bg-background border border-white/10 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-primary transition-colors disabled:opacity-50" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-2">Maximum Price Cap ($)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">$</span>
                <input 
                  type="text" 
                  value={cap}
                  onChange={(e) => setCap(e.target.value)}
                  disabled={selectedFormat === 'quiz'}
                  className="w-full bg-background border border-white/10 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-primary transition-colors disabled:opacity-50" 
                />
              </div>
              <p className="text-xs text-muted mt-2 flex gap-1.5 items-start">
                <Target className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                <span>Once a learner spends ${isNaN(parsedCap) ? "0.00" : parsedCap.toFixed(2)}, streaming stops and they permanently unlock this content.</span>
              </p>
            </div>
          </div>

          <button 
            onClick={handlePublish}
            disabled={isPublishing}
            className="w-full bg-foreground text-background px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-xl shadow-white/5 disabled:opacity-70"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Publishing to Rheodemy...
              </>
            ) : (
              'Publish Content'
            )}
          </button>

        </div>
      </div>
    </div>
  );
}
