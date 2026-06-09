import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, ShoppingBag, Clock } from 'lucide-react-native';

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const { orderId, total, itemCount } = useLocalSearchParams<{
    orderId: string;
    total: string;
    itemCount: string;
  }>();

  const shortId = orderId?.split('-')[0] ?? '—';
  const formattedTotal = total ? `$${parseFloat(total).toFixed(2)}` : '$0.00';
  const items = itemCount ? `${itemCount} item${Number(itemCount) !== 1 ? 's' : ''}` : '';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <CheckCircle size={72} color="#16a34a" />
        </View>

        <Text style={styles.title}>Order Confirmed!</Text>
        <Text style={styles.subtitle}>
          Thank you for your purchase. Your order has been placed successfully.
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Order ID</Text>
            <Text style={styles.value}>#{shortId}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Items</Text>
            <Text style={styles.value}>{items}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Total</Text>
            <Text style={styles.totalValue}>{formattedTotal}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>PENDING</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.replace('/(tabs)/orders')}
        >
          <Clock size={20} color="#ffffff" />
          <Text style={styles.primaryBtnText}>View Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.replace('/(tabs)')}
        >
          <ShoppingBag size={20} color="#2563eb" />
          <Text style={styles.secondaryBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    maxWidth: 320,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2563eb',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
  statusBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#2563eb',
    height: 52,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  secondaryBtnText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
});
