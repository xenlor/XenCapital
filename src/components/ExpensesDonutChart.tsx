'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface ExpenseData {
    name: string
    value: number
    color: string
}

interface ExpensesDonutChartProps {
    data: ExpenseData[]
}

export function ExpensesDonutChart({ data }: ExpensesDonutChartProps) {
    if (data.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-muted">
                <p>No hay datos de gastos para mostrar</p>
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.1)" />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.8)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: '#fff'
                    }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value) => `€${(value as number).toFixed(2)}`}
                />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-sm text-muted ml-1">{value}</span>}
                />
            </PieChart>
        </ResponsiveContainer>
    )
}
