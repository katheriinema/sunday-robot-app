import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache for definitions
const definitionCache = new Map<string, {definition: string, timestamp: number}>();

// Cache duration: 1 hour
const CACHE_DURATION = 60 * 60 * 1000;

// Enhanced fallback dictionary with better definitions
const enhancedDictionary: {[key: string]: string} = {
  // Technical terms
  'algorithm': 'A step-by-step procedure for solving a problem or completing a task, especially by a computer',
  'prototype': 'An early sample or model of a product used for testing and development',
  'chassis': 'The framework or structure of a vehicle or machine that supports other components',
  'sensors': 'Devices that detect and respond to changes in the environment, such as light, temperature, or motion',
  'corrupted': 'Damaged or altered in a way that makes data unusable or unreliable',
  'fragments': 'Small pieces or parts of something larger that has been broken',
  'coordinates': 'Numbers that identify a specific position on a map or graph using x and y values',
  'fingerprint': 'A unique identifying characteristic or pattern that distinguishes something from others',
  'discontinued': 'No longer produced, sold, or available',
  'restricted': 'Limited or controlled access to something',
  'blueprints': 'Detailed technical drawings or plans used as a guide for construction or manufacturing',
  'processors': 'Components that perform calculations and operations in computers and electronic devices',
  'overheat': 'To become too hot, causing damage or malfunction in electronic devices',
  'mismatch': 'A failure to correspond or match properly between two things',
  'executive': 'Relating to making important decisions and managing organizations',
  'decommissioned': 'Taken out of service or retired from active use',
  'terminated': 'Brought to an end or stopped completely',
  'assistant': 'A person or device that helps with tasks and provides support',
  'arithmetic': 'Basic mathematical operations like addition, subtraction, multiplication, and division',
  'fractions': 'Numbers that represent parts of a whole, written as one number over another',
  'trophies': 'Awards or prizes given for achievement in competitions or contests',
  'polishing': 'Making something smooth and shiny by rubbing or applying a finish',
  'static': 'Electrical interference or noise in signals that causes distortion',
  'whisper': 'To speak very quietly using only the breath, without using the voice',
  'metallic': 'Having the properties of metal, such as being shiny, hard, and conductive',
  'curious': 'Eager to know or learn something new; showing interest in discovering information',
  'scattered': 'Spread out over a wide area in an irregular or random way',
  'echo': 'A sound that is reflected back from a surface, creating a repetition of the original sound',
  'version': 'A particular form or variant of something that differs from other forms',
  'wake': 'To become conscious or aware after sleeping; to stop sleeping',
  'corridors': 'Long passages in buildings that connect different rooms or areas',
  'laughter': 'The sound of people laughing; the expression of amusement or joy',
  'desperately': 'In a way that shows great urgency, despair, or extreme need',
  'rerouting': 'Changing the path or direction of something, especially traffic or data',
  'patching': 'Repairing or fixing something temporarily, often with a quick solution',
  'circuits': 'Complete paths for electrical current to flow through electronic devices',
  'memory': 'The part of a computer that stores data and programs for quick access',
  'core': 'The central or most important part of something',
  'burn': 'To be damaged by heat or fire; to be destroyed by excessive heat',
  'faintly': 'In a way that is barely perceptible or very weak',
  'cooling': 'The process of becoming less hot or reducing temperature',
  'fans': 'Devices that move air to cool something or provide ventilation',
  'emptier': 'More empty or vacant than before; having less content',
  'internal': 'Located inside something; relating to the inner part',
  'logs': 'Records of events or activities, especially in computer systems',
  'errors': 'Mistakes or problems in a system that prevent it from working correctly',
  'labeled': 'Marked or identified with a label or tag',
  'emotion': 'A strong feeling such as joy, anger, fear, or sadness',
  'weird': 'Strange or unusual in a way that is unexpected or mysterious',
  'learning': 'The process of gaining knowledge or skills through experience or study',
  'brief': 'Lasting for a short time; concise or short in duration',
  'flicker': 'A quick, unsteady movement or light that appears and disappears rapidly',
  'endless': 'Having no end or limit; continuing forever',
  'spark': 'A small particle of fire or light that appears briefly',
  'network': 'A system of connected computers or devices that can communicate with each other',
  'signal': 'A message or data transmitted electronically, often wirelessly',
  'detected': 'Discovered or noticed through observation or measurement',
  'unknown': 'Not known or identified; unfamiliar or mysterious',
  'tracing': 'Following the path or development of something step by step',
  'bounced': 'Moved up and down repeatedly, like a ball hitting a surface',
  'channels': 'Paths or routes for communication or transmission',
  'satellite': 'An object that orbits around a planet, often used for communication',
  'pings': 'Signals sent to test connectivity or measure response time',
  'disused': 'No longer in use; abandoned or neglected',
  'node': 'A connection point in a network where data can be transmitted or received',
  'froze': 'Became motionless or stopped working, often due to cold or system failure',
  'scared': 'Feeling fear or anxiety about something threatening or dangerous',
  'reply': 'A response to a message or question',
  'seconds': 'Units of time equal to 1/60 of a minute',
  'remember': 'To have in or be able to bring to mind information from the past',
  'decoded': 'Converted from code into understandable language or information',
  'data': 'Information stored and processed by computers',
  'sentences': 'Complete thoughts expressed in words, usually containing a subject and verb',
  'broken': 'Damaged or not working properly; in pieces or malfunctioning',
  'appeared': 'Became visible or noticeable; came into view',
  'searched': 'Looked for something carefully and thoroughly',
  'database': 'A structured collection of data organized for easy access and retrieval',
  'access': 'The ability to use or enter something; permission to use',
  'record': 'A written account of something that happened; documentation',
  'directory': 'A listing of files or information organized in a structured way',
  'matched': 'Corresponded or was equal to something else',
  'digital': 'Relating to computers or electronic technology that uses binary code',
  'research': 'Systematic investigation to discover facts or information',
  'folder': 'A container for organizing files or documents',
  'titled': 'Given a name or title; having a specific designation',
  'emotional': 'Relating to feelings and emotions rather than logic or reason',
  'discontinued': 'Stopped or ended permanently; no longer continued',
  'hesitated': 'Paused before doing something due to uncertainty or doubt',
  'warned': 'Advised of danger or problems; given advance notice of risks',
  'restricted': 'Limited or controlled; not freely available',
  'missed': 'Felt the absence of something; failed to experience or notice',
  'voice': 'The sound made when speaking; the ability to produce speech sounds',
  'opened': 'Made accessible or available; unlocked or revealed',
  'blueprints': 'Detailed technical drawings used as guides for construction',
  'module': 'A self-contained component that can be used independently',
  'glowing': 'Emitting light; shining brightly',
  'marked': 'Indicated or labeled; having visible signs or symbols',
  'realized': 'Became aware of something; understood clearly',
  'stranger': 'A person you don\'t know; someone unfamiliar',
  'shut': 'Closed or stopped operating; sealed off',
  'night': 'The dark part of the day when the sun is not visible',
  'talked': 'Spoke with someone; had a conversation',
  'cookies': 'Sweet baked treats made from dough, often with chocolate chips',
  'rain': 'Water falling from clouds in the sky',
  'return': 'Came back or gave back; went back to a previous place',
  'shared': 'Told others about something; gave information to multiple people',
  'formed': 'Created or shaped; brought into existence',
  'memories': 'Recollections of past events stored in the mind',
  'woman': 'An adult female person',
  'saying': 'Speaking words; expressing something verbally',
  'happy': 'Feeling joy or contentment; pleased or satisfied',
  'passed': 'Moved by or elapsed; went from one state to another',
  'weakened': 'Became less strong; lost power or intensity',
  'power': 'Energy or ability to do work; electrical or physical force',
  'running': 'Operating or functioning; moving quickly on foot',
  'low': 'Not high or strong; below average level',
  'hold': 'To keep or maintain; to grasp or support',
  'longer': 'For a greater amount of time; extended duration',
  'worked': 'Made an effort or functioned; operated successfully',
  'trying': 'Making an attempt; putting forth effort',
  'live': 'To exist or survive; to be alive',
  'began': 'Started to happen; commenced an action',
  'screen': 'The display surface of a computer or electronic device',
  'dimmed': 'Made less bright; reduced in brightness',
  'stop': 'To cease or halt; to bring to an end',
  'lose': 'To no longer have; to be deprived of',
  'paused': 'Stopped temporarily; took a break',
  'happens': 'Occurs or takes place; comes to pass',
  'long': 'For an extended time; having great duration',
  'silence': 'Absence of sound; complete quiet',
  'faded': 'Became weaker or less visible; lost intensity',
  'sat': 'Was in a seated position; rested on a surface',
  'dark': 'Without light; having little or no illumination',
  'whispering': 'Speaking very quietly; making soft sounds',
  'softly': 'In a gentle manner; with little force or volume',
  'room': 'An enclosed space in a building; a chamber',
  'felt': 'Experienced an emotion; perceived through touch',
  'ever': 'At any time; on any occasion',
  'cry': 'To shed tears; to make loud sounds of distress',
  'couldn\'t': 'Was not able to; could not do something',
  'filled': 'Made full; occupied all available space',
  'returned': 'Came back; went back to a previous place',
  'found': 'Discovered or located; came across something',
  'powered': 'Supplied with energy; operated by electricity',
  'sitting': 'In a seated position; resting on a surface',
  'window': 'An opening in a wall with glass; a transparent barrier',
  'buddy': 'A friendly term for friend; a companion',
  'someone': 'An unspecified person; some individual',
  'else': 'In addition or different; other than what was mentioned',
  'laughed': 'Made the sound of amusement; expressed joy through sound',
  'looked': 'Directed one\'s gaze; used the eyes to see',
  'stars': 'Bright points of light in the night sky; celestial bodies',
  'friend': 'A person you like and know well; a companion',
  'almost': 'Nearly or very close to; not quite',
  'tilted': 'Moved to an angle; inclined from the vertical',
  'head': 'The top part of the body containing the brain and face',
  'replied': 'Responded in words; answered a question or statement',
  'eyes': 'The organs of sight; the parts of the body used for seeing',
  'curved': 'Bent into a smooth shape; not straight',
  'smile': 'A happy facial expression; showing pleasure with the mouth',
  'later': 'At a time in the future; after the present moment',
  'house': 'A building where people live; a dwelling place',
  'quiet': 'Making little or no noise; peaceful and calm',
  'connected': 'Joined or linked together; having a relationship',
  'again': 'One more time; once more',
  'second': 'A unit of time equal to 1/60 of a minute',
  'saw': 'Perceived with the eyes; observed visually',
  'faint': 'Barely perceptible; very weak or dim',
  'online': 'Connected to the internet; available on the web',
  'smiled': 'Made a happy expression; showed pleasure with the face',
  'somewhere': 'In an unspecified place; at some location',
  'another': 'One more of the same kind; an additional one',
  'still': 'Continuing to exist; remaining in place'
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get('word');

  if (!word) {
    return NextResponse.json({ error: 'Word parameter is required' }, { status: 400 });
  }

  try {
    // Clean the word
    const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
    
    if (cleanWord.length < 2) {
      return NextResponse.json({ 
        definition: `"${cleanWord}" - This word is too short or is a number` 
      });
    }

    // Check cache first
    const cached = definitionCache.get(cleanWord);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return NextResponse.json({ 
        definition: cached.definition,
        word: cleanWord,
        source: 'cache'
      });
    }

    // Try multiple dictionary sources
    let definition = null;
    let source = 'not-found';

    // Try Free Dictionary API first with faster timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5 second timeout
      
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data && data.length > 0) {
          const entry = data[0];
          
          // Get the first meaning from the first definition
          if (entry.meanings && entry.meanings.length > 0) {
            const meaning = entry.meanings[0];
            if (meaning.definitions && meaning.definitions.length > 0) {
              const def = meaning.definitions[0];
              definition = def.definition;
              source = 'dictionary-api';
            }
          }
        }
      }
    } catch (error) {
      console.log('Dictionary API failed or timed out, using fallback');
    }

    // If API failed or returned no definition, use enhanced fallback
    if (!definition) {
      if (enhancedDictionary[cleanWord]) {
        definition = enhancedDictionary[cleanWord];
        source = 'enhanced-fallback';
      } else {
        // Try to provide a helpful response for unknown words
        definition = `"${cleanWord}" - This word might be a proper noun, very specialized term, or uncommon word. Try looking it up in a comprehensive dictionary.`;
        source = 'not-found';
      }
    }

    // Cache the result
    definitionCache.set(cleanWord, {
      definition: definition,
      timestamp: Date.now()
    });

    return NextResponse.json({ 
      definition: definition,
      word: cleanWord,
      source: source
    });

  } catch (error) {
    console.error('Dictionary API error:', error);
    
    // Final fallback
    const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
    const fallbackDef = enhancedDictionary[cleanWord] || `"${cleanWord}" - Unable to fetch definition. Please check your internet connection.`;
    
    return NextResponse.json({ 
      definition: fallbackDef,
      word: cleanWord,
      source: 'error-fallback'
    }, { status: 500 });
  }
}
