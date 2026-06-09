import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Package } from 'lucide-react-native';
import { api } from '../../services/api';

interface OrderItem {
  quantity: number;
  unit_price: number;
  products?: {
    name: string;
    description?: string;
    image_url?: string;
    price?: number;
  };
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_items?: OrderItem[];
}

function getStatusColor(status: string) {
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
}

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setNotFound(false);
      const res = await api.get('/orders/my');
      const found = res.orders.find((o: Order) => o.id === id) ?? null;
      setOrder(found);
      setNotFound(!found);
    } catch (err) {
      console.error(err);
      setOrder(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchOrder();
    }, [fetchOrder])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  if (!order || notFound) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Order not found.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusColors = getStatusColor(order.status);
  const shortId = order.id.split('-')[0];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.backIcon} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.orderId}>Order #{shortId}</Text>
            <View style={[styles.badge, { backgroundColor: statusColors.bg }]}>
              <Text style={[styles.badgeText, { color: statusColors.text }]}>
                {order.status.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.date}>
            {new Date(order.created_at).toLocaleString()}
          </Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Order Total</Text>
            <Text style={styles.totalAmount}>
              ${parseFloat(String(order.total_amount)).toFixed(2)}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Items</Text>

        {order.order_items?.map((item, idx) => {
          const lineTotal = item.quantity * parseFloat(String(item.unit_price));
          return (
            <View key={idx} style={styles.itemCard}>
              <Image
                source={{
                  uri: item.products?.image_url || 'https://via.placeholder.com/64',
                }}
                style={styles.itemImage}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.products?.name || 'Unknown Product'}
                </Text>
                {item.products?.description ? (
                  <Text style={styles.itemDescription} numberOfLines={3}>
                    {item.products.description}
                  </Text>
                ) : null}
                <Text style={styles.itemMeta}>
                  ${parseFloat(String(item.unit_price)).toFixed(2)} × {item.quantity}
                </Text>
                <Text style={styles.itemTotal}>${lineTotal.toFixed(2)}</Text>
              </View>
            </View>
          );
        })}

        {(!order.order_items || order.order_items.length === 0) && (
          <View style={styles.emptyItems}>
            <Package size={32} color="#9ca3af" />
            <Text style={styles.emptyText}>No items in this order.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  totalLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2563eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 6,
  },
  itemMeta: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  emptyItems: {
    alignItems: 'center',
    padding: 32,
    gap: 8,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
