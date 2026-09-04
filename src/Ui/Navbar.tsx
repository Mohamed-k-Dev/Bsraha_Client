import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-paper-50/90 backdrop-blur-md border-b border-ink-200">
      <div className="w-10/12 max-w-7xl mx-auto h-20 flex justify-between items-center">
        <Logo size="md" to={null} />

        <div className="flex items-center gap-8">
          <Link
            to="/login"
            className="text-sm font-semibold tracking-wide text-ink-800 hover:text-ember-600 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="text-sm font-semibold tracking-wide bg-ink-900 text-white px-6 py-3 rounded-xl hover:bg-ember-500 transition-colors shadow-sm"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
