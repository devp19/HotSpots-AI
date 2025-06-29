'use client';

import { InteractiveHoverButton } from '@/components/magicui/interactive-hover-button';
import { AnimatedSubscribeButton } from '@/components/magicui/animated-subscribe-button';
import { TextAnimate } from '@/components/magicui/text-animate';
import { motion } from 'framer-motion';
import { Globe } from '@/components/magicui/globe';
// import { RetroGrid } from '@/components/magicui/retro-grid';
import { TextReveal } from '@/components/magicui/text-reveal';
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AnimatedBeam } from '@/components/magicui/animated-beam';
import { Cpu, User, Settings } from 'lucide-react';
import React, { forwardRef, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { VelocityScroll } from '@/components/magicui/scroll-based-velocity';
import { Meteors } from '@/components/magicui/meteors';

const heatDeathsData = [
  { year: '', deaths: 250000 },
  { year: "2020", deaths: 410000 },
  { year: "2021", deaths: 425000 },
  { year: "2022", deaths: 440000 },
  { year: "2023", deaths: 460000 },
  { year: "2024", deaths: 489000 },
];

const heatDeathsConfig = {
  deaths: {
    label: "Heat Deaths",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const Rectangle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex min-w-[120px] min-h-[48px] items-center justify-center rounded-lg border-2 border-border bg-white px-4 py-2 shadow-[0_0_20px_-12px_rgba(0,0,0,0.08)] text-center",
        className,
      )}
    >
      {children}
    </div>
  );
});
Rectangle.displayName = "Rectangle";

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-12 items-center justify-center rounded-full border-2 border-border bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        className,
      )}
    >
      {children}
    </div>
  );
});
Circle.displayName = "Circle";

const Chip = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex items-center justify-center rounded-full bg-[#fbbf24]/20 border border-[#fbbf24] px-6 py-2 font-semibold text-[#7c3aed] shadow-sm text-sm whitespace-nowrap",
        className,
      )}
    >
      {children}
    </div>
  );
});
Chip.displayName = "Chip";

