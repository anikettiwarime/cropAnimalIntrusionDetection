import React, {useEffect, useRef, useState} from 'react';
import RNFS from 'react-native-fs';
import {View, Text, StyleSheet, Image, Platform, Button} from 'react-native';
import {
  useCameraDevice,
  Camera,
  useCameraPermission,
  PhotoFile,
} from 'react-native-vision-camera';
import axios from 'axios';

// Base URL for the backend server
const BASE_URL = 'https://f4853z95-8000.inc1.devtunnels.ms';

// Dummy image URI for testing (not used in this version)
// const test_img = Image.resolveAssetSource(require('../images/test.jpeg')).uri;

const CameraScreen = () => {
  const cameraRef = useRef<Camera>(null);
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>(
    'back',
  );
  const device = useCameraDevice(cameraPosition);
  const {hasPermission, requestPermission} = useCameraPermission();
  const [capturedPhoto, setCapturedPhoto] = useState<PhotoFile>();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Function to toggle between front and back camera
  const toggleCameraPosition = () => {
    setCameraPosition(prevPosition =>
      prevPosition === 'front' ? 'back' : 'front',
    );
  };

  // Request camera permission on component mount
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

  // Update current time every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Capture photo and send it to the backend periodically
  useEffect(() => {
    if (hasPermission) {
      const intervalId = setInterval(async () => {
        if (cameraRef.current) {
          try {
            // Capture photo
            const photo = await cameraRef.current.takePhoto({flash: 'auto'});
            setCapturedPhoto(photo);

            // Save the photo to local filesystem
            const fileUri = `${RNFS.DocumentDirectoryPath}/photo.jpg`;
            await RNFS.copyFile(photo.path, fileUri);

            // Prepare FormData object for image upload
            const formData = new FormData();
            formData.append('image', {
              uri: `file://${fileUri}`,
              name: 'photo.jpg',
              type: 'image/jpeg',
            });

            // Send photo to backend
            const response = await axios.post(
              `${BASE_URL}/api/predict/`,
              formData,
              {
                headers: {'Content-Type': 'multipart/form-data'},
              },
            );
            console.log('Response:', response.data);

            // Optionally, delete the captured photo after sending
            await RNFS.unlink(photo.path);
          } catch (err) {
            console.log(err);
          }
        }
      }, 8000);

      return () => clearInterval(intervalId);
    }
  }, [hasPermission]);

  // Render camera preview and controls
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

// Component to render when camera is not found
const NotFound = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Camera not found</Text>
  </View>
);

// Component to render while requesting camera permission
const RequestPermission = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Requesting camera permission</Text>
  </View>
);

// Component to render the captured photo preview
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

// Styles for the components
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
    transform: [{rotate: '0deg'}],
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
