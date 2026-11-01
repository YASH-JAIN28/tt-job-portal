import { useState } from "react";
import Dashboard from "./components/Dashboard";
import Auth from "./components/Auth";

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ttjobportal_user"));
    } catch {
      return null;
    }
  });

  if (!user) {
    return <Auth onAuthenticated={setUser} />;
  }

  const handleLogout = () => {
    localStorage.removeItem("ttjobportal_token");
    localStorage.removeItem("ttjobportal_user");
    setUser(null);
  };

  return (
    <div className="app-shell py-5">
      <div className="container">
        <header className="page-header mb-5 glass-card p-4 shadow-sm">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
            <div>
              <p className="text-uppercase text-secondary mb-2 tracking">
                Job Portal Dashboard
              </p>
              <h1 className="display-5 fw-bold">AI-powered job matching</h1>
              <p className="lead text-muted mb-0" style={{ maxWidth: "680px" }}>
                Explore roles, evaluate fit automatically, manage applications,
                and generate a resume built from the selected job description.
              </p>
            </div>
            <div className="text-md-end">
              <p className="mb-1 fw-semibold">Welcome, {user.name}</p>
              <small className="text-muted">
                Top roles, fit scoring, resume builder, and application tracking
                in one clean dashboard.
              </small>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary mt-3"
                onClick={handleLogout}
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        <Dashboard />

        <footer className="page-footer text-center py-4 mt-5 glass-card">
          <p className="mb-1">
            Job Portal Dashboard • Empowering IT professionals with cloud,
            DevOps, and infrastructure roles.
          </p>
          <small className="text-muted">
            Designed for clean resume generation, intelligent job matching, and
            professional application tracking.
          </small>
        </footer>
      </div>
    </div>
  );
}

export default App;
