import * as Location from 'expo-location';
import { supabase } from './supabase';

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function getCurrentLocation() {
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return location;
}

export async function updateUserLocation(userId: string) {
  try {
    const granted = await requestLocationPermission();
    if (!granted) return null;

    const location = await getCurrentLocation();
    const { latitude, longitude } = location.coords;

    await supabase
      .from('users')
      .update({
        location: { latitude, longitude },
        last_seen: new Date().toISOString(),
        is_online: true,
      })
      .eq('id', userId);

    await supabase.from('location_history').insert({
      user_id: userId,
      latitude,
      longitude,
    });

    return { latitude, longitude };
  } catch (e) {
    console.log('Location update error:', e);
    return null;
  }
}

export function getGoogleMapsStaticUrl(lat: number, lng: number, zoom = 15, size = '400x300') {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&markers=color:blue%7C${lat},${lng}`;
}
