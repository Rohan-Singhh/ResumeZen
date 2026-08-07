/* eslint-disable react/prop-types */
const prompts = ['Improve my resume', 'Explain my ATS score', 'Generate interview questions', 'Resume tips', 'Career guidance', 'Optimize projects', 'Improve skills section', 'Explain recruiter feedback'];

const Suggestions = ({ onSelect }) => (
  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
    {prompts.map((prompt) => (
      <button key={prompt} onClick={() => onSelect(prompt)} className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-left text-xs font-medium text-zinc-200 hover:border-violet-400/40 hover:bg-violet-500/15">
        {prompt}
      </button>
    ))}
  </div>
);

export default Suggestions;
