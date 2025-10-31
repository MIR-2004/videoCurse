import React, { useCallback, useRef, useState } from 'react'

type DroppedFile = {
  id: string
  file: File
  url: string
  kind: 'video' | 'image'
}

const Editor = () => {
  const [files, setFiles] = useState<DroppedFile[]>([])
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Generate waveform data (mock)
  const generateWaveform = () => {
    return Array.from({ length: 100 }, () => Math.random() * 100)
  }

  const waveform = generateWaveform()

  const handleFiles = useCallback((fileList: FileList) => {
    const next: DroppedFile[] = []
    Array.from(fileList).forEach((file) => {
      const kind: DroppedFile['kind'] = file.type.startsWith('image')
        ? 'image'
        : file.type.startsWith('video')
        ? 'video'
        : 'image'
      const url = URL.createObjectURL(file)
      next.push({ id: `${file.name}-${file.size}-${file.lastModified}` , file, url, kind })
    })
    setFiles((prev) => {
      const updated = [...prev, ...next]
      // Set first video as active preview if none selected
      if (!activeVideoUrl) {
        const firstVideo = [...updated].find((f) => f.kind === 'video')
        if (firstVideo) setActiveVideoUrl(firstVideo.url)
      }
      return updated
    })
  }, [activeVideoUrl])

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
      e.dataTransfer.clearData()
    }
  }, [handleFiles])

  const onBrowse = useCallback(() => {
    inputRef.current?.click()
  }, [])

  return (
    <div className='h-screen w-full bg-black text-white pt-16'>
      <div className='h-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4'>
        {/* Left: Video Preview */}
        <div className='flex flex-col gap-3'>
          <div className='bg-zinc-900/60 rounded-lg border border-white/10 p-3 flex items-center justify-center'>
            {activeVideoUrl ? (
              <video
                src={activeVideoUrl}
                className='w-full h-[60vh] md:h-[70vh] rounded-lg bg-black'
                controls
              />
            ) : (
              <div className='text-zinc-300 text-center'>
                Select or drop a video to preview
              </div>
            )}
          </div>

          {/* Waveform/Sound Graph */}
          <div className='bg-zinc-900/60 rounded-lg border border-white/10 p-3 h-32 flex items-end'>
            <div className='w-full h-full flex items-end justify-between gap-0.5'>
              {waveform.map((height, index) => (
                <div
                  key={index}
                  className='bg-purple-500 rounded-t-sm transition-all hover:bg-purple-400'
                  style={{ height: `${height}%`, width: 'calc(100% / 100)' }}
                  title={`${index}: ${height.toFixed(0)}%`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Assets panel */}
        <div
          className='bg-zinc-900/60 rounded-lg border border-white/10 p-4 flex flex-col'
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
        >
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold'>Assets</h2>
            <div className='space-x-2'>
              <button
                className='bg-purple-600 hover:bg-purple-700 text-white py-1 px-3 rounded-md transition-colors'
                onClick={onBrowse}
              >
                Upload
              </button>
              <input
                ref={inputRef}
                type='file'
                accept='video/*,image/*'
                multiple
                className='hidden'
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
            </div>
          </div>

          <div className='flex-1 rounded-md border border-dashed border-white/15 p-4 overflow-auto'>
            {files.length === 0 ? (
              <div className='h-full flex items-center justify-center text-zinc-400 text-center'>
                Drag and drop videos or images here, or click Upload
              </div>
            ) : (
              <ul className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                {files.map((f) => (
                  <li key={f.id} className='group'>
                    {f.kind === 'image' ? (
                      <img
                        src={f.url}
                        alt={f.file.name}
                        className='w-full h-28 object-cover rounded-md border border-white/10'
                      />
                    ) : (
                      <button
                        className='w-full h-28 bg-black rounded-md border border-white/10 grid place-items-center text-sm text-zinc-300 hover:border-purple-500 hover:text-white'
                        onClick={() => setActiveVideoUrl(f.url)}
                        title={f.file.name}
                      >
                        Video
                      </button>
                    )}
                    <p className='mt-1 text-xs text-zinc-400 truncate'>{f.file.name}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Editor


