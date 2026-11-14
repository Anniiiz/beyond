/** All companies, people and answers are fictional. AI suggestions are pre-scripted. */


export const COMPANY = { name: 'Northstar Software', initials: 'NS', place: 'Espoo, Keilaniemi' }

export const ORIGINAL_TITLE = 'Customer Success Specialist'

/** Guided questions that get past credentials. */
export const QUESTIONS = {
  challenge: {
    label: 'What would success look like six months after this person joins?',
    subquestions: [
      'What problem or need is driving this hire?',
      'What should improve for your customers, team or business?',
      'How would you recognise meaningful progress?',
    ],
    placeholder:
      'New customers can get started on their own, run into fewer problems during onboarding, and see value from our product sooner.',
  },
  work: {
    label: 'What will this person actually work on?',
    hint: 'Pick 3–5, or add your own.',
    max: 5,
    suggestions: [
      'Talk to customers',
      'Understand user needs',
      'Investigate problems',
      'Identify process bottlenecks',
      'Analyse feedback',
      'Test improvements',
      'Create useful resources',
      'Collaborate across teams',
    ],
  },
  strengths: {
    label: 'What abilities would help someone succeed?',
    hint: 'Pick up to four that could show up in real examples or a conversation.',
    max: 4,
    suggestions: [
      "Understand people's needs",
      'Ask insightful questions',
      'Solve unfamiliar problems',
      'Communicate clearly',
      'Prioritise effectively',
      'Adapt to new situations',
      'Learn independently',
      'Take initiative',
    ],
  },
  learn: {
    label: 'What could someone learn after joining?',
    hint: 'Not everything needs to be mastered on day one.',
    suggestions: [
      'Our product or service',
      'Internal tools and systems',
      'Industry knowledge',
      'Company processes',
      'AI and automation tools',
    ],
  },
  support: {
    label: 'How will you support them?',
    suggestions: ['Structured onboarding', 'Mentoring', 'Hands-on training', 'Regular feedback', 'Dedicated learning time'],
  },
  pretask: {
    label: 'What short task would show how someone thinks?',
    suggestions: [
      {
        title: 'Onboarding takes 14 days',
        prompt: 'Many customers quit before they see any value, and engineering time is limited. How would you start?',
      },
      {
        title: 'The same question, 50 times a week',
        prompt: 'Customers keep asking support how to invite their team. What would you look into first?',
      },
      {
        title: 'A frustrated new customer',
        prompt: 'A new customer emails that the product is “too complicated” and wants to cancel. How would you respond?',
      },
    ],
  },
  qualifications: {
    label: 'Is anything genuinely needed before starting?',
    hint: 'Only what the work needs to be done safely, legally or effectively. If it can be learned after joining, add it to learning instead.',
    reasonPlaceholder: 'Why is this necessary?',
    suggestions: [
      'Driving licence (B)',
      'Right to work in Finland',
      'Hygiene passport',
      'Occupational safety card',
      'First aid certificate',
      'Finnish language (B1)',
      'English for customer conversations',
      'On-site availability',
    ],
  },
} as const

export interface Posting {
  title: string
  challenge: string
  work: string[]
  strengths: string[]
  learn: string[]
  support: string[]
  qualifications: string[]
  reasons: Record<string, string>
  pretaskTitle: string
  pretaskPrompt: string
}

export const EMPTY_POSTING: Posting = {
  title: ORIGINAL_TITLE,
  challenge: '',
  work: [],
  strengths: [],
  learn: [],
  support: [],
  qualifications: [],
  reasons: {},
  pretaskTitle: '',
  pretaskPrompt: '',
}

export const EXAMPLE_POSTING: Posting = {
  title: ORIGINAL_TITLE,
  challenge: QUESTIONS.challenge.placeholder,
  work: ['Talk to customers', 'Identify process bottlenecks', 'Test improvements', 'Create useful resources'],
  strengths: ["Understand people's needs", 'Ask insightful questions', 'Communicate clearly', 'Learn independently'],
  learn: ['Our product or service', 'Internal tools and systems'],
  support: ['Structured onboarding', 'Mentoring'],
  qualifications: ['English for customer conversations'],
  reasons: { 'English for customer conversations': 'Our customers across the Nordics are served in English.' },
  pretaskTitle: QUESTIONS.pretask.suggestions[0].title,
  pretaskPrompt: QUESTIONS.pretask.suggestions[0].prompt,
}

