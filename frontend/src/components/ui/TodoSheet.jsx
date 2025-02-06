import React, { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Pencil, Trash, Check, X, WandSparkles } from 'lucide-react'
import MDEditor from "@uiw/react-md-editor"
import dayjs from 'dayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { MobileDateTimePicker } from '@mui/x-date-pickers'
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
    return todoDate.format('hh:mm A');
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
          toast.error('Title required', { duration: 2000 });
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

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="group w-full cursor-pointer bg-white hover:bg-gray-50/50 rounded-xl p-4 border border-gray-100 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggleComplete(todo._id)}
                className="h-5 w-5 rounded-full border-2 border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <div className="flex flex-col">
                <span className={`text-base font-medium ${todo.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                  {todo.title}
                </span>
                {/* Optional: Add project tag or other metadata */}
                {todo.project && (
                  <span className="text-xs text-blue-600 mt-0.5">
                    # {todo.project}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Show collaborators if any */}
              {todo.collaborators && (
                <div className="flex -space-x-2">
                  {todo.collaborators.map((collaborator, index) => (
                    <div
                      key={index}
                      className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white"
                      title={collaborator.name}
                    />
                  ))}
                </div>
              )}
              <span className="text-sm text-gray-500">
                {formatDate(todo.dueDate)}
              </span>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                ⋮
              </button>
            </div>
          </div>
        </div>
      </SheetTrigger>
      
      <SheetContent className="w-[95vw] sm:w-[600px] md:w-[800px] lg:w-[1000px]">
        <SheetHeader>
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-2 text-xl font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCancel}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" /> Cancel
                </Button>
                <Button 
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" /> Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <SheetTitle className="text-xl font-semibold">{todo.title}</SheetTitle>
              <div className="flex justify-end gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="hover:bg-gray-100"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="icon"
                  onClick={() => {
                    onDelete(todo._id);
                    document.querySelector('[role="dialog"]')?.close();
                  }}
                  className="hover:bg-red-600"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </SheetHeader>
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-2">Description</h4>
          {isEditing ? (
            <MDEditor
              value={editDesc}
              onChange={setEditDesc}
              preview="edit"
              height={200}
              className="mb-4"
              textareaProps={{
                placeholder: "Edit details..."
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
            <div className="prose prose-sm max-w-none">
              <MDEditor.Markdown source={todo.description} />
            </div>
          )}
        </div>
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-2">Due Date</h4>
          {isEditing ? (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <MobileDateTimePicker
                value={editDate}
                onChange={setEditDate}
                className="w-full"
                format="DD/MM/YYYY hh:mm A"
                slotProps={{
                  textField: {
                    variant: "outlined",
                    fullWidth: true,
                    className: "bg-white"
                  }
                }}
                minDateTime={dayjs().startOf('day')}
                ampm={true}
              />
            </LocalizationProvider>
          ) : (
            <p className="text-sm text-muted-foreground">
              {formatFullDate(todo.dueDate)}
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
} 