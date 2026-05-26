"use client";

import { motion } from "framer-motion";
import { Sparkles, ChevronRight, Search } from "lucide-react";
import { useState, useEffect } from "react";

interface Skill {
  name: string;
  title: string;
  description: string;
  triggerPhrases?: string[];
}

interface SkillsPanelProps {
  skills: Skill[];
}

export default function SkillsPanel({ skills }: SkillsPanelProps) {
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const filteredSkills = skills.filter(skill =>
    skill.title.toLowerCase().includes(search.toLowerCase()) ||
    skill.name.toLowerCase().includes(search.toLowerCase()) ||
    skill.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Skills</h1>
            <p className="text-sm text-[--text-muted]">{skills.length} available skills</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--text-muted]" />
          <input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[--bg-input] border border-[--border-subtle] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#ff6b35]"
          />
        </div>
      </motion.div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map((skill, index) => (
          <motion.button
            key={skill.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setSelectedSkill(skill)}
            className="text-left bg-[--bg-panel] border border-[--border-subtle] rounded-xl p-4 hover:border-[#ff6b35]/50 hover:bg-[--bg-elevated] transition-all group"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-[--text-primary] group-hover:text-[#ff6b35] transition-colors">
                {skill.title}
              </h3>
              <ChevronRight size={16} className="text-[--text-dim] group-hover:text-[#ff6b35] transition-colors" />
            </div>
            <p className="text-xs text-[--text-muted] line-clamp-2">
              {skill.description || 'No description available'}
            </p>
            {skill.triggerPhrases && skill.triggerPhrases.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {skill.triggerPhrases.slice(0, 2).map((phrase, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#ff6b35]/10 text-[#ff6b35]">
                    {phrase}
                  </span>
                ))}
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {filteredSkills.length === 0 && (
        <div className="text-center py-12 text-[--text-muted]">
          <Sparkles size={32} className="mx-auto mb-2 opacity-50" />
          <p>No skills found matching "{search}"</p>
        </div>
      )}

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedSkill(null)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[--bg-panel] border border-[--border-subtle] rounded-2xl p-6 max-w-lg w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <h2 className="font-display text-xl font-bold">{selectedSkill.title}</h2>
            </div>
            <p className="text-sm text-[--text-muted] mb-4">
              {selectedSkill.description || 'No description available'}
            </p>
            {selectedSkill.triggerPhrases && selectedSkill.triggerPhrases.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-medium text-[--text-dim] mb-2">Trigger Phrases</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSkill.triggerPhrases.map((phrase, i) => (
                    <span key={i} className="text-xs px-3 py-1 rounded-lg bg-[#ff6b35]/10 text-[#ff6b35] font-mono">
                      {phrase}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={() => setSelectedSkill(null)}
              className="w-full mt-4 py-2 rounded-lg border border-[--border-subtle] text-sm text-[--text-muted] hover:text-[--text-primary] transition-colors"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
