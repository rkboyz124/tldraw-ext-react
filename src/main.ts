/* eslint-disable */
// Global resources
let created = false
let tab: ext.tabs.Tab | null = null
let window: ext.windows.Window | null = null
let webview: ext.webviews.Webview | null = null

ext.runtime.onExtensionClick.addListener(async () => {
  try {
    // Check if window already exists
    if (created && window !== null) {
      await ext.windows.restore(window.id)
      await ext.windows.focus(window.id)
      return
    }

    tab = await ext.tabs.create({
      icon: 'icons/icon-1024.png',
      text: 'TLDraw',
      closable: true,
    })

      // Create window
      window = await ext.windows.create({
        title: 'TLDraw',
        icon: 'icons/icon-1024.png',
        fullscreenable: true,
        vibrancy: false,
        frame: true,
      })
      const windowSize = await ext.windows.getContentSize(window.id)
        webview = await ext.webviews.create({
          window: window,
          bounds: { x: 0, y: 0, width: windowSize.width, height: windowSize.height },
          autoResize: { width: true, height: true }
        })
      await ext.webviews.loadURL(webview.id, 'http://localhost:3000')
    // Mark window as created
    created = true

  } catch (error) {

    // Print error
    console.error('ext.runtime.onExtensionClick', JSON.stringify(error))

  }
})

// Tab was removed by another extension
ext.tabs.onRemoved.addListener(async (event) => {
  try {

    // Remove objects
    if (event.id === tab?.id) {
      if (window !== null) await ext.windows.remove(window.id)
      if (webview !== null) await ext.webviews.remove(webview.id)
      tab = window = webview = null
    }

  } catch (error) {

    // Print error
    console.error('ext.tabs.onRemoved', JSON.stringify(error))

  }
})

// Tab was clicked
ext.tabs.onClicked.addListener(async (event) => {
  try {

    // Restore & Focus window
    if (event.id === tab?.id && window !== null) {
      await ext.windows.restore(window.id)
      await ext.windows.focus(window.id)
    }

  } catch (error) {

    // Print error
    console.error('ext.tabs.onClicked', JSON.stringify(error))

  }
})

// Tab was closed
ext.tabs.onClickedClose.addListener(async (event) => {
  try {

    // Remove objects
    if (event.id === tab?.id) {
      if (tab !== null) await ext.tabs.remove(tab.id)
      if (window !== null) await ext.windows.remove(window.id)
      if (webview !== null) await ext.webviews.remove(webview.id)
      tab = window = webview = null
    }

  } catch (error) {

    // Print error
    console.error('ext.tabs.onClickedClose', JSON.stringify(error))

  }
})

// Tab was muted
ext.tabs.onClickedMute.addListener(async (event) => {
  try {

    // Update audio
    if (event.id === tab?.id && tab !== null && webview !== null) {
      const muted = await ext.webviews.isAudioMuted(webview.id)
      await ext.webviews.setAudioMuted(webview.id, !muted)
      await ext.tabs?.update(tab.id, { muted: !muted })
    }

  } catch (error) {

    // Print error
    console.error('ext.tabs.onClickedMute', JSON.stringify(error))

  }
})

// Window was removed by another extension
ext.windows.onRemoved.addListener(async (event) => {
  try {

    // Remove objects
    if (event.id === window?.id) {
      if (tab !== null) await ext.tabs.remove(tab.id)
      if (webview !== null) await ext.webviews.remove(webview.id)
      tab = window = webview = null
    }

  } catch (error) {

    // Print error
    console.error('ext.windows.onRemoved', JSON.stringify(error))

  }
})

// Window was closed
ext.windows.onClosed.addListener(async (event) => {
  try {

    // Remove objects
    if (event.id === window?.id) {
      if (tab !== null) await ext.tabs.remove(tab.id)
      if (webview !== null) await ext.webviews.remove(webview.id)
      tab = window = webview = null
    }

  } catch (error) {

    // Print error
    console.error('ext.windows.onClosed', JSON.stringify(error))

  }
})