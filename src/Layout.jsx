import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import {
  Home,
  MapPin,
  Clock,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Import Leaflet CSS globally
import 'leaflet/dist/leaflet.css';

const navItems = [
  { name: 'Home', icon: Home, page: 'Home' },
  { name: 'Providers', icon: MapPin, page: 'Providers' },
  { name: 'History', icon: Clock, page: 'History' },
  { name: 'Profile', icon: User, page: 'Profile' }
];

export default function Layout({ children, currentPageName }) {
  // Hide bottom nav on tracking page and provider dashboard
  const hideNav = ['Tracking', 'Welcome', 'ProviderDashboard'].includes(currentPageName);

  return (
    <div className="min-h-screen bg-slate-50">
      {children}
      
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-50">
          <div className="max-w-lg mx-auto px-4">
            <div className="flex items-center justify-around py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.page)}
                    className="relative flex flex-col items-center py-2 px-4"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -top-0.5 w-12 h-1 bg-orange-500 rounded-full"
                      />
                    )}
                    <Icon
                      className={cn(
                        "w-6 h-6 transition-colors",
                        isActive ? "text-orange-500" : "text-slate-400"
                      )}
                    />
                    <span
                      className={cn(
                        "text-xs mt-1 font-medium transition-colors",
                        isActive ? "text-orange-500" : "text-slate-400"
                      )}
                    >
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
          {/* Safe area padding for iOS */}
          <div className="h-safe-area-inset-bottom bg-white" />
        </nav>
      )}
      
      {/* Bottom padding for nav */}
      {!hideNav && <div className="h-20" />}
    </div>
  );
}