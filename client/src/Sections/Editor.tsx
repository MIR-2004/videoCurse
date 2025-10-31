import { useCallback, useMemo, useState } from 'react'

import AssistantPanel from './Editor/components/AssistantPanel'
import MediaPanel from './Editor/components/MediaPanel'
import PreviewPanel from './Editor/components/PreviewPanel'
import ProjectSidebar from './Editor/components/ProjectSidebar'
import TimelinePanel from './Editor/components/TimelinePanel'
import { useEditorMedia } from './Editor/hooks/useEditorMedia'
import type { LibraryItem, TimelineClip } from './Editor/types'

const MIN_TIMELINE_SECONDS = 10

const generateWaveform = () => Array.from({ length: 100 }, () => Math.random() * 100)

const Editor = () => {
  const { files, activeVideoUrl, addFiles, setActiveVideoUrl } = useEditorMedia()
  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>([])

  const libraryItems = useMemo<LibraryItem[]>(
    () => [
      { name: 'Folder', count: files.length },
      { name: 'Shared Media', count: 0 },
      { name: 'Sample Colors', count: 15 },
      { name: 'Sample Video', count: 20 },
    ],
    [files.length]
  )

  const waveform = useMemo(generateWaveform, [])
  const timelineDuration = useMemo(() => {
    const lastClipEnd = timelineClips.reduce((max, clip) => Math.max(max, clip.start + clip.duration), 0)
    return Math.max(MIN_TIMELINE_SECONDS, Math.ceil(lastClipEnd))
  }, [timelineClips])

  const timelineTicks = useMemo(
    () => Array.from({ length: timelineDuration + 1 }, (_, index) => index),
    [timelineDuration]
  )

  const handleSelectVideo = useCallback(
    (url: string) => {
      setActiveVideoUrl(url)
    },
    [setActiveVideoUrl]
  )

  const handleDropClip = useCallback(
    (fileId: string) => {
      const file = files.find((item) => item.id === fileId)
      if (!file || file.kind !== 'video') return

      setTimelineClips((prev) => {
        const nextStart = prev.reduce((max, clip) => Math.max(max, clip.start + clip.duration), 0)

        const clip: TimelineClip = {
          id: `${file.id}-${nextStart}`,
          fileId: file.id,
          name: file.file.name,
          start: nextStart,
          duration: 1,
          url: file.url,
        }

        return [...prev, clip]
      })

      setActiveVideoUrl(file.url)
    },
    [files, setActiveVideoUrl]
  )

  return (
    <div className='flex min-h-screen w-full flex-col overflow-y-auto bg-[#0c0f13] pb-6 text-white'>
      <div className='flex flex-1 min-h-0 overflow-hidden'>
        <ProjectSidebar libraryItems={libraryItems} />

        <div className='flex flex-1 min-h-0 flex-col overflow-hidden lg:flex-row'>
          <div className='flex flex-1 min-h-0 flex-col overflow-hidden'>
            <section className='flex flex-1 min-h-0 flex-col overflow-hidden bg-[#0f1319] md:grid md:grid-cols-[minmax(0,1fr)_360px]'>
              <MediaPanel files={files} onFilesAdded={addFiles} onSelectVideo={handleSelectVideo} />
              <PreviewPanel activeVideoUrl={activeVideoUrl} />
            </section>

            <TimelinePanel clips={timelineClips} onDropClip={handleDropClip} timelineTicks={timelineTicks} waveform={waveform} />
          </div>

          <AssistantPanel />
        </div>
      </div>
    </div>
  )
}

export default Editor


