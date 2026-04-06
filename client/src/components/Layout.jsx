import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function Layout() {
  return (
    <div className="mesh-page flex min-h-screen flex-col">
      <Navbar />
      <main className="relative flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
