declare module 'fluent-ffmpeg' {
  interface FfmpegCommand {
    input(input: string): FfmpegCommand
    inputOptions(options: string[]): FfmpegCommand
    output(output: string): FfmpegCommand
    outputOptions(options: string[]): FfmpegCommand
    on(event: string, callback: (err?: Error) => void): FfmpegCommand
    on(event: 'end', callback: () => void): FfmpegCommand
    on(event: 'error', callback: (err: Error) => void): FfmpegCommand
    run(): void
  }

  function ff(): FfmpegCommand
  function setFfmpegPath(path: string): void
  function setFfprobePath(path: string): void

  export = ff
}
