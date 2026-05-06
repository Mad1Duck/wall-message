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

  // Customization state
  const [customTitle, setCustomTitle] = useState('')
  const [customPlaceholder, setCustomPlaceholder] = useState('')
  const [customBtnText, setCustomBtnText] = useState('')
  const [customSuccessMsg, setCustomSuccessMsg] = useState('')
  const [customBg, setCustomBg] = useState('')
  const [customSurface, setCustomSurface] = useState('')
  const [customText, setCustomText] = useState('')
  const [customBorder, setCustomBorder] = useState('')
  const [customAccent, setCustomAccent] = useState('')
  const [customRadius, setCustomRadius] = useState('')
  const [customCss, setCustomCss] = useState('')
  const [showCustomize, setShowCustomize] = useState(false)
  const [compact, setCompact] = useState(false)

  const buildCustomParams = () => {
    const params = new URLSearchParams()
    if (customTitle) params.set('title', customTitle)
    if (customPlaceholder) params.set('placeholder', customPlaceholder)
    if (customBtnText) params.set('btnText', customBtnText)
    if (customSuccessMsg) params.set('successMsg', customSuccessMsg)
    if (customBg) params.set('bg', customBg)
    if (customSurface) params.set('surface', customSurface)
    if (customText) params.set('text', customText)
    if (customBorder) params.set('border', customBorder)
    if (customAccent) params.set('accent', customAccent)
    if (customRadius) params.set('radius', customRadius)
    if (customCss) params.set('customCss', customCss)
    if (compact) params.set('compact', '1')
    const str = params.toString()
    return str ? '&' + str : ''
  }

  const baseUrl = window.location.origin

  const generateEmbedCode = (type: 'form' | 'display', target: 'wall' | 'mini-wall', targetId?: string) => {
    let embedUrl = ''
    const custom = buildCustomParams()

    if (target === 'wall') {
      if (type === 'form') {
        embedUrl = `${baseUrl}/embed/form/wall?wallId=${wallId}&theme=${defaultTheme}&recipient=${username}${custom}`
      } else {
        embedUrl = `${baseUrl}/embed/display/wall?wallId=${wallId}&limit=${limit}&theme=${defaultTheme}${custom}`
      }
    } else if (target === 'mini-wall' && targetId) {
      if (type === 'form') {
        embedUrl = `${baseUrl}/embed/form/mini-wall?wallId=${wallId}&miniWallId=${targetId}&theme=${defaultTheme}&recipient=${username}${custom}`
      } else {
        embedUrl = `${baseUrl}/embed/display/mini-wall?miniWallId=${targetId}&limit=${limit}&theme=${defaultTheme}${custom}`
      }
    }

    return `<iframe src="${embedUrl}" width="${width}" height="${height}" frameborder="0"></iframe>`
  }

  const generateEmbedUrl = (type: 'form' | 'display', target: 'wall' | 'mini-wall', targetId?: string) => {
    const custom = buildCustomParams()
    if (target === 'wall') {
      if (type === 'form') {
        return `${baseUrl}/embed/form/wall?wallId=${wallId}&theme=${defaultTheme}&recipient=${username}${custom}`
      } else {
        return `${baseUrl}/embed/display/wall?wallId=${wallId}&limit=${limit}&theme=${defaultTheme}${custom}`
      }
    } else if (target === 'mini-wall' && targetId) {
      if (type === 'form') {
        return `${baseUrl}/embed/form/mini-wall?wallId=${wallId}&miniWallId=${targetId}&theme=${defaultTheme}&recipient=${username}${custom}`
      } else {
        return `${baseUrl}/embed/display/mini-wall?miniWallId=${targetId}&limit=${limit}&theme=${defaultTheme}${custom}`
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
    <div className="h-full flex flex-col overflow-hidden bg-[#0a0a0a]">
      <div className="p-6 border-b border-[#1a1a1a]">
        <h2 className="font-serif italic text-[20px] text-[#ffffff] mb-1">Embed Widget</h2>
        <p className="text-[11px] text-[#555555]">Copy kode embed untuk website kamu</p>
        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1 h-px bg-[#1a1a1a]" />
          <span className="text-[#222222] text-[9px]">◆</span>
          <div className="flex-1 h-px bg-[#1a1a1a]" />
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Settings */}
        <div className="lg:w-[26rem] p-6 space-y-7 overflow-y-auto shrink-0">
          {/* Type Selection */}
          <div>
            <label className="block text-[#444444] text-[11px] uppercase tracking-widest mb-3">Tipe Widget</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedType('form')}
                className={`px-6 py-2.5 rounded-xl text-[11px] font-medium uppercase tracking-[0.04em] transition-all ${
                  selectedType === 'form'
                    ? 'bg-[#ffffff] text-[#0a0a0a]'
                    : 'bg-[#111111] text-[#555555] border border-[#1e1e1e] hover:border-[#2a2a2a]'
                }`}
              >
                Form Kirim
              </button>
              <button
                onClick={() => setSelectedType('display')}
                className={`px-6 py-2.5 rounded-xl text-[11px] font-medium uppercase tracking-[0.04em] transition-all ${
                  selectedType === 'display'
                    ? 'bg-[#ffffff] text-[#0a0a0a]'
                    : 'bg-[#111111] text-[#555555] border border-[#1e1e1e] hover:border-[#2a2a2a]'
                }`}
              >
                Tampilkan
              </button>
            </div>
          </div>

          {/* Compact toggle */}
          <div className="flex items-center justify-between bg-[#111111] border border-[#1e1e1e] rounded-xl px-4 py-3">
            <div>
              <p className="text-[12px] text-[#aaaaaa] font-medium">Mode Compact</p>
              <p className="text-[10px] text-[#555555] mt-0.5">Hanya tampilkan widget, tanpa header & footer</p>
            </div>
            <button
              onClick={() => setCompact(!compact)}
              style={{ width: 44, height: 24, background: compact ? '#ffffff' : '#2a2a2a' }}
              className="relative rounded-full transition-colors shrink-0"
            >
              <div
                className="absolute w-4 h-4 bg-[#0a0a0a] rounded-full transition-transform"
                style={{ top: 4, left: compact ? 22 : 4 }}
              />
            </button>
          </div>

          {/* Target Selection */}
          <div>
            <label className="block text-[#444444] text-[11px] uppercase tracking-widest mb-3">Target</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTab('wall')}
                className={`px-6 py-2.5 rounded-xl text-[11px] font-medium uppercase tracking-[0.04em] transition-all ${
                  selectedTab === 'wall'
                    ? 'bg-[#ffffff] text-[#0a0a0a]'
                    : 'bg-[#111111] text-[#555555] border border-[#1e1e1e] hover:border-[#2a2a2a]'
                }`}
              >
                Wall Utama
              </button>
              <button
                onClick={() => setSelectedTab('mini-wall')}
                disabled={miniWalls.length === 0}
                className={`px-6 py-2.5 rounded-xl text-[11px] font-medium uppercase tracking-[0.04em] transition-all ${
                  selectedTab === 'mini-wall'
                    ? 'bg-[#ffffff] text-[#0a0a0a]'
                    : 'bg-[#111111] text-[#555555] border border-[#1e1e1e] hover:border-[#2a2a2a]'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                Mini Wall
              </button>
            </div>
          </div>

          {/* Mini Wall Selection */}
          {selectedTab === 'mini-wall' && miniWalls.length > 0 && (
            <div>
              <label className="block text-[#444444] text-[11px] uppercase tracking-widest mb-3">Pilih Mini Wall</label>
              <select
                value={selectedMiniWall}
                onChange={(e) => setSelectedMiniWall(e.target.value)}
                className="w-full bg-[#111111] border border-[#1e1e1e] rounded-xl px-3 py-2.5 text-[#aaaaaa] text-[13px] focus:border-[#2a2a2a] focus:outline-none transition-colors"
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
              <label className="block text-[#444444] text-[11px] uppercase tracking-widest mb-3">Jumlah Pesan</label>
              <input
                type="number"
                min="1"
                max="50"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full bg-[#111111] border border-[#1e1e1e] rounded-xl px-3 py-2.5 text-[#aaaaaa] text-[13px] focus:border-[#2a2a2a] focus:outline-none transition-colors"
              />
            </div>
          )}

          {/* Iframe Settings */}
          <div>
            <label className="block text-[#444444] text-[11px] uppercase tracking-widest mb-3">Ukuran Iframe</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-[#555555] mb-1.5">Lebar (px)</label>
                <input
                  type="number"
                  min="0"
                  max="2450"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full bg-[#111111] border border-[#1e1e1e] rounded-xl px-3 py-2.5 text-[#aaaaaa] text-[13px] focus:border-[#2a2a2a] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#555555] mb-1.5">Tinggi (px)</label>
                <input
                  type="number"
                  min="0"
                  max="2450"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full bg-[#111111] border border-[#1e1e1e] rounded-xl px-3 py-2.5 text-[#aaaaaa] text-[13px] focus:border-[#2a2a2a] focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Theme Setting */}
          <div>
            <label className="block text-[#444444] text-[11px] uppercase tracking-widest mb-3">Tema Default</label>
            <div className="flex gap-2">
              <button
                onClick={() => setDefaultTheme('auto')}
                className={`px-5 py-2.5 rounded-xl text-[11px] font-medium uppercase tracking-[0.04em] transition-all ${
                  defaultTheme === 'auto'
                    ? 'bg-[#ffffff] text-[#0a0a0a]'
                    : 'bg-[#111111] text-[#555555] border border-[#1e1e1e] hover:border-[#2a2a2a]'
                }`}
              >
                Auto
              </button>
              <button
                onClick={() => setDefaultTheme('dark')}
                className={`px-5 py-2.5 rounded-xl text-[11px] font-medium uppercase tracking-[0.04em] transition-all ${
                  defaultTheme === 'dark'
                    ? 'bg-[#ffffff] text-[#0a0a0a]'
                    : 'bg-[#111111] text-[#555555] border border-[#1e1e1e] hover:border-[#2a2a2a]'
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => setDefaultTheme('light')}
                className={`px-5 py-2.5 rounded-xl text-[11px] font-medium uppercase tracking-[0.04em] transition-all ${
                  defaultTheme === 'light'
                    ? 'bg-[#ffffff] text-[#0a0a0a]'
                    : 'bg-[#111111] text-[#555555] border border-[#1e1e1e] hover:border-[#2a2a2a]'
                }`}
              >
                Light
              </button>
            </div>
            <p className="text-[10px] text-[#444444] mt-3">
              {defaultTheme === 'auto' ? 'Widget akan otomatis ikut tema website' : 'Widget akan pakai tema ini secara tetap'}
            </p>
          </div>

          {/* Customization Toggle */}
          <div>
            <button
              onClick={() => setShowCustomize(!showCustomize)}
              className="flex items-center gap-2 text-[11px] text-[#555555] hover:text-[#aaaaaa] uppercase tracking-widest transition-colors"
            >
              <span>{showCustomize ? '▼' : '▶'}</span>
              <span>Customisasi Widget</span>
            </button>

            {showCustomize && (
              <div className="mt-4 space-y-5">
                {/* Custom Text */}
                <div className="space-y-3">
                  <p className="text-[9px] text-[#444444] uppercase tracking-[0.18em]">Teks Custom</p>
                  <div>
                    <label className="block text-[10px] text-[#555555] mb-1.5">Judul</label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="e.g., Kirim Pesan Anonim"
                      className="w-full bg-[#111111] border border-[#1e1e1e] rounded-xl px-3 py-2 text-[#aaaaaa] text-[12px] placeholder-[#333333] focus:border-[#2a2a2a] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#555555] mb-1.5">Placeholder</label>
                    <input
                      type="text"
                      value={customPlaceholder}
                      onChange={(e) => setCustomPlaceholder(e.target.value)}
                      placeholder="e.g., Tulis sesuatu..."
                      className="w-full bg-[#111111] border border-[#1e1e1e] rounded-xl px-3 py-2 text-[#aaaaaa] text-[12px] placeholder-[#333333] focus:border-[#2a2a2a] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#555555] mb-1.5">Teks Tombol</label>
                    <input
                      type="text"
                      value={customBtnText}
                      onChange={(e) => setCustomBtnText(e.target.value)}
                      placeholder="e.g., Kirim Pesan"
                      className="w-full bg-[#111111] border border-[#1e1e1e] rounded-xl px-3 py-2 text-[#aaaaaa] text-[12px] placeholder-[#333333] focus:border-[#2a2a2a] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#555555] mb-1.5">Pesan Sukses</label>
                    <input
                      type="text"
                      value={customSuccessMsg}
                      onChange={(e) => setCustomSuccessMsg(e.target.value)}
                      placeholder="e.g., Pesan terkirim!"
                      className="w-full bg-[#111111] border border-[#1e1e1e] rounded-xl px-3 py-2 text-[#aaaaaa] text-[12px] placeholder-[#333333] focus:border-[#2a2a2a] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Custom Colors */}
                <div className="space-y-4">
                  <p className="text-[9px] text-[#444444] uppercase tracking-[0.18em]">Warna</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-[#555555] mb-1.5">Background</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={customBg || '#0a0a0a'}
                          onChange={(e) => setCustomBg(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-[#1e1e1e] bg-transparent cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={customBg}
                          onChange={(e) => setCustomBg(e.target.value)}
                          placeholder="#0a0a0a"
                          className="flex-1 bg-[#111111] border border-[#1e1e1e] rounded-xl px-3 py-2 text-[#aaaaaa] text-[11px] placeholder-[#333333] focus:border-[#2a2a2a] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#555555] mb-1.5">Surface</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={customSurface || '#111111'}
                          onChange={(e) => setCustomSurface(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-[#1e1e1e] bg-transparent cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={customSurface}
                          onChange={(e) => setCustomSurface(e.target.value)}
                          placeholder="#111111"
                          className="flex-1 bg-[#111111] border border-[#1e1e1e] rounded-xl px-3 py-2 text-[#aaaaaa] text-[11px] placeholder-[#333333] focus:border-[#2a2a2a] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#555555] mb-1.5">Teks</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={customText || '#aaaaaa'}
                          onChange={(e) => setCustomText(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-[#1e1e1e] bg-transparent cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={customText}
                          onChange={(e) => setCustomText(e.target.value)}
                          placeholder="#aaaaaa"
                          className="flex-1 bg-[#111111] border border-[#1e1e1e] rounded-xl px-3 py-2 text-[#aaaaaa] text-[11px] placeholder-[#333333] focus:border-[#2a2a2a] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#555555] mb-1.5">Border</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={customBorder || '#1e1e1e'}
                          onChange={(e) => setCustomBorder(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-[#1e1e1e] bg-transparent cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={customBorder}
                          onChange={(e) => setCustomBorder(e.target.value)}
                          placeholder="#1e1e1e"
                          className="flex-1 bg-[#111111] border border-[#1e1e1e] rounded-xl px-3 py-2 text-[#aaaaaa] text-[11px] placeholder-[#333333] focus:border-[#2a2a2a] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#555555] mb-1.5">Accent / Tombol</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={customAccent || '#ffffff'}
                          onChange={(e) => setCustomAccent(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-[#1e1e1e] bg-transparent cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={customAccent}
                          onChange={(e) => setCustomAccent(e.target.value)}
                          placeholder="#ffffff"
                          className="flex-1 bg-[#111111] border border-[#1e1e1e] rounded-xl px-3 py-2 text-[#aaaaaa] text-[11px] placeholder-[#333333] focus:border-[#2a2a2a] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#555555] mb-1.5">Border Radius (px)</label>
                      <input
                        type="number"
                        value={customRadius}
                        onChange={(e) => setCustomRadius(e.target.value)}
                        placeholder="16"
                        className="w-full bg-[#111111] border border-[#1e1e1e] rounded-xl px-3 py-2 text-[#aaaaaa] text-[12px] placeholder-[#333333] focus:border-[#2a2a2a] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Custom CSS */}
                <div>
                  <p className="text-[9px] text-[#444444] uppercase tracking-[0.18em] mb-2">Custom CSS</p>
                  <textarea
                    value={customCss}
                    onChange={(e) => setCustomCss(e.target.value)}
                    placeholder="/* Tulis CSS custom kamu di sini */\n.widget { font-family: serif; }"
                    rows={4}
                    className="w-full bg-[#111111] border border-[#1e1e1e] rounded-xl px-3 py-2 text-[#aaaaaa] text-[11px] placeholder-[#333333] focus:border-[#2a2a2a] focus:outline-none resize-none transition-colors font-mono"
                  />
                </div>

                <button
                  onClick={() => {
                    setCustomTitle('')
                    setCustomPlaceholder('')
                    setCustomBtnText('')
                    setCustomSuccessMsg('')
                    setCustomBg('')
                    setCustomSurface('')
                    setCustomText('')
                    setCustomBorder('')
                    setCustomAccent('')
                    setCustomRadius('')
                    setCustomCss('')
                  }}
                  className="text-[10px] text-[#444444] hover:text-[#ff6b6b] uppercase tracking-widest transition-colors"
                >
                  Reset ke Default →
                </button>
              </div>
            )}
          </div>

          {/* Embed Code */}
          <div>
            <label className="block text-[#444444] text-[11px] uppercase tracking-widest mb-3">Kode Embed</label>
            <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-4">
              <code className="text-[9px] text-[#777777] break-all font-mono block mb-3 leading-relaxed">
                {currentEmbedCode}
              </code>
              <button
                onClick={() => handleCopy(currentEmbedCode, 'main')}
                className="w-full bg-[#ffffff] text-[#0a0a0a] font-medium py-2.5 rounded-xl text-[11px] uppercase tracking-[0.04em] hover:bg-[#e0e0e0] transition-colors"
              >
                {copied === 'main' ? '✓ Disalin' : 'Salin Kode'}
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-4">
            <p className="text-[10px] text-[#555555] leading-relaxed">
              {defaultTheme === 'auto'
                ? 'Widget akan otomatis mendeteksi tema (dark/light mode) dari website kamu.'
                : 'Widget akan menggunakan tema yang dipilih secara tetap.'}
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 border-l border-[#1a1a1a] flex flex-col bg-[#0a0a0a]">
          <div className="p-6 border-b border-[#1a1a1a]">
            <h3 className="font-serif italic text-[16px] text-[#aaaaaa]">Preview</h3>
          </div>
          <div className="flex-1 p-6 flex items-center justify-center bg-[#0a0a0a] overflow-auto">
            <div className="border border-[#1e1e1e] rounded-xl overflow-hidden shadow-lg" style={{ maxWidth: '100%' }}>
              <iframe
                src={currentEmbedUrl}
                width={width}
                height={height}
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
