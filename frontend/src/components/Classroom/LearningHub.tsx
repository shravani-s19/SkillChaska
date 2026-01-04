import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Brain,
  Lightbulb,
  Download,
  GitGraph,
  Layers,
  Link as LinkIcon,
  FileCode,
  FileArchive,
} from "lucide-react";
import { jsPDF } from "jspdf";
import ReactMarkdown from "react-markdown";

import { cn } from "../../lib/utils";
import { useProgressStore } from "../../store/useProgressStore";
import { learnService } from "../../services/learn.service";
import {
  ModuleMaterialsResponse,
  MindMapNode as MindMapNodeType,
  Flashcard as FlashcardType,
} from "../../types";

// --- Constants & Styles ---

const TABS = [
  { id: "notes", label: "Smart Notes", icon: FileText },
  { id: "revision", label: "AI Revision", icon: Brain },
  { id: "resources", label: "Resources", icon: Lightbulb },
];

const CARD_THEMES = [
  "from-blue-500/20 to-purple-500/20 border-blue-500/30 text-blue-100",
  "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-100",
  "from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-100",
  "from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-100",
  "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-100",
];

// --- Helpers ---

const getIconForType = (type: string) => {
  switch (type) {
    case "pdf": return FileText;
    case "code": return FileCode;
    case "zip": return FileArchive;
    case "link": return LinkIcon;
    default: return FileText;
  }
};

// --- Components ---

