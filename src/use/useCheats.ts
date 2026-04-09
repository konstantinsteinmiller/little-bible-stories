import { onMounted, onUnmounted, ref } from 'vue'
import useModels from '@/use/useModels'
import useUser from '@/use/useUser'

const storedCheat = localStorage.getItem('cheat') || 'false'
const isCheat = ref<boolean>(JSON.parse(storedCheat))


const useCheats = () => {
  if (!isCheat.value) return {}
  const { setSettingValue } = useUser()


  /**
   * CHEAT MAPPING
   * Define your shortcuts here.
   * Format: 'ctrl+shift+key' or just 'key'
   * Note: 'ctrl' also catches 'meta' (Cmd on Mac) for better UX.
   */
  const cheatsMap: Record<string, () => void> = {
    'ctrl+shift+c': () => {
    }
  }

  /**
   * EVENT HANDLER
   */
  const handleKeyDown = (e: KeyboardEvent) => {
    const keys = []

    // 1. Build the modifier prefix
    if (e.ctrlKey || e.metaKey) keys.push('ctrl')
    if (e.shiftKey) keys.push('shift')
    if (e.altKey) keys.push('alt')

    // 2. Add the actual key (normalized to lowercase)
    const mainKey = e.key.toLowerCase()

    // console.log('keys: ', keys)
    // Avoid adding 'control', 'shift', etc., as the main key if they are modifiers
    if (!['control', 'shift', 'alt', 'meta'].includes(mainKey)) {
      keys.push(mainKey)
    }

    // 3. Join and match
    const shortcut = keys.join('+')

    if (cheatsMap[shortcut]) {
      e.preventDefault()
      cheatsMap[shortcut]()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown, { passive: false })
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    isCheat
  }
}

export default useCheats