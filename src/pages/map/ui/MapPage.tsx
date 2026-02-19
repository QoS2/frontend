import React, {useCallback, useMemo, useRef, useEffect} from 'react';
import {StyleSheet, TextInput, View, Keyboard, Pressable} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    SlideInDown,
    SlideOutDown
} from 'react-native-reanimated';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import BottomSheet, {BottomSheetHandleProps} from '@gorhom/bottom-sheet';
import {useNavigationContainerRef} from '@react-navigation/native';
import {NaverMapView} from '@mj-studio/react-native-naver-map';
import { LocateIcon, VoiceIcon } from '@shared/assets/icons';

import {MapViewWidget} from '@widgets/map-view';
import {TopNavBar} from '@widgets/top-nav';
import {BottomSheetNavigator, BottomSheetHandle} from '@features/bottom-sheet';

import {Mic} from 'lucide-react-native';
import {useChatStore} from '@features/ai-chat';
import {useLocationMarkers} from '@entities/location';
import {useLocationTracker} from '@shared/lib';
import {useGeofenceTrigger, useMapNavigationStore} from '@features/map-navigation';
import {ActionPage} from '@pages/action';
import {useActionOverlayStore} from '@features/action-overlay/useActionOverlayStore';
import { DiscoveryPopup, useDiscoveryPopupStore } from '@features/discovery-popup';

import { useRunState } from '@entities/run/model';

interface MapPageProps {
    runId?: number | null;
}


export function MapPage({ runId }: MapPageProps) {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const mapRef = useRef<React.ElementRef<typeof NaverMapView>>(null);
    const bottomSheetNavigationRef = useNavigationContainerRef<any>();
    const snapPoints = useMemo(() => ['25%', '50%', '85%'], []);

    const {data: markers = []} = useLocationMarkers();
    const {location} = useLocationTracker();
    const {activeMarkerId} = useMapNavigationStore();
    const [currentRoute, setCurrentRoute] = React.useState<string>('GuideChat');

    const { activeAction, closeAction, openAction } = useActionOverlayStore();
    const { showPopup, dismissedMarkerId } = useDiscoveryPopupStore();

    const {addMessage, streamReply, isStreaming} = useChatStore();
    const [inputText, setInputText] = React.useState('');

    // --- Run Mode ---
    const { data: runState } = useRunState(runId ?? 0);
    const isRunMode = !!runId && !!runState;

    // Derive TopNavBar data from run state
    const navDestination = isRunMode ? '광화문 (Gwanghwamun)' : 'Gwanghwamun';
    const navDistance = isRunMode ? '150m away' : '500m away';

    // Inject guide welcome message when entering run mode
    const hasInjectedRef = useRef(false);
    useEffect(() => {
        if (isRunMode && !hasInjectedRef.current) {
            hasInjectedRef.current = true;
            addMessage({
                sender: 'ai',
                type: 'text',
                text: '🎉 투어를 시작합니다! 첫 번째 목적지인 광화문으로 이동해주세요.',
            });
        }
        if (!isRunMode) {
            hasInjectedRef.current = false;
        }
    }, [isRunMode, addMessage]);


    // Trigger Popup for Photo/Treasure markers
    const { triggeredMarkerId } = useMapNavigationStore();
    
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

    useGeofenceTrigger(location);

    const handleDiscoveryAction = (type: string, markerId: string) => {
        const marker = markers.find(m => m.id === markerId);
        if (!marker || !marker.contentId) return;

        // Phase 4 Test: Open Spot Detail first
        if (type === 'PHOTO' || type === 'PLACE' || type === 'SUB_PLACE') {
            openAction({
                type: 'SPOT_DETAIL',
                contentId: marker.contentId,
                targetName: marker.title,
                runId: runId
            });
        } else if (type === 'TREASURE') {
             openAction({
                type: 'REWARD',
                contentId: marker.contentId,
                rewardId: 'treasure-reward',
                runId: runId
            });
        }
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
    useEffect(() => {
        if (activeAction) {
            bottomSheetRef.current?.close();
        } else {
            // Restore bottom sheet if it was closed by action
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
        console.log(`[Marker Click] ${marker.title}: ${marker.coordinate.latitude}, ${marker.coordinate.longitude}`);
        if (marker.type === 'PHOTO' || marker.type === 'TREASURE' || marker.type === 'PLACE' || marker.type === 'SUB_PLACE') {
             handleDiscoveryAction(marker.type, marker.id);
        }
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
                    className="absolute -top-14 right-4 shadow-lg items-center justify-center w-12 h-12 rounded-full active:opacity-70"
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
                    style={StyleSheet.absoluteFill}
                    className="z-50"
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
                style={[
                    styles.floatingInput,
                    inputAnimatedStyle,
                    {pointerEvents: currentRoute === 'GuideChat' ? 'auto' : 'none'},
                ]}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Type a message"
                        placeholderTextColor="#9CA3AF"
                        value={inputText}
                        onChangeText={setInputText}
                        editable={!isStreaming}
                        onSubmitEditing={handleSend}
                        returnKeyType="send"
                    />
                    <Pressable style={styles.iconButton} className="active:opacity-70">
                        <Mic size={24} color="#6B7280" />
                    </Pressable>
                    <Pressable
                        onPress={handleSend}
                        disabled={!inputText.trim() || isStreaming}
                        style={styles.sendButton}
                        className="active:opacity-70"
                    >
                        <VoiceIcon width={28} height={28} />
                    </Pressable>
                </View>
            </Animated.View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    floatingInput: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingBottom: 32,
        paddingTop: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 24,
        paddingHorizontal: 8,
        height: 45,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    textInput: {
        flex: 1,
        paddingHorizontal: 12,
        fontSize: 16,
    },
    iconButton: {
        padding: 8,
        marginRight: 4,
    },
    sendButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
