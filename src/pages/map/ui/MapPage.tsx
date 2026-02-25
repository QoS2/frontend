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
import { LocateIcon } from '@shared/assets/icons';

import {MapViewWidget} from '@widgets/map-view';
import {TopNavBar} from '@widgets/top-nav';
import {BottomSheetNavigator, BottomSheetHandle} from '@features/bottom-sheet';
import type {BottomSheetStackParamList} from '@features/bottom-sheet';

import {Send} from 'lucide-react-native';
import {useChatStore} from '@features/ai-chat';
import {useLocationMarkers} from '@entities/location';
import {useLocationTracker, getTargetTabForMarker} from '@shared/lib';
import {useGeofenceTrigger, useMapNavigationStore} from '@features/map-navigation';
import {ActionPage} from '@pages/action';
import { useActionOverlayStore } from '@features/action-overlay/useActionOverlayStore';
import { DiscoveryPopup } from '@features/discovery-popup';
import { useRunProgressStore, useRunGeofence } from '@features/run-progress';

import { useCurrentRun } from '@entities/tour/model';
import { useTourStore } from '@entities/tour/store';
import { useNextSpot } from '@entities/run/model';

// --- Custom Hooks ---
import { useRunSync } from '../lib/useRunSync';
import { useDiscoveryTrigger } from '../lib/useDiscoveryTrigger';
import { useChatSend } from '../lib/useChatSend';

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

    const { activeAction, closeAction } = useActionOverlayStore();
    const { isStreaming } = useChatStore();

    // --- Run Mode Content ---
    const { tourDetail, currentRun } = useCurrentRun();
    const isRunMode = !!runId && !!currentRun;

    const { targetMarker, navDestination, navDistance } = useRunSync({
        isRunMode,
        tourDetail,
        currentRun,
        location,
    });

    const { isAtTarget, activeSessionId } = useRunProgressStore();

    // next-spot API 기반으로 Live 마커를 결정
    const { data: nextSpotData } = useNextSpot(currentRun?.runId);
    const nextLiveSpotId = nextSpotData?.nextSpot?.spotId?.toString();

    // --- Chat Trigger & Geo-fences ---
    useDiscoveryTrigger({
        isRunMode,
        isAtTarget,
        targetMarkerId: targetMarker?.id,
        markers,
        currentRun,
    });

    useGeofenceTrigger(location, isRunMode ? ['PLACE', 'SUB_PLACE'] : undefined);
    useRunGeofence(location, isRunMode && currentRun ? currentRun.runId : null);

    // --- Actions & Handlers ---
    const { inputText, setInputText, handleSend: sendMsg } = useChatSend({ activeSessionId });

    const handleSend = useCallback(() => {
        sendMsg(isStreaming);
    }, [sendMsg, isStreaming]);

    const handleDiscoveryAction = (type: string, markerId: string) => {
        const marker = markers.find(m => m.id === markerId);
        if (!marker) return;

        const targetTab = getTargetTabForMarker(marker.type);
        bottomSheetRef.current?.snapToIndex(2); 
        bottomSheetNavigationRef.current?.navigate(targetTab as any, { itemId: marker.id });
    };

    const handleMarkerPress = (marker: any) => {
        const targetTab = getTargetTabForMarker(marker.type);
        bottomSheetRef.current?.snapToIndex(2); 
        bottomSheetNavigationRef.current?.navigate(targetTab as any, { itemId: marker.id });
    };

    const handleLocationButtonPress = () => {
        mapRef.current?.setLocationTrackingMode('Follow');
    };

    // --- Animations & UI Effects ---
    const inputOpacity = useSharedValue(1);
    const inputTranslateY = useSharedValue(0);

    useEffect(() => {
        const shouldShow = currentRoute === 'GuideChat';
        inputOpacity.value = withTiming(shouldShow ? 1 : 0, {duration: 200});
        inputTranslateY.value = withTiming(shouldShow ? 0 : 20, {duration: 200});
    }, [currentRoute, inputOpacity, inputTranslateY]);

    const inputAnimatedStyle = useAnimatedStyle(() => ({
        opacity: inputOpacity.value,
        transform: [{translateY: inputTranslateY.value}],
    }));

    useEffect(() => {
        if (activeAction) {
            bottomSheetRef.current?.snapToIndex(0);
        } else {
            bottomSheetRef.current?.snapToIndex(1);
        }
    }, [activeAction]);

    useEffect(() => {
        const timer = setTimeout(() => {
            mapRef.current?.setLocationTrackingMode('Follow');
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const renderHandle = useCallback(
        (props: BottomSheetHandleProps) => (
             <View className="relative">
                <BottomSheetHandle 
                    {...props} 
                    navigationRef={bottomSheetNavigationRef} 
                    currentRoute={currentRoute}
                />
                <Pressable
                    onPress={handleLocationButtonPress}
                    className="absolute -top-14 right-4 items-center justify-center w-12 h-12 rounded-full active:opacity-70"
                     style={{
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
            <View className="absolute left-0 right-0 top-0 z-10">
                <TopNavBar destination={navDestination} distance={navDistance}/>
            </View>

            <MapViewWidget
                ref={mapRef}
                markers={markers}
                userLocation={location}
                onMarkerPress={handleMarkerPress}
                activeMarkerId={activeMarkerId}
                completedSpotIds={currentRun?.progress?.completedSpotIds?.map((id: number) => id.toString()) || []}
                nextSpotId={nextLiveSpotId}
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

            <DiscoveryPopup onAction={handleDiscoveryAction} />

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
                    <Pressable
                        onPress={handleSend}
                        disabled={!inputText.trim() || isStreaming}
                        className="p-2 items-center justify-center active:opacity-70"
                    >
                        <Send 
                            size={24} 
                            color={!inputText.trim() || isStreaming ? '#D1D5DB' : '#3B82F6'} 
                        />
                    </Pressable>
                </View>
            </Animated.View>

            {activeAction && (
                <View 
                    className="absolute inset-0" 
                    pointerEvents="box-none"
                    style={{ zIndex: 9999, elevation: 10 }}
                >
                    <Animated.View
                        entering={SlideInDown.duration(300)}
                        exiting={SlideOutDown.duration(300)}
                        className="flex-1 bg-white"
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
                </View>
            )}
        </GestureHandlerRootView>
    );
}
