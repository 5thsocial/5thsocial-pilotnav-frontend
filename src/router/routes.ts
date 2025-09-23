import Home from '../pages/Home';
import Workflow from '../pages/Workflow';
import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import ForgotPassword from '../pages/ForgotPassword';
import VerifyOTP from '../pages/VerifyOTP';
import ResetPassword from '../pages/ResetPassword';
import GoogleCallback from '../pages/GoogleCallback';
import FacebookCallback from '../pages/FacebookCallback';
import Settings from '../pages/Settings';
import { Navigate } from 'react-router-dom';

const pilotRoutes = {
  create: "/create",
  feed: "/feed", 
  messages: "/messages",
};

interface RouteConfig {
  path: string;
  element: string;
  props?: string[];
  systemOverride?: string;
  redirect?: string;
}

const routeConfig: RouteConfig[] = [
  {
    path: "/",
    element: "Home",
    props: ["selectedSystem", "selectedTxnCode"]
  },
  {
    path: "/signin",
    element: "SignIn"
  },
  {
    path: "/signup",
    element: "SignUp"
  },
  {
    path: "/forgot-password",
    element: "ForgotPassword"
  },
  {
    path: "/forgot-password/verify-otp",
    element: "VerifyOTP"
  },
  {
    path: "/forgot-password/verify-otp/reset-password",
    element: "ResetPassword"
  },
  {
    path: "/auth/google/callback",
    element: "GoogleCallback"
  },
  {
    path: "/auth/facebook/callback",
    element: "FacebookCallback"
  },
  {
    path: "/settings",
    element: "Settings"
  },
  {
    path: "/workflow/:txnCode",
    element: "Workflow", 
    props: ["selectedSystem", "onWorkflowSelection"]
  },
  {
    path: "/social/*",
    element: "Home",
    props: ["selectedSystem", "selectedTxnCode"],
    systemOverride: "Social"
  },
  {
    path: "/kin/*",
    element: "Home", 
    props: ["selectedSystem", "selectedTxnCode"],
    systemOverride: "Kin"
  },
  {
    path: "/fan/*",
    element: "Home",
    props: ["selectedSystem", "selectedTxnCode"], 
    systemOverride: "Fan"
  },
  {
    path: "*",
    element: "Navigate",
    redirect: "/"
  }
];

const componentMap = {
  Home,
  Workflow,
  SignIn,
  SignUp,
  ForgotPassword,
  VerifyOTP,
  ResetPassword,
  GoogleCallback,
  FacebookCallback,
  Settings,
  Navigate
};

const loadPilotContent = (mode: string) => {
  const routePath = pilotRoutes[mode as keyof typeof pilotRoutes];
  if (routePath) {
    console.log(`Loading pilot content for mode: ${mode} at route: ${routePath}`);
  }
};

export { pilotRoutes, routeConfig, componentMap, loadPilotContent };