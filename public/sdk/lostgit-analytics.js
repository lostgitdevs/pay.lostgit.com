/**
 * LostGit Pay — Analytics & Telemetry Browser SDK
 * Version: 1.0.0
 * Lightweight, privacy-compliant tracking SDK for websites & web apps.
 * Does NOT collect passwords, inputs, form text, or personal identifiable information.
 */
(function (window, document) {
  'use strict';

  // Locate the current script tag and configuration attributes
  var currentScript =
    document.currentScript ||
    (function () {
      var scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

  var projectKey = currentScript ? currentScript.getAttribute('data-project-key') : null;
  var endpoint =
    (currentScript ? currentScript.getAttribute('data-endpoint') : null) ||
    'https://pay.lostgit.com/api/v1/analytics/collect';

  if (!projectKey) {
    console.warn('[LostGit Analytics] Missing data-project-key attribute.');
    return;
  }

  // Session ID management (ephemeral to current browser session tab)
  var SESSION_KEY = '_lgt_sess';
  var sessionId = '';
  try {
    sessionId = window.sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      window.sessionStorage.setItem(SESSION_KEY, sessionId);
    }
  } catch (e) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 12);
  }

  // Device & browser detection helper
  function getDeviceCategory() {
    var width = window.innerWidth || screen.width;
    if (width < 640) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  function getBrowserName() {
    var ua = navigator.userAgent;
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('SamsungBrowser') > -1) return 'Samsung';
    if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) return 'Opera';
    if (ua.indexOf('Trident') > -1) return 'IE';
    if (ua.indexOf('Edge') > -1 || ua.indexOf('Edg') > -1) return 'Edge';
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Safari') > -1) return 'Safari';
    return 'Other';
  }

  // Event queue and batch dispatcher
  var eventQueue = [];
  var pageStartTime = Date.now();

  function dispatchEvents(immediate) {
    if (eventQueue.length === 0) return;
    var payload = {
      projectKey: projectKey,
      events: eventQueue.slice(),
    };
    eventQueue = [];

    var jsonStr = JSON.stringify(payload);

    // Use sendBeacon if supported (especially on unload)
    if (immediate && navigator.sendBeacon) {
      var blob = new Blob([jsonStr], { type: 'application/json' });
      navigator.sendBeacon(endpoint, blob);
      return;
    }

    try {
      if (window.fetch) {
        window.fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: jsonStr,
          keepalive: true,
        }).catch(function () {});
      }
    } catch (err) {}
  }

  function recordEvent(type, data) {
    var evt = {
      eventType: type,
      sessionId: sessionId,
      path: window.location.pathname || '/',
      title: document.title || '',
      referrer: document.referrer || '',
      deviceCategory: getDeviceCategory(),
      browser: getBrowserName(),
      timestamp: Date.now(),
    };

    if (data) {
      for (var k in data) {
        if (data.hasOwnProperty(k)) {
          evt[k] = data[k];
        }
      }
    }

    eventQueue.push(evt);
    dispatchEvents(false);
  }

  // 1. Initial Pageview
  recordEvent('pageview');

  // 2. Track Single Page Application (SPA) navigation
  var originalPushState = history.pushState;
  if (originalPushState) {
    history.pushState = function () {
      originalPushState.apply(this, arguments);
      pageStartTime = Date.now();
      recordEvent('pageview');
    };
  }

  window.addEventListener('popstate', function () {
    pageStartTime = Date.now();
    recordEvent('pageview');
  });

  // 3. Track Click Interactions safely
  document.addEventListener(
    'click',
    function (e) {
      var target = e.target;
      if (!target) return;

      // Find clickable parent if clicked inside child
      while (
        target &&
        target !== document.body &&
        target.tagName !== 'A' &&
        target.tagName !== 'BUTTON' &&
        !target.getAttribute('data-track')
      ) {
        target = target.parentElement;
      }

      if (!target || target === document.body) return;

      // NEVER track sensitive form inputs
      var tag = target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      var text = (target.innerText || target.textContent || '').trim().substring(0, 40);
      var elementId = target.id || null;
      var dataTrack = target.getAttribute('data-track') || null;

      recordEvent('click', {
        elementTag: tag,
        elementId: elementId,
        elementText: text,
        metadata: dataTrack ? { trackName: dataTrack } : {},
      });
    },
    true
  );

  // 4. Session Duration / Time-on-page tracking
  function sendHeartbeat(isEnd) {
    var durationSec = Math.round((Date.now() - pageStartTime) / 1000);
    if (durationSec > 0) {
      recordEvent(isEnd ? 'session_end' : 'heartbeat', {
        durationSeconds: durationSec,
      });
      dispatchEvents(isEnd);
    }
  }

  // Periodic heartbeat every 30 seconds
  setInterval(function () {
    sendHeartbeat(false);
  }, 30000);

  // When tab is closed or navigated away
  window.addEventListener('beforeunload', function () {
    sendHeartbeat(true);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      sendHeartbeat(true);
    }
  });

  // Public LostGit API
  window.LostGit = {
    version: '1.0.0',
    track: function (eventName, metadata) {
      recordEvent('click', {
        elementTag: 'CUSTOM',
        elementText: String(eventName).substring(0, 40),
        metadata: metadata || {},
      });
    },
  };
})(window, document);
