import { useState, useEffect } from "react";
import { AlertTriangle, Calendar, Clock, Save, Power, X } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Textarea } from "@/react-app/components/ui/textarea";
import { Label } from "@/react-app/components/ui/label";
import { getRoleDisplayLabel } from "@/shared/auth";

interface MaintenanceSettings {
  id: number;
  is_active: boolean;
  message: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
}

export default function MaintenanceSettings() {
  const [settings, setSettings] = useState<MaintenanceSettings>({
    id: 1,
    is_active: false,
    message: "",
    scheduled_date: null,
    scheduled_time: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/maintenance");
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error("Failed to load maintenance settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/maintenance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        alert("Maintenance settings saved successfully.");
      } else {
        alert("Failed to save maintenance settings");
      }
    } catch (err) {
      console.error("Failed to save:", err);
      alert("Failed to save maintenance settings");
    } finally {
      setSaving(false);
    }
  };

  const toggleMaintenance = async () => {
    const newStatus = !settings.is_active;
    setSettings({ ...settings, is_active: newStatus });

    try {
      const res = await fetch("/api/maintenance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, is_active: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        setTimeout(() => window.location.reload(), 500);
      } else {
        setSettings({ ...settings, is_active: !newStatus });
      }
    } catch (err) {
      console.error("Failed to toggle maintenance:", err);
      setSettings({ ...settings, is_active: !newStatus });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">Maintenance Mode</h1>
          <p className="text-sm text-muted-foreground mt-1">Control site maintenance status and schedule downtime</p>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => window.open("/maintenance-preview", "_blank")} variant="outline" size="lg" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Preview Page
          </Button>
          <Button onClick={toggleMaintenance} variant={settings.is_active ? "destructive" : "default"} size="lg" className="gap-2">
            <Power className="w-4 h-4" />
            {settings.is_active ? "Disable Maintenance" : "Enable Maintenance"}
          </Button>
        </div>
      </div>

      <div
        className={`p-4 rounded-xl border ${
          settings.is_active ? "bg-destructive/10 border-destructive/30 text-destructive" : "bg-accent/10 border-accent/30 text-accent"
        }`}
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <div>
            <p className="font-bold">{settings.is_active ? "Maintenance Mode Active" : "Site Is Online"}</p>
            <p className="text-sm opacity-80 mt-0.5">
              {settings.is_active
                ? `Users will see the maintenance page. Only the ${getRoleDisplayLabel("owner")} and admins can access the site.`
                : "All users can access the site normally."}
            </p>
          </div>
        </div>
      </div>

      <div className="card-dark-wise space-y-4">
        <div>
          <Label htmlFor="message" className="text-sm font-bold uppercase">
            Maintenance Message
          </Label>
          <p className="text-xs text-muted-foreground mt-1 mb-3">
            This message will be displayed to users when maintenance mode is active
          </p>
          <Textarea
            id="message"
            value={settings.message || ""}
            onChange={(e) => setSettings({ ...settings, message: e.target.value })}
            placeholder="We are currently performing scheduled maintenance..."
            className="min-h-[120px]"
          />
        </div>
      </div>

      <div className="card-dark-wise space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight text-foreground mb-1">Schedule Maintenance Announcement</h3>
            <p className="text-xs text-muted-foreground">Display an announcement banner for upcoming scheduled maintenance</p>
          </div>

          {settings.scheduled_date && (
            <Button
              onClick={() => setSettings({ ...settings, scheduled_date: null, scheduled_time: null })}
              variant="outline"
              size="sm"
              className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
            >
              <X className="w-3.5 h-3.5" />
              Clear Schedule
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="scheduled_date" className="text-sm font-bold uppercase flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Scheduled Date
            </Label>
            <Input
              id="scheduled_date"
              type="date"
              value={settings.scheduled_date || ""}
              onChange={(e) => setSettings({ ...settings, scheduled_date: e.target.value })}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="scheduled_time" className="text-sm font-bold uppercase flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              Scheduled Time
            </Label>
            <Input
              id="scheduled_time"
              type="time"
              value={settings.scheduled_time || ""}
              onChange={(e) => setSettings({ ...settings, scheduled_time: e.target.value })}
              className="mt-2"
            />
          </div>
        </div>

        {settings.scheduled_date && (
          <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
            <p className="text-xs text-muted-foreground">
              <strong className="text-accent">Preview:</strong> Scheduled maintenance on{" "}
              <span className="text-foreground font-bold">{settings.scheduled_date}</span>
              {settings.scheduled_time && (
                <>
                  {" "}at <span className="text-foreground font-bold">{settings.scheduled_time}</span>
                </>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
