import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, Check, Lock, HelpCircle } from "lucide-react"
import { useGameStore } from "@/store/useGameStore"
import CharacterAvatar from "@/components/CharacterAvatar"
import { cosmetics, categoryLabels, rarityColors, rarityLabels, getUnlockConditionText } from "@/data/cosmetics"
import type { CosmeticCategory, CosmeticItem, EquippedCosmetics } from "@/types"

const categories: CosmeticCategory[] = ["hat", "cape", "frame", "accessory"]

export default function Cosmetics() {
  const navigate = useNavigate()
  const userProfile = useGameStore((s) => s.userProfile)
  const equipCosmetic = useGameStore((s) => s.equipCosmetic)
  const unequipCosmetic = useGameStore((s) => s.unequipCosmetic)
  const markVisitedCosmetics = useGameStore((s) => s.markVisitedCosmetics)
  const checkAndUnlockCosmetics = useGameStore((s) => s.checkAndUnlockCosmetics)

  const [selectedCategory, setSelectedCategory] = useState<CosmeticCategory>("hat")
  const [selectedItem, setSelectedItem] = useState<CosmeticItem | null>(null)
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([])
  const [previewEquipped, setPreviewEquipped] = useState<EquippedCosmetics | null>(null)

  useEffect(() => {
    if (userProfile) {
      markVisitedCosmetics()
      const unlocked = checkAndUnlockCosmetics()
      if (unlocked.length > 0) {
        setNewlyUnlocked(unlocked)
        setShowUnlockModal(true)
      }
    }
  }, [userProfile, markVisitedCosmetics, checkAndUnlockCosmetics])

  useEffect(() => {
    if (userProfile) {
      setPreviewEquipped({ ...userProfile.equippedCosmetics })
    }
  }, [userProfile])

  const filteredItems = useMemo(() => {
    return cosmetics.filter((item) => item.category === selectedCategory)
  }, [selectedCategory])

  const isUnlocked = (itemId: string) => {
    return userProfile?.unlockedCosmetics.includes(itemId) ?? false
  }

  const isEquipped = (item: CosmeticItem) => {
    const equipped = previewEquipped ?? userProfile?.equippedCosmetics
    if (!equipped) return false
    return equipped[item.category] === item.id
  }

  const handleItemClick = (item: CosmeticItem) => {
    if (!userProfile) return

    if (isUnlocked(item.id)) {
      if (isEquipped(item)) {
        const newEquipped = {
          ...(previewEquipped ?? userProfile.equippedCosmetics),
          [item.category]: null,
        }
        setPreviewEquipped(newEquipped)
        unequipCosmetic(item.category)
      } else {
        const newEquipped = {
          ...(previewEquipped ?? userProfile.equippedCosmetics),
          [item.category]: item.id,
        }
        setPreviewEquipped(newEquipped)
        equipCosmetic(item.id)
      }
    } else {
      setSelectedItem(item)
    }
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-adventure-cream flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">🏰</span>
          <h2 className="font-display text-xl text-adventure-blue mb-2">
            请先创建角色
          </h2>
          <p className="font-body text-adventure-blue/60 mb-4">
            冒险者才能进入装扮小屋哦~
          </p>
          <button onClick={() => navigate("/")} className="btn-adventure">
            去创建角色
          </button>
        </div>
      </div>
    )
  }

  const hasAnyCosmetics = userProfile.unlockedCosmetics.length > 0

  if (!hasAnyCosmetics) {
    return (
      <div className="min-h-screen bg-adventure-cream pb-24">
        <div className="max-w-lg mx-auto px-4 pt-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-8"
          >
            <h1 className="section-title text-3xl">🎨 装扮小屋</h1>
            <p className="font-body text-adventure-blue/60 mt-1">
              打造专属于你的冒险者形象
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="card-adventure text-center py-12 px-6"
          >
            <div className="w-32 h-32 mx-auto mb-6 bg-adventure-cream rounded-full flex items-center justify-center">
              <span className="text-6xl">🎁</span>
            </div>
            <h2 className="font-display text-xl text-adventure-blue mb-3">
              还没有任何装扮道具
            </h2>
            <p className="font-body text-adventure-blue/60 mb-6">
              通过完成冒险里程碑来解锁各种酷炫装扮吧！
            </p>

            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3 p-3 bg-adventure-cream rounded-xl">
                <span className="text-2xl shrink-0">🎭</span>
                <div>
                  <p className="font-display text-sm text-adventure-blue">完成情景挑战</p>
                  <p className="font-body text-xs text-adventure-blue/60">每完成1个情景可解锁装扮</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-adventure-cream rounded-xl">
                <span className="text-2xl shrink-0">📚</span>
                <div>
                  <p className="font-display text-sm text-adventure-blue">学习育儿技能</p>
                  <p className="font-body text-xs text-adventure-blue/60">解锁技能可获得专属装扮</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-adventure-cream rounded-xl">
                <span className="text-2xl shrink-0">📅</span>
                <div>
                  <p className="font-display text-sm text-adventure-blue">连续打卡</p>
                  <p className="font-body text-xs text-adventure-blue/60">坚持每日打卡解锁稀有装扮</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-adventure-cream rounded-xl">
                <span className="text-2xl shrink-0">🏆</span>
                <div>
                  <p className="font-display text-sm text-adventure-blue">收集徽章</p>
                  <p className="font-body text-xs text-adventure-blue/60">获得一定数量徽章解锁传说装扮</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/theater")}
              className="btn-adventure mt-8"
            >
              去完成情景挑战
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-adventure-cream pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-6"
        >
          <h1 className="section-title text-3xl">🎨 装扮小屋</h1>
          <p className="font-body text-adventure-blue/60 mt-1">
            打造专属于你的冒险者形象
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-adventure mb-6 p-6"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-adventure-cream to-adventure-cream-dark flex items-center justify-center">
                <CharacterAvatar
                  characterType={userProfile.characterType}
                  size="lg"
                  equippedCosmetics={previewEquipped}
                />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-adventure-orange/30 pointer-events-none"
              />
            </div>
          </div>
          <div className="text-center">
            <p className="font-display text-lg text-adventure-blue">
              {userProfile.nickname}
            </p>
            <p className="font-body text-sm text-adventure-blue/60">
              Lv.{userProfile.level} · {userProfile.title}
            </p>
            <p className="font-body text-xs text-adventure-orange mt-2">
              已解锁 {userProfile.unlockedCosmetics.length}/{cosmetics.length} 件装扮
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mb-4 overflow-x-auto pb-2"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-display text-sm whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-adventure-orange text-white shadow-adventure"
                  : "bg-white text-adventure-blue/60 hover:bg-adventure-orange/10"
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3"
        >
          {filteredItems.map((item, index) => {
            const unlocked = isUnlocked(item.id)
            const equipped = isEquipped(item)

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                onClick={() => handleItemClick(item)}
                className={`card-adventure !p-4 cursor-pointer transition-all relative overflow-hidden ${
                  unlocked ? "hover:shadow-card-hover" : "opacity-60"
                } ${equipped ? "ring-2 ring-adventure-orange" : ""}`}
              >
                {equipped && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-adventure-orange rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}

                {!unlocked && (
                  <div className="absolute inset-0 bg-adventure-blue/50 flex items-center justify-center z-10 rounded-adventure">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                )}

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-adventure-cream flex items-center justify-center">
                    <span className="text-3xl">{item.emoji}</span>
                  </div>
                  <p className="font-display text-sm text-adventure-blue mb-1 truncate">
                    {item.name}
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs ${rarityColors[item.rarity]}`}
                  >
                    {rarityLabels[item.rarity]}
                  </span>
                  {!unlocked && (
                    <p className="font-body text-xs text-adventure-blue/50 mt-2 flex items-center justify-center gap-1">
                      <HelpCircle className="w-3 h-3" />
                      {getUnlockConditionText(item)}
                    </p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl text-adventure-blue">
                  装扮详情
                </h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-8 h-8 rounded-full bg-adventure-cream flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-adventure-blue/60" />
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-adventure-cream flex items-center justify-center">
                  <span className="text-5xl">{selectedItem.emoji}</span>
                </div>
                <h4 className="font-display text-lg text-adventure-blue mb-1">
                  {selectedItem.name}
                </h4>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm ${rarityColors[selectedItem.rarity]}`}
                >
                  {rarityLabels[selectedItem.rarity]}
                </span>
              </div>

              <p className="font-body text-sm text-adventure-blue/70 text-center mb-4">
                {selectedItem.description}
              </p>

              <div className="bg-adventure-cream rounded-xl p-4 mb-6">
                <p className="font-body text-sm text-adventure-blue/60 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  解锁条件：{getUnlockConditionText(selectedItem)}
                </p>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="btn-adventure w-full"
              >
                我知道了
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUnlockModal && newlyUnlocked.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setShowUnlockModal(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-gradient-to-br from-adventure-gold to-adventure-orange rounded-3xl p-8 max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mb-4"
              >
                <Sparkles className="w-16 h-16 text-white mx-auto" />
              </motion.div>

              <h3 className="font-display text-2xl text-white mb-2">
                🎉 恭喜解锁新装扮！
              </h3>
              <p className="font-body text-white/80 mb-6">
                你获得了 {newlyUnlocked.length} 件新装扮
              </p>

              <div className="flex justify-center gap-4 mb-6">
                {newlyUnlocked.slice(0, 3).map((id) => {
                  const item = cosmetics.find((c) => c.id === id)
                  return item ? (
                    <motion.div
                      key={id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center"
                    >
                      <span className="text-3xl">{item.emoji}</span>
                    </motion.div>
                  ) : null
                })}
                {newlyUnlocked.length > 3 && (
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <span className="text-xl text-white font-bold">
                      +{newlyUnlocked.length - 3}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowUnlockModal(false)}
                className="bg-white text-adventure-orange font-display text-lg px-8 py-3 rounded-full hover:bg-white/90 transition-colors"
              >
                太棒了！
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
