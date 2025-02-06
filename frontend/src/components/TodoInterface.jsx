import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { Trash, Pencil, WandSparkles, Plus, ArrowBigRight, ArrowBigRightDashIcon } from 'lucide-react';
import Header from './Header';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from "dayjs";
import { DatePicker, DateTimePicker, MobileDateTimePicker } from '@mui/x-date-pickers';
import MDEditor, { commands } from "@uiw/react-md-editor";
import { Checkbox } from '@mui/material';
import AIResponse from '../utils/AIResponse';
import currStreak from '../assets/currStreak.svg';
import bestStreak from '../assets/bestStreak.svg';
import bestStreakk from '../assets/bestStreakk.svg';
import CreateTaskModal from './CreateTaskModal';
import Sidebar from './Sidebar';
import { TodoSheet } from './ui/TodoSheet';
import { Button } from './ui/button';

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
        highestStreak: 0
    })
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Get user's name from localStorage or set default
    const userName = localStorage.getItem('userName') || 'User';

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
                const token = localStorage.getItem('todoToken');
                const response = await axios.get('http://localhost:3000/todos/streak', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setStreak(response.data);
            } catch (error) {
                console.error('Failed to fetch Streak Data !')
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
            toast.error('Failed to Fetch Todos !');
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
            await axios.post('http://localhost:3000/todos',
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
            await fetchTodos();
            toast.success('Task added', { duration: 2000 });
        } catch (error) {
            toast.error('Failed to add task', { duration: 3000 });
        }
    };

    const handleToggleTodo = async (id, completed) => {
        try {
            const token = localStorage.getItem('todoToken');
            const response = await axios.put(`http://localhost:3000/todos/${id}`,
                { completed: !completed },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.streak) {
                setStreak(response.data.streak);
            }

            fetchTodos();
            toast.success('Task updated', { duration: 2000 });
        } catch (error) {
            toast.error('Update failed', { duration: 3000 });
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
            fetchTodos();
            toast.success('Task deleted', { duration: 2000 });
        } catch (error) {
            toast.error('Delete failed', { duration: 3000 });
        }
    };

    const handleEdit = async (todo) => {
        try {
            const token = localStorage.getItem('todoToken');
            await axios.put(`http://localhost:3000/todos/${todo._id}`,
                {
                    title: todo.title,
                    description: todo.description,
                    dueDate: todo.dueDate
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            fetchTodos();
            toast.success('Task updated', { duration: 2000 });
        } catch (error) {
            toast.error('Update failed', { duration: 3000 });
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

    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 overflow-auto relative">
                <Header setIsAuthenticated={setIsAuthenticated} currentStreakData={streak.currentStreak} bestStreakData={streak.highestStreak} />
                <main className="p-8 pb-48">
                    {/* Greeting */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold">
                            {getGreeting()}, {userName}! 👋
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </p>
                    </div>

                    {/* Todos Section */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold">Today's Tasks</h2>
                        </div>
                        <div className="space-y-3">
                            {todos.map(todo => (
                                <TodoSheet
                                    key={todo._id}
                                    todo={todo}
                                    onEdit={handleEdit}
                                    onDelete={handleDeleteTodo}
                                    onToggleComplete={handleToggleTodo}
                                />
                            ))}
                        </div>
                    </div>
                </main>

                {/* Create Task Button - Fixed position */}
                <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 w-[90%] sm:w-auto sm:min-w-[400px] sm:max-w-[500px] transition-all duration-300 ease-in-out">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3 bg-black text-white hover:bg-gray-800 rounded-full transition-colors shadow-lg"
                    >
                        <span className="flex items-center gap-2">
                            <Plus size={20} />
                            <span className="text-sm sm:text-base">Create new task</span>
                        </span>
                        <span className="text-gray-400">
                            <ArrowBigRightDashIcon size={20} />
                        </span>
                    </button>
                </div>

                {/* Quote - Fixed at bottom */}
                <footer className="fixed bottom-0 left-0 right-0 py-2 sm:py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-100">
                    <p className="text-center text-gray-700 text-xs sm:text-sm md:text-base font-serif italic tracking-wide px-2 select-none">
                        <span className="font-semibold text-blue-600 select-none">Quote of The Day - </span>
                        {quote}
                    </p>
                </footer>
            </div>

            {/* Create Task Modal */}
            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                    setEditTitle('');
                    setEditDesc('');
                    setEditDate(dayjs().add(1, 'hour'));
                }}
                newTodo={editingId ? editTitle : newTodo}
                setNewTodo={editingId ? setEditTitle : setNewTodo}
                newDesc={editingId ? editDesc : newDesc}
                setNewDesc={editingId ? setEditDesc : setNewDesc}
                selectedDate={editingId ? editDate : selectedDate}
                setSelectedDate={editingId ? setEditDate : setSelectedDate}
                handleAddTodo={editingId ? () => handleUpdateTodo(editingId) : handleAddTodo}
                toggleCommand={toggleCommand}
                commands={commands}
                isEditing={!!editingId}
            />
            <Toaster />
        </div>
    );
};

export default TodoInterface;