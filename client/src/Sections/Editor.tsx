import { useCallback, useMemo, useState } from 'react'

import { createEditJob } from '../services/editJobs'
import AssistantPanel from './Editor/components/AssistantPanel'
import MediaPanel from './Editor/components/MediaPanel'
import PreviewPanel from './Editor/components/PreviewPanel'
import ProjectSidebar from './Editor/components/ProjectSidebar'
import TimelinePanel from './Editor/components/TimelinePanel'
import { useEditorMedia } from './Editor/hooks/useEditorMedia'
import type { AssistantMessage, DroppedFile, LibraryItem, TimelineClip } from './Editor/types'

const MIN_TIMELINE_SECONDS = 10

const generateWaveform = () => Array.from({ length: 100 }, () => Math.random() * 100)

const createMessageId = () => `message-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const summariseParsedCommand = (parsed: unknown): string | null => {
  if (!parsed || typeof parsed !== 'object') return null

  const maybeRecord = parsed as { actions?: Array<Record<string, unknown>> }
  const actions = Array.isArray(maybeRecord.actions) ? maybeRecord.actions : null

  if (!actions || actions.length === 0) return null

  const lines = actions.map((action, index) => {
    const name = typeof action.action === 'string' ? action.action : `Action ${index + 1}`
    const rawValue = (action as { value?: unknown }).value
    const valueText =
      rawValue === undefined || rawValue === null
        ? ''
        : typeof rawValue === 'object'
        ? ` → ${JSON.stringify(rawValue)}`
        : ` → ${String(rawValue)}`

    return `• ${name}${valueText}`
  })

  return lines.join('\n')
}

const Editor = () => {
  const { files, activeVideoUrl, addFiles, setActiveVideoUrl } = useEditorMedia()
  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>([])
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([
    {
      id: 'assistant-welcome',
      role: 'assistant',
      content: 'Upload a clip and describe the edit you want. I will plan the actions and process it with AI.',
    },
  ])
  const [isProcessingJob, setIsProcessingJob] = useState(false)
  const [assistantError, setAssistantError] = useState<string | null>(null)

  const videoFiles = useMemo(() => files.filter((file) => file.kind === 'video'), [files])
  const activeVideo = useMemo(
    () => videoFiles.find((file) => file.url === activeVideoUrl) ?? null,
    [videoFiles, activeVideoUrl],
  )

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

  const handleSubmitToAssistant = useCallback(
    async ({ prompt, videoFile }: { prompt: string; videoFile: DroppedFile }) => {
      const progressMessageId = createMessageId()

      setAssistantError(null)
      setAssistantMessages((prev) => [
        ...prev,
        { id: createMessageId(), role: 'user', content: prompt },
        { id: progressMessageId, role: 'assistant', content: 'Processing your request…' },
      ])

      setIsProcessingJob(true)

      try {
        const job = await createEditJob({ prompt, video: videoFile.file })
        const actionsSummary = summariseParsedCommand(job.parsedCommand)

        setAssistantMessages((prev) =>
          prev.map((message) => {
            if (message.id !== progressMessageId) return message

            const lines = [
              'Edit complete! ✨',
              actionsSummary ? `Planned actions:\n${actionsSummary}` : null,
              job.outputUrl
                ? `Previewing the updated clip.\nDownload link:\n${job.outputUrl}`
                : `Job ${job.id} is still processing. Use this ID to check status later.`,
            ].filter(Boolean) as string[]

            return {
              ...message,
              content: lines.join('\n\n'),
            }
          }),
        )

        if (job.outputUrl) {
          setActiveVideoUrl(job.outputUrl)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to process video'

        setAssistantError(message)
        setAssistantMessages((prev) =>
          prev.map((assistantMessage) =>
            assistantMessage.id === progressMessageId
              ? { ...assistantMessage, content: `I ran into an error while processing your request:\n${message}` }
              : assistantMessage,
          ),
        )
      } finally {
        setIsProcessingJob(false)
      }
    },
    [setActiveVideoUrl],
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

          <AssistantPanel
            messages={assistantMessages}
            videoFiles={videoFiles}
            defaultVideoId={activeVideo?.id ?? null}
            isProcessing={isProcessingJob}
            error={assistantError}
            onSubmit={handleSubmitToAssistant}
          />
        </div>
      </div>
    </div>
  )
}

export default Editor


