import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

const mediapipeWorkaround = () => {
  return {
    name: 'mediapipe-workaround',
    load(id) {
      const MEDIAPIPE_EXPORTS = {
        'holistic.js': ['Holistic', 'POSE_LANDMARKS', 'POSE_CONNECTIONS', 'FACEMESH_TESSELATION', 'HAND_CONNECTIONS'],
        'camera_utils.js': ['Camera'],
        'drawing_utils.js': ['drawConnectors', 'drawLandmarks', 'lerp'],
      };
      
      const fileName = path.basename(id);
      if (!(fileName in MEDIAPIPE_EXPORTS)) return null;

      let code = fs.readFileSync(id, 'utf-8');
      for (const name of MEDIAPIPE_EXPORTS[fileName]) {
        code += `\nexports.${name} = ${name};`;
      }
      return { code };
    },
  };
};

export default defineConfig({
  plugins: [react(), tailwindcss(), mediapipeWorkaround()],
  server: {
    open: true,
  }
})