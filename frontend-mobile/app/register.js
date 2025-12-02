import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { userAPI } from '../src/services/api';
import { theme } from '../src/styles/theme';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    university: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.university) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const users = await userAPI.getAll();
      if (users.some(u => u.email === formData.email)) {
        Alert.alert('Error', 'Email already registered');
        setLoading(false);
        return;
      }

      const newUser = await userAPI.create({
        ...formData,
        passwordHash: formData.password,
      });

      login(newUser);
      router.replace('/(tabs)/profile');
    } catch (error) {
      let errorMessage = 'Registration failed';
      const attemptedUrl = error.config?.baseURL + error.config?.url;
      
      if (error.message === 'Network Error' || error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || !error.response) {
        errorMessage = `Cannot connect to server.\n\nAttempted URL: ${attemptedUrl || 'Unknown'}\n\nTroubleshooting:\n1. Verify backend is running\n2. Check IP in api.js (line ~12)\n3. Same Wi-Fi network?\n4. Test URL in phone browser`;
      } else if (error.response) {
        errorMessage = error.response.data?.message || error.response.statusText || `Server error: ${error.response.status}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('Registration error:', {
        error,
        attemptedUrl,
        fullError: JSON.stringify(error, null, 2),
      });
      Alert.alert('Registration Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🎓</Text>
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join SkillSwap to start exchanging skills</Text>

          <View style={styles.glassCard}>
            <View style={styles.form}>
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.firstName}
                    onChangeText={(value) => handleChange('firstName', value)}
                    placeholder="First name"
                    placeholderTextColor={theme.colors.textMuted}
                    autoCapitalize="words"
                    autoComplete="given-name"
                    autoCorrect={false}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.lastName}
                    onChangeText={(value) => handleChange('lastName', value)}
                    placeholder="Last name"
                    placeholderTextColor={theme.colors.textMuted}
                    autoCapitalize="words"
                    autoComplete="family-name"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(value) => handleChange('email', value)}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(value) => handleChange('password', value)}
                  placeholder="Create a password"
                  placeholderTextColor={theme.colors.textMuted}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password-new"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>University</Text>
                <TextInput
                  style={styles.input}
                  value={formData.university}
                  onChangeText={(value) => handleChange('university', value)}
                  placeholder="Your university"
                  placeholderTextColor={theme.colors.textMuted}
                  autoCapitalize="words"
                />
              </View>

              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Sign Up'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => router.push('/login')}
              >
                <Text style={styles.linkText}>
                  Already have an account? <Text style={styles.linkTextBold}>Sign in</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgPrimary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.xxxl,
    backgroundColor: theme.colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.glow,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  glassCard: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.xxxl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    ...theme.shadows.glass,
  },
  form: {
    gap: theme.spacing.lg,
  },
  inputRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  inputGroup: {
    gap: theme.spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  input: {
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    borderRadius: theme.borderRadius.xxxl,
    padding: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  button: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: theme.colors.accentPrimary,
    ...theme.shadows.glass,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  linkButton: {
    marginTop: theme.spacing.sm,
  },
  linkText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontSize: 14,
  },
  linkTextBold: {
    color: theme.colors.accentPrimary,
    fontWeight: '700',
  },
});
