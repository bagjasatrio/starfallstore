import React, { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

export default function ChatSupportBubble() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  if (location.pathname.startsWith('/admin')) return null

  const waNumber = import.meta.env.VITE_CS_WHATSAPP_NUMBER || '6283874644294'
  const tgUsername = import.meta.env.VITE_CS_TELEGRAM_USERNAME || 'starfall_cs'

  const waLink = `https://wa.me/${waNumber}?text=Halo%20StarfallStore...`
  const tgLink = `https://t.me/${tgUsername}`

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="mb-4 bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-3 shadow-2xl w-56 flex flex-col gap-2 origin-bottom-right"
          >
            {/* WhatsApp Option */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-500/10 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/30 transition-colors">
                <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-5.824 4.74-10.563 10.564-10.563 5.826 0 10.564 4.738 10.564 10.563 0 5.825-4.738 10.563-10.564 10.563z"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary group-hover:text-emerald-400 transition-colors">WhatsApp Support</p>
                <p className="text-xs text-text-muted">Balasan Cepat</p>
              </div>
            </a>

            {/* Telegram Option */}
            <a
              href={tgLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-electric-blue/10 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-electric-blue/20 flex items-center justify-center shrink-0 group-hover:bg-electric-blue/30 transition-colors">
                <svg className="w-5 h-5 text-electric-blue" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.195-.054-.306-.346-.111l-6.4 4.024-2.76-.864c-.6-.188-.616-.605.126-.894l10.785-4.158c.499-.187.942.115.775.844z"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary group-hover:text-electric-blue transition-colors">Telegram Community</p>
                <p className="text-xs text-text-muted">Grup & Info Promo</p>
              </div>
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-14 h-14 rounded-full flex items-center justify-center bg-slate-900 border transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)] ${
          isOpen ? 'border-electric-blue' : 'border-cyan-500/30 hover:border-electric-blue'
        }`}
        animate={
          !isOpen
            ? {
                boxShadow: [
                  '0 0 15px rgba(6,182,212,0.4)',
                  '0 0 25px rgba(6,182,212,0.6)',
                  '0 0 15px rgba(6,182,212,0.4)',
                ],
              }
            : {}
        }
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} className="text-text-primary" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle size={24} className="text-cyan-glow" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
