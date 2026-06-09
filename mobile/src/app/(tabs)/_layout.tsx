import { Tabs } from 'expo-router';
import { ShoppingBag, ShoppingCart, Clock, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartStore } from '../../../store/cartStore';
import { View, Text, useWindowDimensions } from 'react-native';

const TAB_BAR_HEIGHT = 52;
const COMPACT_WIDTH = 400;

export default function TabLayout() {
  const { getTotals } = useCartStore();
  const { itemsCount } = getTotals();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < COMPACT_WIDTH;
  const bottomPadding = Math.max(insets.bottom, isCompact ? 6 : 8);
  const iconSize = isCompact ? 22 : 24;
  const tabBarHeight = (isCompact ? 44 : TAB_BAR_HEIGHT) + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarShowLabel: !isCompact,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
          marginBottom: 0,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: tabBarHeight,
          paddingBottom: bottomPadding,
          paddingTop: isCompact ? 6 : 8,
          paddingHorizontal: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color }) => <ShoppingBag size={iconSize} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color }) => (
            <View>
              <ShoppingCart size={iconSize} color={color} />
              {itemsCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    right: -6,
                    top: -6,
                    backgroundColor: '#ef4444',
                    borderRadius: 10,
                    width: 18,
                    height: 18,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                    {itemsCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <Clock size={iconSize} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={iconSize} color={color} />,
        }}
      />
    </Tabs>
  );
}
