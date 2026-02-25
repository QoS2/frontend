export const getTargetTabForMarker = (markerType: string): 'Place' | 'Photo' | 'Treasure' | 'GuideList' => {
  if (markerType === 'PLACE' || markerType === 'SUB_PLACE') return 'Place';
  if (markerType === 'PHOTO') return 'Photo';
  if (markerType === 'TREASURE') return 'Treasure';
  return 'GuideList';
};
