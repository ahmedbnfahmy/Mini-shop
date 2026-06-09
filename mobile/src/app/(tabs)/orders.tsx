import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { api } from '../../../services/api';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/my');
      setOrders(res.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: '#fef3c7', text: '#92400e' };
      case 'processing':
        return { bg: '#dbeafe', text: '#1e40af' };
      case 'completed':
        return { bg: '#d1fae5', text: '#065f46' };
      case 'cancelled':
        return { bg: '#fee2e2', text: '#b91c1c' };
      default:
        return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const openOrderDetail = (order: any) => {
    router.push({
      pathname: '/order-detail',
      params: { order: JSON.stringify(order) },
    });
  };

  const renderItem = ({ item }: { item: any }) => {
    const statusColors = getStatusColor(item.status);
    const itemCount = item.order_items?.length ?? 0;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => openOrderDetail(item)}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <Text style={styles.orderId}>Order #{item.id.split('-')[0]}</Text>
          <View style={[styles.badge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.badgeText, { color: statusColors.text }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.details}>
          <Text style={styles.date}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
          <Text style={styles.total}>
            ${parseFloat(item.total_amount).toFixed(2)}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.tapHint}>
            {itemCount} item{itemCount !== 1 ? 's' : ''} · Tap for details
          </Text>
          <ChevronRight size={18} color="#9ca3af" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>
                You haven't placed any orders yet.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
  },
  total: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tapHint: {
    fontSize: 13,
    color: '#6b7280',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
  },
});
