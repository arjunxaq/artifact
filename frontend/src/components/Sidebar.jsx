import { Link } from "react-router-dom";
import { FiHome, FiFileText, FiSettings } from "react-icons/fi";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">Artifact</div>

      <nav>
        <Link to="/">
          <FiHome /> Dashboard
        </Link>
        <Link to="/contracts">
          <FiFileText /> Contracts
        </Link>
        <Link to="/settings">
          <FiSettings /> Settings
        </Link>
      </nav>
    </aside>
  );
}
