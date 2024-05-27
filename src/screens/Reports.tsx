import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';

const BASE_URL = 'https://f4853z95-8000.inc1.devtunnels.ms';

const ReportsScreen = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/reports/`);
        const updatedReports = response.data.map((report: {image: string}) => ({
          ...report,
          image: report.image.replace('http://localhost:8000', BASE_URL),
        }));
        setReports(updatedReports);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const renderItem = ({item}: {item: any}) => (
    <View style={styles.reportItem}>
      <Image source={{uri: item.image}} style={styles.reportImage} />
      <View style={styles.textContainer}>
        <Text style={styles.reportText}>ID: {item.id}</Text>
        <Text style={styles.reportText}>
          Is Intruder: {item.is_intruder ? 'Yes' : 'No'}
        </Text>
        <Text style={styles.reportText}>
          Created At: {new Date(item.created_at).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reports}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    padding: 10,
  },
  reportItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reportImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  textContainer: {
    padding: 10,
  },
  reportText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ReportsScreen;
