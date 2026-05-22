import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RevenueChart({ data }) {
  return (
    <div className="bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-on-surface">Hospital Revenue vs Expenses</h2>
          <p className="text-sm text-on-surface-variant">Consolidated financial overview for Q3 2024</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded-lg border border-outline-variant dark:border-outline text-xs hover:bg-surface-container-low transition-colors">Monthly</button>
          <button className="px-3 py-1 rounded-lg bg-primary text-on-primary text-xs">Quarterly</button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
          <Bar dataKey="revenue" fill="#00355f" name="Revenue" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" fill="#006b5f" name="Expenses" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}