import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Image, TextInput, TouchableOpacity, useColorScheme } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://YOUR-PROJECT.supabase.co', 'YOUR-ANON-KEY');

const VideoCourseApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const styles = getStyles(isDarkMode);

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert('Login failed: ' + error.message);
    } else {
      setIsLoggedIn(true);
    }
  };

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert('Signup failed: ' + error.message);
    } else {
      alert('Account created! Check your email for confirmation.');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert('Please enter your email to reset password.');
      return;
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      alert('Password reset failed: ' + error.message);
    } else {
      alert('Password reset email sent. Please check your inbox.');
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert('Logout failed: ' + error.message);
    } else {
      setIsLoggedIn(false);
      setEmail('');
      setPassword('');
    }
  };

  const videos = [
    {
      id: 1,
      title: 'Fundamentals - Closed Guard Armbar',
      description: 'Learn the basic armbar from closed guard.'
    },
    {
      id: 2,
      title: 'Passing the Guard - Toreando',
      description: 'A strong way to pass open guard with speed.'
    },
  ];

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Image source={require('./assets/logo.png')} style={styles.logo} />
          <Text style={styles.title}>Braga BJJ Login</Text>
        </View>
        <View style={styles.loginBox}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.loginButton, { backgroundColor: '#555', marginTop: 10 }]} onPress={handleSignup}>
            <Text style={styles.loginButtonText}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.loginButton, { backgroundColor: '#888', marginTop: 10 }]} onPress={handleForgotPassword}>
            <Text style={styles.loginButtonText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('./assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Braga BJJ Video Library</Text>
        <TouchableOpacity style={[styles.loginButton, { marginTop: 10 }]} onPress={handleLogout}>
          <Text style={styles.loginButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <ScrollView>
        {videos.map((video) => (
          <View key={video.id} style={styles.card}>
            <Text style={styles.videoTitle}>{video.title}</Text>
            <Text style={styles.videoDesc}>{video.description}</Text>
            <View style={styles.videoPlaceholder}>
              <Text style={styles.placeholderText}>Video will appear here</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: isDarkMode ? '#121212' : '#f0f0f0',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 200,
    height: 80,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: isDarkMode ? '#fff' : '#222',
    textAlign: 'center',
  },
  loginBox: {
    marginTop: 20,
  },
  input: {
    height: 50,
    borderColor: isDarkMode ? '#444' : '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
    color: isDarkMode ? '#fff' : '#000',
  },
  loginButton: {
    backgroundColor: '#e11d48',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: isDarkMode ? '#444' : '#ccc',
    borderRadius: 10,
    backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: isDarkMode ? '#fff' : '#000',
  },
  videoDesc: {
    fontSize: 14,
    color: isDarkMode ? '#aaa' : '#666',
    marginBottom: 10,
  },
  videoPlaceholder: {
    height: 200,
    backgroundColor: isDarkMode ? '#333' : '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  placeholderText: {
    color: isDarkMode ? '#aaa' : '#555',
    fontSize: 14,
  },
});

export default VideoCourseApp;
