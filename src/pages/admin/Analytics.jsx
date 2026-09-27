import { useEffect, useState } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Card, PageHeader, KpiStat, Skeleton, FadeIn } from '../../components/ui'
import * as api from '../../services/api'

const GREENS = ['#2F6B3F', '#7CB87F', '#B8862F', '#A64B3C', '#0F2419', '#9CA88F', '#D8E4D0', '#3A3F38']

export default function Analytics() {
  const [data, setData] = useState(null)
  useEffect(() => { api.getAdminDashboard().then(setData) }, [])
  if (!data) return <Skeleton className="h-96 w-full" />
  const k = data.kpis

  return (
    <div>
      <PageHeader eyebrow="Platform metrics" title="Analytics" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <FadeIn><Card><KpiStat label="Total Received" value={k.totalWeight} suffix="kg" /></Card></FadeIn>
        <FadeIn delay={0.04}><Card><KpiStat label="Total Transactions" value={k.totalTransactions} /></Card></FadeIn>
        <FadeIn delay={0.08}><Card><KpiStat label="Completed Lots" value={k.completedLots} /></Card></FadeIn>
        <FadeIn delay={0.12}><Card><KpiStat label="Avg Txn Value" value={`₹${Math.round(k.estimatedValue / Math.max(1, k.totalTransactions))}`} /></Card></FadeIn>
        <FadeIn delay={0.16}><Card><KpiStat label="Pending Payments" value={k.pendingPayments} /></Card></FadeIn>
        <FadeIn delay={0.2}><Card><KpiStat label="Est. Value" value={`₹${(k.estimatedValue / 1000).toFixed(1)}k`} /></Card></FadeIn>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 font-display text-sm font-semibold">Weight Trend</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.collectionTrend}>
              <CartesianGrid stroke="#D8E4D0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #D8E4D0' }} />
              <Line type="monotone" dataKey="value" stroke="#2F6B3F" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="mb-3 font-display text-sm font-semibold">Payment Status</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={[{ name: 'Paid', value: 70 }, { name: 'Pending', value: 30 }]} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75}>
                {GREENS.map((c, i) => <Cell key={i} fill={c} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #D8E4D0' }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card className="lg:col-span-2">
          <div className="mb-3 font-display text-sm font-semibold">Recycler Activity</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.transactionTrend}>
              <CartesianGrid stroke="#D8E4D0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #D8E4D0' }} />
              <Bar dataKey="value" fill="#7CB87F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}
