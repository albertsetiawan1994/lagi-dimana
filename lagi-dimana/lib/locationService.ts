import * as Location from 'expo-location';
import { doc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

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

export async function updateUserLocation(userId: string, familyGroupId: string) {
  try {
    const granted = await requestLocationPermission();
    if (!granted) return null;

    const location = await getCurrentLocation();
    const { latitude, longitude } = location.coords;

    await updateDoc(doc(db, 'users', userId), {
      location: { latitude, longitude },
      lastSeen: serverTimestamp(),
      isOnline: true,
    });

    await addDoc(collection(db, 'locationHistory', userId, 'points'), {
      latitude,
      longitude,
      timestamp: serverTimestamp(),
    });

    return { latitude, longitude };
  } catch (e) {
    console.log('Location update error:', e);
    return null;
  }
}

export function getGoogleMapsStaticUrl(lat: number, lng: number, zoom = 15, size = '400x300') {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&markers=color:blue%7C${lat},${lng}&key=${apiKey}`;
}
