import { motion } from 'framer-motion';
import { FiLogIn, FiLogOut, FiActivity, FiCalendar, FiDollarSign, FiAlertCircle } from 'react-icons/fi';

const iconMap = {
  login: FiLogIn,
  logout: FiLogOut,
  medication: FiActivity,
  event: FiCalendar,
  payments: FiDollarSign,
};

const colorMap = {
  admission: 'border-l-secondary',
  discharge: 'border-l-outline',
  medication: 'border-l-tertiary',
  appointment: 'border-l-primary',
  billing: 'border-l-secondary',
};

const iconColorMap = {
  admission: 'text-secondary',
  discharge: 'text-outline',
  medication: 'text-tertiary',
  appointment: 'text-primary',
  billing: 'text-secondary',
};

export default function ActivityFeed({ activities }) {
  return (
    <div className="bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-primary dark:text-white">Real-time Hospital Activity</h3>
        <div className="flex items-center gap-2 text-[10px] text-secondary font-semibold">
          <span className="w-2 h-2 bg-secondary rounded-full animate-ping"></span>
          Live Updates
        </div>
      </div>
      <div className="space-y-3">
        {activities.map((activity, index) => {
          const Icon = iconMap[activity.icon] || FiAlertCircle;
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-start gap-3 p-3 bg-surface-container-low dark:bg-surface-container-high rounded-lg border-l-4 ${colorMap[activity.type] || 'border-l-outline'}`}
            >
              <div className="bg-white dark:bg-surface-container p-2 rounded-full shadow-sm">
                <Icon className={`text-lg ${iconColorMap[activity.type] || 'text-outline'}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-on-surface dark:text-white">{activity.message}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] text-outline">{activity.time}</span>
                  <button className="text-xs text-primary font-semibold hover:underline">View Details</button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}