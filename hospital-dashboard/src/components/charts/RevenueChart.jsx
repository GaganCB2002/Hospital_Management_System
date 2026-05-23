import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function generateQuarterlyData(data) {
  const quarters = [];
  for (let i = 0; i < data.length; i += 3) {
    const chunk = data.slice(i, i + 3);
    const qLabel = `Q${Math.floor(i / 3) + 1}`;
    quarters.push({
      month: qLabel,
      revenue: chunk.reduce((sum, m) => sum + m.revenue, 0),
      expenses: chunk.reduce((sum, m) => sum + m.expenses, 0),
    });
  }
  return quarters;
}

export default function RevenueChart({ data }) {
  const [view, setView] = useState('Monthly');

  const chartData = useMemo(() => {
    if (view === 'Quarterly') return generateQuarterlyData(data);
    return data;
  }, [view, data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-xl p-6 shadow-sm"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-on-surface">Hospital Revenue vs Expenses</h2>
          <p className="text-sm text-on-surface-variant">Consolidated financial overview for Q3 2024</p>
        </div>
        <div className="relative flex gap-1 bg-surface-container-high rounded-lg p-1">
          <div
            className="absolute top-1 bottom-1 rounded-md bg-primary transition-all duration-300 ease-out"
            style={{
              left: view === 'Monthly' ? '4px' : 'calc(50% + 2px)',
              width: 'calc(50% - 6px)',
            }}
          />
          {['Monthly', 'Quarterly'].map((option) => (
            <button
              key={option}
              onClick={() => setView(option)}
              className={`relative px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200 z-10 ${
                view === option ? 'text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <motion.div
        key={view}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#c2c7d1" opacity={0.3} />
            <XAxis dataKey="month" stroke="#727780" fontSize={12} />
            <YAxis stroke="#727780" fontSize={12} tickFormatter={(value) => `₹${value / 1000}k`} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-outline)',
                borderRadius: '8px',
                color: 'var(--color-on-surface)',
              }}
              formatter={(value) => [`₹${value.toLocaleString()}`, '']}
            />
            <Legend />
            <Bar
              dataKey="revenue"
              fill="#00355f"
              name="Revenue"
              radius={[4, 4, 0, 0]}
              isAnimationActive={true}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            />
            <Bar
              dataKey="expenses"
              fill="#006b5f"
              name="Expenses"
              radius={[4, 4, 0, 0]}
              isAnimationActive={true}
              animationBegin={150}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
}