"use client";

import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "見る" },
  { href: "/history", label: "履歴" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function open(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    if (window.location.pathname !== href) window.location.assign(href);
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col bg-background text-foreground">
      <div className="flex-1 overflow-y-auto">{children}</div>
      <nav className="grid grid-cols-2 border-t border-line bg-card pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <a
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              onClick={(event) => open(event, link.href)}
              className={`flex h-14 items-center justify-center text-base ${
                active ? "font-semibold text-accent" : "text-muted"
              }`}
            >
              {link.label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
