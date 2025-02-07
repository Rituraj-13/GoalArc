import React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Sidebar from './Sidebar';
import { Flame, Trophy, Calendar } from 'lucide-react';

const StreaksPage = ({ setIsAuthenticated }) => {
  const [streak, setStreak] = useState({
    currentStreak: 0,
    highestStreak: 0,
    lastCompletionDate: null
  });

  useEffect(() => {
    const fetchStreakData = async () => {
      try {
        const token = localStorage.getItem('todoToken');
        const response = await axios.get('http://localhost:3000/todos/streak', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setStreak(response.data);
      } catch (error) {
        console.error('Failed to fetch Streak Data:', error);
        toast.error('Failed to load streak data');
      }
    };
    fetchStreakData();
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar setIsAuthenticated={setIsAuthenticated} />
      <div className="flex-1 overflow-auto bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-foreground">Your Streaks 🔥</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Streak Card */}
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Flame className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Current Streak</h2>
                  <p className="text-muted-foreground">Keep it going!</p>
                </div>
              </div>
              <p className="text-5xl font-bold text-primary">{streak.currentStreak} days</p>
            </div>

            {/* Highest Streak Card */}
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-secondary rounded-full">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Highest Streak</h2>
                  <p className="text-muted-foreground">Your best record!</p>
                </div>
              </div>
              <p className="text-5xl font-bold text-primary">{streak.highestStreak} days</p>
            </div>
          </div>

          {/* Last Completion Date */}
          {streak.lastCompletionDate && (
            <div className="mt-6 bg-card rounded-2xl p-6 shadow-lg border border-border">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary rounded-full">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Last Completion</h2>
                  <p className="text-muted-foreground">
                    {new Date(streak.lastCompletionDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreaksPage; 