import type { FC } from 'react'

const ASSISTANT_MESSAGES = [
  {
    author: 'Assistant',
    content: 'Try trimming the clip at 00:12 for a tighter intro and add a crossfade on the transition track.',
  },
  {
    author: 'You',
    content: 'Can you suggest a cinematic LUT that matches sunset footage?'
  },
  {
    author: 'Assistant',
    content: 'Apply the "Sunset Film" preset, then lower intensity to 65% for balanced skin tones.',
  },
]

const QUICK_ACTIONS = ['Summarize timeline', 'Suggest music', 'Fix color balance']

const AssistantPanel: FC = () => (
  <aside className='hidden h-full flex-col border-l border-white/10 bg-[#090c12] text-sm text-zinc-300 lg:flex lg:min-h-[520px] lg:w-80'>
    <div className='border-b border-white/5 px-5 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-purple-300'>
      Assistant
    </div>

    <div className='flex-1 overflow-auto px-5 py-4 space-y-4'>
      {ASSISTANT_MESSAGES.map(({ author, content }, index) => (
        <div
          key={`${author}-${index}`}
          className={`rounded-lg border px-4 py-3 text-sm leading-relaxed ${
            author === 'Assistant'
              ? 'border-purple-500/30 bg-purple-500/10 text-purple-100'
              : 'border-white/10 bg-white/5 text-zinc-100'
          }`}
        >
          <p className='text-xs uppercase tracking-wide text-zinc-400'>{author}</p>
          <p className='mt-2'>{content}</p>
        </div>
      ))}
    </div>

    <div className='border-t border-white/5 px-5 py-4'>
      <div className='mb-3 flex flex-wrap gap-2'>
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action}
            className='rounded-full border border-purple-500/40 px-3 py-1 text-xs text-purple-200 transition-colors hover:border-purple-400 hover:bg-purple-500/10 hover:text-white'
          >
            {action}
          </button>
        ))}
      </div>
      <div className='space-y-3 rounded-lg border border-white/10 bg-[#0f131a] p-3'>
        <textarea
          rows={3}
          placeholder='Ask a question or describe what you need…'
          className='w-full resize-none rounded-md border border-white/10 bg-[#090c12] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-500/60 focus:outline-none'
        />
        <button className='w-full rounded-md bg-purple-500/90 px-4 py-2 text-sm font-medium text-black transition hover:bg-purple-400'>
          Send
        </button>
      </div>
    </div>
  </aside>
)

export default AssistantPanel

