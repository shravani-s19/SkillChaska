import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Brain, Lightbulb, Download, GitGraph, Layers } from 'lucide-react';
import { cn } from '../../lib/utils';
import { COURSE_DETAILS } from '../../data/mockData';

const TABS = [
  { id: 'notes', label: 'Smart Notes', icon: FileText },
  { id: 'revision', label: 'AI Revision', icon: Brain },
  { id: 'resources', label: 'Resources', icon: Lightbulb },
];

const FlashCard = ({ card }: { card: { front: string; back: string } }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="group perspective-1000 h-48 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        className="relative w-full h-full preserve-3d"
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden bg-white/5 border border-white/10 hover:border-secondary/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg transition-colors">
          <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center mb-3">
            <span className="text-secondary font-bold text-lg">?</span>
          </div>
          <h4 className="font-bold text-lg">{card.front}</h4>
          <p className="text-xs text-textSecondary mt-4">Click to flip</p>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-secondary/10 border border-secondary/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
          <h4 className="font-medium text-sm leading-relaxed">{card.back}</h4>
        </div>
      </motion.div>
    </div>
  );
};

// Simple recursive component to render Mind Map nodes
const MindMapNode = ({ node, depth = 0 }: { node: any, depth?: number }) => (
  <div className="flex flex-col items-center">
    <div className={cn(
      "px-4 py-2 rounded-xl border font-bold text-sm mb-4 relative z-10 transition-all hover:scale-105",
      depth === 0 ? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/20" : 
      depth === 1 ? "bg-surface border-white/20 text-text" : 
      "bg-white/5 border-white/10 text-textSecondary text-xs"
    )}>
      {node.label}
    </div>
    {node.children && (
      <div className="flex gap-4 relative">
        {/* Connector Lines (Visual Only) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-white/10 -mt-4" />
        <div className="absolute top-0 left-4 right-4 h-px bg-white/10 -mt-4" />
        
        {node.children.map((child: any) => (
          <div key={child.id} className="pt-4 relative">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-white/10 -mt-4" />
            <MindMapNode node={child} depth={depth + 1} />
          </div>
        ))}
      </div>
    )}
  </div>
);

export const LearningHub = () => {
  const [activeTab, setActiveTab] = useState('notes');
  const [revisionMode, setRevisionMode] = useState<'flashcards' | 'mindmap'>('mindmap');
  const data = COURSE_DETAILS.course_modules[0];

  return (
    <div className="mt-8 bg-surface border border-border rounded-3xl overflow-hidden flex flex-col h-[600px]">
      {/* Tab Navigation */}
      <div className="flex border-b border-border shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-5 text-sm font-bold transition-all relative hover:bg-white/5",
              activeTab === tab.id ? "text-secondary" : "text-textSecondary"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 inset-x-0 h-0.5 bg-secondary"
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-lg">Auto-Generated Notes</h4>
              <button className="text-xs text-secondary font-bold flex items-center gap-1 hover:underline">
                <Download className="w-3 h-3" /> Export PDF
              </button>
            </div>
            <div className="space-y-4">
              {data.ai_smart_notes.map((note, i) => (
                <div key={i} className="flex gap-4 group p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                  <span className="text-xs font-mono text-secondary bg-secondary/10 px-2 py-1 rounded h-fit">
                    {note.time}
                  </span>
                  <p className="text-sm text-textSecondary leading-relaxed group-hover:text-text transition-colors">
                    {note.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'revision' && (
          <div className="space-y-6 h-full flex flex-col">
            <div className="flex bg-white/5 p-1 rounded-xl self-center shrink-0">
              <button
                onClick={() => setRevisionMode('mindmap')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all",
                  revisionMode === 'mindmap' ? "bg-surface shadow-md text-text" : "text-textSecondary hover:text-text"
                )}
              >
                <GitGraph className="w-4 h-4" /> Mind Map
              </button>
              <button
                onClick={() => setRevisionMode('flashcards')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all",
                  revisionMode === 'flashcards' ? "bg-surface shadow-md text-text" : "text-textSecondary hover:text-text"
                )}
              >
                <Layers className="w-4 h-4" /> Flashcards
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center min-h-[300px]">
              {revisionMode === 'mindmap' ? (
                <div className="w-full overflow-x-auto pb-4 text-center">
                  <MindMapNode node={data.ai_revision.mind_map} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {data.ai_revision.flashcards.map((card) => (
                    <FlashCard key={card.id} card={card} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-3">
            {data.resources.map((res, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-textSecondary group-hover:text-secondary transition-colors">
                    <res.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold block mb-0.5">{res.name}</span>
                    <span className="text-xs text-textSecondary">{res.type} • {res.size}</span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-textSecondary group-hover:text-text transition-colors" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};