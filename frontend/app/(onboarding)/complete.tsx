import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

export default function Complete() {
  const router = useRouter();

  useEffect(() => {
    scheduleMonthlyReminder();
  }, []);

  const scheduleMonthlyReminder = async () => {
    try {
      // Schedule a monthly notification reminder
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Monthly Check-in Time',
          body: "It's time for your 60-second Freedom Score check-in",
          sound: true,
        },
        trigger: {
          day: 1, // First day of every month
          hour: 10,
          minute: 0,
          repeats: true,
        },
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={100} color="#10b981" />
        </View>
        
        <Text style={styles.title}>You're All Set!</Text>
        <Text style={styles.message}>
          Your Freedom Score has been calculated and your journey begins now.
        </Text>

        <View style={styles.infoCard}>
          <Ionicons name="calendar" size={24} color="#6366f1" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Monthly Check-ins</Text>
            <Text style={styles.infoDesc}>
              We'll remind you on the 1st of every month to complete your 60-second check-in
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="trending-up" size={24} color="#6366f1" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Slow & Steady</Text>
            <Text style={styles.infoDesc}>
              Your score will change gradually based on consistent behavior, not dramatic moves
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/(tabs)/dashboard')}
        >
          <Text style={styles.buttonText}>View My Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 48,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    marginLeft: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  button: {
    backgroundColor: '#6366f1',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
