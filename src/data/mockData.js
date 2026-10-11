export const currentUser = {
  id: 'usr_me',
  name: 'Alex Vance',
  handle: '@alexvance',
  role: 'Staff AI Systems Architect',
  company: 'Nova Dynamics',
  location: 'San Francisco, CA (Hybrid)',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
  bio: 'Building autonomous agent graphs & high-throughput distributed neural architectures. Obsessed with 3D spatial computing & verifiable proof-of-work.',
  workmarkScore: 99.2,
  verifiedHash: '0x8f4c...b92a',
  connectionsCount: 1420,
  mutualConnections: 84,
  endorsementsCount: 312,
  skills: [
    { name: 'Distributed Systems', score: 98, level: 'Expert', verified: true },
    { name: 'LLM Agent Architectures', score: 99, level: 'Master', verified: true },
    { name: 'Three.js / WebGL 3D', score: 94, level: 'Advanced', verified: true },
    { name: 'Rust & CUDA Kernel Tuning', score: 91, level: 'Advanced', verified: true },
    { name: 'System Design & Scalability', score: 97, level: 'Expert', verified: true },
  ],
  experience: [
    {
      role: 'Staff AI Systems Architect',
      company: 'Nova Dynamics',
      period: '2023 - Present · 2 yrs',
      location: 'San Francisco, CA',
      description: 'Architecting multi-agent reasoning meshes serving 120M daily inference requests at sub-40ms latency.',
      skillsTagged: ['Agent Graphs', 'PyTorch', 'Distributed Tracing']
    },
    {
      role: 'Principal Frontend Engineer',
      company: 'Hyperion Spatial Labs',
      period: '2021 - 2023 · 2 yrs',
      location: 'San Francisco, CA',
      description: 'Led the core WebGL engine team delivering collaborative 3D scene streaming for enterprise engineering teams.',
      skillsTagged: ['Three.js', 'WebGPU', 'WebAssembly']
    }
  ],
  artifacts: [
    {
      id: 'art_1',
      title: 'Decentralized Consensus Engine (100k TPS)',
      type: 'Open Source Repository',
      role: 'Lead Distributed Systems Architect',
      distribution: `Work Distribution & Architecture Breakdown:
• Core Protocol Design (35%): Architected deterministic Byzantine fault-tolerant consensus pipeline.
• Rust Kernel Optimization (40%): Wrote zero-copy memory management and SIMD batching loops.
• Benchmarking & CI/CD (25%): Built distributed simulation network measuring 112,000 tx/sec under 15% network packet loss.`,
      stars: '4.8k',
      metric: 'Benchmarked 112,000 tx/sec with deterministic Byzantine tolerance.',
      techStack: 'Rust, Tokio, WebAssembly, Libp2p, GitHub Actions',
      demoUrl: 'https://consensus-mesh.io',
      link: 'github.com/alexvance/consensus-mesh',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
      verified: true
    },
    {
      id: 'art_2',
      title: 'Neural Spatial Audio Streaming Standard',
      type: 'Technical Specification & RFC',
      role: 'Principal Audio Spatialization Engineer',
      distribution: `Work Distribution & Architecture Breakdown:
• HRTF Synthesis Engine (45%): Implemented Head-Related Transfer Function spatial binaural filtering.
• Web Audio API Mesh (30%): Designed low-latency browser streaming pipeline with sub-18ms buffer latency.
• Hardware Vendor Consortia (25%): Led drafting of open RFC standard ratified by 14 hardware manufacturers.`,
      stars: '1.2k',
      metric: 'Adopted by 14 spatial computing hardware vendors.',
      techStack: 'C++, WebAssembly, Web Audio API, DSP, Three.js',
      demoUrl: 'https://workmark.io/dossier/spec/spatial-audio',
      link: 'workmark.io/dossier/spec/spatial-audio',
      image: '', // Demonstrates clean blueprint fallback when image is omitted!
      verified: true
    }
  ]
};

