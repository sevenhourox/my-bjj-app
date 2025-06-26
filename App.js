import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  Image, TextInput, TouchableOpacity, useColorScheme
} from 'react-native';
import { Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://lvrukwnevxshclzmperz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2cnVrd25ldnhzaGNsem1wZXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MzY2MDksImV4cCI6MjA2NTUxMjYwOX0.dUh68ZFt3CMbPIDwGwvddxuhrmDNnrRcch2f9XDFoKM'
);

const VideoCourseApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('videos');
  const [cart, setCart] = useState([]);
  const [hasPaid, setHasPaid] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);   // <-- NEW
  const isDarkMode = useColorScheme() === 'dark';
  const styles = getStyles(isDarkMode);

  /* ---------- Auth Handlers ---------- */
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return alert('Login failed: ' + error.message);

    setIsLoggedIn(true);
    const { data } = await supabase
      .from('users')
      .select('has_paid')
      .eq('email', email)
      .single();
    setHasPaid(data?.has_paid || false);
  };

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert('Signup failed: ' + error.message);
    else alert('Account created! You can now log in.');
  };

  const handleForgotPassword = async () => {
    if (!email) return alert('Enter your email first.');
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) alert('Reset failed: ' + error.message);
    else alert('Password reset link sent.');
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) return alert('Logout failed: ' + error.message);
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    setActiveTab('videos');
    setHasPaid(false);
    setSelectedVideo(null);
  };

  /* ---------- Data ---------- */
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
      title: 'Professor Dave – Closed Guard Fundamentals',
      description: 'A strong way to control your opponent.',
      url: 'https://youtu.be/z3-HJqaemG0',
      premium: true
    }
  ];

  const storeItems = [
    {
      id: 'premium01',
      name: 'Premium Video Pack',
      price: '$29.99',
      link: 'https://buy.stripe.com/28E5kEcbU11a6ls7JR7IY00'
    }
  ];

  /* ---------- Render ---------- */
  if (!isLoggedIn) {
    /* ---------- LOGIN VIEW ---------- */
    return (
      <SafeAreaView style={styles.container}>
        <AuthHeader styles={styles} />
        <LoginForm
          styles={styles}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          handleLogin={handleLogin}
          handleSignup={handleSignup}
          handleForgotPassword={handleForgotPassword}
          isDarkMode={isDarkMode}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        styles={styles}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />

      {/* ---------- In-App Video Player ---------- */}
      {selectedVideo && (
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={() => setSelectedVideo(null)}
            style={{ padding: 10, backgroundColor: '#e11d48' }}
          >
            <Text style={{ color: '#fff', textAlign: 'center' }}>Close Video</Text>
          </TouchableOpacity>
          <WebView
            style={{ flex: 1 }}
            javaScriptEnabled
            domStorageEnabled
            source={{
              uri: selectedVideo
                .replace('youtu.be/', 'www.youtube.com/embed/')
                .replace('watch?v=', 'embed/')
            }}
          />
        </View>
      )}

      {!selectedVideo && activeTab === 'videos' && (
        <ScrollView>
          {videos.map((video) => {
            const id = video.url.includes('youtu.be')
              ? video.url.split('/').pop()
              : video.url.split('v=')[1];
            const thumb = `https://img.youtube.com/vi/${id}/0.jpg`;

            const locked = video.premium && !hasPaid;
            const handlePress = locked
              ? () => setActiveTab('store')
              : () => setSelectedVideo(video.url);

            return (
              <View key={video.id} style={styles.card}>
                <Text style={styles.videoTitle}>{video.title}</Text>
                <Text style={styles.videoDesc}>{video.description}</Text>

                <TouchableOpacity onPress={handlePress}>
                  <View style={styles.thumbnailWrapper}>
                    <Image source={{ uri: thumb }} style={styles.thumbnail} />
                    <View style={styles.playOverlay}>
                      <Text style={styles.playIcon}>{locked ? '🔒' : '▶'}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}

      {!selectedVideo && activeTab === 'profile' && (
        <View style={styles.card}>
          <Text style={styles.videoTitle}>Welcome, {email}</Text>
          <Text style={styles.videoDesc}>Access: {hasPaid ? 'Premium' : 'Free only'}</Text>
        </View>
      )}

      {!selectedVideo && activeTab === 'store' && (
        <StoreView
          styles={styles}
          storeItems={storeItems}
          cart={cart}
          addToCart={(item) => setCart([...cart, item])}
        />
      )}
    </SafeAreaView>
  );
};

/* ---------- Reusable Sub-components ---------- */
const AuthHeader = ({ styles }) => (
  <View style={styles.header}>
    <Image source={require('./assets/logo.png')} style={styles.logo} />
    <Text style={styles.title}>Bjj Outbox Login</Text>
  </View>
);

const LoginForm = ({
  styles, email, setEmail, password, setPassword,
  handleLogin, handleSignup, handleForgotPassword, isDarkMode
}) => (
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
    <TouchableOpacity
      style={[styles.loginButton, { backgroundColor: '#555', marginTop: 10 }]}
      onPress={handleSignup}
    >
      <Text style={styles.loginButtonText}>Sign Up</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.loginButton, { backgroundColor: '#888', marginTop: 10 }]}
      onPress={handleForgotPassword}
    >
      <Text style={styles.loginButtonText}>Forgot Password?</Text>
    </TouchableOpacity>
  </View>
);

const AppHeader = ({ styles, activeTab, setActiveTab, handleLogout }) => (
  <View style={styles.header}>
    <Image source={require('./assets/logo.png')} style={styles.logo} />
    <Text style={styles.title}>BJJ Outbox Video Library</Text>
    <View style={styles.menuBar}>
      {['videos', 'profile', 'store'].map(tab => (
        <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
          <Text style={[
            styles.menuItem,
            activeTab === tab && { textDecorationLine: 'underline' }
          ]}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity onPress={handleLogout}>
        <Text style={styles.menuItem}>Logout</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const StoreView = ({ styles, storeItems, cart, addToCart }) => (
  <ScrollView>
    {storeItems.map(item => (
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
        {cart.map((c, idx) => (
          <Text key={idx} style={styles.videoDesc}>{c.name} – {c.price}</Text>
        ))}
        <TouchableOpacity
          style={styles.videoPlaceholder}
          onPress={() => Linking.openURL(cart[0].link)}
        >
          <Text style={styles.placeholderText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    )}
  </ScrollView>
);

/* ---------- Styles ---------- */
const getStyles = (dark) => StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: dark ? '#121212' : '#f0f0f0' },
  header: { alignItems: 'center', marginBottom: 20 },
  menuBar: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  menuItem: { fontSize: 16, fontWeight: 'bold', color: dark ? '#fff' : '#000', marginHorizontal: 10 },
  logo: { width: 200, height: 80, resizeMode: 'contain' },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 10, color: dark ? '#fff' : '#222' },
  loginBox: { marginTop: 20 },
  input: {
    height: 50, borderColor: dark ? '#444' : '#ccc', borderWidth: 1, borderRadius: 8,
    marginBottom: 15, paddingHorizontal: 10, backgroundColor: dark ? '#1e1e1e' : '#fff',
    color: dark ? '#fff' : '#000'
  },
  loginButton: { backgroundColor: '#e11d48', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  loginButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card: {
    marginBottom: 20, padding: 15, borderWidth: 1, borderColor: dark ? '#444' : '#ccc',
    borderRadius: 10, backgroundColor: dark ? '#1e1e1e' : '#fff'
  },
  videoTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, color: dark ? '#fff' : '#000' },
  videoDesc: { fontSize: 14, color: dark ? '#aaa' : '#666', marginBottom: 10 },
  thumbnailWrapper: {
    position: 'relative', width: '100%', height: 200, marginBottom: 10,
    borderRadius: 8, overflow: 'hidden'
  },
  thumbnail: { width: '100%', height: '100%' },
  playOverlay: {
    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
    justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)'
  },
  playIcon: { fontSize: 50, color: '#fff' },
  videoPlaceholder: {
    height: 50, backgroundColor: dark ? '#333' : '#ddd',
    justifyContent: 'center', alignItems: 'center', borderRadius: 8
  },
  placeholderText: { color: dark ? '#aaa' : '#555', fontSize: 14 }
});

export default VideoCourseApp;
