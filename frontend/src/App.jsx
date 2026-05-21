import React, { Suspense, lazy, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import LoadingSpinner from './components/ui/LoadingSpinner'
import ChatSupportBubble from './components/shared/ChatSupportBubble'
import useAuthStore from './stores/authStore'

// ── Lazy-loaded pages ──────────────────────────────────────────────────────────
const HomePage          = lazy(() => import('./pages/HomePage'))
const GameSelectionHub  = lazy(() => import('./pages/GameSelectionHub'))
const ProductDetail     = lazy(() => import('./pages/ProductDetail'))
const CekTransaksi      = lazy(() => import('./pages/CekTransaksi'))
const InvoicePage       = lazy(() => import('./pages/InvoicePage'))
const PaymentSuccess    = lazy(() => import('./pages/PaymentSuccess'))
const OrderDelivered    = lazy(() => import('./pages/OrderDelivered'))
const Leaderboard       = lazy(() => import('./pages/Leaderboard'))
const DigitalServices   = lazy(() => import('./pages/DigitalServices'))
const BuyerDashboard    = lazy(() => import('./pages/BuyerDashboard'))
const AdminDashboard    = lazy(() => import('./pages/AdminDashboard'))
const NotFound          = lazy(() => import('./pages/NotFound'))

// ── Protected Route Wrapper ────────────────────────────────────────────────────
function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/" replace />
  if (requireAdmin && !isAdmin()) return <Navigate to="/dashboard" replace />
  return children
}

// ── Page Wrapper with Navbar & Footer ─────────────────────────────────────────
function PageLayout({ children, fullWidth = false }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}

// ── Blank layout (no navbar/footer) ───────────────────────────────────────────
function BlankLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        {children}
      </main>
    </div>
  )
}

export default function App() {
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [registerModalOpen, setRegisterModalOpen] = useState(false)

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#151c29',
            color: '#dce2f5',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      <Suspense fallback={<LoadingSpinner fullscreen />}>
        <Routes>
          {/* ── Public Pages ─────────────────────────────────────── */}
          <Route path="/" element={
            <PageLayout>
              <HomePage
                openLogin={() => setLoginModalOpen(true)}
                openRegister={() => setRegisterModalOpen(true)}
                loginModalOpen={loginModalOpen}
                registerModalOpen={registerModalOpen}
                setLoginModalOpen={setLoginModalOpen}
                setRegisterModalOpen={setRegisterModalOpen}
              />
            </PageLayout>
          } />

          <Route path="/topup" element={
            <PageLayout>
              <GameSelectionHub />
            </PageLayout>
          } />

          <Route path="/topup/:slug" element={
            <PageLayout>
              <ProductDetail />
            </PageLayout>
          } />

          <Route path="/cek-transaksi" element={
            <PageLayout>
              <CekTransaksi />
            </PageLayout>
          } />

          <Route path="/leaderboard" element={
            <PageLayout>
              <Leaderboard />
            </PageLayout>
          } />

          <Route path="/layanan-digital" element={
            <PageLayout>
              <DigitalServices />
            </PageLayout>
          } />

          {/* ── Transaction Result Pages ──────────────────────────── */}
          <Route path="/invoice/:uuid" element={
            <PageLayout>
              <InvoicePage />
            </PageLayout>
          } />

          <Route path="/payment-success/:uuid" element={
            <BlankLayout>
              <PaymentSuccess />
            </BlankLayout>
          } />

          <Route path="/order-delivered/:uuid" element={
            <PageLayout>
              <OrderDelivered />
            </PageLayout>
          } />

          {/* ── Authenticated Pages ───────────────────────────────── */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <PageLayout>
                <BuyerDashboard />
              </PageLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/*" element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* ── 404 ──────────────────────────────────────────────── */}
          <Route path="*" element={<PageLayout><NotFound /></PageLayout>} />
        </Routes>
      </Suspense>
      <ChatSupportBubble />
    </BrowserRouter>
  )
}
