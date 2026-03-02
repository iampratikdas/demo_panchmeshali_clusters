import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { value: 40 },
  { value: 30 },
  { value: 45 },
  { value: 35 },
  { value: 50 },
  { value: 42 },
  { value: 48 },
]

interface StatsCardProps {
  title: string
  value: string
  change: string
  changeType: "increase" | "decrease"
  chartData?: typeof data
  chartColor?: string
}

function StatsCard({ title, value, change, changeType, chartData = data, chartColor = "hsl(var(--primary))" }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          <span className={changeType === "increase" ? "text-green-500" : "text-red-500"}>
            {change}
          </span>
          <span className="ml-1">compare to last week</span>
        </div>
        <div className="h-[80px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Value
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {payload[0].value}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={chartColor}
                fill={`url(#gradient-${title})`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatsCard
        title="TOTAL SALES"
        value="$64,559.25"
        change="33.21%"
        changeType="increase"
        chartColor="hsl(var(--chart-1))"
      />
      <StatsCard
        title="CONVERSION RATE"
        value="2.19%"
        change="0.5%"
        changeType="decrease"
        chartColor="hsl(var(--chart-2))"
      />
      <StatsCard
        title="STORE SESSIONS"
        value="70,719"
        change="9.5%"
        changeType="increase"
        chartColor="hsl(var(--chart-3))"
      />
    </div>
  )
}
