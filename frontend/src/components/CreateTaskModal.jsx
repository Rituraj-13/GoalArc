import React, { useState } from 'react';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { Calendar, AlignLeft } from 'lucide-react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileDateTimePicker } from '@mui/x-date-pickers';
import MDEditor from "@uiw/react-md-editor";
import dayjs from "dayjs";
import { toast } from 'react-hot-toast';
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";
import { useMediaQuery } from '@/hooks/useMediaQuery';

const CreateTaskModal = ({
    isOpen,
    onClose,
    newTodo,
    setNewTodo,
    newDesc,
    setNewDesc,
    selectedDate,
    setSelectedDate,
    handleAddTodo,
    toggleCommand,
    commands,
    isEditing,
    isCollapsed
}) => {
    const [showNotes, setShowNotes] = useState(false);
    const { isDark } = useTheme();
    const isMobile = useMediaQuery("(max-width: 768px)");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedDate) {
            toast.error("Please select a due date for the task!");
            return;
        }
        handleAddTodo(e);
    };

    return (
        <Transition show={isOpen} as={React.Fragment}>
            <Dialog
                onClose={onClose}
                className="relative z-[60]"
            >
                {/* Backdrop */}
                <TransitionChild
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                        aria-hidden="true"
                    />
                </TransitionChild>

                {/* Modal Container */}
                <div className={cn(
                    "fixed inset-0 flex items-center justify-center transition-all duration-300 z-50",
                    // Only apply sidebar offset on desktop
                    !isMobile && (isCollapsed ? "pl-16" : "pl-60")
                )}>
                    <TransitionChild
                        as={React.Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95 translate-y-4"
                        enterTo="opacity-100 scale-100 translate-y-0"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100 translate-y-0"
                        leaveTo="opacity-0 scale-95 translate-y-4"
                    >
                        <DialogPanel className={cn(
                            "w-[95%] md:w-[400px] rounded-2xl shadow-xl mx-auto max-h-[90vh] overflow-y-auto relative z-[70]",
                            isDark ? "bg-card" : "bg-gray-50"
                        )}>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="p-4">
                                    {/* Task Input */}
                                    <div className={cn(
                                        "rounded-xl border shadow-sm",
                                        isDark ? "bg-background border-border" : "bg-white border-gray-200"
                                    )}>
                                        <input
                                            type="text"
                                            value={newTodo}
                                            onChange={(e) => setNewTodo(e.target.value)}
                                            className={cn(
                                                "w-full px-4 py-3 text-base md:text-lg focus:outline-none rounded-t-xl",
                                                isDark ? "bg-background text-foreground placeholder:text-gray-500" : "bg-white"
                                            )}
                                            placeholder="Create new task"
                                            required
                                        />

                                        {/* Controls Row */}
                                        <div className={cn(
                                            "grid grid-cols-2 gap-2 p-3 md:p-4 border-t",
                                            isDark ? "border-border" : "border-gray-100"
                                        )}>
                                            <button
                                                type="button"
                                                className={cn(
                                                    "flex items-center justify-center gap-2 p-2 rounded-lg cursor-default",
                                                    isDark ? "bg-secondary text-primary" : "bg-gray-100 text-indigo-500"
                                                )}
                                            >
                                                <Calendar size={18} />
                                                <span className="text-xs md:text-sm font-medium">Due date</span>
                                            </button>
                                            <button
                                                type="button"
                                                className={cn(
                                                    "flex items-center justify-center gap-2 p-2 rounded-lg transition-colors",
                                                    showNotes
                                                        ? isDark ? "bg-secondary text-primary" : "bg-gray-100 text-indigo-500"
                                                        : isDark ? "text-gray-400 hover:bg-secondary" : "text-gray-600 hover:bg-gray-100"
                                                )}
                                                onClick={() => setShowNotes(!showNotes)}
                                            >
                                                <AlignLeft size={18} />
                                                <span className="text-xs md:text-sm font-medium">Add notes</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Date Picker - Adjust padding and text size for mobile */}
                                    <div className={cn(
                                        "mt-3 md:mt-4",
                                        isDark ? "bg-background" : "bg-white"
                                    )}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <MobileDateTimePicker
                                                label="Due Date & Time"
                                                value={selectedDate}
                                                onChange={(newValue) => setSelectedDate(newValue)}
                                                className={cn(
                                                    "w-full",
                                                    isDark && [
                                                        "[&_.MuiInputBase-root]:!bg-background",
                                                        "[&_.MuiInputBase-root]:!border-border",
                                                        "[&_.MuiInputBase-input]:!text-foreground",
                                                        "[&_.MuiInputBase-input]:!text-sm md:!text-base",
                                                        "[&_.MuiInputLabel-root]:!text-gray-400",
                                                        "[&_.MuiInputLabel-root]:!text-sm md:!text-base",
                                                        "[&_.MuiSvgIcon-root]:!text-gray-400",
                                                        "[&_.MuiOutlinedInput-notchedOutline]:!border-border"
                                                    ]
                                                )}
                                                format="DD/MM/YYYY hh:mm A"
                                                slotProps={{
                                                    textField: {
                                                        variant: "outlined",
                                                        fullWidth: true,
                                                        required: true,
                                                        size: isMobile ? "small" : "medium"
                                                    },
                                                    mobilePaper: {
                                                        sx: {
                                                            bgcolor: isDark ? 'rgb(45, 27, 54)' : 'white',
                                                            '& .MuiPickersToolbar-root': {
                                                                color: isDark ? 'rgb(229 231 235)' : 'inherit',
                                                                bgcolor: isDark ? 'rgb(45, 27, 54)' : 'white',
                                                            },
                                                            '& .MuiPickersToolbarText-root': {
                                                                color: isDark ? 'rgb(229 231 235)' : 'inherit',
                                                            },
                                                            '& .MuiTypography-root': {
                                                                color: isDark ? 'rgb(229 231 235)' : 'inherit',
                                                            },
                                                            '& .MuiPickersCalendarHeader-label': {
                                                                color: isDark ? 'rgb(229 231 235)' : 'inherit',
                                                            },
                                                            '& .MuiPickersDay-root': {
                                                                color: isDark ? 'rgb(229 231 235)' : 'inherit',
                                                                '&.Mui-selected': {
                                                                    backgroundColor: '#9F7AEA',
                                                                    color: 'white',
                                                                    '&:hover': {
                                                                        backgroundColor: '#9F7AEA',
                                                                    },
                                                                },
                                                                '&:hover': {
                                                                    backgroundColor: isDark ? 'rgba(159, 122, 234, 0.2)' : undefined,
                                                                },
                                                            },
                                                            '& .MuiDayCalendar-weekDayLabel': {
                                                                color: isDark ? 'rgb(156 163 175)' : 'inherit',
                                                            },
                                                            '& .MuiPickersDay-today': {
                                                                borderColor: '#9F7AEA',
                                                            },
                                                            '& .MuiClockNumber-root': {
                                                                color: isDark ? 'rgb(229 231 235)' : 'inherit',
                                                                '&.Mui-selected': {
                                                                    backgroundColor: '#9F7AEA',
                                                                    color: 'white',
                                                                },
                                                            },
                                                            '& .MuiClock-pin': {
                                                                backgroundColor: '#9F7AEA',
                                                            },
                                                            '& .MuiClockPointer-root': {
                                                                backgroundColor: '#9F7AEA',
                                                                '& .MuiClockPointer-thumb': {
                                                                    backgroundColor: '#9F7AEA',
                                                                    borderColor: '#9F7AEA',
                                                                },
                                                            },
                                                            '& .MuiIconButton-root': {
                                                                color: isDark ? 'rgb(229 231 235)' : 'inherit',
                                                            },
                                                            '& .MuiButton-root': {
                                                                color: '#9F7AEA',
                                                            },
                                                            '& .MuiPickersLayout-actionBar': {
                                                                bgcolor: isDark ? 'rgb(45, 27, 54)' : 'white',
                                                            },
                                                            '& .MuiPickersLayout-contentWrapper': {
                                                                bgcolor: isDark ? 'rgb(45, 27, 54)' : 'white',
                                                            },
                                                            '& .MuiSvgIcon-root': {
                                                                color: isDark ? 'rgb(229 231 235)' : 'inherit',
                                                            },
                                                            '& .MuiPickersCalendarHeader-switchViewButton': {
                                                                color: isDark ? 'rgb(229 231 235)' : 'inherit',
                                                            },
                                                            '& .MuiPickersArrowSwitcher-button': {
                                                                color: isDark ? 'rgb(229 231 235)' : 'inherit',
                                                            },
                                                            '& .MuiPickersToolbar-root .MuiSvgIcon-root': {
                                                                color: isDark ? 'rgb(229 231 235)' : 'inherit',
                                                            },
                                                            '& .MuiDialogActions-root .MuiButton-root': {
                                                                color: '#9F7AEA',
                                                                '&:hover': {
                                                                    backgroundColor: isDark ? 'rgba(159, 122, 234, 0.2)' : undefined,
                                                                },
                                                            },
                                                        }
                                                    }
                                                }}
                                                minDateTime={dayjs().startOf('day')}
                                                ampm={true}
                                            />
                                        </LocalizationProvider>
                                    </div>

                                    {/* Notes Section - Adjust for mobile */}
                                    <div className={`mt-3 md:mt-4 transition-all duration-300 ${showNotes ? 'opacity-100 max-h-[400px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                                        <div className={cn(
                                            "rounded-xl border shadow-sm overflow-hidden",
                                            isDark ? "bg-background border-border" : "bg-white border-gray-200"
                                        )}>
                                            <MDEditor
                                                value={newDesc}
                                                onChange={setNewDesc}
                                                preview="edit"
                                                height={isMobile ? 120 : 150}
                                                className={cn(
                                                    "border-none",
                                                    isDark && [
                                                        "!bg-background !border-border",
                                                        "[&_.w-md-editor-text-input]:!text-gray-200",
                                                        "[&_.w-md-editor-text-input]:!text-sm md:!text-base",
                                                        "[&_.w-md-editor-text-pre>code]:!text-gray-200",
                                                        "[&_.w-md-editor-toolbar]:!bg-background",
                                                        "[&_.w-md-editor-toolbar]:!border-border",
                                                        "[&_.w-md-editor-toolbar>ul>li>button]:!text-gray-300",
                                                        "[&_.w-md-editor-toolbar>ul>li>button:hover]:!bg-primary/20",
                                                        "[&_.w-md-editor-preview]:!bg-background",
                                                        "[&_.wmde-markdown-color]:!text-gray-200"
                                                    ]
                                                )}
                                                textareaProps={{
                                                    placeholder: "Add notes...",
                                                    className: isDark ? "!bg-background !text-gray-200" : ""
                                                }}
                                                commands={[
                                                    commands.bold,
                                                    commands.italic,
                                                    commands.title,
                                                    commands.divider,
                                                    commands.code,
                                                    commands.codeBlock,
                                                    commands.link,
                                                    commands.unorderedListCommand,
                                                    commands.orderedListCommand,
                                                    toggleCommand
                                                ]}
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Button - Adjust padding and text size for mobile */}
                                    <button
                                        type="submit"
                                        className={cn(
                                            "w-full py-2.5 md:py-3 mt-3 md:mt-4 rounded-lg transition-all transform hover:scale-[1.02] font-semibold shadow-md text-sm md:text-base",
                                            isDark
                                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                                : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
                                        )}
                                    >
                                        {isEditing ? 'Update Task' : 'Add Task'}
                                    </button>
                                </div>
                            </form>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    );
};

export default CreateTaskModal; 