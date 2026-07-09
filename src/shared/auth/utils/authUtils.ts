export interface UserData {
  id: string;
  fullName: string;
  email: string;
  role: "medical-staff" | "hospital_admin";
  loginAt?: string;
  createdAt?: string;
}

export const authUtils = {
  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");
    return !!(token && userData);
  },

  // Get current user data
  getCurrentUser(): UserData | null {
    try {
      const userDataStr = localStorage.getItem("userData");
      if (!userDataStr) return null;
      return JSON.parse(userDataStr);
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  },

  // Get user role
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  },

  // Clear auth data (logout)
  clearAuth(): void {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("pendingUser");
  },

  // Get redirect path based on role
  getRedirectPath(role: string): string {
    switch (role) {
      case "medical-staff":
        return "/medical-staff/dashboard";
      case "hospital_admin":
        return "/admin/dashboard";
      default:
        return "/auth/login";
    }
  },
};
