import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  MapPin, 
  AlertTriangle, 
  ChevronRight,
  Loader2,
  Navigation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ServiceTypeCard from '@/components/ServiceTypeCard';

const serviceTypes = ['towing', 'tire_change', 'battery_jump', 'fuel_delivery', 'lockout', 'general_repair'];

export default function Home() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [location, setLocation] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState({
    make: '',
    model: '',
    year: '',
    color: ''
  });
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // In a real app, you'd reverse geocode this
          setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
          setIsLocating(false);
        },
        (error) => {
          console.error('Location error:', error);
          setIsLocating(false);
        }
      );
    }
  };

  const handleSubmit = async () => {
    if (!selectedService || !location) return;
    
    setIsSubmitting(true);
    try {
      const request = await base44.entities.ServiceRequest.create({
        service_type: selectedService,
        location_address: location,
        vehicle_make: vehicleInfo.make,
        vehicle_model: vehicleInfo.model,
        vehicle_year: vehicleInfo.year,
        vehicle_color: vehicleInfo.color,
        description: description,
        status: 'pending'
      });
      
      navigate(createPageUrl('Tracking') + `?id=${request.id}`);
    } catch (error) {
      console.error('Error creating request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-lg mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold">RoadRescue</h1>
            </div>
            <p className="text-slate-400">Get help fast when you need it most</p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-6 -mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden"
        >
          {/* Progress Indicator */}
          <div className="px-6 pt-6">
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full flex-1 transition-colors ${
                    s <= step ? 'bg-orange-500' : 'bg-slate-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="px-6 pb-6"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  What do you need?
                </h2>
                <p className="text-slate-500 text-sm mb-6">
                  Select the type of assistance you need
                </p>

                <div className="grid grid-cols-3 gap-3">
                  {serviceTypes.map((type) => (
                    <ServiceTypeCard
                      key={type}
                      type={type}
                      selected={selectedService === type}
                      onClick={setSelectedService}
                    />
                  ))}
                </div>

                <Button
                  onClick={() => setStep(2)}
                  disabled={!selectedService}
                  className="w-full mt-6 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="px-6 pb-6"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Where are you?
                </h2>
                <p className="text-slate-500 text-sm mb-6">
                  Share your location so we can find nearby help
                </p>

                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-700 mb-2 block">Your Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        placeholder="Enter address or use GPS"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="pl-11 h-12 rounded-xl border-slate-200"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={getCurrentLocation}
                        disabled={isLocating}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-600 hover:text-orange-700"
                      >
                        {isLocating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Navigation className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-700 mb-2 block">Issue Description (Optional)</Label>
                    <Textarea
                      placeholder="Describe your situation..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="rounded-xl border-slate-200 min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 h-12 rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!location}
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="px-6 pb-6"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Vehicle Details
                </h2>
                <p className="text-slate-500 text-sm mb-6">
                  Help providers identify your vehicle (optional)
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-700 mb-2 block">Make</Label>
                    <Input
                      placeholder="Toyota"
                      value={vehicleInfo.make}
                      onChange={(e) => setVehicleInfo({...vehicleInfo, make: e.target.value})}
                      className="h-12 rounded-xl border-slate-200"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 mb-2 block">Model</Label>
                    <Input
                      placeholder="Camry"
                      value={vehicleInfo.model}
                      onChange={(e) => setVehicleInfo({...vehicleInfo, model: e.target.value})}
                      className="h-12 rounded-xl border-slate-200"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 mb-2 block">Year</Label>
                    <Input
                      placeholder="2020"
                      value={vehicleInfo.year}
                      onChange={(e) => setVehicleInfo({...vehicleInfo, year: e.target.value})}
                      className="h-12 rounded-xl border-slate-200"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 mb-2 block">Color</Label>
                    <Input
                      placeholder="Silver"
                      value={vehicleInfo.color}
                      onChange={(e) => setVehicleInfo({...vehicleInfo, color: e.target.value})}
                      className="h-12 rounded-xl border-slate-200"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1 h-12 rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Requesting...
                      </>
                    ) : (
                      <>
                        Request Help
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Emergency Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-900">In case of emergency</p>
              <p className="text-sm text-red-700 mt-0.5">
                If you're in immediate danger, please call emergency services (911) first.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}