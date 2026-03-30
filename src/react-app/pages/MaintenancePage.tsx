import { useState, useEffect } from "react";
import { Wrench, Calendar, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import NStepBrand from "@/react-app/components/NStepBrand";

interface MaintenanceSettings {
  is_active: boolean;
  message: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
}

export default function MaintenancePage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<MaintenanceSettings>({
    is_active: true,
    message: t("maintenance.default_message", "We are currently performing scheduled maintenance. We will be back shortly!"),
    scheduled_date: null,
    scheduled_time: null,
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/maintenance");
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error("Failed to load maintenance settings:", err);
      }
    };
    loadSettings();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="flex justify-center mb-8">
          <NStepBrand markClassName="h-20 w-20" wordmarkClassName="text-xl" />
        </div>

        <div className="relative inline-block">
          <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full animate-pulse"></div>
          <div className="relative bg-accent/10 border border-accent/30 rounded-full p-8 inline-block">
            <Wrench className="w-16 h-16 text-accent animate-spin-slow" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground">
            {t("maintenance.title", "Under Maintenance")}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto font-normal">
            {settings.message}
          </p>
        </div>

        {settings.scheduled_date && (
          <div className="card-dark-wise max-w-md mx-auto p-6 space-y-3">
            <p className="text-sm font-bold uppercase text-accent">{t("maintenance.scheduled", "Scheduled Maintenance")}</p>
            <div className="flex items-center justify-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{settings.scheduled_date}</span>
              </div>
              {settings.scheduled_time && (
                <>
                  <span>|</span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{settings.scheduled_time}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="pt-8 space-y-2">
          <p className="text-sm text-muted-foreground">
            {t("maintenance.thank_you", "Thank you for your patience")}
          </p>
          <p className="text-xs text-muted-foreground/60">
            {t("maintenance.contact_label", "For urgent inquiries, contact")}{" "}
            <a href="mailto:support@northernstepstudio.com" className="text-accent hover:underline">
              support@northernstepstudio.com
            </a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
