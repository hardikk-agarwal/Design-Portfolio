import storeCover from './assets/cover-store.jpg'
import copilotCover from './assets/cover-copilot.jpg'
import helloCover from './assets/cover-hello.jpg'
import vrCover from './assets/cover-vr.jpg'

const urls = new Map([['store', storeCover], ['copilot', copilotCover], ['hello', helloCover], ['vr', vrCover]])

export function artworkUrl(id) {
  return urls.get(id) || storeCover
}