export interface Job {
  id: string
  company: string
  initials: string
  field: string
  title: string
  challenge: string
  place: string
  qualifications: string[]
  reasons?: Record<string, string>
  pretask: { title: string; prompt: string }
}

/** Other open jobs at the event (fictional). The company's own published posting is added first at runtime. */
export const OTHER_JOBS: Job[] = [
  {
    id: 'lumo',
    company: 'Lumo Learning',
    initials: 'LL',
    field: 'Learning',
    title: 'Learning Experience Designer',
    challenge: 'Make five-minute lessons that frontline workers actually finish.',
    place: 'Espoo, Otaniemi',
    qualifications: [],
    pretask: { title: 'Lessons nobody finishes', prompt: 'Only 31% of learners finish a lesson. What would you change first?' },
  },
  {
    id: 'kaari',
    company: 'Kaari Logistics',
    initials: 'KL',
    field: 'Operations',
    title: 'Delivery Operations Coordinator',
    challenge: 'Help dispatchers spend less time on manual delivery exceptions.',
    place: 'Espoo, Kauklahti',
    qualifications: ['Driving licence (B)', 'Right to work in Finland'],
    pretask: { title: '300 exceptions a day', prompt: 'Dispatchers handle most exceptions by phone. Where would you start?' },
  },
  {
    id: 'verdant',
    company: 'Verdant Loop',
    initials: 'VL',
    field: 'Growth',
    title: 'Community Marketer',
    challenge: 'Help small circular-economy brands reach buyers who care.',
    place: 'Remote, Finland',
    qualifications: [],
    pretask: { title: 'Visitors who leave', prompt: 'Most visitors leave without buying. With a small budget, what would you try?' },
  },
  {
    id: 'hoiva',
    company: 'Hoiva Health',
    initials: 'HH',
    field: 'Customer experience',
    title: 'Patient Booking Assistant',
    challenge: 'Make appointment booking easy for elderly patients.',
    place: 'Espoo, Leppävaara',
    qualifications: ['Finnish language (B1)', 'First aid certificate'],
    pretask: { title: 'Calls instead of clicks', prompt: 'Elderly patients abandon online booking and call instead. What would you do?' },
  },
  {
    id: 'sello',
    company: 'Sello Kitchen',
    initials: 'SK',
    field: 'Operations',
    title: 'Kitchen Shift Lead',
    challenge: 'Keep a busy lunch kitchen calm, fair and on time.',
    place: 'Espoo, Leppävaara',
    qualifications: ['Hygiene passport'],
    pretask: { title: 'The 12:15 rush', prompt: 'Orders back up every day at 12:15. How would you smooth the rush?' },
  },
]

export const FIELDS = ['All', 'Customer experience', 'Learning', 'Operations', 'Growth']

export const PRETASK = {
  title: 'Onboarding takes 14 days',
  prompt: 'Many customers quit before they see any value, and engineering time is limited. How would you start?',
}

/** Guidance for the one main written answer: three parts, own words, specifics over polish. */
export const MOTIVATION_GUIDE = {
  heading: 'Why this opportunity, and why you?',
  intro:
    "We're interested in understanding what motivates you, how your background connects to this opportunity, and what you believe you could contribute.",
  reassurance: "You don't need to have worked in this exact role before.",
  parts: [
    { title: 'Why this position?', prompt: 'What interests you about this work or field?' },
    { title: 'Why you?', prompt: 'Which jobs, studies or projects connect you to it?' },
    { title: 'What could you bring?', prompt: 'Which strengths or ways of working would you use here?' },
  ],
  careerChange:
    "Changing careers? That's completely fine. You can explain what sparked your interest in a new field, what you've already explored, and how your experiences might translate into this work.",
  exampleTitle: 'From hospitality to customer success',
  example: [
    {
      part: 'Motivation',
      text: "I'm interested in this opportunity because I enjoy understanding people's problems and finding ways to make their experiences easier. Working in customer success would allow me to combine that interest with my growing curiosity about technology.",
    },
    {
      part: 'Background',
      text: "I've spent four years working in hospitality, where I regularly helped customers navigate unfamiliar processes, resolved unexpected problems, and learned to communicate with people from different backgrounds. Recently, I've also been exploring how AI and digital tools can improve customer experiences.",
    },
    {
      part: 'Contribution',
      text: "Although I haven't worked in SaaS before, I believe I could bring a valuable customer-first perspective to this role. I'm used to recognizing frustration, asking questions to understand the underlying problem, and finding practical solutions.\n\nI'd be particularly excited to help identify where customers struggle during onboarding and explore ways to make their experience simpler and more intuitive.",
    },
  ],
  placeholder: 'Add examples and write in your own words.',
}

