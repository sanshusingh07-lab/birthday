import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Send } from 'lucide-react';
import { sound } from '../utils/audio';

interface ShareModalProps {
  slug: string;
  recipientName: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ slug, recipientName, onClose }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/surprise/${slug}`;

  const handleCopy = () => {
    sound.playSparkle();
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `✨ A magical birthday surprise was created just for you, ${recipientName}! Open your surprise here: ${shareUrl}`
  )}`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Happy Birthday ${recipientName}! 🎈 Open your personalized birthday surprise: ${shareUrl}`
  )}`;

  // Public QR Code API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#1F1238] border border-white/20 rounded-3xl p-6 text-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-[#E85B32] to-[#F7A6A0] flex items-center justify-center shadow-lg shadow-[#E85B32]/30">
            <Share2 className="w-7 h-7 text-white" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-white">Share The Surprise ✨</h3>
          <p className="text-sm text-gray-300 mt-1">
            Send this special link to <span className="text-[#FFBFA8] font-semibold">{recipientName}</span> to brighten their day!
          </p>
        </div>

        {/* Copy link bar */}
        <div className="flex items-center gap-2 p-2 bg-white/10 rounded-2xl border border-white/15 mb-6">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="w-full bg-transparent px-3 py-1.5 text-xs text-white/90 outline-none truncate font-mono"
          />
          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-[#E85B32] hover:bg-[#d44e26] text-white shadow-md'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 text-xs font-semibold transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 text-[#1DA1F2] border border-[#1DA1F2]/40 text-xs font-semibold transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Share on X</span>
          </a>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-xs text-gray-300 mb-3">Or scan with phone camera:</p>
          <div className="p-2.5 bg-white rounded-xl shadow-md">
            <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32" />
          </div>
        </div>
      </div>
    </div>
  );
};

