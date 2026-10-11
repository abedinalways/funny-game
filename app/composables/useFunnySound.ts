let audioCtx: AudioContext | null = null

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export const useFunnySound = () => {
  const isMuted = ref(false)

  const toggleMute = () => {
    isMuted.value = !isMuted.value
  }

  const playTone = (
    freq: number,
    type: OscillatorType,
    durationMs: number,
    delayMs = 0,
    gainPeak = 0.15
  ) => {
    if (isMuted.value) return
    const ctx = getAudioContext()
    if (!ctx) return

    setTimeout(() => {
      try {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = type
        osc.frequency.setValueAtTime(freq, ctx.currentTime)

        gain.gain.setValueAtTime(0.001, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(gainPeak, ctx.currentTime + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start()
        osc.stop(ctx.currentTime + durationMs / 1000)
      } catch {
        // audio playback fallback
      }
    }, delayMs)
  }

  const playRoll = () => {
    if (isMuted.value) return
    for (let i = 0; i < 6; i++) {
      playTone(180 + Math.random() * 220, 'square', 40, i * 70, 0.08)
    }
  }

  const playStep = () => {
    playTone(420, 'sine', 50, 0, 0.12)
  }

  const playSix = () => {
    playTone(330, 'triangle', 100, 0, 0.2)
    playTone(440, 'triangle', 120, 100, 0.22)
    playTone(554, 'triangle', 140, 220, 0.24)
    playTone(659, 'triangle', 320, 360, 0.28)
  }

  const playKill = () => {
    playTone(320, 'sawtooth', 120, 0, 0.22)
    playTone(260, 'sawtooth', 140, 120, 0.22)
    playTone(200, 'sawtooth', 180, 260, 0.24)
    playTone(140, 'sawtooth', 360, 440, 0.28)
  }

  const playHome = () => {
    playTone(523, 'sine', 120, 0, 0.18)
    playTone(659, 'sine', 140, 120, 0.2)
    playTone(784, 'sine', 160, 260, 0.22)
    playTone(1046, 'sine', 400, 420, 0.25)
  }

  const playWin = () => {
    const notes = [261, 329, 392, 523, 659, 783, 1046]
    notes.forEach((freq, idx) => {
      playTone(freq, 'triangle', 200, idx * 120, 0.22)
    })
  }

  return {
    isMuted,
    toggleMute,
    playRoll,
    playStep,
    playSix,
    playKill,
    playHome,
    playWin,
  }
}
