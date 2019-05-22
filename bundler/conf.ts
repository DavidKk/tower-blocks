import path from 'path'

export const rootPath = path.join(__dirname, '../../')
export const srcPath = path.join(rootPath, './src')
export const appPath = path.join(rootPath, './app')
export const webEntry = path.join(srcPath, './index.html')
export const appEntry = path.join(srcPath, './game.ts')
export const isRelease = process.env.NODE_ENV === 'production'
