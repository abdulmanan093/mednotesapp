import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Linking,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  User,
  LogOut,
  LogIn,
  Mail,
  Phone,
  FileText,
  ChevronRight,
  X,
  GraduationCap,
  Building2,
  CalendarClock,
  ShieldCheck,
  ShieldX,
  Moon,
} from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeColors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { user, isLoggedIn, login, logout } = useAuth();
  const { theme, isDark, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);

  const [contactVisible, setContactVisible] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  async function handleLogin() {
    if (!loginEmail.trim()) {
      setLoginError("Please enter your email address.");
      return;
    }
    setLoginError("");
    setLoginLoading(true);
    const result = await login(loginEmail);
    setLoginLoading(false);
    if (!result.success) {
      setLoginError(result.error || "Login failed.");
    } else {
      setLoginEmail("");
    }
  }

  function handleSignOut() {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {isLoggedIn ? (
          <>
            {/* User Profile Card */}
            <View style={styles.profileCard}>
              <LinearGradient
                colors={[theme.primaryGradientStart, theme.primaryGradientEnd]}
                style={styles.avatarGradient}
              >
                <User color="#FFFFFF" size={32} />
              </LinearGradient>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.name}</Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
              </View>
            </View>

            {/* User Details */}
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Mail color={theme.primary} size={18} />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{user?.email}</Text>
                </View>
              </View>
              {user?.phone ? (
                <View style={styles.detailRow}>
                  <Phone color={theme.primary} size={18} />
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>Phone Number</Text>
                    <Text style={styles.detailValue}>{user.phone}</Text>
                  </View>
                </View>
              ) : null}
              {user?.university ? (
                <View style={styles.detailRow}>
                  <Building2 color={theme.primary} size={18} />
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>University</Text>
                    <Text style={styles.detailValue}>{user.university}</Text>
                  </View>
                </View>
              ) : null}
              {user?.mbbs_year ? (
                <View style={styles.detailRow}>
                  <GraduationCap color={theme.primary} size={18} />
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>MBBS Year</Text>
                    <Text style={styles.detailValue}>
                      Year {user.mbbs_year}
                    </Text>
                  </View>
                </View>
              ) : null}
              {user?.access_end ? (
                <View style={styles.detailRow}>
                  <CalendarClock color={theme.primary} size={18} />
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>Access Expires</Text>
                    <Text style={styles.detailValue}>
                      {new Date(user.access_end).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Text>
                  </View>
                </View>
              ) : null}
              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                {user?.status === "Disabled" ? (
                  <ShieldX color={theme.error} size={18} />
                ) : (
                  <ShieldCheck color={theme.success} size={18} />
                )}
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Account Status</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      {
                        color:
                          user?.status === "Disabled" ? theme.error : theme.success,
                      },
                    ]}
                  >
                    {user?.status === "Disabled" ? "Inactive" : "Active"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Menu Items */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>General</Text>

              <View style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <View
                    style={[styles.menuIcon, { backgroundColor: theme.primaryLight }]}
                  >
                    <Moon color={theme.primary} size={20} />
                  </View>
                  <Text style={styles.menuItemText}>Dark Mode</Text>
                </View>
                <Switch 
                  value={isDark} 
                  onValueChange={(val) => setMode(val ? "dark" : "light")} 
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setContactVisible(true)}
              >
                <View style={styles.menuItemLeft}>
                  <View
                    style={[styles.menuIcon, { backgroundColor: theme.infoLight }]}
                  >
                    <Phone color={theme.info} size={20} />
                  </View>
                  <Text style={styles.menuItemText}>Contact Us</Text>
                </View>
                <ChevronRight color={theme.textPlaceholder} size={20} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setTermsVisible(true)}
              >
                <View style={styles.menuItemLeft}>
                  <View
                    style={[styles.menuIcon, { backgroundColor: theme.warningLight }]}
                  >
                    <FileText color={theme.warning} size={20} />
                  </View>
                  <Text style={styles.menuItemText}>Terms & Conditions</Text>
                </View>
                <ChevronRight color={theme.textPlaceholder} size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleSignOut}
              >
                <View style={styles.menuItemLeft}>
                  <View
                    style={[styles.menuIcon, { backgroundColor: theme.errorLight }]}
                  >
                    <LogOut color={theme.error} size={20} />
                  </View>
                  <Text style={[styles.menuItemText, { color: theme.error }]}>
                    Logout
                  </Text>
                </View>
                <ChevronRight color={theme.textPlaceholder} size={20} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Login Card */}
            <View style={styles.loginCardWrapper}>
              <LinearGradient
                colors={["#6366F1", "#3B82F6", "#8B5CF6"]}
                style={styles.loginCardBorder}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.loginCard}>
                  <View style={styles.loginIconContainer}>
                    <View style={styles.loginIconBackground}>
                      <Image
                        source={require("@/assets/images/logo.png")}
                        style={styles.loginImage}
                        resizeMode="cover"
                      />
                    </View>
                  </View>
              <Text style={styles.loginTitle}>Welcome to Medical Notes</Text>
              <Text style={styles.loginSubtitle}>
                Login with your registered email to access your courses
              </Text>

              <View style={styles.inputContainer}>
                <Mail color={theme.textPlaceholder} size={20} />
                <TextInput
                  style={styles.emailInput}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.textPlaceholder}
                  value={loginEmail}
                  onChangeText={(t) => {
                    setLoginEmail(t);
                    setLoginError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {loginError ? (
                <Text style={styles.errorText}>{loginError}</Text>
              ) : null}

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

            {/* Still show Contact & Terms when logged out */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>General</Text>
              
              <View style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <View
                    style={[styles.menuIcon, { backgroundColor: theme.primaryLight }]}
                  >
                    <Moon color={theme.primary} size={20} />
                  </View>
                  <Text style={styles.menuItemText}>Dark Mode</Text>
                </View>
                <Switch 
                  value={isDark} 
                  onValueChange={(val) => setMode(val ? "dark" : "light")} 
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setContactVisible(true)}
              >
                <View style={styles.menuItemLeft}>
                  <View
                    style={[styles.menuIcon, { backgroundColor: theme.infoLight }]}
                  >
                    <Phone color={theme.info} size={20} />
                  </View>
                  <Text style={styles.menuItemText}>Contact Us</Text>
                </View>
                <ChevronRight color={theme.textPlaceholder} size={20} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setTermsVisible(true)}
              >
                <View style={styles.menuItemLeft}>
                  <View
                    style={[styles.menuIcon, { backgroundColor: theme.warningLight }]}
                  >
                    <FileText color={theme.warning} size={20} />
                  </View>
                  <Text style={styles.menuItemText}>Terms & Conditions</Text>
                </View>
                <ChevronRight color={theme.textPlaceholder} size={20} />
              </TouchableOpacity>
            </View>
          </>
        )}

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>

      {/* Contact Us Modal */}
      <Modal visible={contactVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Contact Us</Text>
              <TouchableOpacity onPress={() => setContactVisible(false)}>
                <X color={theme.textMuted} size={24} />
              </TouchableOpacity>
            </View>
            <View style={styles.contactItem}>
              <Mail color={theme.primary} size={20} />
              <Text style={styles.contactText}>abdul10761093174@gmail.com</Text>
            </View>
            <View style={styles.contactItem}>
              <Phone color={theme.primary} size={20} />
              <Text style={styles.contactText}>+923106078374</Text>
            </View>
            <Text style={styles.contactNote}>
              We typically respond within 24 hours. Feel free to reach out for
              any queries regarding your account or courses.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setContactVisible(false);
                Linking.openURL("mailto:abdul10761093174@gmail.com");
              }}
            >
              <Text style={styles.modalButtonText}>Send Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Terms & Conditions Modal */}
      <Modal visible={termsVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Terms & Conditions</Text>
              <TouchableOpacity onPress={() => setTermsVisible(false)}>
                <X color={theme.textMuted} size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.termsScroll}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.termsText}>
                {`1. Privacy\nWe do not collect any personal information or track your location.\n\n2. Content Protection\nDo not attempt to take screenshots or record the screen while using the app.\n\n3. Account Usage\nLogging in on multiple devices is prohibited. If your account is suspended due to this, additional charges will apply to reactivate it.\n\n4. Downloads\nDo not attempt to download or share PDF content from the app.\n\n5. Termination\nWe reserve the right to terminate or suspend your account for any violation of these terms.`}
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setTermsVisible(false)}
            >
              <Text style={styles.modalButtonText}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.text,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.card,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarGradient: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: theme.textMuted,
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
    color: theme.textMuted,
  },
  detailsCard: {
    backgroundColor: theme.card,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.background,
    gap: 14,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.textPlaceholder,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "500",
    color: theme.text,
  },
  loginCardWrapper: {
    marginHorizontal: 16,
    marginTop: 24,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  loginCardBorder: {
    padding: 2,
    borderRadius: 24,
  },
  loginCard: {
    backgroundColor: theme.card,
    padding: 32,
    borderRadius: 22, 
    alignItems: "center",
  },
  loginIconContainer: {
    marginBottom: 20,
    backgroundColor: theme.card,
    borderRadius: 28,
    padding: 4,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  loginIconBackground: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden", 
  },
  loginImage: {
    width: "100%",
    height: "100%",
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 8,
    textAlign: "center",
  },
  loginSubtitle: {
    fontSize: 14,
    color: theme.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    width: "100%",
    marginBottom: 12,
    gap: 12,
  },
  emailInput: {
    flex: 1,
    fontSize: 15,
    color: theme.text,
  },
  errorText: {
    color: theme.error,
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
    marginTop: 4,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  section: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.text,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  version: {
    textAlign: "center",
    fontSize: 13,
    color: theme.textPlaceholder,
    marginTop: 32,
    marginBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.text,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    padding: 12,
    backgroundColor: theme.background,
    borderRadius: 12,
  },
  contactText: {
    fontSize: 15,
    color: theme.text,
    fontWeight: "500",
  },
  contactNote: {
    fontSize: 14,
    color: theme.textMuted,
    lineHeight: 20,
    marginBottom: 20,
  },
  termsScroll: {
    maxHeight: 400,
    marginBottom: 16,
  },
  termsText: {
    fontSize: 14,
    color: theme.text,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
