import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Constants from 'expo-constants';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/Header/AppHeader';
import { Button } from '../../components/Common/Button';
import { Input } from '../../components/Common/Input';
import { colors, radii, shadows } from '../../theme';
import {
  User,
  ShieldCheck,
  LogOut,
  Building,
  Award,
  KeyRound,
  Lock,
  X,
  CheckCircle2,
  Info,
} from 'lucide-react-native';
import { changeStaffPassword } from '../../api/auth';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  // Change Password Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const handleLogout = () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to sign out of the staff portal?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const handleOpenChangePassword = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg(null);
    setModalVisible(true);
  };

  const handleChangePassword = async () => {
    if (!oldPassword.trim()) {
      setErrorMsg('Please enter your current password.');
      return;
    }
    if (!newPassword.trim()) {
      setErrorMsg('Please enter a new password.');
      return;
    }
    if (newPassword.length < 4) {
      setErrorMsg('New password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const message = await changeStaffPassword(oldPassword, newPassword);
      setLoading(false);
      setModalVisible(false);
      Alert.alert('Success', message || 'Your password has been changed successfully.');
    } catch (err: any) {
      setLoading(false);
      const serverErr =
        err.response?.data?.detail ||
        err.response?.data?.old_password?.[0] ||
        err.response?.data?.new_password?.[0] ||
        'Failed to change password. Please verify your current password.';
      setErrorMsg(serverErr);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Staff Profile" showProfile={false} />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.avatarBox}>
            <User size={48} color={colors.accentBlue} />
          </View>

          <Text style={styles.username}>{user?.username || 'Staff Member'}</Text>
          <Text style={styles.roleTag}>{user?.role_display || 'Sales Representative'}</Text>

          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <ShieldCheck size={18} color={colors.accentBlue} />
              <Text style={styles.infoLabel}>Employee ID:</Text>
              <Text style={styles.infoVal}>{user?.employee_id || user?.username}</Text>
            </View>

            <View style={styles.infoRow}>
              <Building size={18} color={colors.accentBlue} />
              <Text style={styles.infoLabel}>Company:</Text>
              <Text style={styles.infoVal}>Excel Earthing</Text>
            </View>

            <View style={styles.infoRow}>
              <Award size={18} color={colors.amberGold} />
              <Text style={styles.infoLabel}>Role Scope:</Text>
              <Text style={styles.infoVal}>{user?.role || 'Staff Representative'}</Text>
            </View>
          </View>
        </View>

        {/* Security & Password Card */}
        <View style={styles.actionCard}>
          <Text style={styles.actionHeader}>Account Security</Text>
          <Button
            title="Change Account Password"
            onPress={handleOpenChangePassword}
            variant="outline"
            icon={<KeyRound size={18} color={colors.primaryNavy} />}
            size="lg"
          />
        </View>

        {/* Actions Card */}
        <View style={styles.actionCard}>
          <Text style={styles.actionHeader}>Portal Session</Text>
          <Button
            title="Sign Out of Portal"
            onPress={handleLogout}
            variant="danger"
            icon={<LogOut size={18} color="#FFFFFF" />}
            size="lg"
          />
        </View>

        {/* App Version Info */}
        <View style={styles.versionContainer}>
          <Info size={14} color={colors.textMuted} />
          <Text style={styles.versionText}>Excel Catalog Staff App v{appVersion}</Text>
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <KeyRound size={20} color="#FFFFFF" />
                <Text style={styles.modalHeaderTitle}>Change Password</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody} contentContainerStyle={{ gap: 14 }}>
              {errorMsg ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              <Text style={styles.inputLabel}>Current Password *</Text>
              <Input
                placeholder="Enter current password"
                secureTextEntry
                value={oldPassword}
                onChangeText={setOldPassword}
                leftIcon={<Lock size={16} color={colors.textMuted} />}
              />

              <Text style={styles.inputLabel}>New Password *</Text>
              <Input
                placeholder="Enter new password (min 4 chars)"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                leftIcon={<KeyRound size={16} color={colors.textMuted} />}
              />

              <Text style={styles.inputLabel}>Confirm New Password *</Text>
              <Input
                placeholder="Re-enter new password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                leftIcon={<CheckCircle2 size={16} color={colors.textMuted} />}
              />
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <Button
                title="Cancel"
                onPress={() => setModalVisible(false)}
                variant="outline"
                style={{ flex: 1 }}
              />
              <Button
                title="Update Password"
                onPress={handleChangePassword}
                loading={loading}
                variant="primary"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  avatarBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(13, 96, 174, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  username: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primaryNavy,
  },
  roleTag: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.amberGold,
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radii.full,
    marginTop: 4,
    marginBottom: 20,
  },
  infoList: {
    width: '100%',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 90,
  },
  infoVal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  actionCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
    ...shadows.card,
  },
  actionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 19, 41, 0.85)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    maxHeight: '90%',
    overflow: 'hidden',
    ...shadows.modal,
  },
  modalHeader: {
    height: 56,
    backgroundColor: colors.primaryNavy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 10,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
});
