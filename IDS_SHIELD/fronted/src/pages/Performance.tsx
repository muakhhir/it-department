import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  CartesianGrid,
} from "recharts";
import { Award, Brain, Clock, Database, FlaskConical, Target, Zap } from "lucide-react";

// --- Static offline training data ---
const models = [
  { name: "Random Forest", accuracy: 99.27, color: "hsl(168, 100%, 48%)", best: true, precision: 98.94, recall: 99.61, f1: 99.27, tp: 2233, fp: 17, fn: 9, tn: 2241 },
  { name: "Gradient Boost", accuracy: 96.90, color: "hsl(142, 71%, 45%)", best: false, precision: 96.52, recall: 97.30, f1: 96.91, tp: 2180, fp: 55, fn: 62, tn: 2203 },
  { name: "Decision Tree", accuracy: 94.20, color: "hsl(217, 91%, 60%)", best: false, precision: 93.88, recall: 94.55, f1: 94.21, tp: 2118, fp: 82, fn: 124, tn: 2176 },
  { name: "SVM", accuracy: 93.50, color: "hsl(270, 80%, 60%)", best: false, precision: 93.12, recall: 93.90, f1: 93.51, tp: 2103, fp: 95, fn: 139, tn: 2163 },
  { name: "KNN", accuracy: 91.80, color: "hsl(215, 20%, 50%)", best: false, precision: 91.40, recall: 92.20, f1: 91.80, tp: 2065, fp: 120, fn: 177, tn: 2138 },
  { name: "Naive Bayes", accuracy: 88.40, color: "hsl(30, 100%, 55%)", best: false, precision: 87.90, recall: 88.95, f1: 88.42, tp: 1992, fp: 160, fn: 250, tn: 2098 },
];

const shapFeatures = [
  { feature: "src_bytes", importance: 0.183, direction: "attack" as const },
  { feature: "dst_bytes", importance: 0.156, direction: "attack" as const },
  { feature: "count", importance: 0.132, direction: "attack" as const },
  { feature: "srv_count", importance: 0.118, direction: "attack" as const },
  { feature: "duration", importance: 0.094, direction: "attack" as const },
  { feature: "dst_host_count", importance: 0.076, direction: "normal" as const },
  { feature: "serror_rate", importance: 0.069, direction: "normal" as const },
  { feature: "logged_in", importance: 0.055, direction: "normal" as const },
  { feature: "flag", importance: 0.047, direction: "normal" as const },
  { feature: "dst_host_srv_count", importance: 0.040, direction: "normal" as const },
];

const shapColors = (d: "attack" | "normal", imp: number) => {
  if (d === "attack") {
    if (imp >= 0.13) return "hsl(0, 100%, 65%)";
    return "hsl(30, 100%, 55%)";
  }
  if (imp >= 0.055) return "hsl(50, 100%, 55%)";
  return "hsl(142, 71%, 45%)";
};

const ShapTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-card rounded-lg p-3 shadow-xl">
      <p className="font-mono text-xs text-foreground">
        {d.feature}: <strong>{d.importance.toFixed(3)}</strong>
      </p>
      <p className="text-[10px] text-muted-foreground mt-1">
        {d.direction === "attack" ? "↑ Pushes toward Attack" : "↓ Pushes toward Normal"}
      </p>
    </div>
  );
};

const CMCell = ({ value, label, type, delay }: { value: number; label: string; type: "correct" | "error"; delay: number }) => (
  <motion.div
    className="flex flex-col items-center justify-center rounded-lg p-2 sm:p-4 min-h-[70px] sm:min-h-[90px]"
    style={{
      backgroundColor: type === "correct" ? "hsla(168, 100%, 48%, 0.12)" : "hsla(0, 100%, 65%, 0.1)",
      border: `1px solid ${type === "correct" ? "hsla(168, 100%, 48%, 0.3)" : "hsla(0, 100%, 65%, 0.25)"}`,
    }}
    initial={{ opacity: 0, scale: 0.7 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ scale: 1.05 }}
  >
    <span className="font-mono text-lg sm:text-2xl font-bold" style={{ color: type === "correct" ? "hsl(168, 100%, 48%)" : "hsl(0, 100%, 65%)" }}>
      {value.toLocaleString()}
    </span>
    <span className="text-[8px] sm:text-[9px] mt-1 sm:mt-1.5 font-medium text-muted-foreground">{label}</span>
  </motion.div>
);

