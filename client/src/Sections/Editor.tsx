import { useCallback, useMemo, useState } from 'react'

import AssistantPanel from './Editor/components/AssistantPanel'
import EditorNavigation from './Editor/components/EditorNavigation'
import MediaPanel from './Editor/components/MediaPanel'
import PreviewPanel from './Editor/components/PreviewPanel'
import ProjectSidebar from './Editor/components/ProjectSidebar'
import TimelinePanel from './Editor/components/TimelinePanel'
import { useEditorMedia } from './Editor/hooks/useEditorMedia'
import type { AssistantMessage, DroppedFile, LibraryItem, TimelineClip } from './Editor/types'
import { createEditJob } from '../services/editJobs'

const NAV_ITEMS = ['Project', 'Edit', 'Effects', 'Audio', 'Titles']

const BASE_LIBRARY_ITEMS: LibraryItem[] = [
  { name: 'Video Clips', count: 6 },
  { name: 'Storyboards', count: 3 },
  { name: 'Audio Beds', count: 4 },
  { name: 'Exports', count: 2 },
]

const WAVEFORM = Array.from({ length: 120 }, (_, index) => {
  const waveformBase = Math.sin(index / 4) * 28 + 50
  const accent = index % 15 === 0 ? 20 : 0
  return Math.round(Math.min(92, Math.max(12, waveformBase + accent)))
})

const createId = () => `id-${Math.random().toString(36).slice(2, 10)}`

const Editor = () => {
  const { files, activeVideoUrl, addFiles, setActiveVideoUrl } = useEditorMedia()
  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>([])
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([])
  const [assistantError, setAssistantError] = useState<string | null>(null)
  const [isAssistantProcessing, setIsAssistantProcessing] = useState(false)

  const defaultVideoId = useMemo(() => {
    if (!activeVideoUrl) return null
    const match = files.find((file) => file.url === activeVideoUrl)
    return match?.id ?? null
  }, [activeVideoUrl, files])

  const libraryItems = useMemo<LibraryItem[]>(() => {
    if (files.length === 0) return BASE_LIBRARY_ITEMS

    const videoCount = files.filter((file) => file.kind === 'video').length
    const imageCount = files.filter((file) => file.kind === 'image').length

    return [
      { name: 'Video Clips', count: videoCount },
      { name: 'Images & Stills', count: imageCount },
      { name: 'Audio Beds', count: 4 },
      { name: 'Exports', count: timelineClips.length },
    ]
  }, [files, timelineClips.length])

  const maxClipEnd = useMemo(
    () => timelineClips.reduce((acc, clip) => Math.max(acc, clip.start + clip.duration), 30),
    [timelineClips],
  )

  const timelineTicks = useMemo(() => {
    const safeMax = Math.max(30, Math.ceil(maxClipEnd / 5) * 5)
    return Array.from({ length: safeMax / 5 + 1 }, (_, index) => index * 5)
  }, [maxClipEnd])

  const handleSelectVideo = useCallback(
    (url: string) => {
      setActiveVideoUrl(url)
    },
    [setActiveVideoUrl],
  )

  const handleDropClip = useCallback(
    (fileId: string) => {
      const file = files.find((candidate) => candidate.id === fileId && candidate.kind === 'video')
      if (!file) return

      setTimelineClips((prev) => {
        const nextStart = prev.reduce((acc, clip) => Math.max(acc, clip.start + clip.duration), 0)

        const newClip: TimelineClip = {
          id: createId(),
          fileId: file.id,
          name: file.file.name.replace(/\.[^/.]+$/, ''),
          start: nextStart,
          duration: 8,
          url: file.url,
        }

        return [...prev, newClip]
      })

      setActiveVideoUrl(file.url)
    },
    [files, setActiveVideoUrl],
  )

  const handleAssistantSubmit = useCallback(
    async ({ prompt, videoFile }: { prompt: string; videoFile: DroppedFile }) => {
      setAssistantError(null)

      const userMessage: AssistantMessage = {
        id: createId(),
        role: 'user',
        content: prompt,
      }

      const processingMessageId = createId()
      const processingMessage: AssistantMessage = {
        id: processingMessageId,
        role: 'assistant',
        content: `Processing "${prompt}" for ${videoFile.file.name}…`,
      }

      setAssistantMessages((prev) => [...prev, userMessage, processingMessage])
      setIsAssistantProcessing(true)

      try {
        const result = await createEditJob({ prompt, video: videoFile.file })

        const successContent = result.outputUrl
          ? [`Edit complete! Preview updated with the processed video.`, `Job ID: ${result.jobId}`, `Output URL: ${result.outputUrl}`].join('\n\n')
          : [`Edit request submitted successfully.`, `Job ID: ${result.jobId}`, `The processed video will appear once it is ready.`].join('\n\n')

        setAssistantMessages((prev) =>
          prev.map((message) =>
            message.id === processingMessageId
              ? {
                  ...message,
                  content: successContent,
                }
              : message,
          ),
        )

        if (result.outputUrl) {
          setActiveVideoUrl(result.outputUrl)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to send edit request.'
        setAssistantError(message)

        setAssistantMessages((prev) =>
          prev.map((existing) =>
            existing.id === processingMessageId
              ? {
                  ...existing,
                  content: `Something went wrong while processing your request.\n\n${message}`,
                }
              : existing,
          ),
        )
      } finally {
        setIsAssistantProcessing(false)
      }
    },
    [setActiveVideoUrl, createEditJob],
  )

  return (
    <div className='flex min-h-screen flex-col bg-[#05070c] text-white'>
      <EditorNavigation navItems={NAV_ITEMS} activeIndex={1} />

      <div className='flex flex-1 overflow-hidden'>
        <ProjectSidebar libraryItems={libraryItems} />

        <div className='flex flex-1 flex-col overflow-hidden'>
          <div className='flex flex-1 overflow-hidden bg-[#090d14]'>
            <div className='flex h-full flex-none overflow-hidden'>
              <MediaPanel files={files} onFilesAdded={addFiles} onSelectVideo={handleSelectVideo} />
            </div>

            <div className='flex flex-1 flex-col overflow-hidden'>
              <div className='flex flex-1 overflow-hidden border-b border-white/10'>
                <div className='flex flex-1'>
                  <PreviewPanel activeVideoUrl={activeVideoUrl} />
                </div>

                <AssistantPanel
                  messages={assistantMessages}
                  videoFiles={files}
                  defaultVideoId={defaultVideoId}
                  isProcessing={isAssistantProcessing}
                  error={assistantError}
                  onSubmit={handleAssistantSubmit}
                />
              </div>

              <TimelinePanel
                timelineTicks={timelineTicks}
                waveform={WAVEFORM}
                clips={timelineClips}
                onDropClip={handleDropClip}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Editor

