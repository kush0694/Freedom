import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Welcome() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={80} color="#6366f1" />
        </View>
        <Text style={styles.title}>Welcome to Freedom Score</Text>
        <Text style={styles.subtitle}>Your journey to financial stability starts here</Text>
      </View>

      <View style={styles.philosophy}>
        <Text style={styles.sectionTitle}>Our Philosophy</Text>
        
        <View style={styles.principleCard}>
          <View style={styles.principleIcon}>
            <Ionicons name="trending-up" size={24} color="#6366f1" />
          </View>
          <View style={styles.principleText}>
            <Text style={styles.principleTitle}>Long-Term Thinking</Text>
            <Text style={styles.principleDesc}>This is a 10+ year journey, not a quick fix</Text>
          </View>
        </View>

        <View style={styles.principleCard}>
          <View style={styles.principleIcon}>
            <Ionicons name="lock-closed" size={24} color="#6366f1" />
          </View>
          <View style={styles.principleText}>
            <Text style={styles.principleTitle}>Privacy First</Text>
            <Text style={styles.principleDesc}>Minimal data collection, maximum trust</Text>
          </View>
        </View>

        <View style={styles.principleCard}>
          <View style={styles.principleIcon}>
            <Ionicons name="heart" size={24} color="#6366f1" />
          </View>
          <View style={styles.principleText}>
            <Text style={styles.principleTitle}>Behavior Over Numbers</Text>
            <Text style={styles.principleDesc}>Discipline and consistency matter most</Text>
          </View>
        </View>

        <View style={styles.principleCard}>
          <View style={styles.principleIcon}>
            <Ionicons name="time" size={24} color="#6366f1" />
          </View>
          <View style={styles.principleText}>
            <Text style={styles.principleTitle}>Low Friction</Text>
            <Text style={styles.principleDesc}>Monthly 60-second check-ins, no daily logging</Text>
          </View>
        </View>
      </View>

      <View style={styles.expectations}>
        <Text style={styles.warningTitle}>What This Is NOT</Text>
        <Text style={styles.warningText}>• Not a get-rich-quick scheme</Text>
        <Text style={styles.warningText}>• Not trading or investment advice</Text>
        <Text style={styles.warningText}>• Not a social comparison platform</Text>
        <Text style={styles.warningText}>• Not about wealth accumulation</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(onboarding)/identity')}
      >
        <Text style={styles.buttonText}>Continue</Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  philosophy: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  principleCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  principleIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#eef2ff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  principleText: {
    flex: 1,
  },
  principleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  principleDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  expectations: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#991b1b',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#6366f1',
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
