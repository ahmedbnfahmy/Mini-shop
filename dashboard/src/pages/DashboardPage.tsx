import { useEffect, useMemo, useState } from 'react';
import { ShoppingCart, DollarSign, Package, BarChart3 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { api } from '../services/api';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
}

interface KPIData {
  ordersToday: number;
  revenue: number;
  activeProducts: number;
  totalOrders: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  completed: '#22c55e',
  cancelled: '#ef4444',
};

export function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [data, setData] = useState<KPIData>({
    ordersToday: 0,
    revenue: 0,
    activeProducts: 0,
    totalOrders: 0,
  });
  const [statusStats, setStatusStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKPIs() {
      try {
        setLoading(true);

        const [ordersRes, productsRes] = await Promise.all([
          api.get('/orders?limit=100'),
          api.get('/products?limit=1&include_inactive=true'),
        ]);

        const orderList: Order[] = ordersRes.orders;
        const today = new Date().toISOString().split('T')[0];

        const ordersToday = orderList.filter((o) =>
          o.created_at.startsWith(today)
        ).length;
        const totalRevenue = orderList
          .filter((o) => o.status !== 'cancelled')
          .reduce((sum, o) => sum + parseFloat(String(o.total_amount)), 0);

        setOrders(orderList);
        setStatusStats(ordersRes.stats ?? {});
        setData({
          ordersToday,
          revenue: totalRevenue,
          activeProducts: productsRes.stats?.active ?? productsRes.pagination.total,
          totalOrders: ordersRes.pagination.total,
        });
      } catch (err) {
        console.error('Failed to fetch KPIs', err);
      } finally {
        setLoading(false);
      }
    }

    fetchKPIs();
  }, []);

  const weeklyData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 6 - i));
      const key = format(date, 'yyyy-MM-dd');
      return {
        date: key,
        label: format(date, 'EEE'),
        orders: 0,
        revenue: 0,
      };
    });

    const dayMap = new Map(days.map((d) => [d.date, d]));

    orders.forEach((order) => {
      const key = order.created_at.split('T')[0];
      const day = dayMap.get(key);
      if (day) {
        day.orders += 1;
        if (order.status !== 'cancelled') {
          day.revenue += parseFloat(String(order.total_amount));
        }
      }
    });

    return days;
  }, [orders]);

  const statusChartData = useMemo(() => {
    return Object.entries(statusStats).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: STATUS_COLORS[status] ?? '#9ca3af',
    }));
  }, [statusStats]);

  const kpis = [
    {
      title: 'Orders Today',
      value: data.ordersToday,
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Revenue',
      value: `$${data.revenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Active Products',
      value: data.activeProducts,
      icon: Package,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Orders',
      value: data.totalOrders,
      icon: BarChart3,
      color: 'bg-amber-500',
    },
  ];

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
        <div className="h-80 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div
            key={kpi.title}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className={`${kpi.color} text-white p-4 rounded-lg flex-shrink-0`}>
              <kpi.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Orders & Revenue
          </h2>
          <p className="text-sm text-gray-500 mb-6">Last 7 days</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis yAxisId="left" allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '13px',
                  }}
                  formatter={(value, name) => {
                    if (name === 'revenue') return [`$${Number(value).toFixed(2)}`, 'Revenue'];
                    return [value, 'Orders'];
                  }}
                />
                <Bar yAxisId="left" dataKey="orders" name="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="revenue" name="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Order Status</h2>
          <p className="text-sm text-gray-500 mb-6">Breakdown by status</p>
          <div className="h-72">
            {statusChartData.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '13px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-sm text-gray-600">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No orders yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
