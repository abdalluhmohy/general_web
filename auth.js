/* Gold Nile - Auth v1.0.0 */
(function(){
  'use strict';

  var GN = window.GN = window.GN || {};

  /* ============================================================
     Supabase client init
     ============================================================ */
  var cfg = window.GN_CONFIG || {};
  var supa = null;

  if (window.supabase && cfg.SUPABASE_URL && cfg.SUPABASE_KEY) {
    try {
      supa = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_KEY);
    } catch (e) {
      console.error('[auth] Supabase init failed:', e);
    }
  } else {
    console.warn('[auth] Supabase not configured');
  }

  GN.supa = supa;

  /* ============================================================
     State
     ============================================================ */
  GN.session = {
    user: null,
    profile: null,
    isOwner: false,
    isAdmin: false,
    isLogged: false
  };

  /* ============================================================
     Profile fetch
     ============================================================ */
  GN.fetchProfile = function(userId){
    if (!supa || !userId) return Promise.resolve(null);
    return supa
      .from('profiles')
      .select('id,auth_user_id,email,full_name,phone,role,status,login_count,last_login,created_at')
      .eq('auth_user_id', userId)
      .maybeSingle()
      .then(function(res){
        if (res.error) { console.error('[auth] fetchProfile:', res.error); return null; }
        return res.data || null;
      });
  };

  /* ============================================================
     Login
     ============================================================ */
  GN.login = function(email, password){
    if (!supa) {
      return Promise.resolve({ ok: false, error: 'Supabase not initialized' });
    }
    if (!email || !password) {
      return Promise.resolve({ ok: false, error: 'MISSING_CREDENTIALS' });
    }
    return supa.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password
    }).then(function(res){
      if (res.error) {
        return { ok: false, error: res.error.message || 'INVALID_CREDENTIALS' };
      }
      var user = res.data.user;
      return GN.fetchProfile(user.id).then(function(profile){
        if (!profile) {
          return supa.auth.signOut().then(function(){
            return { ok: false, error: 'NO_PROFILE' };
          });
        }
        if (profile.status === 'pending') {
          return supa.auth.signOut().then(function(){
            return { ok: false, error: 'PENDING' };
          });
        }
        if (profile.status !== 'allowed') {
          return supa.auth.signOut().then(function(){
            return { ok: false, error: 'BLOCKED' };
          });
        }
        /* Update login count + last_login */
        var updates = {
          login_count: (profile.login_count || 0) + 1,
          last_login: new Date().toISOString()
        };
        supa.from('profiles')
          .update(updates)
          .eq('auth_user_id', user.id)
          .then(function(){ /* silent */ });

        /* Save session */
        GN.session.user = user;
        GN.session.profile = profile;
        GN.session.isOwner = profile.role === 'owner';
        GN.session.isAdmin = false;
        GN.session.isLogged = true;

        return { ok: true, profile: profile };
      });
    }).catch(function(err){
      console.error('[auth] login error:', err);
      return { ok: false, error: 'NETWORK' };
    });
  };

  /* ============================================================
     Logout
     ============================================================ */
  GN.logout = function(){
    if (!supa) return Promise.resolve();
    return supa.auth.signOut().then(function(){
      GN.session.user = null;
      GN.session.profile = null;
      GN.session.isOwner = false;
      GN.session.isAdmin = false;
      GN.session.isLogged = false;
      GN.ls.set((window.GN_CONFIG && window.GN_CONFIG.STORAGE && window.GN_CONFIG.STORAGE.ADMIN_MODE) || 'gn_admin_mode', false);
    });
  };

  /* ============================================================
     Bootstrap - restore session on page load
     ============================================================ */
  GN.bootstrapAuth = function(){
    if (!supa) return Promise.resolve({ ok: false, error: 'NO_SUPABASE' });

    return supa.auth.getSession().then(function(res){
      var session = res.data && res.data.session;
      if (!session) return { ok: false, error: 'NO_SESSION' };

      return GN.fetchProfile(session.user.id).then(function(profile){
        if (!profile || profile.status !== 'allowed') {
          return supa.auth.signOut().then(function(){
            return { ok: false, error: 'INVALID_PROFILE' };
          });
        }

        GN.session.user = session.user;
        GN.session.profile = profile;
        GN.session.isOwner = profile.role === 'owner';
        GN.session.isAdmin = false;
        GN.session.isLogged = true;

        return { ok: true, profile: profile };
      });
    }).catch(function(err){
      console.error('[auth] bootstrap error:', err);
      return { ok: false, error: 'NETWORK' };
    });
  };

  /* ============================================================
     Admin mode toggle
     ============================================================ */
  GN.setAdminMode = function(on){
    if (!GN.session.isOwner) return false;
    GN.session.isAdmin = !!on;
    document.body.classList.toggle('admin-on', GN.session.isAdmin);
    GN.ls.set(
      (window.GN_CONFIG && window.GN_CONFIG.STORAGE && window.GN_CONFIG.STORAGE.ADMIN_MODE) || 'gn_admin_mode',
      GN.session.isAdmin
    );
    return true;
  };

  GN.toggleAdminMode = function(){
    return GN.setAdminMode(!GN.session.isAdmin);
  };

  /* ============================================================
     Add member (calls backend /api/admin/create-user)
     ============================================================ */
    GN.addMember = function(email, password, fullName){
    if (!GN.session.isOwner) {
      return Promise.resolve({ ok: false, error: 'NOT_OWNER' });
    }
    if (!supa) {
      return Promise.resolve({ ok: false, error: 'NO_SUPABASE' });
    }
    if (!email || !password || password.length < 8) {
      return Promise.resolve({ ok: false, error: 'CREATE_FAILED' });
    }

    /* Save owner session so we can restore it after signUp */
    return supa.auth.getSession().then(function(res){
      var ownerSession = res.data && res.data.session;
      if (!ownerSession) return { ok: false, error: 'NO_SESSION' };

      /* Create user via Supabase directly */
      return supa.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,
        options: {
          data: { full_name: fullName || '' }
        }
      }).then(function(signRes){
        if (signRes.error) {
          console.error('[auth] signUp:', signRes.error);
          return { ok: false, error: signRes.error.message || 'CREATE_FAILED' };
        }
        var newUser = signRes.data && signRes.data.user;
        if (!newUser) return { ok: false, error: 'CREATE_FAILED' };

        /* Restore owner session */
        return supa.auth.setSession({
          access_token: ownerSession.access_token,
          refresh_token: ownerSession.refresh_token
        }).then(function(){
          /* Activate new profile immediately */
          return supa.from('profiles')
            .update({
              status: 'allowed',
              role: 'reader',
              full_name: fullName || ''
            })
            .eq('auth_user_id', newUser.id)
            .then(function(updRes){
              if (updRes.error) {
                console.error('[auth] profile update:', updRes.error);
                return { ok: false, error: updRes.error.message };
              }
              return { ok: true };
            });
        });
      }).catch(function(err){
        console.error('[auth] addMember:', err);
        return { ok: false, error: 'NETWORK' };
      });
    });
  };
  
    /* ============================================================
     List all profiles (owner only)
     ============================================================ */
  GN.listProfiles = function(){
    if (!supa || !GN.session.isOwner) return Promise.resolve([]);
    return supa
      .from('profiles')
      .select('id,auth_user_id,email,full_name,phone,role,status,login_count,last_login,created_at')
      .order('created_at', { ascending: false })
      .then(function(res){
        if (res.error) { console.error('[auth] listProfiles:', res.error); return []; }
        return res.data || [];
      });
  };

  /* ============================================================
     Update profile status (owner only)
     ============================================================ */
  GN.updateProfileStatus = function(authUserId, status){
    if (!supa || !GN.session.isOwner) return Promise.resolve(false);
    return supa
      .from('profiles')
      .update({ status: status })
      .eq('auth_user_id', authUserId)
      .then(function(res){
        if (res.error) { console.error('[auth] updateProfileStatus:', res.error); return false; }
        return true;
      });
  };

  /* ============================================================
     Update profile role (owner only)
     ============================================================ */
  GN.updateProfileRole = function(authUserId, role){
    if (!supa || !GN.session.isOwner) return Promise.resolve(false);
    if (role !== 'owner' && role !== 'reader') return Promise.resolve(false);
    return supa
      .from('profiles')
      .update({ role: role })
      .eq('auth_user_id', authUserId)
      .then(function(res){
        if (res.error) { console.error('[auth] updateProfileRole:', res.error); return false; }
        return true;
      });
  };

  /* ============================================================
     Reset password (owner only, via backend)
     ============================================================ */
  GN.resetUserPassword = function(email){
    if (!GN.session.isOwner) return Promise.resolve({ ok: false, error: 'NOT_OWNER' });
    if (!supa) return Promise.resolve({ ok: false, error: 'NO_SUPABASE' });

    return supa.auth.resetPasswordForEmail(email).then(function(res){
      if (res.error) return { ok: false, error: res.error.message };
      return { ok: true };
    }).catch(function(){
      return { ok: false, error: 'NETWORK' };
    });
  };

  /* ============================================================
     Auth state listener
     ============================================================ */
  if (supa) {
    supa.auth.onAuthStateChange(function(event, session){
      if (event === 'SIGNED_OUT') {
        GN.session.user = null;
        GN.session.profile = null;
        GN.session.isOwner = false;
        GN.session.isAdmin = false;
        GN.session.isLogged = false;
        document.body.classList.remove('admin-on');
      }
    });
  }

  /* ============================================================
     Helpers
     ============================================================ */
  GN.isOwner = function(){ return !!GN.session.isOwner; };
  GN.isAdmin = function(){ return !!GN.session.isAdmin; };
  GN.isLogged = function(){ return !!GN.session.isLogged; };

  GN.errorMessage = function(code){
    var dict = (GN.i18n && GN.i18n[GN.lang || 'ar']) || {};
    switch (code) {
      case 'MISSING_CREDENTIALS': return dict.fieldRequired || 'Missing credentials';
      case 'INVALID_CREDENTIALS': return dict.invalidCredentials || 'Invalid credentials';
      case 'NO_PROFILE':          return dict.accountNotFound || 'Account not found';
      case 'PENDING':             return dict.accountPending || 'Account pending';
      case 'BLOCKED':             return dict.accountBlocked || 'Account blocked';
      case 'NETWORK':             return dict.serverError || 'Network error';
      case 'NOT_OWNER':           return dict.readOnlyNotice || 'Not authorized';
      case 'NO_SUPABASE':         return 'Supabase not initialized';
      case 'CREATE_FAILED':       return dict.saveFailed || 'Create failed';
      default:                    return code || (dict.error || 'Error');
    }
  };

  console.log('[Gold Nile] auth.js loaded');

})();