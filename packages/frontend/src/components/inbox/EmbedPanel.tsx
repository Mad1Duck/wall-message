import { useState } from 'react'

interface EmbedPanelProps {
  wallId: string
  miniWalls?: Array<{ id: string; name: string; slug: string }>
  username: string
}

export default function EmbedPanel({ wallId, miniWalls = [], username }: EmbedPanelProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<'wall' | 'mini-wall'>('wall')
  const [selectedType, setSelectedType] = useState<'form' | 'display'>('form')
  const [selectedMiniWall, setSelectedMiniWall] = useState<string>(miniWalls[0]?.id || '')
  const [limit, setLimit] = useState(10)
  const [width, setWidth] = useState(400)
  const [height, setHeight] = useState(500)
  const [defaultTheme, setDefaultTheme] = useState<'auto' | 'dark' | 'light'>('auto')

  const baseUrl = window.location.origin

  const generateEmbedCode = (type: 'form' | 'display', target: 'wall' | 'mini-wall', targetId?: string) => {
    let embedUrl = ''

    if (target === 'wall') {
      if (type === 'form') {
        embedUrl = `${baseUrl}/embed/form/wall?wallId=${wallId}&theme=${defaultTheme}&recipient=${username}`
      } else {
        embedUrl = `${baseUrl}/embed/display/wall?wallId=${wallId}&limit=${limit}&theme=${defaultTheme}`
      }
    } else if (target === 'mini-wall' && targetId) {
      const miniWall = miniWalls.find(mw => mw.id === targetId)
      if (type === 'form') {
        embedUrl = `${baseUrl}/embed/form/mini-wall?wallId=${wallId}&miniWallId=${targetId}&theme=${defaultTheme}&recipient=${username}`
      } else {
        embedUrl = `${baseUrl}/embed/display/mini-wall?miniWallId=${targetId}&limit=${limit}&theme=${defaultTheme}`
      }
    }

    return `<iframe src="${embedUrl}" width="${width}" height="${height}" frameborder="0"></iframe>`
  }

  const generateEmbedUrl = (type: 'form' | 'display', target: 'wall' | 'mini-wall', targetId?: string) => {
    if (target === 'wall') {
      if (type === 'form') {
        return `${baseUrl}/embed/form/wall?wallId=${wallId}&theme=${defaultTheme}&recipient=${username}`
      } else {
        return `${baseUrl}/embed/display/wall?wallId=${wallId}&limit=${limit}&theme=${defaultTheme}`
      }
    } else if (target === 'mini-wall' && targetId) {
      if (type === 'form') {
        return `${baseUrl}/embed/form/mini-wall?wallId=${wallId}&miniWallId=${targetId}&theme=${defaultTheme}&recipient=${username}`
      } else {
        return `${baseUrl}/embed/display/mini-wall?miniWallId=${targetId}&limit=${limit}&theme=${defaultTheme}`
      }
    }
    return ''
  }

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const currentEmbedCode = selectedTab === 'wall'
    ? generateEmbedCode(selectedType, 'wall')
    : generateEmbedCode(selectedType, 'mini-wall', selectedMiniWall)

  const currentEmbedUrl = selectedTab === 'wall'
    ? generateEmbedUrl(selectedType, 'wall')
    : generateEmbedUrl(selectedType, 'mini-wall', selectedMiniWall)

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-5 border-b border-[var(--w-border-mid)]">
        <h2 className="font-serif italic text-[18px] text-[var(--w-text)] mb-1">Embed Widget</h2>
        <p className="text-[11px] text-[var(--w-text-muted)]">Copy kode embed untuk website kamu</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Settings */}
        <div className="flex-1 p-5 space-y-6 overflow-y-auto">
        {/* Type Selection */}
        <div>
          <label className="block text-[var(--w-text-dim)] text-[11px] uppercase tracking-widest mb-3">Tipe Widget</label>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedType('form')}
              className={`flex-1 px-4 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                selectedType === 'form'
                  ? 'bg-[var(--w-text)] text-[var(--w-bg)]'
                  : 'bg-[var(--w-surface-2)] text-[var(--w-text-muted)] border border-[var(--w-border-mid)]'
              }`}
            >
              Form Kirim
            </button>
            <button
              onClick={() => setSelectedType('display')}
              className={`flex-1 px-4 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                selectedType === 'display'
                  ? 'bg-[var(--w-text)] text-[var(--w-bg)]'
                  : 'bg-[var(--w-surface-2)] text-[var(--w-text-muted)] border border-[var(--w-border-mid)]'
              }`}
            >
              Tampilkan
            </button>
          </div>
        </div>

        {/* Target Selection */}
        <div>
          <label className="block text-[var(--w-text-dim)] text-[11px] uppercase tracking-widest mb-3">Target</label>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTab('wall')}
              className={`flex-1 px-4 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                selectedTab === 'wall'
                  ? 'bg-[var(--w-text)] text-[var(--w-bg)]'
                  : 'bg-[var(--w-surface-2)] text-[var(--w-text-muted)] border border-[var(--w-border-mid)]'
              }`}
            >
              Wall Utama
            </button>
            <button
              onClick={() => setSelectedTab('mini-wall')}
              disabled={miniWalls.length === 0}
              className={`flex-1 px-4 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                selectedTab === 'mini-wall'
                  ? 'bg-[var(--w-text)] text-[var(--w-bg)]'
                  : 'bg-[var(--w-surface-2)] text-[var(--w-text-muted)] border border-[var(--w-border-mid)]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Mini Wall
            </button>
          </div>
        </div>

        {/* Mini Wall Selection */}
        {selectedTab === 'mini-wall' && miniWalls.length > 0 && (
          <div>
            <label className="block text-[var(--w-text-dim)] text-[11px] uppercase tracking-widest mb-3">Pilih Mini Wall</label>
            <select
              value={selectedMiniWall}
              onChange={(e) => setSelectedMiniWall(e.target.value)}
              className="w-full bg-[var(--w-surface-2)] border border-[var(--w-border-mid)] rounded-lg px-3 py-2 text-[var(--w-text)] text-[13px] focus:border-[var(--w-border-strong)] focus:outline-none"
            >
              {miniWalls.map((mw) => (
                <option key={mw.id} value={mw.id}>
                  {mw.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Limit Selection for Display */}
        {selectedType === 'display' && (
          <div>
            <label className="block text-[var(--w-text-dim)] text-[11px] uppercase tracking-widest mb-3">Jumlah Pesan</label>
            <input
              type="number"
              min="1"
              max="50"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full bg-[var(--w-surface-2)] border border-[var(--w-border-mid)] rounded-lg px-3 py-2 text-[var(--w-text)] text-[13px] focus:border-[var(--w-border-strong)] focus:outline-none"
            />
          </div>
        )}

        {/* Iframe Settings */}
        <div>
          <label className="block text-[var(--w-text-dim)] text-[11px] uppercase tracking-widest mb-3">Ukuran Iframe</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-[var(--w-text-muted)] mb-1">Lebar (px)</label>
              <input
                type="number"
                min="200"
                max="1200"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full bg-[var(--w-surface-2)] border border-[var(--w-border-mid)] rounded-lg px-3 py-2 text-[var(--w-text)] text-[13px] focus:border-[var(--w-border-strong)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[var(--w-text-muted)] mb-1">Tinggi (px)</label>
              <input
                type="number"
                min="200"
                max="1200"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full bg-[var(--w-surface-2)] border border-[var(--w-border-mid)] rounded-lg px-3 py-2 text-[var(--w-text)] text-[13px] focus:border-[var(--w-border-strong)] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Theme Setting */}
        <div>
          <label className="block text-[var(--w-text-dim)] text-[11px] uppercase tracking-widest mb-3">Tema Default</label>
          <div className="flex gap-2">
            <button
              onClick={() => setDefaultTheme('auto')}
              className={`flex-1 px-3 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                defaultTheme === 'auto'
                  ? 'bg-[var(--w-text)] text-[var(--w-bg)]'
                  : 'bg-[var(--w-surface-2)] text-[var(--w-text-muted)] border border-[var(--w-border-mid)]'
              }`}
            >
              Auto
            </button>
            <button
              onClick={() => setDefaultTheme('dark')}
              className={`flex-1 px-3 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                defaultTheme === 'dark'
                  ? 'bg-[var(--w-text)] text-[var(--w-bg)]'
                  : 'bg-[var(--w-surface-2)] text-[var(--w-text-muted)] border border-[var(--w-border-mid)]'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setDefaultTheme('light')}
              className={`flex-1 px-3 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                defaultTheme === 'light'
                  ? 'bg-[var(--w-text)] text-[var(--w-bg)]'
                  : 'bg-[var(--w-surface-2)] text-[var(--w-text-muted)] border border-[var(--w-border-mid)]'
              }`}
            >
              Light
            </button>
          </div>
          <p className="text-[9px] text-[var(--w-text-muted)] mt-2">
            {defaultTheme === 'auto' ? 'Widget akan otomatis ikut tema website' : 'Widget akan pakai tema ini secara tetap'}
          </p>
        </div>

        {/* Embed Code */}
        <div>
          <label className="block text-[var(--w-text-dim)] text-[11px] uppercase tracking-widest mb-3">Kode Embed</label>
          <div className="bg-[var(--w-surface-2)] border border-[var(--w-border-mid)] rounded-lg p-3">
            <code className="text-[9px] text-[var(--w-text-muted)] break-all font-mono block mb-3">
              {currentEmbedCode}
            </code>
            <button
              onClick={() => handleCopy(currentEmbedCode, 'main')}
              className="w-full bg-[var(--w-text)] text-[var(--w-bg)] font-medium py-2 rounded-lg text-[11px] uppercase tracking-[0.04em] hover:bg-[var(--w-text-2)] transition-colors"
            >
              {copied === 'main' ? '✓ Disalin' : 'Salin Kode'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="bg-[var(--w-surface-2)] border border-[var(--w-border-mid)] rounded-lg p-4">
          <p className="text-[10px] text-[var(--w-text-muted)] leading-relaxed">
            {defaultTheme === 'auto'
              ? 'Widget akan otomatis mendeteksi tema (dark/light mode) dari website kamu.'
              : 'Widget akan menggunakan tema yang dipilih secara tetap.'}
          </p>
        </div>
        </div>

      {/* Preview */}
      <div className="lg:w-96 border-l border-[var(--w-border-mid)] flex flex-col">
        <div className="p-5 border-b border-[var(--w-border-mid)]">
          <h3 className="font-serif italic text-[14px] text-[var(--w-text)]">Preview</h3>
        </div>
        <div className="flex-1 p-5 flex items-center justify-center bg-[var(--w-surface)] overflow-auto">
          <div className="border border-[var(--w-border-mid)] rounded-lg overflow-hidden shadow-lg" style={{ maxWidth: '100%' }}>
            <iframe
              src={currentEmbedUrl}
              width={Math.min(width, 350)}
              height={Math.min(height, 500)}
              style={{ border: 'none' }}
              title="Embed Preview"
            />
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
