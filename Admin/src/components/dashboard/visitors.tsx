import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { name: "Jan 12", visitors: 20, views: 35 },
  { name: "Jan 13", visitors: 25, views: 45 },
  { name: "Jan 14", visitors: 22, views: 38 },
  { name: "Jan 15", visitors: 30, views: 50 },
  { name: "Jan 16", visitors: 28, views: 45 },
  { name: "Jan 17", visitors: 35, views: 55 },
  { name: "Jan 18", visitors: 32, views: 48 },
]

const stats = [
  {
    title: "New Visitors",
    value: "127.1K",
    change: "25.5%",
    period: "from previous 7 days"
  },
  {
    title: "Returning Visitors",
    value: "179.9K",
    change: "23.3%",
    period: "from previous 7 days"
  },
  {
    title: "Total Page Views",
    value: "766.8K",
    change: "23.3%",
    period: "from previous 7 days"
  }
]

export function VisitorsAnalytics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">VISITORS ANALYTICS</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          {stats.map((stat) => (
            <div key={stat.title} className="space-y-2">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
              <div className="flex items-center text-xs">
                <span className="text-green-500">{stat.change}</span>
                <span className="ml-1 text-muted-foreground">{stat.period}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Visitors
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {payload[0].value}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Views
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {payload[1].value}
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
                dataKey="visitors"
                stroke="hsl(var(--chart-1))"
                fill="url(#colorVisitors)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="hsl(var(--chart-2))"
                fill="url(#colorViews)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
