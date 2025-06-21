import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { Linking } from 'react-native';
import { WebView } from 'react-native-webview';
// lib/supabase.js

import { createClient } from '@supabase/supabase-js';

// ✅ These values must be set in Vercel or a local .env file
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  // ✅ Fetch data on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        let { data, error } = await supabase.from('users').select('*');
        if (error) throw error;
        setUsers(data);
      } catch (err) {
        console.error('Supabase fetch error:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={{ color: 'red' }}>Error: {error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>User List from Supabase</Text>
        {users.map((user, index) => (
          <View key={index} style={styles.userCard}>
            <Text>Name: {user.name}</Text>
            <Text>Email: {user.email}</Text>
          </View>
        ))}

        <Text style={styles.title}>Embedded Web Content</Text>
        <View style={{ height: 300 }}>
          <WebView source={{ uri: 'https://example.com' }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    marginVertical: 20,
    fontWeight: 'bold',
  },
  userCard: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
});
