import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { MapPin, Clock, Car, Star, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  accepted: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-orange-100 text-orange-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-slate-100 text-slate-500'
};

const statusLabels = {
  pending: 'Pending',
  accepted: 'Accepted',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

const serviceLabels = {
  towing: 'Towing',
  tire_change: 'Flat Tire',
  battery_jump: 'Battery Jump',
  fuel_delivery: 'Fuel Delivery',
  lockout: 'Lockout',
  general_repair: 'Repair'
};

export default function RequestCard({ request, index = 0 }) {
  const isActive = ['pending', 'accepted', 'in_progress'].includes(request.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link
        to={createPageUrl('Tracking') + `?id=${request.id}`}
        className={cn(
          "block bg-white rounded-2xl border overflow-hidden",
          "hover:shadow-lg transition-all duration-300",
          isActive ? "border-orange-200 shadow-md shadow-orange-100" : "border-slate-100"
        )}
      >
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-slate-900">
                {serviceLabels[request.service_type] || request.service_type}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {format(new Date(request.created_date), 'MMM d, yyyy • h:mm a')}
              </p>
            </div>
            <Badge className={cn("rounded-full", statusColors[request.status])}>
              {statusLabels[request.status]}
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="truncate">{request.location_address}</span>
            </div>
            
            {request.vehicle_make && (
              <div className="flex items-center gap-2 text-slate-600">
                <Car className="w-4 h-4 text-slate-400" />
                <span>
                  {request.vehicle_color} {request.vehicle_year} {request.vehicle_make} {request.vehicle_model}
                </span>
              </div>
            )}

            {request.provider_name && (
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{request.provider_name}</span>
              </div>
            )}
          </div>

          {request.status === 'completed' && request.rating && (
            <div className="mt-3 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={cn(
                    "w-4 h-4",
                    star <= request.rating
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-200"
                  )}
                />
              ))}
            </div>
          )}

          {request.final_cost && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm text-slate-500">Total Cost</span>
              <span className="font-semibold text-slate-900">${request.final_cost}</span>
            </div>
          )}
        </div>

        {isActive && (
          <div className="px-5 py-3 bg-orange-50 flex items-center justify-between">
            <span className="text-sm font-medium text-orange-700">View live tracking</span>
            <ChevronRight className="w-4 h-4 text-orange-500" />
          </div>
        )}
      </Link>
    </motion.div>
  );
}