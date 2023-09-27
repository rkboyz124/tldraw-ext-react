// Global resources
interface extApp {
  id: number
  tab: ext.tabs.Tab
  window: ext.windows.Window
  websession: ext.websessions.Websession
  webview: ext.webviews.Webview
}

let extApps: extApp[] = []

// Gets the missing id when creating a new extension (after closing extensions)
function getNextId() {
  if (!extApps.length) return 1
  // source code for this snippet: https://stackoverflow.com/a/33352604
  const arr = Array.from({ length: extApps.length }, (_, i) => i + 1)
  let missing = extApps.length + 1
  // checks for the missing number (if one of the windows is closed)
  arr.every((num) => {
    const exists = extApps.find(({id}) => num === id)
    if (!exists) {
      missing = num
      return false
    }
    return true
  })

  return missing
}

ext.runtime.onExtensionClick.addListener(async () => {
  try {
    const id = getNextId()
    const isDarkMode = await ext.windows.getPlatformDarkMode()

    const newTab: ext.tabs.Tab = await ext.tabs.create({
      icon: 'icons/icon-128.png',
      icon_dark: 'icons/icon-128-dark.png',
      text: `TLDraw - #${id}`,
      closable: true,
    })

    // Create window
    const newWindow: ext.windows.Window = await ext.windows.create({
      title: `TLDraw - #${id}`,
      icon: isDarkMode ? 'icons/icon-128-dark.png' : 'icons/icon-128.png',
      fullscreenable: true,
      vibrancy: false,
      frame: true,
      darkMode: 'platform'
    })

    const newWebsession = await ext.websessions.create({ 
      partition: `TLDraw - #${id}`,
      persistent: false,
      global: false,
      cache: true
    })

    const windowSize = await ext.windows.getContentSize(newWindow.id)
    const newWebview = await ext.webviews.create({
      window: newWindow,
      websession: newWebsession,
      bounds: { x: 0, y: 0, width: windowSize.width, height: windowSize.height },
      autoResize: { width: true, height: true },
    })
    await ext.webviews.loadURL(newWebview.id, 'http://localhost:3000')

    extApps.push({
      id,
      tab: newTab,
      window: newWindow,
      websession: newWebsession,
      webview: newWebview
    })

  } catch (error) {
    // Print error
    console.error('ext.runtime.onExtensionClick', JSON.stringify(error))
  }
})

// Tab was clicked
ext.tabs.onClicked.addListener(async (event) => {
  try {
    const currentExtApp = extApps.find(({ tab }) => tab.id === event.id)
    // Restore & Focus window
    if (currentExtApp) {
      await ext.windows.restore(currentExtApp.window.id)
      await ext.windows.focus(currentExtApp.window.id)
    }

  } catch (error) {
    // Print error
    console.error('ext.tabs.onClicked', JSON.stringify(error))
  }
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
ext.windows.onUpdatedDarkMode.addListener(async (event, details) => {
  try {
    const isDarkMode = details.enabled
    const tabs = extApps.map(({ tab })=> tab.id)
    const windows = extApps.map(({ window })=> window.id)

    if (tabs.length > 0 && windows.length > 0) {
      await ext.tabs.update(tabs, { icon: isDarkMode ? 'icons/icon-128-dark.png' : 'icons/icon-128.png' })
      await ext.windows.update(windows, { darkMode: isDarkMode, icon: isDarkMode ? 'icons/icon-128-dark.png' : 'icons/icon-128.png' })
    }
  } catch (error) {
    // Print error
    console.error('ext.windows.onUpdatedDarkMode', JSON.stringify(error))
  }
})
// eslint-disable-enable-line @typescript-eslint/no-unused-vars

// Tab was closed
ext.tabs.onClickedClose.addListener(async (event) => {
  try {
    const currentExtApp = extApps.find(({ tab }) => tab.id === event.id)

    // Remove objects
    if (currentExtApp) {
      await ext.websessions.remove(currentExtApp.websession.id)
      await ext.webviews.remove(currentExtApp.webview.id)
      await ext.tabs.remove(currentExtApp.tab.id)
      await ext.windows.remove(currentExtApp.window.id)
      extApps = extApps.filter(({ window }) => window.id != event.id)
    }
  } catch (error) {
    // Print error
    console.error('ext.tabs.onClickedClose', JSON.stringify(error))
  }
})

// Window was removed by another extension
ext.windows.onRemoved.addListener(async (event) => {
  try {
    const currentExtApp = extApps.find(({ window }) => window.id === event.id)

    // Remove objects
    if (currentExtApp) {
      await ext.websessions.remove(currentExtApp.websession.id)
      await ext.webviews.remove(currentExtApp.webview.id)
      await ext.tabs.remove(currentExtApp.tab.id)
      await ext.windows.remove(currentExtApp.window.id)
      extApps = extApps.filter(({ window }) => window.id != event.id)
    }
  } catch (error) {
    // Print error
    console.error('ext.windows.onRemoved', JSON.stringify(error))
  }
})

// Window was closed
ext.windows.onClosed.addListener(async (event) => {
  try {
    const currentExtApp = extApps.find(({ window }) => window.id === event.id)

    // Remove objects
    if (currentExtApp) {
      await ext.websessions.remove(currentExtApp.websession.id)
      await ext.webviews.remove(currentExtApp.webview.id)
      await ext.tabs.remove(currentExtApp.tab.id)
      await ext.windows.remove(currentExtApp.window.id)
      extApps = extApps.filter(({ window }) => window.id != event.id)
    }
  } catch (error) {
    // Print error
    console.error('ext.windows.onClosed', JSON.stringify(error))
  }
})