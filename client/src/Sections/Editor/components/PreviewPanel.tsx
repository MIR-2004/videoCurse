import type { FC } from 'react'

type PreviewPanelProps = {
  activeVideoUrl: string | null
}

const PreviewPanel: FC<PreviewPanelProps> = ({ activeVideoUrl }) => (
  <aside className='flex h-full flex-col bg-[#090c12]'>
    <div className='flex items-center justify-between border-b border-white/5 px-5 py-2.5 text-sm text-zinc-300'>
      <span className='font-semibold text-white'>Preview</span>
      <span className='rounded border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500'>1/2</span>
    </div>
    <div className='flex flex-1 items-center justify-center px-4 py-2'>
      <div className='w-full rounded-lg border border-white/10 bg-black/90 p-2'>
        {activeVideoUrl ? (
          <video src={activeVideoUrl} controls className='aspect-video w-full max-h-40 rounded-md bg-black' />
        ) : (
          <div className='grid h-full place-items-center rounded-md border border-dashed border-white/10 p-4 text-center text-sm text-zinc-500'>
            Select or drop a video to preview
          </div>
        )}
      </div>
    </div>
    <div className='border-t border-white/5 px-5 py-1.5 text-xs text-zinc-400'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <button className='rounded border border-white/10 px-2 py-1 transition-colors hover:border-white/40 hover:text-white'>
            ⟲
          </button>
          <button className='rounded-full border border-white/10 px-3 py-1 transition-colors hover:border-white/40 hover:text-white'>
            ▶
          </button>
          <button className='rounded border border-white/10 px-2 py-1 transition-colors hover:border-white/40 hover:text-white'>
            ⟳
          </button>
        </div>
        <div className='flex items-center gap-3'>
          <span>00:00:00:00</span>
          <span className='rounded border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide'>Fit</span>
        </div>
      </div>
    </div>
  </aside>
)

export default PreviewPanel

