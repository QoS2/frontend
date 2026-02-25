import React from 'react';
import { Modal, SafeAreaView, Pressable, Image, Text } from 'react-native';

interface ImageViewerModalProps {
    imageUrl: string | null;
    onClose: () => void;
}

export function ImageViewerModal({ imageUrl, onClose }: ImageViewerModalProps) {
    return (
        <Modal
            visible={imageUrl !== null}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)' }}>
                <Pressable
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                onPress={onClose}
                >
                <Image
                    source={{ uri: imageUrl ?? undefined }}
                    style={{ width: '100%', height: '75%' }}
                    resizeMode="contain"
                />
                </Pressable>
                {/* Close button */}
                <Pressable
                onPress={onClose}
                style={{
                    position: 'absolute',
                    top: 56,
                    right: 20,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    borderRadius: 20,
                    width: 40,
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                >
                <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>✕</Text>
                </Pressable>
            </SafeAreaView>
        </Modal>
    );
}
