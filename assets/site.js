(function () {
  var S = window.Site;
  var E = S.esc;

  function $(id) {
    return document.getElementById(id);
  }
  function arr(v) {
    return Array.isArray(v) ? v : [];
  }
  function safeUrl(u) {
    return /^(https?:|mailto:)/i.test(u || '') ? u : '';
  }
  function ext(url) {
    return safeUrl(url);
  }

  var STATUS = {
    published: 'Published',
    accepted: 'Accepted',
    under_review: 'Under Review',
    submitted: 'Submitted',
    in_preparation: 'In Preparation'
  };

  var ICONS = {
    linkedin: '<path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>',
    scholar: '<path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>',
    github: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/>',
    mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    phone: '<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72c.128.96.341 1.902.62 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.28 1.849.493 2.81.62A2 2 0 0122 14.92z"/>',
    pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>'
  };
  var EDU_ICONS = {
    cap: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
    book: '<path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>',
    home: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'
  };

  function svg(path) {
    return '<svg viewBox="0 0 24 24">' + path + '</svg>';
  }

  function lis(points) {
    return arr(points)
      .map(function (p) {
        return '<li>' + E(p) + '</li>';
      })
      .join('');
  }

  function heroName(name) {
    var w = String(name || '').split(/\s+/).filter(Boolean);
    if (w.length < 3) return E(name);
    var first = w.slice(0, -2).join(' ');
    return E(first) + '<br/><span>' + E(w[w.length - 2]) + '</span> ' + E(w[w.length - 1]);
  }

  function renderHero(p) {
    p = p || {};
    var social = '';
    if (safeUrl(p.linkedin)) social += '<a href="' + E(p.linkedin) + '" class="soc-btn" title="LinkedIn" target="_blank" rel="noopener">' + svg(ICONS.linkedin) + '</a>';
    if (safeUrl(p.scholar)) social += '<a href="' + E(p.scholar) + '" class="soc-btn" title="Google Scholar" target="_blank" rel="noopener">' + svg(ICONS.scholar) + '</a>';
    if (safeUrl(p.github)) social += '<a href="' + E(p.github) + '" class="soc-btn" title="GitHub" target="_blank" rel="noopener">' + svg(ICONS.github) + '</a>';
    if (p.email) social += '<a href="mailto:' + E(p.email) + '" class="soc-btn" title="Email">' + svg(ICONS.mail) + '</a>';

    var contact = '';
    if (p.email) contact += '<a href="mailto:' + E(p.email) + '">' + E(p.email) + '</a><br/>';
    if (p.phone) contact += E(p.phone) + '<br/>';
    if (p.address) contact += E(p.address);

    var bio = arr(p.bio)
      .map(function (t) {
        return '<p class="hero-bio">' + E(t) + '</p>';
      })
      .join('');
    var tags = arr(p.tags)
      .map(function (t) {
        return '<span class="htag">' + E(t) + '</span>';
      })
      .join('');

    $('heroMount').innerHTML =
      '<div class="profile-card fade-up">' +
      '<div class="profile-img-wrap"><img src="' + E(p.photo || 'ProfilePhoto.jpg') + '" alt="' + E(p.name) + '"/></div>' +
      '<div class="profile-name">' + E(p.name) + '</div>' +
      '<div class="profile-title">' + E(p.title) + '</div>' +
      '<div class="profile-location">' + E(p.location) + '</div>' +
      (p.badge ? '<div class="open-badge">' + E(p.badge) + '</div>' : '') +
      '<div class="profile-social">' + social + '</div>' +
      '<div class="profile-contact">' + contact + '</div>' +
      '</div>' +
      '<div class="fade-up">' +
      '<div class="hero-eyebrow">' + E(p.eyebrow) + '</div>' +
      '<h1 class="hero-name">' + heroName(p.name) + '</h1>' +
      bio +
      '<div class="hero-tags">' + tags + '</div>' +
      '<div class="hero-btns">' +
      (safeUrl(p.cv_url) ? '<a href="' + E(p.cv_url) + '" class="btn btn-cyan" target="_blank" rel="noopener">CV</a>' : '') +
      '<a href="#contact" class="btn btn-ghost">Get in Touch</a>' +
      '</div></div>';

    $('navName').textContent = p.short_name || p.name || '';
    $('footName').textContent = p.name || '';
    $('footNote').textContent = (p.footer_note ? p.footer_note + ' · ' : '') + new Date().getFullYear();
    if (p.name) document.title = p.name + ' — ' + (p.title || '');

    var info = '<p class="contact-intro">' + E(p.contact_intro) + '</p>';
    function item(icon, inner) {
      return '<div class="contact-item"><div class="c-icon">' + svg(icon) + '</div><div class="c-text">' + inner + '</div></div>';
    }
    if (p.email) info += item(ICONS.mail, '<a href="mailto:' + E(p.email) + '">' + E(p.email) + '</a>');
    if (p.phone) info += item(ICONS.phone, E(p.phone));
    if (p.address) info += item(ICONS.pin, E(p.address));
    if (safeUrl(p.github)) info += item(ICONS.github, '<a href="' + E(p.github) + '" target="_blank" rel="noopener">' + E(p.github.replace(/^https?:\/\//, '')) + '</a>');
    $('contactInfo').innerHTML = info;
  }

  function renderNews(items) {
    items = arr(items);
    var sec = $('news');
    if (!items.length) {
      sec.hidden = true;
      document.querySelectorAll('[data-section="news"]').forEach(function (a) {
        a.hidden = true;
      });
      return;
    }
    sec.hidden = false;
    document.querySelectorAll('[data-section="news"]').forEach(function (a) {
      a.hidden = false;
    });
    $('newsMount').innerHTML = items
      .slice(0, 8)
      .map(function (n) {
        var link = ext(n.link) ? '<a href="' + E(n.link) + '" target="_blank" rel="noopener">' + E(n.link_label || 'Read more') + '</a>' : '';
        return '<div class="news-item fade-up"><div class="news-date">' + S.fmtDate(n.date) + '</div><div class="news-text">' + E(n.text) + link + '</div></div>';
      })
      .join('');
  }

  function renderResearch(items) {
    $('researchMount').innerHTML = arr(items)
      .map(function (r) {
        var sup = r.supervisor_url && ext(r.supervisor_url)
          ? '<a href="' + E(r.supervisor_url) + '" target="_blank" rel="noopener">' + E(r.supervisor) + '</a>'
          : E(r.supervisor);
        var cert = ext(r.cert_url) ? '<a class="cert-link" href="' + E(r.cert_url) + '" target="_blank" rel="noopener">View Certificate ↗</a>' : '';
        return (
          '<div class="res-card fade-up"><div class="res-period">' + E(r.period) + '</div>' +
          '<div class="res-role">' + E(r.role) + '</div>' +
          '<div class="res-topic">' + E(r.topic) + '</div>' +
          '<div class="res-supervisor">' + sup + '</div>' +
          '<ul class="res-points">' + lis(r.points) + '</ul>' + cert + '</div>'
        );
      })
      .join('');
  }

  function renderInterests(items) {
    $('interestsMount').innerHTML = arr(items)
      .map(function (i) {
        return '<div class="int-card fade-up"><div class="int-icon">' + E(i.icon) + '</div><div class="int-name">' + E(i.name) + '</div></div>';
      })
      .join('');
  }

  function renderPubs(items) {
    $('pubsMount').innerHTML = arr(items)
      .map(function (p, i) {
        var tag = p.index_tag ? ' <span class="idx">' + E(p.index_tag) + '</span>' : '';
        var pub = p.publisher ? ' · Publisher: ' + E(p.publisher) : '';
        var venue = p.venue || tag || pub ? '<div class="pub-venue">' + E(p.venue) + tag + pub + '</div>' : '';
        var link = '';
        if (p.doi) {
          var doi = String(p.doi).replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');
          link = '<a href="https://doi.org/' + E(doi) + '" class="pub-doi" target="_blank" rel="noopener">DOI: ' + E(doi) + ' ↗</a>';
        } else if (ext(p.proof_url)) {
          link = '<a href="' + E(p.proof_url) + '" class="pub-doi" target="_blank" rel="noopener">Submission Proof ↗</a>';
        }
        var st = STATUS[p.status] ? p.status : 'submitted';
        return (
          '<div class="pub-card fade-up"><div class="pub-num">' + (i + 1) + '</div><div>' +
          '<div class="pub-title">' + E(p.title) + '</div>' +
          '<div class="pub-authors">' + E(p.authors) + '</div>' + venue + link +
          '</div><span class="pub-status s-' + st + '">' + STATUS[st] + '</span></div>'
        );
      })
      .join('');
  }

  function renderSkills(groups) {
    $('skillsMount').innerHTML = arr(groups)
      .map(function (g) {
        var pills = arr(g.items)
          .map(function (it) {
            var core = it.charAt(0) === '*';
            return '<span class="skill-pill' + (core ? ' core' : '') + '">' + E(core ? it.slice(1).trim() : it) + '</span>';
          })
          .join('');
        return '<div class="skill-group fade-up"><div class="skill-group-title">' + E(g.title) + '</div><div class="skill-pills">' + pills + '</div></div>';
      })
      .join('');
  }

  function renderExperience(items) {
    $('experienceMount').innerHTML = arr(items)
      .map(function (x, i) {
        var tags = arr(x.tags)
          .map(function (t) {
            return '<span class="tl-tag">' + E(t) + '</span>';
          })
          .join('');
        var card =
          '<div class="tl-card"><div class="tl-period">' + E(x.period) + '</div>' +
          '<div class="tl-role">' + E(x.role) + '</div>' +
          '<div class="tl-company">' + E(x.company) + '</div>' +
          '<ul class="tl-points">' + lis(x.points) + '</ul>' +
          (tags ? '<div class="tl-tags">' + tags + '</div>' : '') + '</div>';
        var dot = '<div class="tl-center" style="position:relative;"><div class="tl-dot"></div></div>';
        var gap = '<div class="tl-spacer"></div>';
        return '<div class="tl-item fade-up">' + (i % 2 === 0 ? card + dot + gap : gap + dot + card) + '</div>';
      })
      .join('');
  }

  function renderEducation(items) {
    $('educationMount').innerHTML = arr(items)
      .map(function (e) {
        return (
          '<div class="edu-card fade-up"><div class="edu-icon">' + svg(EDU_ICONS[e.icon] || EDU_ICONS.cap) + '</div><div>' +
          '<div class="edu-degree">' + E(e.degree) + '</div>' +
          '<div class="edu-school">' + E(e.school) + '</div>' +
          '<div class="edu-period">' + E(e.period) + '</div>' +
          (e.cgpa ? '<div class="edu-cgpa">' + E(e.cgpa) + '</div>' : '') +
          (e.thesis ? '<div class="edu-thesis">' + E(e.thesis) + '</div>' : '') +
          '</div></div>'
        );
      })
      .join('');
  }

  function renderTraining(items) {
    $('trainingMount').innerHTML = arr(items)
      .map(function (t) {
        var cert = ext(t.cert_url) ? '<a class="cert-link" href="' + E(t.cert_url) + '" target="_blank" rel="noopener">View Certificate ↗</a>' : '';
        return (
          '<div class="train-card fade-up"><div class="train-year">' + E(t.year) + '</div><div>' +
          '<div class="train-title">' + E(t.title) + '</div>' +
          '<div class="train-org">' + E(t.org) + '</div>' +
          '<div class="train-period">' + E(t.period) + '</div>' +
          '<ul class="train-points">' + lis(t.points) + '</ul>' + cert + '</div></div>'
        );
      })
      .join('');
  }

  var CAT = { tech: 'Technology', personal: 'Personal' };
  var COVER_ICON = '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>';

  function renderBlog(posts) {
    var mount = $('blogMount');
    var list = arr(posts).slice(0, 4);
    if (!list.length) {
      mount.innerHTML = '<p class="empty">No posts yet.</p>';
      return;
    }
    mount.innerHTML = list
      .map(function (p) {
        var top = p.cover_url && /^https:\/\//.test(p.cover_url) ? '<img src="' + E(p.cover_url) + '" alt="" loading="lazy"/>' : COVER_ICON;
        return (
          '<a class="blog-card fade-up" href="blog.html?post=' + encodeURIComponent(p.id) + '">' +
          '<div class="blog-top">' + top + '</div><div class="blog-body">' +
          '<div class="blog-tag">' + E(CAT[p.category] || p.category) + '</div>' +
          '<div class="blog-title">' + E(p.title) + '</div>' +
          '<div class="blog-text">' + E(S.excerpt(p.body, 150)) + '</div>' +
          '<div class="blog-meta">' + S.fmtDate(p.created_at) + '</div></div></a>'
        );
      })
      .join('');
  }

  function setupContactForm() {
    var form = $('contactForm');
    var status = $('cStatus');
    var btn = $('cSend');
    function say(msg, cls) {
      status.textContent = msg;
      status.className = 'form-status' + (cls ? ' ' + cls : '');
    }
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var name = $('cName').value.trim();
      var email = $('cEmail').value.trim();
      var message = $('cMsg').value.trim();
      if (!name || !/^\S+@\S+\.\S+$/.test(email) || !message) {
        say('Please fill in your name, a valid email and a message.', 'err');
        return;
      }
      if ($('cWebsite').value) {
        say('Thank you, your message was sent.', 'ok');
        return;
      }
      if (!S.db) {
        window.location.href = 'mailto:' + (window.__contactEmail || '') + '?subject=' + encodeURIComponent('Message from ' + name) + '&body=' + encodeURIComponent(message + '\n\n' + name + ' (' + email + ')');
        return;
      }
      var last = Number(localStorage.getItem('lastMsgAt') || 0);
      if (Date.now() - last < 60000) {
        say('Please wait a minute before sending another message.', 'err');
        return;
      }
      btn.disabled = true;
      say('Sending…');
      var res = await S.db.from('messages').insert({ name: name, email: email, message: message });
      btn.disabled = false;
      if (res.error) {
        say('Could not send the message. Please email me directly instead.', 'err');
        return;
      }
      localStorage.setItem('lastMsgAt', String(Date.now()));
      form.reset();
      say('Thank you, your message was sent.', 'ok');
    });
  }

  function setupScrollSpy() {
    var links = document.querySelectorAll('.nav-links a');
    function update() {
      var cur = 'about';
      document.querySelectorAll('.hero[id], section[id]').forEach(function (s) {
        if (!s.hidden && window.scrollY >= s.offsetTop - 90) cur = s.id;
      });
      links.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
      });
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  async function init() {
    S.setupNav();
    S.trackVisit();
    setupContactForm();

    var results = await Promise.all([S.loadContent(), S.loadPosts()]);
    var c = results[0];
    var posts = results[1];

    window.__contactEmail = (c.profile && c.profile.email) || '';
    renderHero(c.profile);
    renderNews(c.news);
    renderResearch(c.research);
    renderInterests(c.interests);
    renderPubs(c.publications);
    renderSkills(c.skills);
    renderExperience(c.experience);
    renderEducation(c.education);
    renderTraining(c.training);
    renderBlog(posts);

    S.observeFades();
    setupScrollSpy();
    if (location.hash) {
      var t = document.getElementById(location.hash.slice(1));
      if (t) t.scrollIntoView();
    }
  }

  init();
})();
