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
} from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsScreen() {
  const { user, isLoggedIn, login, logout } = useAuth();
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
      <View style={[styles.header, { paddingTop: 16 }]}>
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
                colors={["#6366F1", "#8B5CF6"]}
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
                <Mail color="#6366F1" size={18} />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{user?.email}</Text>
                </View>
              </View>
              {user?.phone ? (
                <View style={styles.detailRow}>
                  <Phone color="#6366F1" size={18} />
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>Phone Number</Text>
                    <Text style={styles.detailValue}>{user.phone}</Text>
                  </View>
                </View>
              ) : null}
              {user?.university ? (
                <View style={styles.detailRow}>
                  <Building2 color="#6366F1" size={18} />
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>University</Text>
                    <Text style={styles.detailValue}>{user.university}</Text>
                  </View>
                </View>
              ) : null}
              {user?.mbbs_year ? (
                <View style={styles.detailRow}>
                  <GraduationCap color="#6366F1" size={18} />
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
                  <CalendarClock color="#6366F1" size={18} />
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
                  <ShieldX color="#EF4444" size={18} />
                ) : (
                  <ShieldCheck color="#10B981" size={18} />
                )}
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Account Status</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      {
                        color:
                          user?.status === "Disabled" ? "#EF4444" : "#10B981",
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

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setContactVisible(true)}
              >
                <View style={styles.menuItemLeft}>
                  <View
                    style={[styles.menuIcon, { backgroundColor: "#DBEAFE" }]}
                  >
                    <Phone color="#3B82F6" size={20} />
                  </View>
                  <Text style={styles.menuItemText}>Contact Us</Text>
                </View>
                <ChevronRight color="#9CA3AF" size={20} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setTermsVisible(true)}
              >
                <View style={styles.menuItemLeft}>
                  <View
                    style={[styles.menuIcon, { backgroundColor: "#FEF3C7" }]}
                  >
                    <FileText color="#F59E0B" size={20} />
                  </View>
                  <Text style={styles.menuItemText}>Terms & Conditions</Text>
                </View>
                <ChevronRight color="#9CA3AF" size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleSignOut}
              >
                <View style={styles.menuItemLeft}>
                  <View
                    style={[styles.menuIcon, { backgroundColor: "#FEE2E2" }]}
                  >
                    <LogOut color="#EF4444" size={20} />
                  </View>
                  <Text style={[styles.menuItemText, { color: "#EF4444" }]}>
                    Logout
                  </Text>
                </View>
                <ChevronRight color="#9CA3AF" size={20} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Login Card */}
            <View style={styles.loginCard}>
              <View style={styles.loginIconContainer}>
                <LinearGradient
                  colors={["#6366F1", "#8B5CF6"]}
                  style={styles.loginIconGradient}
                >
                  <LogIn color="#FFFFFF" size={32} />
                </LinearGradient>
              </View>
              <Text style={styles.loginTitle}>Welcome to Medical Notes</Text>
              <Text style={styles.loginSubtitle}>
                Login with your registered email to access your courses
              </Text>

              <View style={styles.inputContainer}>
                <Mail color="#9CA3AF" size={20} />
                <TextInput
                  style={styles.emailInput}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
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

            {/* Still show Contact & Terms when logged out */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setContactVisible(true)}
              >
                <View style={styles.menuItemLeft}>
                  <View
                    style={[styles.menuIcon, { backgroundColor: "#DBEAFE" }]}
                  >
                    <Phone color="#3B82F6" size={20} />
                  </View>
                  <Text style={styles.menuItemText}>Contact Us</Text>
                </View>
                <ChevronRight color="#9CA3AF" size={20} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setTermsVisible(true)}
              >
                <View style={styles.menuItemLeft}>
                  <View
                    style={[styles.menuIcon, { backgroundColor: "#FEF3C7" }]}
                  >
                    <FileText color="#F59E0B" size={20} />
                  </View>
                  <Text style={styles.menuItemText}>Terms & Conditions</Text>
                </View>
                <ChevronRight color="#9CA3AF" size={20} />
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
                <X color="#6B7280" size={24} />
              </TouchableOpacity>
            </View>
            <View style={styles.contactItem}>
              <Mail color="#6366F1" size={20} />
              <Text style={styles.contactText}>abdul10761093174@gmail.com</Text>
            </View>
            <View style={styles.contactItem}>
              <Phone color="#6366F1" size={20} />
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
                Linking.openURL("mailto:support@mednotes.app");
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
                <X color="#6B7280" size={24} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
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
    color: "#1F2937",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
    color: "#6B7280",
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
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
    borderBottomColor: "#F3F4F6",
    gap: 14,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1F2937",
  },
  loginCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 24,
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  loginIconContainer: {
    marginBottom: 20,
  },
  loginIconGradient: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  loginSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    color: "#1F2937",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: "#6366F1",
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
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
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
    color: "#1F2937",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
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
    color: "#9CA3AF",
    marginTop: 32,
    marginBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
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
    color: "#1F2937",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  contactText: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },
  contactNote: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 20,
  },
  termsScroll: {
    maxHeight: 400,
    marginBottom: 16,
  },
  termsText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: "#6366F1",
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
