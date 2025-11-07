// 使用原生 Clipboard API 实现复制功能
function copyToClipboard(text = '') {
  return new Promise((resolve, reject) => {
    // 优先使用 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => {
          resolve(text)
        })
        .catch((err) => {
          // 如果 Clipboard API 失败，回退到传统方法
          fallbackCopyToClipboard(text, resolve, reject)
        })
    } else {
      // 不支持 Clipboard API，使用传统方法
      fallbackCopyToClipboard(text, resolve, reject)
    }
  })
}

// 传统复制方法（兼容旧浏览器）
function fallbackCopyToClipboard(text, resolve, reject) {
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.left = '-999999px'
  textArea.style.top = '-999999px'
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    if (successful) {
      resolve(text)
    } else {
      reject(new Error('Copy command failed'))
    }
  } catch (err) {
    document.body.removeChild(textArea)
    reject(err)
  }
}

export default copyToClipboard

