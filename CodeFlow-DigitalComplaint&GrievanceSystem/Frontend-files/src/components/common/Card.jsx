import React from 'react';
import { Link } from 'react-router-dom';

const Card = ({
  to,
  href,
  onClick,
  icon,
  title,
  description,
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const baseStyles = "group relative bg-white rounded-[20px] p-8 text-center shadow-sm transition-all duration-400 ease-out cursor-pointer overflow-hidden border border-transparent";
  
  const variants = {
    default: "hover:shadow-xl hover:-translate-y-2 hover:border-blue-100 hover:scale-[1.02]",
    compact: "p-6 rounded-2xl",
    stat: "p-6 rounded-2xl text-left",
  };

  const iconWrapperStyles = "w-[90px] h-[90px] mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-[24px] flex items-center justify-center text-[2.5rem] text-gray-600 transition-all duration-400 ease-out group-hover:bg-gradient-to-br group-hover:from-blue-900 group-hover:to-teal-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-[5deg]";

  const arrowStyles = "mt-6 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-500 transition-all duration-300 group-hover:bg-blue-900 group-hover:text-white group-hover:translate-x-1";

  const content = (
    <>
      {/* Top border animation */}
      <div className="absolute top-0 left-0 right-0 h-1 transition-transform transform scale-x-0 bg-gradient-to-r from-blue-900 to-teal-600 duration-400 group-hover:scale-x-100" />
      
      {icon && (
        <div className={iconWrapperStyles}>
          <i className={`fas ${icon}`}></i>
        </div>
      )}
      
      <h3 className="mb-2 text-lg font-bold text-gray-800">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-500">{description}</p>
      
      <div className={arrowStyles}>
        <i className="fas fa-arrow-right"></i>
      </div>
      
      {children}
    </>
  );

  const classes = `${baseStyles} ${variants[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }

  return (
    <div onClick={onClick} className={classes} {...props}>
      {content}
    </div>
  );
};

// Quick Access Card specifically for dashboard
export const QuickAccessCard = ({ to, icon, title, description, searchTags }) => (
  <Card
    to={to}
    icon={icon}
    title={title}
    description={description}
    data-search={searchTags}
  />
);

// Stat Card for dashboard stats
export const StatCard = ({ 
  icon, 
  iconColor = 'blue',
  trend,
  trendDirection = 'up',
  value, 
  label,
  onClick 
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
      className="p-6 transition-all duration-300 bg-white border border-transparent shadow-sm cursor-pointer rounded-2xl hover:shadow-lg hover:border-blue-100 hover:-translate-y-1"
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

export default Card;