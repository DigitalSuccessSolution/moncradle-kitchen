"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { ArrowRight, ChefHat, Leaf, Truck, Clock, Utensils, Heart } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Swipe slider state
  const sliderRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const handleNext = () => {
    if (currentSlide === 0) {
      setCurrentSlide(1);
    }
    // Slide 1 handles completion via swipe
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (currentSlide !== 1 || isUnlocked) return;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || isUnlocked || currentSlide !== 1) return;
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const circleWidth = 48; // w-12 = 48px
      const maxDistance = rect.width - circleWidth - 16; // padding

      let newOffset = e.clientX - rect.left - (circleWidth / 2);
      if (newOffset < 0) newOffset = 0;
      if (newOffset > maxDistance) newOffset = maxDistance;

      setDragOffset(newOffset);

      if (newOffset >= maxDistance * 0.95) {
        setIsUnlocked(true);
        setDragOffset(maxDistance);
        setIsDragging(false);
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || isUnlocked) return;
    setIsDragging(false);
    setDragOffset(0); // Snap back if not fully swiped
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#FBF9F6] overflow-hidden fixed inset-0 z-50 font-sans">
      {/* Background Image Slides */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/image1.png"
          alt="Moncradel Splash"
          fill
          className={`object-cover transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] ${currentSlide === 0 ? 'opacity-100 scale-[1.1] -translate-y-[5%]' : 'opacity-0 scale-[1.05]'}`}
          priority
        />
        <Image
          src="/images/image2.png"
          alt="Moncradel Splash 2"
          fill
          className={`object-cover transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] ${currentSlide === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.05] translate-x-10'}`}
          priority
        />
        <div className="absolute inset-0 bg-white/10 pointer-events-none" />
      </div>

      {/* Top Content Area */}
      <div className="absolute top-16 left-0 right-0 z-10 px-8">
        {/* Slide 0 Top Content */}
        <div className={`absolute left-8 right-8 flex flex-col items-start transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${currentSlide === 0 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16 pointer-events-none'}`}>
          <div className="space-y-4 max-w-[280px] pt-8">
            <h1 className="text-[38px] font-serif font-medium leading-[1.1] text-[#163C24]">
              Fresh Food.<br/>
              <span className="text-[#6C8A60]">Better Life.</span>
            </h1>

            <div className="flex items-center gap-2 max-w-[120px]">
              <div className="flex-1 h-[1px] bg-[#6C8A60]/50" />
              <Leaf className="w-5 h-5 text-[#6C8A60]" />
              <div className="flex-1 h-[1px] bg-[#6C8A60]/50" />
            </div>

            <p className="text-[14px] text-[#425044] font-medium leading-relaxed">
              Delicious meals, made fresh<br/>in our cloud kitchen.
            </p>
          </div>
        </div>

        {/* Slide 1 Top Content */}
        <div className={`absolute left-8 right-8 flex flex-col items-center text-center transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${currentSlide === 1 ? 'opacity-100 translate-x-0 delay-100' : 'opacity-0 translate-x-16 pointer-events-none'}`}>
          <div className="space-y-4 max-w-[300px] -mt-2">
            <h1 className="text-[34px] font-serif font-medium leading-[1.1] text-[#163C24]">
              Order Your<br />
              <span className="text-[#6C8A60] relative">
                Favourite Meals
                <Leaf className="absolute -right-6 -top-2 w-4 h-4 text-[#6C8A60] rotate-45 opacity-80" />
              </span>
            </h1>

            <div className="w-24 h-[2px] bg-[#6C8A60]/60 mx-auto rounded-full mt-2" />

            <p className="text-[14px] text-[#425044] font-medium leading-relaxed mt-4">
              Tasty • Healthy • Home-style
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Content Area */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 flex flex-col">

        {/* Features Box Container */}
        <div className="relative w-full h-[90px] mb-8">
          {/* Slide 0 Features */}
          <div className={`absolute inset-0 w-full bg-[#EBF0E7]/95 backdrop-blur-md rounded-[24px] p-4 flex justify-between items-center transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${currentSlide === 0 ? 'opacity-100 translate-x-0 delay-100' : 'opacity-0 -translate-x-16 pointer-events-none'}`}>
            <div className="flex flex-col items-center flex-1 text-center border-r border-[#163C24]/10 px-1">
              <ChefHat className="w-6 h-6 text-[#163C24] mb-1.5 stroke-[1.5]" />
              <span className="text-[12px] text-[#163C24] font-medium leading-tight">Freshly<br />Prepared</span>
            </div>
            <div className="flex flex-col items-center flex-1 text-center border-r border-[#163C24]/10 px-1">
              <Leaf className="w-6 h-6 text-[#163C24] mb-1.5 stroke-[1.5]" />
              <span className="text-[12px] text-[#163C24] font-medium leading-tight">Hygienic<br />& Safe</span>
            </div>
            <div className="flex flex-col items-center flex-1 text-center px-1">
              <Truck className="w-6 h-6 text-[#163C24] mb-1.5 stroke-[1.5]" />
              <span className="text-[12px] text-[#163C24] font-medium leading-tight">Quick<br />Delivery</span>
            </div>
          </div>

          {/* Slide 1 Features */}
          <div className={`absolute inset-0 w-full bg-[#EBF0E7]/95 backdrop-blur-md rounded-[24px] p-4 flex justify-between items-center transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${currentSlide === 1 ? 'opacity-100 translate-x-0 delay-200' : 'opacity-0 translate-x-16 pointer-events-none'}`}>
            <div className="flex flex-col items-center flex-1 text-center border-r border-[#163C24]/10 px-1">
              <Clock className="w-6 h-6 text-[#163C24] mb-1.5 stroke-[1.5]" />
              <span className="text-[12px] text-[#163C24] font-medium leading-tight">Timely<br />Service</span>
            </div>
            <div className="flex flex-col items-center flex-1 text-center border-r border-[#163C24]/10 px-1">
              <Utensils className="w-6 h-6 text-[#163C24] mb-1.5 stroke-[1.5]" />
              <span className="text-[12px] text-[#163C24] font-medium leading-tight">Multiple<br />Cuisine</span>
            </div>
            <div className="flex flex-col items-center flex-1 text-center px-1">
              <Heart className="w-6 h-6 text-[#163C24] mb-1.5 stroke-[1.5]" />
              <span className="text-[12px] text-[#163C24] font-medium leading-tight">Loved by<br />Customers</span>
            </div>
          </div>
        </div>

        {/* Action Button Container */}
        <div className="relative w-full h-16">
          {/* Slide 0 Button */}
          <button
            onClick={handleNext}
            className={`absolute top-1.5 left-0 right-0 h-[52px] bg-gradient-to-r from-[#1E5227] to-[#15421D] rounded-[26px] flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-lg shadow-black/20 ${currentSlide === 0 ? 'opacity-100 translate-x-0 delay-200 active:scale-95 pointer-events-auto' : 'opacity-0 -translate-x-16 pointer-events-none'}`}
          >
            <span className="text-white font-medium tracking-wide flex items-center gap-2 text-[15px]">
              Next
              <ArrowRight className="w-4 h-4 text-white stroke-[2]" />
            </span>
          </button>

          {/* Slide 1 Swipe Slider */}
          <div
            ref={sliderRef}
            className={`absolute inset-0 w-full h-16 rounded-[32px] bg-gradient-to-r from-[#1E5227] to-[#15421D] flex items-center justify-center shadow-lg shadow-black/20 overflow-hidden touch-none transition-all duration-300 ${currentSlide === 1 ? 'opacity-100 translate-x-0 delay-300 pointer-events-auto' : 'opacity-0 translate-x-16 pointer-events-none'}`}
          >
            {/* Progressive color fill matching the circle track exactly */}
            <div
              className="absolute left-2 h-12 bg-[#B6D69F] transition-none rounded-full"
              style={{ width: `${dragOffset + 48}px`, opacity: (isDragging || dragOffset > 0 || isUnlocked) ? 1 : 0 }}
            />

            <div
              className={`absolute left-2 w-12 h-12 bg-[#B6D69F] rounded-full flex items-center justify-center shadow-inner cursor-grab active:cursor-grabbing z-20 ${!isDragging && !isUnlocked ? 'transition-transform duration-300' : ''}`}
              style={{ transform: `translateX(${dragOffset}px)` }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <ArrowRight className="w-5 h-5 text-[#163C24] stroke-[2]" />
            </div>

            <span className={`text-white text-[17px] font-medium tracking-wide z-10 transition-opacity duration-200 ${isUnlocked ? 'opacity-0' : 'opacity-100'}`}>
              Get Started
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
