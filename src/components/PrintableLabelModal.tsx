"use client";

import { useState, useEffect } from "react";
import { X, Printer, CheckCircle, HeartPulse, Tag } from "lucide-react";

export default function PrintableLabelModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [labelData, setLabelData] = useState({
    mealName: "Organic Pumpkin & Carrot Purée",
    stage: "Stage 2 (6-8 Months)",
    babyName: "Baby Leo (Sarah J.)",
    orderNumber: "#8829",
    prepDate: "Oct 24, 2026 • 13:45",
    useBy: "Oct 26, 2026 • 13:45",
    calories: "145 kcal",
    iron: "3.4 mg",
    allergens: "Dairy Free • Gluten Free",
    barCode: "*MON-8829-ST2*",
  });

  useEffect(() => {
    const handleOpen = (e: any) => {
      if (e.detail) setLabelData({ ...labelData, ...e.detail });
      setIsOpen(true);
    };
    window.addEventListener("open-print-label", handleOpen);
    return () => window.removeEventListener("open-print-label", handleOpen);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Top bar */}
        <div className="bg-brand text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#A5D8FF]" />
            <h3 className="font-bold text-base">Thermal Container Label</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-slate-300 hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Thermal Label Sticker */}
        <div className="p-6 space-y-4 printable-area">
          <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 space-y-3 font-mono text-slate-900 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <div className="flex items-center gap-1.5 font-bold text-sm">
                <HeartPulse className="w-4 h-4 text-brand" />
                <span>MONCRADEL KITCHEN</span>
              </div>
              <span className="text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                {labelData.stage}
              </span>
            </div>

            {/* Meal info */}
            <div>
              <p className="text-xs font-semibold text-slate-500">MEAL CONTAINER LID STICKER</p>
              <h2 className="text-base font-bold leading-tight font-sans text-slate-900">
                {labelData.mealName}
              </h2>
            </div>

            {/* Order & Baby details */}
            <div className="bg-slate-100 p-2.5 rounded-lg text-xs space-y-1 font-sans">
              <p className="font-bold text-brand">
                FOR: {labelData.babyName} ({labelData.orderNumber})
              </p>
              <p className="text-[11px] text-slate-600">
                Prep: {labelData.prepDate}
              </p>
              <p className="text-[11px] font-bold text-rose-700">
                USE BY: {labelData.useBy}
              </p>
            </div>

            {/* Nutrition facts */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-sans pt-1 border-t border-slate-300">
              <div>
                <span className="text-slate-500">ENERGY:</span> <strong className="text-slate-900">{labelData.calories}</strong>
              </div>
              <div>
                <span className="text-slate-500">IRON:</span> <strong className="text-slate-900">{labelData.iron}</strong>
              </div>
              <div className="col-span-2 text-[10px] text-emerald-700 font-bold">
                ✓ {labelData.allergens}
              </div>
            </div>

            {/* Simulated Barcode */}
            <div className="pt-2 text-center border-t border-slate-300 space-y-1">
              <div className="tracking-[6px] font-bold text-base select-none">
                |||| | |||||| | |||| | ||
              </div>
              <p className="text-[10px] font-semibold text-slate-500">{labelData.barCode}</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Close
            </button>
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 text-xs font-bold bg-brand text-white rounded-2xl shadow-xs hover:bg-brand-hover flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sticker (Thermal 4x3)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
