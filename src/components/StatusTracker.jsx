import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Truck, Wrench, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { key: 'pending', label: 'Request Sent', icon: Clock },
  { key: 'accepted', label: 'Accepted', icon: Check },
  { key: 'in_progress', label: 'On The Way', icon: Truck },
  { key: 'completed', label: 'Completed', icon: Star }
];

const statusIndex = {
  pending: 0,
  accepted: 1,
  in_progress: 2,
  completed: 3,
  cancelled: -1
};

export default function StatusTracker({ status, estimatedArrival }) {
  const currentIndex = statusIndex[status] ?? 0;

  if (status === 'cancelled') {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">✕</span>
        </div>
        <h3 className="font-semibold text-red-900">Request Cancelled</h3>
        <p className="text-sm text-red-600 mt-1">This request has been cancelled</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          
          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    backgroundColor: isCompleted || isActive ? '#f97316' : '#f1f5f9'
                  }}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    "transition-colors duration-300"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5",
                    isCompleted || isActive ? "text-white" : "text-slate-400"
                  )} />
                </motion.div>
                <span className={cn(
                  "text-xs mt-2 font-medium text-center",
                  isActive ? "text-orange-600" : isCompleted ? "text-slate-900" : "text-slate-400"
                )}>
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-2 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ width: index < currentIndex ? '100%' : '0%' }}
                    className="h-full bg-orange-500"
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {status === 'in_progress' && estimatedArrival && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 text-center"
        >
          <p className="text-sm text-slate-600">Estimated arrival in</p>
          <p className="text-3xl font-bold text-orange-600 mt-1">
            {estimatedArrival} <span className="text-lg font-normal">minutes</span>
          </p>
        </motion.div>
      )}

      {status === 'pending' && (
        <div className="bg-slate-50 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <p className="text-sm text-slate-600">Looking for nearby providers...</p>
          </div>
        </div>
      )}

      {status === 'accepted' && (
        <div className="bg-emerald-50 rounded-xl p-4 text-center">
          <p className="text-sm text-emerald-700">A provider has accepted your request!</p>
        </div>
      )}
    </div>
  );
}