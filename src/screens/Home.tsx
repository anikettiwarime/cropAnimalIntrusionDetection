import React from 'react';
import {
  StyleSheet,
  View,
  ImageBackground,
  Image,
  Text,
  TouchableOpacity,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const LOGO_IMG = Image.resolveAssetSource(require('../images/logo.png')).uri;

const HomeScreen: React.FC<Props> = ({navigation}) => {
  const handleStartMonitoring = () => {
    navigation.navigate('Camera');
  };

  const handleViewReports = () => {
    // Navigate to view reports screen if needed
  };

  return (
    <ImageBackground
      source={{
        uri: LOGO_IMG,
      }}
      style={styles.backgroundImage}>
      <Text style={styles.title}>Animal Intrusion Detection App</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleStartMonitoring}>
          <Text style={styles.text}>Start Monitoring</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleViewReports}>
          <Text style={styles.text}>View Reports</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  buttonContainer: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    display: 'flex',
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'green',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
});

export default HomeScreen;
