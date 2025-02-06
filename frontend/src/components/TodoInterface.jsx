import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { Trash, Pencil, WandSparkles, Plus } from 'lucide-react';
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

    const handleEdit = (todo) => {
        setEditingId(todo._id);
        setEditTitle(todo.title);
        setEditDesc(todo.description || '');
        setEditDate(dayjs(todo.dueDate));
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
        <>
            <div className="min-h-screen bg-white pb-32">
                <Header setIsAuthenticated={setIsAuthenticated} currentStreakData={streak.currentStreak} bestStreakData={streak.highestStreak} />
                {/* <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="flex justify-around items-center">
                        <span>
                            <img src={bestStreakk} alt="Current Streak" className="w-14 h-14" />
                            <img src={currStreak} alt="Current Streak" className="w-14 h-14" />
                        </span>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-blue-600">{streak.currentStreak}</p>
                            <p className="text-sm text-gray-600">Current Streak</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-indigo-600">{streak.highestStreak}</p>
                            <p className="text-sm text-gray-600">Best Streak</p>
                        </div>
                    </div>
                </div> */}

                {/* <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="flex justify-around items-center">
                        <div className="flex flex-col items-center">
                            <img src={currStreak || "/placeholder.svg"} alt="Current Streak" className="w-14 h-14 mb-2" />
                            <p className="text-sm text-gray-600">Current Streak</p>
                            <p className=" relative text-3xl font-bold text-blue-600 z-20 bottom-24 left-8">{streak.currentStreak}</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <img src={bestStreakk || "/placeholder.svg"} alt="Best Streak" className="w-14 h-14 mb-2" />
                            <p className="text-sm text-gray-600">Best Streak</p>
                            <p className=" relative text-3xl font-bold text-blue-600 z-20 bottom-24 left-8">{streak.highestStreak}</p>
                        </div>
                    </div> */}

                {/* <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="flex justify-around items-center">
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <img src={currStreak || "/placeholder.svg"} alt="Current Streak" className="w-12 h-12 hover:scale-110 transition-transform" />
                                <p className="absolute left-16 bottom-5 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-blue-600 z-20 ">
                                    {streak.currentStreak}
                                </p>
                            </div>
                            <p className="text-sm text-gray-600">Current Streak</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <img src={bestStreakk || "/placeholder.svg"} alt="Best Streak" className="w-12 h-12  hover:scale-110 transition-transform" />
                                <p className="absolute left-20 bottom-5 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-blue-600 z-20">
                                    {streak.highestStreak}
                                </p>
                            </div>
                            <p className="text-sm text-gray-600">Best Streak</p>
                        </div>
                    </div>
                </div> */}

                <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 pb-16">
                    <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 h-auto lg:h-[calc(100vh-220px)]">
                        {/* Left Side - Todo Creation */}
                        <div className="w-full lg:w-2/5">
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
                                <h3 className="text-lg sm:text-xl font-semibold px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100
                                    bg-gradient-to-r from-blue-500/5 to-indigo-500/5
                                    font-sans tracking-wide via-violet-200 flex justify-center text-violet-900 select-none">
                                    {/* Create New Task */}
                                    Plan Your Day ✍️
                                </h3>
                                <div className="p-6">
                                    <form onSubmit={handleAddTodo} className="space-y-4">
                                        <input
                                            type="text"
                                            value={newTodo}
                                            onChange={(e) => setNewTodo(e.target.value)}
                                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                            placeholder="What needs to be done?"
                                        />

                                        <MDEditor
                                            value={newDesc}
                                            onChange={setNewDesc}
                                            preview="edit"
                                            height={200}
                                            className="mb-4 "
                                            textareaProps={{
                                                placeholder: "Add details for the task ... "
                                            }}
                                            commands={[
                                                commands.bold,
                                                commands.italic,
                                                // commands.strikethrough,
                                                // commands.hr,
                                                commands.title,
                                                commands.divider,
                                                // commands.quote,
                                                commands.code,
                                                commands.codeBlock,
                                                // commands.image,
                                                commands.link,
                                                commands.unorderedListCommand,
                                                commands.orderedListCommand,
                                                toggleCommand
                                                // commands.checkedListCommand
                                            ]}
                                        />
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <MobileDateTimePicker
                                                label="Due Date & Time"
                                                value={selectedDate}
                                                onChange={(newValue) => {
                                                    setSelectedDate(newValue);
                                                }}
                                                className="w-full"
                                                format="DD/MM/YYYY hh:mm A"
                                                slotProps={{
                                                    textField: {
                                                        variant: "outlined",
                                                        fullWidth: true,
                                                        className: "bg-white"
                                                    }
                                                }}
                                                minDateTime={dayjs().startOf('day')}
                                                ampm={true}
                                            />
                                        </LocalizationProvider>
                                        <button
                                            type="submit"
                                            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all transform hover:scale-[1.02] font-semibold shadow-md"
                                        >
                                            Add Task
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Todo List */}
                        <div className="w-full lg:w-3/5">
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
                                <h3 className="text-lg sm:text-xl font-semibold px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100
                                    bg-gradient-to-r from-blue-500/5 to-indigo-500/5
                                    font-sans tracking-wide flex justify-center via-violet-200 text-violet-900 select-none">
                                    {/* Your Tasks */}
                                    Tasks to get Done 🎯
                                </h3>
                                <div className="p-3 sm:p-6">
                                    <div className="h-[calc(100vh-375px)] overflow-y-auto pr-2
                                        scrollbar-thin scrollbar-thumb-blue-500/50 hover:scrollbar-thumb-blue-500
                                        scrollbar-track-gray-100 scrollbar-thumb-rounded-full
                                        scrollbar-track-rounded-full">
                                        {loading ? (
                                            <div className="flex justify-center items-center h-48">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 sm:space-y-4">
                                                {todos.length === 0 ? (
                                                    <div className="text-center py-6 sm:py-8 bg-white rounded-xl shadow-md border border-slate-200">
                                                        <p className="text-gray-500 text-sm sm:text-base select-none">No tasks yet. Create one to get started!</p>
                                                    </div>
                                                ) : (
                                                    <ul className="space-y-3 sm:space-y-4 mb-4">
                                                        {todos
                                                            .sort((a, b) => {
                                                                // Push completed items to the end
                                                                if (a.completed) return 1;
                                                                if (b.completed) return -1;
                                                                // Push items without due date to the end
                                                                if (!a.dueDate) return 1;
                                                                if (!b.dueDate) return -1;

                                                                // Compare due dates
                                                                return new Date(a.dueDate) - new Date(b.dueDate);
                                                            }).map((todo) => (
                                                                <li key={todo._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                                                                    {editingId === todo._id ? (
                                                                        <div className="p-3 sm:p-4">
                                                                            <input
                                                                                type="text"
                                                                                value={editTitle}
                                                                                onChange={(e) => setEditTitle(e.target.value)}
                                                                                className="w-full px-4 py-2 mb-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                            />
                                                                            {/* <textarea
                                                                                value={editDesc}
                                                                                onChange={(e) => setEditDesc(e.target.value)}
                                                                                className="w-full px-4 py-2 mb-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                                                rows="2"
                                                                            /> */}
                                                                            <MDEditor
                                                                                value={editDesc}
                                                                                onChange={setEditDesc}
                                                                                preview="edit"
                                                                                height={200}
                                                                                className="mb-4"
                                                                                textareaProps={{
                                                                                    placeholder: "Edit details..."
                                                                                }}
                                                                                commands={[
                                                                                    commands.bold,
                                                                                    commands.italic,
                                                                                    // commands.strikethrough,
                                                                                    // commands.hr,
                                                                                    commands.title,
                                                                                    commands.divider,
                                                                                    // commands.quote,
                                                                                    commands.code,
                                                                                    commands.codeBlock,
                                                                                    // commands.image,
                                                                                    commands.link,
                                                                                    commands.unorderedListCommand,
                                                                                    commands.orderedListCommand,
                                                                                    // toggleCommand
                                                                                    // commands.checkedListCommand
                                                                                ]}
                                                                            />
                                                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                                <MobileDateTimePicker
                                                                                    label="Due Date & Time"
                                                                                    value={editDate}
                                                                                    onChange={(newValue) => {
                                                                                        setEditDate(newValue);
                                                                                    }}
                                                                                    className="w-full"
                                                                                    format="DD/MM/YYYY hh:mm A"
                                                                                    slotProps={{
                                                                                        textField: {
                                                                                            variant: "outlined",
                                                                                            fullWidth: true,
                                                                                            className: "bg-white"
                                                                                        }
                                                                                    }}
                                                                                    minDateTime={dayjs().startOf('day')}
                                                                                    ampm={true}
                                                                                />
                                                                            </LocalizationProvider>
                                                                            <div className="flex gap-2 mt-3">
                                                                                <button
                                                                                    onClick={() => handleUpdateTodo(todo._id)}
                                                                                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md font-medium flex items-center gap-1"
                                                                                >
                                                                                    Save
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => setEditingId(null)}
                                                                                    className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-md font-medium flex items-center gap-1"
                                                                                >
                                                                                    Cancel
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="p-3 sm:p-4 shadow-md rounded-lg hover:shadow-lg transition-shadow border border-slate-200">
                                                                            {/* Mobile layout (<sm breakpoint) */}
                                                                            <div className="flex flex-col gap-2">
                                                                                {/* Title row */}
                                                                                <div className="flex items-center gap-3">
                                                                                    <Checkbox color="success"
                                                                                        checked={todo.completed}
                                                                                        onChange={() => handleToggleTodo(todo._id, todo.completed)} />
                                                                                    <span className={`flex-1 text-base sm:text-lg ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                                                                        {todo.title}
                                                                                    </span>
                                                                                </div>

                                                                                {todo.description && (
                                                                                    <div className="ml-14 prose prose-sm max-w-none">
                                                                                        <MDEditor.Markdown
                                                                                            source={todo.description}
                                                                                            className="text-gray-600 break-words whitespace-pre-wrap"
                                                                                        />
                                                                                    </div>
                                                                                )}

                                                                                {/* Actions row */}
                                                                                <div className="ml-14 flex flex-row items-center justify-between gap-2">
                                                                                    <div className={`text-xs sm:text-sm text-gray-800 border rounded-md p-1.5 sm:p-2 select-none ${todo.completed ? 'bg-gradient-to-r from-green-100 to-green-300' : 'bg-gradient-to-r from-orange-100 to-red-200'
                                                                                        }`}>
                                                                                        {(todo.dueDate && (!todo.completed)) ?
                                                                                            (new Date(todo.dueDate).getTime() > new Date().getTime()
                                                                                                ? <span
                                                                                                    className='text-gray-600 font-medium'>Due:</span> : <span
                                                                                                        className='text-gray-600 font-medium'>Overdue:</span>) : <span
                                                                                                            className='text-gray-600 font-medium'>Completed</span>} {(todo.dueDate && (!todo.completed)) ? new Date(todo.dueDate).toLocaleString('en-US', {
                                                                                                                year: 'numeric',
                                                                                                                month: 'short',
                                                                                                                day: 'numeric',
                                                                                                                hour: '2-digit',
                                                                                                                minute: '2-digit'
                                                                                                            }) : ''}
                                                                                    </div>
                                                                                    <div className="flex gap-2">
                                                                                        <button
                                                                                            onClick={() => handleEdit(todo)}
                                                                                            className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md"
                                                                                        >
                                                                                            <Pencil size={20} />
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => handleDeleteTodo(todo._id)}
                                                                                            className="p-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full hover:from-red-600 hover:to-rose-700 transition-all shadow-md"
                                                                                        >
                                                                                            <Trash size={20} />
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </li>
                                                            ))}
                                                    </ul>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Toaster position="bottom-right" />
            </div>

            {/* Create Task Button - Repositioned and restyled */}
            <div className={`fixed bottom-16 left-1/2 transform -translate-x-1/2 w-auto min-w-[300px] max-w-[400px] transition-all duration-300 ease-in-out ${isModalOpen ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full flex items-center justify-between px-6 py-3 bg-black text-white hover:bg-gray-800 rounded-full transition-colors shadow-lg"
                >
                    <span className="flex items-center gap-2">
                        <Plus size={20} />
                        Create new task
                    </span>
                    <span className="text-gray-400">5</span>
                </button>
            </div>

            {/* Footer with Quote - Restored */}
            <footer className="fixed bottom-0 w-full py-2 sm:py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-100">
                <p className="text-center text-gray-700 text-xs sm:text-sm md:text-base font-serif italic tracking-wide px-2 select-none">
                    <span className="font-semibold text-blue-600 select-none">Quote of The Day - </span>
                    {quote}
                </p>
            </footer>

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
            />
        </>
    );
};

export default TodoInterface;