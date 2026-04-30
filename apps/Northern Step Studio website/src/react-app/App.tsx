import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { AuthProvider } from "@/react-app/lib/auth";
import ScrollToTop from "@/react-app/components/ScrollToTop";
import PageViewTracker from "@/react-app/components/PageViewTracker";
import BrandAccentizer from "@/react-app/components/BrandAccentizer";
import PublicLayout from "@/react-app/components/PublicLayout";
import AdminLayout from "@/react-app/components/AdminLayout";
import AccountSettingsLayout from "@/react-app/components/AccountSettingsLayout";
import ProtectedRoute from "@/react-app/components/ProtectedRoute";
import HomePage from "@/react-app/pages/Home";
import AppHub from "@/react-app/pages/AppHub";
import ProductDetail from "@/react-app/pages/ProductDetail";
import GameHub from "@/react-app/pages/GameHub";
import RoguelikeGame from "@/react-app/pages/games/RoguelikeGame";
import Blog from "@/react-app/pages/Blog";
import BlogPost from "@/react-app/pages/BlogPost";
import About from "@/react-app/pages/About";
import Contact from "@/react-app/pages/Contact";
import Services from "@/react-app/pages/Services";
import KnowledgeBase from "@/react-app/pages/KnowledgeBase";
import TermsOfService from "@/react-app/pages/TermsOfService";
// import NStepMissedCallTextBack from "@/react-app/pages/NStepMissedCallTextBack";
// import NStepMissedCallTextBackDemo from "@/react-app/pages/NStepMissedCallTextBackDemo";
import Updates from "@/react-app/pages/Updates";
import UserProfile from "@/react-app/pages/UserProfile";
import UserPreferences from "@/react-app/pages/UserPreferences";
import EditProfile from "@/react-app/pages/EditProfile";
import Login from "@/react-app/pages/Login";
import AdminLogin from "@/react-app/pages/AdminLogin";
import AuthCallback from "@/react-app/pages/AuthCallback";
import DocsArticle from "@/react-app/pages/DocsArticle";
import AdminDashboard from "@/react-app/pages/admin/Dashboard";
import AppManager from "@/react-app/pages/admin/AppManager";
import Analytics from "@/react-app/pages/admin/Analytics";
import ContentManager from "@/react-app/pages/admin/ContentManager";
import Leads from "@/react-app/pages/admin/Leads";
import PromoManager from "@/react-app/pages/admin/PromoManager";
import Users from "@/react-app/pages/admin/Users";
import Permissions from "@/react-app/pages/admin/Permissions";
import Revenue from "@/react-app/pages/admin/Revenue";
// import LeadRecovery from "@/react-app/pages/admin/LeadRecovery";
import StudioDashboard from "@/react-app/pages/StudioDashboard";
import CommunityManager from "@/react-app/pages/admin/CommunityManager";
import FeatureToggles from "@/react-app/pages/admin/FeatureToggles";
import MaintenanceSettings from "@/react-app/pages/admin/MaintenanceSettings";
import UpdatesManager from "@/react-app/pages/admin/UpdatesManager";
import MaintenancePage from "@/react-app/pages/MaintenancePage";
import NStepWorkspaceAI from "@/react-app/pages/NStepWorkspaceAI";
import TesterSignup from "@/react-app/pages/TesterSignup";
import TesterManager from "@/react-app/pages/admin/TesterManager";
import AdminProposals from "@/react-app/pages/admin/Proposals";
import NotFound from "@/react-app/pages/NotFound";
import { useState, useEffect } from "react";
import { useAuth } from "@/react-app/lib/auth";
import { isElevatedRole } from "@/shared/auth";

function MaintenanceCheck({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [maintenanceActive, setMaintenanceActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkMaintenance = async () => {
      try {
        const res = await fetch("/api/maintenance");
        const data = await res.json();

        if (!isMounted) return;

        setMaintenanceActive(data.is_active === 1 || data.is_active === true);
      } catch (err) {
        if (isMounted) {
          console.error("Failed to check maintenance:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void checkMaintenance();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (maintenanceActive && !isElevatedRole(user?.role)) {
    return <MaintenancePage />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrandAccentizer />
      <MaintenanceCheck>
        <Router>
          <ScrollToTop />
          <PageViewTracker />
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/apps" element={<ProtectedRoute feature="apps"><AppHub /></ProtectedRoute>} />
              <Route path="/apps/:slug" element={<ProtectedRoute feature="apps"><ProductDetail /></ProtectedRoute>} />
              <Route path="/games" element={<ProtectedRoute feature="games"><GameHub /></ProtectedRoute>} />
              <Route path="/games/doomed" element={<ProtectedRoute feature="games"><RoguelikeGame /></ProtectedRoute>} />
              <Route path="/blog" element={<ProtectedRoute feature="blog"><Blog /></ProtectedRoute>} />
              <Route path="/blog/:slug" element={<ProtectedRoute feature="blog"><BlogPost /></ProtectedRoute>} />
              <Route path="/about" element={<ProtectedRoute feature="about"><About /></ProtectedRoute>} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<ProtectedRoute feature="contact"><Contact /></ProtectedRoute>} />
              <Route path="/docs" element={<ProtectedRoute feature="docs"><KnowledgeBase /></ProtectedRoute>} />
              <Route path="/docs/:slug" element={<ProtectedRoute feature="docs"><DocsArticle /></ProtectedRoute>} />
              <Route path="/community" element={<Navigate to="/" replace />} />
              <Route path="/community/:category" element={<Navigate to="/" replace />} />
              <Route path="/community/thread/:slug" element={<Navigate to="/" replace />} />
              <Route path="/user/:userId" element={<ProtectedRoute feature="user_profiles"><UserProfile /></ProtectedRoute>} />
              <Route path="/profile" element={<UserProfile isOwnProfile />} />
              {/* <Route path="/missed-call-text-back" element={<NStepMissedCallTextBack />} /> */}
              {/* <Route path="/missed-call-text-back/demo" element={<NStepMissedCallTextBackDemo />} /> */}
              <Route path="/workspace-ai" element={<NStepWorkspaceAI />} />
              <Route path="/ai" element={<Navigate to="/" replace />} />
              <Route path="/testers" element={<TesterSignup />} />
              <Route path="/updates" element={<Updates />} />
              <Route path="/privacy" element={<TermsOfService />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/maintenance-preview" element={<MaintenancePage />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            {/* <Route path="/lead-recovery" element={<AdminLayout />}>
              <Route index element={<LeadRecovery />} />
            </Route> */}

            {/* Account settings */}
            <Route element={<AccountSettingsLayout />}>
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/preferences" element={<ProtectedRoute feature="user_preferences"><UserPreferences /></ProtectedRoute>} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="apps" element={<AppManager />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="leads" element={<Leads />} />
              {/* <Route path="lead-recovery" element={<LeadRecovery />} /> */}
              <Route path="content" element={<ContentManager />} />
              <Route path="promos" element={<PromoManager />} />
              <Route path="updates" element={<UpdatesManager />} />
              <Route path="users" element={<Users />} />
              <Route path="permissions" element={<Permissions />} />
              <Route path="revenue" element={<Revenue />} />
              <Route path="proposals" element={<AdminProposals />} />
              <Route path="testers" element={<TesterManager />} />
              <Route path="studio" element={<StudioDashboard />} />
              <Route path="community" element={<CommunityManager />} />
              <Route path="settings" element={<FeatureToggles />} />
              <Route path="maintenance" element={<MaintenanceSettings />} />
            </Route>
          </Routes>
        </Router>
      </MaintenanceCheck>
    </AuthProvider>
  );
}
