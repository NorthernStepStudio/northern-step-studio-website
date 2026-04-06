import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import Builder from './pages/Builder';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Disclosure from './pages/Disclosure';
import CookiePolicy from './pages/CookiePolicy';
import Contact from './pages/Contact';
import './index.css';

// NOTE: Premium features like ChatBot, AI Concierge, Deals, etc.
// are hidden from this public Amazon-compliant site.
// These are reserved for paying NexusBuild members only.

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/builder" element={<Builder />} />

          {/* Legal & Support - Required for Amazon compliance */}
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/disclosure" element={<Disclosure />} />
          <Route path="/cookie" element={<CookiePolicy />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
        <Footer />
        {/* ChatBot removed - Premium feature for paying members */}
        {/* BugReportBtn removed - Internal tool */}
      </div>
    </Router>
  );
}

export default App;
