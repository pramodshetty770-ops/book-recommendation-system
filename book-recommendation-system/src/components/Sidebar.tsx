import React from "react";
import { LayoutDashboard, Sparkles, BookOpen, BarChart3, BookMarked, X } from "lucide-react";

export type NavSection =
  | "dashboard"
  | "recommendations"
  | "analysis"
  | "performance";

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  isOpen,
  onClose,
}) => {
  const navItems = [
    {
      id: "dashboard" as NavSection,
      label: "Dashboard",
      icon: LayoutDashboard,
      description: "Overview & metrics",
    },
    {
      id: "recommendations" as NavSection,
      label: "Book Recommendations",
      icon: Sparkles,
      description: "Personalized & similar",
    },
    {
      id: "analysis" as NavSection,
      label: "Book & User Analysis",
      icon: BookOpen,
      description: "Explorers & distributions",
    },
    {
      id: "performance" as NavSection,
      label: "Recommendation Performance",
      icon: BarChart3,
      description: "Offline evaluation & hit rates",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
              <BookMarked className="h-5 w-5" />
            </div>
            <div>
              <div className="font-serif text-sm font-bold tracking-tight text-slate-900">
                BookRec Engine
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Collaborative Filtering
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => {
                  onSelectSection(item.id);
                  onClose();
                }}
                className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`mt-0.5 h-4.5 w-4.5 shrink-0 ${
                    isActive ? "text-white" : "text-slate-400"
                  }`}
                />
                <div>
                  <div className="text-xs font-semibold">{item.label}</div>
                  <div
                    className={`text-[10px] ${
                      isActive ? "text-slate-300" : "text-slate-400"
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Engine Specs Footer */}
        <div className="border-t border-slate-100 p-4">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Client-Side Engine</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500 leading-normal">
              100% in-browser collaborative filtering & cosine similarity. Zero external telemetry.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
