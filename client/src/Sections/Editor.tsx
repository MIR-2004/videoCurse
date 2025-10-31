import { useCallback, useMemo } from 'react'

import AssistantPanel from './Editor/components/AssistantPanel'
import MediaPanel from './Editor/components/MediaPanel'
import PreviewPanel from './Editor/components/PreviewPanel'
import ProjectSidebar from './Editor/components/ProjectSidebar'
import TimelinePanel from './Editor/components/TimelinePanel'
import { useEditorMedia } from './Editor/hooks/useEditorMedia'
import type { LibraryItem } from './Editor/types'

const TIMELINE_TICK_COUNT = 11

const generateWaveform = () => Array.from({ length: 100 }, () => Math.random() * 100)
const generateTimelineTicks = () => Array.from({ length: TIMELINE_TICK_COUNT }, (_, index) => index)

const Editor = () => {
  const { files, activeVideoUrl, addFiles, setActiveVideoUrl } = useEditorMedia()

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
  const timelineTicks = useMemo(generateTimelineTicks, [])

  const handleSelectVideo = useCallback(
    (url: string) => {
      setActiveVideoUrl(url)
    },
    [setActiveVideoUrl]
  )

  return (
    <div className='flex h-screen w-full flex-col bg-[#0c0f13] text-white'>
      <div className='flex flex-1 overflow-hidden'>
        <ProjectSidebar libraryItems={libraryItems} />

        <div className='flex flex-1 flex-col overflow-hidden lg:flex-row'>
          <div className='flex flex-1 flex-col overflow-hidden'>
            <section className='flex flex-1 flex-col overflow-hidden bg-[#0f1319] md:grid md:grid-cols-[minmax(0,1fr)_360px]'>
              <MediaPanel files={files} onFilesAdded={addFiles} onSelectVideo={handleSelectVideo} />
              <PreviewPanel activeVideoUrl={activeVideoUrl} />
            </section>

            <TimelinePanel timelineTicks={timelineTicks} waveform={waveform} />
          </div>

          <AssistantPanel />
        </div>
      </div>
    </div>
  )
}

export default Editor


