(function () {
  var cfg = window.SITE_CONFIG || {};
  var configured = !!(cfg.supabaseUrl && cfg.supabaseKey && window.supabase);
  var db = configured
    ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, {
        auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: true }
      })
    : null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function parseDate(v) {
    if (!v) return null;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
    var d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(v);
    return isNaN(d) ? null : d;
  }

  function fmtDate(v) {
    var d = parseDate(v);
    if (!d) return esc(v || '');
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function linkHtml(url, text) {
    return '<a href="' + url + '" target="_blank" rel="noopener nofollow ugc">' + text + '</a>';
  }

  function inline(s, allowImages) {
    var st = [];
    function keep(h) {
      st.push(h);
      return '\u0000' + (st.length - 1) + '\u0000';
    }
    s = s.replace(/!\[([^\]]*)\]\((https:\/\/[^\s)]+)\)/g, function (m, alt, url) {
      return allowImages
        ? keep('<img src="' + url + '" alt="' + alt + '" loading="lazy">')
        : keep(linkHtml(url, alt || url));
    });
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, function (m, t, url) {
      return keep(linkHtml(url, t));
    });
    s = s.replace(/(https?:\/\/[^\s<]+)/g, function (m) {
      var tail = (/[.,!?;:]+$/.exec(m) || [''])[0];
      var url = tail ? m.slice(0, -tail.length) : m;
      return keep(linkHtml(url, url)) + tail;
    });
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>');
    return s.replace(/\u0000(\d+)\u0000/g, function (m, i) {
      return st[+i];
    });
  }

  // Small, safe formatter: every character is escaped first, then a few
  // patterns (## headings, - lists, **bold**, links, images) are turned into tags.
  function renderBody(text, allowImages) {
    var clean = esc(String(text || '').replace(/\u0000/g, '').replace(/\r/g, ''));
    return clean
      .split(/\n{2,}/)
      .map(function (block) {
        var b = block.trim();
        if (!b) return '';
        var lines = b.split('\n');
        if (lines.length === 1 && /^#{2,3} /.test(b)) {
          var lvl = b.indexOf('### ') === 0 ? 4 : 3;
          return '<h' + lvl + '>' + inline(b.replace(/^#{2,3} /, ''), allowImages) + '</h' + lvl + '>';
        }
        if (
          lines.every(function (l) {
            return /^- /.test(l);
          })
        ) {
          return (
            '<ul>' +
            lines
              .map(function (l) {
                return '<li>' + inline(l.slice(2), allowImages) + '</li>';
              })
              .join('') +
            '</ul>'
          );
        }
        return (
          '<p>' +
          lines
            .map(function (l) {
              return inline(l, allowImages);
            })
            .join('<br>') +
          '</p>'
        );
      })
      .join('');
  }

  function excerpt(text, n) {
    var t = String(text || '')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[#*`>-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    return t.length > n ? t.slice(0, n).replace(/\s+\S*$/, '') + '…' : t;
  }

  var contentPromise = null;
  function loadContent() {
    if (contentPromise) return contentPromise;
    contentPromise = (async function () {
      var out = {};
      var fallback = {};
      try {
        var r = await fetch('data/content.json', { cache: 'no-cache' });
        if (r.ok) fallback = await r.json();
      } catch (e) {}
      if (db) {
        try {
          var res = await db.from('site_content').select('key,value');
          if (res.data) {
            res.data.forEach(function (row) {
              out[row.key] = row.value;
            });
          }
        } catch (e) {}
      }
      Object.keys(fallback).forEach(function (k) {
        if (out[k] === undefined) out[k] = fallback[k];
      });
      return out;
    })();
    return contentPromise;
  }

  async function loadPosts() {
    if (db) {
      try {
        var res = await db
          .from('posts')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });
        if (!res.error && res.data) return res.data;
      } catch (e) {}
    }
    var c = await loadContent();
    return (c.posts || [])
      .filter(function (p) {
        return p.published !== false;
      })
      .sort(function (a, b) {
        return String(b.created_at).localeCompare(String(a.created_at));
      });
  }

  function trackVisit() {
    if (!db) return;
    try {
      if (localStorage.getItem('no_track')) return;
      if (/bot|crawl|spider|headless|preview/i.test(navigator.userAgent) || navigator.webdriver) return;
      var path = location.pathname;
      var seenKey = 'seen:' + path;
      if (sessionStorage.getItem(seenKey)) return;
      sessionStorage.setItem(seenKey, '1');

      function id() {
        return window.crypto && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Math.random()).slice(2) + String(Date.now());
      }
      var vid = localStorage.getItem('vid');
      if (!vid) {
        vid = id();
        localStorage.setItem('vid', vid);
      }
      var sid = sessionStorage.getItem('sid');
      if (!sid) {
        sid = id();
        sessionStorage.setItem('sid', sid);
      }
      var ref = '';
      try {
        if (document.referrer) {
          var u = new URL(document.referrer);
          if (u.hostname !== location.hostname) ref = u.hostname;
        }
      } catch (e) {}
      db.from('visits')
        .insert({
          vid: vid,
          sid: sid,
          path: path,
          referrer: ref,
          lang: navigator.language || '',
          tz: (Intl.DateTimeFormat().resolvedOptions().timeZone || '').slice(0, 60),
          device: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
        })
        .then(function () {}, function () {});
    } catch (e) {}
  }

  function setupNav() {
    var nav = document.getElementById('navLinks');
    var btn = document.getElementById('menuBtn');
    if (btn && nav) {
      btn.addEventListener('click', function () {
        nav.classList.toggle('open');
      });
      nav.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') nav.classList.remove('open');
      });
    }
  }

  function observeFades() {
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('visible');
            obs.unobserve(en.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    document.querySelectorAll('.fade-up:not(.visible)').forEach(function (el) {
      obs.observe(el);
    });
  }

  window.Site = {
    cfg: cfg,
    db: db,
    configured: configured,
    esc: esc,
    fmtDate: fmtDate,
    renderBody: renderBody,
    excerpt: excerpt,
    loadContent: loadContent,
    loadPosts: loadPosts,
    trackVisit: trackVisit,
    setupNav: setupNav,
    observeFades: observeFades
  };
})();
