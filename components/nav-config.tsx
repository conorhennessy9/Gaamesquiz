import type { LucideIcon } from "lucide-react"
import {
  Home,
  CalendarDays,
  Trophy,
  Target,
  Timer,
  Grid3x3,
  UserSearch,
  Gamepad2,
  ListChecks,
  FolderOpen,
  Archive,
  LayoutDashboard,
  PlusCircle,
  Settings,
} from "lucide-react"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  /** Page doesn't exist yet — render as a disabled "Soon" placeholder */
  soon?: boolean
  /** Highlight this item when the pathname starts with one of these prefixes */
  matchPrefixes?: string[]
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Main",
    items: [
      { label: "Home", href: "/", icon: Home, matchPrefixes: ["/"] },
      { label: "Daily Quiz", href: "/", icon: CalendarDays, soon: true },
      { label: "Rugby", href: "/rugby", icon: Trophy, matchPrefixes: ["/rugby", "/game"] },
      { label: "GAA", href: "/gaa", icon: Target, matchPrefixes: ["/gaa"] },
    ],
  },
  {
    title: "Games",
    items: [
      { label: "Tenable", href: "/game/rugby-tenable", icon: ListChecks, matchPrefixes: ["/game/rugby-tenable", "/gaa/tenable"] },
      {
        label: "Against the Clock",
        href: "/game/against-the-clock",
        icon: Timer,
        matchPrefixes: ["/game/against-the-clock", "/gaa/against-the-clock"],
      },
      { label: "Bingo", href: "/game/rugby-bingo", icon: Grid3x3, matchPrefixes: ["/game/rugby-bingo"] },
      {
        label: "Guess the Player",
        href: "/game/guess-the-player",
        icon: UserSearch,
        matchPrefixes: ["/game/guess-the-player", "/gaa/name-the-player"],
      },
      { label: "Other Games", href: "#", icon: Gamepad2, soon: true },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Daily Questions", href: "#", icon: CalendarDays, soon: true },
      { label: "Categories", href: "#", icon: FolderOpen, soon: true },
      { label: "Question Archive", href: "#", icon: Archive, soon: true },
    ],
  },
  {
    title: "Admin",
    items: [
      { label: "CMS", href: "/cms", icon: Settings, matchPrefixes: ["/cms"] },
      { label: "Dashboard", href: "#", icon: LayoutDashboard, soon: true },
      { label: "Add Questions", href: "#", icon: PlusCircle, soon: true },
    ],
  },
]

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (!item.matchPrefixes) return false
  return item.matchPrefixes.some((prefix) => (prefix === "/" ? pathname === "/" : pathname.startsWith(prefix)))
}
