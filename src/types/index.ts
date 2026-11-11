export interface MemberStats {
  power: number;
  chaos: number;
  braincells: number;
  simpScore: number;
}

export interface GangMember {
  id: string;
  name: string;
  role: string;
  icon: string;
  color: string;
  accentHex: string;
  stats: MemberStats;
  quote: string;
}

export interface TierInfo {
  tierNumber: string;
  badge: string;
  badgeColor: string;
  title: string;
  icon: string;
  iconColor: string;
  borderColor: string;
  description: string;
  perks: string[];
}

export interface LoreEntry {
  name: string;
  title: string;
  icon: string;
  badge: string;
  accentColor: string;
  borderColor: string;
  story: string;
}

export interface WheelItem {
  label: string;
  color: string;
  weight: number;
  description?: string;
}
