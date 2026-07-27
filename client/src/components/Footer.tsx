export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#080c14] py-8 text-center text-xs text-slate-500">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <p>&copy; {new Date().getFullYear()} CyberShakti. Protecting citizens against cyber frauds.</p>
        <div className="flex gap-4">
          <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
          <span>&middot;</span>
          <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
          <span>&middot;</span>
          <span className="hover:text-slate-400 cursor-pointer text-teal-500">Emergency Helpline: 1930</span>
        </div>
      </div>
    </footer>
  );
}