export const EXAMPLE_ANSWERS = {
  motivation: MOTIVATION_GUIDE.example.map((e) => e.text).join('\n\n'),
  pretask:
    'First I would talk to five customers who quit and five who stayed, and find the step where people get stuck. Then I would fix the cheapest part first: a short welcome call and a one-page first-login guide. No engineering needed to test it this week.',
}

export interface Applicant {
  id: string
  name: string
  initials: string
  background: string
  submitted: string
  motivation: string
  pretask: string
  /** Prescreen: how they meet the job's requirements and a pre-written background summary. */
  reqStatus?: ReqStatus
  reqHow?: string
  summary?: string
}

export type ReqStatus = 'have' | 'other' | 'not-yet'

export interface Prescreen {
  answers: Record<string, { status: ReqStatus; how: string }>
  roles: { title: string; years: string }[]
  learning: string
}

export const EMPTY_PRESCREEN: Prescreen = { answers: {}, roles: [{ title: '', years: '' }], learning: '' }

/** Kimi's prescreen, as on slide 6 of the deck. */
export const EXAMPLE_PRESCREEN: Omit<Prescreen, 'answers'> = {
  roles: [
    { title: 'Front desk associate', years: '2021–2023' },
    { title: 'Guest experience lead', years: '2023–now' },
  ],
  learning: 'Customer success course, data basics and AI tools. Rebuilt our hotel guest FAQ with AI tools.',
}
export const EXAMPLE_OTHER_ROUTE = 'Served international hotel guests in English every day for four years.'

/** Joining an Espoo event (before matchmaking). Route answers live in Prescreen.roles/learning. */
export type Answer = string | string[]
export type PathId = 'referral' | 'experience' | 'degree' | 'assignment'
export const PATHS: { id: PathId; label: string; hint: string }[] = [
  { id: 'referral', label: 'Referral', hint: 'Someone recommends you' },
  { id: 'experience', label: 'Previous experience', hint: 'Your route so far counts' },
  { id: 'degree', label: 'Degree', hint: 'A degree in any field' },
  { id: 'assignment', label: 'Event assignment', hint: 'A short task, for example on video' },
]

export interface Attachment {
  name: string
  size: number
  type: string
}

export interface Programme {
  eventId: string | null
  answers: Record<string, Answer>
  home: string
  paths: PathId[]
  referral: { name: string; relation: string }
  degree: { name: string; school: string; year: string }
  assignment: { link: string; file: string }
  links: string[]
  files: Attachment[]
  submitted: boolean
}
export const EMPTY_PROGRAMME: Programme = {
  eventId: null,
  answers: {},
  home: '',
  paths: [],
  referral: { name: '', relation: '' },
  degree: { name: '', school: '', year: '' },
  assignment: { link: '', file: '' },
  links: [''],
  files: [],
  submitted: false,
}

/** Kimi's example paths and evidence (fictional links). */
export const EXAMPLE_EVIDENCE: Pick<Programme, 'paths' | 'referral' | 'degree' | 'assignment' | 'links'> = {
  paths: ['experience', 'referral', 'assignment'],
  referral: { name: 'Elina Virtanen', relation: 'Former manager at Harbourline Hotel' },
  degree: { name: '', school: '', year: '' },
  assignment: { link: 'https://vimeo.com/kimi-muusi/talentmatch-answer', file: '' },
  links: ['https://www.linkedin.com/in/kimi-muusi'],
}

/** A detailed background check, as shown to the Espoo team. */
export interface DeepCheck {
  summary: string
  paths: { path: string; evidence: string }[]
  verified: string[]
  unverified: string[]
}
export const HOMES = ['Espoo', 'Helsinki', 'Vantaa', 'Elsewhere in Finland']

export interface EventQuestion {
  id: string
  label: string
  kind: 'multi' | 'single' | 'text'
  options?: string[]
}

export interface EspooEvent {
  id: string
  name: string
  date: string
  place: string
  about: string
  /** Official page for the real event this is based on. */
  source: string
  /** The event assignment for the 'Event assignment' path. */
  assignment: string
  questions: EventQuestion[]
  /** Kimi's example answers for "Fill automatically". */
  example: Record<string, Answer>
}