const Performance = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const model = models[selectedIdx];

  const statCards = [
    { label: "Accuracy", value: `${model.accuracy}%`, icon: Target, color: "text-primary" },
    { label: "Precision", value: `${model.precision}%`, icon: Zap, color: "text-success" },
    { label: "Recall", value: `${model.recall}%`, icon: Brain, color: "text-[hsl(217,91%,60%)]" },
    { label: "F1-Score", value: `${model.f1}%`, icon: FlaskConical, color: "text-[hsl(270,80%,60%)]" },
  ];

  return (
    <div className="space-y-6">
      {/* SECTION 1 — Model Comparison */}
      <motion.div className="glass-card rounded-xl p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="mb-1 text-sm font-semibold text-foreground flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" /> Model Performance (Offline Training Results)
        </h3>
        <p className="mb-4 text-[10px] text-muted-foreground">Static data from model training — click to select</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={models} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" horizontal={false} />
            <XAxis type="number" domain={[85, 100]} tick={{ fill: "hsl(215, 20%, 50%)", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="name" tick={{ fill: "hsl(215, 20%, 50%)", fontSize: 9 }} axisLine={false} tickLine={false} width={90} />
            <Tooltip
              content={({ active, payload }: any) =>
                active && payload?.[0] ? (
                  <div className="glass-card rounded-lg p-3 shadow-xl">
                    <p className="font-mono text-xs text-foreground">{payload[0].payload.name}: <strong>{payload[0].value}%</strong></p>
                  </div>
                ) : null
              }
            />
            <Bar dataKey="accuracy" radius={[0, 6, 6, 0]} barSize={28} cursor="pointer" isAnimationActive animationDuration={1200} animationEasing="ease-out" onClick={(_: any, idx: number) => setSelectedIdx(idx)}>
              {models.map((m, i) => (
                <Cell key={i} fill={m.color} opacity={i === selectedIdx ? 1 : 0.45} stroke={i === selectedIdx ? m.color : "transparent"} strokeWidth={i === selectedIdx ? 2 : 0} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-0.5 font-mono text-[10px] font-bold text-primary">
            🏆 BEST MODEL — Random Forest (99.27%)
          </span>
        </div>
      </motion.div>

      {/* SECTION 2 — Selected Model Stats */}
      <AnimatePresence mode="wait">
        <motion.div key={model.name} className="grid grid-cols-2 gap-4 lg:grid-cols-4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
          {statCards.map((s, i) => (
            <motion.div key={s.label} className="glass-card rounded-xl p-5 text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08, duration: 0.35 }}>
              <s.icon className={`h-5 w-5 mx-auto mb-2 ${s.color}`} />
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{s.label}</p>
              <p className={`font-mono text-2xl font-bold ${s.color}`}>{s.value}</p>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* SECTION 3 — Confusion Matrix */}
        <motion.div className="glass-card rounded-xl p-5" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="mb-1 text-sm font-semibold text-foreground">Confusion Matrix — {model.name}</h3>
          <p className="mb-4 text-[10px] text-muted-foreground">{(model.tp + model.fp + model.fn + model.tn).toLocaleString()} samples</p>
          <div className="grid grid-cols-[auto_1fr_1fr] gap-1.5 sm:gap-2">
            <div />
            <span className="text-center text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Pred: Normal</span>
            <span className="text-center text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Pred: Attack</span>
            <span className="flex items-center text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider text-muted-foreground pr-1 sm:pr-2">Actual Normal</span>
            <CMCell value={model.tn} label="True Negative" type="correct" delay={0.3} />
            <CMCell value={model.fp} label="False Positive" type="error" delay={0.4} />
            <span className="flex items-center text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider text-muted-foreground pr-1 sm:pr-2">Actual Attack</span>
            <CMCell value={model.fn} label="False Negative" type="error" delay={0.5} />
            <CMCell value={model.tp} label="True Positive" type="correct" delay={0.6} />
          </div>
          <div className="mt-3 flex items-center gap-4 text-[9px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: "hsl(168, 100%, 48%)" }} /> Correct</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: "hsl(0, 100%, 65%)" }} /> Error</span>
          </div>
        </motion.div>

        {/* SECTION 4 — SHAP Feature Importance */}
        <motion.div className="glass-card rounded-xl p-5" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <h3 className="mb-1 text-sm font-semibold text-foreground">Explainable AI — Why the Model Decided</h3>
          <p className="mb-3 text-[10px] text-muted-foreground">SHAP Feature Importance (Top 10) — Offline Training Results</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={shapFeatures} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" horizontal={false} />
              <XAxis type="number" domain={[0, 0.2]} tick={{ fill: "hsl(215, 20%, 50%)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="feature" tick={{ fill: "hsl(215, 20%, 50%)", fontSize: 8 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<ShapTooltip />} />
              <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={18} isAnimationActive animationDuration={1200} animationBegin={400}>
                {shapFeatures.map((f, i) => (
                  <Cell key={i} fill={shapColors(f.direction, f.importance)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center gap-4 text-[9px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: "hsl(0, 100%, 65%)" }} /> Pushes toward Attack</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: "hsl(142, 71%, 45%)" }} /> Pushes toward Normal</span>
          </div>
          <p className="mt-3 text-[9px] text-muted-foreground italic">Powered by SHAP Explainable AI (SHapley Additive Explanations)</p>
        </motion.div>
      </div>

      {/* SECTION 5 — Training Info */}
      <motion.div className="grid grid-cols-1 gap-4 sm:grid-cols-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        {[
          { label: "Training Samples", value: "1,200", icon: Database, color: "text-primary" },
          { label: "Test Samples", value: "300", icon: FlaskConical, color: "text-[hsl(217,91%,60%)]" },
          { label: "Training Time", value: "2.3s", icon: Clock, color: "text-success" },
        ].map((c, i) => (
          <motion.div key={c.label} className="glass-card rounded-xl p-5 flex items-center gap-4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.1 }}>
            <div className="rounded-lg bg-secondary/60 p-2.5">
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{c.label}</p>
              <p className={`font-mono text-xl font-bold ${c.color}`}>{c.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Performance;
