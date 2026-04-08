"use client"

import React from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, EffectCoverflow, Navigation, Pagination } from "swiper/modules"
import { LucideIcon } from "lucide-react"

import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"
import "swiper/css/navigation"

export interface FeatureCard {
    icon: LucideIcon
    title: string
    desc: string
    accent: string
    stat?: string
    statLabel?: string
    highlight?: boolean // prescription / AI card gets special dark treatment
}

interface CarouselProps {
    cards: FeatureCard[]
    autoplayDelay?: number
    showPagination?: boolean
    showNavigation?: boolean
    onHighlightClick?: () => void
}

type AccentStyle = { glow: string; tagBg: string; tagText: string; statColor: string; tagLabel: string }

const accentMap: Record<string, AccentStyle> = {
    teal: { glow: "rgba(13,148,136,0.25)", tagBg: "bg-teal-400/20 border border-teal-400/30", tagText: "text-teal-300", statColor: "text-teal-300", tagLabel: "Diagnostics" },
    cyan: { glow: "rgba(6,182,212,0.25)", tagBg: "bg-cyan-400/20 border border-cyan-400/30", tagText: "text-cyan-300", statColor: "text-cyan-300", tagLabel: "Tracking" },
    violet: { glow: "rgba(139,92,246,0.25)", tagBg: "bg-violet-400/20 border border-violet-400/30", tagText: "text-violet-300", statColor: "text-violet-300", tagLabel: "Reports" },
    amber: { glow: "rgba(245,158,11,0.25)", tagBg: "bg-amber-400/20 border border-amber-400/30", tagText: "text-amber-300", statColor: "text-amber-300", tagLabel: "Alerts" },
    blue: { glow: "rgba(59,130,246,0.25)", tagBg: "bg-blue-400/20 border border-blue-400/30", tagText: "text-blue-300", statColor: "text-blue-300", tagLabel: "Security" },
    rose: { glow: "rgba(244,63,94,0.25)", tagBg: "bg-rose-400/20 border border-rose-400/30", tagText: "text-rose-300", statColor: "text-rose-300", tagLabel: "Speed" },
}

const css = `
.swiper { width: 100%; padding-bottom: 56px; }
.swiper-slide { background-position: center; background-size: cover; width: 300px; }
.swiper-3d .swiper-slide-shadow-left { background-image: none; }
.swiper-3d .swiper-slide-shadow-right { background: none; }
.swiper-pagination-bullet { background: #94a3b8; opacity: 1; }
.swiper-pagination-bullet-active { background: #0d9488; }
`

