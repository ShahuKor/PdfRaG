export default function Footer() {
  const navLinks = [
    {
      name: "Dashboard",
      link: "/dashboard",
    },
  ];

  return (
    <footer className="bg-[#ffe252] w-full px-16 py-12">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="text-neutral-900 font-semibold text-lg">
              PRYSM
            </span>
          </div>

          <p className="text-gray-800 text-sm leading-relaxed max-w-xs">
            Your documents. Finally understood.
            <br />
            Get more information about document
          </p>

          <nav className="flex items-center gap-6">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.link}
                className="text-gray-900 font-medium text-sm hover:text-gray-600 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-t border-gray-900/20 mt-10 mb-6" />

      <div className="flex items-center justify-between">
        <p className="text-gray-800 text-sm">
          © 2026 Prysm. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
