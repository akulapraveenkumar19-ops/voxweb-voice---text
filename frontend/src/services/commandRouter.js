// Client-side Fast Command Router & Normalizer

const SITES = {
  youtube: 'https://www.youtube.com',
  google: 'https://www.google.com',
  whatsapp: 'https://web.whatsapp.com',
  github: 'https://github.com',
  twitter: 'https://x.com',
  x: 'https://x.com',
  reddit: 'https://www.reddit.com',
  wikipedia: 'https://www.wikipedia.org',
  gmail: 'https://mail.google.com',
  linkedin: 'https://www.linkedin.com',
  netflix: 'https://www.netflix.com',
  spotify: 'https://open.spotify.com',
  amazon: 'https://www.amazon.com',
  leetcode: 'https://leetcode.com',
  canva: 'https://www.canva.com',
  coursera: 'https://www.coursera.org',
  discord: 'https://discord.com',
  twitch: 'https://www.twitch.tv',
  maps: 'https://maps.google.com',
  'google maps': 'https://maps.google.com',
  notion: 'https://www.notion.so',
  figma: 'https://www.figma.com',
  stackoverflow: 'https://stackoverflow.com',
};

export function detectFastCommand(command, language = 'en-US') {
  if (!command) return null;
  const rawTrimmed = command.trim();
  const clean = rawTrimmed.toLowerCase().replace(/[.!?]+$/, '');
  const isTe = Boolean(language && language.toLowerCase().startsWith('te'));

  // A. WhatsApp Call
  const waMatch = rawTrimmed.match(
    /^(?:call\s+(?:on\s+)?whatsapp\s+(?:to\s+)?|whatsapp\s+call\s+(?:to\s+)?|వాట్సాప్\s*(?:లో)?\s*కాల్\s*చేయి\s*)([\+\d\s\-()]+)$/i
  );
  if (waMatch) {
    const rawNum = waMatch[1].trim();
    const digits = rawNum.replace(/\D/g, '');
    if (digits.length >= 5) {
      return {
        type: 'action',
        action: 'call_whatsapp',
        query: rawNum,
        url: `https://wa.me/${digits}`,
        response: isTe ? `${rawNum} కు వాట్సాప్‌లో కాల్ చేస్తున్నాను.` : `Calling ${rawNum} on WhatsApp.`,
        intent: 'whatsapp_call',
      };
    }
  }

  // B. Device / Phone Call
  const phoneMatch = rawTrimmed.match(
    /^(?:call|dial|phone|make a call to|కాల్ చేయి|ఫోన్ చేయి)\s+([\+\d\s\-()]+)$/i
  );
  if (phoneMatch) {
    const rawNum = phoneMatch[1].trim();
    const cleanNum = rawNum.replace(/[^\d+]/g, '');
    if (cleanNum.replace('+', '').length >= 5) {
      return {
        type: 'action',
        action: 'call_phone',
        query: rawNum,
        url: `tel:${cleanNum}`,
        response: isTe ? `${rawNum} కు కాల్ చేస్తున్నాను.` : `Calling ${rawNum} on your device.`,
        intent: 'phone_call',
      };
    }
  }

  // C. Telugu Fast Actions
  if (['సమయం ఎంత', 'టైమ్ ఎంత', 'ఇప్పుడు సమయం ఎంత', 'టైం ఎంత', 'సమయం చెప్పు', 'టైమ్ చెప్పు'].includes(clean)) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      type: 'action',
      action: 'tell_time',
      response: `ప్రస్తుత సమయం ${timeStr}.`,
      intent: 'time_query',
    };
  }

  if (['తేదీ ఎంత', 'ఈరోజు తేదీ ఎంత', 'ఈరోజు ఏ రోజు', 'తేదీ చెప్పు', 'ఈరోజు తేదీ చెప్పు'].includes(clean)) {
    const dateStr = new Date().toLocaleDateString('te-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return {
      type: 'action',
      action: 'tell_date',
      response: `ఈరోజు ${dateStr}.`,
      intent: 'date_query',
    };
  }

  const teYtMatch = rawTrimmed.match(/^(?:యూట్యూబ్‌లో|యూట్యూబ్ లో)\s*(.+?)\s*(?:ప్లే చేయి|పెట్టు|ఓపెన్ చేయి)$/);
  if (teYtMatch) {
    const q = teYtMatch[1].trim();
    return {
      type: 'action',
      action: 'play_youtube',
      query: q,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
      response: `యూట్యూబ్‌లో ${q} శోధిస్తున్నాను.`,
      intent: 'youtube_play',
    };
  }
  if (['యూట్యూబ్ ఓపెన్ చేయి', 'యూట్యూబ్ తెరువు'].includes(clean)) {
    return {
      type: 'action',
      action: 'open_url',
      url: 'https://www.youtube.com',
      response: 'యూట్యూబ్ ఓపెన్ చేస్తున్నాను.',
      intent: 'open_website',
    };
  }

  // 1. Check time
  if (['what time is it', 'what is the time', 'current time', 'tell me the time', 'time now'].includes(clean)) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      type: 'action',
      action: 'tell_time',
      response: `The current time is ${timeStr}.`,
      intent: 'time_query',
    };
  }

  // 2. Check date
  if (['what is the date', 'what date is it', 'what day is today', 'current date', "today's date", 'tell me the date'].includes(clean)) {
    const dateStr = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return {
      type: 'action',
      action: 'tell_date',
      response: `Today is ${dateStr}.`,
      intent: 'date_query',
    };
  }

  // 3. YouTube Search & Play
  const ytMatch =
    clean.match(/^(?:play|listen to)\s+(.+?)(?:\s+on\s+youtube)?$/) ||
    clean.match(/^(?:search\s+youtube\s+for|youtube\s+search\s+for)\s+(.+)$/) ||
    clean.match(/^youtube\s+(?!open\b)(.+)$/);
  if (ytMatch && !clean.startsWith('open')) {
    const query = ytMatch[1].trim();
    if (query.length > 1 && !['music', 'video'].includes(query)) {
      return {
        type: 'action',
        action: 'play_youtube',
        query,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
        response: `Searching YouTube for ${query}.`,
        intent: 'youtube_play',
      };
    }
  }

  // 4. Maps search
  const mapsMatch = clean.match(/^(?:search\s+maps?\s+for|find\s+(.+?)\s+on\s+maps?|maps?\s+search\s+for)\s+(.+)$/);
  if (mapsMatch) {
    const place = (mapsMatch[2] || mapsMatch[1]).trim();
    return {
      type: 'action',
      action: 'search_maps',
      query: place,
      url: `https://maps.google.com/?q=${encodeURIComponent(place)}`,
      response: `Searching Google Maps for ${place}.`,
      intent: 'maps_search',
    };
  }

  // 5. Wikipedia search
  const wikiMatch = clean.match(/^(?:search\s+wikipedia\s+for|wikipedia\s+search\s+for|wikipedia)\s+(.+)$/);
  if (wikiMatch) {
    const topic = wikiMatch[1].trim();
    return {
      type: 'action',
      action: 'search_wikipedia',
      query: topic,
      url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(topic)}`,
      response: `Looking up ${topic} on Wikipedia.`,
      intent: 'wikipedia_search',
    };
  }

  // 6. Safe math calculation
  const calcMatch = clean.match(/^(?:calculate|what is|compute)\s+([\d\s\+\-\*\/\.\(\)\%\^x×÷]+)$/);
  if (calcMatch) {
    const expr = calcMatch[1].trim().replace(/x|×/g, '*').replace(/÷/g, '/');
    if (/^[\d\s\+\-\*\/\.\(\)\%]+$/.test(expr)) {
      try {
        const val = Function(`'use strict'; return (${expr})`)();
        if (typeof val === 'number' && !isNaN(val)) {
          const displayVal = Number.isInteger(val) ? val : Math.round(val * 10000) / 10000;
          return {
            type: 'action',
            action: 'calculate',
            response: `${calcMatch[1].trim()} equals ${displayVal}.`,
            intent: 'math_calculation',
          };
        }
      } catch (e) {
        // Fallback to backend
      }
    }
  }

  // 7. Open website
  const openMatch = clean.match(/^(?:open|launch|go to)\s+(?:the\s+)?([a-z0-9.\s]+)$/);
  if (openMatch) {
    const target = openMatch[1].trim();
    if (SITES[target]) {
      return {
        type: 'action',
        action: 'open_url',
        url: SITES[target],
        response: `Opening ${target.charAt(0).toUpperCase() + target.slice(1)} for you.`,
        intent: 'open_website',
      };
    }
    if (target.includes('.') && !target.includes(' ')) {
      const url = target.startsWith('http') ? target : `https://${target}`;
      return {
        type: 'action',
        action: 'open_url',
        url,
        response: `Navigating to ${target}.`,
        intent: 'open_website',
      };
    }
  }

  // 8. Search Google
  const searchMatch = clean.match(/^(?:search\s+google\s+for|search\s+for|google\s+for)\s+(.+)$/);
  if (searchMatch) {
    const query = searchMatch[1].trim();
    return {
      type: 'action',
      action: 'search_google',
      query,
      url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      response: `Searching Google for ${query}.`,
      intent: 'web_search',
    };
  }

  return null;
}
