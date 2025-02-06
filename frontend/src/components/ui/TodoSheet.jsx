import React, { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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

export function TodoSheet({ todo, onEdit, onDelete, onToggleComplete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDesc, setEditDesc] = useState(todo.description || '');
  const [editDate, setEditDate] = useState(dayjs(todo.dueDate));

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
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setEditDesc(todo.description || '');
    setEditDate(dayjs(todo.dueDate));
    setIsEditing(false);
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
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
        Completed
      </span>;
    }

    const now = dayjs();
    const dueDate = dayjs(todo.dueDate);

    if (now.isAfter(dueDate)) {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
        Overdue
      </span>;
    }

    return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
      Due
    </span>;
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="group w-full cursor-pointer bg-white hover:bg-gray-50/50 rounded-xl p-4 border border-gray-100 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComplete(todo._id);
                }}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => { }}
                  className="h-5 w-5 rounded-full border-2 border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>
              <span className={`text-base font-medium ${todo.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                {todo.title}
              </span>
            </div>
            <div className="flex items-center gap-4">
              {getStatusDisplay()}
              <span className="text-sm text-gray-500 whitespace-nowrap bg-gray-100 px-3 py-1 rounded-lg">
                ⏰ {formatDate(todo.dueDate)}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(todo._id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-red-50 rounded-full"
              >
                <Trash className="h-4 w-4 text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </SheetTrigger>

      <SheetContent className="w-[95vw] sm:w-[600px] md:w-[800px] lg:w-[1000px] overflow-y-auto bg-white">
        <div className="max-w-3xl mx-auto">
          {isEditing ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between mb-8">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2 text-3xl font-bold border-none focus:outline-none focus:ring-0 bg-transparent"
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
                <h1 className="text-3xl font-bold text-gray-900">
                  {todo.completed ? '✅' : '📝'} {todo.title}
                </h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                className="hover:bg-gray-100"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="space-y-8">
            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-700">Status:</span>
              {getStatusDisplay()}
            </div>

            {/* Due Date */}
            <div className="flex flex-col gap-2">
              <span className="text-lg font-semibold text-gray-700">
                {todo.completed ? '🎉 Completed on:' : '⏰ Due:'}
              </span>
              {isEditing ? (
                <div className="bg-white rounded-lg border border-gray-200">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <StaticDateTimePicker
                      value={editDate}
                      onChange={(newValue) => setEditDate(newValue)}
                      orientation="landscape"
                      ampm={true}
                      className="w-full"
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
                            },
                            '& .MuiClock-root': {
                              maxHeight: '220px',
                            }
                          }
                        }
                      }}
                      minDateTime={dayjs().startOf('day')}
                    />
                  </LocalizationProvider>
                </div>
              ) : (
                <p className="text-base">
                  {formatFullDate(todo.dueDate)}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="prose prose-slate max-w-none">
              <div className="mb-3">
                <span className="text-lg font-semibold text-gray-700">
                  📝 Description
                </span>
              </div>
              {isEditing ? (
                <MDEditor
                  value={editDesc}
                  onChange={setEditDesc}
                  preview="edit"
                  height={200}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                  textareaProps={{
                    placeholder: "Add a more detailed description..."
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
                    className="bg-white p-4 rounded-lg border border-gray-100"
                  />
                ) : (
                  <p className="text-gray-500 italic">✏️ No description provided</p>
                )
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 