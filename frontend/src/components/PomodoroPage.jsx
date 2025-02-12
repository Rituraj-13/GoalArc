import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import PomodoroTimer from './PomodoroTimer';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';
import axios from 'axios';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle2, Coffee } from 'lucide-react';
import { usePomodoro } from '../contexts/PomodoroContext';

const PomodoroPage = ({ setIsAuthenticated }) => {
    const { isDark } = useTheme();
    const { selectedTodo, setSelectedTodo } = usePomodoro();
    const [todos, setTodos] = useState([]);
    const [stats, setStats] = useState({
        work: { count: 0, totalDuration: 0 },
        shortBreak: { count: 0, totalDuration: 0 },
        longBreak: { count: 0, totalDuration: 0 }
    });

    // Add effect to listen for session completion
    useEffect(() => {
        const handleSessionComplete = () => {
            fetchStats();
        };

        window.addEventListener('pomodoroSessionCompleted', handleSessionComplete);

        return () => {
            window.removeEventListener('pomodoroSessionCompleted', handleSessionComplete);
        };
    }, [selectedTodo]); // Add selectedTodo as dependency since fetchStats uses it

    useEffect(() => {
        fetchTodos();
        fetchStats();
    }, [selectedTodo]);

    const fetchTodos = async () => {
        try {
            const token = localStorage.getItem('todoToken');
            const response = await axios.get('http://localhost:3000/todos', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setTodos(response.data.filter(todo => !todo.completed));
        } catch (error) {
            console.error('Failed to fetch todos:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('todoToken');
            // Add logging to debug the request
            console.log('Fetching stats for todoId:', selectedTodo?._id);

            const response = await axios.get('http://localhost:3000/pomodoro/stats', {
                headers: { 'Authorization': `Bearer ${token}` },
                params: {
                    todoId: selectedTodo?._id || null
                }
            });

            // Log the response
            console.log('Stats response:', response.data);

            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error.response?.data || error);
            setStats({
                work: { count: 0, totalDuration: 0 },
                shortBreak: { count: 0, totalDuration: 0 },
                longBreak: { count: 0, totalDuration: 0 }
            });
        }
    };

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    return (
        <div className="flex h-screen">
            <Sidebar setIsAuthenticated={setIsAuthenticated} />
            <div className="flex-1 overflow-auto bg-background">
                <div className="max-w-4xl mx-auto">
                    <div className="p-8">
                        <h1 className={cn(
                            "text-4xl font-bold mb-8",
                            isDark ? "text-gray-100" : "text-gray-900"
                        )}>
                            Pomodoro Timer
                        </h1>

                        {/* Task Selection - Updated */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium mb-2">
                                Select Task
                            </label>
                            <Select
                                value={selectedTodo?._id || "no-task"}
                                onValueChange={(value) => {
                                    if (value === "no-task") {
                                        setSelectedTodo(null);
                                    } else {
                                        const todo = todos.find(t => t._id === value);
                                        setSelectedTodo(todo || null);
                                    }
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Choose a task to focus on" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="no-task">No task selected</SelectItem>
                                    {todos.map(todo => (
                                        <SelectItem key={todo._id} value={todo._id}>
                                            {todo.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Timer */}
                        <div className={cn(
                            "rounded-lg p-6 mb-8",
                            isDark ? "bg-card" : "bg-white border"
                        )}>
                            <PomodoroTimer
                                selectedTodo={selectedTodo}
                            />
                        </div>

                        {/* Statistics */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {selectedTodo ? "Task Focus Time" : "Total Focus Time"}
                                    </CardTitle>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {formatDuration(stats.work.totalDuration)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {stats.work.count} {selectedTodo ? "task " : ""}sessions today
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {selectedTodo ? "Task Short Breaks" : "Total Short Breaks"}
                                    </CardTitle>
                                    <Coffee className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {formatDuration(stats.shortBreak.totalDuration)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {stats.shortBreak.count} {selectedTodo ? "task " : ""}breaks today
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {selectedTodo ? "Task Long Breaks" : "Long Breaks"}
                                    </CardTitle>
                                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {formatDuration(stats.longBreak.totalDuration)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {stats.longBreak.count} {selectedTodo ? "task " : ""}breaks today
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PomodoroPage; 