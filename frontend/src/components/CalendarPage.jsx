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
import { CalendarCheck } from 'lucide-react';

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
            // const response = await axios.get('http://localhost:3000/todos', {
            const response = await axios.get('https://goalarcservices.riturajdey.com/todos', {
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
                        {/* <div className='flex gap-5'>
                            <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8 text-foreground">
                                Calendar View
                            </h1>
                            <CalendarCheck className='h-7 w-7 mt-0'/>
                        </div> */}

                        <div className={cn(
                            "bg-card rounded-xl shadow-lg p-3 md:p-6 border border-border",
                            // Mobile-first toolbar layout
                            "[&_.fc-toolbar]:!flex [&_.fc-toolbar]:!flex-col [&_.fc-toolbar]:!gap-4",
                            "md:[&_.fc-toolbar]:!flex-row md:[&_.fc-toolbar]:!gap-2",
                            "[&_.fc-toolbar]:!justify-between [&_.fc-toolbar]:!items-center",

                            // Title styles
                            "[&_.fc-toolbar-title]:text-xl md:[&_.fc-toolbar-title]:text-2xl",
                            "[&_.fc-toolbar-title]:text-foreground [&_.fc-toolbar-title]:w-full",
                            "[&_.fc-toolbar-title]:text-center md:[&_.fc-toolbar-title]:text-left",

                            // Button styles
                            "[&_.fc-button]:!bg-primary/10 [&_.fc-button]:!text-primary",
                            "[&_.fc-button]:hover:!bg-primary/20",
                            "[&_.fc-button]:!border-0",
                            "[&_.fc-button-active]:!bg-primary",
                            "[&_.fc-button-active]:!text-primary-foreground",
                            "[&_.fc-button]:!px-3 [&_.fc-button]:!py-1.5",
                            "[&_.fc-button]:!text-sm",

                            // Toolbar chunks layout
                            "[&_.fc-toolbar-chunk]:flex [&_.fc-toolbar-chunk]:items-center [&_.fc-toolbar-chunk]:gap-2",
                            "[&_.fc-toolbar-chunk]:w-full md:[&_.fc-toolbar-chunk]:w-auto",
                            "[&_.fc-toolbar-chunk]:justify-center md:[&_.fc-toolbar-chunk]:justify-start",

                            // Update Navigation buttons styles
                            "[&_.fc-prev-button]:!w-8 [&_.fc-next-button]:!w-8",
                            "[&_.fc-prev-button]:!h-8 [&_.fc-next-button]:!h-8",
                            "[&_.fc-prev-button]:!rounded-full [&_.fc-next-button]:!rounded-full",
                            "[&_.fc-prev-button]:!flex [&_.fc-next-button]:!flex",
                            "[&_.fc-prev-button]:!items-center [&_.fc-next-button]:!items-center",
                            "[&_.fc-prev-button]:!justify-center [&_.fc-next-button]:!justify-center",
                            "[&_.fc-icon]:!text-sm [&_.fc-icon]:!m-0 [&_.fc-icon]:!p-0",
                            "[&_.fc-icon]:!flex [&_.fc-icon]:!items-center [&_.fc-icon]:!justify-center",
                            "[&_.fc-icon]:!h-4 [&_.fc-icon]:!w-4",

                            // Event styles
                            "[&_.fc-event]:!p-1",
                            "[&_.fc-event-title]:!font-medium",
                            "[&_.fc-event-time]:!hidden",
                            "[&_.fc-event]:!rounded-md",
                            "[&_.fc-event]:!border-none",
                            "[&_.fc-event]:!shadow-sm",
                            "[&_.fc-event]:hover:!opacity-90",

                            // Calendar grid styles
                            "[&_.fc-day]:!bg-card",
                            "[&_.fc-day-other]:!bg-muted",
                            "[&_.fc-day-today]:!bg-accent",
                            "[&_.fc-col-header-cell]:!bg-muted",
                            "[&_.fc-col-header-cell-cushion]:!text-foreground",
                            "[&_.fc-view]:text-sm md:[&_.fc-view]:text-base",
                            "[&_.fc-day]:p-1 md:[&_.fc-day]:p-2",

                            // Add these new time grid specific styles
                            "[&_.fc-timegrid]:!border-separate",
                            "[&_.fc-timegrid-slot-minor]:!border-0", // Remove the 30-minute divider line
                            "[&_.fc-timegrid-slot]:!h-[60px]", // Make each time slot exactly 1 hour
                            "[&_.fc-timegrid-slot-label]:!h-[60px]", // Match label height with slot
                            "[&_.fc-timegrid-slots]:!border-r-0",
                            "[&_.fc-timegrid-divider]:!hidden", // Hide any additional dividers
                            "[&_.fc-timegrid-slot-label-cushion]:!font-medium",
                            "[&_.fc-timegrid-slot-label]:!border-0",
                            "[&_.fc-timegrid-axis]:!border-r-0",

                            // Adjust event positioning and appearance
                            "[&_.fc-timegrid-event]:!m-0",
                            "[&_.fc-timegrid-event]:!border",
                            "[&_.fc-timegrid-event-harness]:!m-0",

                            // Improve time column appearance
                            "[&_.fc-timegrid-axis-frame]:!py-2",
                            "[&_.fc-timegrid-axis]:!w-16",
                            "[&_.fc-timegrid-axis]:!border-r",
                        )}>
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                events={todos}
                                eventClick={handleEventClick}
                                headerToolbar={{
                                    left: 'title',
                                    center: 'dayGridMonth,timeGridWeek,timeGridDay',
                                    right: 'prev,next'
                                }}
                                height="auto"
                                eventDisplay="block"
                                displayEventTime={true}
                                views={{
                                    dayGridMonth: {
                                        titleFormat: {
                                            month: 'long',
                                            year: 'numeric'
                                        }
                                    },
                                    timeGridWeek: {
                                        titleFormat: {
                                            month: 'long',
                                            year: 'numeric'
                                        },
                                        dayHeaderFormat: {
                                            weekday: 'short'
                                        },
                                        slotMinTime: '00:00:00',
                                        slotMaxTime: '24:00:00',
                                        expandRows: true,
                                        allDaySlot: false,
                                        slotDuration: '01:00:00',
                                        slotLabelInterval: '01:00:00',
                                        slotLabelFormat: {
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                        }
                                    },
                                    timeGridDay: {
                                        titleFormat: {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        },
                                        dayHeaderFormat: {
                                            weekday: 'short'
                                        },
                                        slotMinTime: '00:00:00',
                                        slotMaxTime: '24:00:00',
                                        expandRows: true,
                                        allDaySlot: false,
                                        slotDuration: '01:00:00',
                                        slotLabelInterval: '01:00:00',
                                        slotLabelFormat: {
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                        }
                                    }
                                }}
                                buttonText={{
                                    // today: 'Today',
                                    month: 'Month',
                                    week: 'Week',
                                    day: 'Day'
                                }}
                                slotEventOverlap={false}
                                nowIndicator={true}
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