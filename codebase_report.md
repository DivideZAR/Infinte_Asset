# Codebase Analysis Report

## Project Structure
- **Root**: `/home/divide/Infinte_Asset`
- **Total Files**: 37

**File Types:**
- `.mp4`: 9
- `.ts`: 8
- `.js`: 5
- `.md`: 4
- ``: 4
- `.json`: 3
- `.yml`: 2
- `.py`: 1
- `.jsx`: 1

## Key Configurations
**NPM Scripts:**
- `dev`: `tsx scripts/dev-server.ts`
- `build`: `tsc`
- `start`: `node dist/index.js`
- `lint`: `eslint . --ext .js,.jsx,.ts,.tsx`
- `lint:fix`: `eslint . --ext .js,.jsx,.ts,.tsx --fix`
- `format`: `prettier --write '**/*.{js,jsx,ts,tsx,json,md}'`
- `typecheck`: `tsc --noEmit`
- `test`: `node --experimental-vm-modules node_modules/jest/bin/jest.js`
- `test:watch`: `node --experimental-vm-modules node_modules/jest/bin/jest.js --watch`
- `test:coverage`: `node --experimental-vm-modules node_modules/jest/bin/jest.js --coverage`
- `convert`: `tsx scripts/convert.ts`
- `convert:pipeline`: `tsx scripts/stages/pipeline.ts`
- `convert:test`: `tsx scripts/stages/pipeline.ts test`
- `convert:test1`: `tsx scripts/stages/pipeline.ts test 1`
- `convert:test2`: `tsx scripts/stages/pipeline.ts test 2`
- `convert:test3`: `tsx scripts/stages/pipeline.ts test 3`
- `validate`: `tsx scripts/validate.ts`
- `postinstall`: `husky install`

## Dependencies
Found 31 dependencies. Top 5:
- express
- fluent-ffmpeg
- fs-extra
- glob
- image-size

## Potential Entry Points
- `animations/example-animation/index.jsx`