"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
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
  Search,
  Filter,
  Menu,
} from "lucide-react"
import Link from "next/link"
import { NavigationMenu } from "@/components/navigation-menu"

interface PlayerData {
  id: string
  name: string
  country: string
  league: string
  position: string
  age: number
  caps: number
  clubs: string[]
  achievements: string[]
  imageUrl?: string
  isActive: boolean
  isLegend: boolean
  dateAdded: string
}

interface FilterOptions {
  country: string
  league: string
  position: string
  ageRange: string
  isLegend: string
}

const COUNTRIES = [
  { id: "new-zealand", name: "New Zealand", icon: "🇳🇿" },
  { id: "australia", name: "Australia", icon: "🇦🇺" },
  { id: "south-africa", name: "South Africa", icon: "🇿🇦" },
  { id: "england", name: "England", icon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: "france", name: "France", icon: "🇫🇷" },
  { id: "wales", name: "Wales", icon: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
  { id: "ireland", name: "Ireland", icon: "🇮🇪" },
  { id: "scotland", name: "Scotland", icon: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { id: "italy", name: "Italy", icon: "🇮🇹" },
  { id: "argentina", name: "Argentina", icon: "🇦🇷" },
  { id: "japan", name: "Japan", icon: "🇯🇵" },
  { id: "fiji", name: "Fiji", icon: "🇫🇯" },
  { id: "samoa", name: "Samoa", icon: "🇼🇸" },
  { id: "tonga", name: "Tonga", icon: "🇹🇴" },
  { id: "usa", name: "USA", icon: "🇺🇸" },
  { id: "canada", name: "Canada", icon: "🇨🇦" },
  { id: "georgia", name: "Georgia", icon: "🇬🇪" },
  { id: "romania", name: "Romania", icon: "🇷🇴" },
  { id: "uruguay", name: "Uruguay", icon: "🇺🇾" },
  { id: "namibia", name: "Namibia", icon: "🇳🇦" },
]

const LEAGUES = [
  { id: "six-nations", name: "Six Nations" },
  { id: "rugby-championship", name: "Rugby Championship" },
  { id: "premiership", name: "Premiership Rugby" },
  { id: "top14", name: "Top 14" },
  { id: "urc", name: "United Rugby Championship" },
  { id: "super-rugby", name: "Super Rugby" },
  { id: "mlr", name: "Major League Rugby" },
  { id: "japan-league", name: "Japan Rugby League One" },
  { id: "currie-cup", name: "Currie Cup" },
  { id: "npc", name: "NPC (New Zealand)" },
]

const POSITIONS = [
  { id: "prop", name: "Prop" },
  { id: "hooker", name: "Hooker" },
  { id: "lock", name: "Lock" },
  { id: "flanker", name: "Flanker" },
  { id: "number-8", name: "Number 8" },
  { id: "scrum-half", name: "Scrum Half" },
  { id: "fly-half", name: "Fly Half" },
  { id: "centre", name: "Centre" },
  { id: "wing", name: "Wing" },
  { id: "full-back", name: "Full Back" },
]

const AGE_RANGES = [
  { id: "all", name: "All Ages" },
  { id: "under-25", name: "Under 25" },
  { id: "25-30", name: "25-30" },
  { id: "over-30", name: "Over 30" },
]

export default function GuessThePlayerAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [currentView, setCurrentView] = useState<"dashboard" | "players" | "import">("dashboard")
  const [players, setPlayers] = useState<PlayerData[]>([])
  const [navigationOpen, setNavigationOpen] = useState(false)

  const [newPlayer, setNewPlayer] = useState<PlayerData>({
    id: "",
    name: "",
    country: "",
    league: "",
    position: "",
    age: 0,
    caps: 0,
    clubs: [],
    achievements: [],
    imageUrl: "",
    isActive: true,
    isLegend: false,
    dateAdded: new Date().toISOString(),
  })

  const [editingPlayer, setEditingPlayer] = useState<PlayerData | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    country: "all",
    league: "all",
    position: "all",
    ageRange: "all",
    isLegend: "all",
  })
  const [showFilters, setShowFilters] = useState(false)

  const handlePlayerNameChange = useCallback((value: string) => {
    setNewPlayer((prev) => ({ ...prev, name: value }))
  }, [])

  const handlePlayerCountryChange = useCallback((value: string) => {
    setNewPlayer((prev) => ({ ...prev, country: value }))
  }, [])

  const handlePlayerPositionChange = useCallback((value: string) => {
    setNewPlayer((prev) => ({ ...prev, position: value }))
  }, [])

  const handlePlayerLeagueChange = useCallback((value: string) => {
    setNewPlayer((prev) => ({ ...prev, league: value }))
  }, [])

  const handlePlayerAgeChange = useCallback((value: number) => {
    setNewPlayer((prev) => ({ ...prev, age: value }))
  }, [])

  const handlePlayerCapsChange = useCallback((value: number) => {
    setNewPlayer((prev) => ({ ...prev, caps: value }))
  }, [])

  const handleClubsChange = useCallback((value: string) => {
    setNewPlayer((prev) => ({ ...prev, clubs: value.split(",").map((c) => c.trim()) }))
  }, [])

  const handleAchievementsChange = useCallback((value: string) => {
    setNewPlayer((prev) => ({ ...prev, achievements: value.split(",").map((a) => a.trim()) }))
  }, [])

  const handleImageUrlChange = useCallback((value: string) => {
    setNewPlayer((prev) => ({ ...prev, imageUrl: value }))
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  // Check authentication
  useEffect(() => {
    const authStatus = localStorage.getItem("guessPlayerAdminAuth")
    const authTime = localStorage.getItem("guessPlayerAdminAuthTime")

    if (authStatus === "true" && authTime) {
      const timeDiff = Date.now() - Number.parseInt(authTime)
      if (timeDiff < 7 * 24 * 60 * 60 * 1000) {
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem("guessPlayerAdminAuth")
        localStorage.removeItem("guessPlayerAdminAuthTime")
      }
    }
  }, [])

  // Load data
  useEffect(() => {
    if (isAuthenticated) {
      const savedPlayers = localStorage.getItem("guessPlayerDatabase")

      if (savedPlayers) {
        setPlayers(JSON.parse(savedPlayers))
      } else {
        // Initialize with sample player database
        const defaultPlayers: PlayerData[] = [
          {
            id: "jonah-lomu",
            name: "Jonah Lomu",
            country: "new-zealand",
            league: "super-rugby",
            position: "wing",
            age: 40, // Age at passing
            caps: 63,
            clubs: ["Counties Manukau", "Wellington", "Blues", "Chiefs", "Cardiff Blues"],
            achievements: ["World Cup finalist", "All Blacks legend", "Rugby Hall of Fame"],
            isActive: false,
            isLegend: true,
            dateAdded: new Date().toISOString(),
          },
          {
            id: "antoine-dupont",
            name: "Antoine Dupont",
            country: "france",
            league: "top14",
            position: "scrum-half",
            age: 27,
            caps: 52,
            clubs: ["Toulouse", "Castres"],
            achievements: ["World Rugby Player of the Year", "Six Nations Grand Slam", "Champions Cup winner"],
            isActive: true,
            isLegend: false,
            dateAdded: new Date().toISOString(),
          },
          {
            id: "siya-kolisi",
            name: "Siya Kolisi",
            country: "south-africa",
            league: "urc",
            position: "flanker",
            age: 32,
            caps: 83,
            clubs: ["Stormers", "Sharks", "Racing 92"],
            achievements: ["World Cup winner (2x)", "First black Springbok captain", "Rugby Championship winner"],
            isActive: true,
            isLegend: false,
            dateAdded: new Date().toISOString(),
          },
        ]
        setPlayers(defaultPlayers)
        localStorage.setItem("guessPlayerDatabase", JSON.stringify(defaultPlayers))
      }
    }
  }, [isAuthenticated])

  const handleLogin = () => {
    const adminPassword = "Isaeden123!"
    if (password === adminPassword) {
      setIsAuthenticated(true)
      setLoginError("")
      localStorage.setItem("guessPlayerAdminAuth", "true")
      localStorage.setItem("guessPlayerAdminAuthTime", Date.now().toString())
    } else {
      setLoginError("Incorrect password. Please try again.")
      setPassword("")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("guessPlayerAdminAuth")
    localStorage.removeItem("guessPlayerAdminAuthTime")
  }

  const savePlayers = (updatedPlayers: PlayerData[]) => {
    setPlayers(updatedPlayers)
    localStorage.setItem("guessPlayerDatabase", JSON.stringify(updatedPlayers))
  }

  const addPlayer = () => {
    if (!newPlayer.name.trim() || !newPlayer.country || !newPlayer.position) return

    const playerId = newPlayer.name.toLowerCase().replace(/\s+/g, "-")
    const updatedPlayers = [...players, { ...newPlayer, id: playerId, dateAdded: new Date().toISOString() }]
    savePlayers(updatedPlayers)

    setNewPlayer({
      id: "",
      name: "",
      country: "",
      league: "",
      position: "",
      age: 0,
      caps: 0,
      clubs: [],
      achievements: [],
      imageUrl: "",
      isActive: true,
      isLegend: false,
      dateAdded: new Date().toISOString(),
    })
  }

  const updatePlayer = (updatedPlayer: PlayerData) => {
    const updatedPlayers = players.map((player) => (player.id === updatedPlayer.id ? updatedPlayer : player))
    savePlayers(updatedPlayers)
    setEditingPlayer(null)
  }

  const deletePlayer = (id: string) => {
    const updatedPlayers = players.filter((player) => player.id !== id)
    savePlayers(updatedPlayers)
  }

  const exportData = () => {
    const data = { players }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "guess-player-database.json"
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
      } catch (error) {
        alert("Invalid file format")
      }
    }
    reader.readAsText(file)
  }

  const filteredPlayers = players.filter((player) => {
    // Search filter
    if (searchTerm && !player.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Country filter
    if (filterOptions.country !== "all" && player.country !== filterOptions.country) {
      return false
    }

    // League filter
    if (filterOptions.league !== "all" && player.league !== filterOptions.league) {
      return false
    }

    // Position filter
    if (filterOptions.position !== "all" && player.position !== filterOptions.position) {
      return false
    }

    // Age range filter
    if (filterOptions.ageRange !== "all") {
      if (filterOptions.ageRange === "under-25" && player.age >= 25) {
        return false
      } else if (filterOptions.ageRange === "25-30" && (player.age < 25 || player.age > 30)) {
        return false
      } else if (filterOptions.ageRange === "over-30" && player.age <= 30) {
        return false
      }
    }

    // Legend filter
    if (filterOptions.isLegend !== "all") {
      if (filterOptions.isLegend === "yes" && !player.isLegend) {
        return false
      } else if (filterOptions.isLegend === "no" && player.isLegend) {
        return false
      }
    }

    return true
  })

  // Login Screen
  const LoginScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
      <Card className="bg-slate-800 border-slate-700 max-w-md w-full mx-4">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-white">Guess the Player Admin</CardTitle>
          <p className="text-slate-400">Player database management</p>
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
              <Link href="/game/guess-the-player">
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
            <div className="text-3xl font-bold text-lime-400 mb-2">{players.length}</div>
            <div className="text-slate-400">Total Players</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{players.filter((p) => p.isActive).length}</div>
            <div className="text-slate-400">Active Players</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">{players.filter((p) => p.isLegend).length}</div>
            <div className="text-slate-400">Legend Players</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Player Database Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Guess the Player Database</div>
              <div className="text-slate-400 text-sm">Manage players by position, league, country, and age</div>
            </div>
            <Button
              onClick={() => setCurrentView("players")}
              className="bg-lime-400 hover:bg-lime-500 text-black font-bold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Player
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlayers.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-slate-400">No players match your search criteria.</p>
          </div>
        ) : (
          filteredPlayers.map((player) => (
            <Card key={player.id} className="bg-slate-800/50 border-slate-700">
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
                      onClick={() => deletePlayer(player.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Country:</span>
                    <span className="text-white">
                      {COUNTRIES.find((c) => c.id === player.country)?.icon}{" "}
                      {COUNTRIES.find((c) => c.id === player.country)?.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Position:</span>
                    <span className="text-white">{POSITIONS.find((p) => p.id === player.position)?.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">League:</span>
                    <span className="text-white">{LEAGUES.find((l) => l.id === player.league)?.name || "N/A"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Age:</span>
                    <span className="text-white">{player.age}</span>
                    <span className="text-slate-400 ml-2">Caps:</span>
                    <span className="text-white">{player.caps}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {player.isActive && (
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Active</span>
                    )}
                    {player.isLegend && (
                      <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">Legend</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )

  // Players Management View
  const PlayersView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Player Database</h2>
        <div className="text-slate-400">{players.length} total players</div>
      </div>

      {/* Add New Player */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Add New Player</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={newPlayer.name}
              onChange={(e) => handlePlayerNameChange(e.target.value)}
              placeholder="Player name"
              className="bg-slate-700 border-slate-600 text-white"
            />

            <Select value={newPlayer.country} onValueChange={(value) => setNewPlayer({ ...newPlayer, country: value })}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.icon} {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              value={newPlayer.position}
              onValueChange={(value) => setNewPlayer({ ...newPlayer, position: value })}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {POSITIONS.map((position) => (
                  <SelectItem key={position.id} value={position.id}>
                    {position.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={newPlayer.league} onValueChange={(value) => setNewPlayer({ ...newPlayer, league: value })}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Select league" />
              </SelectTrigger>
              <SelectContent>
                {LEAGUES.map((league) => (
                  <SelectItem key={league.id} value={league.id}>
                    {league.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-4">
              <Input
                type="number"
                value={newPlayer.age || ""}
                onChange={(e) => handlePlayerAgeChange(Number(e.target.value))}
                placeholder="Age"
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Input
                type="number"
                value={newPlayer.caps || ""}
                onChange={(e) => setNewPlayer({ ...newPlayer, caps: Number(e.target.value) })}
                placeholder="Caps"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-medium mb-2">Clubs (comma separated)</label>
              <Textarea
                value={newPlayer.clubs.join(", ")}
                onChange={(e) => handleClubsChange(e.target.value)}
                placeholder="Enter clubs, separated by commas"
                className="bg-slate-700 border-slate-600 text-white h-24"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Achievements (comma separated)</label>
              <Textarea
                value={newPlayer.achievements.join(", ")}
                onChange={(e) => handleAchievementsChange(e.target.value)}
                placeholder="Enter achievements, separated by commas"
                className="bg-slate-700 border-slate-600 text-white h-24"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              value={newPlayer.imageUrl || ""}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              placeholder="Image URL (optional)"
              className="bg-slate-700 border-slate-600 text-white"
            />

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={newPlayer.isActive}
                onChange={(e) => setNewPlayer({ ...newPlayer, isActive: e.target.checked })}
                className="rounded"
              />
              <label className="text-white">Active Player</label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={newPlayer.isLegend}
                onChange={(e) => setNewPlayer({ ...newPlayer, isLegend: e.target.checked })}
                className="rounded"
              />
              <label className="text-white">Legend Status</label>
            </div>
          </div>

          <Button
            onClick={addPlayer}
            disabled={!newPlayer.name.trim() || !newPlayer.country || !newPlayer.position}
            className="bg-lime-400 hover:bg-lime-500 text-black font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Player
          </Button>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search players..."
            className="bg-slate-700 border-slate-600 text-white pl-10"
          />
        </div>

        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters {showFilters ? "▲" : "▼"}
        </Button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-white text-sm mb-1">Country</label>
                <Select
                  value={filterOptions.country}
                  onValueChange={(value) => setFilterOptions({ ...filterOptions, country: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.icon} {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-white text-sm mb-1">League</label>
                <Select
                  value={filterOptions.league}
                  onValueChange={(value) => setFilterOptions({ ...filterOptions, league: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Leagues</SelectItem>
                    {LEAGUES.map((league) => (
                      <SelectItem key={league.id} value={league.id}>
                        {league.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-white text-sm mb-1">Position</label>
                <Select
                  value={filterOptions.position}
                  onValueChange={(value) => setFilterOptions({ ...filterOptions, position: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Positions</SelectItem>
                    {POSITIONS.map((position) => (
                      <SelectItem key={position.id} value={position.id}>
                        {position.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-white text-sm mb-1">Age Range</label>
                <Select
                  value={filterOptions.ageRange}
                  onValueChange={(value) => setFilterOptions({ ...filterOptions, ageRange: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AGE_RANGES.map((range) => (
                      <SelectItem key={range.id} value={range.id}>
                        {range.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-white text-sm mb-1">Legend Status</label>
                <Select
                  value={filterOptions.isLegend}
                  onValueChange={(value) => setFilterOptions({ ...filterOptions, isLegend: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Players</SelectItem>
                    <SelectItem value="yes">Legends Only</SelectItem>
                    <SelectItem value="no">Non-Legends Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Players List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-slate-400">No players match your search criteria.</p>
          </div>
        ) : (
          filteredPlayers.map((player) => (
            <Card key={player.id} className="bg-slate-800/50 border-slate-700">
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
                      onClick={() => deletePlayer(player.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Country:</span>
                    <span className="text-white">
                      {COUNTRIES.find((c) => c.id === player.country)?.icon}{" "}
                      {COUNTRIES.find((c) => c.id === player.country)?.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Position:</span>
                    <span className="text-white">{POSITIONS.find((p) => p.id === player.position)?.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">League:</span>
                    <span className="text-white">{LEAGUES.find((l) => l.id === player.league)?.name || "N/A"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Age:</span>
                    <span className="text-white">{player.age}</span>
                    <span className="text-slate-400 ml-2">Caps:</span>
                    <span className="text-white">{player.caps}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {player.isActive && (
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Active</span>
                    )}
                    {player.isLegend && (
                      <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">Legend</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )

  // Import/Export View
  const ImportExportView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Import/Export Data</h2>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Export Database</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-400">
            Export your entire player database as a JSON file. You can use this file for backup or to transfer data to
            another installation.
          </p>
          <Button onClick={exportData} className="bg-green-600 hover:bg-green-700 text-white">
            <Download className="w-4 h-4 mr-2" />
            Export Player Database
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Import Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-slate-400">
              Import a previously exported player database. This will replace your current database.
            </p>
            <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4 mb-4">
              <p className="text-yellow-300 text-sm">
                Warning: Importing will overwrite your existing player database. Make sure to export your current data
                first if you want to keep it.
              </p>
            </div>
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

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Bulk Data Format</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-slate-400">When creating a JSON file for import, use the following format:</p>
            <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-xs">
                {`{
  "players": [
    {
      "id": "player-id",
      "name": "Player Name",
      "country": "country-id",
      "league": "league-id",
      "position": "position-id",
      "age": 25,
      "caps": 50,
      "clubs": ["Club 1", "Club 2"],
      "achievements": ["Achievement 1", "Achievement 2"],
      "imageUrl": "https://example.com/image.jpg",
      "isActive": true,
      "isLegend": false,
      "dateAdded": "2023-01-01T00:00:00.000Z"
    }
  ]
}`}
              </pre>
            </div>
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
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => setNavigationOpen(!navigationOpen)}
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>

            <div className="text-center">
              <div className="text-lime-400 font-semibold text-sm">Guess the Player Admin</div>
              <h1 className="text-white font-bold text-lg">Player Database Management</h1>
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

      {/* Navigation Menu */}
      <NavigationMenu isOpen={navigationOpen} onClose={() => setNavigationOpen(false)} />

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
            onClick={() => setCurrentView("import")}
            className={`px-6 py-2 rounded-full font-bold ${
              currentView === "import"
                ? "bg-lime-400 text-black"
                : "bg-transparent border-2 border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-black"
            }`}
          >
            Import/Export
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8">
        {currentView === "dashboard" && <DashboardView />}
        {currentView === "players" && <PlayersView />}
        {currentView === "import" && <ImportExportView />}
      </main>
    </div>
  )
}
