import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';

const EventDetailsModal = ({ event, isOpen, onClose, isDark }) => {
    if (!isOpen) return null;

    const dueDate = dayjs(event.extendedProps.dueDate).format('MMM D, YYYY h:mm A');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={cn(
                "relative w-[90%] md:w-full md:max-w-md p-6 rounded-lg shadow-lg",
                isDark ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
            )}>
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Content */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-xl font-semibold">{event.title}</h3>
                        <p className={cn(
                            "mt-1 text-sm",
                            isDark ? "text-gray-400" : "text-gray-500"
                        )}>
                            {event.extendedProps.description}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <span className={cn(
                                "text-sm",
                                isDark ? "text-gray-400" : "text-gray-500"
                            )}>Due:</span>
                            <span className="text-sm font-medium">{dueDate}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className={cn(
                                "text-sm",
                                isDark ? "text-gray-400" : "text-gray-500"
                            )}>Status:</span>
                            <span className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                event.extendedProps.completed
                                    ? "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300"
                                    : "bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300"
                            )}>
                                {event.extendedProps.completed ? "Completed" : "Pending"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailsModal; 