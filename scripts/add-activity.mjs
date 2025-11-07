import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dataFilePath = path.join(__dirname, '..', '_data', 'activities.json')
const jsonString = process.argv[2]

if (!jsonString) {
  console.error('Error: No activity data provided')
  process.exit(1)
}

// Read existing activities or initialize empty array
const fileExists = fs.existsSync(dataFilePath)
let activities = []

if (fileExists) {
  try {
    const fileContent = fs.readFileSync(dataFilePath).toString()
    activities = JSON.parse(fileContent)
  } catch (error) {
    console.error('Error: Failed to parse existing activities.json:', error.message)
    process.exit(1)
  }
}

// Parse and add new activity
let activity
try {
  activity = JSON.parse(jsonString)
} catch (error) {
  console.error('Error: Failed to parse activity data:', error.message)
  process.exit(1)
}

activities.push(activity)

// Write back to file
try {
  fs.writeFileSync(dataFilePath, JSON.stringify(activities, null, 2))
  console.log('Activity added successfully!')
} catch (error) {
  console.error('Error: Failed to write activities.json:', error.message)
  process.exit(1)
}

