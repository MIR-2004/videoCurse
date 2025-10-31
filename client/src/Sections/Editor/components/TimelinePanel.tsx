import type { FC } from 'react'

type TimelinePanelProps = {
  timelineTicks: number[]
  waveform: number[]
}

const TimelinePanel: FC<TimelinePanelProps> = ({ timelineTicks, waveform }) => (
  <div className='h-44 border-t border-white/10 bg-[#11141a]'>
    <div className='flex items-center justify-between border-b border-white/5 px-6 py-3 text-xs text-zinc-400'>
      <div className='flex items-center gap-4'>
        <span className='rounded bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] text-zinc-500'>Timeline</span>
        <button className='rounded border border-white/10 px-2 py-1 text-xs transition-colors hover:border-purple-500/40 hover:text-white'>
          + Track
        </button>
      </div>
      <div className='flex items-center gap-6'>
        <span>00:00:00:00</span>
        <span className='rounded border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide'>100%</span>
      </div>
    </div>
    <div className='h-full px-6 py-4 text-xs text-zinc-400'>
      <div className='relative mb-4 h-6 border-b border-white/5'>
        {timelineTicks.map((tick) => (
          <div key={tick} className='absolute flex flex-col items-center' style={{ left: `${tick * 10}%` }}>
            <span className='h-4 w-px bg-white/20'></span>
            <span className='mt-1 text-[10px]'>{`00:${(tick * 5).toString().padStart(2, '0')}`}</span>
          </div>
        ))}
      </div>
      <div className='space-y-3'>
        <div className='rounded-lg border border-white/10 bg-[#0c0f14] p-3'>
          <div className='mb-2 flex items-center justify-between text-[10px] uppercase tracking-wide text-zinc-500'>
            <span>Video 1</span>
            <span>V1</span>
          </div>
          <div className='flex h-16 items-center gap-2'>
            <div className='flex h-full flex-1 gap-1'>
              <div className='flex-1 rounded bg-purple-500/60'></div>
              <div className='flex-1 rounded bg-purple-500/30'></div>
              <div className='flex-1 rounded bg-purple-500/40'></div>
            </div>
            <div className='w-10 rounded bg-white/10 text-center text-[10px] uppercase tracking-wide text-white'>FX</div>
          </div>
        </div>
        <div className='rounded-lg border border-white/10 bg-[#0c0f14] p-3'>
          <div className='mb-2 flex items-center justify-between text-[10px] uppercase tracking-wide text-zinc-500'>
            <span>Audio 1</span>
            <span>A1</span>
          </div>
          <div className='flex h-16 items-end gap-0.5 overflow-hidden rounded bg-black/40 p-2'>
            {waveform.map((height, index) => (
              <span
                key={index}
                className='w-[2px] rounded bg-purple-400/70'
                style={{ height: `${Math.max(10, height)}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default TimelinePanel

