"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import { Trophy, Medal, Clock, Star, Info, Crown, Award, Users, X, Flame, TrendingUp } from "lucide-react"
import Sidebar from "./Sidebar"
import { useTheme } from "./ThemeProvider"
import { cn } from "@/lib/utils"

const Leaderboard = ({ setIsAuthenticated }) => {
    const [leaderboardData, setLeaderboardData] = useState([])
    const [userRank, setUserRank] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showScoreBreakdown, setShowScoreBreakdown] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const { isDark } = useTheme()

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const token = localStorage.getItem("todoToken")
                if (!token) return

                const [leaderboardResponse, rankResponse] = await Promise.all([
                    axios.get("http://localhost:3000/api/leaderboard"),
                    axios.get("http://localhost:3000/api/my-rank", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ])

                setLeaderboardData(leaderboardResponse.data)
                setUserRank(rankResponse.data)
            } catch (error) {
                console.error("Error fetching leaderboard:", error)
                toast.error("Failed to load leaderboard data")
            } finally {
                setLoading(false)
            }
        }

        fetchLeaderboard()
    }, [])

    const getRankIcon = (index) => {
        switch (index) {
            case 0:
                return <Crown className={cn("w-5 h-5", isDark ? "text-yellow-400" : "text-yellow-500")} />
            case 1:
                return <Award className={cn("w-5 h-5", isDark ? "text-gray-300" : "text-gray-400")} />
            case 2:
                return <Medal className={cn("w-5 h-5", isDark ? "text-amber-500" : "text-amber-600")} />
            default:
                return null
        }
    }

    const showBreakdown = (user) => {
        setSelectedUser(user)
        setShowScoreBreakdown(true)
    }

    const ScoreBreakdown = ({ user }) => {
        const durationScore = user.totalDuration * 40
        const currentStreakScore = user.currentStreak * 40
        const highestStreakScore = user.highestStreak * 20

        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                <div
                    className={cn(
                        "rounded-2xl p-6 max-w-md w-full shadow-2xl border border-border transform transition-all max-h-[90vh] overflow-y-auto scrollbar-thin bg-card text-foreground",
                        isDark
                            ? "scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 scrollbar-track-gray-800/50"
                            : "scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-track-gray-100/50",
                    )}
                >
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center",
                                    isDark ? "bg-blue-500/20" : "bg-blue-100",
                                )}
                            >
                                <Trophy className={cn("w-5 h-5", isDark ? "text-blue-400" : "text-blue-600")} />
                            </div>
                            <h3 className="text-xl font-bold">Score Breakdown</h3>
                        </div>
                        <button
                            onClick={() => setShowScoreBreakdown(false)}
                            className={cn(
                                "rounded-full p-2 transition-colors",
                                isDark
                                    ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                                    : "hover:bg-gray-100 text-gray-500 hover:text-gray-700",
                            )}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            {user.profilePicture ? (
                                <img
                                    src={user.profilePicture || "/placeholder.svg"}
                                    alt={user.username}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                />
                            ) : (
                                <div
                                    className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center",
                                        isDark
                                            ? "bg-gradient-to-r from-blue-600 to-purple-600"
                                            : "bg-gradient-to-r from-blue-500 to-purple-500",
                                    )}
                                >
                                    <span className="text-white font-medium text-lg">{user.username.charAt(0)}</span>
                                </div>
                            )}
                            <div>
                                <h4 className="font-semibold text-lg">{user.username}</h4>
                                <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                                    Total Score: {user.score} points
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div
                            className={cn(
                                "p-4 rounded-xl border",
                                isDark ? "bg-blue-900/20 border-blue-800/30" : "bg-blue-50 border-blue-100",
                            )}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <Clock className={cn("w-5 h-5", isDark ? "text-blue-400" : "text-blue-600")} />
                                    <span className="font-medium">Total Time</span>
                                </div>
                                <span className="font-semibold">{user.totalDuration} minutes</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div
                                    className={cn("h-2.5 rounded-full", isDark ? "bg-blue-500" : "bg-blue-600")}
                                    style={{ width: `${Math.min(100, user.totalDuration / 5)}%` }}
                                ></div>
                            </div>
                            <div className={cn("text-sm mt-2 text-right", isDark ? "text-blue-400" : "text-blue-600")}>
                                {user.totalDuration} × 40 = {durationScore} points
                            </div>
                        </div>

                        <div
                            className={cn(
                                "p-4 rounded-xl border",
                                isDark ? "bg-green-900/20 border-green-800/30" : "bg-green-50 border-green-100",
                            )}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <Flame className={cn("w-5 h-5", isDark ? "text-green-400" : "text-green-600")} />
                                    <span className="font-medium">Current Streak</span>
                                </div>
                                <span className="font-semibold">{user.currentStreak} days</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div
                                    className={cn("h-2.5 rounded-full", isDark ? "bg-green-500" : "bg-green-600")}
                                    style={{ width: `${Math.min(100, user.currentStreak * 10)}%` }}
                                ></div>
                            </div>
                            <div className={cn("text-sm mt-2 text-right", isDark ? "text-green-400" : "text-green-600")}>
                                {user.currentStreak} × 40 = {currentStreakScore} points
                            </div>
                        </div>

                        <div
                            className={cn(
                                "p-4 rounded-xl border",
                                isDark ? "bg-purple-900/20 border-purple-800/30" : "bg-purple-50 border-purple-100",
                            )}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <Trophy className={cn("w-5 h-5", isDark ? "text-purple-400" : "text-purple-600")} />
                                    <span className="font-medium">Highest Streak</span>
                                </div>
                                <span className="font-semibold">{user.highestStreak} days</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div
                                    className={cn("h-2.5 rounded-full", isDark ? "bg-purple-500" : "bg-purple-600")}
                                    style={{ width: `${Math.min(100, user.highestStreak * 10)}%` }}
                                ></div>
                            </div>
                            <div className={cn("text-sm mt-2 text-right", isDark ? "text-purple-400" : "text-purple-600")}>
                                {user.highestStreak} × 20 = {highestStreakScore} points
                            </div>
                        </div>

                        <div
                            className={cn(
                                "mt-6 p-4 rounded-xl border",
                                isDark
                                    ? "bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-800/30"
                                    : "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100",
                            )}
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-bold">Total Score</span>
                                <span className="font-bold text-xl">{user.score} points</span>
                            </div>
                            {/* <div className={cn("text-sm mt-2", isDark ? "text-gray-400" : "text-gray-500")}>
                                ({durationScore} + {currentStreakScore} + {highestStreakScore})
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex h-screen">
                <Sidebar setIsAuthenticated={setIsAuthenticated} />
                <div className="flex-1 flex justify-center items-center">
                    <div className="flex flex-col items-center gap-4">
                        <div
                            className={cn(
                                "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2",
                                isDark ? "border-purple-500" : "border-blue-500",
                            )}
                        ></div>
                        <p className={cn("text-sm font-medium", isDark ? "text-gray-400" : "text-gray-500")}>
                            Loading leaderboard...
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // Get top 3 users for the podium
    const topUsers = leaderboardData.slice(0, 3)

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar setIsAuthenticated={setIsAuthenticated} />

            <div className={cn(
                "flex-1 overflow-auto scrollbar-thin scrollbar-track-transparent bg-background text-foreground",
                isDark
                    ? "scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500"
                    : "scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400",
            )}>
                <div className="max-w-7xl mx-auto px-4 py-8 mt-8 md:mt-0 md:px-6 md:py-10">
                    {/* Header - Left aligned */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3">
                            <Trophy className={cn("w-8 h-8", isDark ? "text-yellow-400" : "text-yellow-500")} />
                            <h1 className={cn("text-2xl md:text-3xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                                Leaderboard
                            </h1>
                        </div>
                    </div>

                    {/* Main content - Side by side on large screens */}
                    <div className="grid lg:grid-cols-2 gap-8 mb-10">
                        {/* Podium Section */}
                        {topUsers.length > 0 && (
                            <div
                                className={cn(
                                    "p-4 sm:p-6 rounded-xl border border-border bg-card",
                                    isDark ? "border-gray-700" : "border-gray-200",
                                )}
                            >
                                <h2 className={cn("text-xl font-bold mb-4 sm:mb-6", isDark ? "text-gray-200" : "text-gray-800")}>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className={cn("w-5 h-5", isDark ? "text-yellow-400" : "text-yellow-500")} />
                                        <span>Top Performers</span>
                                    </div>
                                </h2>

                                <div className="flex flex-col items-center">
                                    {/* Podium - Single row on mobile, maintains order */}
                                    <div className="flex flex-row items-end justify-center gap-2 sm:gap-4 md:gap-6 mb-6 w-full">
                                        {/* Second Place */}
                                        {topUsers.length > 1 && (
                                            <div className="flex-shrink-0">
                                                <div className="flex flex-col items-center">
                                                    <div
                                                        className={cn(
                                                            "w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-4 mb-2",
                                                            isDark ? "border-gray-300" : "border-gray-400",
                                                        )}
                                                    >
                                                        {topUsers[1].profilePicture ? (
                                                            <img
                                                                src={topUsers[1].profilePicture || "/placeholder.svg"}
                                                                alt={topUsers[1].username}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div
                                                                className={cn(
                                                                    "w-full h-full flex items-center justify-center",
                                                                    isDark
                                                                        ? "bg-gradient-to-r from-gray-600 to-gray-500"
                                                                        : "bg-gradient-to-r from-gray-400 to-gray-300",
                                                                )}
                                                            >
                                                                <span className="text-white font-bold text-xl">{topUsers[1].username.charAt(0)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div
                                                        className={cn(
                                                            "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-2",
                                                            isDark ? "bg-gray-300 text-gray-800" : "bg-gray-400 text-white",
                                                        )}
                                                    >
                                                        <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    </div>
                                                    <div
                                                        className={cn(
                                                            "w-20 sm:w-24 h-24 sm:h-28 rounded-t-lg flex flex-col items-center justify-end p-2 relative",
                                                            isDark ? "bg-gray-700" : "bg-gray-100",
                                                        )}
                                                    >
                                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-300 text-gray-800 rounded-full px-2 py-0.5 text-xs font-bold">
                                                            2nd
                                                        </div>
                                                        <p className="font-semibold text-center text-xs sm:text-sm line-clamp-1">{topUsers[1].username}</p>
                                                        <p className={cn("text-xs sm:text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                                                            {topUsers[1].score} pts
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* First Place */}
                                        <div className="flex-shrink-0 transform translate-y-4">
                                            <div className="flex flex-col items-center">
                                                <div
                                                    className={cn(
                                                        "w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 mb-2",
                                                        isDark ? "border-yellow-400" : "border-yellow-500",
                                                    )}
                                                >
                                                    {topUsers[0].profilePicture ? (
                                                        <img
                                                            src={topUsers[0].profilePicture || "/placeholder.svg"}
                                                            alt={topUsers[0].username}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div
                                                            className={cn(
                                                                "w-full h-full flex items-center justify-center",
                                                                isDark
                                                                    ? "bg-gradient-to-r from-yellow-600 to-yellow-500"
                                                                    : "bg-gradient-to-r from-yellow-500 to-yellow-400",
                                                            )}
                                                        >
                                                            <span className="text-white font-bold text-2xl">{topUsers[0].username.charAt(0)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div
                                                    className={cn(
                                                        "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-2",
                                                        isDark ? "bg-yellow-400 text-yellow-900" : "bg-yellow-500 text-yellow-900",
                                                    )}
                                                >
                                                    <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
                                                </div>
                                                <div
                                                    className={cn(
                                                        "w-24 sm:w-28 h-32 sm:h-36 rounded-t-lg flex flex-col items-center justify-end p-2 sm:p-3 relative",
                                                        isDark
                                                            ? "bg-gradient-to-b from-yellow-900/30 to-yellow-900/10"
                                                            : "bg-gradient-to-b from-yellow-100 to-yellow-50",
                                                    )}
                                                >
                                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 rounded-full px-2 py-0.5 text-xs font-bold">
                                                        1st
                                                    </div>
                                                    <p className="font-bold text-center text-sm sm:text-lg line-clamp-1">{topUsers[0].username}</p>
                                                    <p className={cn("font-semibold text-xs sm:text-base", isDark ? "text-yellow-400" : "text-yellow-600")}>
                                                        {topUsers[0].score} pts
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Third Place */}
                                        {topUsers.length > 2 && (
                                            <div className="flex-shrink-0">
                                                <div className="flex flex-col items-center">
                                                    <div
                                                        className={cn(
                                                            "w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-4 mb-2",
                                                            isDark ? "border-amber-500" : "border-amber-600",
                                                        )}
                                                    >
                                                        {topUsers[2].profilePicture ? (
                                                            <img
                                                                src={topUsers[2].profilePicture || "/placeholder.svg"}
                                                                alt={topUsers[2].username}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div
                                                                className={cn(
                                                                    "w-full h-full flex items-center justify-center",
                                                                    isDark
                                                                        ? "bg-gradient-to-r from-amber-600 to-amber-500"
                                                                        : "bg-gradient-to-r from-amber-600 to-amber-500",
                                                                )}
                                                            >
                                                                <span className="text-white font-bold text-xl">{topUsers[2].username.charAt(0)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div
                                                        className={cn(
                                                            "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-2",
                                                            isDark ? "bg-amber-500 text-amber-900" : "bg-amber-600 text-white",
                                                        )}
                                                    >
                                                        <Medal className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    </div>
                                                    <div
                                                        className={cn(
                                                            "w-20 sm:w-24 h-24 sm:h-28 rounded-t-lg flex flex-col items-center justify-end p-2 relative",
                                                            isDark ? "bg-gray-700" : "bg-gray-100",
                                                        )}
                                                    >
                                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white rounded-full px-2 py-0.5 text-xs font-bold">
                                                            3rd
                                                        </div>
                                                        <p className="font-semibold text-center text-xs sm:text-sm line-clamp-1">{topUsers[2].username}</p>
                                                        <p className={cn("text-xs sm:text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                                                            {topUsers[2].score} pts
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Podium Base */}
                                    <div className={cn("h-4 w-full max-w-md rounded-t-lg", isDark ? "bg-gray-700" : "bg-gray-200")}></div>
                                </div>
                            </div>
                        )}

                        {/* User Rank Card */}
                        {userRank && (
                            <div
                                className={cn(
                                    "p-4 sm:p-6 rounded-xl border border-border bg-card h-full",
                                    isDark ? "border-gray-700" : "border-gray-200",
                                )}
                            >
                                <h2 className={cn("text-xl font-bold mb-4 sm:mb-6", isDark ? "text-gray-200" : "text-gray-800")}>
                                    <div className="flex items-center gap-2">
                                        <Star className={cn("w-5 h-5", isDark ? "text-blue-400" : "text-blue-500")} />
                                        <span>Your Performance</span>
                                    </div>
                                </h2>

                                <div className="flex flex-col gap-4 sm:gap-6">
                                    <div className="flex items-center gap-3 sm:gap-5">
                                        <div
                                            className={cn(
                                                "relative w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg",
                                                isDark
                                                    ? "bg-gradient-to-br from-blue-600 to-purple-600"
                                                    : "bg-gradient-to-br from-blue-500 to-purple-500",
                                            )}
                                        >
                                            <span className="text-xl sm:text-2xl">#{userRank.rank}</span>
                                            <div className="absolute -top-2 -right-2">
                                                <div
                                                    className={cn(
                                                        "w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center",
                                                        isDark ? "bg-gray-800" : "bg-white",
                                                        "border-2",
                                                        isDark ? "border-gray-700" : "border-gray-100",
                                                    )}
                                                >
                                                    <Star className={cn("w-3 h-3", isDark ? "text-yellow-400" : "text-yellow-500")} />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className={cn("text-lg sm:text-xl font-bold mb-0 sm:mb-1", isDark ? "text-white" : "text-gray-900")}>
                                                {userRank.userDetails.username}
                                            </h3>
                                            <p className={cn("text-xs sm:text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                                                Total Score: {userRank.userDetails.score} points
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                                        <div className={cn("p-2 sm:p-4 rounded-xl", isDark ? "bg-blue-900/30" : "bg-blue-100/80")}>
                                            <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                                <Clock className={cn("w-3 h-3 sm:w-4 sm:h-4", isDark ? "text-blue-400" : "text-blue-600")} />
                                                <span className={cn("text-xs sm:text-sm font-medium", isDark ? "text-blue-300" : "text-blue-700")}>
                                                    Total Time
                                                </span>
                                            </div>
                                            <p className="font-semibold text-sm sm:text-lg">
                                                {userRank.userDetails.totalDuration}
                                                <span className={cn("text-xs sm:text-sm ml-1 font-normal", isDark ? "text-gray-400" : "text-gray-500")}>
                                                    min
                                                </span>
                                            </p>
                                        </div>

                                        <div className={cn("p-2 sm:p-4 rounded-xl", isDark ? "bg-green-900/30" : "bg-green-100/80")}>
                                            <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                                <Flame className={cn("w-3 h-3 sm:w-4 sm:h-4", isDark ? "text-green-400" : "text-green-600")} />
                                                <span className={cn("text-xs sm:text-sm font-medium", isDark ? "text-green-300" : "text-green-700")}>
                                                    Streak
                                                </span>
                                            </div>
                                            <p className="font-semibold text-sm sm:text-lg">
                                                {userRank.userDetails.currentStreak}
                                                <span className={cn("text-xs sm:text-sm ml-1 font-normal", isDark ? "text-gray-400" : "text-gray-500")}>
                                                    days
                                                </span>
                                            </p>
                                        </div>

                                        <div className={cn("p-2 sm:p-4 rounded-xl", isDark ? "bg-purple-900/30" : "bg-purple-100/80")}>
                                            <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                                <Trophy className={cn("w-3 h-3 sm:w-4 sm:h-4", isDark ? "text-purple-400" : "text-purple-600")} />
                                                <span className={cn("text-xs sm:text-sm font-medium", isDark ? "text-purple-300" : "text-purple-700")}>
                                                    Best Streak
                                                </span>
                                            </div>
                                            <p className="font-semibold text-sm sm:text-lg">
                                                {userRank.userDetails.highestStreak}
                                                <span className={cn("text-xs sm:text-sm ml-1 font-normal", isDark ? "text-gray-400" : "text-gray-500")}>
                                                    days
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => showBreakdown(userRank.userDetails)}
                                        className={cn(
                                            "px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2 mt-2 w-full sm:w-auto",
                                            isDark ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white",
                                        )}
                                    >
                                        <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                                        View Score Details
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Leaderboard Table */}
                    <div className="max-w-full">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <h2
                                className={cn("text-lg sm:text-xl font-bold flex items-center gap-2", isDark ? "text-gray-200" : "text-gray-800")}
                            >
                                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>All Users</span>
                            </h2>
                            <div className={cn("text-xs sm:text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                                {leaderboardData.length} participants
                            </div>
                        </div>

                        <div
                            className={cn(
                                "rounded-xl overflow-hidden border shadow-sm border-border bg-card",
                                isDark ? "border-gray-700" : "border-gray-200",
                            )}
                        >
                            <div className={cn(
                                "overflow-x-auto scrollbar-thin scrollbar-track-transparent",
                                isDark
                                    ? "scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500"
                                    : "scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400"
                            )}>
                                <table className="min-w-full divide-y divide-border">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground"
                                            >
                                                Rank
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground"
                                            >
                                                User
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3.5 text-right text-sm font-semibold whitespace-nowrap text-muted-foreground"
                                            >
                                                <span className="hidden sm:inline">Current </span>Streak
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3.5 text-right text-sm font-semibold hidden md:table-cell text-muted-foreground"
                                            >
                                                Total Time
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3.5 text-right text-sm font-semibold text-muted-foreground"
                                            >
                                                Score
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3.5 text-center text-sm font-semibold text-muted-foreground"
                                            >
                                                Details
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {leaderboardData.map((entry, index) => (
                                            <tr
                                                key={entry._id}
                                                className={cn(
                                                    "transition-colors",
                                                    isDark
                                                        ? `hover:bg-gray-700/50 ${userRank && entry._id === userRank.userDetails._id ? "bg-blue-900/20" : ""}`
                                                        : `hover:bg-gray-50 ${userRank && entry._id === userRank.userDetails._id ? "bg-blue-50" : ""}`,
                                                )}
                                            >
                                                <td className="whitespace-nowrap px-4 py-4 text-sm">
                                                    <div className="flex items-center">
                                                        <div
                                                            className={cn(
                                                                "w-8 h-8 rounded-lg flex items-center justify-center text-white font-medium shadow-sm",
                                                                index === 0
                                                                    ? isDark
                                                                        ? "bg-yellow-500"
                                                                        : "bg-yellow-500"
                                                                    : index === 1
                                                                        ? isDark
                                                                            ? "bg-gray-400"
                                                                            : "bg-gray-400"
                                                                        : index === 2
                                                                            ? isDark
                                                                                ? "bg-amber-600"
                                                                                : "bg-amber-600"
                                                                            : isDark
                                                                                ? "bg-gray-700"
                                                                                : "bg-gray-200",
                                                            )}
                                                        >
                                                            {index + 1}
                                                        </div>
                                                        {getRankIcon(index)}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-4 text-sm">
                                                    <div className="flex items-center">
                                                        {entry.profilePicture ? (
                                                            <img
                                                                src={entry.profilePicture || "/placeholder.svg"}
                                                                alt={entry.username}
                                                                className="w-8 h-8 rounded-full mr-3 object-cover"
                                                            />
                                                        ) : (
                                                            <div
                                                                className={cn(
                                                                    "w-8 h-8 rounded-full mr-3 flex items-center justify-center",
                                                                    isDark
                                                                        ? "bg-gradient-to-r from-gray-700 to-gray-600"
                                                                        : "bg-gradient-to-r from-gray-200 to-gray-300",
                                                                )}
                                                            >
                                                                <span className={cn("font-medium", isDark ? "text-gray-300" : "text-gray-600")}>
                                                                    {entry.username.charAt(0)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <span className={cn("font-medium", isDark ? "text-gray-200" : "text-gray-800")}>
                                                            {entry.username}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-4 text-sm text-right">
                                                    <div className="flex items-center justify-end">
                                                        <Flame className={cn("w-4 h-4 mr-1", isDark ? "text-green-400" : "text-green-600")} />
                                                        <span className="font-medium">
                                                            {entry.currentStreak}
                                                            <span className={cn("ml-1 font-normal", isDark ? "text-gray-400" : "text-gray-500")}>
                                                                days
                                                            </span>
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-4 text-sm text-right hidden md:table-cell">
                                                    <div className="flex items-center justify-end">
                                                        <Clock className={cn("w-4 h-4 mr-1", isDark ? "text-blue-400" : "text-blue-600")} />
                                                        <span className="font-medium">
                                                            {entry.totalDuration}
                                                            <span className={cn("ml-1 font-normal", isDark ? "text-gray-400" : "text-gray-500")}>
                                                                min
                                                            </span>
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-4 text-sm text-right">
                                                    <span className={cn("font-semibold", isDark ? "text-gray-100" : "text-gray-900")}>
                                                        {entry.score}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-4 text-sm text-center">
                                                    <button
                                                        onClick={() => showBreakdown(entry)}
                                                        className={cn(
                                                            "inline-flex items-center px-2 py-1 text-xs font-medium rounded-lg transition-colors",
                                                            isDark
                                                                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                                                : "bg-gray-100 hover:bg-gray-200 text-gray-700",
                                                        )}
                                                    >
                                                        <Info className="w-3.5 h-3.5 mr-1" />
                                                        <span className="hidden sm:inline">Details</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showScoreBreakdown && selectedUser && <ScoreBreakdown user={selectedUser} />}
        </div>
    )
}

export default Leaderboard

