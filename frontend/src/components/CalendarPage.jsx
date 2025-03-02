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

            // Transform todos into calendar events with status-based colors
            const events = response.data.map(todo => {
                // Get status based on due date and completion
                const now = dayjs();
                const dueDate = dayjs(todo.dueDate);
                const isOverdue = !todo.completed && dueDate.isBefore(now);
                const isDueToday = !todo.completed && dueDate.isSame(now, 'day');
                const isDueTomorrow = !todo.completed && dueDate.isSame(now.add(1, 'day'), 'day');

                // Match status colors with TodoSheet component
                let backgroundColor, borderColor;
                if (todo.completed) {
                    backgroundColor = 'rgb(34 197 94)'; // green-500 for completed
                    borderColor = 'rgb(22 163 74)';     // green-600
                } else if (isOverdue) {
                    backgroundColor = 'rgb(239 68 68)';  // red-500 for overdue
                    borderColor = 'rgb(220 38 38)';      // red-600
                } else if (isDueToday) {
                    backgroundColor = 'rgb(249 115 22)'; // orange-500 for due today
                    borderColor = 'rgb(234 88 12)';      // orange-600
                } else if (isDueTomorrow) {
                    backgroundColor = 'rgb(234 179 8)';  // yellow-500 for due tomorrow
                    borderColor = 'rgb(202 138 4)';      // yellow-600
                } else {
                    backgroundColor = 'rgb(59 130 246)'; // blue-500 for upcoming
                    borderColor = 'rgb(37 99 235)';      // blue-600
                }

                return {
                    id: todo._id,
                    title: todo.title,
                    start: todo.dueDate,
                    end: todo.dueDate,
                    description: todo.description || 'No description',
                    backgroundColor,
                    borderColor,
                    textColor: 'white',
                    display: 'block',
                    className: 'shadow-sm hover:opacity-90 transition-opacity',
                    extendedProps: {
                        completed: todo.completed,
                        description: todo.description || 'No description',
                        dueDate: todo.dueDate,
                        status: todo.completed ? 'completed' :
                            isOverdue ? 'overdue' :
                                isDueToday ? 'due-today' :
                                    isDueTomorrow ? 'due-tomorrow' : 'upcoming'
                    }
                };
            });

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
                            "[&_.fc-toolbar]:flex-col [&_.fc-toolbar]:gap-4 md:[&_.fc-toolbar]:flex-row",
                            "[&_.fc-toolbar-title]:text-xl md:[&_.fc-toolbar-title]:text-2xl",
                            "[&_.fc-toolbar-title]:text-foreground",
                            "[&_.fc-button]:!bg-primary",
                            "[&_.fc-button]:!border-primary",
                            "[&_.fc-button]:!text-primary-foreground",
                            "[&_.fc-button-active]:!bg-primary/80",

                            "[&_.fc-event]:!p-1",
                            "[&_.fc-event-title]:!font-medium",
                            "[&_.fc-event-time]:!hidden",
                            "[&_.fc-event]:!rounded-md",
                            "[&_.fc-event]:!border-none",
                            "[&_.fc-event]:!shadow-sm",
                            "[&_.fc-event]:hover:!opacity-90",

                            "[&_.fc-day]:!bg-card",
                            "[&_.fc-day-other]:!bg-muted",
                            "[&_.fc-day-today]:!bg-accent",
                            "[&_.fc-col-header-cell]:!bg-muted",
                            "[&_.fc-col-header-cell-cushion]:!text-foreground",

                            "[&_.fc-view]:text-sm md:[&_.fc-view]:text-base",
                            "[&_.fc-day]:p-1 md:[&_.fc-day]:p-2",
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
                                eventDisplay="block" // Makes events fill the cell
                                displayEventTime={false} // Hides the event time
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