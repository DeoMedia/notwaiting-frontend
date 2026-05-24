Replace your current HERO section with this slider version.

It gives you:

2 slides
Both slides have Join the movement →
Red / yellow / green campaign design
Image-led layout like your references
Manual dots + auto-slide

First add state near the top of your component:

const [activeHero, setActiveHero] = useState(0);

useEffect(() => {
  const timer = setInterval(() => {
    setActiveHero((prev) => (prev === 0 ? 1 : 0));
  }, 6000);

  return () => clearInterval(timer);
}, []);

Then replace your hero with this:

{/* HERO SLIDER */}
<section className="relative min-h-screen bg-white text-[#0C0C0A] overflow-hidden">
  {/* SLIDE 1 */}
  <div
    className={`absolute inset-0 transition-opacity duration-700 ${
      activeHero === 0 ? "opacity-100 z-10" : "opacity-0 z-0"
    }`}
  >
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Left graphic area */}
      <div className="relative flex items-center justify-center px-6 lg:px-20 pt-24 overflow-hidden">
        <div className="absolute w-[680px] h-[420px] bg-[#EBBD06] rounded-[50%] rotate-[-18deg] left-[-90px] top-[120px]" />
        <div className="absolute w-[560px] h-[310px] bg-[#027A4F] rounded-[50%] rotate-[-10deg] left-[130px] bottom-[80px]" />
        <div className="absolute w-[720px] h-[440px] border border-white/80 rounded-[50%] rotate-[-15deg] left-[-60px] top-[90px]" />

        <div className="relative z-10 max-w-xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#DD3935] font-bold mb-2">
            Entertainment, Tech, Finance, Agriculture & More
          </p>

          <h1 className="text-4xl md:text-6xl font-black uppercase leading-[0.9] text-[#DD3935] mb-5">
            Join The African Wave
          </h1>

          <p className="font-mono text-sm md:text-base leading-relaxed font-bold max-w-md text-black">
            Africa is building, creating and leading right now.
            On the 25th of May, we make it impossible to ignore.
            Wear the mark. Declare your wave. Pass it on.
          </p>

          <Button
            onClick={scrollToSignOn}
            className="mt-8 bg-[#DD3935] hover:bg-[#C92F2B] text-white text-lg px-10 py-6 rounded-none font-bold"
          >
            Join the movement →
          </Button>
        </div>
      </div>

      {/* Right image area */}
      <div className="relative min-h-[420px] lg:min-h-screen overflow-hidden">
        <img
          src={heroImage}
          alt="#NotWaiting campaign portrait"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/5 to-white/40 lg:hidden" />
      </div>
    </div>
  </div>

  {/* SLIDE 2 */}
  <div
    className={`absolute inset-0 transition-opacity duration-700 ${
      activeHero === 1 ? "opacity-100 z-10" : "opacity-0 z-0"
    }`}
  >
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Left abstract graphic */}
      <div className="relative flex items-center justify-center px-6 lg:px-20 pt-24 overflow-hidden">
        <div className="absolute w-[760px] h-[520px] bg-[#EBBD06] rounded-[50%] rotate-[-25deg] left-[-180px] top-[40px]" />
        <div className="absolute w-[520px] h-[320px] bg-[#027A4F] rounded-[50%] rotate-[-12deg] left-[40px] bottom-[120px]" />
        <div className="absolute w-[620px] h-[360px] border-[3px] border-white rounded-[50%] rotate-[-20deg] left-[-30px] bottom-[140px]" />

        <div className="relative z-10 max-w-xl">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#DD3935] mb-5">
            Africa Day · 25 May 2026
          </p>

          <h2 className="text-5xl md:text-7xl font-black uppercase leading-[0.9] text-white mb-8">
            25 May 2026
          </h2>

          <p className="text-xl md:text-2xl font-black leading-tight text-black max-w-md">
            One day. One mark. One continent already moving.
          </p>

          <Button
            onClick={scrollToSignOn}
            className="mt-8 bg-[#DD3935] hover:bg-[#C92F2B] text-white text-lg px-10 py-6 rounded-none font-bold"
          >
            Join the movement →
          </Button>
        </div>
      </div>

      {/* Right image */}
      <div className="relative min-h-[420px] lg:min-h-screen overflow-hidden">
        <img
          src={heroImage}
          alt="#NotWaiting campaign portrait"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      </div>
    </div>
  </div>

  {/* Slider dots */}
  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
    <button
      onClick={() => setActiveHero(0)}
      className={`h-3 w-10 transition ${
        activeHero === 0 ? "bg-[#DD3935]" : "bg-[#0C0C0A]/20"
      }`}
      aria-label="Go to slide 1"
    />
    <button
      onClick={() => setActiveHero(1)}
      className={`h-3 w-10 transition ${
        activeHero === 1 ? "bg-[#DD3935]" : "bg-[#0C0C0A]/20"
      }`}
      aria-label="Go to slide 2"
    />
  </div>

  {/* Bottom colour rule */}
  <div className="absolute bottom-0 left-0 right-0 z-30 grid grid-cols-3 h-[5px]">
    <div className="bg-[#DD3935]" />
    <div className="bg-[#EBBD06]" />
    <div className="bg-[#027A4F]" />
  </div>
</section>

Make sure you import these if not already:

import { useEffect, useState } from "react";