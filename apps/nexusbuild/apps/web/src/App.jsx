import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import './index.css';

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

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/builder" element={<Builder />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/builds" element={<Builds />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/guide" element={<Guide />} />

            {/* Legal & Support */}
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/disclosure" element={<Disclosure />} />
            <Route path="/cookie" element={<CookiePolicy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/testers" element={<TesterSignup />} />
            <Route path="/demo/:slug" element={<DemoPage />} />
            <Route path="/apps/:slug" element={<ProductDetail />} />

            {/* Admin redirects to the NSS website */}
            <Route path="/admin" element={<AdminRedirect mode="admin" />} />
            <Route path="/moderator" element={<AdminRedirect mode="moderator" />} />
            <Route path="/admin/reports" element={<AdminRedirect mode="reports" />} />
            <Route path="/admin/testers" element={<TesterManager />} />
          </Routes>
        </Suspense>
        <Footer />
        <Suspense fallback={null}>
          <ChatBot />
          <BugReportBtn />
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
