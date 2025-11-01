import { useCallback, useMemo, useState } from 'react'

import AssistantPanel from './Editor/components/AssistantPanel'
import EditorHeader from './Editor/components/EditorHeader'
import EditorNavigation from './Editor/components/EditorNavigation'
import MediaPanel from './Editor/components/MediaPanel'
import PreviewPanel from './Editor/components/PreviewPanel'
import ProjectSidebar from './Editor/components/ProjectSidebar'
import TimelinePanel from './Editor/components/TimelinePanel'
import { useEditorMedia } from './Editor/hooks/useEditorMedia'
import type { AssistantMessage, DroppedFile, LibraryItem, TimelineClip } from './Editor/types'
import { createEditJob } from '../services/editJobs'

const NAV_ITEMS = ['Assemble', 'Adjust', 'Audio', 'Export']

const DEFAULT_LIBRARY_ITEMS: LibraryItem[] = [
  { name: 'Brand Toolkit', count: 5 },
  { name: 'B-Roll Clips', count: 18 },
  { name: 'Sound Effects', count: 26 },
  { name: 'Color LUTs', count: 7 },
]

const TIMELINE_TICKS = Array.from({ length: 13 }, (_, index) => index * 5)

const WAVEFORM = Array.from({ length: 160 }, (_, index) => {
  const sine = Math.sin(index / 7) * 35
  const cosine = Math.cos(index / 11) * 20
  return Math.max(12, Math.min(95, Math.round(40 + sine + cosine)))
})

const WELCOME_MESSAGE: AssistantMessage = {
  id: 'assistant-welcome',
  role: 'assistant',
  content: 'Upload a clip in the media panel and describe the edit you need. I will send it to the AI pipeline and report back with progress.',
}

const CLIP_DURATION_SECONDS = 8

const Editor = () => {
  const { files, activeVideoUrl, addFiles, setActiveVideoUrl } = useEditorMedia()
  const [messages, setMessages] = useState<AssistantMessage[]>([WELCOME_MESSAGE])
  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [assistantError, setAssistantError] = useState<string | null>(null)

  const defaultVideoId = useMemo(() => files.find((file) => file.kind === 'video')?.id ?? null, [files])

  const handleFilesAdded = useCallback(
    (fileList: FileList) => {
      setAssistantError(null)
      addFiles(fileList)
    },
    [addFiles],
  )

  const handleSelectVideo = useCallback(
    (url: string) => {
      setActiveVideoUrl(url)
    },
    [setActiveVideoUrl],
  )

  const handleDropClip = useCallback(
    (fileId: string) => {
      const file = files.find((item) => item.id === fileId)
      if (!file) return

      setTimelineClips((current) => {
        const nextStart = current.reduce((latestEnd, clip) => Math.max(latestEnd, clip.start + clip.duration), 0)
        const newClip: TimelineClip = {
          id: `clip-${file.id}-${Date.now()}`,
          fileId: file.id,
          name: file.file.name,
          start: nextStart,
          duration: CLIP_DURATION_SECONDS,
          url: file.url,
        }
        return [...current, newClip]
      })

      setActiveVideoUrl(file.url)
    },
    [files, setActiveVideoUrl],
  )

  const handleAssistantSubmit = useCallback(
    async ({ prompt, videoFile }: { prompt: string; videoFile: DroppedFile }) => {
      const timestamp = Date.now()
      const userMessage: AssistantMessage = {
        id: `user-${timestamp}`,
        role: 'user',
        content: prompt,
      }

      setMessages((current) => [...current, userMessage])
      setIsProcessing(true)
      setAssistantError(null)

      try {
        const result = await createEditJob({ prompt, video: videoFile.file })

        const assistantText = result.outputUrl
          ? `✨ Edit complete! Download your clip here: ${result.outputUrl}`
          : `✅ Edit request sent. Track job ${result.jobId} for the processed video.`

        const assistantMessage: AssistantMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: assistantText,
        }

        setMessages((current) => [...current, assistantMessage])
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to submit edit request'
        setAssistantError(message)

        const assistantMessage: AssistantMessage = {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ ${message}`,
        }

        setMessages((current) => [...current, assistantMessage])
      } finally {
        setIsProcessing(false)
      }
    },
    [],
  )

  const showTimelinePlaceholder = timelineClips.length === 0

  return (
    <div className='flex min-h-screen flex-col bg-[#05070b] text-white'>
      <EditorHeader />
      <EditorNavigation navItems={NAV_ITEMS} />
      <div className='flex flex-1 overflow-hidden'>
        <ProjectSidebar libraryItems={DEFAULT_LIBRARY_ITEMS} />
        <MediaPanel files={files} onFilesAdded={handleFilesAdded} onSelectVideo={handleSelectVideo} />
        <div className='flex flex-1 flex-col bg-[#080b11]'>
          <div className='flex flex-1 overflow-hidden'>
            <div className='flex flex-1 flex-col border-r border-white/10 bg-[#0a0d14]'>
              <div className='flex flex-1 items-center justify-center px-8 text-sm text-zinc-500'>
                {showTimelinePlaceholder ? (
                  <div className='rounded-lg border border-dashed border-white/10 px-6 py-8 text-center leading-relaxed'>
                    <p className='text-zinc-300'>Drop clips from the media panel onto the timeline to build your sequence.</p>
                    <p className='mt-2 text-xs text-zinc-500'>Select any video to preview it on the right. The assistant can automate trims, color work, and more.</p>
                  </div>
                ) : (
                  <div className='flex h-full w-full items-center justify-center'>
                    <video
                      src={activeVideoUrl ?? timelineClips[timelineClips.length - 1]?.url}
                      controls
                      className='max-h-[70%] max-w-[80%] rounded-lg border border-white/10 bg-black shadow-xl shadow-purple-900/30'
                    />
                  </div>
                )}
              </div>
            </div>
            <PreviewPanel activeVideoUrl={activeVideoUrl} />
            <AssistantPanel
              messages={messages}
              videoFiles={files}
              defaultVideoId={defaultVideoId}
              isProcessing={isProcessing}
              error={assistantError}
              onSubmit={handleAssistantSubmit}
            />
          </div>
          <TimelinePanel timelineTicks={TIMELINE_TICKS} waveform={WAVEFORM} clips={timelineClips} onDropClip={handleDropClip} />
        </div>
      </div>
    </div>
  )
}

export default Editor
