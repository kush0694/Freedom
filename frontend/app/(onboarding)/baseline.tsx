import React, { useState } from 'react';
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
import { apiRequest } from '../../utils/api';

export default function Baseline() {
  const [obligationsRange, setObligationsRange] = useState('');
  const [spendingRange, setSpendingRange] = useState('');
  const [savingsHabit, setSavingsHabit] = useState<boolean | null>(null);
  const [investmentHabit, setInvestmentHabit] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!obligationsRange || !spendingRange || savingsHabit === null || investmentHabit === null) {
      Alert.alert('Missing Information', 'Please complete all fields');
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/api/onboarding/baseline', {
        method: 'POST',
        body: {
          obligations_range: obligationsRange,
          spending_range: spendingRange,
          savings_habit: savingsHabit,
          investment_habit: investmentHabit,
        },
      });
      router.push('/(onboarding)/complete');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save baseline data');
    } finally {
      setLoading(false);
    }
  };

  const SelectButton = ({ label, selected, onPress }: any) => (
    <TouchableOpacity
      style={[styles.selectButton, selected && styles.selectButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.selectButtonText, selected && styles.selectButtonTextActive]}>
        {label}
      </Text>
      {selected && <Ionicons name="checkmark-circle" size={20} color="#6366f1" />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Financial Snapshot</Text>
        <Text style={styles.subtitle}>One-time baseline to understand your context</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Fixed Monthly Obligations</Text>
        <Text style={styles.hint}>Rent, EMI, bills, etc.</Text>
        <View style={styles.optionsGrid}>
          <SelectButton label="0-10k" selected={obligationsRange === '0-10k'} onPress={() => setObligationsRange('0-10k')} />
          <SelectButton label="10k-25k" selected={obligationsRange === '10k-25k'} onPress={() => setObligationsRange('10k-25k')} />
          <SelectButton label="25k-50k" selected={obligationsRange === '25k-50k'} onPress={() => setObligationsRange('25k-50k')} />
          <SelectButton label="50k+" selected={obligationsRange === '50k+'} onPress={() => setObligationsRange('50k+')} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Typical Monthly Spending</Text>
        <View style={styles.optionsGrid}>
          <SelectButton label="Low" selected={spendingRange === 'low'} onPress={() => setSpendingRange('low')} />
          <SelectButton label="Medium" selected={spendingRange === 'medium'} onPress={() => setSpendingRange('medium')} />
          <SelectButton label="High" selected={spendingRange === 'high'} onPress={() => setSpendingRange('high')} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Do you have a savings habit?</Text>
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={[styles.yesNoButton, savingsHabit === true && styles.yesNoButtonActive]}
            onPress={() => setSavingsHabit(true)}
          >
            <Ionicons name="checkmark-circle" size={24} color={savingsHabit === true ? '#6366f1' : '#9ca3af'} />
            <Text style={[styles.yesNoText, savingsHabit === true && styles.yesNoTextActive]}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.yesNoButton, savingsHabit === false && styles.yesNoButtonActive]}
            onPress={() => setSavingsHabit(false)}
          >
            <Ionicons name="close-circle" size={24} color={savingsHabit === false ? '#6366f1' : '#9ca3af'} />
            <Text style={[styles.yesNoText, savingsHabit === false && styles.yesNoTextActive]}>No</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Do you invest regularly?</Text>
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={[styles.yesNoButton, investmentHabit === true && styles.yesNoButtonActive]}
            onPress={() => setInvestmentHabit(true)}
          >
            <Ionicons name="checkmark-circle" size={24} color={investmentHabit === true ? '#6366f1' : '#9ca3af'} />
            <Text style={[styles.yesNoText, investmentHabit === true && styles.yesNoTextActive]}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.yesNoButton, investmentHabit === false && styles.yesNoButtonActive]}
            onPress={() => setInvestmentHabit(false)}
          >
            <Ionicons name="close-circle" size={24} color={investmentHabit === false ? '#6366f1' : '#9ca3af'} />
            <Text style={[styles.yesNoText, investmentHabit === false && styles.yesNoTextActive]}>No</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Complete Setup'}</Text>
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
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 12,
  },
  optionsGrid: {
    gap: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
  },
  selectButtonActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  selectButtonTextActive: {
    color: '#6366f1',
    fontWeight: '600',
  },
  yesNoButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
  },
  yesNoButtonActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  yesNoText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  yesNoTextActive: {
    color: '#6366f1',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#6366f1',
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
