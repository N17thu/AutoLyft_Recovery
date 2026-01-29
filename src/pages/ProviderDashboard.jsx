import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Bell,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  Navigation,
  Phone,
  Car,
  Loader2,
  LogOut,
  Settings,
  TrendingUp,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Map from '@/components/Map';
import ProviderSettings from '@/components/ProviderSettings';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const serviceLabels = {
  towing: 'Towing',
  tire_change: 'Flat Tire',
  battery_jump: 'Battery Jump',
  fuel_delivery: 'Fuel Delivery',
  lockout: 'Lockout',
  general_repair: 'Repair'
};

const statusColors = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  accepted: 'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-orange-100 text-orange-700 border-orange-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200'
};

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [activeTab, setActiveTab] = useState('available');
  const [showSettings, setShowSettings] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      // Redirect regular users to Home
      if (userData.role !== 'admin') {
        navigate(createPageUrl('Home'));
      }
    } catch (error) {
      navigate(createPageUrl('Welcome'));
    }
  };

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['provider-requests'],
    queryFn: () => base44.entities.ServiceRequest.list('-created_date')
  });

  // Real-time notification system
  useEffect(() => {
    const unsubscribe = base44.entities.ServiceRequest.subscribe((event) => {
      if (event.type === 'create' && event.data.status === 'pending') {
        // Show notification for new request
        setNotification({
          id: event.data.id,
          service: event.data.service_type,
          location: event.data.location_address
        });
        
        // Play notification sound
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryy3ojBSh+zPLaizsIGGS57OihUBELTKXh8bllHAU2jdXyzn0pBSd6yvDdlUIME1yw6OyrWBUIQ5zd8sFsIAUuhM/z1YU2Bhxqvu7mnEsODlOq5fGzYBoGPJPY88p5KAUme8rx3I4+CRZiturqpVITC0mi4PK8aB8FM4nU8tGALgYfccXv45ZFDBFYr+fxr10XCECa3PLEcSMFLIHO8tiJOQcZaLvt559NEAxPp+PwtmMcBjiP1/HNeisFI3fH8N+RQAoUXrTp66hVFApGnt/yvmwhBTCG0fPTgjQGHW/A7eSaRw0PVqzl77BeGQc9ltrzwnoiBSh+zPLaizsIGGS56+mjTxELTKXh8bllHAU1jdT';
        audio.volume = 0.3;
        audio.play().catch(() => {});
        
        // Auto-hide notification after 10 seconds
        setTimeout(() => setNotification(null), 10000);
        
        // Refresh requests
        queryClient.invalidateQueries({ queryKey: ['provider-requests'] });
      }
    });
    
    return unsubscribe;
  }, [queryClient]);

  const acceptMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ServiceRequest.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-requests'] });
      setShowAcceptDialog(false);
      setSelectedRequest(null);
      setEstimatedTime('');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ServiceRequest.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-requests'] });
    }
  });

  const availableRequests = requests.filter(r => r.status === 'pending');
  const myRequests = requests.filter(r => 
    r.provider_id === user?.id || ['accepted', 'in_progress'].includes(r.status)
  );
  const completedRequests = requests.filter(r => r.status === 'completed');

  const todayEarnings = completedRequests
    .filter(r => {
      const today = new Date();
      const reqDate = new Date(r.updated_date);
      return reqDate.toDateString() === today.toDateString();
    })
    .reduce((sum, r) => sum + (r.final_cost || 0), 0);

  const handleAccept = (request) => {
    setSelectedRequest(request);
    setShowAcceptDialog(true);
  };

  const confirmAccept = () => {
    if (!selectedRequest || !estimatedTime) return;
    
    acceptMutation.mutate({
      id: selectedRequest.id,
      data: {
        status: 'accepted',
        provider_id: user.id,
        provider_name: user.full_name || 'Provider',
        estimated_arrival: parseInt(estimatedTime),
        provider_location_lat: 37.7749, // In real app, get actual location
        provider_location_lng: -122.4194
      }
    });
  };

  const handleStatusUpdate = (requestId, newStatus) => {
    updateStatusMutation.mutate({ id: requestId, status: newStatus });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white sticky top-0 z-10 shadow-xl">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6972a57489604bd98d3c2e02/763cdf91d_AutoLyftRecoverylogo.png"
              alt="AutoLyft Recovery"
              className="h-10 w-auto object-contain"
            />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="text-slate-300 hover:text-white"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => base44.auth.logout()}
                className="text-slate-300 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Provider Dashboard</h1>
              <p className="text-slate-400 mt-1">Welcome back, {user.full_name || 'Provider'}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm font-medium">Today's Earnings</span>
              </div>
              <p className="text-3xl font-bold">${todayEarnings.toFixed(2)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">Active Jobs</span>
              </div>
              <p className="text-3xl font-bold">{myRequests.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">Completed</span>
              </div>
              <p className="text-3xl font-bold">{completedRequests.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="available" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Available ({availableRequests.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              My Jobs ({myRequests.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Completed ({completedRequests.length})
            </TabsTrigger>
          </TabsList>

          {/* Available Requests */}
          <TabsContent value="available">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              </div>
            ) : availableRequests.length === 0 ? (
              <div className="text-center py-20">
                <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No new requests</h3>
                <p className="text-slate-500">New assistance requests will appear here</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {availableRequests.map((request, index) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onAccept={handleAccept}
                    index={index}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Active Jobs */}
          <TabsContent value="active">
            {myRequests.length === 0 ? (
              <div className="text-center py-20">
                <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No active jobs</h3>
                <p className="text-slate-500">Accept requests to see them here</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {myRequests.map((request, index) => (
                  <ActiveJobCard
                    key={request.id}
                    request={request}
                    onStatusUpdate={handleStatusUpdate}
                    index={index}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Completed */}
          <TabsContent value="completed">
            {completedRequests.length === 0 ? (
              <div className="text-center py-20">
                <CheckCircle2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No completed jobs</h3>
                <p className="text-slate-500">Completed jobs will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedRequests.map((request) => (
                  <CompletedJobCard key={request.id} request={request} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Notification Toast */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-4 right-4 z-50 max-w-md"
        >
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-2xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">New Request Available!</h4>
              <p className="text-sm text-orange-100">
                {serviceLabels[notification.service]} • {notification.location}
              </p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Settings Dialog */}
      <ProviderSettings
        open={showSettings}
        onOpenChange={setShowSettings}
        userId={user?.id}
      />

      {/* Accept Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Estimated Arrival Time (minutes)</Label>
              <Input
                type="number"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                placeholder="15"
                className="mt-2"
              />
            </div>
            <Button
              onClick={confirmAccept}
              disabled={!estimatedTime || acceptMutation.isPending}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600"
            >
              {acceptMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Confirm & Accept'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RequestCard({ request, onAccept, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-md hover:shadow-xl transition-all"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-slate-900">
              {serviceLabels[request.service_type]}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {format(new Date(request.created_date), 'h:mm a')} • {format(new Date(request.created_date), 'MMM d')}
            </p>
          </div>
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            New Request
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <span className="text-slate-600">{request.location_address}</span>
          </div>
          {request.vehicle_make && (
            <div className="flex items-center gap-2 text-sm">
              <Car className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">
                {request.vehicle_color} {request.vehicle_year} {request.vehicle_make} {request.vehicle_model}
              </span>
            </div>
          )}
        </div>

        {request.description && (
          <p className="text-sm text-slate-600 mb-4 p-3 bg-slate-50 rounded-lg">
            {request.description}
          </p>
        )}

        <Button
          onClick={() => onAccept(request)}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
        >
          Accept Request
        </Button>
      </div>
    </motion.div>
  );
}

function ActiveJobCard({ request, onStatusUpdate, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl border border-orange-200 overflow-hidden shadow-md"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-slate-900">
              {serviceLabels[request.service_type]}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              ETA: {request.estimated_arrival} minutes
            </p>
          </div>
          <Badge className={cn("border", statusColors[request.status])}>
            {request.status === 'accepted' ? 'Accepted' : 'On The Way'}
          </Badge>
        </div>

        {request.location_lat && request.location_lng && (
          <div className="mb-4">
            <Map
              userLocation={[request.location_lat, request.location_lng]}
              providerLocation={request.provider_location_lat && request.provider_location_lng 
                ? [request.provider_location_lat, request.provider_location_lng]
                : null}
              height="200px"
            />
          </div>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
            <span className="text-slate-600">{request.location_address}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {request.status === 'accepted' && (
            <Button
              onClick={() => onStatusUpdate(request.id, 'in_progress')}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Start Job
            </Button>
          )}
          {request.status === 'in_progress' && (
            <Button
              onClick={() => onStatusUpdate(request.id, 'completed')}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              Mark Complete
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            className="border-slate-200"
            onClick={() => window.open(`tel:${request.created_by}`)}
          >
            <Phone className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function CompletedJobCard({ request }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h4 className="font-medium text-slate-900">
            {serviceLabels[request.service_type]}
          </h4>
          <p className="text-sm text-slate-500">
            {format(new Date(request.updated_date), 'MMM d, yyyy • h:mm a')}
          </p>
        </div>
      </div>
      {request.final_cost && (
        <div className="text-right">
          <p className="font-semibold text-slate-900">${request.final_cost}</p>
          <p className="text-xs text-slate-500">Earnings</p>
        </div>
      )}
    </div>
  );
}