import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-gifted-charts';
import { apiRequest } from '../../utils/api';
import { format } from 'date-fns';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentScore, setCurrentScore] = useState<any>(null);
  const [scoreHistory, setScoreHistory] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [score, history, streakData] = await Promise.all([
        apiRequest('/api/score/current'),
        apiRequest('/api/score/history'),
        apiRequest('/api/stats/streak'),
      ]);

      setCurrentScore(score);
      setScoreHistory(history);
      setStreak(streakData.streak);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!currentScore) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>No score data available</Text>
      </View>
    );
  }

  const chartData = scoreHistory
    .slice()
    .reverse()
    .map((item) => ({
      value: item.score,
      label: format(new Date(item.calculated_at), 'MMM'),
    }));

  const getTrendIcon = () => {
    if (currentScore.trend === 'up') return 'trending-up';
    if (currentScore.trend === 'down') return 'trending-down';
    return 'remove';
  };

  const getTrendColor = () => {
    if (currentScore.trend === 'up') return '#10b981';
    if (currentScore.trend === 'down') return '#ef4444';
    return '#6b7280';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Freedom Score</Text>
        <Text style={styles.headerSubtitle}>
          Updated {format(new Date(currentScore.calculated_at), 'MMM dd, yyyy')}
        </Text>
      </View>

      {/* Main Score Card */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreValue}>{currentScore.score}</Text>
          <Text style={styles.scoreRange}>300 - 900</Text>
        </View>
        <View style={styles.trendContainer}>
          <Ionicons name={getTrendIcon()} size={24} color={getTrendColor()} />
          <Text style={[styles.trendText, { color: getTrendColor() }]}>
            {currentScore.trend === 'up' ? 'Improving' : currentScore.trend === 'down' ? 'Declining' : 'Stable'}
          </Text>
        </View>
      </View>

      {/* Insight Card */}
      {currentScore.insight && (
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="bulb" size={20} color="#f59e0b" />
            <Text style={styles.insightTitle}>Monthly Insight</Text>
          </View>
          <Text style={styles.insightText}>{currentScore.insight}</Text>
        </View>
      )}

      {/* Consistency Streak */}
      <View style={styles.streakCard}>
        <View style={styles.streakIcon}>
          <Ionicons name="flame" size={32} color="#f97316" />
        </View>
        <View style={styles.streakContent}>
          <Text style={styles.streakValue}>{streak} Month{streak !== 1 ? 's' : ''}</Text>
          <Text style={styles.streakLabel}>Consistency Streak</Text>
        </View>
      </View>

      {/* Dimensions Breakdown */}
      <View style={styles.dimensionsCard}>
        <Text style={styles.sectionTitle}>Score Dimensions</Text>
        
        <DimensionBar
          label="Stability"
          value={currentScore.dimensions.stability}
          color="#3b82f6"
        />
        <DimensionBar
          label="Discipline"
          value={currentScore.dimensions.discipline}
          color="#8b5cf6"
        />
        <DimensionBar
          label="Resilience"
          value={currentScore.dimensions.resilience}
          color="#10b981"
        />
        <DimensionBar
          label="Optionality"
          value={currentScore.dimensions.optionality}
          color="#f59e0b"
        />
        <DimensionBar
          label="Time Horizon"
          value={currentScore.dimensions.time_horizon}
          color="#ec4899"
        />
      </View>

      {/* Score History Chart */}
      {chartData.length > 1 && (
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Score Trend</Text>
          <LineChart
            data={chartData}
            width={320}
            height={200}
            color="#6366f1"
            thickness={3}
            startFillColor="rgba(99, 102, 241, 0.3)"
            endFillColor="rgba(99, 102, 241, 0.01)"
            startOpacity={0.9}
            endOpacity={0.2}
            initialSpacing={20}
            noOfSections={4}
            yAxisColor="#e5e7eb"
            xAxisColor="#e5e7eb"
            yAxisTextStyle={{ color: '#6b7280', fontSize: 10 }}
            xAxisLabelTextStyle={{ color: '#6b7280', fontSize: 10 }}
            curved
            areaChart
          />
        </View>
      )}
    </ScrollView>
  );
}

const DimensionBar = ({ label, value, color }: any) => (
  <View style={styles.dimensionRow}>
    <Text style={styles.dimensionLabel}>{label}</Text>
    <View style={styles.dimensionBarContainer}>
      <View style={[styles.dimensionBarFill, { width: `${value}%`, backgroundColor: color }]} />
    </View>
    <Text style={styles.dimensionValue}>{value.toFixed(1)}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scoreCircle: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  scoreRange: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendText: {
    fontSize: 16,
    fontWeight: '600',
  },
  insightCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
  },
  insightText: {
    fontSize: 14,
    color: '#78350f',
  },
  streakCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  streakIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#fff7ed',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  streakContent: {
    flex: 1,
  },
  streakValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  streakLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  dimensionsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  dimensionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dimensionLabel: {
    width: 90,
    fontSize: 14,
    color: '#6b7280',
  },
  dimensionBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  dimensionBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  dimensionValue: {
    width: 40,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'right',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});