const FlashCard = ({ card, index }: { card: FlashcardType; index: number }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Pick a theme based on index so it stays consistent across renders
  const theme = CARD_THEMES[index % CARD_THEMES.length];

  return (
    <div
      className="group perspective-1000 h-64 cursor-pointer w-full"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        className="relative w-full h-full preserve-3d"
      >
        {/* Front */}
        <div className={cn(
          "absolute inset-0 backface-hidden rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg border backdrop-blur-sm bg-gradient-to-br transition-all",
          theme
        )}>
          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mb-4">
            <span className="font-bold text-lg">?</span>
          </div>
          <div className="prose prose-invert prose-sm max-w-none line-clamp-4 select-none">
             <ReactMarkdown>{card.front_text}</ReactMarkdown>
          </div>
          <p className="text-[10px] opacity-60 mt-auto pt-4 uppercase tracking-wider font-bold">Tap to reveal</p>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg overflow-y-auto custom-scrollbar">
          <div className="prose prose-invert prose-sm max-w-none text-left w-full text-textSecondary">
            <ReactMarkdown>{card.back_text}</ReactMarkdown>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Improved CSS-based Tree for Mind Map
const MindMapNode = ({ node, depth = 0 }: { node: MindMapNodeType; depth?: number }) => {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "px-4 py-2.5 rounded-xl border font-bold text-sm relative z-10 transition-all hover:scale-105 mx-2 whitespace-nowrap",
          depth === 0
            ? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/20 text-base"
            : depth === 1
            ? "bg-surface border-white/20 text-text shadow-md"
            : "bg-white/5 border-white/10 text-textSecondary text-xs"
        )}
      >
        {node.label}
      </div>
      
      {/* Recursion & Lines */}
      {hasChildren && (
        <div className="flex pt-6 relative">
           {/* Vertical line from parent to children-container */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 bg-white/20" />
           
          {node.children!.map((child, index) => (
            <div key={child.id} className="flex flex-col items-center relative px-2">
              {/* Horizontal Connector Lines */}
              {/* Left Line: Display on all except first child */}
              {index > 0 && (
                <div className="absolute top-0 left-0 w-1/2 h-px bg-white/20 -translate-y-px" />
              )}
              {/* Right Line: Display on all except last child */}
              {index < node.children!.length - 1 && (
                <div className="absolute top-0 right-0 w-1/2 h-px bg-white/20 -translate-y-px" />
              )}
              {/* Vertical Connector to child node */}
              <div className="w-px h-6 bg-white/20 -mt-6 mb-0" />
              
              <MindMapNode node={child} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const LearningHub = () => {
  const [activeTab, setActiveTab] = useState("notes");
  const [revisionMode, setRevisionMode] = useState<"flashcards" | "mindmap">("mindmap");
  const [materials, setMaterials] = useState<ModuleMaterialsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { activeCourseId, activeModuleId } = useProgressStore();

  useEffect(() => {
    if (activeCourseId && activeModuleId) {
      const fetchMaterials = async () => {
        setIsLoading(true);
        try {
          const data = await learnService.getModuleMaterials(activeCourseId, activeModuleId);
          setMaterials(data);
        } catch (error) {
          console.error("Failed to load learning materials", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchMaterials();
    }
  }, [activeCourseId, activeModuleId]);

  const handleExportPDF = () => {
    if (!materials?.ai_smart_notes) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxLineWidth = pageWidth - margin * 2;
    let yPos = 20;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("Smart Notes", margin, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, yPos);
    yPos += 15;

    // Content
    materials.ai_smart_notes.forEach((note) => {
      // Time/Label
      doc.setFontSize(10);
      doc.setTextColor(0, 102, 204); // Secondary blue-ish
      doc.setFont("helvetica", "bold");
      doc.text(`[${note.formatted_time}]`, margin, yPos);
      yPos += 7;

      // Note Body
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "normal");
      
      // Split text to fit width
      const splitText = doc.splitTextToSize(note.note_text, maxLineWidth);
      doc.text(splitText, margin, yPos);
      
      // Calculate new Y position
      yPos += (splitText.length * 7) + 10; // Line height + spacing

      // Add new page if needed
      if (yPos >= doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        yPos = 20;
      }
    });

    doc.save(`module-notes-${activeModuleId}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="mt-8 bg-surface border border-border rounded-3xl h-[600px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-textSecondary font-medium">Synthesizing AI Materials...</p>
        </div>
      </div>
    );
  }

  if (!materials) {
    return (
      <div className="mt-8 bg-surface border border-border rounded-3xl h-[600px] flex items-center justify-center">
        <p className="text-textSecondary">Select a module to load materials.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-surface border border-border rounded-3xl overflow-hidden flex flex-col h-[600px]">
      {/* Tab Navigation */}
      <div className="flex border-b border-white/10 shrink-0 bg-white/5 backdrop-blur-md">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-5 text-sm font-bold transition-all relative",
              activeTab === tab.id ? "text-white" : "text-textSecondary hover:text-white"
            )}
          >
            <tab.icon className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="hub-tab-active"
                className="absolute inset-0 border-b-2 border-secondary bg-white/5"
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 overflow-y-auto p-8 custom-scrollbar">
          
          {/* --- NOTES TAB --- */}
          {activeTab === "notes" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between sticky top-0 bg-surface/95 backdrop-blur z-20 pb-4 border-b border-white/5">
                <h4 className="font-bold text-lg">Auto-Generated Notes</h4>
                <button 
                  onClick={handleExportPDF}
                  className="px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary text-xs font-bold flex items-center gap-2 hover:bg-secondary/20 transition-colors"
                >
                  <Download className="w-3 h-3" /> Export PDF
                </button>
              </div>
              <div className="space-y-4">
                {materials.ai_smart_notes.length > 0 ? (
                  materials.ai_smart_notes.map((note) => (
                    <div
                      key={note.note_id}
                      className="flex gap-4 group p-4 rounded-xl border border-transparent hover:bg-white/5 hover:border-white/5 transition-all"
                    >
                      <span className="text-xs font-mono text-secondary bg-secondary/10 px-2 py-1 rounded h-fit whitespace-nowrap border border-secondary/20">
                        {note.formatted_time}
                      </span>
                      <p className="text-sm text-textSecondary leading-relaxed group-hover:text-text transition-colors">
                        {note.note_text}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-textSecondary text-sm italic text-center py-10">
                    No AI notes generated yet.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* --- REVISION TAB --- */}
          {activeTab === "revision" && (
            <div className="space-y-6 h-full flex flex-col">
              <div className="flex justify-center shrink-0">
                <div className="flex bg-white/5 p-1 rounded-xl">
                  <button
                    onClick={() => setRevisionMode("mindmap")}
                    className={cn(
                      "px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all",
                      revisionMode === "mindmap"
                        ? "bg-surface shadow-md text-text border border-white/10"
                        : "text-textSecondary hover:text-text"
                    )}
                  >
                    <GitGraph className="w-4 h-4" /> Mind Map
                  </button>
                  <button
                    onClick={() => setRevisionMode("flashcards")}
                    className={cn(
                      "px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all",
                      revisionMode === "flashcards"
                        ? "bg-surface shadow-md text-text border border-white/10"
                        : "text-textSecondary hover:text-text"
                    )}
                  >
                    <Layers className="w-4 h-4" /> Flashcards
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-[400px]">
                {revisionMode === "mindmap" ? (
                  materials.ai_mind_map ? (
                    <div className="w-full h-full overflow-x-auto overflow-y-hidden pb-4 flex items-center justify-center">
                       {/* Container to ensure horizontal scroll if wide */}
                      <div className="min-w-fit px-8">
                        <MindMapNode node={materials.ai_mind_map} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-textSecondary">
                       <GitGraph className="w-12 h-12 mb-2 opacity-20" />
                       <p className="text-sm">Mind map not available for this module.</p>
                    </div>
                  )
                ) : (
                  <div className="h-full">
                    {materials.ai_flashcards.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                        {materials.ai_flashcards.map((card, idx) => (
                          <FlashCard key={card.card_id} card={card} index={idx} />
                        ))}
                      </div>
                    ) : (
                       <div className="flex flex-col items-center justify-center h-full text-textSecondary">
                       <Layers className="w-12 h-12 mb-2 opacity-20" />
                       <p className="text-sm">No flashcards available.</p>
                    </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- RESOURCES TAB --- */}
          {activeTab === "resources" && (
            <div className="space-y-3">
              {materials.module_resources.length > 0 ? (
                materials.module_resources.map((res) => {
                  const Icon = getIconForType(res.resource_type);
                  return (
                    <a
                      key={res.resource_id}
                      href={res.resource_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-textSecondary group-hover:text-secondary group-hover:scale-110 transition-all">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-sm font-bold block mb-0.5 group-hover:text-secondary transition-colors">
                            {res.resource_name}
                          </span>
                          <span className="text-xs text-textSecondary uppercase font-mono">
                            {res.resource_type}{" "}
                            {res.resource_size && `• ${res.resource_size}`}
                          </span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                         <Download className="w-4 h-4" />
                      </div>
                    </a>
                  );
                })
              ) : (
                <p className="text-textSecondary text-sm italic text-center py-10">
                  No downloadable resources available.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};