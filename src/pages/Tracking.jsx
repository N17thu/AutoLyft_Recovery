import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  MapPin,
  Phone,
  MessageSquare,
  Star,
  X,
  Car,
  Clock,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import StatusTracker from '@/components/StatusTracker';
import Map from '@/components/Map';
import { cn } from '@/lib/utils';

const serviceLabels = {
  towing: 'Towing',
  tire_change: 'Flat Tire',
  battery_jump: 'Battery Jump',
  fuel_delivery: 'Fuel Delivery',
  lockout: 'Lockout',
  general_repair: 'Repair'
};

export default function Tracking() {
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const requestId = urlParams.get('id');

  useEffect(() => {
    if (requestId) {
      loadRequest();
    }
  }, [requestId]);

  const loadRequest = async () => {
    try {
      const requests = await base44.entities.ServiceRequest.filter({ id: requestId });
      if (requests.length > 0) {
        setRequest(requests[0]);
        if (requests[0].status === 'completed' && !requests[0].rating) {
          setShowRating(true);
        }
      }
    } catch (error) {
      console.error('Error loading request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      await base44.entities.ServiceRequest.update(requestId, { status: 'cancelled' });
      loadRequest();
    } catch (error) {
      console.error('Error cancelling request:', error);
    }
  };

  const submitRating = async () => {
    setIsSubmittingRating(true);
    try {
      await base44.entities.ServiceRequest.update(requestId, {
        rating,
        review
      });
      setShowRating(false);
      loadRequest();
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Request not found</h2>
        <p className="text-slate-500 mb-6">This request may have been deleted</p>
        <Button onClick={() => navigate(createPageUrl('Home'))}>
          Go Home
        </Button>
      </div>
    );
  }

  const isActive = ['pending', 'accepted', 'in_progress'].includes(request.status);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-lg mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6972a57489604bd98d3c2e02/763cdf91d_AutoLyftRecoverylogo.png"
              alt="AutoLyft Recovery"
              className="h-8 w-auto object-contain"
            />
            {isActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            )}
          </div>
          <div>
            <p className="text-slate-400 text-sm">Request #{request.id?.slice(0, 8)}</p>
            <h1 className="text-xl font-bold">
              {serviceLabels[request.service_type]}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 -mt-4 pb-24">
        {/* Status Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <StatusTracker
            status={request.status}
            estimatedArrival={request.estimated_arrival}
          />
        </motion.div>

        {/* Live Map */}
        {isActive && (request.location_lat && request.location_lng) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-4 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-md"
          >
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Live Tracking</h3>
              <p className="text-sm text-slate-500 mt-0.5">Real-time location updates</p>
            </div>
            <Map
              userLocation={[request.location_lat, request.location_lng]}
              providerLocation={request.provider_location_lat && request.provider_location_lng 
                ? [request.provider_location_lat, request.provider_location_lng]
                : null}
              userLabel="Your Location"
              providerLabel={request.provider_name || "Provider"}
              height="300px"
            />
          </motion.div>
        )}

        {/* Request Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 bg-white rounded-2xl border border-slate-100 p-5"
        >
          <h3 className="font-semibold text-slate-900 mb-4">Request Details</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Location</p>
                <p className="text-slate-900">{request.location_address}</p>
              </div>
            </div>

            {request.vehicle_make && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Car className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Vehicle</p>
                  <p className="text-slate-900">
                    {request.vehicle_color} {request.vehicle_year} {request.vehicle_make} {request.vehicle_model}
                  </p>
                </div>
              </div>
            )}

            {request.description && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Description</p>
                  <p className="text-slate-900">{request.description}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Provider Info */}
        {request.provider_name && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 bg-white rounded-2xl border border-slate-100 p-5"
          >
            <h3 className="font-semibold text-slate-900 mb-4">Your Provider</h3>
            
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <span className="text-xl font-bold text-white">
                  {request.provider_name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900">{request.provider_name}</h4>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm text-slate-600">4.8 (120 reviews)</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button variant="outline" className="flex-1 rounded-xl">
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
              <Button variant="outline" className="flex-1 rounded-xl">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>
          </motion.div>
        )}

        {/* Cost Summary */}
        {request.final_cost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Cost</p>
                <p className="text-3xl font-bold">${request.final_cost}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Rating Dialog */}
      <Dialog open={showRating} onOpenChange={setShowRating}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Rate Your Experience</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1"
                >
                  <Star
                    className={cn(
                      "w-10 h-10 transition-colors",
                      star <= rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-200"
                    )}
                  />
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Share your experience (optional)"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="min-h-[100px] rounded-xl"
            />
            <Button
              onClick={submitRating}
              disabled={rating === 0 || isSubmittingRating}
              className="w-full mt-4 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600"
            >
              {isSubmittingRating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Submit Review'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4">
        <div className="max-w-lg mx-auto">
          <Button
            onClick={() => navigate(createPageUrl('Home'))}
            variant="outline"
            className="w-full h-12 rounded-xl"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}