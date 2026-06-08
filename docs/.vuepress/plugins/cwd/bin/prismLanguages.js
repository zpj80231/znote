const Prism = require('prismjs')

const SUPPORTED_PRISM_LANGUAGES = [
  'markup',
  'css',
  'clike',
  'javascript',
  'bash',
  'java',
  'json',
  'markdown',
  'sql',
  'typescript',
  'python',
  'yaml'
]

const LANGUAGE_LOADERS = {
  bash: () => require('prismjs/components/prism-bash'),
  java: () => require('prismjs/components/prism-java'),
  json: () => require('prismjs/components/prism-json'),
  markdown: () => require('prismjs/components/prism-markdown'),
  sql: () => require('prismjs/components/prism-sql'),
  typescript: () => require('prismjs/components/prism-typescript'),
  python: () => require('prismjs/components/prism-python'),
  yaml: () => require('prismjs/components/prism-yaml')
}

const LANGUAGE_ALIASES = {
  js: 'javascript',
  ts: 'typescript',
  sh: 'bash',
  shell: 'bash',
  yml: 'yaml',
  md: 'markdown',
  html: 'markup',
  xml: 'markup',
  vue: 'markup'
}

let languagesLoaded = false

function normalizePrismLanguage(language) {
  if (!language) {
    return ''
  }

  const normalizedLanguage = String(language).toLowerCase()
  return LANGUAGE_ALIASES[normalizedLanguage] || normalizedLanguage
}

function loadPrismLanguages() {
  if (languagesLoaded) {
    return Prism
  }

  SUPPORTED_PRISM_LANGUAGES.forEach((language) => {
    const loadLanguage = LANGUAGE_LOADERS[language]
    if (loadLanguage) {
      loadLanguage()
    }
  })
  languagesLoaded = true

  return Prism
}

module.exports = {
  Prism,
  SUPPORTED_PRISM_LANGUAGES,
  loadPrismLanguages,
  normalizePrismLanguage
}
