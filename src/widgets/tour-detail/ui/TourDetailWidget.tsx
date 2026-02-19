import React from 'react';
import { View, ScrollView, Image, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Text } from '../../../shared/ui'; 
import { useTourDetail, useUnlockTour, useStartTour } from '../../../entities/tour/model';

interface TourDetailWidgetProps {
  tourId: number;
  onBack: () => void;
  onRunStart: (runId: number) => void;
}

export const TourDetailWidget = ({ tourId, onBack, onRunStart }: TourDetailWidgetProps) => {
  const { data: tour, isLoading, error } = useTourDetail(tourId);
  const unlockMutation = useUnlockTour();
  const startMutation = useStartTour();

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error || !tour) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load tour detail</Text>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
           <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isLocked = tour.access.status === 'LOCKED' && !tour.access.hasAccess;
  const isRunning = tour.currentRun?.status === 'IN_PROGRESS';

  const handlePrimaryAction = () => {
    if (isLocked) {
      unlockMutation.mutate(tourId, {
        onSuccess: () => Alert.alert('Unlocked!', 'You can now start this tour.'),
        onError: () => Alert.alert('Error', 'Failed to unlock tour.'),
      });
    } else if (isRunning && tour.currentRun) {
      // Continue existing run
      onRunStart(tour.currentRun.runId);
    } else {
      // Start new run
      startMutation.mutate({ tourId, mode: 'START' }, {
        onSuccess: (data) => onRunStart(data.runId),
        onError: () => Alert.alert('Error', 'Failed to start tour.'),
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Image */}
        <Image 
          source={{ uri: tour.thumbnails[0] }} 
          style={styles.heroImage} 
        />
        <TouchableOpacity style={styles.closeButton} onPress={onBack}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{tour.title}</Text>
            {isLocked && <Text style={styles.lockedBadge}>🔒 Locked</Text>}
          </View>
          
          <Text style={styles.description}>{tour.description}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
               <Text style={styles.statValue}>{tour.counts.main}</Text>
               <Text style={styles.statLabel}>Spots</Text>
            </View>
            <View style={styles.statItem}>
               <Text style={styles.statValue}>{tour.info.estimated_duration_min}m</Text>
               <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statItem}>
               <Text style={styles.statValue}>{tour.currentRun ? 'Run' : '-'}</Text>
               <Text style={styles.statLabel}>Status</Text>
            </View>
          </View>

          {/* Spots Preview */}
          <Text style={styles.sectionTitle}>Course Preview</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.spotsList}>
            {tour.mapSpots.map((spot) => (
              <View key={spot.spotId} style={styles.spotCard}>
                <Image 
                  source={{ uri: spot.thumbnailUrl || 'https://via.placeholder.com/100' }} 
                  style={styles.spotThumb} 
                />
                <Text style={styles.spotTitle} numberOfLines={1}>{spot.title}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Footer Action */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.primaryButton, isLocked && styles.unlockButton]} 
          onPress={handlePrimaryAction}
          disabled={unlockMutation.isPending || startMutation.isPending}
        >
          {unlockMutation.isPending || startMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {isLocked ? 'Unlock Tour' : isRunning ? 'Continue Tour' : 'Start Tour'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#eee',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 20,
    marginTop: -20,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    flex: 1,
  },
  lockedBadge: {
    color: '#F87171',
    fontWeight: 'bold',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111',
  },
  spotsList: {
    marginBottom: 16,
  },
  spotCard: {
    width: 120,
    marginRight: 12,
  },
  spotThumb: {
    width: 120,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginBottom: 8,
  },
  spotTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingBottom: 30, // Safe area
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  unlockButton: {
    backgroundColor: '#DC2626',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 12,
  },
  backButton: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
  },
});
