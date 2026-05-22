import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AppointmentTrendsChart({ data }) {
  return (
    <div className="bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-on-surface">Appointment Trends</h3>
        <p className="text-sm text-on-surface-variant">By department and status</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline)" opacity={0.4} />
          <XAxis dataKey="department" stroke="var(--color-on-surface-variant)" fontSize={12} />
          <YAxis stroke="var(--color-on-surface-variant)" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-outline)',
              borderRadius: '8px',
              color: 'var(--color-on-surface)',
            }}
          />
          <Legend wrapperStyle={{ color: 'var(--color-on-surface-variant)' }} />
          <Bar dataKey="confirmed" stackId="a" fill="var(--color-primary)" name="Confirmed" />
          <Bar dataKey="pending" stackId="a" fill="var(--color-on-surface-variant)" name="Pending" />
          <Bar dataKey="completed" stackId="a" fill="var(--color-secondary)" name="Completed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
