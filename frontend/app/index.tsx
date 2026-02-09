import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../utils/api';

export default function Index() {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      checkAuthAndOnboarding();
    }
  }, [isLoading, token]);

  const checkAuthAndOnboarding = async () => {
    if (!token) {
      router.replace('/(auth)/login');
      return;
    }

    try {
      const status = await apiRequest('/api/onboarding/status');
      
      if (!status.onboarding_completed) {
        if (!status.identity_completed) {
          router.replace('/(onboarding)/welcome');
        } else if (!status.baseline_completed) {
          router.replace('/(onboarding)/baseline');
        }
      } else {
        router.replace('/(tabs)/dashboard');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      router.replace('/(onboarding)/welcome');
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
