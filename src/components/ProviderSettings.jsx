import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Settings,
  Clock,
  Truck,
  MapPin,
  Plus,
  Trash2,
  Loader2,
  Save
} from 'lucide-react';

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function ProviderSettings({ open, onOpenChange, userId }) {
  const queryClient = useQueryClient();
  const [serviceRadius, setServiceRadius] = useState(25);
  const [operatingHours, setOperatingHours] = useState({});
  const [vehicles, setVehicles] = useState([]);
  const [newVehicle, setNewVehicle] = useState({
    type: '',
    make: '',
    model: '',
    year: '',
    plate: '',
    capacity: ''
  });

  const { data: provider, isLoading } = useQuery({
    queryKey: ['provider-profile', userId],
    queryFn: async () => {
      const providers = await base44.entities.ServiceProvider.filter({ email: (await base44.auth.me()).email });
      return providers[0] || null;
    },
    enabled: open && !!userId
  });

  useEffect(() => {
    if (provider) {
      setServiceRadius(provider.service_radius || 25);
      setOperatingHours(provider.operating_hours || getDefaultHours());
      setVehicles(provider.vehicles || []);
    }
  }, [provider]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.ServiceProvider.update(provider.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-profile'] });
    }
  });

  const getDefaultHours = () => ({
    monday: { start: '08:00', end: '18:00', closed: false },
    tuesday: { start: '08:00', end: '18:00', closed: false },
    wednesday: { start: '08:00', end: '18:00', closed: false },
    thursday: { start: '08:00', end: '18:00', closed: false },
    friday: { start: '08:00', end: '18:00', closed: false },
    saturday: { start: '09:00', end: '15:00', closed: false },
    sunday: { start: '00:00', end: '00:00', closed: true }
  });

  const handleSaveRadius = () => {
    updateMutation.mutate({ service_radius: serviceRadius });
  };

  const handleSaveHours = () => {
    updateMutation.mutate({ operating_hours: operatingHours });
  };

  const handleAddVehicle = () => {
    const updatedVehicles = [...vehicles, newVehicle];
    setVehicles(updatedVehicles);
    updateMutation.mutate({ vehicles: updatedVehicles });
    setNewVehicle({ type: '', make: '', model: '', year: '', plate: '', capacity: '' });
  };

  const handleRemoveVehicle = (index) => {
    const updatedVehicles = vehicles.filter((_, i) => i !== index);
    setVehicles(updatedVehicles);
    updateMutation.mutate({ vehicles: updatedVehicles });
  };

  const updateHours = (day, field, value) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Provider Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="radius" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="radius">
              <MapPin className="w-4 h-4 mr-2" />
              Service Area
            </TabsTrigger>
            <TabsTrigger value="hours">
              <Clock className="w-4 h-4 mr-2" />
              Hours
            </TabsTrigger>
            <TabsTrigger value="vehicles">
              <Truck className="w-4 h-4 mr-2" />
              Vehicles
            </TabsTrigger>
          </TabsList>

          {/* Service Radius */}
          <TabsContent value="radius" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Service Radius</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Maximum Distance (miles)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Input
                      type="number"
                      value={serviceRadius}
                      onChange={(e) => setServiceRadius(Number(e.target.value))}
                      className="max-w-[120px]"
                    />
                    <span className="text-sm text-slate-500">
                      You'll receive requests within {serviceRadius} miles of your location
                    </span>
                  </div>
                </div>
                <Button
                  onClick={handleSaveRadius}
                  disabled={updateMutation.isPending}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Radius
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Operating Hours */}
          <TabsContent value="hours" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Operating Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {days.map(day => (
                  <div key={day} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-24 font-medium text-slate-900 capitalize">
                      {day}
                    </div>
                    <Switch
                      checked={!operatingHours[day]?.closed}
                      onCheckedChange={(checked) => updateHours(day, 'closed', !checked)}
                    />
                    {!operatingHours[day]?.closed && (
                      <>
                        <Input
                          type="time"
                          value={operatingHours[day]?.start || '08:00'}
                          onChange={(e) => updateHours(day, 'start', e.target.value)}
                          className="max-w-[120px]"
                        />
                        <span className="text-slate-500">to</span>
                        <Input
                          type="time"
                          value={operatingHours[day]?.end || '18:00'}
                          onChange={(e) => updateHours(day, 'end', e.target.value)}
                          className="max-w-[120px]"
                        />
                      </>
                    )}
                    {operatingHours[day]?.closed && (
                      <span className="text-slate-500">Closed</span>
                    )}
                  </div>
                ))}
                <Button
                  onClick={handleSaveHours}
                  disabled={updateMutation.isPending}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 mt-4"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Hours
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vehicles */}
          <TabsContent value="vehicles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Service Vehicles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing Vehicles */}
                {vehicles.length > 0 && (
                  <div className="space-y-2">
                    {vehicles.map((vehicle, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                      >
                        <Truck className="w-5 h-5 text-slate-600" />
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">
                            {vehicle.type} - {vehicle.make} {vehicle.model} ({vehicle.year})
                          </p>
                          <p className="text-sm text-slate-500">
                            Plate: {vehicle.plate} • Capacity: {vehicle.capacity}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveVehicle(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Vehicle */}
                <div className="border-t pt-4 space-y-3">
                  <h4 className="font-medium text-slate-900">Add New Vehicle</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Type</Label>
                      <Input
                        placeholder="Tow Truck"
                        value={newVehicle.type}
                        onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Make</Label>
                      <Input
                        placeholder="Ford"
                        value={newVehicle.make}
                        onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Model</Label>
                      <Input
                        placeholder="F-550"
                        value={newVehicle.model}
                        onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Year</Label>
                      <Input
                        placeholder="2022"
                        value={newVehicle.year}
                        onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>License Plate</Label>
                      <Input
                        placeholder="ABC-123"
                        value={newVehicle.plate}
                        onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Capacity</Label>
                      <Input
                        placeholder="8 tons"
                        value={newVehicle.capacity}
                        onChange={(e) => setNewVehicle({ ...newVehicle, capacity: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleAddVehicle}
                    disabled={!newVehicle.type || !newVehicle.make || updateMutation.isPending}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Vehicle
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}