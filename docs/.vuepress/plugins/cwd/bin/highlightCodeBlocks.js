const CODE_BLOCK_SELECTOR = '.cwd-comment-content pre code, .cwd-preview-content pre code'
const { normalizePrismLanguage } = require('./prismLanguages')

function getCodeLanguage(codeElement) {
  const className = codeElement.className || ''
  const match = className.match(/(?:^|\s)language-([^\s]+)/)

  if (!match) {
    return ''
  }

  return normalizePrismLanguage(match[1])
}

function markLanguageClass(codeElement, language) {
  const className = `language-${language}`

  if (codeElement.classList && !codeElement.classList.contains(className)) {
    codeElement.classList.add(className)
  }

  const parent = codeElement.parentElement
  if (
    parent &&
    parent.tagName &&
    parent.tagName.toLowerCase() === 'pre' &&
    parent.classList &&
    !parent.classList.contains(className)
  ) {
    parent.classList.add(className)
  }
}

function highlightCodeBlocks(root, Prism) {
  if (!root || !Prism || !Prism.languages || typeof Prism.highlightElement !== 'function') {
    return
  }

  const codeBlocks = root.querySelectorAll(CODE_BLOCK_SELECTOR)
  codeBlocks.forEach((codeElement) => {
    const language = getCodeLanguage(codeElement)
    const grammar = Prism.languages[language]

    if (!language || !grammar) {
      return
    }

    const source = codeElement.textContent || ''
    if (codeElement._cwdHighlightedSource === source) {
      return
    }

    markLanguageClass(codeElement, language)
    Prism.highlightElement(codeElement)
    codeElement._cwdHighlightedSource = source
  })
}

module.exports = {
  highlightCodeBlocks
}
