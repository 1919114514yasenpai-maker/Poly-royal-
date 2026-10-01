import React, { useState } from 'react';
import {
  SKIN_CATALOGUE,
  TITLE_CATALOGUE,
  BADGE_CATALOGUE,
  EMOTE_CATALOGUE,
  SkinItem,
  TitleItem,
  BadgeItem,
  EmoteItem
} from '../types';
import { playSound } from '../utils/audio';

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  unlockedSkins: string[];
  unlockedTitles: string[];
  unlockedBadges: string[];
  unlockedEmotes: string[];
  equippedSkin: string;
  equippedTitle: string;
  equippedBadge: string;
  equippedEmote: string;
  onEquipSkin: (skinId: string) => void;
  onEquipTitle: (titleId: string) => void;
  onEquipBadge: (badgeId: string) => void;
  onEquipEmote: (emoteId: string) => void;
  onUnlockItem: (type: 'skin' | 'title' | 'badge' | 'emote', id: string, cost: number) => boolean;
  onAddCoins: (amount: number) => void;
}

type TabType = 'skins' | 'titles' | 'badges' | 'emotes' | 'gacha' | 'milestones';

export const CollectionModal: React.FC<CollectionModalProps> = ({
  isOpen,
  onClose,
  coins,
  unlockedSkins,
  unlockedTitles,
  unlockedBadges,
  unlockedEmotes,
  equippedSkin,
  equippedTitle,
  equippedBadge,
  equippedEmote,
  onEquipSkin,
  onEquipTitle,
  onEquipBadge,
  onEquipEmote,
  onUnlockItem,
  onAddCoins,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('skins');
  const [selectedSkin, setSelectedSkin] = useState<SkinItem>(() => {
    return SKIN_CATALOGUE.find(s => s.id === equippedSkin) || SKIN_CATALOGUE[0];
  });
  const [gachaResults, setGachaResults] = useState<{ item: any; type: string; isNew: boolean }[] | null>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [claimedDaily, setClaimedDaily] = useState(() => {
    const lastDaily = localStorage.getItem('poly_daily_claim');
    const today = new Date().toDateString();
    return lastDaily === today;
  });

  if (!isOpen) return null;

  // Calculate overall collection progress
  const totalItemsCount =
    SKIN_CATALOGUE.length + TITLE_CATALOGUE.length + BADGE_CATALOGUE.length + EMOTE_CATALOGUE.length;
  const totalUnlockedCount =
    unlockedSkins.length + unlockedTitles.length + unlockedBadges.length + unlockedEmotes.length;
  const progressPercent = Math.min(100, Math.round((totalUnlockedCount / totalItemsCount) * 100));

  const handleClaimDaily = () => {
    if (claimedDaily) return;
    playSound('powerup');
    onAddCoins(250);
    localStorage.setItem('poly_daily_claim', new Date().toDateString());
    setClaimedDaily(true);
  };

  const executeGacha = (count: 1 | 10) => {
    const cost = count === 1 ? 100 : 900;
    if (coins < cost || isPulling) {
      playSound('error');
      return;
    }

    onUnlockItem('skin', '__gacha_fee__', cost);
    setIsPulling(true);
    playSound('shoot');

    setTimeout(() => {
      const results: { item: any; type: string; isNew: boolean }[] = [];
      const allPool = [
        ...SKIN_CATALOGUE.map(i => ({ ...i, itemCategory: 'skin' })),
        ...TITLE_CATALOGUE.map(i => ({ ...i, itemCategory: 'title' })),
        ...BADGE_CATALOGUE.map(i => ({ ...i, itemCategory: 'badge' })),
        ...EMOTE_CATALOGUE.map(i => ({ ...i, itemCategory: 'emote' })),
      ];

      for (let i = 0; i < count; i++) {
        // Weighted probability: common 50%, rare 30%, epic 15%, legendary 5%
        const rand = Math.random() * 100;
        let targetRarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common';
        if (rand < 5) targetRarity = 'legendary';
        else if (rand < 20) targetRarity = 'epic';
        else if (rand < 50) targetRarity = 'rare';

        const filtered = allPool.filter(item => item.rarity === targetRarity);
        const picked = filtered[Math.floor(Math.random() * filtered.length)] || allPool[0];

        let isNew = false;
        if (picked.itemCategory === 'skin' && !unlockedSkins.includes(picked.id)) {
          onUnlockItem('skin', picked.id, 0);
          isNew = true;
        } else if (picked.itemCategory === 'title' && !unlockedTitles.includes(picked.id)) {
          onUnlockItem('title', picked.id, 0);
          isNew = true;
        } else if (picked.itemCategory === 'badge' && !unlockedBadges.includes(picked.id)) {
          onUnlockItem('badge', picked.id, 0);
          isNew = true;
        } else if (picked.itemCategory === 'emote' && !unlockedEmotes.includes(picked.id)) {
          onUnlockItem('emote', picked.id, 0);
          isNew = true;
        } else {
          // Duplicate cashback
          onAddCoins(30);
        }

        results.push({ item: picked, type: picked.itemCategory, isNew });
      }

      setGachaResults(results);
      setIsPulling(false);
      playSound('win');
    }, 600);
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.5)]">LEGENDARY</span>;
      case 'epic':
        return <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-purple-600 text-white shadow-[0_0_8px_rgba(168,85,247,0.4)]">EPIC</span>;
      case 'rare':
        return <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-sky-600 text-white">RARE</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-slate-600 text-slate-200">COMMON</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[780px] bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 text-xl">
              🎨
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wide text-white flex items-center gap-2">
                コレクション図鑑 & ロッカー
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  {totalUnlockedCount}/{totalItemsCount} ({progressPercent}%)
                </span>
              </h2>
              <p className="text-xs text-slate-400">スキン・称号・バッジ・エモートを解放＆カスタマイズ</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Coins Display & Daily Claim */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-yellow-500/30 shadow-inner">
              <span className="text-lg">🪙</span>
              <span className="font-extrabold text-yellow-400 text-sm tracking-wide">{coins.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 font-medium">コイン</span>
            </div>

            <button
              onClick={handleClaimDaily}
              disabled={claimedDaily}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                claimedDaily
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black shadow-lg shadow-amber-500/25 active:scale-95'
              }`}
            >
              {claimedDaily ? '✅ 本日受取済' : '🎁 デイリー +250'}
            </button>

            <button
              onClick={() => {
                playSound('click');
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/80 overflow-x-auto scrollbar-none">
          <button
            onClick={() => { playSound('click'); setActiveTab('skins'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'skins'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-black'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            👕 キャラクタースキン ({unlockedSkins.length}/{SKIN_CATALOGUE.length})
          </button>

          <button
            onClick={() => { playSound('click'); setActiveTab('titles'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'titles'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-black'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            🏷️ 称号 ({unlockedTitles.length}/{TITLE_CATALOGUE.length})
          </button>

          <button
            onClick={() => { playSound('click'); setActiveTab('badges'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'badges'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-black'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            🎖️ バッジ・エンブレム ({unlockedBadges.length}/{BADGE_CATALOGUE.length})
          </button>

          <button
            onClick={() => { playSound('click'); setActiveTab('emotes'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'emotes'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-black'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            💃 エモート ({unlockedEmotes.length}/{EMOTE_CATALOGUE.length})
          </button>

          <button
            onClick={() => { playSound('click'); setActiveTab('gacha'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'gacha'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                : 'text-amber-400 hover:text-amber-300 hover:bg-amber-950/30 border border-amber-500/20'
            }`}
          >
            🎰 カプセルガチャ
          </button>

          <button
            onClick={() => { playSound('click'); setActiveTab('milestones'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'milestones'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-black'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            🏆 収集達成度 & 報酬
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700">
          {/* 1. SKINS TAB */}
          {activeTab === 'skins' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left 2 cols: Skin Grid */}
              <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {SKIN_CATALOGUE.map((skin) => {
                  const isUnlocked = unlockedSkins.includes(skin.id);
                  const isEquipped = equippedSkin === skin.id;
                  const isSelected = selectedSkin.id === skin.id;

                  return (
                    <div
                      key={skin.id}
                      onClick={() => {
                        setSelectedSkin(skin);
                        playSound('click');
                      }}
                      className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-purple-400 bg-purple-950/30 shadow-[0_0_15px_rgba(168,85,247,0.3)] ring-2 ring-purple-500/50'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Top labels */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        {getRarityBadge(skin.rarity)}
                        {isEquipped && (
                          <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-emerald-500 text-slate-950">
                            装備中
                          </span>
                        )}
                      </div>

                      {/* Color Preview Block */}
                      <div
                        className={`h-20 rounded-lg bg-gradient-to-tr ${skin.previewGradient} flex items-center justify-center relative overflow-hidden shadow-inner my-1.5`}
                      >
                        <div
                          className="w-10 h-10 rounded-full border-2 border-white/40 shadow-lg flex items-center justify-center text-xl"
                          style={{ backgroundColor: skin.colorHex }}
                        >
                          👤
                        </div>
                        {!isUnlocked && (
                          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] flex items-center justify-center">
                            <span className="text-xl">🔒</span>
                          </div>
                        )}
                      </div>

                      {/* Info & Name */}
                      <div className="mt-1">
                        <div className="text-xs font-extrabold text-white truncate">{skin.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{skin.description}</div>
                      </div>

                      {/* Price / Status */}
                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        {isUnlocked ? (
                          <span className="text-[11px] font-bold text-emerald-400">所持済</span>
                        ) : (
                          <span className="text-[11px] font-black text-yellow-400 flex items-center gap-1">
                            🪙 {skin.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Col: Selected Skin Showcase & Action */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    {getRarityBadge(selectedSkin.rarity)}
                    <span className="text-xs text-slate-400">カラー ID: {selectedSkin.id}</span>
                  </div>

                  <div
                    className={`h-48 rounded-xl bg-gradient-to-tr ${selectedSkin.previewGradient} flex flex-col items-center justify-center relative overflow-hidden border border-slate-700/50 shadow-2xl mb-4`}
                  >
                    <div
                      className="w-20 h-20 rounded-2xl border-4 border-white/50 shadow-2xl flex items-center justify-center text-4xl animate-bounce"
                      style={{ backgroundColor: selectedSkin.colorHex, boxShadow: `0 0 30px ${selectedSkin.glowHex}` }}
                    >
                      🦸
                    </div>
                    <div className="mt-3 px-3 py-1 rounded-full bg-slate-950/70 text-xs font-bold text-white border border-white/10">
                      3D スキンプレビュー
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-white">{selectedSkin.name}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedSkin.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800">
                  {equippedSkin === selectedSkin.id ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-black text-sm flex items-center justify-center gap-2 cursor-default"
                    >
                      ✅ 現在装備中
                    </button>
                  ) : unlockedSkins.includes(selectedSkin.id) ? (
                    <button
                      onClick={() => {
                        playSound('powerup');
                        onEquipSkin(selectedSkin.id);
                      }}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg shadow-purple-600/30 transition-all active:scale-98"
                    >
                      ✨ このスキンを装備
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const success = onUnlockItem('skin', selectedSkin.id, selectedSkin.price);
                        if (success) {
                          playSound('win');
                          onEquipSkin(selectedSkin.id);
                        } else {
                          playSound('error');
                        }
                      }}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/30 transition-all active:scale-98 flex items-center justify-center gap-2"
                    >
                      🪙 {selectedSkin.price.toLocaleString()} コインで解放＆装備
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. TITLES TAB */}
          {activeTab === 'titles' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {TITLE_CATALOGUE.map((titleItem) => {
                const isUnlocked = unlockedTitles.includes(titleItem.id);
                const isEquipped = equippedTitle === titleItem.id;

                return (
                  <div
                    key={titleItem.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      isEquipped
                        ? 'border-emerald-500 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : isUnlocked
                          ? 'border-slate-700 bg-slate-900/80 hover:border-slate-600'
                          : 'border-slate-800/80 bg-slate-950/50 opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        {getRarityBadge(titleItem.rarity)}
                        {isEquipped && (
                          <span className="px-2 py-0.5 text-[9px] font-black rounded bg-emerald-500 text-slate-950">
                            装備中
                          </span>
                        )}
                      </div>

                      <div className="text-base font-black text-white tracking-wide mt-1 flex items-center gap-1.5">
                        <span className="text-purple-400 font-mono">「</span>
                        <span className="bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent">
                          {titleItem.title}
                        </span>
                        <span className="text-purple-400 font-mono">」</span>
                      </div>

                      <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        <span>🎯 条件:</span>
                        <span className="text-slate-300 font-medium">{titleItem.unlockCondition}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      {isEquipped ? (
                        <span className="text-xs font-bold text-emerald-400">頭上に表示中</span>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => {
                            playSound('click');
                            onEquipTitle(titleItem.id);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
                        >
                          装備する
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const ok = onUnlockItem('title', titleItem.id, titleItem.price);
                            if (ok) {
                              playSound('win');
                              onEquipTitle(titleItem.id);
                            } else {
                              playSound('error');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition flex items-center gap-1"
                        >
                          🪙 {titleItem.price} 解放
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. BADGES TAB */}
          {activeTab === 'badges' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {BADGE_CATALOGUE.map((badgeItem) => {
                const isUnlocked = unlockedBadges.includes(badgeItem.id);
                const isEquipped = equippedBadge === badgeItem.id;

                return (
                  <div
                    key={badgeItem.id}
                    className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                      isEquipped
                        ? 'border-cyan-500 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : isUnlocked
                          ? 'border-slate-700 bg-slate-900/80 hover:border-slate-600'
                          : 'border-slate-800/80 bg-slate-950/50 opacity-80'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
                      {badgeItem.icon}
                    </div>

                    <div className="flex-1 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          {getRarityBadge(badgeItem.rarity)}
                          {isEquipped && (
                            <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-cyan-500 text-slate-950">
                              装備中
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-black text-white">{badgeItem.name}</div>
                        <div className="text-[11px] text-slate-400 leading-tight mt-0.5">{badgeItem.description}</div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-end">
                        {isEquipped ? (
                          <span className="text-[11px] font-bold text-cyan-400">ネームプレート装着中</span>
                        ) : isUnlocked ? (
                          <button
                            onClick={() => {
                              playSound('click');
                              onEquipBadge(badgeItem.id);
                            }}
                            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
                          >
                            装備
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const ok = onUnlockItem('badge', badgeItem.id, badgeItem.price);
                              if (ok) {
                                playSound('win');
                                onEquipBadge(badgeItem.id);
                              } else {
                                playSound('error');
                              }
                            }}
                            className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1"
                          >
                            🪙 {badgeItem.price} 解放
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 4. EMOTES TAB */}
          {activeTab === 'emotes' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {EMOTE_CATALOGUE.map((emoteItem) => {
                const isUnlocked = unlockedEmotes.includes(emoteItem.id);
                const isEquipped = equippedEmote === emoteItem.id;

                return (
                  <div
                    key={emoteItem.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      isEquipped
                        ? 'border-pink-500 bg-pink-950/20 shadow-[0_0_15px_rgba(236,72,153,0.2)]'
                        : isUnlocked
                          ? 'border-slate-700 bg-slate-900/80 hover:border-slate-600'
                          : 'border-slate-800/80 bg-slate-950/50 opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        {getRarityBadge(emoteItem.rarity)}
                        {isEquipped && (
                          <span className="px-2 py-0.5 text-[9px] font-black rounded bg-pink-500 text-white">
                            セット中 (Tキー/タップ)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 my-2">
                        <div className="w-12 h-12 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-2xl shadow-inner">
                          {emoteItem.icon}
                        </div>
                        <div>
                          <div className="text-sm font-black text-white">{emoteItem.name}</div>
                          <div className="text-xs text-slate-400">{emoteItem.description}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                      {isEquipped ? (
                        <span className="text-xs font-bold text-pink-400">バトル中に即発動</span>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => {
                            playSound('click');
                            onEquipEmote(emoteItem.id);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
                        >
                          エモート装備
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const ok = onUnlockItem('emote', emoteItem.id, emoteItem.price);
                            if (ok) {
                              playSound('win');
                              onEquipEmote(emoteItem.id);
                            } else {
                              playSound('error');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1"
                        >
                          🪙 {emoteItem.price} 解放
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 5. GACHA TAB */}
          {activeTab === 'gacha' && (
            <div className="max-w-2xl mx-auto flex flex-col items-center text-center py-4">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-5xl shadow-2xl shadow-amber-500/30 animate-pulse mb-4">
                🎰
              </div>

              <h3 className="text-2xl font-black text-white tracking-wide">
                ミステリーカプセルガチャ
              </h3>
              <p className="text-xs text-slate-400 max-w-md mt-1 mb-6">
                最高レア（レジェンダリー）スキンや限定称号・エモートが当たる！重複時はコインキャッシュバック。
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
                <button
                  onClick={() => executeGacha(1)}
                  disabled={coins < 100 || isPulling}
                  className={`flex-1 py-3.5 px-5 rounded-2xl font-black text-sm flex flex-col items-center justify-center transition-all ${
                    coins < 100 || isPulling
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 hover:border-yellow-400/50 shadow-lg active:scale-95'
                  }`}
                >
                  <span>1回ガチャ</span>
                  <span className="text-xs text-yellow-400 font-extrabold mt-0.5">🪙 100 コイン</span>
                </button>

                <button
                  onClick={() => executeGacha(10)}
                  disabled={coins < 900 || isPulling}
                  className={`flex-1 py-3.5 px-5 rounded-2xl font-black text-sm flex flex-col items-center justify-center transition-all ${
                    coins < 900 || isPulling
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-xl shadow-amber-500/30 hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  <span className="flex items-center gap-1">10連ガチャ (1回分お得!)</span>
                  <span className="text-xs font-black mt-0.5">🪙 900 コイン</span>
                </button>
              </div>

              {/* Gacha Results Display */}
              {gachaResults && (
                <div className="mt-8 w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-5 animate-fadeIn">
                  <h4 className="text-sm font-extrabold text-white mb-3">🎉 ガチャ結果</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {gachaResults.map((res, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-between text-center relative overflow-hidden"
                      >
                        {res.isNew && (
                          <div className="absolute top-1 right-1 px-1.5 py-0.2 rounded bg-rose-500 text-[8px] font-black text-white uppercase">
                            NEW!
                          </div>
                        )}
                        <div className="my-1 text-2xl">
                          {res.type === 'skin' ? '👕' : res.type === 'title' ? '🏷️' : res.type === 'badge' ? (res.item.icon || '🎖️') : '💃'}
                        </div>
                        <div className="text-[11px] font-extrabold text-white truncate w-full">{res.item.name || res.item.title}</div>
                        <div className="mt-1">{getRarityBadge(res.item.rarity)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 6. MILESTONES TAB */}
          {activeTab === 'milestones' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-base font-black text-white flex items-center justify-between">
                  <span>コレクション完成度</span>
                  <span className="text-purple-400 font-extrabold">{progressPercent}%</span>
                </h3>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mt-3 p-0.5 border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  アイテムを収集して達成度を上げると、限定ボーナスコインと至高の称号が解放されます！
                </p>
              </div>

              {/* Milestones List */}
              {[
                { target: 25, reward: '🪙 500 コイン + 称号「初陣のコレクター」', unlocked: progressPercent >= 25 },
                { target: 50, reward: '🪙 1,000 コイン + 称号「至高の蒐集王 (Collector)」', unlocked: progressPercent >= 50 },
                { target: 75, reward: '🪙 2,000 コイン + バッジ「百戦錬磨の証」', unlocked: progressPercent >= 75 },
                { target: 100, reward: '👑 究極神話スキン「虹光のプリズム (Rainbow Prism)」', unlocked: progressPercent >= 100 },
              ].map((m, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                    m.unlocked
                      ? 'border-emerald-500/40 bg-emerald-950/20'
                      : 'border-slate-800 bg-slate-900/60 opacity-75'
                  }`}
                >
                  <div>
                    <div className="text-sm font-black text-white flex items-center gap-2">
                      <span>達成度 {m.target}% 突破</span>
                      {m.unlocked ? (
                        <span className="px-2 py-0.5 text-[9px] font-black rounded bg-emerald-500 text-slate-950">達成済</span>
                      ) : (
                        <span className="text-xs text-slate-400">（あと {Math.max(0, m.target - progressPercent)}%）</span>
                      )}
                    </div>
                    <div className="text-xs text-yellow-400 font-bold mt-1">{m.reward}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
