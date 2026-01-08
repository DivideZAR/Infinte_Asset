declare module 'fluent-ffmpeg' {
  interface FfprobeData {
    streams?: Array<{
      codec_type?: string
      duration?: number
      width?: number
      height?: number
    }>
    format?: {
      bit_rate?: string
    }
  }

  interface ProgressData {
    percent?: number
    frames?: number
    fps?: number
    timemark?: string
  }

  interface FfmpegCommand {
    input(input: string): FfmpegCommand
    inputFormat(format: string): FfmpegCommand
    inputOptions(options: string[]): FfmpegCommand
    output(output: string): FfmpegCommand
    outputOptions(options: string[]): FfmpegCommand
    duration(seconds: number): FfmpegCommand
    size(size: string): FfmpegCommand
    on(event: string, callback: (err?: Error) => void): FfmpegCommand
    on(event: 'end', callback: () => void): FfmpegCommand
    on(event: 'error', callback: (err: Error) => void): FfmpegCommand
    on(event: 'progress', callback: (progress: ProgressData) => void): FfmpegCommand
    ffprobe(callback: (err: Error | null, data: FfprobeData) => void): void
    run(): void
  }

  function ff(): FfmpegCommand

  export = ff
}
