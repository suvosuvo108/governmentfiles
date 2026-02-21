
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { FileProvider } from './context/FileContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Processing from './pages/Processing';
import Download from './pages/Download';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Security from './pages/Security';
import Cookies from './pages/Cookies';
import Contact from './pages/Contact';
import About from './pages/About';
import Blog from './pages/Blog';
import Press from './pages/Press';
import Tools from './pages/Tools';
import SuggestFeature from './pages/SuggestFeature';
import LockConfig from './pages/LockConfig';
import CompressImageConfig from './pages/CompressImageConfig';
import MergeConfig from './pages/MergeConfig';
import CompressPdfConfig from './pages/CompressPdfConfig';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <FileProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/tools/:category" element={<Tools />} />
                <Route path="/tools/:category/:subCategory" element={<Tools />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/processing" element={<Processing />} />
                <Route path="/download" element={<Download />} />
                <Route path="/lock-config" element={<LockConfig />} />
                <Route path="/compress-image" element={<CompressImageConfig />} />
                <Route path="/compress-pdf" element={<CompressPdfConfig />} />
                <Route path="/merge-config" element={<MergeConfig />} />
                <Route path="/suggest" element={<SuggestFeature />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/security" element={<Security />} />
                <Route path="/cookies" element={<Cookies />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/press" element={<Press />} />
              </Routes>
            </Layout>
          </Router>
        </FileProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
