import './styles/app.css'
import { createRoot } from 'react-dom/client'
import { boot } from '@letterncms/sdk'
import { Root } from './app/Root'
import { applyTheme } from './ui/theme'

applyTheme()
document.title = `${boot.site.name} · Admin`
createRoot(document.getElementById('cms')!).render(<Root />)
