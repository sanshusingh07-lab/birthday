import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusCircle, 
  Share2, 
  QrCode, 
  Eye, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  Calendar, 
  Heart, 
  Sparkles, 
  Lock, 
  ExternalLink,
  Volume2
} from 'lucide-react';
import type { BirthdaySurprise } from '../../types/birthday';
import { getCreatorSurprises, deleteSurprise } from '../../utils/api';
import { ShareManagerModal } from './ShareManagerModal';
import { sound } from '../../utils/audio';

interface CreatorDashboardProps {
  onCreateNew: () => void;
  onPreviewSurprise: (slug: string) => void;
  onEditSurprise?: (surprise: BirthdaySurprise) => void;
}

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({
  onCreateNew,
  onPreviewSurprise,
  onEditSurprise
}) => {
  const [surprises, setSurprises] = useState<BirthdaySurprise[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeShareSurprise, setActiveShareSurprise] = useState<BirthdaySurprise | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    loadSurprises();
  }, []);

  const loadSurprises = async () => {
    setLoading(true);
    try {
      const data = await getCreatorSurprises();
      setSurprises(data);
    } catch (err) {
      console.error("Failed to load creator surprises:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (slug: string) => {
    const fullUrl = `${window.location.origin}/s/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    sound.playClick();
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the birthday surprise for ${name}? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteSurprise(id);
      setSurprises(prev => prev.filter(s => s.id !== id));
      sound.playClick();
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-[#FFBFA8]/60 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E85B32]/10 text-[#E85B32] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sender's Studio</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#38251F]">
            Creator Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-[#38251F]/70 mt-1">
            Manage your created birthday surprises, download QR codes & track deliveries
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#E85B32] to-[#FF80AB] hover:from-[#d44e26] hover:to-[#e85b7b] text-white text-xs font-bold shadow-lg shadow-[#E85B32]/30 hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Birthday Surprise ✨</span>
        </button>
      </div>

      {/* Surprises List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-3 border-[#E85B32] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-[#38251F]/60">Loading your creations...</p>
        </div>
      ) : surprises.length === 0 ? (
        <div className="bg-white/90 rounded-3xl p-12 text-center border border-[#FFBFA8]/60 shadow-md">
          <span className="text-5xl block mb-4">🎁</span>
          <h3 className="font-serif text-2xl font-bold text-[#38251F] mb-2">
            No Birthday Surprises Created Yet
          </h3>
          <p className="text-xs text-[#38251F]/60 max-w-md mx-auto mb-6">
            Make someone's day magical with animated cake, teardrop balloons, voice messages & personalized memories.
          </p>
          <button
            onClick={onCreateNew}
            className="px-6 py-3 rounded-2xl bg-[#E85B32] text-white text-xs font-bold shadow-md cursor-pointer hover:bg-[#d44e26]"
          >
            Start Creating Now ✨
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {surprises.map((item) => {
            const hasVoice = Boolean(item.voice_message?.audio_url);
            const isCopied = copiedSlug === item.unique_slug;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/95 rounded-3xl p-6 border border-[#FFBFA8]/60 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF6F0] border border-[#FFBFA8]/50 text-[#E85B32] text-xs font-bold">
                      <Heart className="w-3 h-3 fill-[#E85B32]" />
                      <span>{item.relationship}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {item.has_password && (
                        <span title="Password Protected" className="p-1 rounded-lg bg-emerald-50 text-emerald-700">
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {hasVoice && (
                        <span title="Voice Message Included" className="p-1 rounded-lg bg-purple-50 text-purple-700">
                          <Volume2 className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-gray-400">
                        {item.view_count || 0} views
                      </span>
                    </div>
                  </div>

                  {/* Star Name */}
                  <h3 className="font-serif text-2xl font-bold text-[#38251F] mb-1">
                    {item.recipient_name}
                  </h3>
                  <p className="text-xs text-[#38251F]/60 mb-4">
                    Created by {item.sender_name} • {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                  </p>

                  {/* Highlights Summary */}
                  <div className="p-3 rounded-2xl bg-[#FFF6F0]/60 border border-[#FFBFA8]/40 mb-4 text-xs text-[#38251F]/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Wishes / Balloons:</span>
                      <span className="font-bold">{item.wishes?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Polaroid Memories:</span>
                      <span className="font-bold">{item.memories?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Voice Note:</span>
                      <span className="font-bold">{hasVoice ? 'Included 🎙️' : 'None'}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  {/* Share & QR Code */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveShareSurprise(item)}
                      className="flex-1 py-2.5 rounded-xl bg-[#E85B32] hover:bg-[#d44e26] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Share & QR Code</span>
                    </button>

                    <button
                      onClick={() => handleCopyLink(item.unique_slug)}
                      className="p-2.5 rounded-xl bg-white border border-[#FFBFA8] hover:border-[#E85B32] text-[#38251F] transition-all cursor-pointer shrink-0"
                      title="Copy Link"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Preview / Delete */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => onPreviewSurprise(item.unique_slug)}
                      className="text-xs font-bold text-[#38251F]/70 hover:text-[#E85B32] flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Recipient Preview</span>
                    </button>

                    {item.id && (
                      <button
                        onClick={() => handleDelete(item.id!, item.recipient_name)}
                        className="text-xs text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                        title="Delete Surprise"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Share & QR Code Modal */}
      {activeShareSurprise && (
        <ShareManagerModal
          surprise={activeShareSurprise}
          isOpen={Boolean(activeShareSurprise)}
          onClose={() => setActiveShareSurprise(null)}
          onSurpriseUpdated={(updated) => {
            setSurprises(prev => prev.map(s => s.id === updated.id ? updated : s));
          }}
        />
      )}
    </div>
  );
};

