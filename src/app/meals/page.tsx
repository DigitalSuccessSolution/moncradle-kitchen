"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Plus, Search, Edit2, X, Camera, Eye, Trash2, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

export default function RecipesPage() {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "0-6 months" | "6-12 months" | "1-3 years" | "3+ years">("all");
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Form states
  const initialFormState = {
    name: "",
    description: "",
    suitableForAgeGroup: "6-12 months",
    category: "",
    ingredients: "",
    price: 0,
    inStock: true,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    imageUrl: "/logo.png",
    discountedPrice: 0,
    isActive: true
  };

  const [formData, setFormData] = useState(initialFormState);
  const [editId, setEditId] = useState<string | null>(null);
  const [currentMeal, setCurrentMeal] = useState<any>(null);

  // Intersection Observer for infinite scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (isFetchingMore || isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    }, { threshold: 0.1 });
    if (node) observer.current.observe(node);
  }, [isFetchingMore, isLoading, hasMore]);

  const fetchMeals = async (pageNum: number, search: string, ageGroup: string) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const params = new URLSearchParams();
      params.set('page', String(pageNum));
      params.set('limit', '10');
      if (search) params.set('search', search);
      if (ageGroup && ageGroup !== 'all') params.set('ageGroup', ageGroup);

      const res = await fetch(`${API_URL}/meals?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        if (pageNum === 1) {
          setRecipes(data.data);
        } else {
          setRecipes(prev => {
            const existingIds = new Set(prev.map(r => r._id));
            const newItems = data.data.filter((r: any) => !existingIds.has(r._id));
            return [...prev, ...newItems];
          });
        }
        // Check if there are more pages
        const totalPages = data.pagination?.pages || 1;
        setHasMore(pageNum < totalPages);
      }
    } catch (error) {
      console.error("Error fetching meals:", error);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page and fetch when search or filter changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchMeals(1, debouncedSearch, filter);
  }, [debouncedSearch, filter]);

  // Fetch more when page increments (page > 1)
  useEffect(() => {
    if (page > 1) {
      fetchMeals(page, debouncedSearch, filter);
    }
  }, [page]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenAddModal = () => {
    setFormData(initialFormState);
    setImageFile(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (meal: any) => {
    setEditId(meal._id);
    setImageFile(null);
    setFormData({
      name: meal.name,
      description: meal.description,
      suitableForAgeGroup: meal.suitableForAgeGroup,
      category: meal.category,
      ingredients: meal.ingredients.join(", "),
      price: meal.price,
      inStock: meal.inStock,
      calories: meal.nutritionalInfo.calories,
      protein: meal.nutritionalInfo?.protein || 0,
      carbs: meal.nutritionalInfo?.carbs || 0,
      fat: meal.nutritionalInfo?.fat || 0,
      imageUrl: meal.images?.[0] || meal.imageUrl || "/logo.png",
      discountedPrice: meal.discountedPrice || 0,
      isActive: meal.isActive !== false
    });
    setIsEditModalOpen(true);
  };

  const handleOpenViewModal = (meal: any) => {
    setCurrentMeal(meal);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Delete this meal?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#059669', // Theme brand color basically, or red
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      backdrop: 'rgba(15, 23, 42, 0.4)',
      customClass: {
        popup: 'rounded-2xl',
        title: 'text-lg font-semibold text-slate-800',
        confirmButton: 'rounded-lg font-medium shadow-sm',
        cancelButton: 'rounded-lg font-medium',
        container: 'backdrop-blur-sm'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
          const res = await fetch(`${API_URL}/meals/${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            setRecipes(prev => prev.filter(r => r._id !== id));
            Swal.fire('Deleted!', 'Meal has been deleted.', 'success');
          } else {
             Swal.fire('Error', data.message || 'Failed to delete meal', 'error');
          }
        } catch (error) {
          Swal.fire('Error', 'An error occurred while deleting', 'error');
        }
      }
    });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('description', formData.description);
      formPayload.append('suitableForAgeGroup', formData.suitableForAgeGroup);
      formPayload.append('category', formData.category);
      formPayload.append('price', String(formData.price));
      formPayload.append('discountedPrice', String(formData.discountedPrice));
      formPayload.append('inStock', String(formData.inStock));
      formPayload.append('isActive', String(formData.isActive));
      
      const ingredientsArray = formData.ingredients.split(",").map(i => i.trim()).filter(i => i);
      formPayload.append('ingredients', JSON.stringify(ingredientsArray));
      
      const nutritionalInfo = {
        calories: Number(formData.calories),
        protein: Number(formData.protein),
        carbs: Number(formData.carbs),
        fat: Number(formData.fat),
      };
      formPayload.append('nutritionalInfo', JSON.stringify(nutritionalInfo));
      
      if (imageFile) {
        formPayload.append('images', imageFile);
      }
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/meals`, {
        method: 'POST',
        body: formPayload
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire('Success', 'Meal added successfully!', 'success');
        setPage(1); setHasMore(true); fetchMeals(1, debouncedSearch, filter);
        setIsAddModalOpen(false);
      } else {
        Swal.fire('Error', data.message || 'Failed to add meal', 'error');
      }
    } catch (error) {
       Swal.fire('Error', 'An error occurred while adding the meal', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('description', formData.description);
      formPayload.append('suitableForAgeGroup', formData.suitableForAgeGroup);
      formPayload.append('category', formData.category);
      formPayload.append('price', String(formData.price));
      formPayload.append('discountedPrice', String(formData.discountedPrice));
      formPayload.append('inStock', String(formData.inStock));
      formPayload.append('isActive', String(formData.isActive));
      
      const ingredientsArray = formData.ingredients.split(",").map(i => i.trim()).filter(i => i);
      formPayload.append('ingredients', JSON.stringify(ingredientsArray));
      
      const nutritionalInfo = {
        calories: Number(formData.calories),
        protein: Number(formData.protein),
        carbs: Number(formData.carbs),
        fat: Number(formData.fat),
      };
      formPayload.append('nutritionalInfo', JSON.stringify(nutritionalInfo));
      
      if (imageFile) {
        formPayload.append('images', imageFile);
      } else {
        const currentRecipe = recipes.find(r => r._id === editId);
        const existingImages = currentRecipe?.images?.length ? currentRecipe.images : (currentRecipe?.imageUrl ? [currentRecipe.imageUrl] : []);
        if (existingImages.length > 0) {
          formPayload.append('existingImages', JSON.stringify(existingImages));
        }
      }
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/meals/${editId}`, {
        method: 'PUT',
        body: formPayload
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire('Success', 'Meal updated successfully!', 'success');
        setPage(1); setHasMore(true); fetchMeals(1, debouncedSearch, filter);
        setIsEditModalOpen(false);
      } else {
        Swal.fire('Error', data.message || 'Failed to update meal', 'error');
      }
    } catch (error) {
       Swal.fire('Error', 'An error occurred while updating the meal', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormContent = (isEdit = false) => (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-slate-700 block">Meal Name *</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-brand"
          placeholder="e.g. Organic Apple Puree"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-slate-700 block">Description</label>
        <textarea
          required
          rows={2}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-brand"
          placeholder="Brief description of the meal"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-slate-700 block">Age Group</label>
          <select
            value={formData.suitableForAgeGroup}
            onChange={(e) => setFormData({ ...formData, suitableForAgeGroup: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-brand"
          >
            <option value="0-6 months">0-6 months</option>
            <option value="6-12 months">6-12 months</option>
            <option value="1-3 years">1-3 years</option>
            <option value="3+ years">3+ years</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-slate-700 block">Category</label>
          <input
            type="text"
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-brand"
            placeholder="e.g. Puree, Soup"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-slate-700 block">Ingredients</label>
        <input
          type="text"
          required
          value={formData.ingredients}
          onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-brand"
          placeholder="e.g. Apple, Water, Cinnamon"
        />
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-700 uppercase tracking-wider block">Cal</label>
          <input
            type="number"
            required
            value={formData.calories}
            onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
            className="w-full border border-slate-200 rounded-lg px-2 py-2 text-[13px] focus:outline-none focus:border-brand"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-700 uppercase tracking-wider block">Pro</label>
          <input
            type="number"
            required
            value={formData.protein}
            onChange={(e) => setFormData({ ...formData, protein: Number(e.target.value) })}
            className="w-full border border-slate-200 rounded-lg px-2 py-2 text-[13px] focus:outline-none focus:border-brand"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-700 uppercase tracking-wider block">Carb</label>
          <input
            type="number"
            required
            value={formData.carbs}
            onChange={(e) => setFormData({ ...formData, carbs: Number(e.target.value) })}
            className="w-full border border-slate-200 rounded-lg px-2 py-2 text-[13px] focus:outline-none focus:border-brand"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-700 uppercase tracking-wider block">Fat</label>
          <input
            type="number"
            required
            value={formData.fat}
            onChange={(e) => setFormData({ ...formData, fat: Number(e.target.value) })}
            className="w-full border border-slate-200 rounded-lg px-2 py-2 text-[13px] focus:outline-none focus:border-brand"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-slate-700 block">Price (₹)</label>
          <input
            type="number"
            required
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-brand"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-slate-700 block">Discounted Price (₹)</label>
          <input
            type="number"
            value={formData.discountedPrice}
            onChange={(e) => setFormData({ ...formData, discountedPrice: Number(e.target.value) })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-brand"
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-slate-700 block">Stock Status</label>
          <select
            value={formData.inStock ? "true" : "false"}
            onChange={(e) => setFormData({ ...formData, inStock: e.target.value === "true" })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-brand"
          >
            <option value="true">In Stock</option>
            <option value="false">Out of Stock</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-slate-700 block">Visibility Status</label>
          <select
            value={formData.isActive ? "true" : "false"}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-brand"
          >
            <option value="true">Active (Visible)</option>
            <option value="false">Inactive (Hidden)</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-slate-700 block">Photo Upload</label>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0 relative">
            <Image
              src={imageFile ? URL.createObjectURL(imageFile) : (formData.imageUrl !== "/logo.png" ? formData.imageUrl : "/logo.png")}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[12px] file:font-medium file:bg-brand/10 file:text-brand hover:file:bg-brand/20 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-brand text-white font-medium text-[15px] py-3 rounded-lg shadow-sm hover:shadow hover:bg-brand-hover transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
          {isEdit ? "Update Meal" : "Add Meal"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up pb-16 max-w-2xl mx-auto lg:max-w-none lg:mx-0 font-sans">

      {/* 1. Header & Controls Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium text-slate-900 tracking-tight mb-1">
            Standardized Meals Catalog
          </h1>
          <p className="text-sm text-slate-700 font-medium hidden md:block">
            Manage recipes, ingredients, nutrition, and pricing for kitchen output.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
            <input
              type="text"
              placeholder="Search meals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand/30"
            />
          </div>

          <button
            onClick={handleOpenAddModal}
            className="bg-brand hover:bg-brand-hover text-white font-medium text-[13px] px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Meal</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "all", label: "All Meals" },
          { id: "0-6 months", label: "0-6 Months" },
          { id: "6-12 months", label: "6-12 Months" },
          { id: "1-3 years", label: "1-3 Years" },
          { id: "3+ years", label: "3+ Years" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as typeof filter)}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer ${filter === tab.id
                ? "bg-slate-800 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 2. Simplified Minimal Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes.map((meal) => (
          <div
            key={meal._id}
            className="bg-white rounded-lg p-5 border border-slate-200/80 space-y-3 relative overflow-hidden transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-100 relative shrink-0 bg-slate-50">
                  <Image
                    src={meal.images?.[0] || meal.imageUrl || "/logo.png"}
                    alt={meal.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-slate-800 text-base leading-tight truncate">
                    {meal.name}
                  </h3>
                  <p className="text-[12px] font-medium text-slate-700 mt-0.5 truncate">
                    {meal.category} • {meal.discountedPrice > 0 ? (
                      <>
                        <span className="line-through text-slate-400 mr-1">₹{meal.price}</span>
                        <span className="text-brand font-semibold">₹{meal.discountedPrice}</span>
                      </>
                    ) : (
                      <span>₹{meal.price}</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 shrink-0 items-end">
                <span
                  className={`shrink-0 whitespace-nowrap text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${meal.inStock
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-rose-100 text-rose-800 border border-rose-200"
                    }`}
                >
                  {meal.inStock ? "In Stock" : "Out of Stock"}
                </span>
                <span
                  className={`shrink-0 whitespace-nowrap text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${meal.isActive !== false
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                >
                  {meal.isActive !== false ? "Active" : "Hidden"}
                </span>
              </div>
            </div>

            <p className="text-[13px] text-slate-700 font-medium leading-snug line-clamp-2 pt-1">
              {meal.description}
            </p>

            {/* Actions aligned with Staff page style */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => handleOpenViewModal(meal)}
                className="p-2 border border-slate-200 text-slate-600 hover:text-brand hover:border-brand hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleOpenEditModal(meal)}
                className="flex-1 bg-white border border-slate-200 text-slate-600 hover:text-brand hover:border-brand hover:bg-slate-50 py-1.5 rounded-lg text-[13px] font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="Edit Meal"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Info
              </button>
              <button
                onClick={() => handleDelete(meal._id)}
                className="p-2 border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Delete Meal"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div ref={sentinelRef} className="flex items-center justify-center py-6">
          {isFetchingMore && <Loader2 className="w-6 h-6 animate-spin text-brand" />}
        </div>
      )}
      {!hasMore && recipes.length > 0 && (
        <p className="text-center text-sm text-slate-400 py-4">All meals loaded</p>
      )}
      </>)}

      {/* View Meal Modal (Enhanced View Modal) */}
      {mounted && isViewModalOpen && currentMeal && createPortal(
        <div className="fixed inset-0 z-[99999] flex justify-center items-end sm:items-center p-0 sm:p-4 pointer-events-none">
          <div
            className="fixed inset-0 bg-[#0B1727]/70 pointer-events-auto transition-opacity"
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={() => setIsViewModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-[100vw] sm:max-w-md h-auto max-h-[90vh] overflow-hidden animate-slide-up shadow-2xl border-0 sm:border border-slate-200 pointer-events-auto flex flex-col rounded-t-lg sm:rounded-lg">

            {/* Modal Content Wrapper */}
            <div className="overflow-y-auto w-full pb-4">
              {/* Banner Image */}
              <div className="relative w-full h-56 sm:h-64 bg-slate-100 shrink-0">
                <Image
                  src={currentMeal.images?.[0] || currentMeal.imageUrl || "/logo.png"}
                  alt={currentMeal.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {/* Floating Close Button */}
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md text-slate-700 hover:text-slate-900 rounded-full shadow-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                {/* Status Tags on Image */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm ${currentMeal.inStock
                        ? "bg-emerald-500 text-white"
                        : "bg-rose-500 text-white"
                      }`}
                  >
                    {currentMeal.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm ${currentMeal.isActive !== false
                        ? "bg-blue-500 text-white"
                        : "bg-slate-600 text-white"
                      }`}
                  >
                    {currentMeal.isActive !== false ? "Active" : "Hidden"}
                  </span>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold text-slate-900 text-xl leading-tight">
                      {currentMeal.name}
                    </h3>
                    <div className="flex items-baseline gap-2 shrink-0 whitespace-nowrap">
                      {currentMeal.discountedPrice > 0 ? (
                        <>
                          <span className="text-[14px] font-medium text-slate-400 line-through">₹{currentMeal.price}</span>
                          <span className="text-[20px] font-bold text-brand">₹{currentMeal.discountedPrice}</span>
                        </>
                      ) : (
                        <span className="text-[18px] font-semibold text-slate-900">₹{currentMeal.price}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-[14px] font-medium text-slate-900 mt-1">
                    {currentMeal.category} • {currentMeal.suitableForAgeGroup}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-[14px] text-slate-900 font-medium">Description</h4>
                  <p className="text-[14px] text-slate-900 font-medium leading-relaxed">{currentMeal.description}</p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-[14px] text-slate-900 font-medium flex items-center justify-between">
                    <span>Ingredients</span>
                    <span className="text-[11px] text-slate-400 font-medium">{currentMeal.ingredients.length} items</span>
                  </h4>
                  <div className="bg-blue-100 rounded-lg p-4">
                    <ul className="list-disc list-inside text-[13px] text-slate-800 font-medium space-y-1.5">
                      {currentMeal.ingredients.map((ing: string, i: number) => (
                        <li key={i}>{ing}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[14px] text-slate-900 font-medium">Nutrition Facts</h4>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="flex flex-col items-center bg-orange-100 rounded-lg py-3 justify-center">
                      <span className="text-[13px] text-black font-semibold mb-0.5">Calcium</span>
                      <span className="text-[12px] font-medium text-black">{currentMeal.nutritionalInfo.calories}</span>
                    </div>
                    <div className="flex flex-col items-center bg-blue-100 rounded-lg py-3 justify-center">
                      <span className="text-[13px] text-black font-semibold  mb-0.5">Protein</span>
                      <span className="text-[12px] font-medium text-black">{currentMeal.nutritionalInfo.protein}g</span>
                    </div>
                    <div className="flex flex-col items-center bg-yellow-100 rounded-lg py-3 justify-center">
                      <span className="text-[13px] text-black font-semibold  mb-0.5">Carbs</span>
                      <span className="text-[12px] font-medium text-black">{currentMeal.nutritionalInfo.carbs}g</span>
                    </div>
                    <div className="flex flex-col items-center bg-emerald-100 rounded-lg py-3 justify-center">
                      <span className="text-[13px] text-black font-semibold  mb-0.5">Fat</span>
                      <span className="text-[12px] font-medium text-black">{currentMeal.nutritionalInfo.fat}g</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="w-full bg-brand text-white font-medium text-[15px] py-3 rounded-lg shadow-sm hover:shadow hover:bg-brand-hover transition-all duration-200 cursor-pointer"
                  >
                    Close View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Add Meal Modal (Staff style) */}
      {mounted && isAddModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex justify-center items-end sm:items-center p-0 sm:p-4 pointer-events-none">
          <div
            className="fixed inset-0 bg-[#0B1727]/70 pointer-events-auto transition-opacity"
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-[100vw] sm:max-w-md h-auto max-h-[90vh] overflow-hidden animate-slide-up shadow-2xl border-0 sm:border border-slate-200 pointer-events-auto flex flex-col rounded-t-xl sm:rounded-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-[17px] font-medium text-slate-900">Add New Meal</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 text-slate-700 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-5">
              <form onSubmit={handleAddSubmit}>
                {renderFormContent(false)}
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Meal Modal (Staff style) */}
      {mounted && isEditModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex justify-center items-end sm:items-center p-0 sm:p-4 pointer-events-none">
          <div
            className="fixed inset-0 bg-[#0B1727]/70 pointer-events-auto transition-opacity"
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={() => setIsEditModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-[100vw] sm:max-w-md h-auto max-h-[90vh] overflow-hidden animate-slide-up shadow-2xl border-0 sm:border border-slate-200 pointer-events-auto flex flex-col rounded-t-xl sm:rounded-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-[17px] font-medium text-slate-900">Edit Meal Details</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1.5 text-slate-700 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-5">
              <form onSubmit={handleEditSubmit}>
                {renderFormContent(true)}
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
