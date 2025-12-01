
import nProgress from 'nprogress'

export function showFullLoading(){
  nProgress.start()
}

export function hideFullLoading(){
  nProgress.done()
}
