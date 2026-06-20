import { create } from 'zustand'
import { UserProfile, CharacterType, ScenarioResult, Mission, TreeHolePost, Reply, CosmeticCategory, EquippedCosmetics } from '@/types'
import { treeHolePosts } from '@/data/treeHolePosts'
import { cosmetics } from '@/data/cosmetics'
import { scenarios as allScenarios } from '@/data/scenarios'

const STORAGE_KEY = 'dad-adventure-state'

function getTitleByLevel(level: number): string {
  if (level <= 2) return '初出茅庐的爸爸'
  if (level <= 4) return '渐入佳境的爸爸'
  if (level <= 6) return '得心应手的爸爸'
  return '传说中的超级爸爸'
}

function saveToLocalStorage(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

function loadFromLocalStorage(): GameState | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch {
    // ignore
  }
  return null
}

interface GameState {
  userProfile: UserProfile | null
  scenarioResults: ScenarioResult[]
  missions: Mission[]
  posts: TreeHolePost[]
}

interface GameActions {
  createProfile: (characterType: CharacterType, nickname: string) => void
  completeScenario: (scenarioId: string, choices: { sceneId: string; optionId: string }[]) => void
  unlockSkill: (skillId: string) => void
  toggleMission: (missionId: string) => void
  addMission: (mission: Mission) => void
  removeMission: (missionId: string) => void
  addPost: (post: TreeHolePost) => void
  addReplyToPost: (postId: string, reply: Reply) => void
  togglePostLike: (postId: string) => void
  resetGame: () => void
  equipCosmetic: (cosmeticId: string) => void
  unequipCosmetic: (category: CosmeticCategory) => void
  markCosmeticsSeen: () => void
  dismissCosmeticsGuide: () => void
  checkAndUnlockCosmetics: () => string[]
  checkInDaily: () => { success: boolean; streak: number; newCosmetics: string[] }
}

type StoreType = GameState & GameActions

function checkCosmeticUnlocks(
  profile: UserProfile
): string[] {
  const newlyUnlocked: string[] = []

  for (const cosmetic of cosmetics) {
    if (profile.unlockedCosmetics.includes(cosmetic.id)) continue

    let unlocked = false
    const { type, target } = cosmetic.unlockCondition

    switch (type) {
      case 'level':
        unlocked = profile.level >= (target as number)
        break
      case 'scenario':
        if (target === 'all') {
          unlocked = profile.completedScenarios.length >= allScenarios.length
        } else {
          unlocked = profile.completedScenarios.length >= (target as number)
        }
        break
      case 'skill':
        if (target === 'all') {
          unlocked = profile.unlockedSkills.length >= 10
        } else {
          unlocked = profile.unlockedSkills.length >= (target as number)
        }
        break
      case 'streak':
        unlocked = profile.consecutiveCheckInDays >= (target as number)
        break
      case 'badge':
        unlocked = profile.earnedBadges.length >= parseInt(target as string)
        break
    }

    if (unlocked) {
      newlyUnlocked.push(cosmetic.id)
    }
  }

  return newlyUnlocked
}

function migrateProfile(profile: UserProfile): UserProfile {
  if (!profile.unlockedCosmetics) {
    profile.unlockedCosmetics = []
  }
  if (!profile.equippedCosmetics) {
    profile.equippedCosmetics = {
      hat: null,
      cape: null,
      frame: null,
      accessory: null,
    }
  }
  if (profile.lastSeenCosmeticsCount === undefined) {
    const legacyProfile = profile as { hasVisitedCosmetics?: boolean }
    profile.lastSeenCosmeticsCount = legacyProfile.hasVisitedCosmetics ? profile.unlockedCosmetics.length : 0
    delete legacyProfile.hasVisitedCosmetics
  }
  if (profile.dismissedCosmeticsGuide === undefined) {
    profile.dismissedCosmeticsGuide = false
  }
  if (profile.consecutiveCheckInDays === undefined) {
    profile.consecutiveCheckInDays = 0
  }
  if (profile.lastCheckInDate === undefined) {
    profile.lastCheckInDate = null
  }
  return profile
}

const savedState = loadFromLocalStorage()

if (savedState?.userProfile) {
  savedState.userProfile = migrateProfile(savedState.userProfile)
}

