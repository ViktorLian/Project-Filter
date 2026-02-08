export function Footer() {
  return (
    <footer className="border-t bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between gap-6">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} FlowPilot. All rights reserved.
        </p>
        <div className="flex gap-4 text-sm text-slate-600">
          <a href="#features" className="hover:text-blue-600">Features</a>
          <a href="#pricing" className="hover:text-blue-600">Pricing</a>
          <a href="#contact" className="hover:text-blue-600">Contact</a>
          <a href="/dashboard" className="hover:text-blue-600">Login</a>
        </div>
      </div>
    </footer>
  )
}
