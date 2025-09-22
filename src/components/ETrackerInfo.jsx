import React from 'react';
import { TrendingUp, PieChart, BarChart3, DollarSign } from 'lucide-react';

const ETrackerInfo = () => {
  return (
    <div className="flex-1 bg-gradient-to-br from-blue-600 to-purple-700 p-8 flex items-center justify-center">
      <div className="text-white text-center max-w-lg">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-4">Track Every Penny</h2>
          <p className="text-xl mb-8" style={{ opacity: 0.9 }}>
            Take control of your finances with our comprehensive expense tracking solution
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div
            className="rounded-lg p-6 backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <TrendingUp size={48} className="mx-auto mb-3 text-yellow-300" />
            <h3 className="font-semibold mb-2">Track Trends</h3>
            <p className="text-sm" style={{ opacity: 0.9 }}>
              Monitor spending patterns over time
            </p>
          </div>

          <div
            className="rounded-lg p-6 backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <PieChart size={48} className="mx-auto mb-3 text-green-300" />
            <h3 className="font-semibold mb-2">Categorize</h3>
            <p className="text-sm" style={{ opacity: 0.9 }}>
              Organize expenses by category
            </p>
          </div>

          <div
            className="rounded-lg p-6 backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <BarChart3 size={48} className="mx-auto mb-3 text-pink-300" />
            <h3 className="font-semibold mb-2">Analytics</h3>
            <p className="text-sm" style={{ opacity: 0.9 }}>
              Detailed financial insights
            </p>
          </div>

          <div
            className="rounded-lg p-6 backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <DollarSign size={48} className="mx-auto mb-3 text-blue-300" />
            <h3 className="font-semibold mb-2">Budget Goals</h3>
            <p className="text-sm" style={{ opacity: 0.9 }}>
              Set and achieve financial targets
            </p>
          </div>
        </div>

        <div className="relative">
          <div
            className="absolute -top-4 -left-4 w-24 h-24 rounded-full animate-pulse"
            style={{ backgroundColor: '#F59E0B', opacity: 0.2 }}
          />
          <div
            className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full animate-pulse"
            style={{ backgroundColor: '#F472B6', opacity: 0.3, animationDelay: '1s' }}
          />
          <div className="text-lg font-medium">
            "Managing money has never been this easy!"
          </div>
        </div>
      </div>
    </div>
  );
};

export default ETrackerInfo;
