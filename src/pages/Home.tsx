import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, Palette, X } from "lucide-react"
import { useGameStore } from "@/store/useGameStore"
import { scenarios } from "@/data/scenarios"
import { skills } from "@/data/skills"
import CharacterAvatar from "@/components/CharacterAvatar"
import DifficultyBadge from "@/components/DifficultyBadge"
import ProgressBar from "@/components/ProgressBar"

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function Home() {
  const navigate = useNavigate()
  const userProfile = useGameStore((s) => s.userProfile)
  const missions = useGameStore((s) => s.missions)
  const checkAndUnlockCosmetics = useGameStore((s) => s.checkAndUnlockCosmetics)
  const checkInDaily = useGameStore((s) => s.checkInDaily)
  const dismissCosmeticsGuide = useGameStore((s) => s.dismissCosmeticsGuide)

  const [showGuide, setShowGuide] = useState(false)
  const [showCheckInSuccess, setShowCheckInSuccess] = useState<{ streak: number; newCosmetics: string[] } | null>(null)

  useEffect(() => {
    if (!userProfile) {
      navigate("/")
      return
    }

    checkAndUnlockCosmetics()
  }, [])

  useEffect(() => {
    if (!userProfile) return

    const hasNew = userProfile.unlockedCosmetics.length > userProfile.lastSeenCosmeticsCount
    const notDismissed = !userProfile.dismissedCosmeticsGuide

    setShowGuide(hasNew && notDismissed)
  }, [userProfile])

  const handleCheckIn = () => {
    const result = checkInDaily()
    if (result.success) {
      setShowCheckInSuccess({ streak: result.streak, newCosmetics: result.newCosmetics })
      setTimeout(() => setShowCheckInSuccess(null), 3000)
    }
  }

  const handleCloseGuide = () => {
    setShowGuide(false)
    dismissCosmeticsGuide()
  }

  const scenarioProgress = useMemo(
    () =>
      userProfile
        ? Math.round(
            (userProfile.completedScenarios.length / scenarios.length) * 100
          )
        : 0,
    [userProfile]
  )

  const skillProgress = useMemo(
    () =>
      userProfile
        ? Math.round(
            (userProfile.unlockedSkills.length / skills.length) * 100
          )
        : 0,
    [userProfile]
  )

  const missionProgress = useMemo(
    () =>
      Math.round(
        (missions.filter((m) => m.completed).length /
          Math.max(missions.length, 1)) *
          100
      ),
    [missions]
  )

  const dailyScenario = useMemo(() => {
    if (!userProfile) return null
    const incomplete = scenarios.filter(
      (s) => !userProfile.completedScenarios.includes(s.id)
    )
    if (incomplete.length === 0) return null
    return incomplete[Math.floor(Math.random() * incomplete.length)]
  }, [userProfile])

  const dailySkill = useMemo(() => {
    if (!userProfile) return null
    const eligible = skills.filter(
      (s) =>
        !userProfile.unlockedSkills.includes(s.id) &&
        s.prerequisites.every((p) => userProfile.unlockedSkills.includes(p))
    )
    if (eligible.length === 0) return null
    return eligible[Math.floor(Math.random() * eligible.length)]
  }, [userProfile])

  if (!userProfile) return null

  return (
    <div className="min-h-screen bg-adventure-cream pb-8">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.section variants={staggerItem}>
          <div className="bg-gradient-to-b from-adventure-blue to-adventure-blue-light rounded-b-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />

            <div className="max-w-lg mx-auto flex items-center gap-4 relative z-10">
              <CharacterAvatar characterType={userProfile.characterType} size="lg" useStoreEquipped={true} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-display text-2xl truncate">
                    {userProfile.nickname}
                  </span>
                  <span className="bg-adventure-gold text-adventure-blue px-3 py-1 rounded-full font-display text-sm shrink-0">
                    Lv.{userProfile.level}
                  </span>
                </div>
                <p className="text-white/80 font-body text-sm">
                  {userProfile.title}
                </p>
                <button
                  onClick={handleCheckIn}
                  className="mt-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-white text-xs font-body transition-colors flex items-center gap-1 w-fit"
                >
                  📅 每日打卡
                  {userProfile.consecutiveCheckInDays > 0 && (
                    <span className="bg-adventure-gold text-adventure-blue px-1.5 rounded-full text-[10px] font-bold">
                      {userProfile.consecutiveCheckInDays}天
                    </span>
                  )}
                </button>
              </div>
            </div>
            <p className="text-center text-white/70 font-body text-sm mt-6 relative z-10">
              ✨ 每一天的陪伴，都是最珍贵的冒险 ✨
            </p>
          </div>
        </motion.section>

        <motion.section variants={staggerItem} className="max-w-lg mx-auto px-4 mt-6">
          <h2 className="section-title mb-4">冒险进度</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="card-adventure !p-4 flex flex-col items-center">
              <span className="font-body text-xs text-adventure-blue/60 mb-2">
                情景完成
              </span>
              <ProgressBar value={scenarioProgress} label="情景" />
              <span className="font-display text-sm text-adventure-orange mt-1">
                {scenarioProgress}%
              </span>
            </div>
            <div className="card-adventure !p-4 flex flex-col items-center">
              <span className="font-body text-xs text-adventure-blue/60 mb-2">
                技能解锁
              </span>
              <ProgressBar value={skillProgress} label="技能" />
              <span className="font-display text-sm text-adventure-orange mt-1">
                {skillProgress}%
              </span>
            </div>
            <div className="card-adventure !p-4 flex flex-col items-center">
              <span className="font-body text-xs text-adventure-blue/60 mb-2">
                任务完成
              </span>
              <ProgressBar value={missionProgress} label="任务" />
              <span className="font-display text-sm text-adventure-orange mt-1">
                {missionProgress}%
              </span>
            </div>
          </div>
        </motion.section>

        <motion.section variants={staggerItem} className="max-w-lg mx-auto px-4 mt-6">
          <h2 className="section-title mb-4">今日推荐</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="card-adventure flex items-start gap-4">
              <span className="text-3xl shrink-0">
                {dailyScenario?.emoji ?? "🎉"}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg text-adventure-blue mb-1">
                  今日情景挑战
                </h3>
                <div className="flex items-center gap-2 mb-1">
                  {dailyScenario ? (
                    <>
                      <span className="font-body text-sm text-adventure-blue/70 truncate">
                        {dailyScenario.title}
                      </span>
                      <DifficultyBadge difficulty={dailyScenario.difficulty} />
                    </>
                  ) : (
                    <span className="font-body text-sm text-adventure-teal">
                      全部完成！🎉
                    </span>
                  )}
                </div>
                <p className="font-body text-xs text-adventure-blue/50 line-clamp-2">
                  {dailyScenario?.description ?? "你已经完成了所有情景挑战，太厉害了！"}
                </p>
              </div>
              <button
                onClick={() =>
                  dailyScenario
                    ? navigate(`/theater/${dailyScenario.id}`)
                    : undefined
                }
                className="btn-adventure-sm shrink-0"
              >
                {dailyScenario ? "去完成" : "已完成"}
              </button>
            </div>

            <div className="card-adventure flex items-start gap-4">
              <span className="text-3xl shrink-0">
                {dailySkill?.emoji ?? "🎓"}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg text-adventure-blue mb-1">
                  推荐技能学习
                </h3>
                <span className="font-body text-sm text-adventure-blue/70">
                  {dailySkill
                    ? `${dailySkill.name} - ${dailySkill.category}`
                    : "暂无推荐技能"}
                </span>
                <p className="font-body text-xs text-adventure-blue/50 line-clamp-2">
                  {dailySkill?.description ?? "继续完成情景挑战来解锁更多技能吧！"}
                </p>
              </div>
              <button
                onClick={() =>
                  dailySkill
                    ? navigate(`/skills/${dailySkill.id}`)
                    : undefined
                }
                className="btn-adventure-sm shrink-0"
              >
                {dailySkill ? "去学习" : "看看"}
              </button>
            </div>

            <div className="card-adventure flex items-start gap-4">
              <MessageCircle className="w-8 h-8 text-adventure-pink shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg text-adventure-blue mb-1">
                  社区热帖
                </h3>
                <p className="font-body text-sm text-adventure-blue/70">
                  和其他冒险者爸爸交流心得
                </p>
                <p className="font-body text-xs text-adventure-blue/50">
                  分享你的故事，获得温暖与支持
                </p>
              </div>
              <button
                onClick={() => navigate("/tree-hole")}
                className="btn-adventure-sm shrink-0"
              >
                去看看
              </button>
            </div>
          </div>
        </motion.section>
      </motion.div>

      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-28 left-4 right-4 max-w-lg mx-auto z-40"
          >
            <div className="bg-gradient-to-r from-adventure-orange to-adventure-gold rounded-2xl p-4 shadow-lg text-white relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/20 rounded-full" />
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-white/10 rounded-full" />

              <button
                onClick={handleCloseGuide}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-3 relative z-10">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ repeat: Infinity, repeatDelay: 2, duration: 0.5 }}
                  className="shrink-0"
                >
                  <Palette className="w-10 h-10" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg mb-1">🎨 新功能上线！</h3>
                  <p className="font-body text-sm text-white/90 mb-3">
                    你获得了新装扮道具，快去装扮小屋打造你的专属形象吧！
                  </p>
                  <button
                    onClick={() => {
                      setShowGuide(false)
                      navigate("/cosmetics")
                    }}
                    className="bg-white text-adventure-orange px-4 py-2 rounded-full font-display text-sm hover:bg-white/90 transition-colors"
                  >
                    立即体验 →
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCheckInSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div className="bg-adventure-teal text-white px-8 py-6 rounded-2xl text-center shadow-xl">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-4xl mb-2"
              >
                ✅
              </motion.div>
              <h3 className="font-display text-xl mb-1">打卡成功！</h3>
              <p className="font-body text-sm text-white/90">
                已连续打卡 {showCheckInSuccess.streak} 天
              </p>
              {showCheckInSuccess.newCosmetics.length > 0 && (
                <p className="font-body text-sm text-adventure-gold mt-2">
                  🎁 解锁了 {showCheckInSuccess.newCosmetics.length} 件新装扮！
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
