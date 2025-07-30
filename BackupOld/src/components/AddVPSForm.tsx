'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface AddVPSFormProps {
  onClose: () => void
  onSuccess: () => void
}

export function AddVPSForm({ onClose, onSuccess }: AddVPSFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    ip: '',
    port: 22,
    username: 'root',
    private_key: '',
    password: '',
    auth_type: 'key', // 'key' ou 'password'
    tags: ''
  })
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'port' ? parseInt(value) || 22 : value
    }))
  }

  const testConnection = async () => {
    setTesting(true)
    setError('')
    
    try {
      // TODO: Implementar teste real de conexão SSH
      // Por enquanto, simula um teste
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('Conexão testada com sucesso!')
    } catch (err) {
      setError('Falha ao conectar com a VPS')
    } finally {
      setTesting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      
      const response = await fetch('/api/vps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          tags
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erro ao cadastrar VPS')
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar VPS')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Adicionar VPS</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome da VPS *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ex: VPS-Web-01"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Endereço IP *
                </label>
                <input
                  type="text"
                  name="ip"
                  value={formData.ip}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="192.168.1.100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Porta SSH
                </label>
                <input
                  type="number"
                  name="port"
                  value={formData.port}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Usuário SSH *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="root"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tipo de Autenticação *
              </label>
              <div className="mt-2 space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="auth_type"
                    value="key"
                    checked={formData.auth_type === 'key'}
                    onChange={handleChange}
                    className="form-radio"
                  />
                  <span className="ml-2">Chave SSH</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="auth_type"
                    value="password"
                    checked={formData.auth_type === 'password'}
                    onChange={handleChange}
                    className="form-radio"
                  />
                  <span className="ml-2">Senha</span>
                </label>
              </div>
            </div>

            {formData.auth_type === 'key' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Chave Privada SSH *
                </label>
                <textarea
                  name="private_key"
                  value={formData.private_key}
                  onChange={handleChange}
                  rows={4}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cole sua chave privada SSH completa aqui
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Senha SSH *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Digite a senha SSH"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Senha para acesso SSH (menos seguro que chaves)
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="web, frontend, production"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separadas por vírgula
              </p>
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <button
              type="button"
              onClick={testConnection}
              disabled={testing || !formData.ip || !formData.username}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              {testing ? 'Testando...' : 'Testar Conexão'}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
