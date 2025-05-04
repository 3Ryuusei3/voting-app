import { useEffect } from 'react'
import type { Option } from '../types'

interface UseVotingKeyboardShortcutsProps {
  option: Option
  isLoading: boolean
  localLoading: boolean
  handleVote: (filter: 'easy' | 'difficult' | 'not_exist') => Promise<void>
  handleUndo: () => Promise<void>
  showUndoButton: boolean | undefined
  pollUrl: string | null
}

export const useVotingKeyboardShortcuts = ({
  option,
  isLoading,
  localLoading,
  handleVote,
  handleUndo,
  showUndoButton,
  pollUrl
}: UseVotingKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading || localLoading) return

      switch (e.key) {
        case '1':
          handleVote('easy')
          break
        case '2':
          handleVote('difficult')
          break
        case '3':
          handleVote('not_exist')
          break
        case 'z':
        case 'Z':
          if (showUndoButton === true) handleUndo()
          break
        case 'a':
        case 'A':
          if (pollUrl) window.open(`${pollUrl}${option.option}`, '_blank')
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isLoading, localLoading, option, pollUrl, handleUndo, handleVote, showUndoButton])
}
