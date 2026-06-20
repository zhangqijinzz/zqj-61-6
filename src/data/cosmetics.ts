import type { CosmeticItem } from '@/types'

export const cosmetics: CosmeticItem[] = [
  {
    id: 'hat-basic',
    name: '新手冒险者帽',
    description: '一顶朴素但实用的帽子，象征着冒险的开始',
    category: 'hat',
    emoji: '🎩',
    unlockCondition: { type: 'level', target: 2 },
    rarity: 'common',
  },
  {
    id: 'hat-hero',
    name: '英雄冠冕',
    description: '只有真正的英雄才能佩戴的荣耀之冠',
    category: 'hat',
    emoji: '👑',
    unlockCondition: { type: 'scenario', target: 'all' },
    rarity: 'legendary',
  },
  {
    id: 'hat-santa',
    name: '温暖圣诞帽',
    description: '充满节日气氛的红色帽子',
    category: 'hat',
    emoji: '🎅',
    unlockCondition: { type: 'streak', target: 7 },
    rarity: 'rare',
  },
  {
    id: 'hat-graduate',
    name: '学士帽',
    description: '掌握足够多技能后的荣誉象征',
    category: 'hat',
    emoji: '🎓',
    unlockCondition: { type: 'skill', target: 5 },
    rarity: 'epic',
  },
  {
    id: 'hat-crown',
    name: '小公主的皇冠',
    description: '女儿亲手为爸爸制作的纸皇冠',
    category: 'hat',
    emoji: '👸',
    unlockCondition: { type: 'badge', target: '3' },
    rarity: 'rare',
  },
  {
    id: 'cape-red',
    name: '正义披风',
    description: '鲜红色的披风，让你看起来像个超级英雄',
    category: 'cape',
    emoji: '🧥',
    unlockCondition: { type: 'level', target: 5 },
    rarity: 'common',
  },
  {
    id: 'cape-royal',
    name: '皇家披风',
    description: '紫色的华丽披风，彰显尊贵身份',
    category: 'cape',
    emoji: '👘',
    unlockCondition: { type: 'scenario', target: 3 },
    rarity: 'epic',
  },
  {
    id: 'cape-invisible',
    name: '隐形披风',
    description: '传说中的神器，戴上后可以隐身（其实并没有）',
    category: 'cape',
    emoji: '✨',
    unlockCondition: { type: 'streak', target: 14 },
    rarity: 'legendary',
  },
  {
    id: 'frame-gold',
    name: '黄金边框',
    description: '闪闪发光的金色边框，彰显尊贵',
    category: 'frame',
    emoji: '🟨',
    unlockCondition: { type: 'level', target: 10 },
    rarity: 'epic',
  },
  {
    id: 'frame-rainbow',
    name: '彩虹边框',
    description: '七彩斑斓的彩虹边框，充满活力',
    category: 'frame',
    emoji: '🌈',
    unlockCondition: { type: 'skill', target: 'all' },
    rarity: 'legendary',
  },
  {
    id: 'frame-flower',
    name: '花环边框',
    description: '用美丽鲜花编织的边框',
    category: 'frame',
    emoji: '🌸',
    unlockCondition: { type: 'scenario', target: 1 },
    rarity: 'common',
  },
  {
    id: 'frame-heart',
    name: '爱心边框',
    description: '满满的爱心，象征着对女儿的爱',
    category: 'frame',
    emoji: '💝',
    unlockCondition: { type: 'streak', target: 3 },
    rarity: 'common',
  },
  {
    id: 'accessory-sword',
    name: '勇气之剑',
    description: '象征勇气的小佩剑装饰',
    category: 'accessory',
    emoji: '⚔️',
    unlockCondition: { type: 'scenario', target: 2 },
    rarity: 'rare',
  },
  {
    id: 'accessory-shield',
    name: '守护之盾',
    description: '象征守护的小盾牌装饰',
    category: 'accessory',
    emoji: '🛡️',
    unlockCondition: { type: 'skill', target: 3 },
    rarity: 'rare',
  },
  {
    id: 'accessory-flower',
    name: '小红花',
    description: '女儿奖励给你的大红花',
    category: 'accessory',
    emoji: '🌺',
    unlockCondition: { type: 'streak', target: 5 },
    rarity: 'common',
  },
  {
    id: 'accessory-star',
    name: '幸运星',
    description: '闪闪发光的幸运星',
    category: 'accessory',
    emoji: '⭐',
    unlockCondition: { type: 'badge', target: '5' },
    rarity: 'epic',
  },
]

export const categoryLabels: Record<string, string> = {
  hat: '帽子',
  cape: '披风',
  frame: '边框',
  accessory: '配饰',
}

export const rarityColors: Record<string, string> = {
  common: 'text-gray-500 bg-gray-100',
  rare: 'text-blue-600 bg-blue-100',
  epic: 'text-purple-600 bg-purple-100',
  legendary: 'text-amber-600 bg-amber-100',
}

export const rarityLabels: Record<string, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
}

export function getUnlockConditionText(item: CosmeticItem): string {
  const { type, target } = item.unlockCondition
  switch (type) {
    case 'level':
      return `达到 ${target} 级`
    case 'scenario':
      return target === 'all' ? '完成所有情景' : `完成 ${target} 个情景`
    case 'skill':
      return target === 'all' ? '解锁所有技能' : `解锁 ${target} 个技能`
    case 'streak':
      return `连续打卡 ${target} 天`
    case 'badge':
      return `获得 ${target} 个徽章`
    default:
      return '神秘条件'
  }
}
