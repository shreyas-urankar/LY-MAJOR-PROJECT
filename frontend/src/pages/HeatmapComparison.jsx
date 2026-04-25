import React, { useState } from 'react';
import { Map, AlertTriangle, TrendingUp, TrendingDown, Info, ShieldCheck } from 'lucide-react';

const ZONES = ['Central', 'North', 'South', 'East', 'West'];
const METRICS = [
  { id: 'population', name: 'Population Density', description: 'People per square kilometer', inverted: true },
  { id: 'infrastructure', name: 'Smart Infrastructure', description: 'Score out of 100 based on IoT integration and structural readiness', inverted: false },
  { id: 'environment', name: 'Air Quality (AQI)', description: 'Lower is better. Higher means more pollution', inverted: true },
  { id: 'transport', name: 'Traffic Congestion', description: 'Percentage of time delayed in traffic', inverted: true },
  { id: 'greenCover', name: 'Green Cover', description: 'Percentage of land covered by vegetation', inverted: false },
  { id: 'safety', name: 'Safety Score', description: 'Score out of 100 based on incidents and emergency response', inverted: false }
];

// Mock data representing scores for each zone and metric (0 to 100 normalized)
const HEATMAP_DATA = {
  Central: { population: 92, infrastructure: 85, environment: 78, transport: 88, greenCover: 15, safety: 72 },
  North: { population: 65, infrastructure: 72, environment: 55, transport: 45, greenCover: 35, safety: 85 },
  South: { population: 45, infrastructure: 60, environment: 40, transport: 30, greenCover: 55, safety: 90 },
  East: { population: 75, infrastructure: 65, environment: 65, transport: 60, greenCover: 25, safety: 68 },
  West: { population: 55, infrastructure: 80, environment: 45, transport: 50, greenCover: 40, safety: 88 }
};

// Helper to calculate color
const getColorClass = (value, inverted) => {
  // If inverted is true, high value = bad (red), low value = good (green)
  // If inverted is false, high value = good (green), low value = bad (red)
  
  let normalized = inverted ? 100 - value : value;
  
  if (normalized >= 75) return 'bg-emerald-500 text-white';
  if (normalized >= 60) return 'bg-emerald-400 text-white';
  if (normalized >= 45) return 'bg-yellow-400 text-gray-900';
  if (normalized >= 30) return 'bg-orange-400 text-white';
  return 'bg-red-500 text-white';
};

const getStatusMessage = (value, inverted) => {
  let normalized = inverted ? 100 - value : value;
  if (normalized >= 75) return 'Excellent';
  if (normalized >= 55) return 'Moderate';
  return 'Critical';
};

