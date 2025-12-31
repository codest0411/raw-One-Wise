'use client'

import React, { useEffect, useState } from 'react'
import Editor from '@monaco-editor/react'

export type CodeEditorProps = {
  initialCode?: string
  language?: string
  onChange?: (value: string | undefined) => void
  height?: string | number
}

export default function CodeEditor({ initialCode = '', language = 'javascript', onChange, height = '400px' }: CodeEditorProps) {
  const placeholder = '// Write your code here...'
  const [code, setCode] = useState(initialCode || placeholder)

  useEffect(() => {
    // Keep internal value in sync if the prop changes
    setCode(initialCode || placeholder)
  }, [initialCode])

  const handleChange = (value?: string) => {
    setCode(value ?? '')
    onChange?.(value)
  }

  return (
    <div className="rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-200 flex items-center justify-between">
        <span className="font-medium">{language}</span>
        <span className="text-gray-500 dark:text-gray-400">Monaco</span>
      </div>

      <div className="bg-white dark:bg-gray-900">
        <Editor
          height={typeof height === 'number' ? `${height}px` : height}
          defaultLanguage={language}
          language={language}
          value={code}
          onChange={handleChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
          }}
          theme="vs-dark"
        />
      </div>
    </div>
  )
}
