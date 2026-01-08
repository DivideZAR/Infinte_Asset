import fs from 'fs-extra'
import path from 'path'

const TODO_FILE = path.join(process.cwd(), 'TODO_FILE.txt')

function parseTodos(content) {
  const todos = []
  const lines = content.split('\n').filter(Boolean)
  
  for (const line of lines) {
    const match = line.match(/\[(pending|in_progress|completed|cancelled)\]\s+\{\s+"id":\s+"(\d+)",\s*"content":\s*"([^"]+)"/i)
    if (match) {
      todos.push({
        id: match[1],
        status: match[2],
        content: match[3]
      })
    }
  }

  return todos
}

function displayTodos() {
  try {
    if (!fs.existsSync(TODO_FILE)) {
      console.log('📝 No TODO_FILE.txt found')
      return
    }
    
    const content = fs.readFileSync(TODO_FILE, 'utf-8')
    const todos = parseTodos(content)
    
    if (todos.length === 0) {
      console.log('📝 No todos found')
      return
    }

    const pending = todos.filter(t => t.status === 'pending')
    const inProgress = todos.filter(t => t.status === 'in_progress')
    const completed = todos.filter(t => t.status === 'completed')

    console.log('\n📋 Current Todos:')
    console.log(`   Pending: ${pending.length}`)
    console.log(`   In Progress: ${inProgress.length}`)
    console.log(`   Completed: ${completed.length}`)
    console.log()

    if (inProgress.length > 0) {
      console.log('🔄 Currently Working On:')
      inProgress.forEach(t => {
        console.log(
          `   • [#${t.id} ${t.status === 'completed' ? '✓' : '○'}]: ${t.content.substring(0, 60)}${t.content.length > 60 ? '...' : ''}`
        )
      })
      console.log()
    }

    if (pending.length > 0 && pending.length <= 5) {
      console.log('⏳ Up Next:')
      pending.slice(0, 5).forEach(t => {
        console.log(
          `   • [#${t.id} ○]: ${t.content.substring(0, 60)}${t.content.length > 60 ? '...' : ''}`
        )
      })
    }

    if (pending.length > 5) {
      console.log(`⏳ Up Next: ${pending.length} items`)
    }
  } catch (error) {
    console.log('📝 Error reading todos:', error.message)
  }
}

displayTodos()
