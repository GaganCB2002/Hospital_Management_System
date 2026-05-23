import { motion } from 'framer-motion';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, variant = 'default', className = '' }) {
  const variants = {
    default: 'border-outline-variant',
    warning: 'border-l-4 border-l-warning',
    success: 'border-l-4 border-l-secondary',
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`bg-surface border ${variants[variant]} p-4 rounded-xl flex items-center justify-between shadow-sm transition-all ${className}`}
    >
      <div className="flex flex-col min-w-0 flex-1 w-full">
        <span className="text-xs text-on-surface-variant mb-1 break-words whitespace-normal w-full min-w-0">{title}</span>
        <span className="text-3xl font-bold text-on-surface break-words whitespace-normal w-full min-w-0">{value}</span>
        {trend && (
          <span className={`text-[10px] font-medium mt-2 flex items-center gap-1 w-full min-w-0 ${
            trend === 'up' ? 'text-secondary' : trend === 'down' ? 'text-error' : 'text-on-surface-variant'
          }`}>
            <span className={`w-2 h-2 rounded-full ${trend === 'up' ? 'bg-secondary' : trend === 'down' ? 'bg-error' : 'bg-on-surface-variant'}`}></span>
            {trendValue} vs last week
          </span>
        )}
        {subtitle && (
          <span className="text-[10px] text-on-surface-variant font-medium mt-2 break-words whitespace-normal w-full min-w-0">{subtitle}</span>
        )}
      </div>
      <div className={`p-3 rounded-lg ${
        variant === 'warning' ? 'bg-warning/10 text-warning' :
        variant === 'success' ? 'bg-secondary/10 text-secondary' :
        'bg-primary/10 text-primary'
      }`}>
        <Icon className="text-2xl" />
      </div>
    </motion.div>
  );
}
