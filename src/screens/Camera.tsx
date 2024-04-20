import React, {useEffect, useRef, useState} from 'react';
import RNFS from 'react-native-fs';

import {View, Text, StyleSheet, Image, Platform, Button} from 'react-native';
import {
  useCameraDevice,
  Camera,
  useCameraPermission,
  PhotoFile,
} from 'react-native-vision-camera';

const CameraScreen = () => {
  const cameraRef = useRef<Camera>(null);
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>(
    'front',
  );
  const device = useCameraDevice(cameraPosition);
  const {hasPermission, requestPermission} = useCameraPermission();
  const [capturedPhoto, setCapturedPhoto] = useState<PhotoFile>();
  const [currentTime, setCurrentTime] = useState(new Date());

  const toggleCameraPosition = () => {
    setCameraPosition(prevPosition =>
      prevPosition === 'front' ? 'back' : 'front',
    );
  };

  useEffect(() => {
    const requestCameraPermission = async () => {
      if (!hasPermission) {
        try {
          await requestPermission();
        } catch (err) {
          console.log('Failed to request camera permission:', err);
        }
      }
    };

    requestCameraPermission();
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (hasPermission) {
      const intervalId = setInterval(async () => {
        if (cameraRef.current) {
          try {
            if (capturedPhoto) {
              await RNFS.unlink(capturedPhoto.path);
            }

            const photo = await cameraRef.current.takePhoto({flash: 'auto'});
            setCapturedPhoto(photo);
          } catch (err) {
            console.log('Failed to take photo:', err);
          }
        }
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, [capturedPhoto, hasPermission]);

  if (!device) {
    return <NotFound />;
  }

  if (!hasPermission) {
    return <RequestPermission />;
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        device={device}
        isActive={true}
        style={styles.camera}
        photo={true}
      />
      <View style={styles.previewContainer}>
        <Text style={styles.previewText}>Preview:</Text>
        {capturedPhoto && <PreviewImage capturedPhoto={capturedPhoto} />}
      </View>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>
          {currentTime.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title={`Switch to ${
            cameraPosition === 'front' ? 'back' : 'front'
          } camera`}
          onPress={toggleCameraPosition}
        />
      </View>
    </View>
  );
};

const NotFound = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Camera not found</Text>
  </View>
);

const RequestPermission = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Requesting camera permission</Text>
  </View>
);

const PreviewImage = ({capturedPhoto}: {capturedPhoto: PhotoFile}) => (
  <View style={styles.previewImageContainer}>
    <Image
      source={{
        uri:
          Platform.OS === 'android' && capturedPhoto.path.startsWith('file://')
            ? capturedPhoto.path
            : `file://${capturedPhoto.path}`,
      }}
      style={styles.previewImage}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
  previewContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    fontSize: 18,
    marginBottom: 10,
    color: 'white',
  },
  previewImageContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    flex: 1,
    aspectRatio: 1,
    transform: [{rotate: '90deg'}],
  },
  timeContainer: {
    marginBottom: 5,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 18,
    color: 'white',
  },
  buttonContainer: {
    marginBottom: 10,
    alignItems: 'center',
  },
});

export default CameraScreen;
