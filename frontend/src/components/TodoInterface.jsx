import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const TodoInterface = () => {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [loading, setLoading] = useState(true);

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
            toast.error('Failed to fetch todos');
            setLoading(false);
        }
    };

    const handleAddTodo = async (e) => {
        e.preventDefault();
        if (!newTodo.trim()) return;

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
            toast.success('Todo added successfully');
        } catch (error) {
            toast.error('Failed to add todo');
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
            toast.error('Failed to update todo');
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
            toast.success('Todo deleted successfully');
        } catch (error) {
            toast.error('Failed to delete todo');
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">My Todos</h2>

            <form onSubmit={handleAddTodo} className="mb-8">
                <div className="flex flex-col gap-4">
                    <input
                        type="text"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500"
                        placeholder="Add a new todo..."
                    />
                    <input
                        type="text"
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500"
                        placeholder="Add the description..."
                    />
                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                    >
                        Add Todo
                    </button>
                </div>
            </form>

            {loading ? (
                <div className="text-center text-lg text-gray-600">Loading...</div>
            ) : (
                <ul className="space-y-4">
                    {todos.map((todo) => (
                        <li key={todo._id} className="p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <input
                                    type="checkbox"
                                    checked={todo.completed}
                                    onChange={() => handleToggleTodo(todo._id, todo.completed)}
                                    className="h-5 w-5 rounded border-gray-300 cursor-pointer"
                                />
                                <span className={`flex-1 text-lg ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                    {todo.title}
                                </span>
                                <button
                                    onClick={() => handleDeleteTodo(todo._id)}
                                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                                    aria-label="Delete todo"
                                >
                                    Delete
                                </button>
                            </div>
                            {todo.description && (
                                <p className="ml-9 mt-2 text-sm text-gray-600">
                                    {todo.description}
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TodoInterface;