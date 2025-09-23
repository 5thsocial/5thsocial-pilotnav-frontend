import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast"; // ADD THIS IMPORT
import { ThemeProvider } from "./contexts/ThemeContext";
import PilotShell from "./components/PilotShell";
import AuthLayout from "./layouts/AuthLayout";
import { routeConfig, componentMap } from "./router/routes";
import type { AppSummary, NavItem, PilotRoute } from "./types/nav";
import { fetchApps, fetchMenu, Fallback } from "./lib/navApi";
import authService from "./services/authService";

const Renderer = {
  render(route: PilotRoute) {
    if (route.app === 'Feed' && route.view === 'Home') {
      return <div style={{ minHeight:'60vh', display:'grid', placeItems:'center', color:'#9CA3AF' }}>Feed goes here</div>
    }
    return <div>Route: {route.app}/{route.view}</div>
  }
}

function AppContent() {
  const [selectedTxnCode, setSelectedTxnCode] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState("Social");
  const [apps, setApps] = useState<AppSummary[]>([]);
  const [menu, setMenu] = useState<NavItem[]>([]);
  const [route, setRoute] = useState<PilotRoute>(Fallback.defaultRoute);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = authService.getToken();
      const authenticated = !!token;
      
      const isAuthRoute = [
        "/signin",
        "/signup", 
        "/forgot-password",
        "/forgot-password/verify-otp",
        "/forgot-password/verify-otp/reset-password",
        "/auth/google/callback",
        "/auth/facebook/callback"
      ].includes(location.pathname);

      setIsAuthenticated(authenticated);

      // Handle redirects
      if (!authenticated && !isAuthRoute) {
        navigate('/signin', { replace: true });
      } else if (authenticated && isAuthRoute) {
        navigate('/', { replace: true });
      }

      setIsCheckingAuth(false);
    };

    checkAuth();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location.pathname, navigate]);

  // OAuth message listener
  useEffect(() => {
    // Listen for OAuth success messages from popup windows
    const handleMessage = (event: MessageEvent) => {
      // Security check - only accept messages from same origin
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS' || event.data.type === 'FACEBOOK_AUTH_SUCCESS') {
        const { token, user, message } = event.data.data;
        
        // Store auth data
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update app state
        setIsAuthenticated(true);
        
        // Show success message
        toast.success(message || 'Authentication successful');
        
        // Navigate to home
        navigate('/', { replace: true });
        
        // Trigger storage event for other tabs
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'authToken',
          newValue: token
        }));
      }
      
      if (event.data.type === 'GOOGLE_AUTH_ERROR' || event.data.type === 'FACEBOOK_AUTH_ERROR') {
        toast.error(event.data.error || 'Authentication failed');
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate, setIsAuthenticated]);

  // Handle workflow selection from URL
  useEffect(() => {
    const pathSegments = location.pathname.split("/");
    if (pathSegments[1] === "workflow" && pathSegments[2]) {
      setSelectedTxnCode(pathSegments[2]);
    } else if (location.pathname === "/") {
      setSelectedTxnCode(null);
    }
  }, [location.pathname]);

  // Load nav data only if authenticated
  useEffect(() => {
    if (!isAuthenticated || isCheckingAuth) return;

    let mounted = true;
    (async () => {
      try { 
        const a = await fetchApps(); 
        if (!mounted) return; 
        setApps(a.apps) 
      } catch { 
        setApps(Fallback.apps) 
      }
      try { 
        const m = await fetchMenu(route.app); 
        if (!mounted) return; 
        setMenu(m.menu); 
        setRoute(m.defaultRoute || route) 
      }
      catch { 
        setMenu(Fallback.menu(route.app)); 
        setRoute(Fallback.defaultRoute) 
      }
    })();
    return () => { mounted = false };
  }, [route.app, isAuthenticated, isCheckingAuth]);

  const handleWorkflowSelection = (txnCode: string) => {
    setSelectedTxnCode(txnCode);
  };

  const pickApp = async (app: string) => {
    try { 
      const m = await fetchMenu(app); 
      setMenu(m.menu); 
      setRoute(m.defaultRoute || { app, view: (m.menu?.[0]?.view || 'Home') }) 
    }
    catch { 
      setMenu(Fallback.menu(app)); 
      setRoute({ app, view: (Fallback.menu(app)[0]?.view || 'Home') }) 
    }
  };

  const onSelectMenu = (it: NavItem) => setRoute({ app: it.app, view: it.view });

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if current route is an auth route
  const isAuthRoute = [
    "/signin",
    "/signup",
    "/forgot-password", 
    "/forgot-password/verify-otp",
    "/forgot-password/verify-otp/reset-password",
    "/auth/google/callback",
    "/auth/facebook/callback"
  ].includes(location.pathname);

  if (isAuthRoute) {
    return (
      <AuthLayout>
        <Routes>
          {routeConfig.map((routeItem, index) => {
            const Component = componentMap[routeItem.element];

            if (routeItem.element === "Navigate") {
              return (
                <Route
                  key={index}
                  path={routeItem.path}
                  element={<Navigate to={routeItem.redirect!} replace />}
                />
              );
            }

            const props: any = {};
            if (routeItem.props?.includes("selectedSystem")) {
              props.selectedSystem = routeItem.systemOverride || selectedSystem;
            }
            if (routeItem.props?.includes("selectedTxnCode")) {
              props.selectedTxnCode = selectedTxnCode;
            }
            if (routeItem.props?.includes("onWorkflowSelection")) {
              props.onWorkflowSelection = handleWorkflowSelection;
            }

            return (
              <Route
                key={index}
                path={routeItem.path}
                element={<Component {...props} />}
              />
            );
          })}
        </Routes>
      </AuthLayout>
    );
  }

  // For authenticated routes, use PilotShell as layout
  return (
    <PilotShell 
      renderer={Renderer} 
      showTopBar={true}
      apps={apps}
      menu={menu}
      route={route}
      onPickApp={pickApp}
      onSelectMenu={onSelectMenu}
    >
      <Routes>
        {routeConfig.map((routeItem, index) => {
          const Component = componentMap[routeItem.element];

          if (routeItem.element === "Navigate") {
            return (
              <Route
                key={index}
                path={routeItem.path}
                element={<Navigate to={routeItem.redirect!} replace />}
              />
            );
          }

          const props: any = {};
          if (routeItem.props?.includes("selectedSystem")) {
            props.selectedSystem = routeItem.systemOverride || selectedSystem;
          }
          if (routeItem.props?.includes("selectedTxnCode")) {
            props.selectedTxnCode = selectedTxnCode;
          }
          if (routeItem.props?.includes("onWorkflowSelection")) {
            props.onWorkflowSelection = handleWorkflowSelection;
          }

          return (
            <Route
              key={index}
              path={routeItem.path}
              element={<Component {...props} />}
            />
          );
        })}
      </Routes>
    </PilotShell>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              theme: {
                primary: "#4aed88",
              },
            },
            error: {
              duration: 4000,
              theme: {
                primary: "#ff6b6b",
              },
            },
          }}
        />
      </Router>
    </ThemeProvider>
  );
}