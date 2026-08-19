"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  X,
  Settings,
  Upload,
  Download,
  Shuffle,
} from "lucide-react"
import Link from "next/link"

interface PlayerData {
  name: string
  country: string
  competitions: string[]
  achievements: string[]
  position: string
  caps: number
  isActive: boolean
}

interface BingoCategory {
  id: string
  name: string
  icon: string
  type: "country" | "competition" | "achievement" | "position"
  color: string
}

interface AutoBingoConfig {
  enabled: boolean
  categoriesPerGame: number
  playersPerGame: number
  difficulty: "Easy" | "Medium" | "Hard"
  lastGenerated: string
}

// Predefined categories with icons
const PREDEFINED_CATEGORIES: BingoCategory[] = [
  // Countries
  { id: "new-zealand", name: "New Zealand", icon: "🇳🇿", type: "country", color: "bg-black" },
  { id: "australia", name: "Australia", icon: "🇦🇺", type: "country", color: "bg-yellow-500" },
  { id: "south-africa", name: "South Africa", icon: "🇿🇦", type: "country", color: "bg-green-600" },
  { id: "england", name: "England", icon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", type: "country", color: "bg-red-600" },
  { id: "france", name: "France", icon: "🇫🇷", type: "country", color: "bg-blue-500" },
  { id: "wales", name: "Wales", icon: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", type: "country", color: "bg-red-500" },
  { id: "ireland", name: "Ireland", icon: "🇮🇪", type: "country", color: "bg-green-500" },
  { id: "scotland", name: "Scotland", icon: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", type: "country", color: "bg-blue-600" },
  { id: "italy", name: "Italy", icon: "🇮🇹", type: "country", color: "bg-green-400" },
  { id: "argentina", name: "Argentina", icon: "🇦🇷", type: "country", color: "bg-blue-400" },
  { id: "japan", name: "Japan", icon: "🇯🇵", type: "country", color: "bg-red-400" },

  // Competitions
  { id: "world-cup", name: "World Cup", icon: "🏆", type: "competition", color: "bg-yellow-600" },
  { id: "six-nations", name: "Six Nations", icon: "👑", type: "competition", color: "bg-purple-600" },
  { id: "super-rugby", name: "Super Rugby", icon: "⚡", type: "competition", color: "bg-blue-600" },
  { id: "champions-cup", name: "Champions Cup", icon: "🌟", type: "competition", color: "bg-indigo-600" },
  { id: "lions", name: "British & Irish Lions", icon: "🦁", type: "competition", color: "bg-orange-600" },
  { id: "rugby-championship", name: "Rugby Championship", icon: "🏅", type: "competition", color: "bg-amber-600" },
  { id: "premiership", name: "Premiership", icon: "🎯", type: "competition", color: "bg-emerald-600" },
  { id: "top-14", name: "Top 14", icon: "⭐", type: "competition", color: "bg-violet-600" },
  { id: "urc", name: "URC", icon: "🔥", type: "competition", color: "bg-rose-600" },

  // Achievements
  { id: "world-cup-winner", name: "World Cup Winner", icon: "🥇", type: "achievement", color: "bg-yellow-500" },
  { id: "grand-slam", name: "Grand Slam Winner", icon: "👑", type: "achievement", color: "bg-purple-500" },
  { id: "lions-captain", name: "Lions Captain", icon: "🦁", type: "achievement", color: "bg-orange-500" },
  { id: "100-caps", name: "100+ Caps", icon: "💪", type: "achievement", color: "bg-red-500" },
  { id: "top-try-scorer", name: "Top Try Scorer", icon: "⚡", type: "achievement", color: "bg-blue-500" },
  { id: "top-points-scorer", name: "Top Points Scorer", icon: "🎯", type: "achievement", color: "bg-green-500" },
  { id: "player-of-tournament", name: "Player of Tournament", icon: "🌟", type: "achievement", color: "bg-indigo-500" },
  { id: "hall-of-fame", name: "Hall of Fame", icon: "⭐", type: "achievement", color: "bg-violet-500" },

  // Positions
  { id: "front-row", name: "Front Row", icon: "1️⃣", type: "position", color: "bg-slate-600" },
  { id: "second-row", name: "Second Row", icon: "4️⃣", type: "position", color: "bg-slate-500" },
  { id: "back-row", name: "Back Row", icon: "6️⃣", type: "position", color: "bg-slate-700" },
  { id: "half-back", name: "Half Back", icon: "9️⃣", type: "position", color: "bg-gray-600" },
  { id: "centre", name: "Centre", icon: "1️⃣2️⃣", type: "position", color: "bg-gray-500" },
  { id: "back-three", name: "Back Three", icon: "1️⃣5️⃣", type: "position", color: "bg-gray-700" },
]

export default function RugbyBingoAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [currentView, setCurrentView] = useState<"dashboard" | "players" | "config">("dashboard")
  const [players, setPlayers] = useState<PlayerData[]>([])
  const [autoConfig, setAutoConfig] = useState<AutoBingoConfig>({
    enabled: true,
    categoriesPerGame: 9,
    playersPerGame: 20,
    difficulty: "Medium",
    lastGenerated: "",
  })
  const [newPlayer, setNewPlayer] = useState<PlayerData>({
    name: "",
    country: "",
    competitions: [],
    achievements: [],
    position: "",
    caps: 0,
    isActive: true,
  })
  const [editingPlayer, setEditingPlayer] = useState<PlayerData | null>(null)

  // Check authentication
  useEffect(() => {
    const authStatus = localStorage.getItem("rugbyBingoAdminAuth")
    const authTime = localStorage.getItem("rugbyBingoAdminAuthTime")

    if (authStatus === "true" && authTime) {
      const timeDiff = Date.now() - Number.parseInt(authTime)
      if (timeDiff < 7 * 24 * 60 * 60 * 1000) {
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem("rugbyBingoAdminAuth")
        localStorage.removeItem("rugbyBingoAdminAuthTime")
      }
    }
  }, [])

  // Load data
  useEffect(() => {
    if (isAuthenticated) {
      const savedPlayers = localStorage.getItem("rugbyBingoPlayers")
      const savedConfig = localStorage.getItem("rugbyBingoAutoConfig")

      if (savedPlayers) {
        setPlayers(JSON.parse(savedPlayers))
      } else {
        // Initialize with comprehensive player database
        const defaultPlayers: PlayerData[] = [
          // New Zealand Legends
          {
            name: "Richie McCaw",
            country: "new-zealand",
            competitions: ["super-rugby", "rugby-championship"],
            achievements: ["world-cup-winner", "100-caps", "lions-captain"],
            position: "back-row",
            caps: 148,
            isActive: true,
          },
          {
            name: "Dan Carter",
            country: "new-zealand",
            competitions: ["super-rugby", "rugby-championship"],
            achievements: ["world-cup-winner", "top-points-scorer", "player-of-tournament"],
            position: "half-back",
            caps: 112,
            isActive: true,
          },
          {
            name: "Beauden Barrett",
            country: "new-zealand",
            competitions: ["super-rugby", "rugby-championship"],
            achievements: ["player-of-tournament"],
            position: "half-back",
            caps: 115,
            isActive: true,
          },
          {
            name: "Ardie Savea",
            country: "new-zealand",
            competitions: ["super-rugby", "rugby-championship"],
            achievements: ["player-of-tournament"],
            position: "back-row",
            caps: 75,
            isActive: true,
          },

          // South African Stars
          {
            name: "Siya Kolisi",
            country: "south-africa",
            competitions: ["super-rugby", "rugby-championship"],
            achievements: ["world-cup-winner", "lions-captain"],
            position: "back-row",
            caps: 85,
            isActive: true,
          },
          {
            name: "Cheslin Kolbe",
            country: "south-africa",
            competitions: ["top-14", "rugby-championship"],
            achievements: ["world-cup-winner", "top-try-scorer"],
            position: "back-three",
            caps: 35,
            isActive: true,
          },
          {
            name: "Eben Etzebeth",
            country: "south-africa",
            competitions: ["super-rugby", "rugby-championship"],
            achievements: ["world-cup-winner", "100-caps"],
            position: "second-row",
            caps: 110,
            isActive: true,
          },
          {
            name: "Handré Pollard",
            country: "south-africa",
            competitions: ["super-rugby", "top-14"],
            achievements: ["world-cup-winner", "top-points-scorer"],
            position: "half-back",
            caps: 70,
            isActive: true,
          },

          // English Heroes
          {
            name: "Jonny Wilkinson",
            country: "england",
            competitions: ["six-nations", "premiership"],
            achievements: ["world-cup-winner", "grand-slam", "top-points-scorer", "hall-of-fame"],
            position: "half-back",
            caps: 91,
            isActive: true,
          },
          {
            name: "Owen Farrell",
            country: "england",
            competitions: ["six-nations", "premiership", "champions-cup"],
            achievements: ["grand-slam", "top-points-scorer"],
            position: "half-back",
            caps: 112,
            isActive: true,
          },
          {
            name: "Maro Itoje",
            country: "england",
            competitions: ["six-nations", "premiership", "champions-cup", "lions"],
            achievements: ["grand-slam", "lions-captain"],
            position: "second-row",
            caps: 75,
            isActive: true,
          },
          {
            name: "Marcus Smith",
            country: "england",
            competitions: ["six-nations", "premiership", "champions-cup"],
            achievements: ["grand-slam"],
            position: "half-back",
            caps: 25,
            isActive: true,
          },

          // French Flair
          {
            name: "Antoine Dupont",
            country: "france",
            competitions: ["six-nations", "top-14", "champions-cup"],
            achievements: ["grand-slam", "player-of-tournament"],
            position: "half-back",
            caps: 55,
            isActive: true,
          },
          {
            name: "Romain Ntamack",
            country: "france",
            competitions: ["six-nations", "top-14", "champions-cup"],
            achievements: ["grand-slam"],
            position: "half-back",
            caps: 35,
            isActive: true,
          },
          {
            name: "Grégory Alldritt",
            country: "france",
            competitions: ["six-nations", "top-14", "champions-cup"],
            achievements: ["grand-slam"],
            position: "back-row",
            caps: 45,
            isActive: true,
          },

          // Welsh Warriors
          {
            name: "Alun Wyn Jones",
            country: "wales",
            competitions: ["six-nations", "urc", "champions-cup", "lions"],
            achievements: ["grand-slam", "lions-captain", "100-caps"],
            position: "second-row",
            caps: 158,
            isActive: true,
          },
          {
            name: "George North",
            country: "wales",
            competitions: ["six-nations", "urc", "champions-cup", "lions"],
            achievements: ["grand-slam", "top-try-scorer"],
            position: "back-three",
            caps: 115,
            isActive: true,
          },
          {
            name: "Dan Biggar",
            country: "wales",
            competitions: ["six-nations", "premiership", "champions-cup", "lions"],
            achievements: ["grand-slam"],
            position: "half-back",
            caps: 112,
            isActive: true,
          },

          // Irish Icons
          {
            name: "Brian O'Driscoll",
            country: "ireland",
            competitions: ["six-nations", "urc", "champions-cup", "lions"],
            achievements: ["grand-slam", "lions-captain", "100-caps", "hall-of-fame"],
            position: "centre",
            caps: 133,
            isActive: true,
          },
          {
            name: "Johnny Sexton",
            country: "ireland",
            competitions: ["six-nations", "top-14", "urc", "champions-cup", "lions"],
            achievements: ["grand-slam", "top-points-scorer", "player-of-tournament"],
            position: "half-back",
            caps: 115,
            isActive: true,
          },
          {
            name: "Tadhg Furlong",
            country: "ireland",
            competitions: ["six-nations", "urc", "champions-cup", "lions"],
            achievements: ["grand-slam"],
            position: "front-row",
            caps: 75,
            isActive: true,
          },

          // Scottish Legends
          {
            name: "Stuart Hogg",
            country: "scotland",
            competitions: ["six-nations", "urc", "champions-cup", "lions"],
            achievements: ["top-try-scorer"],
            position: "back-three",
            caps: 100,
            isActive: true,
          },
          {
            name: "Finn Russell",
            country: "scotland",
            competitions: ["six-nations", "top-14", "urc", "champions-cup", "lions"],
            achievements: [],
            position: "half-back",
            caps: 75,
            isActive: true,
          },

          // Australian Legends
          {
            name: "David Pocock",
            country: "australia",
            competitions: ["super-rugby", "rugby-championship"],
            achievements: ["player-of-tournament"],
            position: "back-row",
            caps: 83,
            isActive: true,
          },
          {
            name: "Michael Hooper",
            country: "australia",
            competitions: ["super-rugby", "rugby-championship"],
            achievements: ["100-caps"],
            position: "back-row",
            caps: 125,
            isActive: true,
          },

          // Italian Stars
          {
            name: "Sergio Parisse",
            country: "italy",
            competitions: ["six-nations", "top-14", "champions-cup"],
            achievements: ["100-caps", "hall-of-fame"],
            position: "back-row",
            caps: 142,
            isActive: true,
          },

          // Argentine Heroes
          {
            name: "Juan Martín Hernández",
            country: "argentina",
            competitions: ["rugby-championship"],
            achievements: ["player-of-tournament"],
            position: "half-back",
            caps: 74,
            isActive: true,
          },

          // Japanese Stars
          {
            name: "Michael Leitch",
            country: "japan",
            competitions: ["super-rugby"],
            achievements: ["player-of-tournament"],
            position: "back-row",
            caps: 75,
            isActive: true,
          },
        ]
        setPlayers(defaultPlayers)
        localStorage.setItem("rugbyBingoPlayers", JSON.stringify(defaultPlayers))
      }

      if (savedConfig) {
        setAutoConfig(JSON.parse(savedConfig))
      }
    }
  }, [isAuthenticated])

  const handleLogin = () => {
    const adminPassword = "Isaeden123!"
    if (password === adminPassword) {
      setIsAuthenticated(true)
      setLoginError("")
      localStorage.setItem("rugbyBingoAdminAuth", "true")
      localStorage.setItem("rugbyBingoAdminAuthTime", Date.now().toString())
    } else {
      setLoginError("Incorrect password. Please try again.")
      setPassword("")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("rugbyBingoAdminAuth")
    localStorage.removeItem("rugbyBingoAdminAuthTime")
  }

  const savePlayers = (updatedPlayers: PlayerData[]) => {
    setPlayers(updatedPlayers)
    localStorage.setItem("rugbyBingoPlayers", JSON.stringify(updatedPlayers))
  }

  const saveConfig = (updatedConfig: AutoBingoConfig) => {
    setAutoConfig(updatedConfig)
    localStorage.setItem("rugbyBingoAutoConfig", JSON.stringify(updatedConfig))
  }

  const generateDailyBingo = () => {
    if (players.length === 0) return

    // Get today's date as seed for consistent daily generation
    const today = new Date().toDateString()
    const seed = today.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)

    // Seeded random function
    let seedValue = Math.abs(seed)
    const seededRandom = () => {
      seedValue = (seedValue * 9301 + 49297) % 233280
      return seedValue / 233280
    }

    // Select random categories (ensuring we have enough variety)
    const availableCategories = [...PREDEFINED_CATEGORIES]
    const selectedCategories: BingoCategory[] = []

    // Ensure we have at least 2 countries, 2 competitions, and mix of others
    const countries = availableCategories.filter((c) => c.type === "country")
    const competitions = availableCategories.filter((c) => c.type === "competition")
    const achievements = availableCategories.filter((c) => c.type === "achievement")
    const positions = availableCategories.filter((c) => c.type === "position")

    // Add 3 random countries
    for (let i = 0; i < 3 && countries.length > 0; i++) {
      const index = Math.floor(seededRandom() * countries.length)
      selectedCategories.push(countries.splice(index, 1)[0])
    }

    // Add 3 random competitions
    for (let i = 0; i < 3 && competitions.length > 0; i++) {
      const index = Math.floor(seededRandom() * competitions.length)
      selectedCategories.push(competitions.splice(index, 1)[0])
    }

    // Add 2 achievements
    for (let i = 0; i < 2 && achievements.length > 0; i++) {
      const index = Math.floor(seededRandom() * achievements.length)
      selectedCategories.push(achievements.splice(index, 1)[0])
    }

    // Add 1 position
    if (positions.length > 0) {
      const index = Math.floor(seededRandom() * positions.length)
      selectedCategories.push(positions[index])
    }

    // Select random players
    const activePlayers = players.filter((p) => p.isActive)
    const selectedPlayers: string[] = []
    const playersCopy = [...activePlayers]

    for (let i = 0; i < Math.min(autoConfig.playersPerGame, playersCopy.length); i++) {
      const index = Math.floor(seededRandom() * playersCopy.length)
      selectedPlayers.push(playersCopy.splice(index, 1)[0].name)
    }

    // Create player data mapping
    const playerData: Record<string, { categories: string[] }> = {}
    selectedPlayers.forEach((playerName) => {
      const player = players.find((p) => p.name === playerName)
      if (player) {
        const categories: string[] = []

        // Add country
        if (selectedCategories.some((c) => c.id === player.country)) {
          categories.push(player.country)
        }

        // Add competitions
        player.competitions.forEach((comp) => {
          if (selectedCategories.some((c) => c.id === comp)) {
            categories.push(comp)
          }
        })

        // Add achievements
        player.achievements.forEach((achievement) => {
          if (selectedCategories.some((c) => c.id === achievement)) {
            categories.push(achievement)
          }
        })

        // Add position category
        const positionCategory = selectedCategories.find((c) => c.type === "position")
        if (positionCategory && player.position === positionCategory.id.replace("-", "_")) {
          categories.push(positionCategory.id)
        }

        playerData[playerName] = { categories }
      }
    })

    // Save generated game
    const generatedGame = {
      id: Date.now(),
      title: `Daily Rugby Bingo - ${new Date().toLocaleDateString()}`,
      description: "Match rugby legends to their countries, competitions, and achievements",
      categories: selectedCategories,
      playerSequence: selectedPlayers,
      playerData,
      difficulty: autoConfig.difficulty,
      createdAt: new Date().toISOString(),
      isActive: true,
      isDaily: true,
      date: today,
    }

    // Save to localStorage
    localStorage.setItem("rugbyBingoDailyGame", JSON.stringify(generatedGame))

    // Update config
    const updatedConfig = { ...autoConfig, lastGenerated: today }
    saveConfig(updatedConfig)

    return generatedGame
  }

  const addPlayer = () => {
    if (!newPlayer.name.trim()) return

    const updatedPlayers = [...players, { ...newPlayer, name: newPlayer.name.trim() }]
    savePlayers(updatedPlayers)

    setNewPlayer({
      name: "",
      country: "",
      competitions: [],
      achievements: [],
      position: "",
      caps: 0,
      isActive: true,
    })
  }

  const updatePlayer = (index: number, updatedPlayer: PlayerData) => {
    const updatedPlayers = [...players]
    updatedPlayers[index] = updatedPlayer
    savePlayers(updatedPlayers)
  }

  const deletePlayer = (index: number) => {
    const updatedPlayers = players.filter((_, i) => i !== index)
    savePlayers(updatedPlayers)
  }

  const exportData = () => {
    const data = { players, autoConfig }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "rugby-bingo-data.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.players) {
          savePlayers(data.players)
        }
        if (data.autoConfig) {
          saveConfig(data.autoConfig)
        }
      } catch (error) {
        alert("Invalid file format")
      }
    }
    reader.readAsText(file)
  }

  // Login Screen
  const LoginScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
      <Card className="bg-slate-800 border-slate-700 max-w-md w-full mx-4">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-white">Rugby Bingo Admin</CardTitle>
          <p className="text-slate-400">Automated daily bingo generation</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">Admin Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-lime-400 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="bg-red-900/50 border border-red-700 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-300">
                  <X className="w-4 h-4" />
                  <span className="text-sm">{loginError}</span>
                </div>
              </div>
            )}

            <Button
              onClick={handleLogin}
              className="w-full bg-lime-400 hover:bg-lime-500 text-black font-bold py-3"
              disabled={!password.trim()}
            >
              <Lock className="w-4 h-4 mr-2" />
              Access Admin Panel
            </Button>
          </div>

          <div className="border-t border-slate-700 pt-6">
            <div className="text-center">
              <Link href="/game/rugby-bingo">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Game
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Dashboard View
  const DashboardView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-lime-400 mb-2">{players.filter((p) => p.isActive).length}</div>
            <div className="text-slate-400">Active Players</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{PREDEFINED_CATEGORIES.length}</div>
            <div className="text-slate-400">Available Categories</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{autoConfig.enabled ? "ON" : "OFF"}</div>
            <div className="text-slate-400">Auto Generation</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Daily Bingo Generation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Automatic Daily Games</div>
              <div className="text-slate-400 text-sm">Generates new bingo games daily using your player database</div>
            </div>
            <Button onClick={generateDailyBingo} className="bg-lime-400 hover:bg-lime-500 text-black font-bold">
              <Shuffle className="w-4 h-4 mr-2" />
              Generate Today's Game
            </Button>
          </div>

          {autoConfig.lastGenerated && (
            <div className="text-slate-400 text-sm">
              Last generated: {new Date(autoConfig.lastGenerated).toLocaleDateString()}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => setCurrentView("players")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Edit className="w-4 h-4 mr-2" />
              Manage Players
            </Button>
            <Button
              onClick={() => setCurrentView("config")}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Auto Config
            </Button>
            <Button onClick={exportData} className="w-full bg-green-600 hover:bg-green-700 text-white">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Import Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-slate-400 text-sm">Upload a JSON file to import players and configuration</div>
              <label className="block">
                <input type="file" accept=".json" onChange={importData} className="hidden" />
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Import JSON File
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // Players Management View
  const PlayersView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Player Database</h2>
        <div className="text-slate-400">{players.filter((p) => p.isActive).length} active players</div>
      </div>

      {/* Add New Player */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Add New Player</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              value={newPlayer.name}
              onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
              placeholder="Player name"
              className="bg-slate-700 border-slate-600 text-white"
            />
            <Select value={newPlayer.country} onValueChange={(value) => setNewPlayer({ ...newPlayer, country: value })}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {PREDEFINED_CATEGORIES.filter((c) => c.type === "country").map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.icon} {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={newPlayer.caps}
              onChange={(e) => setNewPlayer({ ...newPlayer, caps: Number.parseInt(e.target.value) || 0 })}
              placeholder="Caps"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-medium mb-2">Competitions</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {PREDEFINED_CATEGORIES.filter((c) => c.type === "competition").map((comp) => (
                  <label key={comp.id} className="flex items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={newPlayer.competitions.includes(comp.id)}
                      onChange={(e) => {
                        const competitions = e.target.checked
                          ? [...newPlayer.competitions, comp.id]
                          : newPlayer.competitions.filter((c) => c !== comp.id)
                        setNewPlayer({ ...newPlayer, competitions })
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">
                      {comp.icon} {comp.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Achievements</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {PREDEFINED_CATEGORIES.filter((c) => c.type === "achievement").map((achievement) => (
                  <label key={achievement.id} className="flex items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={newPlayer.achievements.includes(achievement.id)}
                      onChange={(e) => {
                        const achievements = e.target.checked
                          ? [...newPlayer.achievements, achievement.id]
                          : newPlayer.achievements.filter((a) => a !== achievement.id)
                        setNewPlayer({ ...newPlayer, achievements })
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">
                      {achievement.icon} {achievement.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={addPlayer}
            disabled={!newPlayer.name.trim() || !newPlayer.country}
            className="bg-lime-400 hover:bg-lime-500 text-black font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Player
          </Button>
        </CardContent>
      </Card>

      {/* Players List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((player, index) => (
          <Card key={index} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold">{player.name}</h3>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    onClick={() => setEditingPlayer(player)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-600 text-red-400 hover:bg-red-900/20"
                    onClick={() => deletePlayer(index)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Country:</span>
                  <span className="text-white">
                    {PREDEFINED_CATEGORIES.find((c) => c.id === player.country)?.icon}{" "}
                    {PREDEFINED_CATEGORIES.find((c) => c.id === player.country)?.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Caps:</span>
                  <span className="text-white">{player.caps}</span>
                </div>

                <div>
                  <span className="text-slate-400">Competitions:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {player.competitions.map((compId) => {
                      const comp = PREDEFINED_CATEGORIES.find((c) => c.id === compId)
                      return comp ? (
                        <span key={compId} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                          {comp.icon}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400">Achievements:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {player.achievements.map((achievementId) => {
                      const achievement = PREDEFINED_CATEGORIES.find((c) => c.id === achievementId)
                      return achievement ? (
                        <span key={achievementId} className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                          {achievement.icon}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  // Config View
  const ConfigView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Auto Generation Configuration</h2>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Daily Game Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-medium mb-2">Players per Game</label>
              <Select
                value={autoConfig.playersPerGame.toString()}
                onValueChange={(value) => saveConfig({ ...autoConfig, playersPerGame: Number.parseInt(value) })}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 Players</SelectItem>
                  <SelectItem value="20">20 Players</SelectItem>
                  <SelectItem value="25">25 Players</SelectItem>
                  <SelectItem value="30">30 Players</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Default Difficulty</label>
              <Select
                value={autoConfig.difficulty}
                onValueChange={(value: "Easy" | "Medium" | "Hard") => saveConfig({ ...autoConfig, difficulty: value })}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={autoConfig.enabled}
              onChange={(e) => saveConfig({ ...autoConfig, enabled: e.target.checked })}
              className="rounded"
            />
            <label className="text-white font-medium">Enable automatic daily generation</label>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">How it works:</h4>
            <ul className="text-slate-400 text-sm space-y-1">
              <li>• Uses today's date as a seed for consistent daily games</li>
              <li>• Randomly selects 9 categories (3 countries, 3 competitions, 2 achievements, 1 position)</li>
              <li>• Picks random players from your database</li>
              <li>• Automatically matches players to their categories</li>
              <li>• Same game for everyone on the same day</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <header className="p-4 border-b border-purple-700/50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/game/rugby-bingo">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <div className="text-center">
              <div className="text-lime-400 font-semibold text-sm">Rugby Bingo Admin</div>
              <h1 className="text-white font-bold text-lg">Automated Daily Generation</h1>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-red-600 text-red-400 hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-center gap-2">
          <Button
            onClick={() => setCurrentView("dashboard")}
            className={`px-6 py-2 rounded-full font-bold ${
              currentView === "dashboard"
                ? "bg-lime-400 text-black"
                : "bg-transparent border-2 border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-black"
            }`}
          >
            Dashboard
          </Button>
          <Button
            onClick={() => setCurrentView("players")}
            className={`px-6 py-2 rounded-full font-bold ${
              currentView === "players"
                ? "bg-lime-400 text-black"
                : "bg-transparent border-2 border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-black"
            }`}
          >
            Players ({players.length})
          </Button>
          <Button
            onClick={() => setCurrentView("config")}
            className={`px-6 py-2 rounded-full font-bold ${
              currentView === "config"
                ? "bg-lime-400 text-black"
                : "bg-transparent border-2 border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-black"
            }`}
          >
            Auto Config
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8">
        {currentView === "dashboard" && <DashboardView />}
        {currentView === "players" && <PlayersView />}
        {currentView === "config" && <ConfigView />}
      </main>
    </div>
  )
}
