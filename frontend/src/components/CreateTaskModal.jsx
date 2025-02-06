import React, { useState } from 'react';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { Calendar, AlignLeft } from 'lucide-react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileDateTimePicker } from '@mui/x-date-pickers';
import MDEditor from "@uiw/react-md-editor";
import dayjs from "dayjs";
import { toast } from 'react-hot-toast';

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
    commands
}) => {
    const [showNotes, setShowNotes] = useState(false);

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
                    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                </TransitionChild>


                <div className="fixed inset-0 flex items-center justify-center p-4">
                    {/* Modal panel */}
                    <TransitionChild
                        as={React.Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95 translate-y-4"
                        enterTo="opacity-100 scale-100 translate-y-0"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100 translate-y-0"
                        leaveTo="opacity-0 scale-95 translate-y-4"
                    >
                        <DialogPanel className="w-[400px] rounded-2xl bg-gray-50 shadow-xl">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="p-4">
                                    {/* Task Input */}
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                                        <input
                                            type="text"
                                            value={newTodo}
                                            onChange={(e) => setNewTodo(e.target.value)}
                                            className="w-full px-4 py-3 text-lg focus:outline-none rounded-t-xl"
                                            placeholder="Create new task"
                                            required
                                        />

                                        {/* Controls Row */}
                                        <div className="grid grid-cols-2 gap-2 p-4 border-t border-gray-100">
                                            <button
                                                type="button"
                                                className="flex items-center justify-center gap-2 p-2 bg-gray-100 text-indigo-500 rounded-lg cursor-default"
                                            >
                                                <Calendar size={20} />
                                                <span className="text-sm font-medium">Due date</span>
                                            </button>
                                            <button
                                                type="button"
                                                className={`flex items-center justify-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors ${showNotes ? 'bg-gray-100 text-indigo-500' : 'text-gray-600'
                                                    }`}
                                                onClick={() => setShowNotes(!showNotes)}
                                            >
                                                <AlignLeft size={20} />
                                                <span className="text-sm font-medium">Add notes</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Date Picker */}
                                    <div className="mt-4 bg-white">
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <MobileDateTimePicker
                                                label="Due Date & Time"
                                                value={selectedDate}
                                                onChange={(newValue) => setSelectedDate(newValue)}
                                                className="w-full"
                                                format="DD/MM/YYYY hh:mm A"
                                                slotProps={{
                                                    textField: {
                                                        variant: "outlined",
                                                        fullWidth: true,
                                                        className: "bg-white",
                                                        required: true
                                                    }
                                                }}
                                                minDateTime={dayjs().startOf('day')}
                                                ampm={true}
                                            />
                                        </LocalizationProvider>
                                    </div>

                                    {/* Notes Section */}
                                    <div className={`mt-4 transition-all duration-300 ${showNotes ? 'opacity-100 max-h-[400px]' : 'opacity-0 max-h-0 overflow-hidden'
                                        }`}>
                                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                            <MDEditor
                                                value={newDesc}
                                                onChange={setNewDesc}
                                                preview="edit"
                                                height={150}
                                                className="border-none"
                                                textareaProps={{
                                                    placeholder: "Add notes..."
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

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        className="w-full mt-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all transform hover:scale-[1.02] shadow-md font-semibold"
                                    >
                                        Create Task
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