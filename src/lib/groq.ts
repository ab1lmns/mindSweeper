import type { Cell } from '@/types'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

function getApiKey() {
  return import.meta.env.VITE_GROQ_API_KEY
}

export function formatBoardState(cells: Cell[][]): string {
  return cells.map(row => 
    row.map(c => {
      if (c.isFlagged) return 'F'
      if (!c.isRevealed) return '?'
      if (c.isMine) return 'X'
      return c.neighborCount.toString()
    }).join(' ')
  ).join('\n')
}

export async function getAIHint(boardString: string): Promise<string> {
  const apiKey = getApiKey()
  if (!apiKey) return "API ключ Groq не найден. Добавь VITE_GROQ_API_KEY в .env"

  const prompt = `You are an expert Minesweeper AI Coach.
The user is asking for a hint.
Here is the current board state:
- '?' means unrevealed cell.
- 'F' means flagged cell.
- Numbers (0-8) show how many mines are adjacent.

Board:
${boardString}

Analyze the board. Find ONE logical deduction that can be made right now (e.g., "Look at the 1 and 2 sharing these cells..."). 
Give a short, concise hint in Russian (max 2 sentences). Explain the logic. Do NOT just say "click here", teach them WHY.`

  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 150
      })
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `HTTP ${res.status} ${res.statusText}`)
    }
    
    const data = await res.json()
    return data.choices[0].message.content.trim()
  } catch (err: any) {
    console.error('Groq hint error:', err)
    return `Ошибка API: ${err.message}`
  }
}

export async function getPostGameSummary(status: 'won'|'lost', time: string, riskyCount: number): Promise<string> {
  const apiKey = getApiKey()
  if (!apiKey) return "API ключ Groq не найден."

  const prompt = `You are a strict but encouraging Minesweeper AI Coach.
The user just finished a game.
Status: ${status}
Time: ${time}
Risky guesses made: ${riskyCount} (These are moves where they clicked a cell with >0% chance of a mine when 100% safe moves existed).

Write a short post-game review in Russian (max 3 sentences). 
If they made risky guesses, point it out and tell them to rely on logic. If they won, praise them. If they lost, tell them what to improve.`

  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 150
      })
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `HTTP ${res.status} ${res.statusText}`)
    }
    
    const data = await res.json()
    return data.choices[0].message.content.trim()
  } catch (err: any) {
    console.error('Groq summary error:', err)
    return `Ошибка API: ${err.message}`
  }
}
