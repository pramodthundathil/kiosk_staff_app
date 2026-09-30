import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors, radii, shadows } from '../../theme';
import { Input } from '../../components/Common/Input';
import { Button } from '../../components/Common/Button';
import { Lock, UserCheck } from 'lucide-react-native';

export const LoginScreen: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert('Required', 'Please enter your username or employee ID.');
      return;
    }
    if (!password) {
      Alert.alert('Required', 'Please enter your password.');
      return;
    }

    try {
      await login(username, password);
    } catch (err: any) {
      // Error handled by AuthContext
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {/* Official Excel Earthing Logo & Branding Header */}
          <View style={styles.header}>
            <Image
              source={require('../../../assets/excel_logo_hq_blue.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.brandTitle}>EXCEL EARTHING</Text>
            <Text style={styles.subTitle}>Staff Product Demonstration Portal</Text>
            <Text style={styles.taglineText}>Dedicated for Quality & Safety Since 1997</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Input
              label="Username / Employee ID"
              placeholder="e.g. ADM0001 or staff username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              leftIcon={<UserCheck size={18} color={colors.accentBlue} />}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              leftIcon={<Lock size={18} color={colors.accentBlue} />}
            />

            <Button
              title="Sign In to Demonstration Portal"
              onPress={handleLogin}
              loading={isLoading}
              variant="primary"
              size="lg"
              style={styles.submitBtn}
            />

            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>
                Authorized Sales & Technical Representative Access Only. Connected directly to CMS Backend API.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryNavy,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: 28,
    ...shadows.modal,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: 180,
    height: 70,
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primaryNavy,
    letterSpacing: 1,
  },
  subTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentBlue,
    marginTop: 2,
    textAlign: 'center',
  },
  taglineText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.amberGold,
    marginTop: 4,
    fontStyle: 'italic',
  },
  form: {
    width: '100%',
  },
  errorBox: {
    backgroundColor: 'rgba(200, 35, 51, 0.1)',
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.brandRed,
    marginBottom: 16,
  },
  errorText: {
    color: colors.brandRed,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  submitBtn: {
    marginTop: 12,
  },
  noticeBox: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  noticeText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});
