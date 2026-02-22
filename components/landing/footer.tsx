export function Footer() {
  return (
    <footer className="border-t bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between gap-6">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} FlowPilot. Alle rettigheter forbeholdt.
        </p>
        <div className="flex gap-4 text-sm text-slate-600">
          <a href="#features" className="hover:text-blue-600">Funksjoner</a>
          <a href="#pricing" className="hover:text-blue-600">Priser</a>
          <a href="#contact" className="hover:text-blue-600">Kontakt</a>
          <a href="/login" className="hover:text-blue-600">Logg inn</a>
        </div>
      </div>
    </footer>
  )
}

