import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, userAPI } from "../services/api";
import { FEATURES, getApiBaseUrl } from "../core/config";
import { initPurchases } from "../billing/revenuecat";
import { syncPendingReports } from "../services/bugReportStorage";
import { parseTokens } from "../core/assistantTokens";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from storage on mount
  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    initPurchases(user?.id || user?.uid || user?.email || null).catch(() => {
      // Ignore init failures (missing keys in dev)
    });
  }, [user]);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("authToken");

      if (userData && token) {
        const parsedUser = JSON.parse(userData);
        if (typeof parsedUser.tokens !== "number") {
          parsedUser.tokens = parseTokens(parsedUser.tokens);
        }
        setUser(parsedUser);
        try {
          const freshUser = await authAPI.getMe();
          if (freshUser) {
            const nextUser = {
              ...freshUser,
              tokens: parseTokens(freshUser.tokens),
            };
            setUser(nextUser);
            await AsyncStorage.setItem("user", JSON.stringify(nextUser));
          }
        } catch (err) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            await logout();
          }
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      // Silently fail - user will need to login
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      // Use centralized mock flag
      if (FEATURES.MOCK_ALL_APIS) {
        // Admin account check
        const isAdmin =
          (email === "admin@nexus.com" && password === "admin") ||
          (email && email.toLowerCase().endsWith("@nexusbuild.app")) ||
          (email === "admin" && password === "admin");

        // Create mock user based on credentials
        const mockUser = {
          id: isAdmin ? "admin-001" : "user-" + Date.now(),
          email: email || "user@nexus.com",
          username: isAdmin ? "Admin" : email.split("@")[0] || "User",
          displayName: isAdmin
            ? "Administrator"
            : email.split("@")[0] || "PC Builder",
          role: isAdmin ? "admin" : "user", // Only admins get admin role
          is_admin: isAdmin,
          is_moderator: false,
          avatar: null,
          createdAt: new Date().toISOString(),
          tokens: isAdmin ? 10000 : 10000,
          profile: {
            bio: isAdmin
              ? "NexusBuild Administrator"
              : "PC Building Enthusiast",
            location: "Tech City",
            website: "",
          },
        };

        // Save token and user data
        const mockToken = isAdmin ? "ADMIN_TOKEN" : "DEV_TOKEN";
        await AsyncStorage.setItem("authToken", mockToken);
        await AsyncStorage.setItem("user", JSON.stringify(mockUser));
        setUser(mockUser);
        const baseUrl = getApiBaseUrl();
        if (baseUrl) {
          syncPendingReports(baseUrl).catch(() => {
            // Best-effort background sync after login
          });
        }

        return { success: true };
      }

      // Real backend call
      const data = await authAPI.login(email, password);
      await AsyncStorage.setItem("authToken", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      const baseUrl = getApiBaseUrl();
      if (baseUrl) {
        syncPendingReports(baseUrl).catch(() => {
          // Best-effort background sync after login
        });
      }
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed";
      const verificationRequired = Boolean(
        err.response?.data?.verification_required,
      );
      setError(errorMessage);
      return { success: false, error: errorMessage, verificationRequired };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    try {
      setLoading(true);
      setError(null);

      if (FEATURES.MOCK_ALL_APIS) {
        // Auto-Admin Logic: Check domain
        const isAdmin =
          email.toLowerCase().endsWith("@nexusbuild.app") ||
          email === "admin@nexus.com";

        // Trigger notification for Main Admin if new admin joins
        if (isAdmin) {
          try {
            const notification = {
              id: Date.now().toString(),
              type: "admin_alert",
              title: "New Admin Registered",
              message: `User ${username} (${email}) has registered with Admin privileges.`,
              date: new Date().toISOString(),
              read: false,
            };
            // Store in a shared admin inbox key
            const existing = await AsyncStorage.getItem("admin_notifications");
            const notifications = existing ? JSON.parse(existing) : [];
            notifications.unshift(notification);
            await AsyncStorage.setItem(
              "admin_notifications",
              JSON.stringify(notifications),
            );
          } catch (err) {
            console.error("Failed to notify admin", err);
          }
        }

        const mockUser = {
          id: isAdmin
            ? "admin-" + Math.random().toString(36).substr(2, 9)
            : "dev-" + Math.random().toString(36).substr(2, 9),
          email,
          username,
          displayName: username,
          role: isAdmin ? "admin" : "user",
          createdAt: new Date().toISOString(),
          tokens: 10000,
        };
        await AsyncStorage.setItem("authToken", "MOCK_TOKEN_" + Date.now());
        await AsyncStorage.setItem("user", JSON.stringify(mockUser));
        setUser(mockUser);
        const baseUrl = getApiBaseUrl();
        if (baseUrl) {
          syncPendingReports(baseUrl).catch(() => {
            // Best-effort background sync after login
          });
        }
        return { success: true };
      }

      const data = await authAPI.register(username, email, password);
      if (data?.token) {
        // Save token and user data only when the backend signs the user in immediately.
        await AsyncStorage.setItem("authToken", data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));

        setUser(data.user);
        const baseUrl = getApiBaseUrl();
        if (baseUrl) {
          syncPendingReports(baseUrl).catch(() => {
            // Best-effort background sync after login
          });
        }
        return { success: true };
      }

      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("user");
      setUser(null);
      return {
        success: true,
        verificationRequired: Boolean(data?.verification_required),
        message: data?.message || "Check your email to verify your account.",
        email,
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Registration failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await initPurchases(null);
      await authAPI.logout();
    } catch (err) {
      // Silently fail
    } finally {
      setUser(null);
      // Clear all user-related storage
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("authToken");
      // Clear chat history on logout
      await AsyncStorage.removeItem("@nexus_chat_history");
      await AsyncStorage.removeItem("@nexus_conversation_context");
    }
  };

  const updateUser = async (updates) => {
    if (!user) return;
    const nextUser = await userAPI.updateProfile(updates);
    const updatedUser = {
      ...user,
      ...nextUser,
      displayName:
        updates.displayName ||
        nextUser?.displayName ||
        nextUser?.username ||
        user.displayName,
      profile: {
        ...(user.profile || {}),
        ...(nextUser?.profile || {}),
        ...(updates.profile || {}),
      },
      avatar: updates.avatar || nextUser?.avatar || user.avatar,
    };
    setUser(updatedUser);
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const updateTokens = async (tokens) => {
    if (!user) return;
    const parsed = typeof tokens === "number" ? tokens : parseTokens(tokens);

    if (isNaN(parsed)) return;

    const nextUser = {
      ...user,
      tokens: parsed,
    };

    setUser(nextUser);
    await AsyncStorage.setItem("user", JSON.stringify(nextUser));
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    updateTokens,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
