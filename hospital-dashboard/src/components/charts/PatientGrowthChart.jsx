import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function PatientGrowthChart({ data }) {
  return (
    <div className="bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-on-surface">Patient Growth</h3>
        <p className="text-sm text-on-surface-variant">Monthly admissions vs discharges</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline)" opacity={0.4} />
          <XAxis dataKey="month" stroke="var(--color-on-surface-variant)" fontSize={12} />
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
          <Line type="monotone" dataKey="admissions" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 4 }} name="Admissions" />
          <Line type="monotone" dataKey="discharges" stroke="var(--color-secondary)" strokeWidth={2} dot={{ r: 4 }} name="Discharges" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
