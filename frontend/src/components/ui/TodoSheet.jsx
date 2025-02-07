import React, { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Pencil, Trash, Check, X, WandSparkles, Calendar } from 'lucide-react'
import MDEditor from "@uiw/react-md-editor"
import dayjs from 'dayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { StaticDateTimePicker } from '@mui/x-date-pickers'
import AIResponse from '@/utils/AIResponse'
import { commands } from "@uiw/react-md-editor"
import { toast } from 'react-hot-toast'
import { useTheme } from "@/components/ThemeProvider"
import { cn } from "@/lib/utils"

export function TodoSheet({ todo, onEdit, onDelete, onToggleComplete }) {
  const { isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDesc, setEditDesc] = useState(todo.description || '');
  const [editDate, setEditDate] = useState(dayjs(todo.dueDate));
  const [isLoading, setIsLoading] = useState(false);
  const closeRef = React.useRef(null);

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

  const getStatusDisplay = () => {
    if (todo.completed) {
      return (
        <span className={cn(
          "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
          isDark
            ? "bg-green-900/30 text-green-300"
            : "bg-green-100 text-green-800"
        )}>
          Completed
        </span>
      );
    }

    const now = dayjs();
    const dueDate = dayjs(todo.dueDate);

    if (now.isAfter(dueDate)) {
      return (
        <span className={cn(
          "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
          isDark
            ? "bg-red-900/30 text-red-300"
            : "bg-red-100 text-red-800"
        )}>
          Overdue
        </span>
      );
    }

    return (
      <span className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
        isDark
          ? "bg-blue-900/30 text-blue-300"
          : "bg-blue-100 text-blue-800"
      )}>
        Due
      </span>
    );
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className={cn(
          "group w-full cursor-pointer rounded-xl p-4 border transition-all duration-200",
          isDark
            ? "bg-card hover:bg-card/70 border-border"
            : "bg-white hover:bg-gray-50/50 border-gray-100"
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
                  onChange={() => { }}
                  disabled={isLoading}
                  className={cn(
                    "peer h-5 w-5 cursor-pointer appearance-none rounded-full border-2 transition-all",
                    isDark
                      ? "border-gray-600 hover:border-primary/50"
                      : "border-gray-300 hover:border-blue-500/50",
                    "checked:border-primary checked:hover:border-primary/90",
                    isLoading && "opacity-50 cursor-wait"
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
                    : "text-gray-900"
              )}>
                {todo.title}
              </span>
            </div>
            <div className="flex items-center gap-4">
              {getStatusDisplay()}
              <span className={cn(
                "text-sm whitespace-nowrap px-3 py-1 rounded-lg",
                isDark
                  ? "bg-secondary text-gray-300"
                  : "bg-gray-100 text-gray-500"
              )}>
                ⏰ {formatDate(todo.dueDate)}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(todo._id);
                }}
                className={cn(
                  "opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-full",
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
        isDark
          ? "bg-card border-border"
          : "bg-white"
      )}>
        <div className="max-w-3xl mx-auto">
          {isEditing ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between mb-8">
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    className="flex items-center gap-1"
                  >
                    <X className="h-4 w-4" /> Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSave}
                    className="flex items-center gap-1"
                  >
                    <Check className="h-4 w-4" /> Save
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-3">
                <h1 className={cn(
                  "text-3xl font-bold",
                  isDark ? "text-foreground" : "text-gray-900"
                )}>
                  {todo.completed ? '✅' : '📝'} {todo.title}
                </h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                className={cn(
                  isDark
                    ? "hover:bg-secondary"
                    : "hover:bg-gray-100"
                )}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="space-y-8">
            {/* Status */}
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-lg font-semibold",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                Status:
              </span>
              {getStatusDisplay()}
            </div>

            {/* Due Date */}
            <div className="flex flex-col gap-2">
              <span className={cn(
                "text-lg font-semibold",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                {todo.completed ? '🎉 Completed on:' : '⏰ Due:'}
              </span>
              {isEditing ? (
                <div className={cn(
                  "rounded-lg border",
                  isDark
                    ? "bg-card border-border [&_.MuiPaper-root]:!bg-card [&_.MuiPickersLayout-root]:!bg-card"
                    : "bg-white border-gray-200"
                )}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <StaticDateTimePicker
                      value={editDate}
                      onChange={(newValue) => setEditDate(newValue)}
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
                          // "[&_.Mui-selected]:!bg-[#9F7AEA]",
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
                              color: isDark ? 'rgb(229 231 235)' : 'inherit'
                            },
                            '& .MuiClock-root': {
                              maxHeight: '220px',
                              backgroundColor: 'transparent',
                              color: isDark ? 'rgb(229 231 235)' : 'inherit'
                            }
                          }
                        }
                      }}
                      minDateTime={dayjs().startOf('day')}
                    />
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
            </div>

            {/* Description */}
            <div className={cn(
              "prose prose-slate max-w-none",
              isDark && "prose-invert"
            )}>
              <div className="mb-3">
                <span className={cn(
                  "text-lg font-semibold",
                  isDark ? "text-gray-300" : "text-gray-700"
                )}>
                  📝 Description
                </span>
              </div>
              {isEditing ? (
                <MDEditor
                  value={editDesc}
                  onChange={setEditDesc}
                  preview="edit"
                  height={200}
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
                        ? "[&.wmde-markdown]:!bg-card [&.wmde-markdown-color]:!text-gray-200 border-border [&_.wmde-markdown]:!bg-card [&]:!bg-card [&_*]:!bg-card"
                        : "[&.wmde-markdown]:!bg-white [&.wmde-markdown-color]:!text-gray-700 border-gray-100"
                    )}
                  />
                ) : (
                  <p className={cn(
                    "italic",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    ✏️ No description provided
                  </p>
                )
              )}
            </div>
          </div>
        </div>
        <SheetClose ref={closeRef} className="hidden" />
      </SheetContent>
    </Sheet>
  );
} 