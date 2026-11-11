<!doctype html>
<html lang="{{ $locale }}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>{{ $text['title'] }}</title>
{{-- The admin's tokens, typeface, radii and buttons: this is the admin asking, and it looks like it. --}}
<style>{!! \Cms\Admin\StandaloneStyle::css() !!}</style>
</head>
<body>
<main class="page">
  <div class="brand"><img src="{{ \Cms\Support\Brand::asset('mark.svg') }}" alt="" width="24" height="24">{{ $text['site'] }}</div>
  <h1>{{ $text['heading'] }}</h1>
  {{-- What is being decided, as facts: which app, where its answer goes, and whose access it gets. --}}
  <dl class="facts">
    @foreach ($text['facts'] as $name => $value)
      <div><dt>{{ $name }}</dt><dd>{{ $value }}</dd></div>
    @endforeach
  </dl>
  <form method="post" action="/oauth/authorize">
    @csrf
    @foreach (['response_type', 'client_id', 'redirect_uri', 'code_challenge', 'code_challenge_method', 'state', 'scope', 'resource'] as $key)
      <input type="hidden" name="{{ $key }}" value="{{ $params[$key] }}">
    @endforeach
    <ul class="options">
      <li><label><input type="radio" name="access" value="full" checked><span><strong>{{ $text['full'] }}</strong><small>{{ $text['fullHint'] }}</small></span></label></li>
      <li><label><input type="radio" name="access" value="read"><span><strong>{{ $text['read'] }}</strong><small>{{ $text['readHint'] }}</small></span></label></li>
    </ul>
    <div class="actions">
      <button type="submit" name="decision" value="deny">{{ $text['cancel'] }}</button>
      <button type="submit" name="decision" value="approve" class="primary">{{ $text['connect'] }}</button>
    </div>
  </form>
</main>
</body>
</html>
