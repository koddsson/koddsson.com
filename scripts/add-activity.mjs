import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dataFilePath = path.join(__dirname, '..', '_data', 'activities.json')
const jsonString = process.argv[2]

// Read existing activities or initialize empty array
const fileExists = fs.existsSync(dataFilePath)
const activities = fileExists ? JSON.parse(fs.readFileSync(dataFilePath).toString()) : []

// Parse and add new activity
const activity = JSON.parse(jsonString)
activities.push(activity)

// Write back to file
fs.writeFileSync(dataFilePath, JSON.stringify(activities, null, 2))

console.log('Activity added successfully!')
