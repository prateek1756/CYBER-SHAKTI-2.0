import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar.tsx';
import Footer from './components/Footer.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import Index from './pages/Index.tsx';
import Scanner from './pages/Scanner.tsx';
import Alerts from './pages/Alerts.tsx';
import Tips from './pages/Tips.tsx';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-cyber-dark text-cyber-text">
        <NavBar />
        <main className="flex-grow pt-16">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/scanner" element={<Scanner />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/tips" element={<Tips />} />
            </Routes>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
