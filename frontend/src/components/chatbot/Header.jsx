/* eslint-disable react/prop-types */
const Header = ({ pageContext, onClose, onClear, onStop, onRegenerate, isLoading, canRegenerate }) => (
  <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-2xl">
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25">✦</div>
      <div className="min-w-0">
        <h2 className="truncate text-sm font-semibold text-white">ResumeZen AI</h2>
        <p className="truncate text-xs text-zinc-400">Context: {pageContext.title}</p>
      </div>
    </div>
    <div className="flex shrink-0 items-center gap-1">
      {isLoading && <button onClick={onStop} className="rounded-xl px-2 py-1 text-xs text-zinc-300 hover:bg-white/10">Stop</button>}
      {!isLoading && canRegenerate && <button onClick={onRegenerate} className="rounded-xl px-2 py-1 text-xs text-zinc-300 hover:bg-white/10">Regenerate</button>}
      <button onClick={onClear} className="rounded-xl px-2 py-1 text-xs text-zinc-300 hover:bg-white/10">Clear</button>
      <button onClick={onClose} className="rounded-xl px-2 py-1 text-lg leading-none text-zinc-300 hover:bg-white/10" aria-label="Close AI assistant">×</button>
    </div>
  </div>
);

export default Header;
