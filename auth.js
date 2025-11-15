// auth.js — client-side enhancements for login form
// - show/hide password
// - simple client-side validation display
// - disable submit while request is in progress
// - map server-side errors to UI when server returns JSON

// Important security notes (see README or server docs):
// - Always submit forms over HTTPS in production.
// - CSRF protection must be enforced server-side (token included in hidden input).
// - Do not store passwords in localStorage or send them to third-party services.

(function(){
  'use strict';

  // Wait for DOM ready
  document.addEventListener('DOMContentLoaded', function(){
    // Theme toggle — konsistent mit app.js Logik
    // Speichert in localStorage['mietradar:theme'] als 'light' oder 'dark'
    var themeToggle = document.getElementById('themeToggle');
    var KEY = 'mietradar:theme';

    function labelFor(t){ return t === 'light' ? 'Light Mode' : 'Dark Mode'; }
    function system(){ 
      try { 
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'; 
      } catch(e){ 
        return 'dark'; 
      } 
    }
    function applyTheme(t){
      var v = (t === 'light') ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', v);
      if(themeToggle){
        themeToggle.textContent = labelFor(v);
        themeToggle.setAttribute('aria-pressed', String(v === 'light'));
      }
    }

    // Init theme from localStorage or system preference
    try{
      applyTheme(localStorage.getItem(KEY) || system());
    }catch(e){
      applyTheme(system());
    }

    // Toggle click handler
    if(themeToggle){
      themeToggle.addEventListener('click', function(){
        var cur = document.documentElement.getAttribute('data-theme') || 'dark';
        var next = cur === 'light' ? 'dark' : 'light';
        try{
          localStorage.setItem(KEY, next);
        }catch(e){}
        applyTheme(next);
        // show a small flash message on auth pages to acknowledge the change
        try{ showFlash(next === 'light' ? 'Wechsel zu hellem Modus' : 'Wechsel zu dunklem Modus', 'success'); }catch(e){}
      });
    }

    // Form-specific handlers only if form exists
    var form = document.getElementById('loginForm');
    if(!form) return;

    var email = document.getElementById('email');
    var password = document.getElementById('password');
    var pwToggle = document.querySelector('.pw-toggle');
    var submitBtn = document.getElementById('submitBtn');
    var flash = document.getElementById('flash');

    function clearFieldErrors(){
      var errors = form.querySelectorAll('small.error');
      errors.forEach(function(el){ el.textContent = ''; });
      var invalids = form.querySelectorAll('.input-error');
      invalids.forEach(function(el){ el.classList.remove('input-error'); });
      if(flash) flash.innerHTML = '';
    }

    function setFieldError(id, msg){
      var small = document.getElementById('err-' + id);
      var input = document.getElementById(id);
      if(small) small.textContent = msg;
      if(input) input.classList.add('input-error');
    }

    // Password toggle (accessible)
    if(pwToggle && password){
      pwToggle.addEventListener('click', function(e){
        var showing = pwToggle.getAttribute('aria-pressed') === 'true';
        if(showing){
          password.type = 'password';
          pwToggle.setAttribute('aria-pressed','false');
          pwToggle.setAttribute('aria-label','Passwort anzeigen');
        } else {
          password.type = 'text';
          pwToggle.setAttribute('aria-pressed','true');
          pwToggle.setAttribute('aria-label','Passwort verbergen');
        }
      });
    }

    // Helper to show flash messages (server or client)
    function showFlash(message, type){
      if(!flash) return;
      var p = document.createElement('p');
      p.className = type === 'error' ? 'error' : 'success';
      p.textContent = message;
      flash.innerHTML = ''; // replace
      flash.appendChild(p);
      // Announce to screen readers
      flash.setAttribute('aria-hidden','false');
    }

    // Submit handling: client validation + fetch
    form.addEventListener('submit', function(e){
      e.preventDefault();
      clearFieldErrors();

      // Use browser validation first
      if(!form.checkValidity()){
        // Find invalid fields and show messages
        var firstInvalid = null;
        var elements = Array.prototype.slice.call(form.elements);
        elements.forEach(function(el){
          if(el.willValidate && !el.checkValidity()){
            if(!firstInvalid) firstInvalid = el;
            var id = el.id || el.name;
            var msg = el.validationMessage || 'Bitte ausfüllen';
            // map to small#err-<id>
            if(id) setFieldError(id, msg);
          }
        });
        if(firstInvalid) firstInvalid.focus();
        return;
      }

      // Prepare UI for submission
      if(submitBtn){
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.setAttribute('aria-busy','true');
      }

      // Build form data
      var data = new FormData(form);

      // Attempt to POST via fetch. The server is expected to respond with JSON in
      // a production-ready implementation. Keep CORS and CSRF in mind.
      fetch(form.action || window.location.href, {
        method: form.method || 'POST',
        body: data,
        credentials: 'same-origin', // send cookies for same-origin
        headers: {
          // Do not set Content-Type when sending FormData; the browser will
          // set the multipart boundary. If your server expects JSON, use
          // JSON.stringify instead.
        }
      }).then(function(resp){
        if(resp.ok){
          // Try parse JSON; if not JSON, treat as redirect or success
          return resp.json().catch(function(){ return {ok:true}; });
        }
        // Non-OK HTTP status
        return resp.json().catch(function(){ throw new Error('Serverfehler'); });
      }).then(function(payload){
        // Expected payload examples:
        // { ok: true, redirect: '/app' }
        // { ok: false, message: 'Fehler', errors: { email: '...' } }
        if(payload && payload.ok){
          if(payload.redirect){
            window.location.href = payload.redirect;
            return;
          }
          // Generic success — show message
          showFlash('Erfolgreich angemeldet.', 'success');
        } else {
          // Show field errors if provided
          if(payload && payload.errors){
            Object.keys(payload.errors).forEach(function(k){
              setFieldError(k, payload.errors[k]);
            });
          }
          if(payload && payload.message){
            showFlash(payload.message, 'error');
          } else {
            showFlash('Anmeldung fehlgeschlagen. Bitte prüfen Sie Ihre Angaben.', 'error');
          }
        }
      }).catch(function(err){
        console.error('Login error', err);
        showFlash('Netzwerk- oder Serverfehler. Bitte erneut versuchen.', 'error');
      }).finally(function(){
        if(submitBtn){
          submitBtn.disabled = false;
          submitBtn.classList.remove('loading');
          submitBtn.removeAttribute('aria-busy');
        }
      });

    });

  });

})();
