// File: pages/index.tsx
'use client';

import { InteractiveHoverButton } from '@/components/magicui/interactive-hover-button';
import { AnimatedSubscribeButton } from '@/components/magicui/animated-subscribe-button';
import { TextAnimate } from '@/components/magicui/text-animate';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: '#fff',
        color: '#2a2a2a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '5vw 2vw',
        boxSizing: 'border-box',
      }}
    >
      <motion.div
        className="wordmark flex items-center justify-center mt-8 mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.1, delay: 0.2 }}
      >
        <span className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'NeueHaasDisplay, Neue, sans-serif' }}>H</span>
        <img
          src="/firegif2.gif"
          alt="Fire Icon"
          style={{
            width: 32,
            height: 32,
            marginBottom: 10,
            objectFit: 'contain',
            verticalAlign: 'middle',
            display: 'inline-block',
          }}
        />
        <span className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'NeueHaasDisplay, Neue, sans-serif' }}>TSpots</span>
        <span className="text-2xl font-semibold text-[#888]" style={{ fontFamily: 'NeueHaasDisplay, Neue, sans-serif', marginBottom: -3 }}>.ai</span>
      </motion.div>
      <motion.h1
        className="slogan text-6xl sm:text-7xl md:text-8xl font-bold text-center mb-6 mt-3 leading-tight max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.4 }}
      >
        Mapping heat, growing green.
      </motion.h1>
      <TextAnimate
        animation="slideUp"
        by="word"
        className="text-[15px] mb-8 text-[#444] text-center max-w-[480px]"
      >
        Explore urban heat vulnerability and tree planting priorities in Toronto for sustainable development.
      </TextAnimate>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 16, marginBottom: 24 }}>
        <a href="/visualize" style={{ textDecoration: 'none' }}>
          <InteractiveHoverButton style={{ border: '1.2px solid #2a2a2a' }}>
            View Visualization
          </InteractiveHoverButton>
        </a>
        <AnimatedSubscribeButton
          className="bg-black text-white hover:bg-white hover:text-black border border-black transition-colors duration-300 rounded-full px-6 py-2 hover:outline hover:outline-1 hover:outline-black"
        >
          <span>Learn More</span>
          <span>Learn More</span>
        </AnimatedSubscribeButton>
      </div>
      <style jsx global>{`
        @font-face {
          font-family: 'NeueHaasDisplay';
          src: url('/fonts/NeueHaasDisplayMediu.woff') format('woff');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        @keyframes fire-flicker {
          0% { transform: scale(1) rotate(-2deg); filter: brightness(1.05); }
          10% { transform: scale(1.04, 0.98) rotate(2deg); filter: brightness(1.15); }
          20% { transform: scale(0.98, 1.02) rotate(-1deg); filter: brightness(0.95); }
          30% { transform: scale(1.03, 0.97) rotate(1deg); filter: brightness(1.1); }
          40% { transform: scale(1, 1.04) rotate(-2deg); filter: brightness(1.05); }
          50% { transform: scale(1.05, 0.96) rotate(2deg); filter: brightness(1.2); }
          60% { transform: scale(0.97, 1.03) rotate(-1deg); filter: brightness(0.9); }
          70% { transform: scale(1.02, 0.99) rotate(1deg); filter: brightness(1.1); }
          80% { transform: scale(1, 1.02) rotate(-2deg); filter: brightness(1.05); }
          90% { transform: scale(1.04, 0.98) rotate(2deg); filter: brightness(1.15); }
          100% { transform: scale(1) rotate(-2deg); filter: brightness(1.05); }
        }
      `}</style>
    </div>
  );
}
