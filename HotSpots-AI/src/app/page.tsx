// File: pages/index.tsx
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

// Chart data for heat-related deaths by year
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

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen px-4 sm:px-8 md:px-16 lg:px-32 xl:px-0 max-w-5xl mx-auto relative bg-white text-[#2a2a2a]">
      {/* Landing Section */}
      <section className="w-full flex flex-col items-center justify-center min-h-screen" style={{padding: '10vw 2vw'}}>
        <motion.div
          className="wordmark flex items-center justify-center mt-0"
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
      </section>

      {/* Text Reveal Section */}
      <section className="w-full flex flex-col items-center text-center justify-start h-[300vh]">
        <TextReveal className="title text-left">
          {`It's SUPER hot outside. We know. But consider those who are especially vulnerable.`}
        </TextReveal>
      </section>

      {/* Heat Deaths Section */}
      <section className="w-full flex flex-col items-center justify-center min-h-screen text-center max-w-xl mx-auto -mt-272">
        <TextAnimate animation="slideUp" by="word" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
          489,000 heat-related deaths occur annually.
        </TextAnimate>
        <TextAnimate animation="slideUp" by="word" className="text-lg sm:text-xl text-[#444]">
          nothing's being done and that's increasing due to global warming.
        </TextAnimate>
      </section>

      {/* Chart and Description Section */}
      <section className="w-full flex flex-col items-center justify-center -mt-64">
        <div className="w-full flex flex-col md:flex-row gap-8 items-center justify-center max-w-4xl mx-auto">
          <div className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0">
            {/* Tilted Chart Card */}
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
                      {/* No YAxis rendered to hide the y axis */}
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

      {/* What Did We Do Section */}
      <section className="w-full flex flex-col items-center justify-center min-h-[40vh] text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">So what did we do about it?</h2>
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