/**
 * Based on real events the City of Espoo has organised or co-organised (format, organisers, places and
 * employers from their official pages). Dates are moved to the future for the demo; questions are written
 * for the demo from each event's format and audience.
 */
/** Newest first. */
export const EVENTS: EspooEvent[] = [
  {
    id: 'earthworks-2026',
    name: 'Employer Meetup: Earthworks (Työnantajatreffit)',
    date: 'Thu 11 March 2027, 12.00–15.00',
    place: 'Sello Library lobby, Leppävaarankatu 9',
    about:
      'Meet DriveGo, Kaveriontti, Maanrakennusmaailma and Worker. Includes a short training course for the field and apprenticeships presented by TTS.',
    source: 'https://tyomarkkinatori.fi/tapahtumat/tyonantajatreffit-maanrakennusala',
    assignment: 'Record a 1-minute video: why would you like to work outdoors in earthworks?',
    questions: [
      {
        id: 'route',
        label: 'Which way into the field interests you?',
        kind: 'multi',
        options: ['Short training course', 'Apprenticeship', 'Straight into a job'],
      },
      {
        id: 'employers',
        label: 'Which employers would you like to talk to?',
        kind: 'multi',
        options: ['DriveGo', 'Kaveriontti', 'Maanrakennusmaailma', 'Worker'],
      },
      { id: 'licence', label: 'Do you have a driving licence?', kind: 'single', options: ['B', 'C or higher', 'Not yet'] },
    ],
    example: {
      route: ['Short training course'],
      employers: ['DriveGo', 'Worker'],
      licence: 'B',
    },
  },
  {
    id: 'finland-talentmatch-2025',
    name: 'Finland TalentMatch x Tech and IT',
    date: '3–4 February 2027',
    place: 'Online',
    about:
      'Espoo, Helsinki, Oulu, Tampere, Turku and Vantaa with Work in Finland. One-to-one matchmaking meetings with employers, plus job fair talks.',
    source: 'https://www.workinfinland.com/en/events/finland-talent-match-autumn/',
    assignment: 'Share a link to something you have built, or answer on video: what would you build first in a new role?',
    questions: [
      {
        id: 'fields',
        label: 'Which area are you in?',
        kind: 'multi',
        options: ['Software development', 'AI', 'Cybersecurity', 'Microelectronics', 'Telecom', 'Quantum computing'],
      },
      {
        id: 'stage',
        label: 'Which describes you?',
        kind: 'single',
        options: ['Experienced professional', 'Recent graduate or early career'],
      },
      {
        id: 'location',
        label: 'Where are you now?',
        kind: 'single',
        options: ['Already in Finland', 'Considering relocating'],
      },
      { id: 'hope', label: 'What would you like from a one-to-one meeting?', kind: 'text' },
    ],
    example: {
      fields: ['Software development'],
      stage: 'Recent graduate or early career',
      location: 'Already in Finland',
      hope: 'A first step into tech, for example a customer-facing role at a software company.',
    },
  },
  {
    id: 'speed-dating-2023',
    name: 'Employer Speed Dating: Fail-Safe IT Solutions',
    date: 'Mon 18 January 2027, 14.00–16.00',
    place: 'Espoo Talent Hub, Tekniikantie 4 C',
    about:
      'A company introduction, then 8-minute interviews with international degree students and recent graduates. Free for everyone.',
    source: 'https://www.espoo.fi/en/employer-speed-dating-get-know-fail-safe-it-solutions',
    assignment: 'Record a 1-minute video: introduce yourself and the role you would like to talk about.',
    questions: [
      {
        id: 'role',
        label: 'Which role would you like to interview for?',
        kind: 'single',
        options: ['Organization Specialist Intern', 'Senior Java Developer'],
      },
      {
        id: 'status',
        label: 'Which describes you?',
        kind: 'single',
        options: ['Degree student', 'Recent graduate', 'Other'],
      },
      { id: 'hope', label: 'What would you like to talk about in your 8 minutes?', kind: 'text' },
    ],
    example: {
      role: 'Organization Specialist Intern',
      status: 'Other',
      hope: 'How I improved our hotel check-in, and how that could help your clients.',
    },
  },
  {
    id: 'talentmatch-2021',
    name: 'TalentMatch Espoo',
    date: 'Wed 9 December 2026, 9.00–14.45',
    place: 'Online, Deal Room platform',
    about:
      'Business Espoo and the City of Espoo, with TE-Live. Virtual booths and pre-booked 1-to-1 meetings with employers, in Finnish and English.',
    source: 'https://duunitori.fi/tyoelama/talentmatch-espoo-recruitment-event',
    assignment: 'Record a 2-minute video: tell us about a problem you solved for a customer or colleague.',
    questions: [
      {
        id: 'fields',
        label: 'Which kind of work interests you?',
        kind: 'multi',
        options: ['IT', 'Engineering', 'Business', 'Customer success', 'Other'],
      },
      {
        id: 'experience',
        label: 'Where are you in your career?',
        kind: 'single',
        options: ['Entry level', '2–5 years', '6–10+ years'],
      },
      { id: 'languages', label: 'Which languages do you work in?', kind: 'multi', options: ['English', 'Finnish', 'Swedish'] },
      { id: 'hope', label: 'What kind of employer would you like to meet?', kind: 'text' },
    ],
    example: {
      fields: ['Customer success', 'IT'],
      experience: '2–5 years',
      languages: ['English', 'Finnish'],
      hope: 'A software company where customer skills matter and I can learn the technical side.',
    },
  },
]

