import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "../GlassCard";
import { useTheme } from "../../contexts/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "../../core/i18n";
import { adminAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminUsers() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === "admin" || user?.is_admin === true;

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await adminAPI.getUsers();
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load users", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleToggleModerator = async (target) => {
    if (!isAdmin) return;
    try {
      const updated = await adminAPI.updateUser(target.id, {
        is_moderator: !target.is_moderator,
      });
      if (updated?.user) {
        setUsers((prev) =>
          prev.map((u) => (u.id === target.id ? { ...u, ...updated.user } : u)),
        );
      }
    } catch (error) {
      console.error("Failed to update moderator status", error);
    }
  };

  const handleToggleSuspended = async (target) => {
    if (!isAdmin) return;
    try {
      const updated = await adminAPI.updateUser(target.id, {
        is_suspended: !target.is_suspended,
      });
      if (updated?.user) {
        setUsers((prev) =>
          prev.map((u) => (u.id === target.id ? { ...u, ...updated.user } : u)),
        );
      }
    } catch (error) {
      console.error("Failed to update suspension", error);
    }
  };

  const filteredUsers = users.filter(
    (item) =>
      (filter === "all" || item.role === filter) &&
      ((item.username || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        (item.email || "").toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const isPendingVerification = (item) =>
    item.email_verified === false && item.is_suspended;

  const renderUserItem = ({ item }) => (
    <GlassCard style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: theme.colors.accentPrimary },
            ]}
          >
            <Text style={styles.avatarText}>
              {(item.username || "?").charAt(0)}
            </Text>
          </View>
          <View>
            <Text
              style={[styles.userName, { color: theme.colors.textPrimary }]}
            >
              {item.username}
            </Text>
            <Text
              style={[styles.userEmail, { color: theme.colors.textSecondary }]}
            >
              {item.email}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isPendingVerification(item)
                ? "#F59E0B20"
                : item.is_suspended
                  ? "#EF444420"
                  : "#10B98120",
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color: isPendingVerification(item)
                  ? "#F59E0B"
                  : item.is_suspended
                    ? "#EF4444"
                    : "#10B981",
              },
            ]}
          >
            {isPendingVerification(item)
              ? "PENDING VERIFICATION"
              : item.is_suspended
                ? t("admin.status.banned").toUpperCase()
                : t("admin.status.active").toUpperCase()}
          </Text>
        </View>
      </View>

      <View
        style={[styles.divider, { backgroundColor: theme.colors.glassBorder }]}
      />

      <View style={styles.userStats}>
        <View style={styles.statItem}>
          <Ionicons
            name="construct-outline"
            size={16}
            color={theme.colors.textMuted}
          />
          <Text
            style={[styles.statText, { color: theme.colors.textSecondary }]}
          >
            {t("admin.users.builds", { count: item.builds_count || 0 })}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={theme.colors.textMuted}
          />
          <Text
            style={[styles.statText, { color: theme.colors.textSecondary }]}
          >
            {t("admin.users.joined", {
              date: item.created_at
                ? new Date(item.created_at).toLocaleDateString()
                : "-",
            })}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons
            name="shield-outline"
            size={16}
            color={theme.colors.textMuted}
          />
          <Text
            style={[styles.statText, { color: theme.colors.textSecondary }]}
          >
            {t(`admin.roles.${item.role}`)}
          </Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        {isAdmin ? (
          <>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                { borderColor: theme.colors.accentPrimary },
              ]}
              onPress={() => handleToggleModerator(item)}
            >
              <Text
                style={[
                  styles.actionBtnText,
                  { color: theme.colors.accentPrimary },
                ]}
              >
                {item.is_moderator ? "Revoke Mod" : "Make Mod"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: theme.colors.error }]}
              onPress={() => handleToggleSuspended(item)}
            >
              <Text
                style={[styles.actionBtnText, { color: theme.colors.error }]}
              >
                {item.is_suspended ? "Unsuspend" : "Suspend"}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text
            style={[styles.readOnlyText, { color: theme.colors.textMuted }]}
          >
            Read-only
          </Text>
        )}
      </View>
    </GlassCard>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={{ color: theme.colors.textSecondary }}>
          Loading users...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search and Filters */}
      <View style={styles.header}>
        <GlassCard style={styles.searchBar}>
          <Ionicons name="search" size={20} color={theme.colors.textMuted} />
          <TextInput
            style={[styles.input, { color: theme.colors.textPrimary }]}
            placeholder={t("admin.users.searchPlaceholder")}
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </GlassCard>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filters}
        >
          {["all", "admin", "user", "moderator"].map((role) => (
            <TouchableOpacity
              key={role}
              onPress={() => setFilter(role)}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    filter === role
                      ? theme.colors.accentPrimary
                      : theme.colors.glassBg,
                  borderColor:
                    filter === role
                      ? theme.colors.accentPrimary
                      : theme.colors.glassBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color:
                      filter === role ? "white" : theme.colors.textSecondary,
                  },
                ]}
              >
                {role === "all"
                  ? t("admin.filters.all")
                  : t(`admin.roles.${role}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 12,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filters: {
    flexDirection: "row",
    marginBottom: 5,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  filterText: {
    fontWeight: "600",
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 20,
  },
  userCard: {
    padding: 15,
    marginBottom: 15,
    borderRadius: 16,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  userStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
  readOnlyText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
