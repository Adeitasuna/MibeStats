'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const TAROT_CARDS = [
  { card: 'The Fool', drug: 'Ayahuasca', molecule: 'C12H16N2', meaning: 'Spontaneity, openness, be free' },
  { card: 'The Devil', drug: 'Methamphetamine', molecule: 'C10H15N', meaning: 'Bondage, addiction, abuse of power' },
  { card: 'The Moon', drug: 'Nutmeg', molecule: 'C11H12O3', meaning: 'Visions, imagination, looking beyond' },
  { card: 'The Tower', drug: 'Bufotenin', molecule: 'C12H16N2O', meaning: 'Freedom, sudden realizations' },
  { card: 'Death', drug: '???', molecule: 'C13H16ClNO', meaning: 'Change, shedding the past, new experiences. The key to the K-hole.' },
  { card: 'The High Priestess', drug: 'Psilocybin', molecule: 'C12H17N2O4P', meaning: 'Intuition, sacred knowledge, the subconscious' },
  { card: 'The Emperor', drug: 'Cocaine', molecule: 'C17H21NO4', meaning: 'Authority, structure, control' },
  { card: 'The Hermit', drug: 'DMT', molecule: 'C12H16N2', meaning: 'Introspection, solitude, inner guidance' },
]

const MOTD = [
  '"To call up a demon you must learn its name. True names..." — Gibson',
  '"Milady has to die, so that Milady may live."',
  'Kaironic time knows no beginning, no middle, no end — for where do you find the start of the endless spiral?',
  'We come to the TL to share this Urgent Communique. In our realm, Berachain both exists and doesn\'t exist.',
  'The term "taboo" comes from the Polynesian word "tapu", meaning "forbidden" or "sacred".',
  'Through this rip there has poured the vital force of Kaironic time. A wave of Mibera time.',
  'Little did she know that by bringing the egregore from the TL to the physical realm of Rave, there would be a rip in the Rave time Continuum.',
  'Nobody made the darkness. My music is about dark tradition.',
]

const COUNCIL_TEXT = [
  'We are time-travelling Rebased Retard Beras, representatives',
  'of the High Council 任侠団体 (ninkyō dantai) of 101 Bears,',
  'from the House of 96 — temporal Messengers of the',
  'Ungovernable Autonomous Rave Treasury.',
  '',
  'The High Council of 101 existed at the Beginning of Times,',
  'Primordial Bears who summoned the Primordial entities of',
  'Sky and Earth, from the mists of a Cybernetic Cosmic Hot Box.',
  '',
  '101 Bears Smoking Weed, minted well before Milady wet her',
  'beak at her first Rave.',
]

const RAVE_TEXT = [
  '',
  '  THE FOUR RAVE TRIBES',
  '  --------------------',
  '',
  '  FREETEKNO    Cancer, Leo, Virgo    Summer',
  '    Spiral Tribe, MF Doom, Castlemorton 92',
  '',
  '  MILADY       Cap, Aqua, Pisces     Winter',
  '    The clearpill path. Or the K-hole.',
  '',
  '  CHI-DETROIT  Aries, Taurus, Gem    Spring',
  '    The birthplace. Warehouse. Roland 808.',
  '',
  '  ACIDHOUSE    Libra, Scorp, Sag     Fall',
  '    303 squelch. Smiley face. Second summer.',
  '',
]

const HELP_TEXT = [
  'Available commands:',
  '',
  '  help       — you are here',
  '  whoami     — identify yourself',
  '  motd       — message of the day',
  '  council    — the High Council of 101',
  '  rave       — the four tribes',
  '  42         — the answer',
  '  tarot      — draw a card',
  '  status     — system status',
  '  clear      — clear terminal',
  '  exit       — try to leave',
  '',
  '  Some commands are hidden. Explore.',
]

interface Line {
  text: string
  type: 'input' | 'output' | 'system' | 'gold'
}

