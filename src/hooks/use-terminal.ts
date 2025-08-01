'use client'

import { useState, useCallback } from 'react'

interface TerminalCommand {
  command: string
  output: string
  exitCode: number
  timestamp: Date
}

interface UseTerminalProps {
  containerId: string
  onDisconnect?: () => void
}

export function useTerminal({ containerId, onDisconnect }: UseTerminalProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [history, setHistory] = useState<TerminalCommand[]>([])
  const [currentCommand, setCurrentCommand] = useState('')

  const connect = useCallback(async () => {
    if (!containerId) return
    
    setIsConnecting(true)
    try {
      // Test connection by executing a simple command
      const response = await fetch('/api/terminal/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          containerId,
          command: ['echo', 'Terminal connected']
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setHistory(prev => [...prev, {
          command: 'echo Terminal connected',
          output: result.output,
          exitCode: result.exitCode,
          timestamp: new Date()
        }])
        setIsConnected(true)
      } else {
        throw new Error('Failed to connect to container')
      }
    } catch (error) {
      console.error('Terminal connection error:', error)
      setHistory(prev => [...prev, {
        command: 'connection',
        output: `Error: Failed to connect to container ${containerId}`,
        exitCode: 1,
        timestamp: new Date()
      }])
    } finally {
      setIsConnecting(false)
    }
  }, [containerId])

  const executeCommand = useCallback(async (command: string) => {
    if (!isConnected || !containerId) return

    // Add command to history
    const commandEntry: TerminalCommand = {
      command,
      output: '',
      exitCode: 0,
      timestamp: new Date()
    }
    setHistory(prev => [...prev, commandEntry])

    try {
      // Parse command into array
      const commandArray = command.split(' ').filter(arg => arg.trim() !== '')
      
      const response = await fetch('/api/terminal/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          containerId,
          command: commandArray
        }),
      })

      if (response.ok) {
        const result = await response.json()
        
        // Update the command entry with actual output
        setHistory(prev => prev.map((entry, index) => 
          index === prev.length - 1 
            ? { ...entry, output: result.output, exitCode: result.exitCode }
            : entry
        ))
      } else {
        const error = await response.json()
        setHistory(prev => prev.map((entry, index) => 
          index === prev.length - 1 
            ? { ...entry, output: `Error: ${error.error}`, exitCode: 1 }
            : entry
        ))
      }
    } catch (error) {
      setHistory(prev => prev.map((entry, index) => 
        index === prev.length - 1 
          ? { ...entry, output: `Error: Failed to execute command`, exitCode: 1 }
          : entry
      ))
    }
  }, [isConnected, containerId])

  const disconnect = useCallback(() => {
    setIsConnected(false)
    setHistory([])
    setCurrentCommand('')
    onDisconnect?.()
  }, [onDisconnect])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  return {
    isConnected,
    isConnecting,
    history,
    currentCommand,
    setCurrentCommand,
    connect,
    executeCommand,
    disconnect,
    clearHistory
  }
}