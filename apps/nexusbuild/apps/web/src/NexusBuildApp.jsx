import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import { AuthProvider } from './contexts/AuthContext';
import { BuildProvider } from './contexts/BuildContext';
import './NexusBuildScoped.css';

const Builder = lazy(() => import('./pages/Builder'));
const Builds = lazy(() => import('./pages/Builds'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Deals = lazy(() => import('./pages/Deals'));
const Guide = lazy(() => import('./pages/Guide'));
const About = lazy(() => import('./pages/About'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const Disclosure = lazy(() => import('./pages/Disclosure'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const Contact = lazy(() => import('./pages/Contact'));
const AdminRedirect = lazy(() => import('./pages/AdminRedirect'));
const TesterSignup = lazy(() => import('./pages/TesterSignup'));
const TesterManager = lazy(() => import('./pages/TesterManager'));
const DemoPage = lazy(() => import('./pages/DemoPage'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const ChatBot = lazy(() => import('./components/ChatBot'));
const BugReportBtn = lazy(() => import('./components/BugReportBtn'));

function RouteFallback() {
  return (
    <div className="container" style={{ padding: '4rem 0', minHeight: '40vh' }}>
      <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
    </div>
  );
}

/**
 * ðŸš€ NEXUSBUILD EMBEDDED APP
 *
 * This component is designed to be mounted within a parent Router.
 * It provides its own Auth and Build contexts.
 */
export default function NexusBuildApp() {
  return (
    <AuthProvider>
      <BuildProvider>
        <div className="nexusbuild-app-root">
          <Navigation isEmbedded={true} />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home isEmbedded={true} />} />
              <Route path="/builder" element={<Builder isEmbedded={true} />} />
              <Route path="/login" element={<Login isEmbedded={true} />} />
              <Route path="/register" element={<Register isEmbedded={true} />} />
              <Route path="/builds" element={<Builds isEmbedded={true} />} />
              <Route path="/deals" element={<Deals isEmbedded={true} />} />
              <Route path="/guide" element={<Guide isEmbedded={true} />} />

              {/* Legal & Support */}
              <Route path="/about" element={<About isEmbedded={true} />} />
              <Route path="/privacy" element={<PrivacyPolicy isEmbedded={true} />} />
              <Route path="/terms" element={<TermsOfService isEmbedded={true} />} />
              <Route path="/disclosure" element={<Disclosure isEmbedded={true} />} />
              <Route path="/cookie" element={<CookiePolicy isEmbedded={true} />} />
              <Route path="/contact" element={<Contact isEmbedded={true} />} />
              <Route path="/testers" element={<TesterSignup isEmbedded={true} />} />
              <Route path="/demo/:slug" element={<DemoPage isEmbedded={true} />} />
              <Route path="/apps/:slug" element={<ProductDetail isEmbedded={true} />} />

              {/* Admin redirects to the NSS website */}
              <Route path="/admin" element={<AdminRedirect isEmbedded={true} mode="admin" />} />
              <Route path="/moderator" element={<AdminRedirect isEmbedded={true} mode="moderator" />} />
              <Route path="/admin/reports" element={<AdminRedirect isEmbedded={true} mode="reports" />} />
              <Route path="/admin/testers" element={<TesterManager isEmbedded={true} />} />
            </Routes>
          </Suspense>
          <Footer isEmbedded={true} />
          <Suspense fallback={null}>
            <ChatBot isEmbedded={true} />
            <BugReportBtn />
          </Suspense>
        </div>
      </BuildProvider>
    </AuthProvider>
  );
}
