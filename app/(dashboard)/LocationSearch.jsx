import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import Autocomplete from './component/autocomplete';
import { getHandleSelectLocation } from './FunctionStore';

const LocationSearch = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);

  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        getCurrentLocation();
      } else {
        console.warn("Location permission denied");
      }
    };

    const getCurrentLocation = async () => {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setInitialRegion({
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    };

    requestLocationPermission();
  }, []);

  const handleSelectSuggestion = (location) => {
    setSelectedLocation(location);
  };

  const confirmLocation = () => {
    const handleSelectLocation = getHandleSelectLocation();
    if (selectedLocation && typeof handleSelectLocation === 'function') {
      handleSelectLocation(selectedLocation, route.params.type);
      navigation.goBack();
    } else {
      console.error('handleSelectLocation function is not provided');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.autocompleteContainer}>
        <Autocomplete onSelect={handleSelectSuggestion} />
      </View>
      {initialRegion ? (
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          region={selectedLocation ? {
            latitude: selectedLocation.coordinates[1],
            longitude: selectedLocation.coordinates[0],
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          } : initialRegion}
          showsUserLocation={true}
        >
          {selectedLocation && (
            <Marker
              coordinate={{
                latitude: selectedLocation.coordinates[1],
                longitude: selectedLocation.coordinates[0]
              }}
              title="Selected Location"
            />
          )}
        </MapView>
      ) : (
        <Text style={styles.loadingText}>Loading Map...</Text>
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Selected Location:</Text>
        {selectedLocation && (
          <Text style={styles.locationText}>{selectedLocation.address}</Text>
        )}
        <View style={styles.buttonContainer}>
          <Text onPress={confirmLocation} style={styles.text}>Confirm Location</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LocationSearch;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  autocompleteContainer: {
    position: 'absolute',
    top: 100,
    left: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 25,
    shadowColor: 'green',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4.5,
    elevation: 5,
    borderRadius: 25
  },
  map: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray'
  },
  infoContainer: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    width: '100%',
    justifyContent: 'center',
    alignSelf: 'center'
  },
  locationText: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 25,
    marginBottom: 10,
    textAlign: 'center',
    color: 'black',
    fontSize: 16,
    elevation: 5,
    width: '100%'
  },
  buttonContainer: {
    backgroundColor: 'green',
    padding: 15,
    alignItems: 'center',
    borderRadius: 25,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  label: {
    fontWeight: 'thin',
    fontSize: 18,
    alignSelf: 'flex-start',
    padding: 10
  }
});
