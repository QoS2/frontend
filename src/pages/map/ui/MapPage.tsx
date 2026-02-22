import React, {useCallback, useMemo, useRef, useEffect} from 'react';
import {TextInput, View, Keyboard, Pressable, Text} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    SlideInDown,
    SlideOutDown
} from 'react-native-reanimated';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import BottomSheet, {BottomSheetHandleProps} from '@gorhom/bottom-sheet';
import type {NavigationContainerRef} from '@react-navigation/native';
import {NaverMapView} from '@mj-studio/react-native-naver-map';
import { LocateIcon, VoiceIcon } from '@shared/assets/icons';

import {MapViewWidget} from '@widgets/map-view';
import {TopNavBar} from '@widgets/top-nav';
import {BottomSheetNavigator, BottomSheetHandle} from '@features/bottom-sheet';
import type {BottomSheetStackParamList} from '@features/bottom-sheet';

import {Mic} from 'lucide-react-native';
import {useChatStore} from '@features/ai-chat';
import {useLocationMarkers} from '@entities/location';
import {useLocationTracker, useDistanceCalculator} from '@shared/lib';
import {useGeofenceTrigger, useMapNavigationStore} from '@features/map-navigation';
import {ActionPage} from '@pages/action';
import { useActionOverlayStore } from '@features/action-overlay/useActionOverlayStore';
import { DiscoveryPopup, useDiscoveryPopupStore } from '@features/discovery-popup';
import { useRunProgressStore, useRunGeofence } from '@features/run-progress';

import { useTourDetail } from '@entities/tour/model';
import { useTourStore } from '@entities/tour/store';

interface MapPageProps {
    runId?: number | null;
    tourId?: number | null;
}


