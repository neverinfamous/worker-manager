import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts'

interface LatencyChartProps {
    p50: number
    p90: number
    p99: number
}

export function LatencyChart({ p50, p90, p99 }: LatencyChartProps): React.ReactNode {
    const data = [
        { name: 'P50', value: p50, description: '50% of requests' },
        { name: 'P90', value: p90, description: '90% of requests' },
        { name: 'P99', value: p99, description: '99% of requests' },
    ]

    const colors = [
        'hsl(142, 76%, 36%)', // green for p50
        'hsl(48, 96%, 53%)',  // yellow for p90
        'hsl(0, 84%, 60%)',   // red for p99
    ]

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        className="text-muted-foreground"
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value: number) => String(value) + 'ms'}
                        className="text-muted-foreground"
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                        }}
                        formatter={(value) => [(value as number ?? 0).toFixed(1) + 'ms', 'Duration']}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {data.map((_entry, index) => (
                            <Cell key={`cell-${String(index)}`} fill={colors[index]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