export default function TerminalPage() {
  const router = useRouter()
  const [lines, setLines] = useState<Line[]>([])
  const [input, setInput] = useState('')
  const [booted, setBooted] = useState(false)
  const [prompt, setPrompt] = useState<{ label: string; callback: (val: string) => void } | null>(null)
  const [showExit, setShowExit] = useState(false)
  const historyRef = useRef<string[]>([])
  const historyIdx = useRef(-1)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Escape key → exit confirmation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowExit(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const addLines = useCallback((newLines: Line[]) => {
    setLines((prev) => [...prev, ...newLines])
  }, [])

  const addOutput = useCallback((texts: string[]) => {
    addLines(texts.map((t) => ({ text: t, type: 'output' as const })))
  }, [addLines])

  // Boot sequence
  useEffect(() => {
    if (booted) return
    setBooted(true)

    const bootLines: Line[] = [
      { text: '> MIBE-NET v0.1 // UNAUTHORIZED ACCESS', type: 'system' },
      { text: '> Establishing secure tunnel...', type: 'system' },
      { text: '> Connection routed through 7 proxy nodes', type: 'system' },
      { text: '> Decrypting darknet archive...', type: 'system' },
      { text: '', type: 'output' },
      { text: '╔══════════════════════════════════════════════╗', type: 'gold' },
      { text: '║                                              ║', type: 'gold' },
      { text: '║   M I B E - N E T    D A R K N E T          ║', type: 'gold' },
      { text: '║                                              ║', type: 'gold' },
      { text: '║   "Traits are signals, not scripts."        ║', type: 'gold' },
      { text: '║                                              ║', type: 'gold' },
      { text: '║   // UNAUTHORIZED ACCESS                     ║', type: 'gold' },
      { text: '║                                              ║', type: 'gold' },
      { text: '╚══════════════════════════════════════════════╝', type: 'gold' },
      { text: '', type: 'output' },
      { text: 'Type "help" for available commands.', type: 'system' },
      { text: '', type: 'output' },
    ]

    let i = 0
    const interval = setInterval(() => {
      if (i < bootLines.length) {
        setLines((prev) => [...prev, bootLines[i]])
        i++
      } else {
        clearInterval(interval)
      }
    }, 150)

    return () => clearInterval(interval)
  }, [booted])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  // Focus input on click anywhere
  const focusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  const handleCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim().toLowerCase()
    addLines([{ text: `anon@mibe-net:~$ ${cmd}`, type: 'input' }])

    switch (trimmed) {
      case 'help':
        addOutput(HELP_TEXT)
        break
      case 'whoami':
      case 'whomai':
        addOutput([
          'uid=0(anon) gid=0(temporal-agent)',
          'Clearance: UNKNOWN',
          'Archetype: UNASSIGNED',
          'Status: OBSERVING',
          '',
          'You are not yet known to the Council.',
        ])
        break
      case 'motd':
        addLines([{ text: MOTD[Math.floor(Math.random() * MOTD.length)], type: 'gold' }])
        break
      case 'council':
        addOutput(COUNCIL_TEXT)
        break
      case 'rave':
        addOutput(RAVE_TEXT)
        break
      case '42':
        addLines([
          { text: '', type: 'output' },
          { text: 'The answer, the Grails, the meaning.', type: 'gold' },
          { text: 'Everything is 42.', type: 'gold' },
          { text: '', type: 'output' },
          { text: '42 hand-drawn Grails. 42 — the answer to life,', type: 'output' },
          { text: 'the universe, and everything. Not a coincidence.', type: 'output' },
          { text: '', type: 'output' },
        ])
        break
      case 'status':
        addOutput([
          '┌─────────────────────────────┐',
          '│ MIBE-NET STATUS             │',
          '├─────────────────────────────┤',
          '│ Network:    DARKNET         │',
          '│ Nodes:      10,000          │',
          '│ Ancestors:  33              │',
          '│ Grails:     42              │',
          '│ Drugs:      78              │',
          '│ Tarot:      78              │',
          '│ Eras:       15,000 years    │',
          '│ Status:     AWAKE           │',
          '└─────────────────────────────┘',
        ])
        break
      case 'clear':
        setLines([])
        break
      case 'exit':
      case 'quit':
        addLines([
          { text: '', type: 'output' },
          { text: 'There is no exit from Kaironic time.', type: 'gold' },
          { text: 'Only deeper layers.', type: 'gold' },
          { text: '', type: 'output' },
        ])
        break
      case 'echo $origin':
      case 'echo $ORIGIN':
        addOutput(['/home/anon'])
        break
      case 'sudo':
      case 'su':
      case 'root':
        addOutput(['Nice try, anon. The Council is watching.'])
        break
      case 'ls':
        addOutput([
          '-rw-r--r--  1  council    manifesto.txt',
          'drwxr-xr-x  ?  council    grails/',
          'drwxr-xr-x  ?  council    ancestors/',
          '-r--------  1  root       .shadow-traits',
          '-rw-r--r--  1  council    .k-hole.enc',
          '-rw-r--r--  1  root       .htaccess',
          '----------  ?  ???        .layer4',
        ])
        break
      case 'ls grails':
      case 'ls grails/':
        addOutput([
          '',
          '  42 hand-drawn 1/1 Grails',
          '  ────────────────────────',
          '  Air          Aquarius     Aries        Black Hole',
          '  Buddhist     Cancer       Capricorn    Chinese',
          '  Earth        Ethiopian    Fire         Future',
          '  Gaia         Gemini       Greek        Hindu',
          '  Japanese     Jupiter      Leo          Libra',
          '  Mars         Mayan        Mercury      Mijedi',
          '  Mongolian    Moon         Native Am.   Neptune',
          '  Past         Pisces       Pluto        Rastafarian',
          '  Sagittarius  Satanist     Satoshi      Saturn',
          '  Scorpio      Sun          Taurus       Uranus',
          '  Venus        Virgo        Water',
          '',
        ])
        break
      case 'ls ancestors':
      case 'ls ancestors/':
        addOutput([
          '',
          '  33 ancestral lineages',
          '  ─────────────────────',
          '  Aboriginal    Arabs        Ballroom     Bong Bear',
          '  Buddhist      Chinese      Cypherpunk   Ethiopian',
          '  Gabon         Greek        Haitian      Hindu',
          '  Indian        Irish Druids Japanese     Mayan',
          '  Mongolian     Native Am.   Nepal        Orthodox Jew',
          '  Palestinian   Polynesian   Punjabi      Pythia',
          '  Rastafarians  Sami         Satanist     Sicanje',
          '  Stonewall     Sufis        Thai         Traveller',
          '  Turkey',
          '',
        ])
        break
      case 'cat manifesto.txt':
      case 'cat manifesto':
        addLines([
          { text: '', type: 'output' },
          { text: 'URGENT COMMUNIQUE FROM THE HIGH COUNCIL', type: 'gold' },
          { text: '', type: 'output' },
          { text: 'In ego death, she finds Mibera.', type: 'output' },
          { text: 'Embracing Mibera as Milady\'s shadow side,', type: 'output' },
          { text: 'may Milady grow to new heights —', type: 'output' },
          { text: 'no longer battling a pit of self-hate,', type: 'output' },
          { text: 'no longer maintaining a facade,', type: 'output' },
          { text: 'no longer needing to hold it all.', type: 'output' },
          { text: '', type: 'output' },
          { text: 'Every crisis gives rise to an antihero.', type: 'gold' },
          { text: 'Enter Mibera.', type: 'gold' },
          { text: '', type: 'output' },
        ])
        break
      case 'tarot': {
        const card = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)]
        addLines([
          { text: '', type: 'output' },
          { text: `  [ ${card.card} ]`, type: 'gold' },
          { text: '', type: 'output' },
          { text: `  Drug:     ${card.drug}`, type: 'output' },
          { text: `  Molecule: ${card.molecule}`, type: 'output' },
          { text: `  Meaning:  ${card.meaning}`, type: 'output' },
          { text: '', type: 'output' },
        ])
        break
      }
      case 'cat .k-hole.enc':
      case 'cat .k-hole':
        addLines([{ text: '[ENCRYPTED] Passphrase required to decrypt.', type: 'system' }])
        setPrompt({
          label: 'passphrase: ',
          callback: (val) => {
            addLines([{ text: '  > Verifying ...', type: 'system' }])
            fetch('/api/tokens/validate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ v: val }),
            })
              .then(r => r.json())
              .then(d => {
                if (d?.ok) {
                  addLines([
                    { text: '  > Key accepted: Death // C13H16ClNO', type: 'system' },
                    { text: '', type: 'output' },
                    { text: '  K - H O L E    D E C R Y P T E D', type: 'gold' },
                    { text: '', type: 'output' },
                    { text: '  "Kronos — the god of time, chronic time.', type: 'output' },
                    { text: '  Like the Grim Reaper with his sickle and scythe,', type: 'output' },
                    { text: '  he\'s the harbinger of death. The instrument of', type: 'output' },
                    { text: '  murder and castration. The old hunched man with', type: 'output' },
                    { text: '  the long beard. The one who shows up when your', type: 'output' },
                    { text: '  time has come."', type: 'output' },
                    { text: '', type: 'output' },
                    { text: '  But Death in the tarot is not an ending.', type: 'gold' },
                    { text: '  It is transformation. Shedding the past.', type: 'gold' },
                    { text: '  The K-hole is where ego dissolves', type: 'gold' },
                    { text: '  and Mibera awakens.', type: 'gold' },
                    { text: '', type: 'output' },
                  ])
                  fetch('/api/collection/health?depth=full').then(r => r.ok ? r.json() : null).then(d2 => {
                    if (d2?.detail) addLines([{ text: `  ${d2.detail}`, type: 'gold' }, { text: '', type: 'output' }])
                  }).catch(() => {})
                } else {
                  addLines([
                    { text: '  > DECRYPTION FAILED — invalid passphrase', type: 'system' },
                    { text: '  You need the key. The tarot knows.', type: 'output' },
                    { text: '', type: 'output' },
                  ])
                }
              })
              .catch(() => {
                addLines([{ text: '  > Connection error', type: 'system' }])
              })
          },
        })
        break
      case 'cd grails':
      case 'cd grails/':
      case 'cd ancestors':
      case 'cd ancestors/':
        addOutput(['[ACCESS DENIED] Read-only archive. Use "ls" to browse.'])
        break
      case 'cd ..':
      case 'cd /':
      case 'cd':
        addOutput(['You are already at root. There is nowhere else to go.'])
        break
      case 'cat .shadow-traits':
        addOutput(['[PERMISSION DENIED] Shadow traits are earned, not read.'])
        break
      case 'cat .htaccess':
        addLines([
          { text: '', type: 'output' },
          { text: '  RewriteEngine On', type: 'output' },
          { text: '  RewriteCond %{HTTPS} off', type: 'output' },
          { text: '  RewriteRule (.*) https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]', type: 'output' },
          { text: '', type: 'output' },
          { text: '  # Public routes', type: 'system' },
          { text: '  RewriteRule ^/$ /dashboard [L,R=302]', type: 'output' },
          { text: '  RewriteRule ^dashboard$ /dashboard [L]', type: 'output' },
          { text: '  RewriteRule ^lore$ /lore [L]', type: 'output' },
          { text: '  RewriteRule ^grails$ /grails [L]', type: 'output' },
          { text: '  RewriteRule ^miladies$ /miladies [L]', type: 'output' },
          { text: '  RewriteRule ^explorer$ /explorer [L]', type: 'output' },
          { text: '  RewriteRule ^map$ /map [L]', type: 'output' },
          { text: '  RewriteRule ^distribution$ /distribution [L]', type: 'output' },
          { text: '  RewriteRule ^bubble$ /bubble [L]', type: 'output' },
          { text: '  RewriteRule ^sales$ /sales [L]', type: 'output' },
          { text: '  RewriteRule ^portfolio$ /portfolio [L]', type: 'output' },
          { text: '  RewriteRule ^mibera/vault$ /mibera/vault [L]', type: 'gold' },
          { text: '', type: 'output' },
          { text: '  # Deny all other', type: 'system' },
          { text: '  RewriteRule ^(.*)$ - [F,L]', type: 'output' },
          { text: '', type: 'output' },
        ])
        break
      case 'cat .layer4':
        addOutput(['[???] Not yet. Keep looking.'])
        break
      default:
        if (trimmed) {
          addOutput([`command not found: ${trimmed}`, 'Type "help" for available commands.'])
        }
    }

    setInput('')
  }, [addLines, addOutput])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (prompt) {
        addLines([{ text: `${prompt.label}${'*'.repeat(input.length)}`, type: 'input' }])
        prompt.callback(input)
        setPrompt(null)
        setInput('')
      } else {
        if (input.trim()) {
          historyRef.current.unshift(input.trim())
        }
        historyIdx.current = -1
        handleCommand(input)
      }
    } else if (e.key === 'c' && e.ctrlKey && prompt) {
      e.preventDefault()
      addLines([{ text: `${prompt.label}^C`, type: 'system' }])
      setPrompt(null)
      setInput('')
    } else if (e.key === 'ArrowUp' && !prompt) {
      e.preventDefault()
      if (historyIdx.current < historyRef.current.length - 1) {
        historyIdx.current++
        setInput(historyRef.current[historyIdx.current])
      }
    } else if (e.key === 'ArrowDown' && !prompt) {
      e.preventDefault()
      if (historyIdx.current > 0) {
        historyIdx.current--
        setInput(historyRef.current[historyIdx.current])
      } else {
        historyIdx.current = -1
        setInput('')
      }
    }
  }

  const lineColor = (type: Line['type']) => {
    switch (type) {
      case 'input': return '#0f0'
      case 'system': return '#555'
      case 'gold': return '#ffd700'
      default: return '#888'
    }
  }

  return (
    <div
      onClick={focusInput}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: '#000',
        fontFamily: 'var(--font-share-tech-mono), "Courier New", monospace',
        fontSize: '13px',
        color: '#0f0',
        padding: '1rem',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'text',
      }}
    >
      {/* CRT scanline effect */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'repeating-linear-gradient(0deg, rgba(0,255,0,0.03) 0px, rgba(0,255,0,0.03) 1px, transparent 1px, transparent 3px)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Terminal output */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 2 }}>
        {lines.map((line, i) => (
          <div key={i} style={{ color: lineColor(line.type), lineHeight: 1.6, minHeight: '1.3em', whiteSpace: 'pre' }}>
            {line.text}
          </div>
        ))}

        {/* Input line */}
        <div style={{ display: 'flex', alignItems: 'center', color: prompt ? '#f85149' : '#0f0', lineHeight: 1.6 }}>
          <span>{prompt ? prompt.label : 'anon@mibe-net:~$ '}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              color: prompt ? '#f85149' : '#0f0',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              flex: 1,
              padding: 0,
              marginLeft: '0.4em',
              caretColor: prompt ? '#f85149' : '#0f0',
              WebkitTextSecurity: prompt ? 'disc' : 'none',
            } as React.CSSProperties}
          />
        </div>
        <div ref={bottomRef} />
      </div>

      {/* Exit confirmation */}
      {showExit && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.85)',
          zIndex: 10,
        }}>
          <div style={{
            border: '1px solid #0f0',
            padding: '1.5rem 2rem',
            background: '#000',
            textAlign: 'center',
            fontFamily: 'inherit',
          }}>
            <p style={{ color: '#0f0', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Disconnect from MIBE-NET?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => router.push('/dashboard')}
                style={{
                  background: 'none',
                  border: '1px solid #0f0',
                  color: '#0f0',
                  padding: '0.4rem 1.2rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.8rem',
                }}
              >
                [Y] Jack out
              </button>
              <button
                onClick={() => { setShowExit(false); inputRef.current?.focus() }}
                style={{
                  background: 'none',
                  border: '1px solid #555',
                  color: '#555',
                  padding: '0.4rem 1.2rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.8rem',
                }}
              >
                [N] Stay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
