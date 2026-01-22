export const routes = {
  public: {
    home: "/",
    pricing: "/pricing",
  },
  auth: {
    login: "/login",
    register: "/register",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    mfa: "/mfa",
  },
  app: {
    dashboard: "/app/dashboard",
    devices: "/app/devices",
    alerts: "/app/alerts",
    settings: "/app/settings",
  },
} as const;

export const routeBuilders = {
  deviceDetails: (deviceId: string) => `/app/devices/${deviceId}`,
} as const;

export type RoutePath =
  | (typeof routes.public)[keyof typeof routes.public]
  | (typeof routes.auth)[keyof typeof routes.auth]
  | (typeof routes.app)[keyof typeof routes.app];
