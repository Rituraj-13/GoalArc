"use client"

import { useState, useEffect } from "react"
import Sidebar from "./Sidebar"
import PomodoroTimer from "./PomodoroTimer"
import { useTheme } from "./ThemeProvider"
import { cn } from "@/lib/utils"
import axios from "axios"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Coffee, BarChart, CheckCircle2 } from "lucide-react"
import { usePomodoro } from "../contexts/PomodoroContext"
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"

const PomodoroPage = ({ setIsAuthenticated }) => {
    const { isDark } = useTheme()
    const { selectedTodo, setSelectedTodo } = usePomodoro()
    const [todos, setTodos] = useState([])
    const [stats, setStats] = useState({
        work: { count: 0, totalDuration: 0 },
        shortBreak: { count: 0, totalDuration: 0 },
    })

    useEffect(() => {
        const handleSessionComplete = () => {
            fetchStats()
        }

        window.addEventListener("pomodoroSessionCompleted", handleSessionComplete)

        return () => {
            window.removeEventListener("pomodoroSessionCompleted", handleSessionComplete)
        }
    }, [])

    useEffect(() => {
        fetchTodos()
        fetchStats()
    }, [selectedTodo])

    const fetchTodos = async () => {
        try {
            const token = localStorage.getItem("todoToken")
            const response = await axios.get("https://goalarcservices.riturajdey.com/todos", {
                headers: { Authorization: `Bearer ${token}` },
            })
            setTodos(response.data.filter((todo) => !todo.completed))
        } catch (error) {
            console.error("Failed to fetch todos:", error)
        }
    }

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("todoToken")
            const response = await axios.get("https://goalarcservices.riturajdey.com/pomodoro/stats", {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    todoId: selectedTodo?._id || null,
                },
            })
            setStats(response.data)
        } catch (error) {
            console.error("Failed to fetch stats:", error.response?.data || error)
            setStats({
                work: { count: 0, totalDuration: 0 },
                shortBreak: { count: 0, totalDuration: 0 },
            })
        }
    }
    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (hours > 0) {
            return `${hours}h ${remainingMinutes}m`;
        } else {
            return `${remainingMinutes}m`;
        }
    };


    const calculateProductivityScore = () => {
        const totalTime = stats.work.totalDuration + stats.shortBreak.totalDuration
        return totalTime > 0 ? Math.round((stats.work.totalDuration / totalTime) * 100) : 0
    }

    return (
        <div className={cn("flex h-screen transition-colors duration-300", isDark ? "bg-gray-900" : "bg-gray-100")}>
            <Sidebar setIsAuthenticated={setIsAuthenticated} />
            <div className="flex-1 overflow-auto p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid gap-8 md:grid-cols-2">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Card className="shadow-lg overflow-hidden bg-card mt-14 md:mt-0">
                                <CardHeader>
                                    <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                                        <Clock className="h-6 w-6 text-primary" />
                                        Pomodoro Timer
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <PomodoroTimer selectedTodo={selectedTodo} />
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="space-y-8"
                        >
                            <Card className="shadow-lg bg-card">
                                <CardHeader>
                                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-primary" />
                                        Select Task
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Select
                                        value={selectedTodo?._id || "no-task"}
                                        onValueChange={(value) => {
                                            if (value === "no-task") {
                                                setSelectedTodo(null)
                                            } else {
                                                const todo = todos.find((t) => t._id === value)
                                                setSelectedTodo(todo || null)
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Choose a task to focus on" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="no-task">No task selected</SelectItem>
                                            {todos.map((todo) => (
                                                <SelectItem key={todo._id} value={todo._id}>
                                                    {todo.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg bg-card">
                                <CardHeader>
                                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                        <BarChart className="h-5 w-5 text-primary" />
                                        Today's Productivity Stats
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium">Focus Time</span>
                                            <span className="text-sm font-medium">{formatDuration(stats.work.totalDuration)}</span>
                                        </div>
                                        <Progress
                                            value={stats.work.totalDuration}
                                            max={stats.work.totalDuration + stats.shortBreak.totalDuration}
                                            className="h-2"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium">Break Time</span>
                                            <span className="text-sm font-medium">{formatDuration(stats.shortBreak.totalDuration)}</span>
                                        </div>
                                        <Progress
                                            value={stats.shortBreak.totalDuration}
                                            max={stats.work.totalDuration + stats.shortBreak.totalDuration}
                                            className="h-2"
                                        />
                                    </div>
                                    <div className="pt-4 border-t">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold">Productivity Score</span>
                                            <span className="text-2xl font-bold text-primary">{calculateProductivityScore()}%</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="mt-8 grid gap-8 md:grid-cols-3"
                    >
                        <Card className="shadow-lg bg-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-semibold">
                                    {selectedTodo ? "Task Focus Sessions" : "Total Focus Sessions"}
                                </CardTitle>
                                <Clock className="h-5 w-5 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-primary">{stats.work.count}</div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {selectedTodo ? "Sessions for this task" : "Total sessions"} today
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg bg-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-semibold">
                                    {selectedTodo ? "Task Break Sessions" : "Total Break Sessions"}
                                </CardTitle>
                                <Coffee className="h-5 w-5 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-primary">{stats.shortBreak.count}</div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {selectedTodo ? "Breaks for this task" : "Total breaks"} today
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg bg-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-semibold">
                                    {selectedTodo ? "Task Focus Time" : "Total Focus Time"}
                                </CardTitle>
                                <BarChart className="h-5 w-5 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-primary">{formatDuration(stats.work.totalDuration)}</div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {selectedTodo ? "Time spent on task" : "Total time"} today
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default PomodoroPage

