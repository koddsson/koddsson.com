import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function listFilesRecursive(dir) {
  const files = [];
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        files.push(...await listFilesRecursive(fullPath));
      } else if (item.isFile() && item.name.endsWith('.json')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // If directory doesn't exist, return empty array
    if (error.code !== 'ENOENT') {
      console.error(`Error reading workouts directory: ${error.message}`);
    }
  }
  return files;
}

export default async function() {
  const workoutsDir = path.join(__dirname, '..', 'data', 'workouts');
  const jsonFiles = await listFilesRecursive(workoutsDir);
  
  const workouts = [];
  
  for (const jsonFile of jsonFiles) {
    try {
      const content = await fs.readFile(jsonFile, 'utf-8');
      const data = JSON.parse(content);
      
      // Extract the base filename without extension
      const basename = path.basename(jsonFile, '.json');
      const svgPath = jsonFile.replace('.json', '.svg');
      
      // Check if SVG exists
      let hasSvg = false;
      try {
        await fs.access(svgPath);
        hasSvg = true;
      } catch {
        // SVG doesn't exist
      }
      
      // Get relative path for the SVG from the site root
      const relativeSvgPath = hasSvg 
        ? path.relative(path.join(__dirname, '..'), svgPath).replace(/\\/g, '/')
        : null;
      
      workouts.push({
        filename: basename,
        filepath: jsonFile,
        svgPath: relativeSvgPath,
        data: data
      });
    } catch (error) {
      console.error(`Error reading workout file ${jsonFile}: ${error.message}`);
    }
  }
  
  // Sort workouts by date (newest first)
  workouts.sort((a, b) => {
    const dateA = a.data.activity?.start_date || a.data.received_at || '';
    const dateB = b.data.activity?.start_date || b.data.received_at || '';
    return dateB.localeCompare(dateA);
  });
  
  return workouts;
}
