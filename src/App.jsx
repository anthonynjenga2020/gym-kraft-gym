import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import config from './config/gym.config.json'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import WhatsAppButton from './components/WhatsAppButton.jsx'
import PreviewBanner from './components/PreviewBanner.jsx'

// Pages
import HomePage from './pages/HomePage.jsx'
import ClassesPage from './pages/ClassesPage.jsx'
import TrainersPage from './pages/TrainersPage.jsx'
import TrainerPage from './pages/TrainerPage.jsx'
import ReviewPage from './pages/ReviewPage.jsx'

// Hide navbar/footer/whatsapp button on the /review page
function Layout({ children }) {
  const { pathname } = useLocation()
  const isReview = pathname === '/review'
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--bg)',
        // Push content down when preview top-bar is visible
        paddingTop: config.isPreview ? '32px' : undefined,
        // Push content up from preview bottom-bar
        paddingBottom: config.isPreview ? '80px' : undefined,
      }}
    >
      {!isReview && <Navbar config={config} />}
      {children}
      {!isReview && <Footer config={config} />}
      {!isReview && <WhatsAppButton config={config} />}
      {config.isPreview && <PreviewBanner config={config} />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"                    element={<HomePage    config={config} />} />
          <Route path="/classes"             element={<ClassesPage config={config} />} />
          <Route path="/trainers"            element={<TrainersPage config={config} />} />
          <Route path="/trainers/:trainerId" element={<TrainerPage  config={config} />} />
          <Route path="/review"              element={<ReviewPage   config={config} />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
