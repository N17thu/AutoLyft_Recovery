import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { User, Truck, ArrowRight, Shield } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const user = await base44.auth.me();
        // Redirect based on role
        if (user.role === 'admin') {
          navigate(createPageUrl('ProviderDashboard'));
        } else {
          navigate(createPageUrl('Home'));
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleUserLogin = () => {
    base44.auth.redirectToLogin(createPageUrl('Home'));
  };

  const handleProviderLogin = () => {
    base44.auth.redirectToLogin(createPageUrl('ProviderDashboard'));
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6972a57489604bd98d3c2e02/763cdf91d_AutoLyftRecoverylogo.png"
          alt="AutoLyft Recovery"
          className="h-24 w-auto object-contain"
        />
        <p className="text-center text-slate-400 mt-4 text-sm">
          Emergency roadside assistance at your fingertips
        </p>
      </motion.div>

      {/* Login Options */}
      <div className="w-full max-w-md space-y-4">
        {/* User Login */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <button
            onClick={handleUserLogin}
            className="w-full bg-white hover:bg-gray-50 text-slate-900 rounded-2xl p-6 transition-all hover:scale-105 hover:shadow-2xl shadow-xl group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-slate-900">I Need Help</h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Request roadside assistance
                  </p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-orange-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </motion.div>

        {/* Provider Login */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={handleProviderLogin}
            className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white rounded-2xl p-6 transition-all hover:scale-105 hover:shadow-2xl shadow-xl group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-amber-400 flex items-center justify-center">
                  <Truck className="w-7 h-7 text-slate-900" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold">I'm a Provider</h3>
                  <p className="text-sm text-slate-300 mt-0.5">
                    Login to accept requests
                  </p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-12 text-center"
      >
        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
          <Shield className="w-4 h-4" />
          <span>Secure & Encrypted</span>
        </div>
        <p className="text-slate-500 text-xs mt-4">
          24/7 Emergency Support • Fast Response Times
        </p>
      </motion.div>
    </div>
  );
}