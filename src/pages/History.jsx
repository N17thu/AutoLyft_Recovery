import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  Loader2
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RequestCard from '@/components/RequestCard';

export default function History() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        navigate(createPageUrl('Welcome'));
      }
    } catch (error) {
      navigate(createPageUrl('Welcome'));
    }
  };

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['requests'],
    queryFn: () => base44.entities.ServiceRequest.list('-created_date')
  });

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['pending', 'accepted', 'in_progress'].includes(request.status);
    if (filter === 'completed') return request.status === 'completed';
    if (filter === 'cancelled') return request.status === 'cancelled';
    return true;
  });

  const stats = {
    total: requests.length,
    active: requests.filter(r => ['pending', 'accepted', 'in_progress'].includes(r.status)).length,
    completed: requests.filter(r => r.status === 'completed').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Request History</h1>
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6972a57489604bd98d3c2e02/763cdf91d_AutoLyftRecoverylogo.png"
              alt="AutoLyft Recovery"
              className="h-8 w-auto object-contain"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
            >
              <p className="text-slate-400 text-xs uppercase tracking-wide">Total</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
            >
              <p className="text-slate-400 text-xs uppercase tracking-wide">Active</p>
              <p className="text-2xl font-bold mt-1 text-orange-400">{stats.active}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
            >
              <p className="text-slate-400 text-xs uppercase tracking-wide">Completed</p>
              <p className="text-2xl font-bold mt-1 text-emerald-400">{stats.completed}</p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-4">
        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-lg shadow-slate-200/50 p-2 mb-6">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="w-full bg-slate-100 rounded-lg">
              <TabsTrigger value="all" className="flex-1 rounded-md">
                All
              </TabsTrigger>
              <TabsTrigger value="active" className="flex-1 rounded-md">
                <Clock className="w-4 h-4 mr-1.5" />
                Active
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex-1 rounded-md">
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Done
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="flex-1 rounded-md">
                <XCircle className="w-4 h-4 mr-1.5" />
                Cancelled
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Request List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">No requests yet</h3>
            <p className="text-slate-500 text-sm">Your assistance requests will appear here</p>
          </motion.div>
        ) : (
          <div className="space-y-4 pb-6">
            {filteredRequests.map((request, index) => (
              <RequestCard key={request.id} request={request} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}