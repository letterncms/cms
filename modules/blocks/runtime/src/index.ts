// Site runtime. Loaded only on pages that need it; the script tag lists what the page uses:
//   <script type="module" src="…/cms-[hash].js" data-features="logic motion search code">
// Each feature is its own chunk, so a page with one animated heading never downloads Alpine.
import { boot, featuresOf } from './features'

void boot(featuresOf(document))
