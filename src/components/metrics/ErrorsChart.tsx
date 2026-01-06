import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts'

interface ErrorsChartProps {
    timeRange: '1h' | '6h' | '24h' | '7d' | '30d'
    errorCount: number
}

// Generate mock error data based on time range
function generateErrorData(timeRange: string, totalErrors: number): { time: string; errors: number; rate: number }[] {
    const now = new Date()
    const data: { time: string; errors: number; rate: number }[] = []

    let points: number
    let intervalMs: number
    let formatTime: (date: Date) => string

    switch (timeRange) {
        case '1h':
            points = 12
            intervalMs = 5 * 60 * 1000
            formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            break
        case '6h':
            points = 12
            intervalMs = 30 * 60 * 1000
            formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            break
        case '24h':
            points = 24
            intervalMs = 60 * 60 * 1000
            formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            break
        case '7d':
            points = 7
            intervalMs = 24 * 60 * 60 * 1000
            formatTime = (d) => d.toLocaleDateString([], { weekday: 'short' })
            break
        case '30d':
            points = 30
            intervalMs = 24 * 60 * 60 * 1000
            formatTime = (d) => d.toLocaleDateString([], { month: 'short', day: 'numeric' })
            break
        default:
            points = 24
            intervalMs = 60 * 60 * 1000
            formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const baseErrors = totalErrors / points

    for (let i = points - 1; i >= 0; i--) {
        const time = new Date(now.getTime() - i * intervalMs)
        // Simulate occasional error spikes
        const spikeChance = Math.random()
        const multiplier = spikeChance > 0.9 ? 3 : spikeChance > 0.8 ? 1.5 : 1
        const errors = Math.floor(baseErrors * multiplier * (0.5 + Math.random()))
        const rate = (errors / 50000) * 100 // Assuming 50K requests per interval

        data.push({
            time: formatTime(time),
            errors,
            rate: Math.min(rate, 5), // Cap at 5% for visualization
        })
    }

    return data
}

export function ErrorsChart({ timeRange, errorCount }: ErrorsChartProps): React.ReactNode {
    const data = generateErrorData(timeRange, errorCount)

    return (
        <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                        dataKey="time"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        className="text-muted-foreground"
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value: number) => `${value.toFixed(1)}%`}
                        domain={[0, 'auto']}
                        className="text-muted-foreground"
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                        }}
                        formatter={(value, name) => [
                            name === 'rate' ? `${(value as number ?? 0).toFixed(2)}%` : (value as number ?? 0).toLocaleString(),
                            name === 'rate' ? 'Error Rate' : 'Errors'
                        ]}
                    />
                    <ReferenceLine
                        y={1}
                        stroke="hsl(48, 96%, 53%)"
                        strokeDasharray="5 5"
                        label={{ value: 'Warning (1%)', position: 'right', fontSize: 10, fill: 'hsl(48, 96%, 53%)' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="hsl(0, 84%, 60%)"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(0, 84%, 60%)', r: 3 }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
