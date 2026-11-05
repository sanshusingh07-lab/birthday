import React, { useState, useEffect } from 'react';
import { ShieldCheck, Gift, Image as ImageIcon, Heart, Trash2, ExternalLink, RefreshCw, X, Search, Sparkles } from 'lucide-react';
import { getAdminStats, deleteSurprise, seedDemoSurprise } from '../../utils/api';
import { AdminStats, BirthdaySurprise } from '../../types/birthday';
import { sound } from '../../utils/audio';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [seeding, setSeeding] = useState<boolean>(false);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this birthday surprise?")) return;
    try {
      sound.playClick();
      await deleteSurprise(id);
      fetchStats();
    } catch (err: any) {
      alert("Failed to delete surprise: " + err.message);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    sound.playSparkle();
    try {
      await seedDemoSurprise();
      fetchStats();
    } catch (err: any) {
      alert("Seed failed: " + err.message);
    } finally {
      setSeeding(false);
    }
  };

  const surprises = stats?.latest_surprises || [];
  const filteredSurprises = surprises.filter(s =>
    s.recipient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.sender_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.relationship.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center animate-fade-in">
      <div className="bg-[#FFF6F0] rounded-3xl border border-[#FFBFA8] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-[#38251F]">
        {/* Header */}
        <div className="p-6 bg-white border-b border-[#FFBFA8]/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#38251F] text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5 text-[#FFBFA8]" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#38251F]">
                Website Administration
              </h2>
              <p className="text-xs text-gray-500">
                System telemetry, content management & moderation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="px-3 py-1.5 rounded-xl bg-[#E85B32]/10 hover:bg-[#E85B32]/20 text-[#E85B32] text-xs font-semibold border border-[#E85B32]/30 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{seeding ? "Seeding..." : "Seed Sample Surprise"}</span>
            </button>

            <button
              onClick={fetchStats}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#FFBFA8]/50 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Surprises</span>
                <Gift className="w-4 h-4 text-[#E85B32]" />
              </div>
              <p className="font-serif text-3xl font-black text-[#38251F]">
                {stats?.total_surprises ?? 0}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#FFBFA8]/50 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Memories</span>
                <ImageIcon className="w-4 h-4 text-[#F7A6A0]" />
              </div>
              <p className="font-serif text-3xl font-black text-[#38251F]">
                {stats?.total_memories ?? 0}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#FFBFA8]/50 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Balloon Wishes</span>
                <Heart className="w-4 h-4 text-[#FFBFA8]" />
              </div>
              <p className="font-serif text-3xl font-black text-[#38251F]">
                {stats?.total_wishes ?? 0}
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by recipient, sender, or relationship..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white border border-[#FFBFA8] text-xs text-[#38251F] outline-none focus:border-[#E85B32]"
            />
          </div>

          {/* Surprises Table */}
          <div className="bg-white rounded-2xl border border-[#FFBFA8]/60 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFF6F0] border-b border-[#FFBFA8]/40 text-[#38251F]/70 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">From</th>
                    <th className="py-3 px-4">Relationship</th>
                    <th className="py-3 px-4">Balloons</th>
                    <th className="py-3 px-4">Photos</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSurprises.map(s => (
                    <tr key={s.id} className="hover:bg-[#FFF6F0]/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#38251F]">
                        {s.recipient_name}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {s.sender_name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FFBFA8]/40 text-[#E85B32] font-semibold text-[11px]">
                          {s.relationship}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {s.wishes?.length || 0}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {s.memories?.length || 0}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/surprise/${s.unique_slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#E85B32] hover:text-white transition-all text-gray-600"
                            title="Open Experience"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => s.id && handleDelete(s.id)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-500 hover:text-white text-red-600 transition-all"
                            title="Delete Surprise"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredSurprises.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400 italic">
                        No surprises found matching your query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

