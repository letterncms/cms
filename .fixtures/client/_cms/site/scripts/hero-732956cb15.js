import { ease } from './lib/ease.js'
import tiny from 'tiny'
document.documentElement.dataset.hero = ease()
document.documentElement.dataset.vendor = tiny.name
