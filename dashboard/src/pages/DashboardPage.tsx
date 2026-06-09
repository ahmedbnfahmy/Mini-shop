import { useEffect, useState } from 'react';
import { ShoppingCart, DollarSign, Package, TrendingUp } from 'lucide-react';
import { api } from '../services/api';

interface KPIData {
  ordersToday: number;
  revenue: number;
  activeProducts: number;
}

export function DashboardPage() {
  const [data, setData] = useState<KPIData>({ ordersToday: 0, revenue: 0, activeProducts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKPIs() {
      try {
        setLoading(true);
        // Note: In a real app, you might have a dedicated /dashboard/kpis endpoint
        // For now, we fetch orders and products to calculate KPIs.
        
        const [ordersRes, productsRes] = await Promise.all([
          api.get('/orders?limit=100'),
          api.get('/products?limit=1') // We just need the total count from pagination
        ]);

        const today = new Date().toISOString().split('T')[0];
        
        const ordersToday = ordersRes.orders.filter((o: any) => o.created_at.startsWith(today)).length;
        const totalRevenue = ordersRes.orders
          .filter((o: any) => o.status !== 'cancelled')
          .reduce((sum: number, o: any) => sum + parseFloat(o.total_amount), 0);

        setData({
          ordersToday,
          revenue: totalRevenue,
          activeProducts: productsRes.pagination.total
        });
      } catch (err) {
        console.error('Failed to fetch KPIs', err);
      } finally {
        setLoading(false);
      }
    }

    fetchKPIs();
  }, []);

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
      title: 'Conversion Rate',
      value: '12.5%', // Mocked for design
      icon: TrendingUp,
      color: 'bg-amber-500',
    }
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
          <div key={kpi.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
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
      
      {/* Chart placeholder or recent orders could go here */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[300px] flex items-center justify-center text-gray-400">
        <p>Analytics charts will appear here</p>
      </div>
    </div>
  );
}
