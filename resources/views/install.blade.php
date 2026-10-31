<!doctype html>
<html lang="{{ $locale }}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="csrf-token" content="{{ csrf_token() }}">
<title>{{ $text['title'] }}</title>
<style>
:root{color-scheme:light dark;--bg:#fff;--surface:#fafaf8;--sunken:#f6f5f2;--border:#e8e6e1;--border-strong:#d6d4cd;--ink:#17160f;--text:#26251e;--muted:#6f6d65;--faint:#6f6d65;--signal:#ffe100;--focus:#17160f;--success:#3f8f5b;--danger:#c0352b}
@media (prefers-color-scheme:dark){:root{--bg:#1c1c18;--surface:#21211c;--sunken:#141411;--border:#2c2b26;--border-strong:#3a3932;--ink:#f4f3ee;--text:#e8e7e1;--muted:#a09e94;--faint:#a09e94;--signal:#ffe100;--focus:#f4f3ee;--success:#6cc08a;--danger:#ef7a6f}}
*{box-sizing:border-box}html,body{margin:0;background:var(--sunken);color:var(--text);font:13px/1.45 "Geist",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
main{max-width:520px;margin:0 auto;padding:56px 16px}
.brand{display:flex;align-items:center;gap:10px;margin-bottom:28px;font-weight:600;font-size:14px;letter-spacing:-.01em}
.mark{width:22px;height:22px;border-radius:6px}
h1{font-size:24px;letter-spacing:-.02em;margin:0 0 28px;font-weight:600;color:var(--ink)}
section{background:var(--bg);border:1px solid var(--border);border-radius:16px;padding:24px;margin-bottom:12px}
h2{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:0 0 14px;font-weight:600}
label{display:block;font-weight:500;margin:0 0 6px}
.field{margin-bottom:14px}.field:last-child{margin-bottom:0}
.row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
input,select{width:100%;height:32px;padding:0 10px;border:1px solid var(--border-strong);border-radius:6px;background:var(--bg);color:var(--text);font:inherit;outline:none;transition:border-color .12s,box-shadow .12s}
input:focus,select:focus{border-color:var(--focus);box-shadow:0 0 0 3px color-mix(in srgb,var(--focus) 22%,transparent)}
.help{color:var(--faint);font-size:12px;margin-top:4px}
.checks{list-style:none;margin:0;padding:0;display:grid;gap:6px}
.checks li{display:flex;justify-content:space-between;gap:12px;min-width:0}
.checks .label{flex:none}
.checks .detail{flex:1;min-width:0;text-align:right;color:var(--faint);font-family:ui-monospace,"Geist Mono",monospace;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dot{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:8px;background:var(--success)}.bad .dot{background:var(--danger)}
button{height:40px;width:100%;border:0;border-radius:6px;background:var(--ink);color:var(--bg);font:inherit;font-weight:600;font-size:14px;cursor:pointer;transition:opacity .12s}
button:disabled{opacity:.5;cursor:progress}
.error{display:none;margin:0 0 12px;padding:10px 12px;border-radius:6px;border:1px solid color-mix(in srgb,var(--danger) 35%,transparent);background:color-mix(in srgb,var(--danger) 8%,transparent);color:var(--danger)}
.hidden{display:none}
.lead{color:var(--muted);font-size:14px;margin:-20px 0 24px}
.pick{list-style:none;margin:0;padding:0;display:grid;gap:2px}
.pick label{display:grid;grid-template-columns:18px 1fr;gap:12px;align-items:start;margin:0;padding:10px;border-radius:10px;font-weight:400;cursor:pointer}
.pick label:hover{background:var(--sunken)}
.pick input{width:16px;height:16px;margin:2px 0 0;accent-color:var(--ink)}
.pick strong{display:block;font-weight:500;color:var(--ink)}
.pick small{display:block;color:var(--muted);font-size:12.5px}
.pick .badge{display:inline-block;margin-left:6px;padding:0 6px;border-radius:99px;background:var(--sunken);color:var(--muted);font-size:11px;font-weight:500}
.track{height:6px;border-radius:99px;background:var(--sunken);overflow:hidden}
.bar{height:100%;width:0;border-radius:99px;background:var(--signal);transition:width .3s ease}
.status{margin:10px 0 0;color:var(--muted);font-size:13px;min-height:19px}
.secondary{margin-top:8px;background:transparent;color:var(--muted);height:36px;font-weight:500;font-size:13px}
@media (prefers-reduced-motion:reduce){.bar{transition:none}}
</style>
</head>
<body>
<main>
  <div class="brand"><img class="mark" src="{{ \Cms\Support\Brand::asset('mark.svg') }}" alt="" width="22" height="22">{{ \Cms\Support\Brand::get() }}</div>
  <h1>{{ $text['heading'] }}</h1>

  @php($ok = collect($requirements)->every('ok'))
  <section id="requirements">
    <h2>{{ $text['requirements'] }}</h2>
    <ul class="checks">
      @foreach ($requirements as $check)
        <li class="{{ $check['ok'] ? '' : 'bad' }}"><span class="label"><span class="dot"></span>{{ $check['label'] }}</span><span class="detail" title="{{ $check['detail'] }}">{{ $check['detail'] }}</span></li>
      @endforeach
    </ul>
  </section>

  <form id="install" @if(! $ok) class="hidden" @endif>
    <section>
      <h2>{{ $text['site'] }}</h2>
      <div class="field"><label for="site_name">{{ $text['siteName'] }}</label><input id="site_name" name="site_name" required maxlength="120" autocomplete="off" placeholder="Acme Studio"></div>
      <div class="field"><label for="site_url">{{ $text['siteUrl'] }}</label><input id="site_url" name="site_url" type="url" required value="{{ $url }}"></div>
    </section>

    <section>
      <h2>{{ $text['database'] }}</h2>
      <div class="field">
        <label for="db_driver">{{ $text['database'] }}</label>
        <select id="db_driver" name="db_driver">
          @if (in_array('mysql', $drivers)) <option value="mysql">MySQL / MariaDB</option> @endif
          @if (in_array('sqlite', $drivers)) <option value="sqlite">{{ $text['sqlite'] }}</option> @endif
          @if (in_array('pgsql', $drivers)) <option value="pgsql">PostgreSQL</option> @endif
        </select>
      </div>
      <div id="db-server">
        <div class="row">
          <div class="field"><label for="db_host">{{ $text['host'] }}</label><input id="db_host" name="db_host" value="{{ env('DB_HOST', '127.0.0.1') }}"></div>
          <div class="field"><label for="db_port">{{ $text['port'] }}</label><input id="db_port" name="db_port" value="{{ env('DB_PORT', '3306') }}" inputmode="numeric"></div>
        </div>
        <div class="field"><label for="db_database">{{ $text['databaseName'] }}</label><input id="db_database" name="db_database" autocomplete="off"></div>
        <div class="row">
          <div class="field"><label for="db_username">{{ $text['username'] }}</label><input id="db_username" name="db_username" autocomplete="off"></div>
          <div class="field"><label for="db_password">{{ $text['password'] }}</label><input id="db_password" name="db_password" type="password" autocomplete="new-password"></div>
        </div>
        <div class="field"><label for="db_prefix">{{ $text['prefix'] }}</label><input id="db_prefix" name="db_prefix" placeholder="{{ $text['prefixPlaceholder'] }}" pattern="[a-z0-9_]*"><div class="help">{{ $text['prefixHelp'] }}</div></div>
      </div>
    </section>

    <section>
      <h2>{{ $text['account'] }}</h2>
      <div class="field"><label for="name">{{ $text['name'] }}</label><input id="name" name="name" required autocomplete="name"></div>
      <div class="field"><label for="email">{{ $text['email'] }}</label><input id="email" name="email" type="email" required autocomplete="email"></div>
      <div class="field"><label for="password">{{ $text['password'] }}</label><input id="password" name="password" type="password" required minlength="10" autocomplete="new-password"><div class="help">{{ $text['passwordHelp'] }}</div></div>
      @if ($needsToken)
        <div class="field"><label for="install_token">{{ $text['token'] }}</label><input id="install_token" name="install_token" required autocomplete="off"><div class="help">{{ $text['tokenHelp'] }}</div></div>
      @endif
    </section>

    <p class="error" id="error" role="alert"></p>
    <button type="submit" id="submit">{{ $text['install'] }}</button>
  </form>

  <div id="pick" class="hidden">
    <section>
      <h2>{{ $text['add'] }}</h2>
      <ul class="pick" id="packages"></ul>
    </section>
    <p class="error" id="pick-error" role="alert"></p>
    <button type="button" id="add">{{ $text['addButton'] }}</button>
    <button type="button" id="skip" class="secondary">{{ $text['skip'] }}</button>
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

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.style.display = 'none';
    submit.disabled = true; submit.textContent = text.installing;
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
        const details = json.errors ? Object.values(json.errors).flat().join(' ') : '';
        throw new Error(details || message);
      }
      await choose(json);
    } catch (e) {
      error.textContent = e.message; error.style.display = 'block';
      submit.disabled = false; submit.textContent = text.install;
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

  async function choose(json) {
    session = json;
    show('pick');
    const list = document.getElementById('packages');
    if (session.composer) {
      pickError.textContent = text.composerSite; pickError.style.display = 'block';
      document.getElementById('add').classList.add('hidden');
      document.getElementById('skip').textContent = text.continue;
      return;
    }
    const catalog = await ability('packages/catalog', { refresh: true }).catch(() => ({ items: [] }));
    const items = (catalog.items || []).filter((item) => !item.installed);
    if (!items.length) {
      pickError.textContent = text.noStore; pickError.style.display = 'block';
      document.getElementById('add').classList.add('hidden');
      return;
    }
    const rank = (item) => (session.recommended.includes(item.package) ? 0 : item.pricing === 'free' ? 1 : 2);
    items.sort((a, b) => rank(a) - rank(b) || session.recommended.indexOf(a.package) - session.recommended.indexOf(b.package) || a.title.localeCompare(b.title));
    for (const item of items) {
      const row = document.createElement('li');
      const label = document.createElement('label');
      const box = Object.assign(document.createElement('input'), { type: 'checkbox', value: item.package, checked: session.recommended.includes(item.package) });
      const words = document.createElement('span');
      const title = Object.assign(document.createElement('strong'), { textContent: item.title });
      if (item.pricing !== 'free') title.append(Object.assign(document.createElement('span'), { className: 'badge', textContent: text.paid }));
      words.append(title, Object.assign(document.createElement('small'), { textContent: item.summary }));
      label.append(box, words);
      row.append(label);
      list.append(row);
    }
  }

  document.getElementById('skip').addEventListener('click', () => finish());
  document.getElementById('add').addEventListener('click', async () => {
    const chosen = [...document.querySelectorAll('#packages input:checked')].map((box) => box.value);
    pickError.style.display = 'none';
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
          let job = await ability('packages/install', { package: step.package, version: step.version });
          while (job.state === 'running') job = await ability('packages/job-step', { id: job.id });
          if (job.state === 'failed') throw new Error(job.error || text.failed);
        }
        done++;
      }
      await finish();
    } catch (e) {
      show('pick');
      pickError.textContent = e.message; pickError.style.display = 'block';
    }
  });

  async function finish() {
    show('working');
    bar.style.width = '95%';
    status.textContent = text.finishing;
    await post('/install/finish').catch(() => {});
    window.location.href = session.redirect || '/admin';
  }
})();
</script>
</body>
</html>
