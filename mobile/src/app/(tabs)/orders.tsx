import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronRight, Package } from 'lucide-react-native';
import { api } from '../../../services/api';

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

const MAX_VISIBLE_ITEMS = 2;

function truncate(text: string, max = 72) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}...`;
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

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const res = await api.get('/orders/my');
      setOrders(res.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const openOrderDetail = (order: Order) => {
    router.push({
      pathname: '/order-detail',
      params: { id: order.id },
    });
  };

  const renderOrderItem = (item: OrderItem, index: number) => {
    const product = item.products;
    const lineTotal = item.quantity * parseFloat(String(item.unit_price));

    return (
      <View key={`${product?.name ?? 'item'}-${index}`} style={styles.itemRow}>
        {product?.image_url ? (
          <Image source={{ uri: product.image_url }} style={styles.itemImage} />
        ) : (
          <View style={styles.itemImagePlaceholder}>
            <Package size={20} color="#9ca3af" />
          </View>
        )}
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>
            {product?.name || 'Unknown Product'}
          </Text>
          {product?.description ? (
            <Text style={styles.itemDescription} numberOfLines={2}>
              {truncate(product.description)}
            </Text>
          ) : null}
          <Text style={styles.itemMeta}>
            Qty {item.quantity} · ${lineTotal.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: { item: Order }) => {
    const statusColors = getStatusColor(item.status);
    const orderItems = item.order_items ?? [];
    const visibleItems = orderItems.slice(0, MAX_VISIBLE_ITEMS);
    const hiddenCount = Math.max(orderItems.length - MAX_VISIBLE_ITEMS, 0);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => openOrderDetail(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderId}>Order #{item.id.split('-')[0]}</Text>
            <Text style={styles.date}>
              {new Date(item.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.badgeText, { color: statusColors.text }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.itemsSection}>
          {visibleItems.length > 0 ? (
            visibleItems.map((orderItem, index) => renderOrderItem(orderItem, index))
          ) : (
            <View style={styles.emptyItems}>
              <Package size={20} color="#9ca3af" />
              <Text style={styles.emptyItemsText}>No items in this order</Text>
            </View>
          )}
          {hiddenCount > 0 && (
            <Text style={styles.moreItemsText}>
              +{hiddenCount} more item{hiddenCount !== 1 ? 's' : ''}
            </Text>
          )}
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.totalLabel}>Order Total</Text>
            <Text style={styles.total}>
              ${parseFloat(String(item.total_amount)).toFixed(2)}
            </Text>
          </View>
          <View style={styles.viewDetails}>
            <Text style={styles.viewDetailsText}>View details</Text>
            <ChevronRight size={18} color="#2563eb" />
          </View>
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchOrders(true)}
              tintColor="#2563eb"
            />
          }
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
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: '#6b7280',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  itemsSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },
  itemImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    minHeight: 64,
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
    fontSize: 12,
    fontWeight: '500',
    color: '#2563eb',
  },
  moreItemsText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    paddingBottom: 4,
  },
  emptyItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  emptyItemsText: {
    fontSize: 14,
    color: '#6b7280',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 8,
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  totalLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  total: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
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
