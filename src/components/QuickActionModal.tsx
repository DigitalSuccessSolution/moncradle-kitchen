"use client";

import { useState, useEffect } from "react";
import { X, Flame, Package, ShieldCheck, Truck, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QuickActionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"batch" | "inventory" | "inspection" | "dispatch">("batch");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  // Form fields
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [chefName, setChefName] = useState("Chef Marcus V.");

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-quick-action", handleOpen);
    return () => window.removeEventListener("open-quick-action", handleOpen);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("Kitchen Action Logged Successfully!");
    setTimeout(() => {
      setSuccessMessage("");
      setIsOpen(false);
      if (activeTab === "batch") router.push("/production");
      if (activeTab === "inventory") router.push("/inventory");
      if (activeTab === "inspection") router.push("/hygiene");
      if (activeTab === "dispatch") router.push("/dispatch");
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-scaleUp">
        {/* Modal Header */}
        <div className="bg-[#A5D8FF]/30 px-6 py-4 flex items-center justify-between border-b border-slate-200/60">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white rounded-xl shadow-xs text-brand">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-brand text-lg">Quick Kitchen Operation</h3>
              <p className="text-xs text-slate-500">Fast workflow dispatch for Cloud Kitchen staff</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-slate-50 border-b border-slate-100 text-xs font-medium">
          {[
            { id: "batch", label: "New Batch", icon: Flame },
            { id: "inventory", label: "Stock Intake", icon: Package },
            { id: "inspection", label: "Hygiene Log", icon: ShieldCheck },
            { id: "dispatch", label: "Dispatch", icon: Truck },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${
                  isSelected
                    ? "bg-white text-brand font-bold shadow-xs border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {successMessage ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <CheckCircle2 className="w-14 h-14 text-emerald-500 animate-bounce" />
              <p className="font-bold text-slate-800 text-lg">{successMessage}</p>
              <p className="text-xs text-slate-500">Updating kitchen production roster...</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  {activeTab === "batch"
                    ? "Recipe Name"
                    : activeTab === "inventory"
                    ? "Ingredient Name"
                    : activeTab === "inspection"
                    ? "Equipment / Area"
                    : "Order # / Driver Name"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    activeTab === "batch"
                      ? "e.g. Organic Pumpkin Puree"
                      : activeTab === "inventory"
                      ? "e.g. Fortified Iron Rice"
                      : activeTab === "inspection"
                      ? "e.g. Cold Storage Bay 2 Temp"
                      : "e.g. Order #8829 - Driver Alex"
                  }
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-slate-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A5D8FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Portion / Units Count
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50 units or 10 kg"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-slate-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A5D8FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Assigned Staff / Chef
                  </label>
                  <select
                    value={chefName}
                    onChange={(e) => setChefName(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#A5D8FF]"
                  >
                    <option value="Chef Marcus V.">Chef Marcus V.</option>
                    <option value="Chef Elena S.">Chef Elena S.</option>
                    <option value="Chef David K.">Chef David K.</option>
                    <option value="Chef Sarah L.">Chef Sarah L.</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-semibold bg-brand text-white rounded-2xl shadow-sm hover:bg-brand-hover transition-all"
                >
                  Submit Operation
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
