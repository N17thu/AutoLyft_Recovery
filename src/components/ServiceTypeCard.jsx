import React from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  CircleDot, 
  Battery, 
  Fuel, 
  KeyRound, 
  Wrench 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const serviceIcons = {
  towing: Truck,
  tire_change: CircleDot,
  battery_jump: Battery,
  fuel_delivery: Fuel,
  lockout: KeyRound,
  general_repair: Wrench
};

const serviceLabels = {
  towing: 'Towing',
  tire_change: 'Flat Tire',
  battery_jump: 'Battery Jump',
  fuel_delivery: 'Fuel Delivery',
  lockout: 'Lockout',
  general_repair: 'Repair'
};

const serviceColors = {
  towing: 'from-blue-500 to-blue-600',
  tire_change: 'from-slate-600 to-slate-700',
  battery_jump: 'from-amber-500 to-amber-600',
  fuel_delivery: 'from-emerald-500 to-emerald-600',
  lockout: 'from-violet-500 to-violet-600',
  general_repair: 'from-orange-500 to-orange-600'
};

export default function ServiceTypeCard({ type, selected, onClick }) {
  const Icon = serviceIcons[type];
  const label = serviceLabels[type];
  const colorClass = serviceColors[type];

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(type)}
      className={cn(
        "relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300",
        "border-2 bg-white",
        selected 
          ? "border-orange-500 shadow-lg shadow-orange-500/20" 
          : "border-slate-100 hover:border-slate-200 hover:shadow-md"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
        "bg-gradient-to-br",
        colorClass
      )}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className={cn(
        "text-sm font-medium",
        selected ? "text-slate-900" : "text-slate-600"
      )}>
        {label}
      </span>
      {selected && (
        <motion.div
          layoutId="selected-indicator"
          className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center"
        >
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}