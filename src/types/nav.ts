// File: src/types/nav.ts
// (Assuming from original, add if missing)
export interface PilotRoute {
  app: string;
  view: string;
}

export interface NavItem {
  key: string;
  label: string;
  app: string;
  view: string;
  icon: string;
}

export interface AppSummary {
  key: string;
  label: string;
}