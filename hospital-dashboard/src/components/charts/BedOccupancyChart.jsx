import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function BedOccupancyChart({ data }) {
  return (
    <div className="bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-on-surface">Bed Occupancy Trend</h3>
        <p className="text-sm text-on-surface-variant">Weekly average</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="occGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline)" opacity={0.4} />
          <XAxis dataKey="ward" stroke="var(--color-on-surface-variant)" fontSize={12} />
          <YAxis stroke="var(--color-on-surface-variant)" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-outline)',
              borderRadius: '8px',
              color: 'var(--color-on-surface)',
            }}
            formatter={(value, name) => [`${value} beds`, name === 'occupied' ? 'Occupied' : 'Total']}
          />
          <Area type="monotone" dataKey="occupied" stroke="var(--color-primary)" fill="url(#occGradient)" strokeWidth={2} name="occupied" />
          <Area type="monotone" dataKey="total" stroke="var(--color-secondary)" fill="none" strokeWidth={2} strokeDasharray="5 5" name="total" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