export const initialPosts = [
  {
    id: 'post_1',
    author: {
      name: 'Elena Rostova, Ph.D.',
      handle: '@elena_quantum',
      role: 'VP of AI Research · DeepScale Labs',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
      workmarkScore: 99.8,
      verified: true
    },
    timestamp: '2h ago',
    content: `We just open-sourced our hybrid 3D Gaussian Splatting pipeline optimized for browser rendering at 120 FPS on mobile chips! 🚀\n\nTraditional mesh generation was taking minutes per scene. With direct neural point field quantization, we reduced load times to under 180ms with 0 visual artifacting.\n\nCheck out the live interactive benchmark link below. Proof-of-work cryptographic verification is embedded on-chain via Workmark.`,
    tags: ['ComputerVision', 'ThreeJS', 'WebGPU', 'AIResearch'],
    stats: {
      vouches: 432,
      insightful: 189,
      inspire: 94,
      comments: 67,
      shares: 112
    },
    userVouched: false,
    artifactCard: {
      title: 'GaussianCore 3D Engine Benchmark v2.4',
      type: 'Production Architecture System',
      performance: '120 FPS / 14MB VRAM footprint',
      badge: 'Workmark Verified Proof'
    },
    commentsList: [
      {
        id: 'c_1',
        author: 'Marcus Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        role: 'Graphics Lead at Epic',
        text: 'The memory compression step is brilliant. Did you use custom quantized FP8 buffers for the splat covariance matrices?',
        timestamp: '1h ago',
        vouches: 18
      }
    ]
  },
  {
    id: 'post_2',
    author: {
      name: 'Devin K. Thorne',
      handle: '@devin_founder',
      role: 'Founder & CEO · Synthesis Cloud ($32M Series A)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      workmarkScore: 97.4,
      verified: true
    },
    timestamp: '4h ago',
    content: `Unpopular opinion in engineering leadership:\n\nStop screening developers with reverse-binary-tree Leetcode puzzles. At Synthesis, we replaced our entire hiring filter with Workmark Proof-of-Work dossiers.\n\nCandidates present 1 real, verifiable system they shipped: architecture diagrams, latency tradeoffs, and failure recovery logs. Our offer acceptance jumped to 92% and 90-day retention is 100%.`,
    tags: ['EngineeringLeadership', 'Hiring', 'Startups', 'ProofOfWork'],
    stats: {
      vouches: 1208,
      insightful: 845,
      inspire: 340,
      comments: 215,
      shares: 380
    },
    userVouched: true,
    commentsList: []
  },
  {
    id: 'post_3',
    author: {
      name: 'Siddharth Rao',
      handle: '@siddharth_dev',
      role: 'Lead Kernel Engineer · Veloce Network',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
      workmarkScore: 98.1,
      verified: true
    },
    timestamp: '7h ago',
    content: `Milestone reached: Our team just closed a zero-downtime database migration over 450 Terabytes of telemetry data across 6 continents!\n\nDual-write proxy + zero-copy replication buffer in Rust meant our p99 API latency did not spike higher than 12ms throughout the 48-hour cutover.`,
    tags: ['RustLang', 'Databases', 'CloudArchitecture', 'HighAvailability'],
    stats: {
      vouches: 670,
      insightful: 310,
      inspire: 125,
      comments: 48,
      shares: 89
    },
    userVouched: false,
    commentsList: []
  }
];

