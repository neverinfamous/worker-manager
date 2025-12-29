import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'

interface RequestsChartProps {
    timeRange: '1h' | '6h' | '24h' | '7d' | '30d'
}

// Generate mock data based on time range
function generateData(timeRange: string): { time: string; requests: number }[] {
    const now = new Date()
    const data: { time: string; requests: number }[] = []

    let points: number
    let intervalMs: number
    let formatTime: (date: Date) => string

    switch (timeRange) {
        case '1h':
            points = 12
            intervalMs = 5 * 60 * 1000 // 5 minutes
            formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            break
        case '6h':
            points = 12
            intervalMs = 30 * 60 * 1000 // 30 minutes
            formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            break
        case '24h':
            points = 24
            intervalMs = 60 * 60 * 1000 // 1 hour
            formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            break
        case '7d':
            points = 7
            intervalMs = 24 * 60 * 60 * 1000 // 1 day
            formatTime = (d) => d.toLocaleDateString([], { weekday: 'short' })
            break
        case '30d':
            points = 30
            intervalMs = 24 * 60 * 60 * 1000 // 1 day
            formatTime = (d) => d.toLocaleDateString([], { month: 'short', day: 'numeric' })
            break
        default:
            points = 24
            intervalMs = 60 * 60 * 1000
            formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    for (let i = points - 1; i >= 0; i--) {
        const time = new Date(now.getTime() - i * intervalMs)
        // Generate realistic-looking traffic pattern (higher during day, lower at night)
        const hour = time.getHours()
        const baseTraffic = 50000
        const dayMultiplier = hour >= 9 && hour <= 17 ? 1.5 : hour >= 6 && hour <= 21 ? 1.2 : 0.7
        const randomVariation = 0.8 + Math.random() * 0.4

        data.push({
            time: formatTime(time),
            requests: Math.floor(baseTraffic * dayMultiplier * randomVariation),
        })
    }

    return data
}

export function RequestsChart({ timeRange }: RequestsChartProps): React.ReactNode {
    const data = generateData(timeRange)

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="requestsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                    </defs>
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
                        tickFormatter={(value: number) => {
                            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                            if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
                            return String(value)
                        }}
                        className="text-muted-foreground"
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                        }}
                        formatter={(value: number) => [value.toLocaleString(), 'Requests']}
                    />
                    <Area
                        type="monotone"
                        dataKey="requests"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#requestsGradient)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
