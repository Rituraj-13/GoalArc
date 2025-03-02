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
            <div className="flex-1 overflow-auto bg-background p-4 md:p-8">
                <div className="pt-14 md:pt-0">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-7xl mx-auto"
                    >
                        <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8 text-foreground">
                            Calendar View 📅
                        </h1>

                        <div className={cn(
                            "bg-card rounded-xl shadow-lg p-3 md:p-6 border border-border",
                            isDark && [
                                // Toolbar styles
                                "[&_.fc-toolbar]:flex-col [&_.fc-toolbar]:gap-4 md:[&_.fc-toolbar]:flex-row",
                                "[&_.fc-toolbar-title]:text-xl md:[&_.fc-toolbar-title]:text-2xl",
                                "[&_.fc-toolbar-title]:text-foreground",
                                "[&_.fc-button]:!bg-primary",
                                "[&_.fc-button]:!border-primary",
                                "[&_.fc-button]:!text-primary-foreground",
                                "[&_.fc-button-active]:!bg-primary/80",

                                // Make calendar more compact on mobile
                                "[&_.fc-view]:text-sm md:[&_.fc-view]:text-base",
                                "[&_.fc-day]:p-1 md:[&_.fc-day]:p-2",

                                // Header cells
                                "[&_.fc-col-header-cell]:!bg-gray-800",
                                "[&_.fc-col-header-cell-cushion]:!text-gray-200",
                            ]
                        )}>
                            <FullCalendar
                                plugins={[dayGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                events={todos}
                                eventClick={handleEventClick}
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,dayGridWeek'
                                }}
                                height="auto"
                                views={{
                                    dayGridMonth: {
                                        titleFormat: {
                                            month: 'short',
                                            year: 'numeric'
                                        }
                                    }
                                }}
                                customButtons={{
                                    today: {
                                        text: 'Today',
                                        click: () => calendarRef.current.getApi().today()
                                    }
                                }}
                            />
                        </div>
                    </motion.div>
                </div>
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