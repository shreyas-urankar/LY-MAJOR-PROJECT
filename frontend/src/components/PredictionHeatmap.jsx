import React from 'react';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const PredictionHeatmap = ({ percentage, title = "AI Prediction Confidence", description = "Based on multi-temporal satellite data and ML models" }) => {
  // Determine color based on percentage
  const getColor = (p) => {
    if (p >= 85) return { stroke: '#10B981', text: 'text-emerald-500', bg: 'bg-emerald-50', icon: <CheckCircle className="w-5 h-5 text-emerald-500" /> };
    if (p >= 70) return { stroke: '#F59E0B', text: 'text-amber-500', bg: 'bg-amber-50', icon: <TrendingUp className="w-5 h-5 text-amber-500" /> };
    return { stroke: '#EF4444', text: 'text-red-500', bg: 'bg-red-50', icon: <AlertTriangle className="w-5 h-5 text-red-500" /> };
  };

  const colorConfig = getColor(percentage);
  
  // SVG Circular Progress calculation
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`p-4 rounded-xl border border-gray-100 shadow-sm ${colorConfig.bg} flex items-center justify-between`}>
      <div className="flex-1 pr-4">
        <div className="flex items-center space-x-2 mb-1">
          {colorConfig.icon}
          <h4 className="font-bold text-gray-900">{title}</h4>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
        <div className="mt-3">
          <div className="w-full bg-white/50 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-1.5 rounded-full transition-all duration-1000 ease-out`}
              style={{ width: `${percentage}%`, backgroundColor: colorConfig.stroke }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
        {/* Background track */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-white opacity-60"
          />
          {/* Progress circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke={colorConfig.stroke}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Percentage Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-black tracking-tighter ${colorConfig.text}`}>
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default PredictionHeatmap;
