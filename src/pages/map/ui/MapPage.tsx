import React, { useRef, useMemo, useState } from 'react';
import { View, TouchableOpacity, Keyboard } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { MapViewWidget } from '@widgets/map-view';
import { TopNavBar } from '@widgets/top-nav';
import { AIChatWidget } from '@widgets/ai-chat';
import { useLocationMarkers } from '@entities/location/model';
import { useLocationTracker } from '@shared/lib/hooks/useLocationTracker';
import { useGeofenceTrigger } from '@features/map-navigation/useGeofenceTrigger';
import { useMapNavigationStore } from '@features/map-navigation/model';
import { useChatStore } from '@features/ai-chat/model';
import { Input, Spacing } from '@shared/ui';

export function MapPage() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['25%', '50%', '85%'], []);

  const [inputText, setInputText] = useState('');

  const { data: markers = [] } = useLocationMarkers();
  const { location } = useLocationTracker();
  const { activeMarkerId } = useMapNavigationStore();
  const { addMessage, streamReply, isStreaming } = useChatStore();

  useGeofenceTrigger();

  const handleMarkerPress = (marker: any) => {
    console.log('Marker pressed:', marker.title);
  };

  const handleSend = () => {
    if (!inputText.trim() || isStreaming) return;
    Keyboard.dismiss();
    
    addMessage({ sender: 'user', text: inputText });
    setInputText('');

    setTimeout(() => {
      streamReply(`Thank you for your message: "${inputText}". This is a response from the AI guide.`);
    }, 500);
  };



  return (
    <GestureHandlerRootView className="flex-1">
      {/* Top Navigation */}
      <View className="absolute left-0 right-0 top-0 z-10">
        <TopNavBar destination="Gwanghwamun" distance="500m away" />
      </View>

      {/* Map */}
      <MapViewWidget
        markers={markers}
        userLocation={location}
        onMarkerPress={handleMarkerPress}
        activeMarkerId={activeMarkerId}
      />

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        backgroundStyle={{ backgroundColor: 'white' }}
        handleIndicatorStyle={{ backgroundColor: '#D1D5DB', width: 40, height: 4 }}
      >
        <AIChatWidget />
      </BottomSheet>

      {/* Floating Input - Fixed at Bottom */}
      <View
        className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4"
        style={{
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        <View className="flex-row items-center bg-white rounded-full px-2 h-[45px] shadow-lg">
          <Input
            className="flex-1 bg-transparent border-0 text-base font-tamedium"
            placeholder="Type a message"
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            editable={!isStreaming}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity className="p-2 mr-1">
            <Ionicons name="mic" size={24} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim() || isStreaming}
            className="bg-[#5AC8FA] rounded-full w-8 h-8 items-center justify-center"
          >
            <Ionicons name="pulse" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <Spacing size={16} />
      </View>
    </GestureHandlerRootView>
  );
}
