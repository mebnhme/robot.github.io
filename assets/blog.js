(function () {
  var S = window.Site;
  var E = S.esc;
  var db = S.db;

  var CAT = { tech: 'Technology', personal: 'Personal' };
  var COVER_ICON = '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>';
  var UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  var state = { posts: [], cat: 'all', session: null };

  function $(id) {
    return document.getElementById(id);
  }

  function card(p) {
    var top = p.cover_url && /^https:\/\//.test(p.cover_url) ? '<img src="' + E(p.cover_url) + '" alt="" loading="lazy"/>' : COVER_ICON;
    var guest = p.is_guest ? ' · Guest post by ' + E(p.author_name) : '';
    return (
      '<a class="blog-card" href="blog.html?post=' + encodeURIComponent(p.id) + '">' +
      '<div class="blog-top">' + top + '</div><div class="blog-body">' +
      '<div class="blog-tag">' + E(CAT[p.category] || p.category) + '</div>' +
      '<div class="blog-title">' + E(p.title) + '</div>' +
      '<div class="blog-text">' + E(S.excerpt(p.body, 170)) + '</div>' +
      '<div class="blog-meta">' + S.fmtDate(p.created_at) + guest + '</div></div></a>'
    );
  }

  function renderList() {
    var list = state.posts.filter(function (p) {
      return state.cat === 'all' || p.category === state.cat;
    });
    $('postGrid').innerHTML = list.length ? list.map(card).join('') : '<p class="empty">No posts here yet.</p>';
    document.querySelectorAll('#filters button').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-cat') === state.cat);
    });
  }

  function setupFilters() {
    $('filters').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      state.cat = b.getAttribute('data-cat');
      renderList();
    });
  }

  function showList() {
    $('postView').hidden = true;
    $('listView').hidden = false;
    document.title = 'Blog — Md Nyem Hasan Bhuiyan';
    renderList();
  }

  async function loadComments(postId) {
    var box = $('cmtList');
    if (!db || !UUID.test(postId)) {
      box.innerHTML = '<p class="cmt-empty">Comments are not available for this post.</p>';
      return;
    }
    var res = await db
      .from('comments')
      .select('id,author_name,avatar_url,body,created_at')
      .eq('post_id', postId)
      .eq('status', 'approved')
      .order('created_at', { ascending: true });
    if (res.error) {
      box.innerHTML = '<p class="cmt-empty">Comments could not be loaded.</p>';
      return;
    }
    if (!res.data.length) {
      box.innerHTML = '<p class="cmt-empty">No comments yet. Be the first to write one.</p>';
      return;
    }
    box.innerHTML = res.data
      .map(function (c) {
        var av = c.avatar_url && /^https:\/\//.test(c.avatar_url) ? '<img src="' + E(c.avatar_url) + '" alt="" loading="lazy"/>' : '<div class="avatar"></div>';
        return (
          '<div class="cmt">' + av + '<div><div class="cmt-head">' + E(c.author_name) + '<span>' + S.fmtDate(c.created_at) + '</span></div>' +
          '<div class="cmt-body">' + E(c.body) + '</div></div></div>'
        );
      })
      .join('');
  }

  function renderCommentForm(postId) {
    var wrap = $('cmtForm');
    if (!db) {
      wrap.innerHTML = '';
      return;
    }
    if (!state.session) {
      wrap.innerHTML =
        '<div class="cmt-form"><p class="cmt-who">Sign in with GitHub to leave a comment. Comments appear after they are approved. Please be respectful: bullying or abusive comments are removed.</p>' +
        '<button class="btn btn-cyan" id="cmtLogin" type="button">Sign in with GitHub</button></div>';
      $('cmtLogin').addEventListener('click', function () {
        sessionStorage.setItem('returnPost', postId);
        db.auth.signInWithOAuth({
          provider: 'github',
          options: { redirectTo: location.origin + location.pathname }
        });
      });
      return;
    }
    var meta = state.session.user.user_metadata || {};
    var who = meta.user_name || meta.name || 'GitHub user';
    wrap.innerHTML =
      '<div class="cmt-form"><div class="cmt-who">Commenting as <strong>' + E(who) + '</strong><button type="button" id="cmtOut">Sign out</button></div>' +
      '<textarea id="cmtText" maxlength="2000" placeholder="Write a comment…" aria-label="Comment"></textarea>' +
      '<button class="btn btn-cyan" id="cmtSend" type="button">Post comment</button>' +
      '<div class="form-status" id="cmtStatus" role="status"></div>' +
      '<p class="form-note" style="margin:8px 0 0">Comments appear after approval. Bullying or abusive comments are removed.</p></div>';

    $('cmtOut').addEventListener('click', async function () {
      await db.auth.signOut();
      state.session = null;
      renderCommentForm(postId);
    });
    $('cmtSend').addEventListener('click', async function () {
      var text = $('cmtText').value.trim();
      var st = $('cmtStatus');
      if (!text) {
        st.textContent = 'Please write something first.';
        st.className = 'form-status err';
        return;
      }
      $('cmtSend').disabled = true;
      st.textContent = 'Sending…';
      st.className = 'form-status';
      var res = await db.from('comments').insert({ post_id: postId, body: text });
      $('cmtSend').disabled = false;
      if (res.error) {
        st.textContent = 'Could not post the comment. Please try again later.';
        st.className = 'form-status err';
        return;
      }
      $('cmtText').value = '';
      st.textContent = 'Thank you. Your comment will appear after it is approved.';
      st.className = 'form-status ok';
    });
  }

  function showPost(p) {
    $('listView').hidden = true;
    var v = $('postView');
    v.hidden = false;
    document.title = p.title + ' — Md Nyem Hasan Bhuiyan';
    var guest = p.is_guest ? '<span class="guest-tag">Guest post by ' + E(p.author_name) + '</span>' : '';
    var cover = p.cover_url && /^https:\/\//.test(p.cover_url) ? '<img class="post-cover" src="' + E(p.cover_url) + '" alt=""/>' : '';
    v.innerHTML =
      '<a class="back-link" href="blog.html">← All posts</a>' +
      '<div class="blog-tag">' + E(CAT[p.category] || p.category) + '</div>' +
      '<h1 class="post-title">' + E(p.title) + '</h1>' +
      '<div class="post-meta">' + S.fmtDate(p.created_at) + guest + '</div>' + cover +
      '<div class="post-body">' + S.renderBody(p.body, !p.is_guest) + '</div>' +
      '<section class="comments" style="padding:32px 0 0"><h3>Comments</h3><div id="cmtList"><div class="loading" style="padding:10px 0">Loading…</div></div><div id="cmtForm"></div></section>';
    window.scrollTo(0, 0);
    loadComments(p.id);
    renderCommentForm(p.id);
  }

  function setupGuestForm() {
    var form = $('guestForm');
    var st = $('gStatus');
    function say(msg, cls) {
      st.textContent = msg;
      st.className = 'form-status' + (cls ? ' ' + cls : '');
    }
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var name = $('gName').value.trim();
      var email = $('gEmail').value.trim();
      var title = $('gTitle').value.trim();
      var body = $('gBody').value.trim();
      if (!name || !title || body.length < 20) {
        say('Please add your name, a title and at least a few sentences of text.', 'err');
        return;
      }
      if (email && !/^\S+@\S+\.\S+$/.test(email)) {
        say('That email address does not look right. You can also leave it empty.', 'err');
        return;
      }
      if ($('gWebsite').value) {
        say('Thank you. Your post was sent for approval.', 'ok');
        return;
      }
      if (!db) {
        say('Guest posts are not available yet.', 'err');
        return;
      }
      var last = Number(localStorage.getItem('lastGuestAt') || 0);
      if (Date.now() - last < 120000) {
        say('Please wait a couple of minutes before sending another post.', 'err');
        return;
      }
      $('gSend').disabled = true;
      say('Sending…');
      var res = await db.from('guest_posts').insert({ name: name, email: email || null, title: title, body: body });
      $('gSend').disabled = false;
      if (res.error) {
        say('Could not send the post. Please try again later.', 'err');
        return;
      }
      localStorage.setItem('lastGuestAt', String(Date.now()));
      form.reset();
      say('Thank you. Your post was sent and will appear after approval.', 'ok');
    });
  }

  async function init() {
    S.setupNav();
    S.trackVisit();
    $('year').textContent = new Date().getFullYear();
    setupFilters();
    setupGuestForm();

    if (db) {
      var sess = await db.auth.getSession();
      state.session = sess.data && sess.data.session;
    }

    var params = new URLSearchParams(location.search);
    var back = sessionStorage.getItem('returnPost');
    if (back && state.session) {
      sessionStorage.removeItem('returnPost');
      history.replaceState(null, '', 'blog.html?post=' + encodeURIComponent(back));
      params = new URLSearchParams(location.search);
    } else if (params.get('code')) {
      history.replaceState(null, '', 'blog.html');
      params = new URLSearchParams(location.search);
    }

    state.posts = await S.loadPosts();
    var id = params.get('post');
    var found = id
      ? state.posts.filter(function (p) {
          return String(p.id) === id;
        })[0]
      : null;
    if (found) showPost(found);
    else showList();
  }

  init();
})();
