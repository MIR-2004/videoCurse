export type DroppedFile = {
  id: string
  file: File
  url: string
  kind: 'video' | 'image'
}

export type LibraryItem = {
  name: string
  count: number
}

