import React, { useState, useEffect } from 'react';
import { getCurrentMonthlySeason, getRankTier, getRankInfo } from '../utils/rankUtils';
import { playSound } from '../utils/audio';

interface SeasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  soloPoints: number;
  duoPoints: number;
  trioPoints: number;
  seasonHistory?: any[];
}

export const SeasonModal: React.FC<SeasonModalProps> = ({
  isOpen,
  onClose,
  soloPoints,
  duoPoints,
  trioPoints,
  seasonHistory = [],
}) => {
  const [season, setSeason] = useState(getCurrentMonthlySeason());

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSeason(getCurrentMonthlySeason());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const soloTier = getRankInfo(soloPoints);
  const duoTier = getRankInfo(duoPoints);
  const trioTier = getRankInfo(trioPoints);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        {/* Header with Season Theme */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-b border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30">
              🌌
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-purple-500/30 text-purple-300 font-black text-[10px] uppercase border border-purple-500/40">
                  MONTHLY SEASON
                </span>
                <span className="text-xs text-amber-400 font-bold">毎月1日0:00自動リセット</span>
              </div>
              <h2 className="text-xl font-black text-white tracking-wide mt-0.5">
                {season.seasonName}
              </h2>
            </div>
          </div>

          <button
            onClick={() => { playSound('click'); onClose(); }}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          {/* Real-time Countdown Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <div className="text-xs font-bold text-slate-300">⏳ シーズン終了＆レートリセットまで</div>
              <div className="text-xl sm:text-2xl font-black text-amber-300 tracking-wider font-mono mt-0.5">
                {season.formattedCountdown}
              </div>
            </div>
            <div className="text-xs text-slate-400 bg-slate-950/60 px-3.5 py-2 rounded-xl border border-slate-800">
              次回リセット: <strong className="text-white">{season.endsAt.toLocaleDateString()} 00:00</strong>
            </div>
          </div>

          {/* Current 3-Mode Ranked Status */}
          <div>
            <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>📊 あなたの今シーズンランク戦績 (各モード別レート)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Solo */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col items-center text-center">
                <div className="text-xs font-bold text-purple-400 mb-1">👑 ソロ (1人)</div>
                <div className="text-3xl my-1">{soloTier.badgeEmoji}</div>
                <div className="text-sm font-black text-white">{soloTier.labelJa}</div>
                <div className="text-xs font-extrabold text-amber-400 mt-0.5">{soloPoints} RP</div>
                <div className="text-[10px] text-slate-400 mt-2">入場料: -{soloTier.entryFee} RP</div>
              </div>

              {/* Duo / Pair */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col items-center text-center">
                <div className="text-xs font-bold text-cyan-400 mb-1">👥 ペア (2人)</div>
                <div className="text-3xl my-1">{duoTier.badgeEmoji}</div>
                <div className="text-sm font-black text-white">{duoTier.labelJa}</div>
                <div className="text-xs font-extrabold text-amber-400 mt-0.5">{duoPoints} RP</div>
                <div className="text-[10px] text-slate-400 mt-2">入場料: -{duoTier.entryFee} RP</div>
              </div>

              {/* Trio */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col items-center text-center">
                <div className="text-xs font-bold text-pink-400 mb-1">🛡️ トリオ (3人)</div>
                <div className="text-3xl my-1">{trioTier.badgeEmoji}</div>
                <div className="text-sm font-black text-white">{trioTier.labelJa}</div>
                <div className="text-xs font-extrabold text-amber-400 mt-0.5">{trioPoints} RP</div>
                <div className="text-[10px] text-slate-400 mt-2">入場料: -{trioTier.entryFee} RP</div>
              </div>
            </div>
          </div>

          {/* Season Rules & Rewards Breakdown */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs text-slate-300">
            <h4 className="font-black text-white text-sm flex items-center gap-1.5">
              <span>🎁</span> 月間シーズン報酬とリセットルール
            </h4>
            <ul className="space-y-1.5 pl-4 list-disc marker:text-purple-400 leading-relaxed">
              <li>
                <strong>毎月1日 00:00:00 (JST)</strong> に各モード（ソロ・ペア・トリオ）のレートがリセットされます。
              </li>
              <li>
                <strong>シーズン終了時の最高ランク</strong>に応じて、限定トロフィーバッジ・限定称号・大量のガチャコインが配布されます。
              </li>
              <li>
                <strong>ソフトリセット制度</strong>: 上位ランク到達者は次シーズン開始時に有利な初期ポイント（ゴールド/プラチナ帯フロア）からスタートします。
              </li>
              <li>
                <strong>ランクマッチレートの厳格化</strong>: 早期脱落時のマイナスや上位ティアでの入場料を導入し、真の実力者だけが頂点へ登りつめます。
              </li>
            </ul>
          </div>

          {/* Past Seasons History */}
          {seasonHistory.length > 0 && (
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                📜 過去シーズン履歴
              </h4>
              <div className="space-y-2">
                {seasonHistory.map((rec, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="font-bold text-white">{rec.seasonName}</div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <span>ソロ: <strong>{rec.soloFinalPoints || 0} RP</strong></span>
                      <span>ペア: <strong>{rec.duoFinalPoints || 0} RP</strong></span>
                      <span>トリオ: <strong>{rec.trioFinalPoints || 0} RP</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
