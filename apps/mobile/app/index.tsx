import { Redirect } from 'expo-router';
import React from 'react';

export default function RootIndex() {
  // This instantly forwards the browser straight to your new login screen
  return <Redirect href="/otp-login" />;
}