import React from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, MapPin, Phone, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const serviceLabels = {
  towing: 'Towing',
  tire_change: 'Flat Tire',
  battery_jump: 'Battery',
  fuel_delivery: 'Fuel',
  lockout: 'Lockout',
  general_repair: 'Repair'
};

export default function ProviderCard({ provider, onSelect, compact = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={cn(
        "bg-white rounded-2xl border border-slate-100 overflow-hidden",
        "hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
      )}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-white">
              {provider.name?.charAt(0) || 'P'}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-900 truncate">{provider.name}</h3>
              {provider.is_available && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              )}
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-medium text-slate-900">{provider.rating?.toFixed(1) || '4.5'}</span>
                <span className="text-slate-400">({provider.total_reviews || 0})</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">{provider.price_range || '$$'}</span>
            </div>
          </div>
        </div>

        {!compact && (
          <>
            <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{provider.response_time || 15} min avg</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{provider.location_address || 'Nearby'}</span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {provider.services?.slice(0, 4).map(service => (
                <Badge 
                  key={service} 
                  variant="secondary"
                  className="bg-slate-50 text-slate-600 text-xs font-normal"
                >
                  {serviceLabels[service] || service}
                </Badge>
              ))}
              {provider.services?.length > 4 && (
                <Badge variant="secondary" className="bg-slate-50 text-slate-600 text-xs font-normal">
                  +{provider.services.length - 4}
                </Badge>
              )}
            </div>
          </>
        )}

        <div className="mt-4 flex gap-2">
          <Button
            onClick={() => onSelect(provider)}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl h-11"
          >
            Request Service
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-xl border-slate-200"
            onClick={() => window.open(`tel:${provider.phone}`)}
          >
            <Phone className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}