/** The event Kimi's demo application uses (best fit for the example). */
export const DEFAULT_EVENT_ID = 'talentmatch-2021'

/** Kimi's LinkedIn profile text for the demo (fictional), as copied from a "Save to PDF" export. */
export const EXAMPLE_LINKEDIN = `Kimi Muusi
Guest Experience Lead at Harbourline Hotel
Espoo, Uusimaa, Finland

Experience
Guest Experience Lead
Harbourline Hotel · Full-time
Jan 2023 - Present
Front Desk Associate
Harbourline Hotel · Full-time
Mar 2021 - Dec 2022

Licenses & certifications
Customer Success Fundamentals · Issued Mar 2025
Data Basics · Issued Aug 2025

Projects
Rebuilt the hotel guest FAQ with AI tools`

/** Other people applying to the programme (fictional), with pre-written summaries for the Espoo review. */
export const PROGRAMME_APPLICANTS: {
  id: string
  name: string
  initials: string
  home: string
  fields: string[]
  hope: string
  summary: string
  paths: PathId[]
  evidence: string[]
  check: DeepCheck
}[] = [
  {
    id: 'priya',
    name: 'Priya Nair',
    initials: 'PN',
    home: 'Espoo',
    fields: ['Learning', 'Customer experience'],
    hope: 'Use eight years of teaching in a learning or onboarding role.',
    summary:
      'Eight years as a science teacher, designing short lessons and mentoring new teachers. Self-taught learning design and Figma basics.',
    paths: ['degree', 'experience'],
    evidence: ['B.Ed_Teacher_Education_degree.pdf', 'https://priyanair.example/lesson-portfolio'],
    check: {
      summary:
        'Eight years teaching science, including a flipped-classroom course built from short videos, and mentoring six new teachers. Recently studied learning design and Figma on their own.',
      paths: [
        { path: 'Degree', evidence: 'Degree certificate attached: Bachelor of Education, teacher education.' },
        { path: 'Previous experience', evidence: 'Teaching 2016–2024 and substitute teaching in Espoo since 2024, as listed in their route.' },
      ],
      verified: ['Degree certificate file names the degree and institution.'],
      unverified: ['Portfolio link could not be opened.'],
    },
  },
  {
    id: 'amira',
    name: 'Amira Haddad',
    initials: 'AH',
    home: 'Vantaa',
    fields: ['Operations', 'Customer experience'],
    hope: 'Move from retail management into operations at a growing company.',
    summary:
      'Six years managing a retail store, including training new staff and handling escalations.',
    paths: ['experience', 'referral'],
    evidence: ['Reference_letter_store_owner.pdf'],
    check: {
      summary:
        'Six years managing an international retail store: daily operations, onboarding new staff and handling customer escalations, working in English.',
      paths: [
        { path: 'Previous experience', evidence: 'Store manager role listed in their route, six years.' },
        { path: 'Referral', evidence: 'Referred by the store owner; a reference letter is attached.' },
      ],
      verified: ['Reference letter confirms the role and dates.'],
      unverified: [],
    },
  },
  {
    id: 'lucas',
    name: 'Lucas Ferreira',
    initials: 'LF',
    home: 'Helsinki',
    fields: ['Technology'],
    hope: 'Find a first role in software after moving to Finland.',
    summary:
      'Four years as a civil engineer in Portugal. Completed an online web development course and built two small apps.',
    paths: ['degree', 'assignment'],
    evidence: ['https://github.com/lucasferreira-example', 'MSc_Civil_Engineering.pdf'],
    check: {
      summary:
        'Civil engineer with four years of experience in Portugal, moving into software. Completed an online web development course and built two small apps.',
      paths: [
        { path: 'Degree', evidence: 'MSc in Civil Engineering, certificate attached.' },
        { path: 'Event assignment', evidence: 'Shared a code repository link as their assignment answer.' },
      ],
      verified: ['Degree certificate attached.'],
      unverified: ['GitHub link could not be opened, so the apps were not reviewed.'],
    },
  },
]
export const SAMPLE_ADMITS = ['you', 'priya', 'amira']

