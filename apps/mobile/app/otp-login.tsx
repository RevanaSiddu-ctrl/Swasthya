import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';

// Completes the OAuth tracking redirect loops on the browser safely
WebBrowser.maybeCompleteAuthSession();

export default function OTPLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Initialize the Google Auth Request configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    // ⬇️ PASTE YOUR COPIED WEB CLIENT ID HERE FROM THE GOOGLE CLOUD CONSOLE ⬇️
    webClientId: '294578686191-n1faeskako1kf50q1ccp8r419ctn227n.apps.googleusercontent.com',
    scopes: [
      'openid',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.body.read'
    ],
  });

  // Watch for the OAuth callback response redirection token
  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.accessToken) {
      const accessToken = response.authentication.accessToken;
      fetchGoogleFitData(accessToken);
    }
  }, [response]);

  // Request the behavioral metrics from Google Fit's REST Endpoints
  const fetchGoogleFitData = async (token: string) => {
    setLoading(true);
    try {
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const now = Date.now();

      const res = await fetch(
        'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            aggregateBy: [
              { dataTypeName: 'com.google.step_count.delta' },
              { dataTypeName: 'com.google.calories.expended' }
            ],
            bucketByTime: { durationMillis: 86400000 }, // Aggregates into daily bins
            startTimeMillis: oneWeekAgo,
            endTimeMillis: now,
          }),
        }
      );

      const dataset = await res.json();
      console.log('=== GOOGLE FIT HISTORICAL TRACKING ===', dataset);
      
      setSyncSuccess(true);
      setLoading(false);

      // Transition forward to the next screen after a brief confirmation window
      setTimeout(() => {
        router.replace('/calm-wave-home');
      }, 1500);

    } catch (err) {
      console.error('Error fetching Google Fit datasets:', err);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>PRATISAAD</Text>
        <Text style={styles.subtitle}>Ecosystem Secure Gateway</Text>
        
        <Text style={styles.description}>
          Synchronize background data streams to silently track somatic fatigue signs and routine degradation features.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#38BDF8" style={{ marginVertical: 20 }} />
        ) : (
          <TouchableOpacity 
            disabled={!request}
            style={[styles.authButton, !request && styles.disabledButton]} 
            onPress={() => promptAsync()}
          >
            <Text style={styles.btnText}>Authenticate with Google Fit</Text>
          </TouchableOpacity>
        )}

        {syncSuccess && (
          <View style={styles.toast}>
            <Text style={styles.toastText}>✅ Data Channels Configured. Opening Home...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Slate 900 low-stimulation dark theme
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#38BDF8',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  authButton: {
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#334155',
  },
  btnText: {
    color: '#F8FAFC',
    fontWeight: '600',
    fontSize: 15,
  },
  toast: {
    marginTop: 20,
    backgroundColor: '#065F46',
    padding: 12,
    borderRadius: 6,
    width: '100%',
  },
  toastText: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  }
});