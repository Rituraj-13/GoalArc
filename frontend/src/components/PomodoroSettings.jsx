import React from 'react';
import { cn } from "@/lib/utils";
import {
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Timer, Coffee, Play, Bell, Volume2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { usePomodoro } from '../contexts/PomodoroContext';

const PomodoroSettings = ({ onClose }) => {
  const { settings, setSettings, setTimeLeft, currentSession } = usePomodoro();
  const [tempSettings, setTempSettings] = React.useState(settings);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('todoToken');
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/pomodoro/settings`,
        tempSettings,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      setSettings(response.data);

      const newTimeLeft = currentSession === 'work'
        ? response.data.workDuration * 60
        : response.data.shortBreakDuration * 60;
      setTimeLeft(newTimeLeft);

      toast.success('Settings saved successfully!');
      if (onClose) onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-1 md:px-4 scrollbar-thin scrollbar-thumb-gray-300/50 dark:scrollbar-thumb-gray-600/50 scrollbar-track-transparent hover:scrollbar-thumb-gray-400/50 dark:hover:scrollbar-thumb-gray-500/50">
        <SheetDescription className="text-center mb-6">
          Customize your Pomodoro timer settings to match your workflow
        </SheetDescription>

        <div className="space-y-6">
          {/* Time Settings */}
          <Card className="p-4 md:p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary" />
              Time Settings
            </h3>
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="workDuration" className="text-sm">
                  Work Duration (minutes)
                </Label>
                <Input
                  id="workDuration"
                  type="number"
                  min="5"
                  value={tempSettings.workDuration}
                  onChange={(e) => setTempSettings({
                    ...tempSettings,
                    workDuration: Math.max(5, parseInt(e.target.value) || 5)
                  })}
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="shortBreakDuration" className="text-sm">
                  Break Duration (minutes)
                </Label>
                <Input
                  id="shortBreakDuration"
                  type="number"
                  min="1"
                  value={tempSettings.shortBreakDuration}
                  onChange={(e) => setTempSettings({
                    ...tempSettings,
                    shortBreakDuration: Math.max(1, parseInt(e.target.value) || 1)
                  })}
                />
              </div>
            </div>
          </Card>

          {/* Auto-start Settings */}
          <Card className="p-4 md:p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Auto-start Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Auto-start breaks</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically start break timer when work session ends
                  </p>
                </div>
                <Switch
                  checked={tempSettings.autoStartBreaks}
                  onCheckedChange={(checked) => setTempSettings({
                    ...tempSettings,
                    autoStartBreaks: checked
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Auto-start pomodoros</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically start work timer when break ends
                  </p>
                </div>
                <Switch
                  checked={tempSettings.autoStartPomodoros}
                  onCheckedChange={(checked) => setTempSettings({
                    ...tempSettings,
                    autoStartPomodoros: checked
                  })}
                />
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-4 md:p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notification Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Desktop Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Show notifications when timer ends
                  </p>
                </div>
                <Switch
                  checked={tempSettings.notifications}
                  onCheckedChange={(checked) => setTempSettings({
                    ...tempSettings,
                    notifications: checked
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Sound Effects</Label>
                  <p className="text-xs text-muted-foreground">
                    Play sound when timer ends
                  </p>
                </div>
                <Switch
                  checked={tempSettings.soundEnabled}
                  onCheckedChange={(checked) => setTempSettings({
                    ...tempSettings,
                    soundEnabled: checked
                  })}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      <SheetFooter className="mt-6 flex-row gap-4 sm:justify-end px-1 md:px-4 py-4 border-t">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1 sm:flex-none"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="flex-1 sm:flex-none"
        >
          Save changes
        </Button>
      </SheetFooter>
    </div>
  );
};

export default PomodoroSettings;
