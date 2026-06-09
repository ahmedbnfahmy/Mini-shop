import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Pagination } from '../components/Pagination';
import { format } from 'date-fns';
import { Eye, X } from 'lucide-react';

const PAGE_SIZE = 10;

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  products?: { name: string; image_url?: string };
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  profiles?: { name: string; role: string };
  order_items?: OrderItem[];
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/orders?${params}`);
      setOrders(res.orders);
      setPagination(res.pagination);
      if (res.stats) setStats(res.stats);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalOrders = Object.values(stats).reduce((sum, n) => sum + n, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{stats.pending ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm text-gray-500">Processing</p>
          <p className="text-2xl font-bold text-blue-600">{stats.processing ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm text-gray-500">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">{stats.cancelled ?? 0}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-500">Filter by status</p>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:min-w-[180px]"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-gray-500">
                      #{order.id.split('-')[0]}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {order.profiles?.name || 'Unknown User'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {format(new Date(order.created_at), 'MMM d, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      ${parseFloat(String(order.total_amount)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-sm font-medium border rounded-md px-2 py-1 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusBadge(order.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                Order #{selectedOrder.id.split('-')[0]}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Customer</p>
                  <p className="font-medium text-gray-900">
                    {selectedOrder.profiles?.name || 'Unknown User'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(selectedOrder.created_at), 'MMM d, yyyy HH:mm')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <span
                    className={`inline-block mt-1 text-xs font-semibold border rounded-md px-2 py-1 capitalize ${getStatusBadge(selectedOrder.status)}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500">Total</p>
                  <p className="font-bold text-gray-900 text-lg">
                    ${parseFloat(String(selectedOrder.total_amount)).toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {selectedOrder.order_items?.length ? (
                    selectedOrder.order_items.map((item) => {
                      const lineTotal = item.quantity * parseFloat(String(item.unit_price));
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between px-4 py-3"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.products?.name || 'Unknown Product'}
                            </p>
                            <p className="text-sm text-gray-500">
                              ${parseFloat(String(item.unit_price)).toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            ${lineTotal.toFixed(2)}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="px-4 py-6 text-center text-gray-500 text-sm">
                      No items in this order.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
