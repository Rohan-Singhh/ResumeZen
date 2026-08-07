const TypingIndicator = () => (
  <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-white/10 bg-white/10 px-4 py-3 shadow-lg backdrop-blur-xl">
    {[0, 1, 2].map((dot) => <span key={dot} className="h-2 w-2 animate-bounce rounded-full bg-violet-300" style={{ animationDelay: `${dot * 120}ms` }} />)}
  </div>
);

export default TypingIndicator;
