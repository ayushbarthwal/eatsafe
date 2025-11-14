import { useState } from "react";
import {
  Apple,
  LayoutDashboard,
  Utensils,
  Users,
  Package,
  FlaskConical,
  Activity,
  UserCheck,
  FileText,
  LogOut,
} from "lucide-react";
import Dashboard from "./pages/Dashboard";
import FoodItems from "./pages/FoodItems";
import Suppliers from "./pages/Suppliers";
import Batches from "./pages/Batches";
import QualityTests from "./pages/QualityTests";
import Predictions from "./pages/Predictions";
import SupplierPerformance from "./pages/SupplierPerformance";
import ReportsBackup from "./pages/ReportsBackup";

function Welcome({ onStart }) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen text-white px-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(120deg, #131018 0%, #18122b 40%, #21113a 80%, #24143a 100%)",
      }}
    >
      {/* Faint Neon Glow Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-gradient-radial from-[#22c55e] via-transparent to-transparent opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-radial from-[#22c55e] via-transparent to-transparent opacity-10 blur-2xl"></div>
      </div>
      <div className="flex items-center gap-3 mb-2 z-10">
        <Apple
          size={54}
          color="#22c55e"
          style={{
            filter: "drop-shadow(0 0 8px #22c55e)",
            opacity: 1,
          }}
        />
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white z-10">
          EatSafe
        </h1>
      </div>
      <h2 className="text-xl md:text-2xl font-medium mb-6 text-white z-10">
        Food Safety Management System
      </h2>
      <p className="mb-4 text-lg md:text-xl text-gray-300 text-center max-w-xl z-10">
        Ensure quality and safety across your entire food supply chain with intelligent monitoring and risk assessment.
      </p>
      <p className="mb-10 text-gray-400 text-center max-w-lg z-10">
        Track batches, suppliers, and quality tests all in one professional platform.
      </p>
      <button
        className="px-8 py-3 rounded-lg text-lg font-semibold shadow-lg active:scale-95 transition z-10 focus:outline-none focus:ring-2"
        style={{
          background: "rgba(34,197,94,0.15)",
          color: "#22c55e",
          border: "2px solid #22c55e",
          backdropFilter: "blur(8px)",
        }}
        onClick={onStart}
        aria-label="Enter System"
      >
        Enter System
      </button>
    </div>
  );
}

const navItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} color="#ff61e6" />,
  },
  {
    key: "food",
    label: "Food Items",
    icon: <Utensils size={18} color="#fbbf24" />,
  },
  {
    key: "supplier",
    label: "Suppliers",
    icon: <Users size={18} color="#61dafb" />,
  },
  {
    key: "batch",
    label: "Batches",
    icon: <Package size={18} color="#a3e635" />,
  },
  {
    key: "quality",
    label: "Quality Tests",
    icon: <FlaskConical size={18} color="#f472b6" />,
  },
  {
    key: "predictions",
    label: "Predictions",
    icon: <Activity size={18} color="#fbbf24" />,
  },
  {
    key: "performance",
    label: "Supplier Performance",
    icon: <UserCheck size={18} color="#38bdf8" />,
  },
  {
    key: "reports",
    label: "Reports & Backup",
    icon: <FileText size={18} color="#61dafb" />,
  },
];

function Header({ page, setPage }) {
  return (
    <header
      className="w-full shadow-lg backdrop-blur-md fixed top-0 left-0 z-50"
      style={{
        background: "rgba(34, 34, 34, 0.45)",
        borderBottom: "2px solid #18122b",
      }}
    >
      <div className="flex items-center justify-between px-6 py-2">
        <div className="flex items-center gap-3">
          <Apple
            size={28}
            color="#22c55e"
            style={{
              filter: "drop-shadow(0 0 8px #22c55e)",
              opacity: 1,
            }}
          />
          <span className="text-xl font-extrabold tracking-tight text-white select-none">
            EatSafe
          </span>
        </div>
        <div className="flex-1 flex justify-center">
          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const isSelected = page === item.key;
              return (
                <button
                  key={item.key}
                  className={`group relative bg-transparent p-2 rounded-lg hover:bg-gray-900 transition-colors duration-300 focus:outline-none flex items-center`}
                  onClick={() => setPage(item.key)}
                  aria-label={item.label}
                  style={{
                    position: "relative",
                    justifyContent: "flex-start",
                  }}
                >
                  <span className="flex items-center justify-center">
                    {item.icon}
                  </span>
                  <span
                    className={`
                      ml-2
                      flex items-center
                      transition-all duration-500
                      text-white text-sm font-semibold
                      overflow-hidden
                      ${isSelected ? "opacity-100 max-w-[200px]" : "opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[200px]"}
                    `}
                    style={{
                      whiteSpace: "nowrap",
                      transition: "opacity 0.5s cubic-bezier(0.4,0,0.2,1), max-width 0.5s cubic-bezier(0.4,0,0.2,1), margin-left 0.5s cubic-bezier(0.4,0,0.2,1)",
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`
                      absolute left-0 right-0 bottom-0 h-[2px] rounded-full transition-all duration-500
                      ${isSelected ? "bg-white w-full" : "bg-white w-0 group-hover:w-full"}
                    `}
                  ></span>
                </button>
              );
            })}
          </nav>
        </div>
        <div>
          <button
            className="ml-4 px-4 py-2 rounded-lg font-semibold flex items-center gap-1 shadow transition focus:outline-none focus:ring-2"
            style={{
              background: "rgba(34,197,94,0.15)", // blurred green
              color: "#22c55e",
              border: "2px solid #22c55e",
              backdropFilter: "blur(8px)",
            }}
            aria-label="Exit"
            onClick={() => setPage("welcome")}
          >
            <LogOut size={20} color="#22c55e" />
            <span className="hidden md:inline">Exit</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const [page, setPage] = useState("welcome");

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background: "linear-gradient(120deg, #131018 0%, #18122b 40%, #21113a 80%, #24143a 100%)",
      }}
    >
      {page !== "welcome" && <Header page={page} setPage={setPage} />}
      <div className={page === "welcome" ? "" : "pt-16"}>
        {page === "welcome" ? (
          <Welcome onStart={() => setPage("dashboard")} />
        ) : (
          <main className="p-4 md:p-8">
            {page === "dashboard" && <Dashboard />}
            {page === "food" && <FoodItems />}
            {page === "supplier" && <Suppliers />}
            {page === "batch" && <Batches />}
            {page === "quality" && <QualityTests />}
            {page === "predictions" && <Predictions />}
            {page === "performance" && <SupplierPerformance />}
            {page === "reports" && <ReportsBackup />}
          </main>
        )}
      </div>
    </div>
  );
}