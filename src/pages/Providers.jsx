import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Search,
  Filter,
  MapPin,
  Loader2,
  SlidersHorizontal
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import ProviderCard from '@/components/ProviderCard';

const serviceTypes = [
  { value: 'towing', label: 'Towing' },
  { value: 'tire_change', label: 'Flat Tire' },
  { value: 'battery_jump', label: 'Battery Jump' },
  { value: 'fuel_delivery', label: 'Fuel Delivery' },
  { value: 'lockout', label: 'Lockout' },
  { value: 'general_repair', label: 'Repair' }
];

export default function Providers() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: () => base44.entities.ServiceProvider.list()
  });

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = !search || 
      provider.name?.toLowerCase().includes(search.toLowerCase()) ||
      provider.location_address?.toLowerCase().includes(search.toLowerCase());
    
    const matchesServices = selectedServices.length === 0 ||
      selectedServices.some(s => provider.services?.includes(s));
    
    const matchesAvailability = !showAvailableOnly || provider.is_available;

    return matchesSearch && matchesServices && matchesAvailability;
  });

  const toggleService = (service) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const handleSelectProvider = (provider) => {
    navigate(createPageUrl('Home') + `?provider=${provider.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-slate-900">Service Providers</h1>
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6972a57489604bd98d3c2e02/763cdf91d_AutoLyftRecoverylogo.png"
              alt="AutoLyft Recovery"
              className="h-6 w-auto object-contain"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search providers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-11 rounded-xl border-slate-200"
              />
            </div>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl">
                  <SlidersHorizontal className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-slate-900 mb-3 block">
                      Services
                    </Label>
                    <div className="space-y-3">
                      {serviceTypes.map((service) => (
                        <div key={service.value} className="flex items-center">
                          <Checkbox
                            id={service.value}
                            checked={selectedServices.includes(service.value)}
                            onCheckedChange={() => toggleService(service.value)}
                          />
                          <label
                            htmlFor={service.value}
                            className="ml-3 text-sm text-slate-600 cursor-pointer"
                          >
                            {service.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Checkbox
                      id="available"
                      checked={showAvailableOnly}
                      onCheckedChange={setShowAvailableOnly}
                    />
                    <label
                      htmlFor="available"
                      className="ml-3 text-sm text-slate-600 cursor-pointer"
                    >
                      Available now only
                    </label>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Active Filters */}
          {selectedServices.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedServices.map(service => (
                <Badge
                  key={service}
                  variant="secondary"
                  className="bg-orange-100 text-orange-700 cursor-pointer"
                  onClick={() => toggleService(service)}
                >
                  {serviceTypes.find(s => s.value === service)?.label}
                  <span className="ml-1">×</span>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Provider List */}
      <div className="max-w-2xl mx-auto px-6 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">No providers found</h3>
            <p className="text-slate-500 text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProviders.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProviderCard
                  provider={provider}
                  onSelect={handleSelectProvider}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}