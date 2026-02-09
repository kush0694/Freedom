import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const MenuItem = ({ icon, title, subtitle, onPress, color = '#111827' }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, { color }]}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={40} color="#6366f1" />
        </View>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Freedom Score</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.principleRow}>
            <Ionicons name="shield-checkmark" size={20} color="#6366f1" />
            <View style={styles.principleContent}>
              <Text style={styles.principleTitle}>Privacy First</Text>
              <Text style={styles.principleText}>
                Your data is separated for maximum privacy. Identity and behavior data are stored independently.
              </Text>
            </View>
          </View>

          <View style={styles.principleRow}>
            <Ionicons name="time" size={20} color="#6366f1" />
            <View style={styles.principleContent}>
              <Text style={styles.principleTitle}>Long-Term Journey</Text>
              <Text style={styles.principleText}>
                This platform is designed for 10+ year financial stability, not quick wins.
              </Text>
            </View>
          </View>

          <View style={styles.principleRow}>
            <Ionicons name="heart" size={20} color="#6366f1" />
            <View style={styles.principleContent}>
              <Text style={styles.principleTitle}>Behavior Over Numbers</Text>
              <Text style={styles.principleText}>
                Your score reflects discipline and consistency, not wealth accumulation.
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="notifications"
            title="Notifications"
            subtitle="Manage check-in reminders"
            onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available soon')}
          />
          <MenuItem
            icon="lock-closed"
            title="Privacy & Data"
            subtitle="View how your data is used"
            onPress={() => Alert.alert('Privacy', 'Your data is stored with strict separation. Identity and behavior data are never merged in our database.')}
          />
          <MenuItem
            icon="information-circle"
            title="About"
            subtitle="Learn more about Freedom Score"
            onPress={() => Alert.alert('Freedom Score v1.0', 'A behavior-based financial health platform designed for long-term stability.')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.menuCard}>
          <MenuItem
            icon="log-out"
            title="Logout"
            onPress={handleLogout}
            color="#ef4444"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Freedom Score v1.0</Text>
        <Text style={styles.footerText}>Built for financial durability, not virality</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  email: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  principleRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  principleContent: {
    flex: 1,
    marginLeft: 12,
  },
  principleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  principleText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
});
