import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  User,
  Car,
  MapPin,
  Phone,
  Mail,
  Edit2,
  Save,
  Plus,
  Trash2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({});
  const [vehicles, setVehicles] = useState([]);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    plate: ''
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setEditData({
        phone: userData.phone || '',
        address: userData.address || ''
      });
      setVehicles(userData.vehicles || []);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await base44.auth.updateMe({
        phone: editData.phone,
        address: editData.address,
        vehicles
      });
      await loadUser();
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addVehicle = async () => {
    const updatedVehicles = [...vehicles, newVehicle];
    setVehicles(updatedVehicles);
    try {
      await base44.auth.updateMe({ vehicles: updatedVehicles });
    } catch (error) {
      console.error('Error adding vehicle:', error);
    }
    setNewVehicle({ make: '', model: '', year: '', color: '', plate: '' });
    setShowAddVehicle(false);
  };

  const removeVehicle = async (index) => {
    const updatedVehicles = vehicles.filter((_, i) => i !== index);
    setVehicles(updatedVehicles);
    try {
      await base44.auth.updateMe({ vehicles: updatedVehicles });
    } catch (error) {
      console.error('Error removing vehicle:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-lg mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold">{user?.full_name || 'User'}</h1>
              <p className="text-slate-400 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 -mt-4 pb-6">
        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="rounded-2xl border-0 shadow-lg shadow-slate-200/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Contact Information</CardTitle>
              {!isEditing ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="text-orange-600 hover:text-orange-700"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="text-orange-600 hover:text-orange-700"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </>
                  )}
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-slate-900">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Phone</p>
                  {isEditing ? (
                    <Input
                      value={editData.phone}
                      onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      placeholder="Add phone number"
                      className="mt-1 h-9"
                    />
                  ) : (
                    <p className="text-slate-900">{user?.phone || 'Not set'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Address</p>
                  {isEditing ? (
                    <Input
                      value={editData.address}
                      onChange={(e) => setEditData({...editData, address: e.target.value})}
                      placeholder="Add home address"
                      className="mt-1 h-9"
                    />
                  ) : (
                    <p className="text-slate-900">{user?.address || 'Not set'}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Vehicles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4"
        >
          <Card className="rounded-2xl border-0 shadow-lg shadow-slate-200/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">My Vehicles</CardTitle>
              <Dialog open={showAddVehicle} onOpenChange={setShowAddVehicle}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-orange-600 hover:text-orange-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Vehicle</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div>
                      <Label>Make</Label>
                      <Input
                        value={newVehicle.make}
                        onChange={(e) => setNewVehicle({...newVehicle, make: e.target.value})}
                        placeholder="Toyota"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Model</Label>
                      <Input
                        value={newVehicle.model}
                        onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                        placeholder="Camry"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Year</Label>
                      <Input
                        value={newVehicle.year}
                        onChange={(e) => setNewVehicle({...newVehicle, year: e.target.value})}
                        placeholder="2020"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Color</Label>
                      <Input
                        value={newVehicle.color}
                        onChange={(e) => setNewVehicle({...newVehicle, color: e.target.value})}
                        placeholder="Silver"
                        className="mt-1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>License Plate</Label>
                      <Input
                        value={newVehicle.plate}
                        onChange={(e) => setNewVehicle({...newVehicle, plate: e.target.value})}
                        placeholder="ABC-123"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={addVehicle}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600"
                  >
                    Add Vehicle
                  </Button>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {vehicles.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <Car className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-sm">No vehicles added yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vehicles.map((vehicle, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
                        <Car className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </p>
                        <p className="text-sm text-slate-500">
                          {vehicle.color} • {vehicle.plate}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVehicle(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <Button
            variant="outline"
            onClick={() => base44.auth.logout()}
            className="w-full h-12 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
          >
            Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
}