export const CardCarousel: React.FC<CarouselProps> = ({
    cards,
    autoplayDelay = 1500,
    showPagination = true,
    showNavigation = true,
    onHighlightClick,
}) => {
    const slides = [...cards, ...cards]

    return (
        <div className="w-full">
            <style>{css}</style>
            <Swiper
                spaceBetween={30}
                autoplay={{ delay: autoplayDelay, disableOnInteraction: false }}
                effect="coverflow"
                grabCursor
                centeredSlides
                loop
                slidesPerView="auto"
                coverflowEffect={{ rotate: 0, stretch: 0, depth: 100, modifier: 2.5 }}
                pagination={showPagination ? { clickable: true } : false}
                navigation={
                    showNavigation
                        ? { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }
                        : false
                }
                modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
            >
                {slides.map((card, index) => {
                    const Icon = card.icon

                    if (card.highlight) {
                        // Premium dark AI card
                        return (
                            <SwiperSlide key={index}>
                                <button
                                    onClick={onHighlightClick}
                                    className="w-full text-left rounded-3xl overflow-hidden h-[360px] flex flex-col select-none cursor-pointer group"
                                    style={{
                                        background: "linear-gradient(135deg, #0f172a 0%, #134e4a 60%, #0d9488 100%)",
                                        boxShadow: "0 20px 60px rgba(13,148,136,0.25)",
                                    }}
                                >
                                    {/* Noise overlay */}
                                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />

                                    <div className="relative z-10 p-7 flex flex-col h-full gap-4">
                                        {/* Top row */}
                                        <div className="flex items-start justify-between">
                                            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <Icon className="w-7 h-7 text-white" strokeWidth={1.8} />
                                            </div>
                                            <span className="bg-teal-400/20 border border-teal-400/30 text-teal-300 text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">
                                                AI Powered
                                            </span>
                                        </div>

                                        {/* Text */}
                                        <div className="flex flex-col gap-2 flex-1">
                                            <h3 className="text-white font-bold text-xl leading-snug">{card.title}</h3>
                                            <p className="text-teal-200/80 text-sm leading-relaxed">{card.desc}</p>
                                        </div>

                                        {/* Stat */}
                                        {card.stat && (
                                            <div className="bg-white/10 rounded-2xl px-4 py-3 flex items-center justify-between">
                                                <span className="text-teal-200 text-xs font-medium">{card.statLabel}</span>
                                                <span className="text-white font-bold text-lg">{card.stat}</span>
                                            </div>
                                        )}

                                        {/* CTA hint */}
                                        <div className="flex items-center gap-2 text-teal-300 text-xs font-semibold">
                                            <span>Tap to get started</span>
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                        </div>
                                    </div>
                                </button>
                            </SwiperSlide>
                        )
                    }

                    // Alternate: even index = light card, odd index = dark card
                    const a = accentMap[card.accent] ?? accentMap.teal
                    const isDark = index % 2 !== 0

                    if (isDark) {
                        return (
                            <SwiperSlide key={index}>
                                <div
                                    className="rounded-3xl overflow-hidden h-[360px] flex flex-col select-none relative"
                                    style={{
                                        background: "linear-gradient(135deg, #0f172a 0%, #134e4a 60%, #0d9488 100%)",
                                        boxShadow: `0 20px 60px ${a.glow}`,
                                    }}
                                >
                                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />
                                    <div className="relative z-10 p-7 flex flex-col h-full gap-4">
                                        <div className="flex items-start justify-between">
                                            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
                                                <Icon className="w-7 h-7 text-white" strokeWidth={1.8} />
                                            </div>
                                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase ${a.tagBg} ${a.tagText}`}>
                                                {a.tagLabel}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-2 flex-1">
                                            <h3 className="text-white font-bold text-xl leading-snug">{card.title}</h3>
                                            <p className="text-teal-200/80 text-sm leading-relaxed">{card.desc}</p>
                                        </div>
                                        {card.stat && (
                                            <div className="bg-white/10 rounded-2xl px-4 py-3 flex items-center justify-between">
                                                <span className="text-teal-200 text-xs font-medium">{card.statLabel}</span>
                                                <span className={`font-bold text-lg ${a.statColor}`}>{card.stat}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </SwiperSlide>
                        )
                    }

                    // Light card
                    return (
                        <SwiperSlide key={index}>
                            <div
                                className="rounded-3xl overflow-hidden h-[360px] flex flex-col select-none relative bg-white border border-slate-100"
                                style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.07)" }}
                            >
                                <div className="p-7 flex flex-col h-full gap-4">
                                    <div className="flex items-start justify-between">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center`}
                                            style={{ background: a.glow.replace("0.25", "0.12") }}>
                                            <Icon className="w-7 h-7 text-slate-700" strokeWidth={1.8} />
                                        </div>
                                        <span className="text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase bg-slate-100 text-slate-500">
                                            {a.tagLabel}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-2 flex-1">
                                        <h3 className="text-slate-800 font-bold text-xl leading-snug">{card.title}</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed">{card.desc}</p>
                                    </div>
                                    {card.stat && (
                                        <div className="bg-slate-50 rounded-2xl px-4 py-3 flex items-center justify-between border border-slate-100">
                                            <span className="text-slate-400 text-xs font-medium">{card.statLabel}</span>
                                            <span className="font-bold text-lg text-slate-800">{card.stat}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </SwiperSlide>
                    )
                })}
            </Swiper>
        </div>
    )
}
