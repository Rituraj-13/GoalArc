import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { Trash, Pencil } from 'lucide-react';

const TodoInterface = () => {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');

    // Fetch todos on component mount
    useEffect(() => {
        fetchTodos();
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
            toast.error("Please fill out the fields !");
            return;
        }

        try {
            const token = localStorage.getItem('todoToken');
            await axios.post('http://localhost:3000/todos',
                {
                    title: newTodo,
                    description: newDesc
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setNewTodo('');
            setNewDesc('');
            fetchTodos();
            toast.success('Todo Added Successfully !');
        } catch (error) {
            toast.error('Failed to add todo !');
        }
    };

    const handleToggleTodo = async (id, completed) => {
        try {
            const token = localStorage.getItem('todoToken');
            await axios.put(`http://localhost:3000/todos/${id}`,
                { completed: !completed },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            fetchTodos();
        } catch (error) {
            toast.error('Failed to Update Todo !');
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
            toast.success('Successfully Deleted !');
        } catch (error) {
            toast.error('Failed to Delete Todo !');
        }
    };

    const handleEdit = (todo) => {
        setEditingId(todo._id);
        setEditTitle(todo.title);
        setEditDesc(todo.description || '');
    };

    const handleUpdateTodo = async (id) => {
        try {
            const token = localStorage.getItem('todoToken');
            await axios.put(`http://localhost:3000/todos/${id}`,
                {
                    title: editTitle,
                    description: editDesc
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setEditingId(null);
            fetchTodos();
            toast.success('Successfully Updated !');
        } catch (error) {
            toast.error('Failed to update todo');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
            <Toaster position="bottom-right" />
            <div className="max-w-3xl mx-auto">
                <h2 className="text-4xl font-bold mb-12 text-gray-800 text-center">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        My Tasks
                    </span>
                </h2>

                <form onSubmit={handleAddTodo} className="mb-12 bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex flex-col gap-4">
                        <input
                            type="text"
                            value={newTodo}
                            onChange={(e) => setNewTodo(e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="What needs to be done?"
                        />
                        <textarea
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                            placeholder="Add details..."
                            rows="3"
                        />
                        <button
                            type="submit"
                            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all transform hover:scale-[1.02] font-semibold shadow-md"
                        >
                            Add Task
                        </button>
                    </div>
                </form>
                {loading ? (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {todos.map((todo) => (
                            <li key={todo._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                                {editingId === todo._id ? (
                                    <div className="p-4">
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="w-full px-4 py-2 mb-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <textarea
                                            value={editDesc}
                                            onChange={(e) => setEditDesc(e.target.value)}
                                            className="w-full px-4 py-2 mb-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                            rows="2"
                                        />
                                        <div className="flex gap-2">
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
                                    <div className="p-4">
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="checkbox"
                                                checked={todo.completed}
                                                onChange={() => handleToggleTodo(todo._id, todo.completed)}
                                                className="h-5 w-5 rounded border-gray-300 cursor-pointer focus:ring-2 focus:ring-blue-500"
                                            />
                                            <span className={`flex-1 text-lg ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                                {todo.title}
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(todo)}
                                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md font-medium flex items-center gap-2"
                                                >
                                                    <span>Edit</span>
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTodo(todo._id)}
                                                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 transition-all shadow-md font-medium flex items-center gap-2"
                                                >
                                                    <span>Delete</span>
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        {todo.description && (
                                            <p className="ml-9 mt-2 text-sm text-gray-600">
                                                {todo.description}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default TodoInterface;