const TOOLTIP_HIDE_DELAY = 300;

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const input1Ref = useRef<HTMLDivElement>(null);
  const input2Ref = useRef<HTMLDivElement>(null);
  const input3Ref = useRef<HTMLDivElement>(null);
  const chipRef = useRef<HTMLDivElement>(null);
  const geminiRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const geeRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [showTunedTooltip, setShowTunedTooltip] = useState(false);
  const tunedTimeout = useRef<NodeJS.Timeout | null>(null);
  const [showGeeTooltip, setShowGeeTooltip] = useState(false);
  const geeTimeout = useRef<NodeJS.Timeout | null>(null);

  function handleTunedEnter() {
    if (tunedTimeout.current) clearTimeout(tunedTimeout.current);
    setShowTunedTooltip(true);
  }
  function handleTunedLeave() {
    tunedTimeout.current = setTimeout(() => setShowTunedTooltip(false), TOOLTIP_HIDE_DELAY);
  }

  function handleGeeEnter() {
    if (geeTimeout.current) clearTimeout(geeTimeout.current);
    setShowGeeTooltip(true);
  }
  function handleGeeLeave() {
    geeTimeout.current = setTimeout(() => setShowGeeTooltip(false), TOOLTIP_HIDE_DELAY);
  }

  return (
    <div className="flex flex-col items-center min-h-screen px-4 sm:px-8 md:px-16 lg:px-32 xl:px-0 max-w-5xl mx-auto relative bg-white text-[#2a2a2a]">
      <section className="w-full flex flex-col items-center justify-center min-h-screen relative overflow-hidden" style={{padding: '10vw 2vw'}}>
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Meteors number={32} />
        </div>
        <motion.div
          className="wordmark flex items-center justify-center mt-0 relative z-10"
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
          <span className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'NeueHaasDisplay, Neue, sans-serif' }}>tSpots</span>
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
              View 3D City Map Visualization
            </InteractiveHoverButton>
          </a>
          <AnimatedSubscribeButton
            className="bg-[#f86d10] text-white hover:bg-white hover:text-[#f86d10] border border-[#f86d10] transition-colors duration-300 rounded-full px-6 py-2 hover:outline hover:outline-1 hover:outline-[#f86d10] focus:outline focus:outline-2 focus:outline-[#f86d10]"
            onClick={() => {
              const el = document.getElementById('text-reveal-section');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            <span>Learn More</span>
            <span>Learn More</span>
          </AnimatedSubscribeButton>
        </div>
      </section>

      <section id="text-reveal-section" className="w-full flex flex-col items-center text-center justify-start h-[300vh]">
        <TextReveal className="title text-left">
          {`It's SUPER hot outside. We know. But consider those who are especially vulnerable.`}
        </TextReveal>
      </section>

      <section className="w-full flex flex-col items-center justify-center min-h-screen text-center max-w-xl mx-auto -mt-272">
        <TextAnimate animation="slideUp" by="word" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
          489,000 heat-related deaths occur annually.
        </TextAnimate>
        <TextAnimate animation="slideUp" by="word" className="text-lg sm:text-xl text-[#444]">
          nothing's being done and that's increasing due to global warming.
        </TextAnimate>
      </section>

      <section className="w-full flex flex-col items-center justify-center -mt-64">
        <div className="w-full flex flex-col md:flex-row gap-8 items-center justify-center max-w-4xl mx-auto">
          <div className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0">
            <div className="[perspective:1200px] w-full flex justify-center">
              <Card className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 w-full max-w-md flex flex-col shadow-xl" style={{ transform: 'rotateY(-8deg) rotateX(6deg)' }}>
                <CardHeader>
                  <CardTitle>Heat-related deaths by year</CardTitle>
                  <CardDescription>
                    Rising global heat-related deaths, 2020–2024
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={heatDeathsConfig}>
                    <AreaChart
                      accessibilityLayer
                      data={heatDeathsData}
                      margin={{ left: 12, right: 12 }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="year"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="line" />}
                      />
                      <Area
                        dataKey="deaths"
                        type="natural"
                        fill="var(--color-deaths)"
                        fillOpacity={0.4}
                        stroke="var(--color-deaths)"
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter>
                  <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2 leading-none font-medium">
                        Trending up to 489,000 by 2025 <TrendingUp className="h-4 w-4" />
                      </div>
                      <div className="text-muted-foreground flex items-center gap-2 leading-none">
                        2020 - 2024
                      </div>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
          <div className="w-full md:w-1/2 flex flex-col justify-center gap-6">
            <TextAnimate
              animation="slideUp"
              by="word"
              as="p"
              className="max-w-xl text-left text-base text-gray-700"
              delay={0.2}
            >
              {`Heat-related deaths are rising each year due to climate change, urban heat islands, and vulnerable populations lacking access to cooling or green space. Addressing these issues is critical for public health and urban resilience.`}
            </TextAnimate>
          </div>
        </div>
      </section>

      <section
        id="what-we-did-section"
        className="w-full flex flex-col items-center justify-center min-h-[40vh] text-center scroll-mt-8"
      >
        <TextAnimate animation="slideUp" by="word" as="h2" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 mt-70">
          So what did we do about it?
        </TextAnimate>
        <TextAnimate animation="slideUp" by="word" as="p" className="text-lg text-[#444] mb-8">
          We put on our thinking caps and built a machine learning model that accurately showcases "HotSpots" in Toronto based on vegetation and urban island heat influencing factors.
        </TextAnimate>
        <p className="text-lg text-[#444] mb-8 mt-2">
          TLDR; Check for trees and building density around a specific location. Mix it in with temperatures and some special ML magic and you get a heat vulnerability score.
        </p>
        <div className="-ml-20 w-full">
          <AnimatedBeamMultipleOutputDemo />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-8">
          <div className="flex flex-col items-center">
            <img src="/NDVI.gif" alt="NDVI raster gif" className="w-80 rounded-lg shadow" />
            <div className="mt-20 text-sm text-[#444] text-left w-80">
              <div className="font-semibold">Google Earth Rasterization of NDVI</div>
              NDVI raster shows vegetation health and density across Toronto, with brighter areas indicating more vegetation.
            </div>
          </div>
          <div className="flex flex-col items-center">
            <img src="/LST.gif" alt="LST raster gif" className="w-80 rounded-lg shadow" />
            <div className="mt-20 text-sm text-[#444] text-left w-80">
              <div className="font-semibold">Google Earth Rasterization of LST</div>
               LST raster shows land surface temperature across Toronto, with brighter areas indicating higher temperatures (hotter urban heat islands) <br /> <br />*Notice how areas near the waterbody are darker which corresponds to cooler temperatures.
            </div>
          </div>
        </div>
        <div className="w-full my-12 relative mt-40 mb-40" style={{ minHeight: '4.5rem' }}>
          <div className="pointer-events-none absolute top-0 left-0 h-full w-12 z-10" style={{ background: 'linear-gradient(to right, white 80%, transparent)' }} />
          <div className="pointer-events-none absolute top-0 right-0 h-full w-12 z-1" style={{ background: 'linear-gradient(to left, white 80%, transparent)' }} />
          <VelocityScroll defaultVelocity={6} numRows={2} className="text-[#2a2a2a] relative z-0" >
            Machine Learning Model Dataframes
          </VelocityScroll>
        </div>

        <section className="w-full flex flex-col items-center justify-center mt-12 max-w-5xl mx-auto px-4">
          <TextAnimate animation="slideUp" by="word" as="h3" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
            Data Classifications for ML Model
          </TextAnimate>
          <div className="max-w-2xl mx-auto mt-2 text-base text-[#444] text-center">
            <TextAnimate animation="slideUp" by="word" as="span">
              As part of feature extraction, we rasterized both building density and tree density into uniform 100 m grid cells across Toronto.
            </TextAnimate>
            <br /><br />
            These become two of the three columns in our feature matrix <span className="font-mono">X</span> (the third being normalized temperature). We then fed <span className="font-mono">X</span> into our Random Forest, which learned how those spatial patterns combine to predict heat‐vulnerability scores.
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-8">
            <div className="flex flex-col items-center">
              <div style={{ perspective: '1200px' }}>
                <img src="/TreeDensity.png" alt="Tree Density raster" className="w-96 rounded-lg shadow-2xl" style={{ transform: 'rotateY(-8deg) rotateX(6deg)' }} />
              </div>
              <div className="mt-6 text-sm text-[#444] text-left w-96">
                <div className="font-semibold">Tree Density Raster</div>
                Tree density raster shows the distribution of tree cover across Toronto. Each pixel in the grid represents the density of trees in that area—brighter areas indicate higher tree density, while darker areas indicate fewer trees.<br/>
                <br />
                <span className="italic">In ML terms: Vegetation input (proxy for NDVI), representing normalized tree/vegetation cover for each 100 m cell.</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div style={{ perspective: '1200px' }}>
                <img src="/BuildingDensity.png" alt="Building Density raster" className="w-96 rounded-lg shadow-2xl" style={{ transform: 'rotateY(8deg) rotateX(6deg)' }} />
              </div>
              <div className="mt-6 text-sm text-[#444] text-left w-96">
                <div className="font-semibold">Building Density Raster</div>
                Building density raster shows the concentration of buildings across Toronto. Each pixel in the grid represents the density of buildings in that area—brighter areas indicate more buildings, while darker areas indicate fewer buildings.<br/>
                <br />
                <span className="italic">In ML terms: Urbanization input, showing how built-up each grid cell is (m² of roof per 10,000 m²).</span>
              </div>
            </div>
          </div>
        </section>
      </section>

      <section className="w-full flex flex-col items-center justify-center mt-40 mb-16 max-w-lg mx-auto">
        <TextAnimate animation="slideUp" by="word" as="h3" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-center">
          Enough Technical Talk. Check out the 3D City Visualization
        </TextAnimate>
        <div>
          <a href="/visualize" style={{ textDecoration: 'none' }}>
            <AnimatedSubscribeButton className="bg-[#f86d10] text-white hover:bg-white hover:text-[#f86d10] border border-[#f86d10] transition-colors duration-300 rounded-full px-8 py-3 text-lg font-semibold mt-4 hover:outline hover:outline-2 hover:outline-[#f86d10]">
              <span>Go to Visualization</span>
              <span>Go to Visualization</span>
            </AnimatedSubscribeButton>
          </a>
        </div>
      </section>

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

function AnimatedBeamMultipleOutputDemo({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const input1Ref = useRef<HTMLDivElement>(null);
  const input2Ref = useRef<HTMLDivElement>(null);
  const input3Ref = useRef<HTMLDivElement>(null);
  const chipRef = useRef<HTMLDivElement>(null);
  const geminiRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const geeRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [showGeminiTooltip, setShowGeminiTooltip] = useState(false);
  const [showVulnTooltip, setShowVulnTooltip] = useState(false);
  const [showTunedTooltip, setShowTunedTooltip] = useState(false);
  const geminiTimeout = useRef<NodeJS.Timeout | null>(null);
  const vulnTimeout = useRef<NodeJS.Timeout | null>(null);
  const tunedTimeout = useRef<NodeJS.Timeout | null>(null);
  const [showGeeTooltip, setShowGeeTooltip] = useState(false);
  const geeTimeout = useRef<NodeJS.Timeout | null>(null);

  function handleGeminiEnter() {
    if (geminiTimeout.current) clearTimeout(geminiTimeout.current);
    setShowGeminiTooltip(true);
  }
  function handleGeminiLeave() {
    geminiTimeout.current = setTimeout(() => setShowGeminiTooltip(false), TOOLTIP_HIDE_DELAY);
  }
  function handleVulnEnter() {
    if (vulnTimeout.current) clearTimeout(vulnTimeout.current);
    setShowVulnTooltip(true);
  }
  function handleVulnLeave() {
    vulnTimeout.current = setTimeout(() => setShowVulnTooltip(false), TOOLTIP_HIDE_DELAY);
  }
  function handleTunedEnter() {
    if (tunedTimeout.current) clearTimeout(tunedTimeout.current);
    setShowTunedTooltip(true);
  }
  function handleTunedLeave() {
    tunedTimeout.current = setTimeout(() => setShowTunedTooltip(false), TOOLTIP_HIDE_DELAY);
  }
  function handleGeeEnter() {
    if (geeTimeout.current) clearTimeout(geeTimeout.current);
    setShowGeeTooltip(true);
  }
  function handleGeeLeave() {
    geeTimeout.current = setTimeout(() => setShowGeeTooltip(false), TOOLTIP_HIDE_DELAY);
  }

  return (
    <div
      className={cn(
        "relative flex h-[400px] w-full items-center justify-center overflow-visible p-10",
        className,
      )}
      ref={containerRef}
    >
      <div className="flex size-full flex-row items-stretch justify-start gap-10">
        <div className="flex flex-col justify-center gap-4">
          <Rectangle ref={input1Ref} className="min-w-[180px]">Normalized Difference Vegetation Index (NDVI)</Rectangle>
          <Rectangle ref={input2Ref} className="min-w-[180px]">Land Surface Temperature (LST)</Rectangle>
          <Rectangle ref={input3Ref} className="min-w-[180px] mt-3">Building Footprint Density</Rectangle>
        </div>
        <div className="flex flex-col justify-center ml-16 mb-10">
          <div
            className="relative flex flex-col items-center justify-center"
            onMouseEnter={handleGeeEnter}
            onMouseLeave={handleGeeLeave}
          >
            <Rectangle ref={geeRef} className="font-semibold text-[#f86d10] border-[#f86d10] bg-white flex flex-col items-center justify-center">
              <svg className="w-8 h-8 mb-1" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <g>
                  <path fill="#f86d10" d="M43.6 20.5H42V20.4H24V27.6H35.2C34 31.1 30.4 33.6 26 33.6C20.5 33.6 16 29.1 16 23.6C16 18.1 20.5 13.6 26 13.6C28.3 13.6 30.4 14.4 32.1 15.8L37 11C34.1 8.4 30.3 6.8 26 6.8C16.6 6.8 9 14.4 9 23.6C9 32.8 16.6 40.4 26 40.4C34.7 40.4 42 33.6 42 23.6C42 22.5 41.9 21.5 41.7 20.5Z"/>
                </g>
              </svg>
              <span className="text-sm">Google Earth Engine</span>
            </Rectangle>
            {showGeeTooltip && (
              <div className="absolute left-1/2 top-0 z-50 flex flex-col items-center" style={{ transform: 'translate(-50%, -120%)' }}>
                <div className="bg-white border border-[#888] rounded-lg shadow-lg p-6 max-w-xs w-[320px] text-left">
                  <h3 className="text-lg font-bold mb-4 text-[#888] text-left">Google Earth Engine</h3>
                  <div className="bg-gray-100 rounded p-4 text-[#2a2a2a] text-sm text-left">
                    <div className="mb-2">
                      <div><span className="font-semibold">Exported Data:</span> LST & NDVI rasters, building footprints</div>
                    </div>
                    {/* <div className="mb-2">
                      <span className="font-semibold">LST raster:</span> Land Surface Temperature (LST) raster is a grid-based image where each pixel represents the temperature of the Earth's surface at that location.<br/>
                      <span className="font-semibold">NDVI raster:</span> Normalized Difference Vegetation Index (NDVI) raster is a grid-based image where each pixel quantifies vegetation health and density, ranging from -1 (no vegetation) to 1 (dense, healthy vegetation).
                    </div> */}
                    Downloaded building footprints provided the spatial outlines of buildings in the study area.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <div
            className="relative flex flex-col items-center justify-center"
            onMouseEnter={handleVulnEnter}
            onMouseLeave={handleVulnLeave}
          >
            <Rectangle ref={chipRef} className="font-semibold text-[#f86d10] border-[#f86d10] bg-white flex flex-col items-center justify-center">
              <Settings className="w-7 h-7 mb-1 text-[#f86d10]" />
              Vulnerability ML-Model
            </Rectangle>
            {showVulnTooltip && (
              <div className="absolute left-1/2 top-0 z-50 flex flex-col items-center" style={{ transform: 'translate(-50%, -120%)' }}>
                <div className="bg-white border border-[#888] rounded-lg shadow-lg p-6 max-w-xs w-[260px] text-left">
                  <h3 className="text-lg font-bold mb-4 text-[#888] text-left">Custom Random Forest Model</h3>
                  <div className="bg-gray-100 rounded p-4 text-[#2a2a2a] text-sm text-left">
                    <div className="mb-2">
                      <div><span className="font-semibold">R² score:</span> 0.87</div>
                      <div><span className="font-semibold">MAE:</span> 0.13</div>
                      <div><span className="font-semibold">Initial weights:</span> {'{ w1: 0.5, w2: 0.3, w3: 0.2 }'}</div>
                    </div>
                    Combines input features (NDVI, LST, Building Density) using a machine learning model to estimate urban heat vulnerability for each location.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <div
            className="relative flex flex-col items-center justify-center"
            onMouseEnter={handleGeminiEnter}
            onMouseLeave={handleGeminiLeave}
          >
            <Rectangle ref={geminiRef} className="size-16 border-[#f86d10]">
              <Cpu className="w-10 h-10 text-[#f86d10]" />
            </Rectangle>
            <div className="mt-2 text-center text-xs font-semibold text-[#f86d10]">Gemini-2.5-Flash Tuner</div>
            {showGeminiTooltip && (
              <div className="absolute left-1/2 top-0 z-50 flex flex-col items-center"
                   style={{ transform: 'translate(-50%, -120%)' }}>
                <div className="bg-white border border-[#888] rounded-lg shadow-lg p-6 max-w-md w-[320px] text-left">
                  <h3 className="text-lg font-bold mb-4 text-[#888] text-left">Gemini RAW JSON Output</h3>
                  <div className="bg-gray-100 rounded p-4 text-[#2a2a2a] text-sm overflow-x-auto text-left max-h-48 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">
{`Full API response: {
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "json\n{\n  \"w1\": 0.6,\n  \"w2\": 0.2,\n  \"w3\": 0.2\n}\n"
          }
        ],
        "role": "model"
      },
      "finishReason": "STOP",
      "avgLogprobs": -0.02066226750612259
    }
  ],
  "modelVersion": "gemini-2.0-flash",
  "usageMetadata": {
    "promptTokenCount": 1516,
    "candidatesTokenCount": 40,
    "totalTokenCount": 1556,
    "promptTokensDetails": [
      {
        "modality": "TEXT",
        "tokenCount": 1516
      }
    ],
    "candidatesTokensDetails": [
      {
        "modality": "TEXT",
        "tokenCount": 40
      }
    ]
  }
}
Raw text reply:
 json
{
  "w1": 0.6,
  "w2": 0.2,
  "w3": 0.2
}
Cleaned JSON text:
 {
   "w1": 0.6,
   "w2": 0.2,
   "w3": 0.2
 }
➜ New weights: { w1: 0.6, w2: 0.2, w3: 0.2 }`}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <div
            className="relative flex flex-col items-center justify-center"
            onMouseEnter={handleTunedEnter}
            onMouseLeave={handleTunedLeave}
          >
            <Rectangle ref={outputRef} className="min-w-[260px] max-w-xs p-4 flex flex-col items-center justify-center border-2 border-[#f86d10] text-[#f86d10] bg-white shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-6 h-6 text-[#f86d10]" />
                <span className="font-semibold text-sm text-[#f86d10]">Tuned Weights</span>
              </div>
              <pre className="text-xs bg-gray-50 rounded p-2 text-left w-full whitespace-pre-line border border-gray-200" style={{ color: '#2a2a2a' }}>
{`{
  w1: 0.6,  // temperature
  w2: 0.2,  // vegetation
  w3: 0.2   // buildings
}`}
              </pre>
            </Rectangle>
            {showTunedTooltip && (
              <div className="absolute left-1/2 top-0 z-50 flex flex-col items-center" style={{ transform: 'translate(-50%, -120%)' }}>
                <div className="bg-white border border-[#888] rounded-lg shadow-lg p-6 max-w-xs w-[260px] text-left">
                  <h3 className="text-lg font-bold mb-4 text-[#888] text-left">Tuned Weights</h3>
                  <div className="bg-gray-100 rounded p-4 text-[#2a2a2a] text-sm text-left">
                    <div className="mb-2">
                      <div><span className="font-semibold">New R² score:</span> 0.91</div>
                      <div><span className="font-semibold">New MAE:</span> 0.09</div>
                    </div>
                    These weights were optimized by Gemini for improved model performance.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <AnimatedBeam containerRef={containerRef} fromRef={input1Ref} toRef={geeRef} pathColor="#000" gradientStartColor="#000" gradientStopColor="#000" />
      <AnimatedBeam containerRef={containerRef} fromRef={input2Ref} toRef={geeRef} pathColor="#000" gradientStartColor="#000" gradientStopColor="#000" />
      <AnimatedBeam containerRef={containerRef} fromRef={input3Ref} toRef={chipRef} pathColor="#000" gradientStartColor="#000" gradientStopColor="#000" />
      <AnimatedBeam containerRef={containerRef} fromRef={geeRef} toRef={chipRef} pathColor="#f86d10" gradientStartColor="#f86d10" gradientStopColor="#f86d10" />
      <AnimatedBeam containerRef={containerRef} fromRef={chipRef} toRef={geminiRef} pathColor="#f86d10" gradientStartColor="#f86d10" gradientStopColor="#f86d10" />
      <AnimatedBeam containerRef={containerRef} fromRef={geminiRef} toRef={outputRef} pathColor="#f86d10" gradientStartColor="#f86d10" gradientStopColor="#f86d10" />
    </div>
  );
}