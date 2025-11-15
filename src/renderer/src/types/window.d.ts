export interface IElectronAPI {
  invoke: (channel: string, ...args: any[]) => Promise<any>
  on: (channel: string, callback: Function) => void
  off: (channel: string, callback: Function) => void
  send: (channel: string, ...args: any[]) => void
}

declare global {
  interface Window {
    api: IElectronAPI
  }
}

