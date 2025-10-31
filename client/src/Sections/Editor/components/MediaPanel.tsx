import { useCallback, useRef } from 'react'
import type { ChangeEvent, DragEvent, FC } from 'react'

import { EDITOR_MEDIA_DRAG_DATA_KEY } from '../types'
import type { DroppedFile } from '../types'

type MediaPanelProps = {
  files: DroppedFile[]
  onFilesAdded: (fileList: FileList) => void
  onSelectVideo: (url: string) => void
}

const MediaPanel: FC<MediaPanelProps> = ({ files, onFilesAdded, onSelectVideo }) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleBrowse = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()

      if (event.dataTransfer.files?.length) {
        onFilesAdded(event.dataTransfer.files)
        event.dataTransfer.clearData()
      }
    },
    [onFilesAdded]
  )

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  const handleItemDragStart = useCallback((event: DragEvent<HTMLElement>, file: DroppedFile) => {
    if (file.kind !== 'video') return

    event.dataTransfer.setData('text/plain', file.id)
    event.dataTransfer.setData(EDITOR_MEDIA_DRAG_DATA_KEY, file.id)
    event.dataTransfer.effectAllowed = 'copy'
  }, [])

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { files: selectedFiles } = event.target

      if (selectedFiles?.length) {
        onFilesAdded(selectedFiles)
        event.target.value = ''
      }
    },
    [onFilesAdded]
  )

  return (
    <div className='flex flex-col border-r border-white/10'>
      <div className='flex items-center justify-between border-b border-white/5 px-6 py-4 text-sm text-zinc-300'>
        <div className='flex items-center gap-3'>
          <button className='rounded-md bg-purple-500/80 px-4 py-1.5 text-sm font-medium text-black transition hover:bg-purple-400'>
            Import
          </button>
          <button className='rounded-md border border-white/10 px-4 py-1.5 transition-colors hover:border-white/30 hover:text-white'>
            Record
          </button>
        </div>
        <div className='relative'>
          <input
            type='search'
            placeholder='Search project media'
            className='w-52 rounded-md border border-white/10 bg-[#090c12] px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-purple-500/60 focus:outline-none'
          />
        </div>
      </div>
      <div className='flex-1 overflow-auto px-5 py-3' onDragOver={handleDragOver} onDrop={handleDrop}>
        <div
          className='flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-purple-500/40 bg-[#11161d]/70 text-center text-sm text-zinc-400 transition hover:border-purple-400 hover:text-white'
          onClick={handleBrowse}
        >
          <div className='rounded-full bg-purple-500/20 p-2.5 text-purple-400'>
            ⭳
          </div>
          <div>
            <p className='font-medium text-white'>Drop your video clips, images, or audio here</p>
            <p className='text-xs text-zinc-500'>Or click to browse from your computer</p>
          </div>
          <button className='rounded-md border border-white/10 px-4 py-1 text-xs uppercase tracking-wide text-zinc-300 transition hover:border-purple-500/50 hover:text-white'>
            Browse Files
          </button>
        </div>

        {files.length > 0 && (
          <div className='mt-6 space-y-4'>
            <div className='flex items-center justify-between text-xs text-zinc-400'>
              <span className='uppercase tracking-[0.3em] text-[10px] text-zinc-500'>Project Assets</span>
              <span>
                {files.length} item
                {files.length === 1 ? '' : 's'}
              </span>
            </div>
            <ul className='grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4'>
              {files.map((file) => (
                <li
                  key={file.id}
                  className='group rounded-lg border border-white/10 bg-[#0b0f15] p-2 transition-colors hover:border-purple-500/40 hover:bg-[#121922]'
                  draggable={file.kind === 'video'}
                  onDragStart={(event) => handleItemDragStart(event, file)}
                >
                  <div className='mb-2 h-28 w-full overflow-hidden rounded-md border border-white/10 bg-black'>
                    {file.kind === 'image' ? (
                      <img src={file.url} alt={file.file.name} className='h-full w-full object-cover' />
                    ) : (
                      <button
                        draggable
                        className='grid h-full w-full place-items-center text-xs text-zinc-300 transition-colors group-hover:text-white'
                        onClick={() => onSelectVideo(file.url)}
                        onDragStart={(event) => handleItemDragStart(event, file)}
                        title={file.file.name}
                      >
                        ▶
                      </button>
                    )}
                  </div>
                  <p className='truncate text-xs text-zinc-300'>{file.file.name}</p>
                  <p className='text-[10px] uppercase text-zinc-500'>{(file.file.size / (1024 * 1024)).toFixed(1)} MB</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type='file'
        accept='video/*,image/*'
        multiple
        className='hidden'
        onChange={handleInputChange}
      />
    </div>
  )
}

export default MediaPanel

