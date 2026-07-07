import { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  colorClass?: string;
  glowColor?: string;
}

export default function MetricCard({ label, value, icon, colorClass = "text-indigo-400 bg-indigo-500/10", glowColor = "rgba(123,108,250,0.15)" }: MetricCardProps) {
  return (
    <div 
      className="bg-[#131826] border border-white/10 rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:-translate-y-0.5 group"
    >
      {/* Subtle Glow inside */}
      <div 
        className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: glowColor }}
      />

      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
        {icon}
      </div>
      
      <div className="flex flex-col">
        <div className="text-[10.5px] text-gray-400 font-mono tracking-wider uppercase">{label}</div>
        <div className="text-xl font-bold font-display text-white mt-1">{value}</div>
      </div>
    </div>
  );
}
