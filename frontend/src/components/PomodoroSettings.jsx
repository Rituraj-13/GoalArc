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
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { usePomodoro } from '../contexts/PomodoroContext';

const PomodoroSettings = ({ onClose }) => {
  const { settings, setSettings } = usePomodoro();
  const [tempSettings, setTempSettings] = React.useState(settings);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('todoToken');
      const response = await axios.put(
        'http://localhost:3000/pomodoro/settings',
        tempSettings,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      setSettings(response.data);
      toast.success('Settings saved');
      onClose();
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  return (
    <>
      <SheetDescription>
        Customize your Pomodoro timer settings
      </SheetDescription>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="workDuration" className="text-right">
            Work Duration (min)
          </Label>
          <Input
            id="workDuration"
            type="number"
            className="col-span-3"
            value={tempSettings.workDuration}
            onChange={(e) => setTempSettings({
              ...tempSettings,
              workDuration: parseInt(e.target.value)
            })}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="shortBreakDuration" className="text-right">
            Break Duration (min)
          </Label>
          <Input
            id="shortBreakDuration"
            type="number"
            className="col-span-3"
            value={tempSettings.shortBreakDuration}
            onChange={(e) => setTempSettings({
              ...tempSettings,
              shortBreakDuration: parseInt(e.target.value)
            })}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Auto-start breaks</Label>
          <Switch
            checked={tempSettings.autoStartBreaks}
            onCheckedChange={(checked) => setTempSettings({
              ...tempSettings,
              autoStartBreaks: checked
            })}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Auto-start pomodoros</Label>
          <Switch
            checked={tempSettings.autoStartPomodoros}
            onCheckedChange={(checked) => setTempSettings({
              ...tempSettings,
              autoStartPomodoros: checked
            })}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Notifications</Label>
          <Switch
            checked={tempSettings.notifications}
            onCheckedChange={(checked) => setTempSettings({
              ...tempSettings,
              notifications: checked
            })}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Sound</Label>
          <Switch
            checked={tempSettings.soundEnabled}
            onCheckedChange={(checked) => setTempSettings({
              ...tempSettings,
              soundEnabled: checked
            })}
          />
        </div>
      </div>
      <SheetFooter>
        <Button onClick={handleSave}>Save changes</Button>
      </SheetFooter>
    </>
  );
};

export default PomodoroSettings; 