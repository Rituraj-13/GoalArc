import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Trophy, Medal, Clock, Star, Calculator } from 'lucide-react';

const Leaderboard = () => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [userRank, setUserRank] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const token = localStorage.getItem('todoToken');
                if (!token) return;

                const [leaderboardResponse, rankResponse] = await Promise.all([
                    axios.get('http://localhost:3000/api/leaderboard'),
                    axios.get('http://localhost:3000/api/my-rank', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                setLeaderboardData(leaderboardResponse.data);
                setUserRank(rankResponse.data);
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
                toast.error('Failed to load leaderboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const getRankColor = (index) => {
        switch (index) {
            case 0: return 'bg-yellow-500'; // Gold
            case 1: return 'bg-gray-400';   // Silver
            case 2: return 'bg-amber-600';  // Bronze
            default: return 'bg-blue-500';
        }
    };

    const getRankIcon = (index) => {
        switch (index) {
            case 0: return <Trophy className="w-5 h-5 text-yellow-500" />;
            case 1: return <Trophy className="w-5 h-5 text-gray-400" />;
            case 2: return <Trophy className="w-5 h-5 text-amber-600" />;
            default: return null;
        }
    };

    const showBreakdown = (user) => {
        setSelectedUser(user);
        setShowScoreBreakdown(true);
    };

    const ScoreBreakdown = ({ user }) => {
        const durationScore = user.totalDuration * 40;
        const currentStreakScore = user.currentStreak * 40;
        const highestStreakScore = user.highestStreak * 20;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Score Breakdown for {user.username}</h3>
                        <button
                            onClick={() => setShowScoreBreakdown(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                            <div className="flex items-center">
                                <Clock className="w-5 h-5 text-blue-500 mr-2" />
                                <span>Total Time</span>
                            </div>
                            <div className="text-right">
                                <div className="font-medium">{user.totalDuration} minutes</div>
                                <div className="text-sm text-gray-500">{user.totalDuration} × 40 = {durationScore} points</div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                            <div className="flex items-center">
                                <Medal className="w-5 h-5 text-green-500 mr-2" />
                                <span>Current Streak</span>
                            </div>
                            <div className="text-right">
                                <div className="font-medium">{user.currentStreak} days</div>
                                <div className="text-sm text-gray-500">{user.currentStreak} × 40 = {currentStreakScore} points</div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                            <div className="flex items-center">
                                <Trophy className="w-5 h-5 text-purple-500 mr-2" />
                                <span>Highest Streak</span>
                            </div>
                            <div className="text-right">
                                <div className="font-medium">{user.highestStreak} days</div>
                                <div className="text-sm text-gray-500">{user.highestStreak} × 20 = {highestStreakScore} points</div>
                            </div>
                        </div>

                        <div className="border-t pt-4 mt-4">
                            <div className="flex justify-between items-center font-bold">
                                <span>Total Score</span>
                                <span>{user.score} points</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                                ({durationScore} + {currentStreakScore} + {highestStreakScore} = {user.score})
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center justify-center mb-8">
                        <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
                        <h2 className="text-3xl font-bold text-gray-800">Leaderboard</h2>
                    </div>

                    <div className="mb-6 bg-blue-50 rounded-lg p-4">
                        <h3 className="font-semibold text-lg mb-2 flex items-center">
                            <Calculator className="w-5 h-5 mr-2 text-blue-600" />
                            Score Calculation
                        </h3>
                        <p className="text-sm text-gray-700">
                            Your score is calculated as: (Total Pomodoro Time in minutes × 40) + (Current Streak × 40) + (Highest Streak × 20)
                        </p>
                    </div>

                    {userRank && (
                        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm">
                            <h3 className="font-semibold text-xl mb-4 text-gray-700 flex items-center">
                                <Star className="w-6 h-6 mr-2 text-blue-500" />
                                Your Ranking
                            </h3>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold mr-4 shadow-md">
                                        #{userRank.rank}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-lg text-gray-800">{userRank.userDetails.username}</p>
                                        <p className="text-sm text-gray-600">Score: {userRank.userDetails.score} points</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-6">
                                    <div className="text-center">
                                        <Medal className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                                        <p className="text-sm font-medium text-gray-700">{userRank.userDetails.currentStreak} days</p>
                                        <p className="text-xs text-gray-500">Current Streak</p>
                                    </div>
                                    <div className="text-center">
                                        <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                                        <p className="text-sm font-medium text-gray-700">{userRank.userDetails.totalDuration} min</p>
                                        <p className="text-xs text-gray-500">Total Time</p>
                                    </div>
                                    <button
                                        onClick={() => showBreakdown(userRank.userDetails)}
                                        className="ml-4 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full text-xs font-medium transition-colors"
                                    >
                                        View Score Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Rank</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">User</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Streak</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Total Time</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Score</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboardData.map((entry, index) => (
                                    <tr key={entry._id}
                                        className={`border-b border-gray-50 hover:bg-gray-50 transition-colors duration-200
                                            ${index < 3 ? 'bg-opacity-10' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className={`w-8 h-8 rounded-full ${getRankColor(index)} flex items-center justify-center text-white font-bold mr-2 shadow-sm`}>
                                                    {index + 1}
                                                </div>
                                                {getRankIcon(index)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {entry.profilePicture ? (
                                                    <img
                                                        src={entry.profilePicture}
                                                        alt={entry.username}
                                                        className="w-10 h-10 rounded-full mr-3 object-cover border-2 border-gray-200"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 mr-3 flex items-center justify-center">
                                                        <span className="text-gray-500 font-medium text-lg">
                                                            {entry.username.charAt(0)}
                                                        </span>
                                                    </div>
                                                )}
                                                <span className="font-medium text-gray-800">{entry.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-medium text-gray-700">{entry.currentStreak}</span>
                                            <span className="text-gray-500 ml-1">days</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-medium text-gray-700">{entry.totalDuration}</span>
                                            <span className="text-gray-500 ml-1">min</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-semibold text-gray-900">{entry.score}</span>
                                            <span className="text-gray-500 ml-1">pts</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => showBreakdown(entry)}
                                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-medium transition-colors"
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showScoreBreakdown && selectedUser && (
                <ScoreBreakdown user={selectedUser} />
            )}
        </div>
    );
};

export default Leaderboard;