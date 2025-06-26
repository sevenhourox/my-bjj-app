import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Image, TextInput, TouchableOpacity, useColorScheme, Linking } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://lvrukwnevxshclzmperz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2cnVrd25ldnhzaGNsem1wZXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MzY2MDksImV4cCI6MjA2NTUxMjYwOX0.dUh68ZFt3CMbPIDwGwvddxuhrmDNnrRcch2f9XDFoKM');

const VideoCourseApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('videos');
  const [cart, setCart] = useState([]);
  const [hasPaid, setHasPaid] = useState(false); // Track payment status
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const styles = getStyles(isDarkMode);

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert('Login failed: ' + error.message);
    } else {
      setIsLoggedIn(true);
      // Fetch if user has paid
      const { data: userData } = await supabase.from('users').select('has_paid').eq('email', email).single();
      setHasPaid(userData?.has_paid || false);
    }
  };

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert('Signup failed: ' + error.message);
    } else {
      alert('Account created! You can now log in.');
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
      setActiveTab('videos');
      setHasPaid(false);
    }
  };

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  const videos = [
    {
      id: 1,
      title: 'Professor Dave Intro + Half Guard',
      description: 'Learn the basic half guard basics',
      url: 'https://youtu.be/FzcHQ7-RHNY',
      premium: false
    },
    {
      id: 2,
      title: 'Professor Dave- Closed Guard fundamentals',
      description: 'A strong way control your opponent .',
      url: 'https://youtu.be/z3-HJqaemG0',
      premium: true
    },
  ];

  const storeItems = [
    {
      id: 'premium01',
      name: 'Premium Video Pack',
      price: '$29.99',
      link: 'https://buy.stripe.com/28E5kEcbU11a6ls7JR7IY00'
    }
  ];

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Image source={require('./assets/logo.png')} style={styles.logo} />
          <Text style={styles.title}>BJJ Outbox Login</Text>
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
        <View style={styles.menuBar}>
          <TouchableOpacity onPress={() => setActiveTab('videos')}><Text style={styles.menuItem}>Videos</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('profile')}><Text style={styles.menuItem}>Profile</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('store')}><Text style={styles.menuItem}>Store</Text></TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}><Text style={styles.menuItem}>Logout</Text></TouchableOpacity>
        </View>
      </View>
      {activeTab === 'videos' && (
        <ScrollView>
          {videos.map((video) => (
            <View key={video.id} style={styles.card}>
              <Text style={styles.videoTitle}>{video.title}</Text>
              <Text style={styles.videoDesc}>{video.description}</Text>
              {video.premium && !hasPaid ? (
                <TouchableOpacity style={styles.videoPlaceholder} onPress={() => setActiveTab('store')}>
                  <Text style={styles.placeholderText}>Unlock with Purchase</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.videoPlaceholder} onPress={() => Linking.openURL(video.url)}>
                  <Text style={styles.placeholderText}>Watch Video</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      )}
      {activeTab === 'profile' && (
        <View style={styles.card}>
          <Text style={styles.videoTitle}>Welcome, {email}</Text>
          <Text style={styles.videoDesc}>Access: {hasPaid ? 'Premium' : 'Free only'}</Text>
        </View>
      )}
      {activeTab === 'store' && (
        <ScrollView>
          {storeItems.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.videoTitle}>{item.name}</Text>
              <Text style={styles.videoDesc}>{item.price}</Text>
              <TouchableOpacity style={styles.videoPlaceholder} onPress={() => addToCart(item)}>
                <Text style={styles.placeholderText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          ))}
          {cart.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.videoTitle}>Cart</Text>
              {cart.map((item, idx) => (
                <Text key={idx} style={styles.videoDesc}>{item.name} - {item.price}</Text>
              ))}
              <TouchableOpacity style={styles.videoPlaceholder} onPress={() => Linking.openURL(cart[0].link)}>
                <Text style={styles.placeholderText}>Checkout</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
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
  menuBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  menuItem: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDarkMode ? '#fff' : '#000',
    marginHorizontal: 10,
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
    height: 50,
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
