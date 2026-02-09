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

export default function Identity() {
  const [ageBand, setAgeBand] = useState('');
  const [country, setCountry] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [incomeBand, setIncomeBand] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!ageBand || !country || !employmentType || !incomeBand) {
      Alert.alert('Missing Information', 'Please complete all fields');
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/api/onboarding/identity', {
        method: 'POST',
        body: {
          age_band: ageBand,
          country,
          employment_type: employmentType,
          income_band: incomeBand,
        },
      });
      router.push('/(onboarding)/baseline');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save identity data');
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
        <Text style={styles.title}>About You</Text>
        <Text style={styles.subtitle}>We collect minimal data for context only</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Age Range</Text>
        <View style={styles.optionsGrid}>
          <SelectButton label="18-25" selected={ageBand === '18-25'} onPress={() => setAgeBand('18-25')} />
          <SelectButton label="26-35" selected={ageBand === '26-35'} onPress={() => setAgeBand('26-35')} />
          <SelectButton label="36-45" selected={ageBand === '36-45'} onPress={() => setAgeBand('36-45')} />
          <SelectButton label="46-55" selected={ageBand === '46-55'} onPress={() => setAgeBand('46-55')} />
          <SelectButton label="56+" selected={ageBand === '56+'} onPress={() => setAgeBand('56+')} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Country</Text>
        <View style={styles.optionsGrid}>
          <SelectButton label="India" selected={country === 'India'} onPress={() => setCountry('India')} />
          <SelectButton label="USA" selected={country === 'USA'} onPress={() => setCountry('USA')} />
          <SelectButton label="UK" selected={country === 'UK'} onPress={() => setCountry('UK')} />
          <SelectButton label="Other" selected={country === 'Other'} onPress={() => setCountry('Other')} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Employment</Text>
        <View style={styles.optionsGrid}>
          <SelectButton label="Employed" selected={employmentType === 'employed'} onPress={() => setEmploymentType('employed')} />
          <SelectButton label="Self-Employed" selected={employmentType === 'self_employed'} onPress={() => setEmploymentType('self_employed')} />
          <SelectButton label="Student" selected={employmentType === 'student'} onPress={() => setEmploymentType('student')} />
          <SelectButton label="Unemployed" selected={employmentType === 'unemployed'} onPress={() => setEmploymentType('unemployed')} />
          <SelectButton label="Retired" selected={employmentType === 'retired'} onPress={() => setEmploymentType('retired')} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Income Range (Annual)</Text>
        <View style={styles.optionsGrid}>
          <SelectButton label="0-25k" selected={incomeBand === '0-25k'} onPress={() => setIncomeBand('0-25k')} />
          <SelectButton label="25k-50k" selected={incomeBand === '25k-50k'} onPress={() => setIncomeBand('25k-50k')} />
          <SelectButton label="50k-100k" selected={incomeBand === '50k-100k'} onPress={() => setIncomeBand('50k-100k')} />
          <SelectButton label="100k+" selected={incomeBand === '100k+'} onPress={() => setIncomeBand('100k+')} />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Continue'}</Text>
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
    marginBottom: 12,
  },
  optionsGrid: {
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
