import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const labels = ["January", "February", "March", "April", "May", "June"]

export function DashboardCharts() {
  const lineChartData = {
    labels,
    datasets: [
      {
        label: "Stories Submitted",
        data: [65, 59, 80, 81, 56, 55],
        borderColor: "hsl(var(--chart-1))",
        backgroundColor: "hsl(var(--chart-1) / 0.5)",
      },
    ],
  }

  const barChartData = {
    labels,
    datasets: [
      {
        label: "Stories Approved",
        data: [45, 52, 68, 74, 43, 50],
        backgroundColor: "hsl(var(--chart-2))",
      },
    ],
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Story Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Line data={lineChartData} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Approval Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar data={barChartData} />
        </CardContent>
      </Card>
    </div>
  )
}