export const APPLICANTS: Applicant[] = [
  {
    id: 'priya',
    name: 'Priya Nair',
    initials: 'PN',
    background: 'Science teacher, 8 years',
    submitted: 'Yesterday',
    motivation:
      'I spent eight years noticing the moment students lose interest and winning them back. Onboarding is the same problem with adults.',
    pretask:
      'I would watch three new customers set up the product without helping them, note every pause, then rewrite the first screen they see.',
    reqStatus: 'have',
    summary:
      'Eight years teaching science, including designing short-format lessons and mentoring new teachers. Self-taught learning design and Figma basics.',
  },
  {
    id: 'jonas',
    name: 'Jonas Lehto',
    initials: 'JL',
    background: 'SaaS support agent, 2 years',
    submitted: '2 days ago',
    motivation: 'I answer the same onboarding questions every day. I want to fix the cause instead of the ticket.',
    pretask:
      'Tag the last 200 support tickets by onboarding step, find the top three, and turn each into an in-app tip or a help article.',
    reqStatus: 'have',
    summary:
      'Two years in SaaS support handling onboarding questions daily. Learning SQL on their own to analyse ticket trends.',
  },
  {
    id: 'amira',
    name: 'Amira Haddad',
    initials: 'AH',
    background: 'Retail store manager, 6 years',
    submitted: '3 days ago',
    motivation: 'I trained dozens of new staff and know what makes a first week work. I would love to do that for customers.',
    pretask: 'Give every new customer a named contact for the first two weeks and a simple checklist. Measure how many finish it.',
    reqStatus: 'other',
    reqHow: 'Worked in English every day at an international retail store.',
    summary:
      'Six years managing a retail store, including onboarding new staff and handling customer escalations.',
  },
  {
    id: 'tomas',
    name: 'Tomás Rivera',
    initials: 'TR',
    background: 'Clinic administrator, 6 years',
    submitted: '4 days ago',
    motivation: 'I automated our clinic rota and saved six hours a week. I like making processes easier for busy people.',
    pretask: 'Map the onboarding steps, remove any that customers never need, and automate the reminder emails first.',
    reqStatus: 'not-yet',
    summary:
      'Six years coordinating clinic schedules; built spreadsheet automations that saved the team six hours a week. Learning Power Automate.',
  },
]

/** Scales for the 8-minute conversation. Observable behaviour only; never summed. */
export const SCALES = [
  { id: 'understand', label: 'Understood the problem', low: 'Jumped to answers', high: 'Asked the right questions' },
  { id: 'reasoning', label: 'Explained their thinking', low: 'Hard to follow', high: 'Clear and reasoned' },
  { id: 'adapt', label: 'Adapted to new information', low: 'Stuck to first idea', high: 'Changed course well' },
]

export const CHAT_SECONDS = 8 * 60

/** Demo autofill for the Choose and Meet steps (fictional). */
export const SAMPLE_INVITES = ['you', 'priya']
export const SAMPLE_EVALUATIONS: Record<string, { ratings: Record<string, number | 'na'>; notes: string }> = {
  you: {
    ratings: { understand: 4, reasoning: 3, adapt: 4 },
    notes: 'Asked which customers drop off first. Changed plan quickly when told engineering was unavailable.',
  },
  priya: {
    ratings: { understand: 3, reasoning: 4, adapt: 'na' },
    notes: 'Clear plan to observe new users before changing anything.',
  },
}

export const YOU = { id: 'you', name: 'Kimi Muusi', initials: 'KM', background: 'Guest experience lead, hospitality' }
