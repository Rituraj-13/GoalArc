import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Sidebar from './Sidebar';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import EventDetailsModal from './EventDetailsModal';

const CalendarPage = ({ setIsAuthenticated }) => {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isDark } = useTheme();
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

            // Transform todos into calendar events
            const events = response.data.map(todo => ({
                id: todo._id,
                title: todo.title,
                start: todo.dueDate,
                end: todo.dueDate,
                description: todo.description || 'No description',
                backgroundColor: todo.completed ? '#10B981' : '#3B82F6',
                borderColor: todo.completed ? '#059669' : '#2563EB',
                textColor: '#ffffff',
                extendedProps: {
                    completed: todo.completed,
                    description: todo.description || 'No description',
                    dueDate: todo.dueDate
                }
            }));

            setTodos(events);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch todos:', error);
            toast.error('Failed to load tasks');
            setLoading(false);
        }
    };

    const handleEventClick = (clickInfo) => {
        setSelectedEvent(clickInfo.event);
        setIsModalOpen(true);
    };

    return (
        <div className="flex h-screen">
            <Sidebar setIsAuthenticated={setIsAuthenticated} />
            <div className="flex-1 overflow-auto bg-background p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-7xl mx-auto"
                >
                    <h1 className="text-4xl font-bold mb-8 text-foreground">Calendar View 📅</h1>

                    <div className={cn(
                        "bg-card rounded-xl shadow-lg p-6 border border-border",
                        isDark && [
                            // Toolbar styles
                            "[&_.fc-toolbar-title]:text-foreground",
                            "[&_.fc-button]:!bg-primary",
                            "[&_.fc-button]:!border-primary",
                            "[&_.fc-button]:!text-primary-foreground",
                            "[&_.fc-button-active]:!bg-primary/80",

                            // Header cells
                            "[&_.fc-col-header-cell]:!bg-gray-800",
                            "[&_.fc-col-header-cell-cushion]:!text-gray-200",

                            // Day cells
                            "[&_.fc-daygrid-day]:!bg-gray-900",
                            "[&_.fc-daygrid-day-number]:!text-gray-200",
                            "[&_.fc-day-today]:!bg-gray-800",
                            "[&_.fc-day-past]:!bg-gray-900/50",
                            "[&_.fc-day-future]:!bg-gray-900",

                            // Events
                            "[&_.fc-daygrid-event]:!rounded-md",
                            "[&_.fc-daygrid-event]:!px-2",
                            "[&_.fc-daygrid-event]:!py-1",
                            "[&_.fc-daygrid-event]:!cursor-pointer",
                            "[&_.fc-daygrid-event]:hover:!opacity-80",

                            // Week numbers
                            "[&_.fc-day-other]:!bg-gray-900/30",
                            "[&_.fc-day-other_.fc-daygrid-day-number]:!text-gray-500",

                            // Time grid specific
                            "[&_.fc-timegrid-slot-label]:!text-gray-300",
                            "[&_.fc-timegrid-axis]:!text-gray-300",
                            "[&_.fc-timegrid-slot]:!bg-gray-900",
                            "[&_.fc-timegrid-now-indicator-line]:!border-red-500",

                            // List view
                            "[&_.fc-list]:!bg-gray-900",
                            "[&_.fc-list-day-cushion]:!bg-gray-800",
                            "[&_.fc-list-event]:hover:!bg-gray-800",
                            "[&_.fc-list-event-time]:!text-gray-300",
                            "[&_.fc-list-event-title]:!text-gray-200"
                        ]
                    )}>
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay'
                            }}
                            events={todos}
                            eventClick={handleEventClick}
                            height="auto"
                            aspectRatio={2}
                            editable={false}
                            selectable={true}
                            selectMirror={true}
                            dayMaxEvents={true}
                            eventTimeFormat={{
                                hour: 'numeric',
                                minute: '2-digit',
                                meridiem: 'short'
                            }}
                        />
                    </div>
                </motion.div>
                <EventDetailsModal
                    event={selectedEvent}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    isDark={isDark}
                />
            </div>
        </div>
    );
};

export default CalendarPage; 