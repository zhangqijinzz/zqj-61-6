import { useMemo } from "react"
import { CharacterType, EquippedCosmetics } from "@/types"
import { useGameStore } from "@/store/useGameStore"
import { cosmetics } from "@/data/cosmetics"

const characterConfig: Record<
  CharacterType,
  { gradient: string; emoji: string }
> = {
  knight: { gradient: "from-amber-400 to-orange-600", emoji: "🛡️" },
  warrior: { gradient: "from-red-400 to-rose-600", emoji: "⚔️" },
  guardian: { gradient: "from-blue-400 to-indigo-600", emoji: "🌟" },
  ranger: { gradient: "from-green-400 to-emerald-600", emoji: "🏹" },
}

const sizeMap = {
  sm: { container: "w-10 h-10", emoji: "text-lg", hat: "text-sm", cape: "text-sm", accessory: "text-xs" },
  md: { container: "w-16 h-16", emoji: "text-2xl", hat: "text-xl", cape: "text-xl", accessory: "text-sm" },
  lg: { container: "w-24 h-24", emoji: "text-4xl", hat: "text-3xl", cape: "text-3xl", accessory: "text-xl" },
}

interface CharacterAvatarProps {
  characterType: CharacterType
  size?: "sm" | "md" | "lg"
  equippedCosmetics?: EquippedCosmetics | null
  showAnimation?: boolean
}

export default function CharacterAvatar({
  characterType,
  size = "md",
  equippedCosmetics: customEquipped,
  showAnimation = true,
}: CharacterAvatarProps) {
  const storeEquipped = useGameStore((s) => s.userProfile?.equippedCosmetics)
  const equipped = customEquipped ?? storeEquipped
  const { gradient, emoji } = characterConfig[characterType]
  const sizes = sizeMap[size]

  const equippedItems = useMemo(() => {
    if (!equipped) return { hat: null, cape: null, frame: null, accessory: null }
    return {
      hat: equipped.hat ? cosmetics.find((c) => c.id === equipped.hat) : null,
      cape: equipped.cape ? cosmetics.find((c) => c.id === equipped.cape) : null,
      frame: equipped.frame ? cosmetics.find((c) => c.id === equipped.frame) : null,
      accessory: equipped.accessory ? cosmetics.find((c) => c.id === equipped.accessory) : null,
    }
  }, [equipped])

  const frameClasses = useMemo(() => {
    if (!equippedItems.frame) return ""
    switch (equippedItems.frame.id) {
      case "frame-gold":
        return "ring-4 ring-yellow-400 ring-offset-2 shadow-yellow-400/50"
      case "frame-rainbow":
        return "ring-4 ring-transparent bg-clip-padding animate-rainbow-border"
      case "frame-flower":
        return "ring-4 ring-pink-400 ring-offset-2 shadow-pink-400/50"
      case "frame-heart":
        return "ring-4 ring-rose-400 ring-offset-2 shadow-rose-400/50"
      default:
        return ""
    }
  }, [equippedItems.frame])

  return (
    <div className="relative inline-block">
      {equippedItems.cape && (
        <span
          className={`absolute -left-1 -bottom-1 ${sizes.cape} z-0 transform -rotate-12`}
        >
          {equippedItems.cape.emoji}
        </span>
      )}

      <div
        className={`relative ${sizes.container} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center border-2 border-white shadow-lg ${frameClasses} ${
          showAnimation && size === "lg" ? "animate-float" : ""
        } z-10 overflow-visible`}
      >
        {equippedItems.hat && (
          <span
            className={`absolute -top-3 left-1/2 -translate-x-1/2 ${sizes.hat} z-20`}
          >
            {equippedItems.hat.emoji}
          </span>
        )}

        <span className="z-10">{emoji}</span>

        {equippedItems.accessory && (
          <span
            className={`absolute -right-1 -bottom-1 ${sizes.accessory} z-20`}
          >
            {equippedItems.accessory.emoji}
          </span>
        )}
      </div>
    </div>
  )
}
