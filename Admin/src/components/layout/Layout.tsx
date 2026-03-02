
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
// import Login from "@/pages/signin";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

function App({ children }: { children: React.ReactNode }) {
  const nav = useNavigate()
  const page = useSelector((state: RootState) => state.pages.value);
  // console.log("page=====>", page);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [backGroundColor, setBackgroundColor] = useState("rgba(0, 0, 0, 0.05)");
  useEffect(() => {
    switch (page) {
      case "story-status":
        setBackgroundColor("linear-gradient(120deg, rgba(27, 255, 255, 0), #783d6b)");
        break;
      // case "selection-editor":
      //   setBackgroundColor("linear-gradient(120deg, rgba(27, 255, 255, 0), #66294e99)");
      //   break;
      case "submit-content":
        setBackgroundColor("linear-gradient(120deg,#1bffff00, #2e319294)");
        break;
      default:
        setBackgroundColor("rgba(0, 0, 0, 0.05)");
    }
  }, [backGroundColor, page]);
  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileView = window.innerWidth <= 768;
      setIsMobile(isMobileView);
      if (!isMobileView) {
        setIsSidebarOpen(false);
        setIsSidebarCollapsed(false);
      } else {
        // On mobile, start with sidebar open
        setIsSidebarOpen(false);
        setIsSidebarCollapsed(false);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Control body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = "hidden";
      setIsSidebarCollapsed(false);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, isSidebarOpen]);

  // console.log("session ========>", localStorage.getItem("token") , !localStorage.getItem("token"))
  if(!localStorage.getItem("token")){
    localStorage.clear();
    nav("/signin")
  }
  return (
    <ThemeProvider defaultTheme="light" storageKey="app-theme">
 
        <div className="flex h-screen bg-background text-foreground">
          {/* Sidebar */}
          <div
            className={`
            fixed inset-y-0 z-50 md:relative
            transition-transform duration-300
            ${isMobile ? (isSidebarOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
          `}
          >
            <Sidebar
              isCollapsed={isSidebarCollapsed}
              onCollapsedChange={(collapsed) => {
                if (isMobile) {
                  setIsSidebarOpen(!collapsed);
                } else {
                  setIsSidebarCollapsed(collapsed);
                }
              }}
            />
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            { <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} isMobile={isMobile} />}
            {/* <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} isMobile={isMobile} /> */}

            {/* Scrollable content area */}
            <main className="flex-1 overflow-y-auto transition-all duration-2000" style={{ background: backGroundColor }}>
              <div className="container mx-auto p-6">
              { children }
              </div>
            </main>
          </div>

          {/* Mobile overlay */}
          {isMobile && isSidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
              onClick={() => {
                setIsSidebarOpen(!isSidebarOpen);
              }}
            />
          )}
        </div>
    
      {/* <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<Signin />} />
        </Routes>
      </Router> */}
    </ThemeProvider>
  );
}

export default App;