export const networkNodes = [
  { id: '1', name: 'Dr. Sarah Lin', role: 'Head of Neuro-AI', company: 'BrainLink Labs', score: 99.5, connections: 3800, mutual: 42, avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', category: 'AI & Research', coordinates: { x: 30, y: 40, z: -20 }, status: 'connected' },
  { id: '2', name: 'Julian Drake', role: 'Chief Product Officer', company: 'Apex Spatial', score: 96.8, connections: 2100, mutual: 19, avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80', category: 'Executive', coordinates: { x: -50, y: 20, z: 30 }, status: 'pending' },
  { id: '3', name: 'Aaliyah Morales', role: 'Principal Design Technologist', company: 'Starlight Interactive', score: 98.2, connections: 1840, mutual: 27, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', category: 'Design & Spatial', coordinates: { x: 40, y: -30, z: 40 }, status: 'suggested' },
  { id: '4', name: 'Liam O\'Connor', role: 'Staff Rust & Systems Engineer', company: 'Prism Cryptography', score: 97.9, connections: 920, mutual: 15, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80', category: 'Systems & Security', coordinates: { x: -20, y: -40, z: -40 }, status: 'suggested' },
  { id: '5', name: 'Chloe Kim', role: 'VP Engineering', company: 'Aether Cloud', score: 99.1, connections: 4500, mutual: 64, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80', category: 'Executive', coordinates: { x: 60, y: 10, z: -10 }, status: 'connected' },
  { id: '6', name: 'Tariq Al-Mansoor', role: 'Autonomous Agent Architect', company: 'Cognitive Foundry', score: 98.7, connections: 1650, mutual: 31, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80', category: 'AI & Research', coordinates: { x: -35, y: 45, z: 15 }, status: 'suggested' }
];

export const initialJobs = [
  {
    id: 'job_1',
    title: 'Principal 3D Graphics & Spatial Engine Architect',
    company: 'Hyperion Spatial Labs',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    location: 'San Francisco, CA / Remote (Global)',
    type: 'Full-time · Staff Tier',
    salary: '$240,000 - $340,000 + 0.35% Equity',
    matchScore: 98,
    workmarkVerifiedEmployer: true,
    skillsRequired: ['Three.js', 'WebGPU', 'Shader Tuning (GLSL)', 'Distributed Scene Graphs'],
    description: 'We are pioneering web-first spatial collaboration for next-generation hardware. You will architect low-latency rasterization engines running directly in modern browser sandboxes.',
    applicantsCount: 24,
    posted: '2 days ago',
    benefits: ['Unlimited hardware budget', '$15k annual conference stipend', 'Comprehensive family healthcare', '401(k) 6% match']
  },
  {
    id: 'job_2',
    title: 'Staff LLM Agent Infrastructure Lead',
    company: 'Nova Dynamics',
    logo: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=100&auto=format&fit=crop&q=80',
    location: 'New York, NY or Remote',
    type: 'Full-time · Leadership',
    salary: '$260,000 - $380,000 + Top Tier Grants',
    matchScore: 96,
    workmarkVerifiedEmployer: true,
    skillsRequired: ['Agent Graphs', 'PyTorch', 'Distributed Tracing', 'vLLM / TensorRT-LLM'],
    description: 'Own the distributed execution graph powering enterprise reasoning workflows. Scale our cluster from 4,000 to 25,000 H100 GPUs while maintaining strict sub-second SLA.',
    applicantsCount: 38,
    posted: '1 day ago',
    benefits: ['Full remote flexibility', 'Top 1% compensation', 'Wellness & gym stipends', 'Relocation package']
  },
  {
    id: 'job_3',
    title: 'Senior Product Designer (Design Systems & Spatial UI)',
    company: 'Synthesis Cloud',
    logo: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&auto=format&fit=crop&q=80',
    location: 'Austin, TX (Hybrid)',
    type: 'Full-time',
    salary: '$185,000 - $235,000 + Equity',
    matchScore: 89,
    workmarkVerifiedEmployer: true,
    skillsRequired: ['Figma Tokens', 'Micro-interactions', 'Tailwind CSS', 'Design Engineering'],
    description: 'Craft high-density, lightning-fast developer tools with dark-mode first design languages and fluid 60fps micro-animations.',
    applicantsCount: 52,
    posted: '3 days ago',
    benefits: ['Bespoke ergonomics desk allowance', 'Annual company retreats in Iceland & Tokyo', 'Parental leave 20 weeks']
  }
];

export const initialMessages = [
  {
    id: 'conv_1',
    participant: {
      name: 'Dr. Sarah Lin',
      role: 'Head of Neuro-AI at BrainLink Labs',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      online: true,
      workmarkScore: 99.5
    },
    lastMessage: 'Your RFC on deterministic agent execution is incredible. Would love to compare notes on our GPU benchmarks.',
    timestamp: '14m ago',
    unread: 2,
    messages: [
      { id: 'm1', sender: 'them', text: 'Hey Alex! Caught your latest Workmark proof on the 100k TPS consensus mesh.', time: '10:42 AM' },
      { id: 'm2', sender: 'me', text: 'Thanks Sarah! We ran tests on 64 clustered nodes last weekend with zero partition forks.', time: '10:45 AM' },
      { id: 'm3', sender: 'them', text: 'Your RFC on deterministic agent execution is incredible. Would love to compare notes on our GPU benchmarks.', time: '10:48 AM' }
    ]
  },
  {
    id: 'conv_2',
    participant: {
      name: 'Julian Drake',
      role: 'Chief Product Officer at Apex Spatial',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
      online: false,
      workmarkScore: 96.8
    },
    lastMessage: 'Sent you the confidential deck for our Series B expansion. Let me know what you think!',
    timestamp: '2h ago',
    unread: 0,
    messages: [
      { id: 'm1', sender: 'them', text: 'Sent you the confidential deck for our Series B expansion. Let me know what you think!', time: '8:15 AM' }
    ]
  }
];

export const initialAdminStats = {
  kpis: {
    totalUsers: '148,920',
    userGrowth: '+23.4%',
    dailyActiveUsers: '58,410',
    verifiedProofs: '112,850',
    activeJobs: '4,190',
    platformARR: '$2.85M',
    systemUptime: '99.994%'
  },
  userSignupsMonthly: [
    { month: 'May', count: 12400 },
    { month: 'Jun', count: 18900 },
    { month: 'Jul', count: 24500 },
    { month: 'Aug', count: 32800 },
    { month: 'Sep', count: 44200 },
    { month: 'Oct', count: 58410 }
  ],
  talentDistribution: [
    { domain: 'AI & Machine Learning', percentage: 38, count: '56.5k', color: '#6366F1' },
    { domain: 'Distributed & Systems Engineering', percentage: 27, count: '40.2k', color: '#06B6D4' },
    { domain: 'Spatial, 3D & Graphics', percentage: 19, count: '28.3k', color: '#8B5CF6' },
    { domain: 'Product & Executive Leadership', percentage: 16, count: '23.8k', color: '#10B981' }
  ],
  managedUsers: [
    { id: 'u_101', name: 'Dr. Sarah Lin', email: 'sarah.lin@brainlink.ai', role: 'Verified Expert', score: 99.5, status: 'Active', flagged: false },
    { id: 'u_102', name: 'Julian Drake', email: 'julian@apexspatial.com', role: 'Employer / Founder', score: 96.8, status: 'Active', flagged: false },
    { id: 'u_103', name: 'Anonymous Bot_99', email: 'spam.bot99@tempmail.xyz', role: 'Standard', score: 12.0, status: 'Suspended', flagged: true },
    { id: 'u_104', name: 'Elena Rostova', email: 'elena@deepscale.org', role: 'Verified Researcher', score: 99.8, status: 'Active', flagged: false },
    { id: 'u_105', name: 'Liam O\'Connor', email: 'liam@prismcrypto.tech', role: 'Verified Expert', score: 97.9, status: 'Active', flagged: false },
    { id: 'u_106', name: 'CryptoScamLead', email: 'promotions@getrichfast.biz', role: 'Standard', score: 18.4, status: 'Banned', flagged: true }
  ]
};
