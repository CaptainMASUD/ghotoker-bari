import React from "react";
import { Carousel } from "flowbite-react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const defaultStories = [
  {
    couple: "Tanjila & Farhan",
    text:
      "We matched on day 3 and met our families within a month. The verification-first approach gave us total peace of mind.",
    img: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1600",
  },
  {
    couple: "Sadia & Nayeem",
    text:
      "Crystal-clear filters and genuine profiles—exactly what we needed. We tied the knot in six months!",
    img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600",
  },
  {
    couple: "Mehedi & Jannat",
    text:
      "The premium spotlight made discovery effortless. Loved the privacy controls throughout.",
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600",
  },
];

export default function SuccessStories({ stories = defaultStories, title = "Success Stories" }) {
  const LeftIcon = <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />;
  const RightIcon = <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />;

  return (
    <section id="stories" className="max-w-7xl mx-auto px-4 py-14 text-white" aria-labelledby="stories-heading">
      {/* Centered white header with brand gradient only on S and O */}
      <h2 id="stories-heading" className="text-2xl md:text-3xl font-bold mb-6 text-center text-white">
        <span className="bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">S</span>
        <span>uccess </span>
        <span>St</span>
        <span className="bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">o</span>
        <span>ries</span>
      </h2>

      {/* Premium gradient frame */}
      <div className="rounded-3xl p-[1px] bg-gradient-to-r from-fuchsia-300/50 via-pink-300/50 to-rose-300/50">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden relative">
          <Carousel
            className="h-[320px] md:h-[360px] overflow-hidden
                       [&>div>button]:bg-white/10
                       [&>div>button]:border [&>div>button]:border-white/15
                       [&>div>button]:backdrop-blur
                       [&>div>button:hover]:bg-white/15
                       [&>div>button:hover]:border-white/25
                       [&>div>button]:focus:outline-none
                       [&>div>button:focus]:ring-2
                       [&>div>button:focus]:ring-white/40
                       [&>div>button]:cursor-pointer"
            indicators={true}
            leftControl={LeftIcon}
            rightControl={RightIcon}
            slide
            slideInterval={6000}
          >
            {stories.map((s) => (
              <div key={s.couple} className="relative h-full w-full">
                {/* Background image */}
                <img
                  src={s.img}
                  alt={s.couple}
                  className="absolute inset-0 h-full w-full object-cover opacity-30"
                  loading="lazy"
                />
                {/* Readability gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />

                {/* Content card */}
                <div className="relative h-full flex items-center px-6 md:px-10">
                  <figure className="max-w-2xl rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-4 md:p-6 shadow-[0_6px_30px_rgba(0,0,0,0.25)]">
                    <div className="flex items-center gap-2 text-white/70 text-xs mb-2">
                      <Quote className="h-4 w-4" />
                      <span>Real experiences from verified couples</span>
                    </div>

                    <figcaption className="text-lg md:text-xl font-semibold">{s.couple}</figcaption>

                    <blockquote className="mt-2 md:mt-3 text-white/85 leading-relaxed">“{s.text}”</blockquote>

                    {/* CTA chips */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold text-neutral-900
                                   bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300
                                   shadow-lg shadow-rose-900/20
                                   hover:shadow-xl hover:-translate-y-0.5 transition"
                        aria-label="Explore similar stories"
                      >
                        Explore similar stories
                      </button>
                      <button
                        type="button"
                        className="cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold text-white/90
                                   bg-white/10 border border-white/15 backdrop-blur
                                   hover:bg-white/15 hover:border-white/25 transition
                                   focus:outline-none focus:ring-2 focus:ring-white/40"
                        aria-label="Start your journey"
                      >
                        Start your journey
                      </button>
                    </div>
                  </figure>
                </div>
              </div>
            ))}
          </Carousel>

          {/* Decorative indicator rail */}
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 w-[90%] md:w-[60%]">
            <div className="mx-auto h-1 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-1/3 bg-gradient-to-r from-fuchsia-300/70 via-pink-300/70 to-rose-300/70 animate-[pulse_2s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
