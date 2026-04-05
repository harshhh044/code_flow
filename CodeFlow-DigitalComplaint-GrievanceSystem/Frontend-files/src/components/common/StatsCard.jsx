import React from 'react';

const StatsCard = ({
  icon,
  iconColor = 'blue',
  value,
  label,
  trend,
  trendDirection = 'up',
  onClick,
  className = '',
}) => {
  const iconColors = {
    blue: 'from-blue-100 to-blue-200 text-blue-900',
    orange: 'from-orange-100 to-orange-200 text-orange-600',
    green: 'from-emerald-100 to-emerald-200 text-emerald-600',
    purple: 'from-violet-100 to-violet-200 text-violet-600',
    red: 'from-red-100 to-red-200 text-red-600',
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-2xl shadow-sm border border-transparent hover:shadow-lg hover:border-blue-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconColors[iconColor]} flex items-center justify-center text-xl`}>
          <i className={`fas ${icon}`}></i>
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
            trendDirection === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
            <i className={`fas fa-arrow-${trendDirection}`}></i> {trend}
          </span>
        )}
      </div>
      <div className="mb-1 text-3xl font-extrabold text-gray-800">{value}</div>
      <div className="text-sm font-medium text-gray-500">{label}</div>
    </div>
  );
};

// Stats Row Container
export const StatsRow = ({ children, columns = 4, className = '' }) => (
  <div className={`grid gap-6 mb-10 ${
    columns === 5 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5' :
    columns === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' :
    'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
  } ${className}`}>
    {children}
  </div>
);

export default StatsCard;