export const useGameStore = create<StoreType>()((set, get) => ({
  userProfile: savedState?.userProfile ?? null,
  scenarioResults: savedState?.scenarioResults ?? [],
  missions: savedState?.missions ?? [],
  posts: savedState?.posts ?? treeHolePosts,

  createProfile: (characterType, nickname) => {
    const profile: UserProfile = {
      id: crypto.randomUUID(),
      characterType,
      nickname,
      level: 1,
      title: '初出茅庐的爸爸',
      createdAt: new Date().toISOString(),
      completedScenarios: [],
      unlockedSkills: [],
      completedMissions: [],
      earnedBadges: [],
      unlockedCosmetics: [],
      equippedCosmetics: {
        hat: null,
        cape: null,
        frame: null,
        accessory: null,
      },
      lastSeenCosmeticsCount: 0,
      dismissedCosmeticsGuide: false,
      consecutiveCheckInDays: 0,
      lastCheckInDate: null,
    }
    set({ userProfile: profile })
    saveToLocalStorage(get())
  },

  completeScenario: (scenarioId, choices) => {
    const state = get()
    if (!state.userProfile) return

    const result: ScenarioResult = {
      scenarioId,
      choices,
      completedAt: new Date().toISOString(),
    }

    const newLevel = state.userProfile.level + 1
    const newTitle = getTitleByLevel(newLevel)
    const newCompletedScenarios = [...state.userProfile.completedScenarios, scenarioId]

    const profileWithScenario: UserProfile = {
      ...state.userProfile,
      level: newLevel,
      title: newTitle,
      completedScenarios: newCompletedScenarios,
    }

    const newlyUnlocked = checkCosmeticUnlocks(profileWithScenario)

    set({
      scenarioResults: [...state.scenarioResults, result],
      userProfile: {
        ...profileWithScenario,
        unlockedCosmetics: [...state.userProfile.unlockedCosmetics, ...newlyUnlocked],
      },
    })
    saveToLocalStorage(get())
  },

  unlockSkill: (skillId) => {
    const state = get()
    if (!state.userProfile) return

    const newLevel = state.userProfile.level + 1
    const newTitle = getTitleByLevel(newLevel)
    const newUnlockedSkills = [...state.userProfile.unlockedSkills, skillId]
    const newEarnedBadges = [...state.userProfile.earnedBadges, `${skillId}-badge`]

    const profileWithSkill: UserProfile = {
      ...state.userProfile,
      level: newLevel,
      title: newTitle,
      unlockedSkills: newUnlockedSkills,
      earnedBadges: newEarnedBadges,
    }

    const newlyUnlocked = checkCosmeticUnlocks(profileWithSkill)

    set({
      userProfile: {
        ...profileWithSkill,
        unlockedCosmetics: [...state.userProfile.unlockedCosmetics, ...newlyUnlocked],
      },
    })
    saveToLocalStorage(get())
  },

  toggleMission: (missionId) => {
    const state = get()
    const mission = state.missions.find((m) => m.id === missionId)
    if (!mission) return

    const willBeCompleted = !mission.completed
    let newCompletedMissions = [...(state.userProfile?.completedMissions ?? [])]

    if (willBeCompleted) {
      if (!newCompletedMissions.includes(missionId)) {
        newCompletedMissions.push(missionId)
      }
    } else {
      newCompletedMissions = newCompletedMissions.filter((id) => id !== missionId)
    }

    let newProfile = state.userProfile
    if (state.userProfile) {
      newProfile = {
        ...state.userProfile,
        completedMissions: newCompletedMissions,
      }
    }

    set({
      missions: state.missions.map((m) =>
        m.id === missionId ? { ...m, completed: !m.completed } : m
      ),
      userProfile: newProfile,
    })
    saveToLocalStorage(get())
  },

  addMission: (mission) => {
    const state = get()
    set({ missions: [...state.missions, mission] })
    saveToLocalStorage(get())
  },

  removeMission: (missionId) => {
    const state = get()

    let newProfile = state.userProfile
    if (state.userProfile) {
      newProfile = {
        ...state.userProfile,
        completedMissions: state.userProfile.completedMissions.filter(
          (id) => id !== missionId
        ),
      }
    }

    set({
      missions: state.missions.filter((m) => m.id !== missionId),
      userProfile: newProfile,
    })
    saveToLocalStorage(get())
  },

  addPost: (post) => {
    const state = get()
    set({ posts: [post, ...state.posts] })
    saveToLocalStorage(get())
  },

  addReplyToPost: (postId, reply) => {
    const state = get()
    set({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, replies: [...p.replies, reply] } : p
      ),
    })
    saveToLocalStorage(get())
  },

  togglePostLike: (postId) => {
    const state = get()
    set({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, likes: p.likes + 1 } : p
      ),
    })
    saveToLocalStorage(get())
  },

  resetGame: () => {
    set({
      userProfile: null,
      scenarioResults: [],
      missions: [],
      posts: treeHolePosts,
    })
    localStorage.removeItem(STORAGE_KEY)
  },

  equipCosmetic: (cosmeticId) => {
    const state = get()
    if (!state.userProfile) return

    const cosmetic = cosmetics.find((c) => c.id === cosmeticId)
    if (!cosmetic) return
    if (!state.userProfile.unlockedCosmetics.includes(cosmeticId)) return

    const newEquipped: EquippedCosmetics = {
      ...state.userProfile.equippedCosmetics,
      [cosmetic.category]: cosmeticId,
    }

    set({
      userProfile: {
        ...state.userProfile,
        equippedCosmetics: newEquipped,
      },
    })
    saveToLocalStorage(get())
  },

  unequipCosmetic: (category) => {
    const state = get()
    if (!state.userProfile) return

    const newEquipped: EquippedCosmetics = {
      ...state.userProfile.equippedCosmetics,
      [category]: null,
    }

    set({
      userProfile: {
        ...state.userProfile,
        equippedCosmetics: newEquipped,
      },
    })
    saveToLocalStorage(get())
  },

  markCosmeticsSeen: () => {
    const state = get()
    if (!state.userProfile) return

    set({
      userProfile: {
        ...state.userProfile,
        lastSeenCosmeticsCount: state.userProfile.unlockedCosmetics.length,
        dismissedCosmeticsGuide: true,
      },
    })
    saveToLocalStorage(get())
  },

  dismissCosmeticsGuide: () => {
    const state = get()
    if (!state.userProfile) return

    set({
      userProfile: {
        ...state.userProfile,
        dismissedCosmeticsGuide: true,
        lastSeenCosmeticsCount: state.userProfile.unlockedCosmetics.length,
      },
    })
    saveToLocalStorage(get())
  },

  checkAndUnlockCosmetics: () => {
    const state = get()
    if (!state.userProfile) return []

    const newlyUnlocked = checkCosmeticUnlocks(state.userProfile)

    if (newlyUnlocked.length > 0) {
      set({
        userProfile: {
          ...state.userProfile,
          unlockedCosmetics: [...state.userProfile.unlockedCosmetics, ...newlyUnlocked],
        },
      })
      saveToLocalStorage(get())
    }

    return newlyUnlocked
  },

  checkInDaily: () => {
    const state = get()
    if (!state.userProfile) {
      return { success: false, streak: 0, newCosmetics: [] }
    }

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const lastCheckIn = state.userProfile.lastCheckInDate

    let newStreak = state.userProfile.consecutiveCheckInDays

    if (lastCheckIn) {
      const lastDate = new Date(lastCheckIn)
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      const lastDateStr = lastDate.toISOString().split('T')[0]

      if (lastDateStr === todayStr) {
        return { success: false, streak: newStreak, newCosmetics: [] }
      } else if (lastDateStr === yesterdayStr) {
        newStreak += 1
      } else {
        newStreak = 1
      }
    } else {
      newStreak = 1
    }

    const profileWithCheckIn: UserProfile = {
      ...state.userProfile,
      consecutiveCheckInDays: newStreak,
      lastCheckInDate: today.toISOString(),
    }

    const newlyUnlocked = checkCosmeticUnlocks(profileWithCheckIn)

    set({
      userProfile: {
        ...profileWithCheckIn,
        unlockedCosmetics: [...state.userProfile.unlockedCosmetics, ...newlyUnlocked],
      },
    })
    saveToLocalStorage(get())

    return { success: true, streak: newStreak, newCosmetics: newlyUnlocked }
  },
}))
