import React, { useMemo } from 'react';
import { View, Pressable, Modal, StyleSheet, Platform } from 'react-native';
import { Camera, Sparkles, X, Gem, MapPin } from 'lucide-react-native';
import { Image } from 'expo-image';
import { Text } from '@shared/ui/Text';
import { useDiscoveryPopupStore } from '../model';

interface DiscoveryPopupProps {
  onAction: (type: 'PHOTO' | 'TREASURE', markerId: string) => void;
}

export function DiscoveryPopup({ onAction }: DiscoveryPopupProps) {
  const { popupInfo, dismissPopup } = useDiscoveryPopupStore();

  const content = useMemo(() => {
    if (!popupInfo) return null;

    if (popupInfo.type === 'PHOTO') {
      return {
        bgColor: '#E0D4FC', // Purple-ish
        iconBg: '#F3E8FF',
        Icon: Camera,
        iconColor: '#9333EA',
        title: 'You found\nAmazing Photo Spot!',
        imageSource: require('@shared/assets/icons/photo-popup.png'),
        ctaText: 'Take Photo Now!',
        ctaColor: '#9333EA',
      };
    } else {
      return {
        bgColor: '#D4FCE4', // Mint-ish
        iconBg: '#ECFDF5',
        Icon: Sparkles,
        iconColor: '#059669',
        title: 'You found\nMystery Treasure!',
        imageSource: require('@shared/assets/icons/treasure-popup.png'),
        ctaText: 'See Treasure now',
        ctaColor: '#059669',
      };
    }
  }, [popupInfo]);

  if (!popupInfo || !content) return null;

  const { bgColor, iconBg, Icon, iconColor, title, imageSource, ctaText, ctaColor } = content;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={!!popupInfo}
      onRequestClose={dismissPopup}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: bgColor }]}>
          {/* Close Button (Both types) */}
          <Pressable 
            onPress={dismissPopup} 
            className="absolute top-4 right-4 z-10 p-2 bg-white/20 rounded-full active:opacity-70"
          >
            <X size={20} color="#333" />
          </Pressable>

          {/* Top Icon */}
          <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
            <Icon size={32} color={iconColor} />
            {/* Small 'plus' badge for Photo or star for Treasure could be added here */}
          </View>

          {/* Title */}
          <Text className="text-center font-extrabold text-xl text-gray-800 mt-4 mb-6 leading-7">
            {title}
          </Text>

          {/* Image Area */}
          <View className="w-full aspect-[4/3] bg-white/50 rounded-2xl mb-6 items-center justify-center overflow-hidden shadow-sm relative">
             <Image 
                source={imageSource} 
                style={{ width: '100%', height: '100%' }}
                contentFit="contain"
             />
             {/* Decorative element (Tiger placeholder) */}
             <View className="absolute bottom-[-10] left-[-10] w-24 h-24 bg-orange-100 rounded-full border-4 border-white items-center justify-center">
                <Text className="text-2xl">🐯</Text>
             </View>
          </View>

          {/* Buttons */}
          <View className="w-full gap-3">
             {/* Primary CTA */}
            <Pressable
              onPress={() => {
                onAction(popupInfo.type, popupInfo.markerId);
                dismissPopup();
              }}
              className="w-full py-4 rounded-xl items-center shadow-sm active:opacity-90"
              style={{ backgroundColor: ctaColor }}
            >
              <Text className="text-white font-bold text-lg">
                {ctaText}
              </Text>
            </Pressable>

            {/* Secondary CTA */}
            <Pressable
              onPress={dismissPopup}
              className="w-full py-3 rounded-xl items-center active:opacity-70 bg-white/50"
            >
              <Text className="text-gray-600 font-semibold text-base">
                Later
              </Text>
            </Pressable>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    // Add a subtle border for depth
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -56, // Pull up to break the top edge
    marginBottom: 8,
    borderWidth: 4,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});