export function MapPage({ runId, tourId }: MapPageProps) {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const mapRef = useRef<React.ElementRef<typeof NaverMapView>>(null);
    const bottomSheetNavigationRef = useRef<NavigationContainerRef<BottomSheetStackParamList>>(null);
    const snapPoints = useMemo(() => ['25%', '50%', '85%'], []);

    const setActiveTourId = useTourStore((state) => state.setActiveTourId);
    useEffect(() => {
        setActiveTourId(tourId ?? null);
    }, [tourId, setActiveTourId]);

    const {data: markers = []} = useLocationMarkers();
    const {location} = useLocationTracker();
    const {activeMarkerId} = useMapNavigationStore();
    const [currentRoute, setCurrentRoute] = React.useState<string>('GuideChat');

    const { activeAction, closeAction, openAction } = useActionOverlayStore();
    const { showPopup, dismissedMarkerId } = useDiscoveryPopupStore();

    const {addMessage, streamReply, isStreaming} = useChatStore();
    const [inputText, setInputText] = React.useState('');

    // --- Run Mode ---
    const { data: tourDetail } = useTourDetail(tourId ?? 0);
    const currentRun = tourDetail?.currentRun;
    const isRunMode = !!runId && !!currentRun;

    const { currentTarget, setCurrentTarget, isAtTarget } = useRunProgressStore();
    const { setTriggeredMarkerId } = useMapNavigationStore();

    // Sync RunState to RunProgressStore
    useEffect(() => {
        if (!isRunMode || !tourDetail || !currentRun) {
            setCurrentTarget(null);
            return;
        }
        const completedIds = currentRun.progress.completedSpotIds;
        const nextSpot = tourDetail.mapSpots.find(spot => !completedIds.includes(spot.spotId));
        if (nextSpot) {
            setCurrentTarget({
                spotId: nextSpot.spotId,
                title: nextSpot.title,
                lat: nextSpot.lat,
                lng: nextSpot.lng,
                radiusM: nextSpot.radiusM ?? 50,
            });
        } else {
            setCurrentTarget(null);
        }
    }, [isRunMode, tourDetail, currentRun, setCurrentTarget]);

    // Target Logic: 
    const targetMarker = useMemo(() => {
        if (!isRunMode || !currentTarget) return null;
        return markers.find(m => m.type === 'PLACE' && m.title === currentTarget.title) || null;
    }, [isRunMode, currentTarget, markers]);

    // Calculate Distance
    const distanceText = useDistanceCalculator(
        location, 
        currentTarget 
            ? { latitude: currentTarget.lat, longitude: currentTarget.lng } 
            : (targetMarker ? targetMarker.coordinate : null)
    );

    // Derive TopNavBar data
    const navDestination = currentTarget ? currentTarget.title : (targetMarker ? targetMarker.title : 'Exploring Seoul');
    const navDistance = distanceText || 'Calculating...';

    // Inject guide welcome message when entering run mode
    const hasInjectedRef = useRef(false);
    useEffect(() => {
        if (isRunMode && !hasInjectedRef.current) {
            const completedIds = currentRun?.progress?.completedSpotIds || [];
            if (completedIds.length === 0) {
                addMessage({
                    sender: 'ai',
                    type: 'text',
                    text: '🎉 투어를 시작합니다! 첫 번째 목적지인 광화문으로 이동해주세요.',
                });
            }
            hasInjectedRef.current = true;
        }
        if (!isRunMode) {
            hasInjectedRef.current = false;
        }
    }, [isRunMode, addMessage, currentRun]);


    // Trigger Popup for Photo/Treasure markers
    const { triggeredMarkerId } = useMapNavigationStore();
    
    // Auto-trigger GuideChat when entering Target Geofence
    useEffect(() => {
        if (isRunMode && isAtTarget && targetMarker) {
            setTriggeredMarkerId(targetMarker.id);
        }
    }, [isRunMode, isAtTarget, targetMarker, setTriggeredMarkerId]);

    useEffect(() => {
        if (!triggeredMarkerId) return;

        const marker = markers.find(m => m.id === triggeredMarkerId);
        if (!marker) return;

        // Check if user already dismissed this marker popup in this session
        if (dismissedMarkerId === marker.id) return;

        if (marker.type === 'PHOTO' || marker.type === 'TREASURE') {
            showPopup({
                type: marker.type as 'PHOTO' | 'TREASURE',
                markerId: marker.id,
                markerTitle: marker.title,
            });
        }
    }, [triggeredMarkerId, markers, dismissedMarkerId, showPopup]);

    // 순서 모드일 때 메인 장소(PLACE)는 제외시키고 자동 타겟 설정으로 위임
    useGeofenceTrigger(location, isRunMode ? ['PLACE', 'SUB_PLACE'] : undefined);
    useRunGeofence(location, isRunMode && currentRun ? currentRun.runId : null);

    const handleDiscoveryAction = (type: string, markerId: string) => {
        const marker = markers.find(m => m.id === markerId);
        if (!marker) return;

        let targetTab = 'GuideList';
        if (marker.type === 'PLACE' || marker.type === 'SUB_PLACE') targetTab = 'Place';
        if (marker.type === 'PHOTO') targetTab = 'Photo';
        if (marker.type === 'TREASURE') targetTab = 'Treasure';

        // 1. BottomSheet 올리기 (85%)
        bottomSheetRef.current?.snapToIndex(2); 
        
        // 2. 해당 탭으로 이동
        bottomSheetNavigationRef.current?.navigate(targetTab as any, { itemId: marker.id });
    };


    // Animation for input visibility
    const inputOpacity = useSharedValue(1);
    const inputTranslateY = useSharedValue(0);

    useEffect(() => {
        const shouldShow = currentRoute === 'GuideChat';
        inputOpacity.value = withTiming(shouldShow ? 1 : 0, {duration: 200});
        inputTranslateY.value = withTiming(shouldShow ? 0 : 20, {duration: 200});
    }, [currentRoute]);

    const inputAnimatedStyle = useAnimatedStyle(() => ({
        opacity: inputOpacity.value,
        transform: [{translateY: inputTranslateY.value}],
    }));

    // Effect to control BottomSheet based on Action Overlay
    // close() 대신 snapToIndex(0)을 사용하여 NavigationContainer가 unmount되지 않도록 유지
    // ActionPage(z-50)가 전체 화면을 덮으므로 25% 위치의 BottomSheet는 사용자에게 보이지 않음
    useEffect(() => {
        if (activeAction) {
            bottomSheetRef.current?.snapToIndex(0);
        } else {
            bottomSheetRef.current?.snapToIndex(1);
        }
    }, [activeAction]);

    const handleSend = () => {
        if (!inputText.trim() || isStreaming) return;
        Keyboard.dismiss();

        addMessage({sender: 'user', text: inputText, type: 'text'});
        setInputText('');

        setTimeout(() => {
            streamReply(`Response: "${inputText}"`);
        }, 500);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            mapRef.current?.setLocationTrackingMode('Follow');
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleMarkerPress = (marker: any) => {
        console.log(`[Marker Click] ${marker.title}`);
        
        let targetTab = 'GuideList';
        if (marker.type === 'PLACE' || marker.type === 'SUB_PLACE') targetTab = 'Place';
        if (marker.type === 'PHOTO') targetTab = 'Photo';
        if (marker.type === 'TREASURE') targetTab = 'Treasure';

        // 1. BottomSheet 올리기 (85%)
        bottomSheetRef.current?.snapToIndex(2); 
        
        // 2. 해당 탭으로 이동 (TODO: itemId params 전달)
        bottomSheetNavigationRef.current?.navigate(targetTab as any, { itemId: marker.id });
    };

    const handleLocationButtonPress = () => {
        mapRef.current?.setLocationTrackingMode('Follow');
    };

    // Custom Handle Component
    const renderHandle = useCallback(
        (props: BottomSheetHandleProps) => (
             <View className="relative">
                <BottomSheetHandle 
                    {...props} 
                    navigationRef={bottomSheetNavigationRef} 
                    currentRoute={currentRoute}
                />
                
                {/* Location Button */}
                <Pressable
                    onPress={handleLocationButtonPress}
                    className="absolute -top-14 right-4 items-center justify-center w-12 h-12 rounded-full active:opacity-70"
                     style={{
                        backgroundColor: 'white',
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 2},
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                    }}
                >
                    <LocateIcon width={48} height={48} />
                </Pressable>
            </View>
        ),
        [currentRoute]
    );

    return (
        <GestureHandlerRootView className="flex-1 relative">
            {/* Top Navigation */}
            <View className="absolute left-0 right-0 top-0 z-10">
                <TopNavBar destination={navDestination} distance={navDistance}/>
            </View>

            {/* Map */}
            <MapViewWidget
                ref={mapRef}
                markers={markers}
                userLocation={location}
                onMarkerPress={handleMarkerPress}
                activeMarkerId={activeMarkerId}
            />

            <BottomSheet
                ref={bottomSheetRef}
                index={1}
                snapPoints={snapPoints}
                enableDynamicSizing={false}
                enablePanDownToClose={false}
                enableContentPanningGesture={true}
                keyboardBehavior="interactive"
                keyboardBlurBehavior="restore"
                backgroundStyle={{backgroundColor: 'white'}}
                handleComponent={renderHandle}
            >
                <BottomSheetNavigator 
                    onRouteChange={setCurrentRoute} 
                    navigationRef={bottomSheetNavigationRef}
                />
            </BottomSheet>

            {/* Discovery Popup */}
            <DiscoveryPopup onAction={handleDiscoveryAction} />

            {/* Action Overlay Layer */}
            {activeAction && (
                <Animated.View
                    entering={SlideInDown.duration(300)}
                    exiting={SlideOutDown.duration(300)}
                    className="absolute inset-0 z-50"
                >
                    <ActionPage 
                        type={activeAction.type}
                        contentId={activeAction.contentId}
                        questId={activeAction.questId}
                        targetName={activeAction.targetName}
                        rewardId={activeAction.rewardId}
                        runId={runId || 0}
                        onComplete={closeAction}
                    />
                </Animated.View>
            )}

            {/* Animated Floating Input */}
            <Animated.View
                className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-white border-t border-gray-100"
                style={[
                    inputAnimatedStyle,
                    {pointerEvents: currentRoute === 'GuideChat' ? 'auto' : 'none'},
                ]}
            >
                <View 
                    className="flex-row items-center bg-white rounded-3xl px-2 h-[45px]"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 2},
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 5,
                    }}
                >
                    <TextInput
                        className="flex-1 px-3 text-base"
                        placeholder="Type a message"
                        placeholderTextColor="#9CA3AF"
                        value={inputText}
                        onChangeText={setInputText}
                        editable={!isStreaming}
                        onSubmitEditing={handleSend}
                        returnKeyType="send"
                    />
                    <Pressable className="p-2 mr-1 active:opacity-70">
                        <Mic size={24} color="#6B7280" />
                    </Pressable>
                    <Pressable
                        onPress={handleSend}
                        disabled={!inputText.trim() || isStreaming}
                        className="items-center justify-center active:opacity-70"
                    >
                        <VoiceIcon width={28} height={28} />
                    </Pressable>
                </View>
            </Animated.View>
        </GestureHandlerRootView>
    );
}
