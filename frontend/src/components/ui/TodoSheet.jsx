import React, { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Pencil, Trash, Check, X, WandSparkles, Calendar, Clock, BarChart, CheckCircle2, Timer, CircleCheckBig, Hourglass, CalendarClock, BookOpenCheck } from 'lucide-react'
import MDEditor from "@uiw/react-md-editor"
import dayjs from 'dayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { StaticDateTimePicker, MobileDateTimePicker } from '@mui/x-date-pickers'
import AIResponse from '@/utils/AIResponse'
import { commands } from "@uiw/react-md-editor"
import { toast } from 'react-hot-toast'
import { useTheme } from "@/components/ThemeProvider"
import { cn } from "@/lib/utils"
import { useMediaQuery } from '@/hooks/useMediaQuery'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlignLeft } from 'lucide-react'
import axios from 'axios'
import { usePomodoro } from '@/contexts/PomodoroContext'

export function TodoSheet({ todo, onEdit, onDelete, onToggleComplete }) {
  const { isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDesc, setEditDesc] = useState(todo.description || '');
  const [editDate, setEditDate] = useState(dayjs(todo.dueDate));
  const [isLoading, setIsLoading] = useState(false);
  const closeRef = React.useRef(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { fetchTaskCompletedSessions } = usePomodoro();
  const [pomodoroStats, setPomodoroStats] = useState({
    completedSessions: 0,
    totalFocusTime: 0
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const formatDate = (date) => {
    if (!date) return '';
    const todoDate = dayjs(date);
    return todoDate.format('MMM DD - hh:mm A');
  };

  const formatFullDate = (date) => {
    if (!date) return '';
    const todoDate = dayjs(date);
    return todoDate.format('dddd, MMMM D, YYYY h:mm A');
  };

  const formatEditDate = (date) => {
    if (!date) return '';
    const todoDate = dayjs(date);
    return todoDate.format('MMM D, hh:mm A');
  };

  const handleSave = () => {
    onEdit({
      ...todo,
      title: editTitle,
      description: editDesc,
      dueDate: editDate.toISOString()
    });
    setIsEditing(false);
    closeRef.current?.click();
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setEditDesc(todo.description || '');
    setEditDate(dayjs(todo.dueDate));
    setIsEditing(false);
  };

  const handleToggleComplete = async (e) => {
    e.stopPropagation();
    // Prevent unchecking if already completed
    if (todo.completed) return;

    try {
      setIsLoading(true);
      await onToggleComplete(todo._id);
    } catch (error) {
      toast.error("Failed to update task status");
    } finally {
      setIsLoading(false);
    }
  };

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
        if (!editTitle) {
          return;
        }
        const loadingToastId = toast.loading('Generating...');

        // Get AI response
        const aiDesc = await AIResponse(editTitle);

        // Set the AI generated description
        setEditDesc(aiDesc);

        // Dismiss loading toast and show success
        toast.dismiss(loadingToastId);
        toast.success('Description ready', { duration: 2000 });
      } catch (error) {
        toast.dismiss();
        toast.error('Generation failed', { duration: 3000 });
      }
    },
  };

  const getStatusStyles = (todo) => {
    const baseStyles = "min-w-[100px] text-center";

    if (todo.completed) {
      return cn(
        baseStyles,
        "bg-emerald-500/20 text-emerald-500",
        isDark && "bg-emerald-500/10"
      );
    }

    const dueDate = dayjs(todo.dueDate);
    const now = dayjs();
    const isOverdue = dueDate.isBefore(now);

    if (isOverdue) {
      return cn(
        baseStyles,
        "bg-red-500/20 text-red-500",
        isDark && "bg-red-500/10"
      );
    }

    return cn(
      baseStyles,
      "bg-blue-500/20 text-blue-500",
      isDark && "bg-blue-500/10"
    );
  };

  const getStatusText = (todo) => {
    if (todo.completed) {
      return "Completed";
    }

    const dueDate = dayjs(todo.dueDate);
    const now = dayjs();
    const isOverdue = dueDate.isBefore(now);

    return isOverdue ? "Overdue" : "Pending";
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('todoToken');
        const sessions = await fetchTaskCompletedSessions(todo._id);

        // Fetch total focus time
        const response = await axios.get('http://localhost:3000/pomodoro/stats', {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { todoId: todo._id }
        });
        console.log("Response: ", response);
        console.log("sessions: ", sessions);

        setPomodoroStats({
          completedSessions: sessions,
          totalFocusTime: response.data.work.totalDuration || 0
        });
      } catch (error) {
        console.error('Failed to fetch pomodoro stats:', error);
      }
    };

    fetchStats();
  }, [todo._id]);

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Handle date picker dialog
  const handleDatePickerClose = (open) => {
    // Only allow closing through the dialog close button
    if (!open) {
      setIsDatePickerOpen(false);
    }
  };

  const handleDateChange = (newValue) => {
    setEditDate(newValue);
    // Don't close the picker on date/time selection
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className={cn(
          "group w-full cursor-pointer rounded-xl p-4 border",
          isDark
            ? "bg-card hover:bg-card/70 border-border"
            : "bg-white hover:bg-gray-50/50 border-gray-200 shadow-sm hover:shadow-md"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                onClick={handleToggleComplete}
                className="relative flex items-center justify-center"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => !todo.completed && onToggleComplete()}
                  disabled={isLoading || todo.completed}
                  className={cn(
                    "peer h-5 w-5 cursor-pointer appearance-none rounded-full border-2 transition-all",
                    isDark
                      ? "border-gray-600 hover:border-primary/50"
                      : "border-gray-400 hover:border-blue-500/50",
                    "checked:border-primary checked:hover:border-primary/90",
                    (isLoading || todo.completed) && "opacity-50 cursor-not-allowed",
                    todo.completed && "!border-primary"
                  )}
                />
                <Check
                  className={cn(
                    "absolute h-3 w-3 transition-all",
                    todo.completed ? "opacity-100 text-primary" : "opacity-0",
                    isLoading && "opacity-50"
                  )}
                />
              </div>
              <span className={cn(
                "text-base font-medium",
                todo.completed
                  ? isDark
                    ? "line-through text-gray-500"
                    : "line-through text-gray-400"
                  : isDark
                    ? "text-gray-100"
                    : "text-gray-700"
              )}>
                {todo.title}
              </span>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <span className={cn(
                "inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium ml-auto md:ml-0",
                getStatusStyles(todo)
              )}>
                {getStatusText(todo)}
              </span>
              {!isMobile && (
                <span className={cn(
                  "text-sm whitespace-nowrap px-3 py-1 rounded-lg",
                  isDark
                    ? "bg-secondary text-gray-300"
                    : "bg-gray-100 text-gray-500"
                )}>
                  ⏰ {formatDate(todo.dueDate)}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className={cn(
                  "p-1.5 rounded-full transition-all",
                  isMobile
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100",
                  isDark
                    ? "hover:bg-red-900/20"
                    : "hover:bg-red-50"
                )}
              >
                <Trash className={cn(
                  "h-4 w-4",
                  isDark
                    ? "text-red-400"
                    : "text-red-500"
                )} />
              </button>
            </div>
          </div>
        </div>
      </SheetTrigger>

      <SheetContent className={cn(
        "w-[95vw] sm:w-[600px] md:w-[800px] lg:w-[1000px] overflow-y-auto",
        isDark ? "bg-card border-border" : "bg-white"
      )}>
        <div className="h-full">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Title Section */}
            {isEditing ? (
              <div className="space-y-6">
                <div className="flex flex-col mb-8 mt-8 gap-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      className="flex items-center gap-1 w-[100px]"
                    >
                      <X className="h-4 w-4" /> Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSave}
                      className="flex items-center gap-1 w-[100px]"
                    >
                      <Check className="h-4 w-4" /> Save
                    </Button>
                  </div>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className={cn(
                      "w-full px-4 py-2 text-3xl font-bold border-none focus:outline-none focus:ring-0 bg-transparent",
                      isDark && "text-foreground placeholder:text-gray-500"
                    )}
                    placeholder="✍️ Task title..."
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between mb-8 mt-8">
                <div className="flex flex-col gap-4 mt-16">
                  <h1 className={cn(
                    "text-3xl font-bold mb-1 flex items-center gap-2",
                    isDark ? "text-foreground" : "text-gray-900"
                  )}>
                    {todo.completed ? <CircleCheckBig className="h-6 w-6 pt-0" /> : <BookOpenCheck className="h-8 w-8 pt-2" />}
                    <span>{todo.title}</span>
                  </h1>
                  <div className="flex items-center gap-2 pl-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span className={cn(
                      "inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs font-medium",
                      getStatusStyles(todo)
                    )}>
                      {getStatusText(todo)}
                    </span>
                  </div>
                </div>
                {
                  getStatusText(todo) !== "Completed" ?
                    (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsEditing(true)}
                        className={cn(
                          isDark ? "hover:bg-secondary" : "hover:bg-gray-100"
                        )}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )
                    : null
                }

              </div>
            )}

            {/* Stats Grid */}
            {!isEditing && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <Card className="shadow-sm bg-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-semibold">
                      Pomodoro Sessions
                    </CardTitle>
                    <Timer className="h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {pomodoroStats.completedSessions}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Completed focus sessions
                    </p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm bg-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-semibold">
                      Total Focus Time
                    </CardTitle>
                    <Clock className="h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {formatDuration(pomodoroStats.totalFocusTime)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Time spent on this task
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Due Date */}
            <Card className="shadow-sm bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">
                  {todo.completed ? '🎉 Completed on:' : '⏰ Due:'}
                </CardTitle>
                <Calendar className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className={cn(
                    "rounded-lg border",
                    isDark
                      ? "bg-card border-border [&_.MuiPaper-root]:!bg-card [&_.MuiPickersLayout-root]:!bg-card"
                      : "bg-white border-gray-200"
                  )}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      {isMobile ? (
                        <>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            onClick={() => setIsDatePickerOpen(true)}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {editDate ? formatEditDate(editDate) : "Pick a date and time"}
                          </Button>
                          <Dialog
                            open={isDatePickerOpen}
                            onOpenChange={handleDatePickerClose}
                          >
                            <DialogContent className={cn(
                              isMobile ? "w-screen h-[100dvh] max-w-none p-0 gap-0" : "sm:max-w-[425px]"
                            )}>
                              <DialogHeader className={cn(
                                isMobile && "px-4 py-3 border-b"
                              )}>
                                <DialogTitle>Select Date & Time</DialogTitle>
                              </DialogHeader>
                              <div className={cn(
                                "py-4",
                                isMobile && "px-4"
                              )}>
                                <StaticDateTimePicker
                                  value={editDate}
                                  onChange={handleDateChange}
                                  orientation="portrait"
                                  ampm={true}
                                  className={cn(
                                    "w-full",
                                    isDark ? "[&_.MuiPickersLayout-root]:!bg-background" : "[&_.MuiPickersLayout-root]:!bg-white",
                                    isDark && [
                                      // Calendar styles
                                      "[&_.MuiPickersCalendarHeader-root]:!text-gray-200",
                                      "[&_.MuiPickersCalendarHeader-label]:!text-gray-200",
                                      "[&_.MuiDayCalendar-header]:!text-gray-200",
                                      "[&_.MuiDayCalendar-weekDayLabel]:!text-gray-400",
                                      "[&_.MuiPickersDay-root]:!text-gray-200",
                                      "[&_.MuiPickersDay-root]:!bg-background",
                                      "[&_.MuiPickersDay-root:hover]:!bg-[#9F7AEA]/20",
                                      "[&_.MuiPickersDay-root.Mui-selected]:!bg-[#9F7AEA]",
                                      "[&_.MuiPickersDay-root.Mui-selected]:!text-white",
                                      "[&_.MuiPickersDay-today]:!border-[#9F7AEA]",
                                      "[&_.MuiPickersDay-today]:!border-2",
                                      // Clock styles
                                      "[&_.MuiClock-clock]:!bg-background",
                                      "[&_.MuiClock-clock]:!text-gray-200",
                                      "[&_.MuiClockNumber-root]:!text-gray-200",
                                      "[&_.MuiClockNumber-root.Mui-selected]:!bg-[#9F7AEA]",
                                      "[&_.MuiClockNumber-root.Mui-selected]:!text-white",
                                      "[&_.MuiClockNumber-root:hover]:!bg-[#9F7AEA]/20",
                                      "[&_.MuiClock-pin]:!bg-[#9F7AEA]",
                                      "[&_.MuiClockPointer-root]:!bg-[#9F7AEA]",
                                      "[&_.MuiClockPointer-thumb]:!bg-[#9F7AEA]",
                                      // Toolbar styles
                                      "[&_.MuiPickersToolbar-root]:!bg-background",
                                      "[&_.MuiPickersToolbar-root]:!text-gray-200",
                                      "[&_.MuiTypography-root]:!text-gray-200",
                                      "[&_.MuiPickersToolbarText-root]:!text-gray-200",
                                      "[&_.MuiPickersToolbarText-root.Mui-selected]:!text-[#9F7AEA]",
                                      // Button styles
                                      "[&_.MuiIconButton-root]:!text-gray-200",
                                      "[&_.MuiIconButton-root:hover]:!bg-[#9F7AEA]/20",
                                      "[&_.MuiIconButton-root.Mui-selected]:!text-[#9F7AEA]",
                                      // View switching buttons
                                      "[&_.MuiPickersArrowSwitcher-button]:!text-gray-200",
                                      "[&_.MuiPickersArrowSwitcher-button:hover]:!bg-[#9F7AEA]/20",
                                      "[&_.MuiPickersArrowSwitcher-button>.MuiSvgIcon-root]:!text-gray-200"
                                    ]
                                  )}
                                  slotProps={{
                                    actionBar: {
                                      actions: [],
                                    },
                                    toolbar: {
                                      hidden: false,
                                      className: isDark ? "bg-background" : "bg-white",
                                    },
                                    layout: {
                                      sx: {
                                        width: '100%',
                                        bgcolor: 'transparent',
                                        '& .MuiDateCalendar-root': {
                                          maxHeight: '300px',
                                          width: '100%',
                                          color: isDark ? 'rgb(229 231 235)' : 'inherit',
                                          bgcolor: 'transparent'
                                        },
                                        '& .MuiClock-root': {
                                          maxHeight: '250px',
                                          width: '100%',
                                          bgcolor: 'transparent',
                                          color: isDark ? 'rgb(229 231 235)' : 'inherit'
                                        },
                                        '& .MuiPickersLayout-contentWrapper': {
                                          bgcolor: 'transparent'
                                        },
                                        '& .MuiDialogActions-root': {
                                          display: 'none'
                                        }
                                      }
                                    },
                                    // Add specific props for day and time views
                                    day: {
                                      sx: {
                                        bgcolor: 'transparent',
                                        '&.Mui-selected': {
                                          bgcolor: '#9F7AEA !important',
                                          color: 'white !important'
                                        }
                                      }
                                    },
                                    minuteView: {
                                      sx: {
                                        bgcolor: 'transparent'
                                      }
                                    },
                                    hourView: {
                                      sx: {
                                        bgcolor: 'transparent'
                                      }
                                    }
                                  }}
                                  minDateTime={dayjs().startOf('day')}
                                />
                              </div>
                              <div className={cn(
                                "flex justify-end mt-4",
                                isMobile && "px-4 py-4 border-t"
                              )}>
                                <Button
                                  className="bg-primary hover:bg-primary/90 text-white"
                                  onClick={() => setIsDatePickerOpen(false)}
                                >
                                  Done
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      ) : (
                        <StaticDateTimePicker
                          value={editDate}
                          onChange={handleDateChange}
                          orientation="landscape"
                          ampm={true}
                          className={cn(
                            "w-full",
                            isDark && [
                              "[&_.MuiTypography-root]:!text-gray-200",
                              "[&_.MuiPickersCalendarHeader-root]:!text-gray-200",
                              "[&_.MuiDayCalendar-weekDayLabel]:!text-gray-400",
                              "[&_.MuiPickersDay-root]:!text-gray-200",
                              "[&_.MuiClock-pin]:!bg-primary",
                              "[&_.MuiClockPointer-root]:!bg-primary",
                              "[&_.MuiClockPointer-thumb]:!bg-primary",
                              "[&_.MuiClock-clock]:!text-gray-200",
                              "[&_.MuiTimePickerToolbar-hourMinuteLabel]:!text-gray-200",
                              "[&_.MuiIconButton-root]:!text-gray-200",
                              "[&_.MuiSvgIcon-root]:!text-gray-200",
                              "[&_.MuiPickersYear-yearButton]:!text-gray-200",
                              "[&_.MuiPickersMonth-monthButton]:!text-gray-200",
                              "[&_.MuiPickersArrowSwitcher-button]:!text-gray-200",
                              "[&_.MuiPickersArrowSwitcher-button>.MuiSvgIcon-root]:!text-gray-200",
                              "[&_.MuiClockNumber-root]:!text-gray-200",
                              "[&_.Mui-selected]:!text-white",
                              "[&_.Mui-selected]:!font-bold",
                              "[&_.Mui-selected]:!shadow-md",
                              "[&_.MuiPickersDay-today]:!border-[#9F7AEA]",
                              "[&_.MuiPickersDay-today]:!border-2",
                              "[&_.MuiPickersDay-root:hover]:!bg-[#9F7AEA]/20",
                              "[&_.MuiClockNumber-root]:hover:!bg-[#9F7AEA]/20",
                              "[&_.MuiClockPointer-root>div]:!bg-[#9F7AEA]",
                              "[&_.MuiClockPointer-root]:after:!bg-[#9F7AEA]",
                              "[&_.MuiClockPointer-root]:!bg-[#9F7AEA]"
                            ]
                          )}
                          slotProps={{
                            actionBar: {
                              actions: [],
                            },
                            toolbar: {
                              hidden: false,
                            },
                            layout: {
                              sx: {
                                width: '100%',
                                '& .MuiDateCalendar-root': {
                                  maxHeight: '280px',
                                  width: '100%',
                                  color: isDark ? 'rgb(229 231 235)' : 'inherit'
                                },
                                '& .MuiClock-root': {
                                  maxHeight: '220px',
                                  width: '100%',
                                  backgroundColor: 'transparent',
                                  color: isDark ? 'rgb(229 231 235)' : 'inherit'
                                }
                              }
                            }
                          }}
                          minDateTime={dayjs().startOf('day')}
                        />
                      )}
                    </LocalizationProvider>
                  </div>
                ) : (
                  <p className={cn(
                    "text-base",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}>
                    {formatFullDate(todo.dueDate)}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="shadow-sm bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">
                  📝 Description
                </CardTitle>
                <AlignLeft className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <MDEditor
                    value={editDesc}
                    onChange={setEditDesc}
                    preview="edit"
                    height={150}
                    className={cn(
                      "overflow-hidden rounded-lg",
                      isDark && [
                        "!bg-card !border-border",
                        "[&_.w-md-editor-text-input]:!text-gray-200",
                        "[&_.w-md-editor-text-pre>code]:!text-gray-200",
                        "[&_.w-md-editor-toolbar]:!bg-card",
                        "[&_.w-md-editor-toolbar]:!border-border",
                        "[&_.w-md-editor-toolbar>ul>li>button]:!text-gray-300",
                        "[&_.w-md-editor-toolbar>ul>li>button:hover]:!bg-primary/20",
                        "[&_.w-md-editor-preview]:!bg-card",
                        "[&_.wmde-markdown-color]:!text-gray-200"
                      ]
                    )}
                    textareaProps={{
                      placeholder: "Add a more detailed description...",
                      className: isDark ? "!bg-card !text-gray-200" : ""
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
                ) : (
                  todo.description ? (
                    <MDEditor.Markdown
                      source={todo.description}
                      className={cn(
                        "p-4 rounded-lg border",
                        isDark
                          ? "[&.wmde-markdown]:!bg-card [&.wmde-markdown-color]:!text-gray-200 border-border [&_.wmde-markdown]:!bg-card [&]:!bg-card [&_*]:!bg-card [&_ol]:!list-decimal [&_ul]:!list-disc [&_li]:ml-4"
                          : "[&.wmde-markdown]:!bg-white [&.wmde-markdown-color]:!text-gray-700 border-gray-100 [&_ol]:!list-decimal [&_ul]:!list-disc [&_li]:ml-4"
                      )}
                    />
                  ) : (
                    <p className={cn(
                      "italic",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>
                      No description provided
                    </p>
                  )
                )}
              </CardContent>
            </Card>
          </div>
          <SheetClose ref={closeRef} className="hidden" />
        </div>
      </SheetContent>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className={cn(
          "w-[90%] md:w-full sm:max-w-[425px] rounded-xl",
          isDark ? "bg-card border-border" : "bg-white"
        )}>
          <AlertDialogHeader>
            <AlertDialogTitle className={cn(
              "text-lg font-semibold",
              isDark ? "text-gray-100" : "text-gray-900"
            )}>
              Delete Task
            </AlertDialogTitle>
            <AlertDialogDescription className={cn(
              "text-sm",
              isDark ? "text-gray-400" : "text-gray-500"
            )}>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={cn(
              "border",
              isDark
                ? "bg-card hover:bg-card/70 border-border text-gray-300"
                : "bg-gray-100 hover:bg-gray-200 text-gray-900"
            )}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(todo._id);
                setShowDeleteConfirm(false);
              }}
              className={cn(
                "bg-red-500 hover:bg-red-600 text-white",
                isDark && "bg-red-600 hover:bg-red-700"
              )}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
} 