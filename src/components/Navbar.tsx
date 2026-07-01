import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Link, useLocation } from "react-router-dom";
import { gsap, ScrollTrigger } from "../lib/gsap";

const links = [
  { label: "Language", to: { pathname: "/", hash: "#features" } },
  { label: "Syntax", to: { pathname: "/", hash: "#syntax" } },
  { label: "The IDE", to: { pathname: "/", hash: "#install" } },
];

export default function Navbar() {
  const navRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const onDocs = pathname === "/docs";

  useGSAP(() => {
    if (!navRef.current) return;
    const scrolled = {
      backgroundColor: "rgba(255,250,240,0.9)",
      boxShadow: "0 8px 24px -12px rgba(57,14,37,0.35)",
      borderColor: "#f6b8b9",
    };
    const top = {
      backgroundColor: "rgba(255,250,240,0)",
      boxShadow: "0 0 0 rgba(0,0,0,0)",
      borderColor: "rgba(0,0,0,0)",
    };

    ScrollTrigger.create({
      start: "120px top",
      onEnter: () => gsap.to(navRef.current, { ...scrolled, duration: 0.35, overwrite: true }),
      onLeaveBack: () => gsap.to(navRef.current, { ...top, duration: 0.35, overwrite: true }),
    });

    if (onDocs) {
      gsap.set(navRef.current, scrolled);
    }
  }, [onDocs]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <div
        ref={navRef}
        className="flex w-full max-w-5xl items-center justify-between rounded-full border border-transparent px-5 py-3 backdrop-blur-md"
      >
        <Link to="/" className="flex items-baseline gap-1.5 font-display">
          <span className="text-xl font-bold tracking-tight text-rhubarb-900">
            rhubarb
          </span>
          <span className="text-xl font-bold text-leaf-600">.</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="font-sans text-sm font-medium text-rhubarb-800/80 transition-colors hover:text-rhubarb-600"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/docs"
            className={`font-sans text-sm font-medium transition-colors ${
              onDocs ? "text-rhubarb-600" : "text-rhubarb-800/80 hover:text-rhubarb-600"
            }`}
          >
            Docs
          </Link>
        </nav>

        <Link
          to={{ pathname: "/", hash: "#install" }}
          className="rounded-full bg-rhubarb-600 px-4 py-2 text-sm font-semibold text-custard-50 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-rhubarb-700"
        >
          Get the IDE
        </Link>
      </div>
    </header>
  );
}