function HeatmapComparison() {
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedZone, setSelectedZone] = useState('Central');

  return (
    <div className="flex-1 p-6 bg-gray-50 overflow-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Map className="w-8 h-8 mr-3 text-blue-600" />
          City Zones Comparison Heatmap
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Analyze and compare key urban performance metrics across different geographical zones. 
          Use the color-coded grid to identify critical areas requiring attention and thriving zones.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Heatmap Grid */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Zone vs Metric Analysis</h2>
            <div className="flex space-x-4 text-sm font-medium">
              <div className="flex items-center"><div className="w-4 h-4 rounded bg-emerald-500 mr-2"></div>Optimal</div>
              <div className="flex items-center"><div className="w-4 h-4 rounded bg-yellow-400 mr-2"></div>Moderate</div>
              <div className="flex items-center"><div className="w-4 h-4 rounded bg-red-500 mr-2"></div>Critical</div>
            </div>
          </div>
          
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-4 font-semibold text-gray-500 border-b-2 border-gray-200 w-1/4">Metric \ Zone</th>
                  {ZONES.map(zone => (
                    <th key={zone} className="p-4 font-bold text-center text-gray-800 border-b-2 border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setSelectedZone(zone)}>
                      {zone}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {METRICS.map(metric => (
                  <tr key={metric.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-gray-800">{metric.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{metric.description}</div>
                    </td>
                    {ZONES.map(zone => {
                      const val = HEATMAP_DATA[zone][metric.id];
                      const isSelected = selectedCell?.zone === zone && selectedCell?.metric === metric.id;
                      return (
                        <td key={`${zone}-${metric.id}`} className="p-2 text-center">
                          <div 
                            onClick={() => {
                              setSelectedCell({ zone, metric: metric.id, value: val, inverted: metric.inverted });
                              setSelectedZone(zone);
                            }}
                            className={`w-full h-16 rounded-xl flex items-center justify-center font-bold text-lg cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-md ${getColorClass(val, metric.inverted)} ${isSelected ? 'ring-4 ring-blue-400 ring-offset-2' : ''}`}
                            title={`Click for insights on ${zone} ${metric.name}`}
                          >
                            {val}
                            {metric.id === 'environment' && ' AQI'}
                            {metric.id === 'transport' && '%'}
                            {metric.id === 'greenCover' && '%'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insights Panel */}
        <div className="space-y-6">
          {/* Zone Profile */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
              {selectedZone} Zone Profile
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 font-medium">Overall Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  selectedZone === 'Central' ? 'bg-red-100 text-red-700' :
                  selectedZone === 'South' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {selectedZone === 'Central' ? 'High Stress' : selectedZone === 'South' ? 'Optimal' : 'Developing'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 font-medium">Top Strength</span>
                <span className="font-bold text-emerald-600 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {selectedZone === 'Central' ? 'Infrastructure' : 
                   selectedZone === 'South' ? 'Safety' :
                   selectedZone === 'West' ? 'Safety' : 'Infrastructure'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 font-medium">Key Weakness</span>
                <span className="font-bold text-red-600 flex items-center">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  {selectedZone === 'Central' ? 'Population Density' : 
                   selectedZone === 'South' ? 'Transport' :
                   selectedZone === 'East' ? 'Green Cover' : 'Environment'}
                </span>
              </div>
            </div>
          </div>

          {/* Cell Specific Insights */}
          {selectedCell ? (
            <div className={`rounded-2xl shadow-sm border p-6 transition-all duration-500 ${
              getStatusMessage(selectedCell.value, selectedCell.inverted) === 'Critical' ? 'bg-red-50 border-red-200' :
              getStatusMessage(selectedCell.value, selectedCell.inverted) === 'Moderate' ? 'bg-yellow-50 border-yellow-200' :
              'bg-emerald-50 border-emerald-200'
            }`}>
              <div className="flex items-start mb-4">
                {getStatusMessage(selectedCell.value, selectedCell.inverted) === 'Critical' ? (
                  <AlertTriangle className="w-8 h-8 text-red-500 mr-3 mt-1" />
                ) : getStatusMessage(selectedCell.value, selectedCell.inverted) === 'Moderate' ? (
                  <Info className="w-8 h-8 text-yellow-500 mr-3 mt-1" />
                ) : (
                  <ShieldCheck className="w-8 h-8 text-emerald-500 mr-3 mt-1" />
                )}
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedCell.zone} Zone: {METRICS.find(m => m.id === selectedCell.metric)?.name}
                  </h3>
                  <p className={`text-sm font-semibold mt-1 ${
                    getStatusMessage(selectedCell.value, selectedCell.inverted) === 'Critical' ? 'text-red-600' :
                    getStatusMessage(selectedCell.value, selectedCell.inverted) === 'Moderate' ? 'text-yellow-600' :
                    'text-emerald-600'
                  }`}>
                    Status: {getStatusMessage(selectedCell.value, selectedCell.inverted)} ({selectedCell.value})
                  </p>
                </div>
              </div>
              
              <div className="bg-white/60 rounded-xl p-4 text-gray-700 text-sm leading-relaxed border border-white/20">
                {getStatusMessage(selectedCell.value, selectedCell.inverted) === 'Critical' ? 
                  `This metric is in a critical state in the ${selectedCell.zone} zone. Immediate policy intervention is recommended to prevent further degradation of urban quality of life. AI models predict a worsening trend if no action is taken within the next 12 months.` :
                 getStatusMessage(selectedCell.value, selectedCell.inverted) === 'Moderate' ?
                  `The ${selectedCell.zone} zone is currently showing moderate performance in this area. While not critical, targeted investments could yield significant improvements and push this into the optimal tier.` :
                  `This metric represents a significant strength for the ${selectedCell.zone} zone. Current policies and infrastructure are functioning optimally. Consider using this zone as a blueprint for city-wide implementation.`
                }
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-100 p-6 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-blue-500">
                <Map className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Interactive Heatmap</h3>
              <p className="text-gray-600 text-sm">
                Click on any colored cell in the grid to view detailed AI insights, status reports, and recommendations for that specific zone and metric.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HeatmapComparison;
