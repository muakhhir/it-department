import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings2, Moon, Sun, Wifi, WifiOff, Server, Shield, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getBackendUrl, setBackendUrl as saveBackendUrl, testConnection } from "@/lib/api";

const Settings = () => {
  const [systemName, setSystemName] = useState("IDS Shield");
  const [timezone, setTimezone] = useState("ist");
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [backendUrl, setBackendUrl] = useState(getBackendUrl());
  const [testingConn, setTestingConn] = useState(false);
  const [connResult, setConnResult] = useState<string | null>(null);
  const [connError, setConnError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme");
    const currentTheme = savedTheme === "dark" ? "dark" : "light";
    setTheme(currentTheme);
  }, []);

  const isConnected = !!backendUrl.trim();

  const handleThemeChange = (nextTheme: "dark" | "light") => {
    setTheme(nextTheme);
    localStorage.setItem("app-theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.style.colorScheme = nextTheme;
  };

  const handleUrlChange = (value: string) => {
    setBackendUrl(value);
    saveBackendUrl(value);
    setConnResult(null);
    setConnError(false);
  };

  const handleTestConnection = async () => {
    setTestingConn(true);
    setConnResult(null);
    setConnError(false);
    try {
      const result = await testConnection();
      if (result.ok) {
        setConnResult(`✅ API responding — ${result.latency}ms latency`);
        toast({ title: "Connection successful", description: "Backend API is responding normally." });
      } else {
        setConnResult("❌ API returned an error");
        setConnError(true);
      }
    } catch (err: any) {
      setConnResult(`❌ ${err.message}`);
      setConnError(true);
      toast({ title: "Connection failed", description: err.message, variant: "destructive" });
    } finally {
      setTestingConn(false);
    }
  };

  const inputClass = "bg-secondary/50 border-border focus:border-primary focus:shadow-[0_0_12px_rgba(0,245,212,0.15)] text-foreground";

  const aboutLeft = [
    { label: "Version", value: "2.0.0" },
    { label: "Production Model", value: "Random Forest" },
    { label: "Models Compared", value: "6 (RF, GB, DT, SVM, KNN, NB)" },
    { label: "Best Model", value: "Random Forest — 99.27%" },
    { label: "Training Samples", value: "1,500" },
  ];

  const aboutRight = [
    { label: "Blockchain Blocks", value: "1,247" },
    { label: "Chain Status", value: "✅ Verified — Tamper-proof" },
    { label: "Last Model Train", value: "2025-06-01" },
    { label: "Detection Rules", value: "18 signature patterns" },
    { label: "SHAP Explainability", value: "✅ Enabled" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">System Settings</h2>
        <p className="text-xs text-muted-foreground">Configure your IDS Shield installation</p>
      </div>

      {/* General Settings */}
      <div className="glass-card rounded-xl p-6 space-y-5">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-primary" /> General Configuration
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">System Name</Label>
            <Input value={systemName} onChange={(e) => setSystemName(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ist">IST (UTC+5:30)</SelectItem>
                <SelectItem value="utc">UTC</SelectItem>
                <SelectItem value="est">EST</SelectItem>
                <SelectItem value="pst">PST</SelectItem>
                <SelectItem value="gmt">GMT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Theme</Label>
          <div className="flex gap-2">
            <button type="button" onClick={() => handleThemeChange("dark")} className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all ${theme === "dark" ? "bg-primary/20 text-primary border border-primary/40" : "border border-border text-muted-foreground hover:text-foreground"}`}>
              <Moon className="h-3.5 w-3.5" /> 🌙 Dark
            </button>
            <button type="button" onClick={() => handleThemeChange("light")} className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all ${theme === "light" ? "bg-warning/20 text-warning border border-warning/40" : "border border-border text-muted-foreground hover:text-foreground"}`}>
              <Sun className="h-3.5 w-3.5" /> ☀ Light
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground">Dark mode recommended for security operations</p>
        </div>
      </div>

      {/* API Configuration */}
      <div className="glass-card rounded-xl p-6 space-y-5">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Server className="h-4 w-4 text-primary" /> Backend API Connection
        </h3>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Backend URL</Label>
          <Input value={backendUrl} onChange={(e) => handleUrlChange(e.target.value)} placeholder="https://your-backend.railway.app" className={inputClass} />
          <p className="text-[9px] text-muted-foreground">This URL is used for real API calls to /predict endpoint</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <span className="h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-medium text-success">URL Configured</span>
              </>
            ) : (
              <>
                <span className="h-2.5 w-2.5 rounded-full bg-critical" />
                <span className="text-xs font-medium text-critical">No URL</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {connResult && (
              <motion.span className={`text-xs font-medium ${connError ? "text-critical" : "text-success"}`} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                {connResult}
              </motion.span>
            )}
            <Button variant="outline" size="sm" onClick={handleTestConnection} disabled={testingConn || !isConnected} className="border-primary/40 text-primary hover:bg-primary/10 text-xs relative overflow-hidden">
              {testingConn ? (
                <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Testing...</>
              ) : (
                <>{isConnected ? <Wifi className="mr-1.5 h-3.5 w-3.5" /> : <WifiOff className="mr-1.5 h-3.5 w-3.5" />} Test Connection</>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="glass-card rounded-xl p-6 space-y-5">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" /> About IDS Shield
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            {aboutLeft.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
                <span className="text-[10px] text-muted-foreground">{item.label}</span>
                <span className="font-mono text-xs font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {aboutRight.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
                <span className="text-[10px] text-muted-foreground">{item.label}</span>
                <span className="font-mono text-xs font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg bg-secondary/30 px-4 py-3 space-y-1 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Built by</span>
            <span className="text-xs font-semibold text-foreground">Muakhhir Hussain</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Academic Year</span>
            <span className="text-xs font-semibold text-foreground">2025-26</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Project</span>
            <span className="text-xs font-semibold text-primary">Adaptive Intrusion Detection System Using Explainable ML</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
