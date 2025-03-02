import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { Trash, Pencil, WandSparkles, Plus, ArrowBigRight, ArrowBigRightDashIcon, Calendar, ChevronDown } from 'lucide-react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from "dayjs";
import { DatePicker, DateTimePicker, MobileDateTimePicker } from '@mui/x-date-pickers';
import MDEditor, { commands } from "@uiw/react-md-editor";
import { Checkbox } from '@mui/material';
import AIResponse from '../utils/AIResponse';
import CreateTaskModal from './CreateTaskModal';
import Sidebar from './Sidebar';
import { TodoSheet } from './ui/TodoSheet';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from 'framer-motion';
const TodoInterface = ({ setIsAuthenticated }) => {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [quote, setQuote] = useState("");
    const [selectedDate, setSelectedDate] = useState(dayjs().add(1, 'hour'));
    const [editDate, setEditDate] = useState(dayjs());
    const [streak, setStreak] = useState({
        currentStreak: 0,
        highestStreak: 0,
        lastCompletionDate: null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("all");

    // Get user's name from localStorage or set default
    const userName = localStorage.getItem('firstName') || 'User';

    // Get greeting based on time of day
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Fetch todos, quote, streaks on component mount
    useEffect(() => {
        const fetchStreakData = async () => {
            try {
                setLoading(true);
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
            } finally {
                setLoading(false);
            }
        }
        fetchStreakData();
        fetchTodos();
        const fetchQuote = async () => {
            const newQuote = await getQuote();
            setQuote(newQuote);
        };
        fetchQuote();
    }, []);

    useEffect(() => {
        // Check streak every hour
        const streakCheckInterval = setInterval(() => {
            fetchStreakData();
        }, 60 * 60 * 1000);

        return () => clearInterval(streakCheckInterval);
    }, []);

    const fetchTodos = async () => {
        try {
            const token = localStorage.getItem('todoToken');
            const response = await axios.get('http://localhost:3000/todos', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setTodos(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch todos:', error);
            setLoading(false);
        }
    };

    const handleAddTodo = async (e) => {
        e.preventDefault();
        if (!newTodo.trim()) {
            toast.error("Please fill out the fields!");
            return;
        }

        try {
            const token = localStorage.getItem('todoToken');
            const response = await axios.post('http://localhost:3000/todos',
                {
                    title: newTodo,
                    description: newDesc,
                    dueDate: selectedDate.toISOString()
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            setNewTodo('');
            setNewDesc('');
            setSelectedDate(dayjs());
            setIsModalOpen(false);
            setTodos(prev => sortTodos([...prev, response.data]));
            toast.success('Task added', { duration: 2000 });
        } catch (error) {
            toast.error('Failed to add task', { duration: 3000 });
        }
    };

    const handleToggleTodo = async (todoId) => {
        try {
            const todoToUpdate = todos.find(t => t._id === todoId);
            if (!todoToUpdate) return;

            const token = localStorage.getItem('todoToken');
            const response = await axios.put(
                `http://localhost:3000/todos/${todoId}`,
                {
                    completed: !todoToUpdate.completed // Toggle the completed status
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // Update local state
            setTodos(prevTodos =>
                prevTodos.map(todo =>
                    todo._id === todoId
                        ? { ...todo, completed: !todo.completed }
                        : todo
                )
            );

            // Show success message if streak milestone reached
            if (response.data.milestone) {
                toast.success(`🎉 ${response.data.milestone.count} week streak achieved!`);
            }
        } catch (error) {
            toast.error('Failed to update task status');
            console.error('Error updating todo:', error);
        }
    };

    const handleDeleteTodo = async (id) => {
        try {
            const token = localStorage.getItem('todoToken');
            await axios.delete(`http://localhost:3000/todos/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setTodos(prev => prev.filter(todo => todo._id !== id));
            toast.success('Task deleted', { duration: 2000 });
        } catch (error) {
            toast.error('Delete failed', { duration: 3000 });
        }
    };

    const handleEditTodo = async (updatedTodo) => {
        try {
            const response = await fetch(`http://localhost:3000/todos/${updatedTodo._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('todoToken')}`
                },
                body: JSON.stringify(updatedTodo)
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            // Update the todos state immediately after successful edit
            setTodos(prevTodos =>
                prevTodos.map(todo =>
                    todo._id === updatedTodo._id ? updatedTodo : todo
                )
            );

            toast.success('Task updated successfully');
        } catch (error) {
            console.error('Error updating task:', error);
            toast.error('Failed to update task');
        }
    };

    const handleUpdateTodo = async (id) => {
        try {
            const token = localStorage.getItem('todoToken');
            await axios.put(`http://localhost:3000/todos/${id}`,
                {
                    title: editTitle,
                    description: editDesc,
                    dueDate: editDate.toISOString()
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setEditingId(null);
            fetchTodos();
            toast.success('Task updated', { duration: 2000 });
        } catch (error) {
            toast.error('Update failed', { duration: 3000 });
        }
    };

    const fallbackQuotes = [
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "The only way to do great work is to love what you do.",
        "Stay focused and never give up.",
        "Make each day your masterpiece."
    ];

    const getQuote = async () => {
        try {
            const quoteOfTheDay = await fetch("/api/random")
                .then(response => response.json())

            const refined_Quote = quoteOfTheDay[0].q;

            if (refined_Quote.startsWith("Too")) {
                // Get random fallback quote when API limit is reached
                const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
                setQuote(fallbackQuotes[randomIndex]);
                // Optionally show a toast/notification about API limit
                console.log("API rate limit reached, showing fallback quote");
                return fallbackQuotes[randomIndex];
            } else if (!refined_Quote || refined_Quote.trim() === "") {
                // Handle empty or null responses
                setQuote("Stay productive!");
                return "Stay productive!";
            } else {
                return refined_Quote;
            }

        } catch (error) {
            console.error('Error fetching quote:', error);
        }
    }

    const toggleCommand = {
        name: 'toggle',
        keyCommand: 'toggle',
        buttonProps: {
            'aria-label': 'Add toggle',
            'title': 'AI Generated Description'
        },
        icon: <span>
            <WandSparkles
                color="#5056fb"
                size={14}
                strokeWidth={2}
            />
        </span>,
        execute: async (state, api) => {
            try {
                if (!newTodo) {
                    toast.error('Title required', { duration: 2000 });
                    return;
                }
                const loadingToastId = toast.loading('Generating...');

                // Get AI response
                const aiDesc = await AIResponse(newTodo);

                // Set the AI generated description in the MDEditor
                setNewDesc(aiDesc);

                // Dismiss loading toast and show success
                toast.dismiss(loadingToastId);
                toast.success('Description ready', { duration: 2000 });
            } catch (error) {
                toast.dismiss();
                toast.error('Generation failed', { duration: 3000 });
            }
        },
    };

    const sortTodos = (todos) => {
        return [...todos].sort((a, b) => {
            // If one is completed and other is not, completed goes last
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }

            const now = dayjs();
            const aDueDate = dayjs(a.dueDate);
            const bDueDate = dayjs(b.dueDate);
            const aIsOverdue = now.isAfter(aDueDate);
            const bIsOverdue = now.isAfter(bDueDate);

            // If both are completed, sort by due date
            if (a.completed && b.completed) {
                return aDueDate.isBefore(bDueDate) ? -1 : 1;
            }

            // If one is overdue and other is not, overdue goes first
            if (aIsOverdue !== bIsOverdue) {
                return aIsOverdue ? -1 : 1;
            }

            // If both are overdue or both are due, sort by due date
            return aDueDate.isBefore(bDueDate) ? -1 : 1;
        });
    };

    const getFilteredTodos = () => {
        const today = dayjs().startOf('day');
        const tomorrow = dayjs().add(1, 'day').startOf('day');

        switch (selectedFilter) {
            case "today":
                return todos.filter(todo =>
                    dayjs(todo.dueDate).isSame(today, 'day')
                );
            case "tomorrow":
                return todos.filter(todo =>
                    dayjs(todo.dueDate).isSame(tomorrow, 'day')
                );
            case "all":
                return todos;
            default:
                return todos;
        }
    };

    return (
        <div className="flex h-screen">
            <Sidebar setIsAuthenticated={setIsAuthenticated} />
            <div className="flex-1 overflow-auto relative bg-background">
                <main className="p-4 md:p-8 pb-48">
                    {/* Add padding-top for mobile to account for menu button */}
                    <div className="pt-14 md:pt-0">
                        {/* Greeting - Make text responsive */}
                        <div className="mb-6 md:mb-8">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <h1 className="text-2xl md:text-4xl font-bold text-foreground">
                                    {getGreeting()}, {userName}! 👋
                                </h1>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="text-sm md:text-base text-muted-foreground mt-2"
                            >
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </motion.div>
                        </div>

                        {/* Todos Section */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-6">
                                <motion.h2
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                    className="text-2xl font-semibold text-foreground"
                                >
                                    {selectedFilter === "today" && "Due Today 🙇"}
                                    {selectedFilter === "tomorrow" && "Due Tomorrow ⌛"}
                                    {selectedFilter === "all" && "All Tasks 🎯"}
                                </motion.h2>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "flex items-center gap-2",
                                                isCollapsed
                                                    ? "hover:bg-gray-800"
                                                    : "hover:bg-primary/10 hover:text-primary "
                                            )}
                                        >
                                            Filter
                                            <ChevronDown className="h-4 w-4 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuItem
                                            onClick={() => setSelectedFilter("today")}
                                            className={selectedFilter === "today" ? "bg-primary/10" : ""}
                                        >
                                            Due Today
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => setSelectedFilter("tomorrow")}
                                            className={selectedFilter === "tomorrow" ? "bg-primary/10" : ""}
                                        >
                                            Due Tomorrow
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => setSelectedFilter("all")}
                                            className={selectedFilter === "all" ? "bg-primary/10" : ""}
                                        >
                                            All Tasks
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            {getFilteredTodos().length > 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                    className="space-y-3"
                                >
                                    {sortTodos(getFilteredTodos()).map(todo => (
                                        <TodoSheet
                                            key={todo._id}
                                            todo={todo}
                                            onEdit={handleEditTodo}
                                            onDelete={handleDeleteTodo}
                                            onToggleComplete={handleToggleTodo}
                                        />
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                >
                                    <div className="bg-card border-border rounded-xl p-8 text-center shadow-sm">
                                        <div className="mb-4">
                                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                                <Calendar className="w-8 h-8 text-primary" />
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-semibold text-foreground mb-2">No tasks yet</h3>
                                        <p className="text-muted-foreground mb-6">Create your first task to get started on your productivity journey!</p>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </main>

                {/* Update the Create Task Button positioning and width */}
                <div className={cn(
                    "fixed bottom-24 transition-all duration-300 ease-in-out",
                    "w-[90%] md:w-[300px] lg:w-[400px]", // Increased width for larger screens
                    "left-1/2 transform -translate-x-1/2", // Center on mobile
                    "md:left-[calc(50%+125px)]", // Original desktop positioning
                )}>
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        onClick={() => setIsModalOpen(true)}
                        className="w-full flex items-center justify-between px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full transition-colors shadow-lg"
                    >
                        <span className="flex items-center gap-3">
                            <Plus size={20} />
                            <span className="text-base">Create new task</span>
                        </span>
                        <ArrowBigRightDashIcon size={20} />
                    </motion.button>
                </div>

                {/* Update the footer for mobile */}
                <footer className={cn(
                    "fixed bottom-0 left-0 right-0 py-2 md:py-4 bg-card/50 backdrop-blur-sm border-t border-border transition-all duration-300",
                    "md:left-60" // Only apply sidebar offset on desktop
                )}>
                    <p className="text-center text-muted-foreground text-xs md:text-sm font-serif italic tracking-wide px-4">
                        <span className="font-semibold text-primary">Quote of The Day - </span>
                        {quote}
                    </p>
                </footer>
            </div>

            {/* Create Task Modal */}
            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                newTodo={newTodo}
                setNewTodo={setNewTodo}
                newDesc={newDesc}
                setNewDesc={setNewDesc}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                handleAddTodo={handleAddTodo}
                toggleCommand={toggleCommand}
                commands={commands}
                isEditing={isEditing}
                isCollapsed={isCollapsed}
            />
        </div>
    );
};

export default TodoInterface;