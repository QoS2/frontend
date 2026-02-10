import React, {useRef, useMemo, useState, useCallback, useEffect} from 'react';
import {View, TouchableOpacity, Keyboard} from 'react-native';
import {Image} from 'expo-image';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Ionicons} from '@expo/vector-icons';
import BottomSheet, {BottomSheetHandleProps} from '@gorhom/bottom-sheet';
import {NaverMapView} from '@mj-studio/react-native-naver-map';

import {MapViewWidget} from '@widgets/map-view';
import {TopNavBar} from '@widgets/top-nav';
import {AIChatWidget} from '@widgets/ai-chat';
import {useLocationMarkers} from '@entities/location/model';
import {useLocationTracker} from '@shared/lib/hooks/useLocationTracker';
import {useGeofenceTrigger} from '@features/map-navigation/useGeofenceTrigger';
import {useMapNavigationStore} from '@features/map-navigation/model';
import {useChatStore} from '@features/ai-chat/model';
import {Input, Spacing} from '@shared/ui';

export function MapPage() {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const mapRef = useRef<React.ElementRef<typeof NaverMapView>>(null);
    const snapPoints = useMemo(() => ['25%', '50%', '85%'], []);

    const [inputText, setInputText] = useState('');

    const {data: markers = []} = useLocationMarkers();
    const {location} = useLocationTracker();
    const {activeMarkerId} = useMapNavigationStore();
    const {addMessage, streamReply, isStreaming} = useChatStore();

    useGeofenceTrigger();



    useEffect(() => {
        const timer = setTimeout(() => {
            mapRef.current?.setLocationTrackingMode('Follow');
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleMarkerPress = (marker: any) => {
      // TODO : 클릭 시 어떤 상호작용 할지 
        console.log(`[Marker Click] ${marker.title}: ${marker.coordinate.latitude}, ${marker.coordinate.longitude}`);
    };

    const handleLocationButtonPress = () => {
        mapRef.current?.setLocationTrackingMode('Follow');
    };

    const handleSend = () => {
        if (!inputText.trim() || isStreaming) return;
        Keyboard.dismiss();

        addMessage({sender: 'user', text: inputText});
        setInputText('');

        setTimeout(() => {
            streamReply(`Thank you for your message: "${inputText}". This is a response from the AI guide.`);
        }, 500);
    };

    // Custom Handle Component
    const renderHandle = useCallback(
        (props: BottomSheetHandleProps) => (
            <View className="relative w-full items-center pb-2 pt-3 bg-white rounded-t-xl z-50">
                {/* Grey Handle Indicator */}
                <View className="w-10 h-1 rounded-full bg-gray-300"/>

                {/* Location Button - Absolute positioned within the handle area */}
                <TouchableOpacity
                    onPress={handleLocationButtonPress}
                    className="absolute -top-14 right-4 shadow-lg items-center justify-center w-12 h-12 rounded-full"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 2},
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                    }}
                >
                    <Image
                        source={require('@shared/assets/icons/locate.svg')}
                        style={{width: 48, height: 48}}
                        contentFit="contain"
                    />
                </TouchableOpacity>
            </View>
        ),
        []
    );

    return (
        <GestureHandlerRootView className="flex-1 relative">
            {/* Top Navigation */}
            <View className="absolute left-0 right-0 top-0 z-10">
                <TopNavBar destination="Gwanghwamun" distance="500m away"/>
            </View>

            {/* Map */}
            <MapViewWidget
                ref={mapRef}
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
                backgroundStyle={{backgroundColor: 'white'}}
                handleComponent={renderHandle}
            >
                <AIChatWidget/>
            </BottomSheet>

            {/* Floating Input - Fixed at Bottom */}
            <View
                className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4"
                style={{
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: -2},
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    zIndex: 30, // Input should be above everything
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
                        <Ionicons name="mic" size={24} color="#6B7280"/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={!inputText.trim() || isStreaming}
                        className="items-center justify-center"
                    >
                        <Image
                            source={require('@shared/assets/icons/icon-park-solid_voice-one.svg')}
                            style={{width: 28, height: 28}}
                            contentFit="contain"
                        />
                    </TouchableOpacity>
                </View>
                <Spacing size={16}/>
            </View>
        </GestureHandlerRootView>
    );
}
