import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../../utils/api';

export default function Checkin() {
  const [canSubmit, setCanSubmit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [latestCheckin, setLatestCheckin] = useState<any>(null);
  
  const [incomeStatus, setIncomeStatus] = useState('');
  const [spendingDiscipline, setSpendingDiscipline] = useState('');
  const [savingsDone, setSavingsDone] = useState<boolean | null>(null);
  const [stressLevel, setStressLevel] = useState('');

  useEffect(() => {
    checkSubmissionStatus();
  }, []);

  const checkSubmissionStatus = async () => {
    try {
      const [status, latest] = await Promise.all([
        apiRequest('/api/checkin/can_submit'),
        apiRequest('/api/checkin/latest'),
      ]);
      
      setCanSubmit(status.can_submit);
      setLatestCheckin(latest);
    } catch (error) {
      console.error('Error checking submission status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!incomeStatus || !spendingDiscipline || savingsDone === null || !stressLevel) {
      Alert.alert('Incomplete', 'Please answer all questions');
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest('/api/checkin/submit', {
        method: 'POST',
        body: {
          income_status: incomeStatus,
          spending_discipline: spendingDiscipline,
          savings_done: savingsDone,
          stress_level: stressLevel,
        },
      });

      Alert.alert(
        'Check-in Complete!',
        'Your Freedom Score has been updated',
        [{ text: 'OK', onPress: () => checkSubmissionStatus() }]
      );

      // Reset form
      setIncomeStatus('');
      setSpendingDiscipline('');
      setSavingsDone(null);
      setStressLevel('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit check-in');
    } finally {
      setSubmitting(false);
    }
  };

  const OptionButton = ({ icon, label, selected, onPress, color = '#6366f1' }: any) => (
    <TouchableOpacity
      style={[styles.optionButton, selected && { ...styles.optionButtonActive, borderColor: color }]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={32}
        color={selected ? color : '#9ca3af'}
      />
      <Text style={[styles.optionLabel, selected && { color }]}>{label}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!canSubmit) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.completedContent}>
          <View style={styles.completedIcon}>
            <Ionicons name="checkmark-circle" size={80} color="#10b981" />
          </View>
          <Text style={styles.completedTitle}>All Caught Up!</Text>
          <Text style={styles.completedMessage}>
            You've already completed this month's check-in. Come back next month!
          </Text>
          
          {latestCheckin && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Last Check-in Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Income:</Text>
                <Text style={styles.summaryValue}>
                  {latestCheckin.income_status === 'same' ? 'Same' : latestCheckin.income_status === 'higher' ? 'Higher' : 'Lower'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Spending:</Text>
                <Text style={styles.summaryValue}>
                  {latestCheckin.spending_discipline === 'on_track' ? 'On Track' : latestCheckin.spending_discipline === 'slightly_over' ? 'Slightly Over' : 'Way Over'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Savings:</Text>
                <Text style={styles.summaryValue}>
                  {latestCheckin.savings_done ? 'Yes' : 'No'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Stress:</Text>
                <Text style={styles.summaryValue}>
                  {latestCheckin.stress_level === 'none' ? 'None' : latestCheckin.stress_level === 'minor' ? 'Minor' : 'Heavy'}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Monthly Check-in</Text>
        <Text style={styles.subtitle}>60 seconds to update your score</Text>
      </View>

      {/* Question 1: Income Status */}
      <View style={styles.question}>
        <Text style={styles.questionTitle}>How was your income this month?</Text>
        <View style={styles.optionsRow}>
          <OptionButton
            icon="arrow-down"
            label="Lower"
            selected={incomeStatus === 'lower'}
            onPress={() => setIncomeStatus('lower')}
            color="#ef4444"
          />
          <OptionButton
            icon="remove"
            label="Same"
            selected={incomeStatus === 'same'}
            onPress={() => setIncomeStatus('same')}
            color="#6366f1"
          />
          <OptionButton
            icon="arrow-up"
            label="Higher"
            selected={incomeStatus === 'higher'}
            onPress={() => setIncomeStatus('higher')}
            color="#10b981"
          />
        </View>
      </View>

      {/* Question 2: Spending Discipline */}
      <View style={styles.question}>
        <Text style={styles.questionTitle}>How was your spending discipline?</Text>
        <View style={styles.optionsRow}>
          <OptionButton
            icon="checkmark-circle"
            label="On Track"
            selected={spendingDiscipline === 'on_track'}
            onPress={() => setSpendingDiscipline('on_track')}
            color="#10b981"
          />
          <OptionButton
            icon="warning"
            label="Slightly Over"
            selected={spendingDiscipline === 'slightly_over'}
            onPress={() => setSpendingDiscipline('slightly_over')}
            color="#f59e0b"
          />
          <OptionButton
            icon="close-circle"
            label="Way Over"
            selected={spendingDiscipline === 'way_over'}
            onPress={() => setSpendingDiscipline('way_over')}
            color="#ef4444"
          />
        </View>
      </View>

      {/* Question 3: Savings */}
      <View style={styles.question}>
        <Text style={styles.questionTitle}>Did you save or invest this month?</Text>
        <View style={styles.optionsRow}>
          <OptionButton
            icon="checkmark-circle"
            label="Yes"
            selected={savingsDone === true}
            onPress={() => setSavingsDone(true)}
            color="#10b981"
          />
          <OptionButton
            icon="close-circle"
            label="No"
            selected={savingsDone === false}
            onPress={() => setSavingsDone(false)}
            color="#ef4444"
          />
        </View>
      </View>

      {/* Question 4: Stress Level */}
      <View style={styles.question}>
        <Text style={styles.questionTitle}>Financial stress level?</Text>
        <View style={styles.optionsRow}>
          <OptionButton
            icon="happy"
            label="None"
            selected={stressLevel === 'none'}
            onPress={() => setStressLevel('none')}
            color="#10b981"
          />
          <OptionButton
            icon="sad"
            label="Minor"
            selected={stressLevel === 'minor'}
            onPress={() => setStressLevel('minor')}
            color="#f59e0b"
          />
          <OptionButton
            icon="alert-circle"
            label="Heavy"
            selected={stressLevel === 'heavy'}
            onPress={() => setStressLevel('heavy')}
            color="#ef4444"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitButtonText}>
          {submitting ? 'Submitting...' : 'Submit Check-in'}
        </Text>
        <Ionicons name="checkmark" size={20} color="#fff" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedContent: {
    padding: 24,
    paddingTop: 100,
    alignItems: 'center',
  },
  completedIcon: {
    marginBottom: 24,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  completedMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
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
  question: {
    marginBottom: 32,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  optionButtonActive: {
    backgroundColor: '#f9fafb',
  },
  optionLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 8,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
