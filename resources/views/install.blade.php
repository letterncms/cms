<!doctype html>
<html lang="{{ $locale }}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="csrf-token" content="{{ csrf_token() }}">
<title>{{ $text['title'] }}</title>
{{-- The admin's tokens, typeface, radii and buttons: one family with the sign-in screen this page hands over to. --}}
<style>{!! \Cms\Admin\StandaloneStyle::css() !!}</style>
</head>
<body>
<main class="page wide">
  <div class="brand"><img src="{{ \Cms\Support\Brand::asset('mark.svg') }}" alt="" width="24" height="24">{{ \Cms\Support\Brand::get() }}</div>
  <h1>{{ $text['heading'] }}</h1>

  @php($ok = collect($requirements)->every('ok'))
  <section id="requirements">
    <h2>{{ $text['requirements'] }}</h2>
    <ul class="checks">
      {{-- Ready: one line with its mark. Not: only what has to be fixed. --}}
      @if ($ok)
        <li><span class="label"><span class="pass" aria-hidden="true">{!! \Cms\Admin\StandaloneStyle::icon('check') !!}</span>{{ $text['ready'] }}</span></li>
      @else
        @foreach (collect($requirements)->reject->ok as $check)
          <li class="bad"><span class="label"><span class="dot" aria-hidden="true"></span>{{ $check['label'] }}</span>@if ($check['detail'] !== '')<span class="detail">{{ $check['detail'] }}</span>@endif</li>
        @endforeach
      @endif
    </ul>
  </section>

  @if (! $ok)
    {{-- Not ready: what is missing is marked above, and fixing it on the server is followed by looking again. --}}
    <p class="notice danger" role="alert">{{ $text['blocked'] }}</p>
    <a class="button primary block" href="/install">{{ $text['recheck'] }}</a>
  @endif

  <form id="install" @if(! $ok) class="hidden" @endif>
    <section>
      <h2>{{ $text['site'] }}</h2>
      <div class="field"><label for="site_name">{{ $text['siteName'] }}</label><input id="site_name" name="site_name" required maxlength="120" autocomplete="off" placeholder="Acme Studio"></div>
      <div class="field"><label for="site_url">{{ $text['siteUrl'] }}</label><input id="site_url" name="site_url" type="url" required value="{{ $url }}"></div>
    </section>

    {{-- What the site starts as: a picture and a name per kit, the one a new site starts from chosen (it is the store's: its card is here before the store answers). --}}
    <section>
      <h2 id="kits-heading">{{ $text['kits'] }}</h2>
      <div role="radiogroup" aria-labelledby="kits-heading"><ul class="kits" id="kits">
        @foreach ($kits as $kit)
          <li><label>
            @if ($kit['preview'])<img src="{{ $kit['preview'] }}" alt="" width="480" height="300" loading="lazy">@else<span class="blank" aria-hidden="true"></span>@endif
            <span class="name"><input type="radio" name="kit" value="{{ $kit['handle'] }}" @checked($kit['handle'] === $defaultKit)>{{ $kit['name'] }}</span>
          </label></li>
        @endforeach
        @unless (collect($kits)->contains('handle', $defaultKit))
          <li><label>
            <span class="blank" aria-hidden="true"></span>
            <span class="name"><input type="radio" name="kit" value="{{ $defaultKit }}" checked>{{ $defaultName }}</span>
          </label></li>
        @endunless
      </ul></div>
      <input type="hidden" name="kit_from_store" id="kit_from_store" value="0">
    </section>

    <section>
      <h2>{{ $text['database'] }}</h2>
      <p class="notice danger" id="db-error" role="alert"></p>
      <div class="field">
        <label for="db_driver">{{ $text['databaseType'] }}</label>
        <span class="select"><select id="db_driver" name="db_driver">
          @if (in_array('mysql', $drivers)) <option value="mysql">MySQL / MariaDB</option> @endif
          @if (in_array('sqlite', $drivers)) <option value="sqlite">{{ $text['sqlite'] }}</option> @endif
          @if (in_array('pgsql', $drivers)) <option value="pgsql">PostgreSQL</option> @endif
        </select></span>
      </div>
      <div id="db-server">
        <div class="row">
          <div class="field"><label for="db_host">{{ $text['host'] }}</label><input id="db_host" name="db_host" value="{{ env('DB_HOST', '127.0.0.1') }}"></div>
          <div class="field"><label for="db_port">{{ $text['port'] }}</label><input id="db_port" name="db_port" value="{{ env('DB_PORT', '3306') }}" inputmode="numeric"></div>
        </div>
        <div class="field"><label for="db_database">{{ $text['databaseName'] }}</label><input id="db_database" name="db_database" autocomplete="off"></div>
        <div class="row">
          <div class="field"><label for="db_username">{{ $text['username'] }}</label><input id="db_username" name="db_username" autocomplete="off"></div>
          <div class="field"><label for="db_password">{{ $text['password'] }}</label><span class="reveal"><input id="db_password" name="db_password" type="password" autocomplete="new-password"><button type="button" data-reveal aria-pressed="false" aria-label="{{ $text['showPassword'] }}"><span class="off">{!! \Cms\Admin\StandaloneStyle::icon('eye') ?: e($text['showPassword']) !!}</span><span class="on">{!! \Cms\Admin\StandaloneStyle::icon('eye-off') ?: e($text['showPassword']) !!}</span></button></span></div>
        </div>
        <div class="field"><label for="db_prefix">{{ $text['prefix'] }}</label><input id="db_prefix" name="db_prefix" placeholder="cms_" pattern="[a-z0-9_]*"></div>
      </div>
    </section>

    <section>
      <h2>{{ $text['account'] }}</h2>
      <div class="field"><label for="name">{{ $text['name'] }}</label><input id="name" name="name" required autocomplete="name"></div>
      <div class="field"><label for="email">{{ $text['email'] }}</label><input id="email" name="email" type="email" required autocomplete="email"></div>
      <div class="field"><label for="password">{{ $text['password'] }}</label><span class="reveal"><input id="password" name="password" type="password" required autocomplete="new-password"><button type="button" data-reveal aria-pressed="false" aria-label="{{ $text['showPassword'] }}"><span class="off">{!! \Cms\Admin\StandaloneStyle::icon('eye') ?: e($text['showPassword']) !!}</span><span class="on">{!! \Cms\Admin\StandaloneStyle::icon('eye-off') ?: e($text['showPassword']) !!}</span></button></span></div>
    </section>

    @if ($needsToken)
      {{-- The server's own secret, not part of the account: a group of its own. --}}
      <section>
        <h2>{{ $text['token'] }}</h2>
        <div class="field"><input id="install_token" name="install_token" required autocomplete="off" aria-label="{{ $text['token'] }}" placeholder="CMS_INSTALL_TOKEN"></div>
      </section>
    @endif

    <p class="notice danger" id="error" role="alert"></p>
    <button type="submit" id="submit" class="primary block">{{ $text['install'] }}</button>
  </form>

  <div id="pick" class="hidden">
    <section>
      <h2>{{ $text['add'] }}</h2>
      <ul class="options" id="packages"></ul>
    </section>
    <p class="notice" id="pick-note" role="status"></p>
    <p class="notice danger" id="pick-error" role="alert"></p>
    <button type="button" id="add" class="primary block">{{ $text['addButton'] }}</button>
    <button type="button" id="skip" class="block">{{ $text['skip'] }}</button>
    <button type="button" id="minimal" class="block hidden">{{ $text['useMinimal'] }}</button>
  </div>

  <div id="working" class="hidden">
    <section>
      <div class="track"><div class="bar" id="bar"></div></div>
      <p class="status" id="status" role="status"></p>
    </section>
  </div>
</main>
<script nonce="{{ $nonce }}">
(() => {
  const text = @json($text);
  const form = document.getElementById('install');
  const driver = document.getElementById('db_driver');
  const server = document.getElementById('db-server');
  const error = document.getElementById('error');
  const submit = document.getElementById('submit');
  const sync = () => {
    server.style.display = driver.value === 'sqlite' ? 'none' : '';
    document.getElementById('db_port').value = driver.value === 'pgsql' ? '5432' : '3306';
  };
  driver.addEventListener('change', sync); sync();

  // The store's kits join the list when the store answers; a slow or absent store leaves the ones here.
  const kitList = document.getElementById('kits');
  const fromStore = document.getElementById('kit_from_store');
  const packages = { @json($defaultKit): @json($defaultPackage) };
  fetch('/install/kits', { headers: { 'Accept': 'application/json' } }).then((res) => res.ok ? res.json() : { kits: [] }).then(({ kits = [] }) => {
    for (const kit of kits) {
      // One card per kit: the one this site has already stands for any other copy.
      const here = [...kitList.querySelectorAll('input[name=kit]')].find((input) => input.value === kit.handle);
      if (here) {
        // Its card was drawn without a picture, before the store answered.
        const card = here.closest('label');
        const blank = card.querySelector('.blank');
        if (blank && kit.preview) blank.replaceWith(Object.assign(document.createElement('img'), { src: kit.preview, alt: '', width: 480, height: 300, loading: 'lazy' }));
        continue;
      }
      packages[kit.handle] = kit.package;
      const row = document.createElement('li');
      const label = document.createElement('label');
      const picture = kit.preview ? Object.assign(document.createElement('img'), { src: kit.preview, alt: '', width: 480, height: 300, loading: 'lazy' }) : Object.assign(document.createElement('span'), { className: 'blank' });
      const name = Object.assign(document.createElement('span'), { className: 'name' });
      name.append(Object.assign(document.createElement('input'), { type: 'radio', name: 'kit', value: kit.handle }), kit.title || kit.name);
      label.append(picture, name);
      row.append(label);
      kitList.append(row);
    }
  }).catch(() => {});
  kitList.addEventListener('change', (event) => { fromStore.value = packages[event.target.value] ? '1' : '0'; });

  // A password can be looked at while it is typed: it is asked for once.
  for (const button of document.querySelectorAll('[data-reveal]')) {
    button.addEventListener('click', () => {
      const input = button.parentNode.querySelector('input');
      const shown = input.type === 'password';
      input.type = shown ? 'text' : 'password';
      button.setAttribute('aria-pressed', String(shown));
    });
  }

  // What went wrong is said where it went wrong: under the field it is about, in the database's group
  // when the database refused, and above the button only when it is about neither.
  const dbError = document.getElementById('db-error');
  const clear = () => {
    error.textContent = ''; dbError.textContent = '';
    form.querySelectorAll('.error').forEach((line) => line.remove());
    form.querySelectorAll('[aria-invalid]').forEach((input) => input.removeAttribute('aria-invalid'));
  };
  const mark = (name, message) => {
    const input = form.elements[name];
    if (!input || !input.closest) return false;
    input.setAttribute('aria-invalid', 'true');
    (input.closest('.field') || input.parentNode).append(Object.assign(document.createElement('div'), { className: 'error', textContent: message }));
    return true;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clear();
    submit.disabled = true; submit.setAttribute('aria-busy', 'true'); submit.textContent = text.installing;
    const body = Object.fromEntries(new FormData(form));
    try {
      const res = await fetch('/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = json.error?.message || json.message || text.failed;
        // A refused form names its fields (Laravel's `errors`, an ability's `details`).
        const fields = Object.entries(json.errors || json.error?.details || {}).map(([name, said]) => [name, Array.isArray(said) ? said[0] : said]);
        let first = null;
        for (const [name, said] of fields) if (mark(name, String(said))) first = first || form.elements[name];
        if (!first && res.status === 403 && mark('install_token', message)) first = form.elements.install_token;
        // Without a field to blame, a refusal while installing came from the database.
        const target = first ? null : json.error?.type === 'invalid_input' ? dbError : error;
        if (target) target.textContent = message;
        (first || target).scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        if (first) first.focus({ preventScroll: true });
        submit.disabled = false; submit.removeAttribute('aria-busy'); submit.textContent = text.install;
        return;
      }
      session.kitPackage = packages[body.kit] || null;
      await choose(json);
    } catch (e) {
      error.textContent = e.message || text.failed;
      submit.disabled = false; submit.removeAttribute('aria-busy'); submit.textContent = text.install;
    }
  });

  // Signed in from here on: what's left goes through the same abilities the store screen uses.
  let session = {};
  const show = (id) => {
    for (const part of ['install', 'pick', 'working']) document.getElementById(part).classList.toggle('hidden', part !== id);
    document.getElementById('requirements').classList.toggle('hidden', id !== 'install');
    document.querySelector('h1').textContent = { pick: text.addHeading, working: text.adding }[id] || text.heading;
    window.scrollTo(0, 0);
  };
  const cookie = (name) => decodeURIComponent((document.cookie.split('; ').find((c) => c.startsWith(name + '=')) || '').slice(name.length + 1));
  const post = async (url, body = {}) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-XSRF-TOKEN': cookie(session.xsrfCookie) },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error?.message || json.message || text.failed);
    return json;
  };
  const ability = async (name, input = {}) => (await post('/api/admin/abilities/' + name, input)).data;
  const bar = document.getElementById('bar');
  const status = document.getElementById('status');
  const pickError = document.getElementById('pick-error');
  // Worth knowing, nothing gone wrong: a note, not an error.
  const pickNote = document.getElementById('pick-note');

  async function choose(json) {
    session = { ...json, kitPackage: session.kitPackage };
    show('pick');
    const list = document.getElementById('packages');
    // Nothing to choose: the one button left is the way on, and says where it leads.
    const onward = (why) => {
      pickNote.textContent = why;
      list.closest('section').classList.add('hidden');
      document.getElementById('add').classList.add('hidden');
      const skip = document.getElementById('skip');
      skip.textContent = text.continue; skip.classList.add('primary');
    };
    if (session.composer) return onward(text.composerSite);
    const catalog = await ability('packages/catalog', { refresh: true }).catch(() => ({ items: [] }));
    const items = (catalog.items || []).filter((item) => !item.installed && item.type !== 'kit');
    if (!items.length) return onward(text.noStore);
    const rank = (item) => (session.recommended.includes(item.package) ? 0 : 1);
    items.sort((a, b) => rank(a) - rank(b) || session.recommended.indexOf(a.package) - session.recommended.indexOf(b.package) || a.title.localeCompare(b.title));
    for (const item of items) {
      const row = document.createElement('li');
      const label = document.createElement('label');
      const box = Object.assign(document.createElement('input'), { type: 'checkbox', value: item.package, checked: session.recommended.includes(item.package) });
      const words = document.createElement('span');
      const title = Object.assign(document.createElement('strong'), { textContent: item.title });
      words.append(title, Object.assign(document.createElement('small'), { textContent: item.summary }));
      label.append(box, words);
      row.append(label);
      list.append(row);
    }
  }

  document.getElementById('skip').addEventListener('click', () => finish());
  // The kit chosen could not be fetched: the site starts without one, because the person said so.
  document.getElementById('minimal').addEventListener('click', () => { session.kitPackage = null; finish(); });
  document.getElementById('add').addEventListener('click', async () => {
    const chosen = [...document.querySelectorAll('#packages input:checked')].map((box) => box.value);
    pickError.textContent = '';
    show('working');
    try {
      // Dependencies first, each once: a plan names them in order.
      const steps = new Map();
      for (const name of chosen) {
        for (const step of (await ability('packages/plan-install', { package: name })).steps) steps.set(step.package, step);
      }
      let done = 0;
      for (const step of steps.values()) {
        bar.style.width = (done / steps.size * 90) + '%';
        status.textContent = text.addingOne.replace(':package', step.title);
        if (step.enable_only) {
          await ability('packages/enable', { name: step.package });
        } else {
          await install(step);
        }
        done++;
      }
      await finish();
    } catch (e) {
      show('pick');
      pickError.textContent = e.message;
    }
  });

  // A kit from the store comes the way a plugin does, then the last step starts the site from it.
  async function install(step) {
    let job = await ability('packages/install', { package: step.package, version: step.version });
    while (job.state === 'running') job = await ability('packages/job-step', { id: job.id });
    if (job.state === 'failed') throw new Error(job.error || text.failed);
  }

  async function finish() {
    show('working');
    if (session.kitPackage) {
      try {
        const [step] = (await ability('packages/plan-install', { package: session.kitPackage })).steps.slice(-1);
        status.textContent = text.addingKit.replace(':name', step.title);
        bar.style.width = '90%';
        await install(step);
      } catch (e) {
        // Said where it can be acted on: try again, or start without a kit.
        show('pick');
        pickError.textContent = text.kitFailed + ' ' + (e.message || '');
        document.getElementById('minimal').classList.remove('hidden');
        return;
      }
    }
    bar.style.width = '95%';
    status.textContent = text.finishing;
    await post('/install/finish').catch(() => {});
    window.location.href = session.redirect || '/admin';
  }
})();
</script>
</body>
</html>
