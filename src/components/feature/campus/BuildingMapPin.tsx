import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Marker, type MapMarker } from 'react-native-maps';
import type { BuildingSummary } from '@/types/campus';

type Props = {
  building: BuildingSummary;
  color: string;
  selected: boolean;
  markerRef: (ref: MapMarker | null) => void;
  onPress: () => void;
};

const SELECTED_SCALE = 1.35;

/**
 * Brand pin with a selection scale that does not depend on Apple Maps
 * native selection (which the building drawer Modal can steal).
 */
export function BuildingMapPin({
  building,
  color,
  selected,
  markerRef,
  onPress,
}: Props) {
  const scale = useRef(new Animated.Value(selected ? SELECTED_SCALE : 1)).current;
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  useEffect(() => {
    setTracksViewChanges(true);
    Animated.spring(scale, {
      toValue: selected ? SELECTED_SCALE : 1,
      friction: 6,
      tension: 160,
      useNativeDriver: true,
    }).start();
    const timeoutId = setTimeout(() => {
      setTracksViewChanges(false);
    }, 450);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [scale, selected]);

  return (
    <Marker
      ref={markerRef}
      coordinate={{ latitude: building.lat, longitude: building.lng }}
      identifier={building.id}
      anchor={{ x: 0.5, y: 1 }}
      stopPropagation
      tracksViewChanges={tracksViewChanges}
      onPress={onPress}
    >
      <View collapsable={false} style={styles.hitArea}>
        <Animated.View
          style={[styles.pin, { transform: [{ scale }] }]}
        >
          <View style={[styles.head, { backgroundColor: color }]}>
            <View style={styles.headHighlight} />
          </View>
          <View style={[styles.tip, { borderTopColor: color }]} />
        </Animated.View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  hitArea: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 36,
    height: 44,
  },
  pin: {
    alignItems: 'center',
  },
  head: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  headHighlight: {
    width: 7,
    height: 7,
    marginTop: -2,
    marginLeft: 5,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  tip: {
    width: 0,
    height: 0,
    marginTop: -2,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
