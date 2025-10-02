"use client";

import { useLayoutEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Settings } from "lucide-react";

interface SettingsDialogProps {
  serverUrl: string;
  onServerUrlChange: (url: string) => void;
}

export function SettingsDialog({
  serverUrl,
  onServerUrlChange,
}: SettingsDialogProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempServerUrl, setTempServerUrl] = useState(serverUrl);

  useLayoutEffect(() => {
    setTempServerUrl(serverUrl);
  }, [serverUrl]);

  const handleSave = () => {
    onServerUrlChange(tempServerUrl);
    setSettingsOpen(false);
  };

  return (
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="z-[60] h-9 w-9 shadow-sm hover:bg-accent"
        >
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your server connection settings.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="server-url" className="text-sm font-medium">
              Server URL
            </label>
            <Input
              id="server-url"
              type="text"
              placeholder="https://your-ngrok-url.ngrok.io"
              value={tempServerUrl}
              onChange={(e) => setTempServerUrl(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              ⚠️ <span className="italic">Temporary:</span> This is a temporary
              solution to let me self-host with ngrok. Either clone the agent
              repo and run it locally, or ask me to spin up my version and send
              it to you.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setSettingsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
