import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Share, Platform } from "react-native";
import * as Clipboard from "expo-clipboard";
import { buildsAPI } from "../services/api";
import { eventTracker } from "../state/eventTracker";
import { hydrateBuildBenchmarkScores } from "../core/performanceScore";

const BuildContext = createContext();

export const useBuild = () => {
  const context = useContext(BuildContext);
  if (!context) {
    throw new Error("useBuild must be used within BuildProvider");
  }
  return context;
};

export const BuildProvider = ({ children }) => {
  const [currentBuild, setCurrentBuild] = useState({
    name: "My Build",
    parts: {
      cpu: null,
      gpu: null,
      motherboard: null,
      ram: null,
      storage: null,
      psu: null,
      case: null,
      cooler: null,
      fan: null,
      monitor: null,
      keyboard: null,
      mouse: null,
      os: null,
      accessory: null,
    },
    budget: { min: 0, max: 0 },
    useCase: "gaming",
  });
  const [savedBuilds, setSavedBuilds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const currentBuildRef = useRef(currentBuild);

  // Load current build from storage on mount
  useEffect(() => {
    loadCurrentBuild();
  }, []);

  useEffect(() => {
    currentBuildRef.current = currentBuild;
  }, [currentBuild]);

  const loadCurrentBuild = async () => {
    try {
      const buildData = await AsyncStorage.getItem("currentBuild");
      if (buildData) {
        const hydratedBuild = hydrateBuildBenchmarkScores(
          JSON.parse(buildData),
        );
        currentBuildRef.current = hydratedBuild;
        setCurrentBuild(hydratedBuild);
        await AsyncStorage.setItem(
          "currentBuild",
          JSON.stringify(hydratedBuild),
        );
      }
    } catch (err) {
      // Silently fail - will use empty build
    }
  };

  const addPart = async (category, part) => {
    eventTracker.track("part_added", {
      category,
      name: part?.name,
      price: part?.price,
    });
    const baseBuild = currentBuildRef.current || currentBuild;
    const updatedBuild = {
      ...baseBuild,
      parts: {
        ...baseBuild.parts,
        [category]: part,
      },
    };
    const hydratedBuild = hydrateBuildBenchmarkScores(updatedBuild);
    currentBuildRef.current = hydratedBuild;
    setCurrentBuild(hydratedBuild);
    await AsyncStorage.setItem("currentBuild", JSON.stringify(hydratedBuild));
  };

  const removePart = async (category) => {
    eventTracker.track("part_removed", { category });
    const baseBuild = currentBuildRef.current || currentBuild;
    const updatedBuild = {
      ...baseBuild,
      parts: {
        ...baseBuild.parts,
        [category]: null,
      },
    };
    currentBuildRef.current = updatedBuild;
    setCurrentBuild(updatedBuild);
    await AsyncStorage.setItem("currentBuild", JSON.stringify(updatedBuild));
  };

  const clearBuild = async () => {
    eventTracker.track("build_cleared");
    const emptyBuild = {
      name: "My Build",
      parts: {
        cpu: null,
        gpu: null,
        motherboard: null,
        ram: null,
        storage: null,
        psu: null,
        case: null,
        cooler: null,
        fan: null,
        monitor: null,
        keyboard: null,
        mouse: null,
        os: null,
        accessory: null,
      },
      budget: { min: 0, max: 0 },
    };
    currentBuildRef.current = emptyBuild;
    setCurrentBuild(emptyBuild);
    await AsyncStorage.setItem("currentBuild", JSON.stringify(emptyBuild));
  };

  const setBudget = async (budget) => {
    eventTracker.track("budget_updated", { budget });
    const baseBuild = currentBuildRef.current || currentBuild;
    const updatedBuild = {
      ...baseBuild,
      budget: {
        ...baseBuild.budget,
        ...budget,
      },
    };
    currentBuildRef.current = updatedBuild;
    setCurrentBuild(updatedBuild);
    await AsyncStorage.setItem("currentBuild", JSON.stringify(updatedBuild));
  };

  const setUseCase = async (useCase) => {
    eventTracker.track("use_case_updated", { useCase });
    const baseBuild = currentBuildRef.current || currentBuild;
    const updatedBuild = {
      ...baseBuild,
      useCase,
    };
    currentBuildRef.current = updatedBuild;
    setCurrentBuild(updatedBuild);
    await AsyncStorage.setItem("currentBuild", JSON.stringify(updatedBuild));
  };

  const saveBuild = async () => {
    try {
      setLoading(true);
      setError(null);
      const latestBuild = currentBuildRef.current || currentBuild;
      const hydratedCurrentBuild = hydrateBuildBenchmarkScores(latestBuild);

      // Create build object with local ID
      const buildToSave = {
        id: `local_${Date.now()}`,
        name: hydratedCurrentBuild.name || "My Build",
        parts: { ...hydratedCurrentBuild.parts },
        total_price: getTotalPrice(),
        is_public: true,
        created_at: new Date().toISOString(),
        synced: false, // Track if synced to server
      };

      eventTracker.track("build_save_attempt", {
        name: buildToSave.name,
        total_price: buildToSave.total_price,
        part_count: getPartCount(),
      });

      // Save locally first (always works)
      const existingBuilds = await AsyncStorage.getItem(
        "nexusbuild_saved_builds",
      );
      const localBuilds = existingBuilds ? JSON.parse(existingBuilds) : [];
      localBuilds.push(buildToSave);
      await AsyncStorage.setItem(
        "nexusbuild_saved_builds",
        JSON.stringify(localBuilds),
      );
      setSavedBuilds(localBuilds);

      // Try to sync to server (optional, don't fail if offline)
      try {
        const buildPayload = {
          name: buildToSave.name,
          description: `Budget: $${currentBuild.budget?.min || 0}-${currentBuild.budget?.max || 0}`,
          parts: buildToSave.parts,
          totalPrice: buildToSave.total_price,
          is_public: true,
        };

        const data = await buildsAPI.create(buildPayload);

        // Update local build with server ID and mark as synced
        const updatedBuilds = localBuilds.map((b) =>
          b.id === buildToSave.id
            ? { ...(data.build || b), id: data.build?.id || b.id, synced: true }
            : b,
        );
        await AsyncStorage.setItem(
          "nexusbuild_saved_builds",
          JSON.stringify(updatedBuilds),
        );
        setSavedBuilds(updatedBuilds);
      } catch (syncError) {
        // Server sync failed - that's OK, build is saved locally
        console.log("Build saved locally, will sync when online");
      }

      return { success: true, build: buildToSave };
    } catch (err) {
      const errorMessage = err.message || "Failed to save build";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const loadUserBuilds = async (userId) => {
    try {
      setLoading(true);

      // Load local builds first (instantly available)
      const localBuildsData = await AsyncStorage.getItem(
        "nexusbuild_saved_builds",
      );
      const localBuilds = localBuildsData ? JSON.parse(localBuildsData) : [];
      setSavedBuilds(localBuilds);

      // Try to load from server (merge with local)
      try {
        const serverBuilds = await buildsAPI.getUserBuilds();
        if (serverBuilds && serverBuilds.length > 0) {
          // Merge server builds with local, avoiding duplicates
          const allBuilds = [...localBuilds];
          serverBuilds.forEach((serverBuild) => {
            const exists = allBuilds.some((b) => b.id === serverBuild.id);
            if (!exists) {
              allBuilds.push({ ...serverBuild, synced: true });
            }
          });
          await AsyncStorage.setItem(
            "nexusbuild_saved_builds",
            JSON.stringify(allBuilds),
          );
          setSavedBuilds(allBuilds);
        }
      } catch (syncErr) {
        // Server unavailable - that's OK, we have local builds
        console.log("Using local builds, server unavailable");
      }
    } catch (err) {
      // Fallback to empty
      setSavedBuilds([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteBuild = async (buildId) => {
    try {
      setLoading(true);

      // Delete from local storage
      const localBuildsData = await AsyncStorage.getItem(
        "nexusbuild_saved_builds",
      );
      let localBuilds = localBuildsData ? JSON.parse(localBuildsData) : [];
      localBuilds = localBuilds.filter((b) => b.id !== buildId);
      await AsyncStorage.setItem(
        "nexusbuild_saved_builds",
        JSON.stringify(localBuilds),
      );
      setSavedBuilds(localBuilds); // Optimistic update

      // Delete from server (if synced)
      try {
        if (!String(buildId).startsWith("local_")) {
          await buildsAPI.delete(buildId);
        }
      } catch (syncErr) {
        console.log("Server delete failed or offline", syncErr);
      }
      return { success: true };
    } catch (err) {
      console.error("Delete error:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getTotalPrice = () => {
    return Object.values((currentBuildRef.current || currentBuild).parts)
      .filter((part) => part !== null)
      .reduce((total, part) => total + (part.price || 0), 0);
  };

  const getPartCount = () => {
    return Object.values(
      (currentBuildRef.current || currentBuild).parts,
    ).filter((part) => part !== null).length;
  };

  const loadBuild = async (buildData) => {
    const baseBuild = currentBuildRef.current || currentBuild;
    const newBuild = {
      ...baseBuild,
      name: buildData.name || "Imported Build",
      parts: { ...baseBuild.parts },
    };

    Object.keys(newBuild.parts).forEach((key) => {
      if (buildData.parts && buildData.parts[key]) {
        newBuild.parts[key] = buildData.parts[key];
      }
    });

    const hydratedBuild = hydrateBuildBenchmarkScores(newBuild);
    currentBuildRef.current = hydratedBuild;
    setCurrentBuild(hydratedBuild);
    await AsyncStorage.setItem("currentBuild", JSON.stringify(hydratedBuild));
  };

  // Generate a shareable text summary of the build
  const generateBuildSummary = () => {
    const buildSnapshot = currentBuildRef.current || currentBuild;
    const parts = buildSnapshot.parts;
    const total = getTotalPrice();

    let summary = `🖥️ ${buildSnapshot.name}\n`;
    summary += `━━━━━━━━━━━━━━━━━━━━\n`;

    const partOrder = [
      "cpu",
      "gpu",
      "motherboard",
      "ram",
      "storage",
      "psu",
      "case",
      "cooler",
    ];
    const partLabels = {
      cpu: "💻 CPU",
      gpu: "🎮 GPU",
      motherboard: "🔌 Motherboard",
      ram: "💾 RAM",
      storage: "💿 Storage",
      psu: "⚡ PSU",
      case: "📦 Case",
      cooler: "❄️ Cooler",
    };

    partOrder.forEach((key) => {
      const part = parts[key];
      if (part) {
        summary += `${partLabels[key]}: ${part.name} - $${part.price}\n`;
      }
    });

    summary += `━━━━━━━━━━━━━━━━━━━━\n`;
    summary += `💰 Total: $${total.toFixed(2)}\n\n`;
    summary += `Built with NexusBuild ⚡`;

    return summary;
  };

  // Share build via native share dialog or copy to clipboard
  const shareBuild = async () => {
    const summary = generateBuildSummary();

    try {
      if (Platform.OS === "web") {
        // Web: copy to clipboard
        await Clipboard.setStringAsync(summary);
        eventTracker.track("build_shared", {
          method: "clipboard",
          success: true,
        });
        return { success: true, method: "clipboard" };
      } else {
        // Mobile: use native share
        const result = await Share.share({
          message: summary,
          title: currentBuild.name,
        });
        eventTracker.track("build_shared", {
          method: "native_share",
          success: result.action !== Share.dismissedAction,
        });
        return {
          success: result.action !== Share.dismissedAction,
          method: "share",
        };
      }
    } catch (error) {
      console.error("Share failed:", error);
      // Fallback to clipboard
      await Clipboard.setStringAsync(summary);
      eventTracker.track("build_shared", {
        method: "clipboard_fallback",
        success: true,
      });
      return { success: true, method: "clipboard" };
    }
  };

  // Copy build summary to clipboard
  const copyBuildToClipboard = async () => {
    const summary = generateBuildSummary();
    await Clipboard.setStringAsync(summary);
    eventTracker.track("build_copy_clipboard");
    return { success: true };
  };

  const setBuildName = async (name) => {
    const baseBuild = currentBuildRef.current || currentBuild;
    const updatedBuild = { ...baseBuild, name };
    currentBuildRef.current = updatedBuild;
    setCurrentBuild(updatedBuild);
    await AsyncStorage.setItem("currentBuild", JSON.stringify(updatedBuild));
  };

  const syncBuilds = async () => {
    setLoading(true);
    try {
      // Get local builds
      const local = await AsyncStorage.getItem("nexusbuild_saved_builds");
      const localBuilds = local ? JSON.parse(local) : [];

      // Call sync endpoint
      const response = await buildsAPI.sync({
        local_builds: localBuilds,
      });

      if (response.builds) {
        setSavedBuilds(response.builds);
        await AsyncStorage.setItem(
          "nexusbuild_saved_builds",
          JSON.stringify(response.builds),
        );

        return {
          success: true,
          stats: response.stats,
        };
      }
    } catch (err) {
      console.error("Sync error:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentBuild,
    savedBuilds,
    loading,
    error,
    addPart,
    removePart,
    clearBuild,
    setBudget,
    setUseCase,
    setBuildName,
    saveBuild,
    loadUserBuilds,
    loadBuild,
    getTotalPrice,
    getPartCount,
    generateBuildSummary,
    shareBuild,
    copyBuildToClipboard,
    syncBuilds,
    deleteBuild,
  };

  return (
    <BuildContext.Provider value={value}>{children}</BuildContext.Provider>
  );
};
