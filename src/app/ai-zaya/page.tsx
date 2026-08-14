import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Sparkles, 
  Download, 
  Smartphone, 
  Zap, 
  ShieldCheck, 
  Code, 
  Bot, 
  Star, 
  CheckCircle, 
  ArrowRight, 
  QrCode, 
  Globe, 
  Gamepad2, 
  GraduationCap, 
  PenTool, 
  Lightbulb, 
  Mic, 
  Sliders, 
  Users, 
  Rocket, 
  Briefcase, 
  Brain, 
  Layers, 
  Cpu
} from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI ZAYA — AI-Powered Intelligent Assistant | ZAYA CODE HUB',
  description: 'AI ZAYA is an intelligent AI assistant developed by ZAYA CODE HUB featuring Brain Games, 50+ language support, voice experience, learning, and programming assistance. Install on Android now!',
};

export default function AiZayaPage() {
  const playStoreLink = "https://play.google.com/store/apps/details?id=com.zayaai.app&pcampaignid=web_share";

  const keyFeatures = [
    {
      icon: <Bot className="h-7 w-7 text-blue-400" />,
      title: "🤖 AI Assistant",
      subtitle: "Intelligent Natural Conversations",
      description: "Ask questions, request explanations, generate content, solve problems, summarize documents, and get step-by-step guidance 24/7.",
      bullets: ["Question Answering & Explanations", "Summarization & Writing", "Brainstorming & General Knowledge"]
    },
    {
      icon: <Gamepad2 className="h-7 w-7 text-purple-400" />,
      title: "🧠 Brain Game Assistant",
      subtitle: "Interactive Cognitive Exercises",
      description: "Combines AI assistance with interactive brain-training activities to test and improve thinking abilities, logic, and memory.",
      bullets: ["Memory & Logical Reasoning", "Word Games & Pattern Recognition", "Mathematical Challenges & Puzzles"]
    },
    {
      icon: <Globe className="h-7 w-7 text-emerald-400" />,
      title: "🌍 Speaks 50+ Languages",
      subtitle: "Global Multilingual Freedom",
      description: "Communicate seamlessly in over 50 languages via text and voice without language barriers.",
      bullets: ["50+ Languages Supported", "Multilingual Voice & Text", "Cross-cultural Learning & Translation"]
    },
    {
      icon: <GraduationCap className="h-7 w-7 text-amber-400" />,
      title: "🎓 AI Learning Assistant",
      subtitle: "Personal Study Companion",
      description: "Acts as a 24/7 personal tutor for students. Understand difficult subjects, prepare for exams, practice questions, and summarize topics.",
      bullets: ["Exam Preparation & Practice", "Step-by-Step Solutions", "Concept Simplification"]
    },
    {
      icon: <Code className="h-7 w-7 text-cyan-400" />,
      title: "💻 Programming Assistant",
      subtitle: "Coding & Debugging Guide",
      description: "Assists beginners and experienced developers to understand programming concepts, debug code, fix errors, and generate code examples.",
      bullets: ["Code Debugging & Error Analysis", "Syntax & Logic Explanation", "Multi-language Code Samples"]
    },
    {
      icon: <PenTool className="h-7 w-7 text-rose-400" />,
      title: "✍️ Content & Writing Assistant",
      subtitle: "Craft High-Quality Text",
      description: "Generate and refine articles, social media captions, professional emails, project documentation, scripts, and creative copy.",
      bullets: ["Articles & Email Drafting", "Scripting & Social Captions", "Proofreading & Tone Rewriting"]
    },
    {
      icon: <Lightbulb className="h-7 w-7 text-yellow-400" />,
      title: "💡 Idea & Creativity Assistant",
      subtitle: "Turn Ideas into Reality",
      description: "Transform simple ideas into structured concepts. Brainstorm startup ideas, business plans, creative projects, marketing campaigns, and events.",
      bullets: ["Startup & Business Brainstorming", "Creative Project Concepts", "Event & Campaign Planning"]
    },
    {
      icon: <Mic className="h-7 w-7 text-indigo-400" />,
      title: "🗣️ Interactive Voice Experience",
      subtitle: "Natural Hands-Free Interaction",
      description: "Speak directly to AI ZAYA using spoken language for hands-free assistance, natural speech recognition, and instant audio feedback.",
      bullets: ["Spoken Voice Input", "Hands-free Conversations", "Natural Speech Synthesis"]
    },
    {
      icon: <Sliders className="h-7 w-7 text-teal-400" />,
      title: "🎯 Personalized Assistance",
      subtitle: "Tailored to Your Exact Style",
      description: "Adapt answers to your preferred depth, tone, and format. Ask AI ZAYA for beginner-friendly explanations, step-by-step breakdowns, or concise summaries.",
      bullets: ["Custom Output Style & Depth", "Beginner to Advanced Tone", "Step-by-Step Problem Solving"]
    }
  ];

  const targetAudiences = [
    {
      role: "Students",
      emoji: "👨‍🎓",
      desc: "For studying, exam prep, learning programming, brain games, and simplifying complex topics."
    },
    {
      role: "Developers",
      emoji: "👨‍💻",
      desc: "For programming guidance, debugging code, understanding technical concepts, and algorithm assistance."
    },
    {
      role: "Content Creators",
      emoji: "✍️",
      desc: "For generating captions, video scripts, creative ideas, descriptions, and copy proofreading."
    },
    {
      role: "Professionals",
      emoji: "💼",
      desc: "For writing emails, boosting workplace productivity, summarization, and daily workflow assistance."
    },
    {
      role: "Entrepreneurs",
      emoji: "🚀",
      desc: "For startup brainstorming, business concept validation, planning, and marketing strategies."
    },
    {
      role: "General Users",
      emoji: "🌎",
      desc: "For everyday Q&A, language learning, brain training, entertainment, and general assistance."
    }
  ];

  const futureRoadmap = [
    "Advanced AI Contextual Conversations",
    "Expanded Multilingual Voice Synthesis",
    "AI-Powered Document & Image Understanding",
    "More Interactive Brain Games & Logic Puzzles",
    "Personalized AI Assistants & Intelligent Automation"
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 pb-20 selection:bg-blue-600 selection:text-white">
      {/* Background glow graphics */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[30rem] bg-gradient-to-b from-blue-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative container mx-auto px-6 pt-12 pb-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          
          <div className="flex-1 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-400 text-sm font-bold mb-6">
              <Sparkles className="h-4 w-4 animate-pulse text-amber-400" />
              <span>DEVELOPED BY ZAYA CODE HUB</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] mb-4">
              AI ZAYA <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                AI-Powered Intelligent Assistant
              </span>
            </h1>

            <p className="text-xl sm:text-2xl font-semibold text-blue-400 mb-6 italic tracking-wide">
              &ldquo;Learn. Think. Create. Communicate.&rdquo;
            </p>

            <p className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed">
              An intelligent assistant developed by <strong>ZAYA CODE HUB</strong> to provide users with an easy, interactive, and powerful digital assistant experience across education, productivity, creativity, brain games, and problem-solving.
            </p>

            {/* Install Call To Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8">
              <a
                href={playStoreLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Download className="h-6 w-6" />
                <span>Install on Google Play</span>
              </a>

              <a
                href="#download-section"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 font-semibold text-lg hover:bg-slate-800 transition-all"
              >
                <Smartphone className="h-5 w-5 text-blue-400" />
                <span>Quick Scan QR Code</span>
              </a>
            </div>

            {/* Quick Specs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-slate-400 border-t border-slate-800/80 pt-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="font-bold text-white ml-2">4.9 Rating</span>
              </div>
              <div className="h-4 w-px bg-slate-800 hidden sm:block" />
              <div>🌍 Speaks 50+ Languages</div>
              <div className="h-4 w-px bg-slate-800 hidden sm:block" />
              <div>🧠 Brain Game Assistant</div>
            </div>
          </div>

          {/* App Preview Image */}
          <div className="flex-1 w-full max-w-md lg:max-w-xl relative flex justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 to-purple-600/30 blur-2xl rounded-full transform scale-90" />
            <div className="relative rounded-3xl p-3 bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden hover:border-blue-500/50 transition-colors">
              <Image
                src="/images/ai-zaya-app.png"
                alt="AI ZAYA Mobile Application Developed by ZAYA CODE HUB"
                width={600}
                height={600}
                className="rounded-2xl object-cover shadow-lg w-full h-auto"
                priority
              />
            </div>
          </div>

        </div>
      </section>

      {/* Feature Highlights Ticker / Bar */}
      <section className="py-8 bg-gradient-to-r from-blue-950/60 via-slate-900 to-purple-950/60 border-y border-slate-800/80">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-2xl font-extrabold text-blue-400">50+</div>
              <div className="text-xs text-slate-400 mt-1 font-semibold uppercase">Languages Supported</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-2xl font-extrabold text-purple-400">9-in-1</div>
              <div className="text-xs text-slate-400 mt-1 font-semibold uppercase">AI Assistant Modules</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-2xl font-extrabold text-emerald-400">24/7</div>
              <div className="text-xs text-slate-400 mt-1 font-semibold uppercase">Voice & Text Interaction</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-2xl font-extrabold text-amber-400">100%</div>
              <div className="text-xs text-slate-400 mt-1 font-semibold uppercase">Free to Install</div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Features Grid */}
      <section className="py-20 container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            COMPREHENSIVE CAPABILITIES
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mt-4 mb-4">
            Key Features of <span className="text-blue-400">AI ZAYA</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            AI ZAYA is more than just a chatbot. It combines AI assistance, brain-training games, voice capabilities, and multi-domain guidance into one powerful platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {keyFeatures.map((f, index) => (
            <div 
              key={index}
              className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-900 transition-all duration-300 flex flex-col justify-between group shadow-lg"
            >
              <div>
                <div className="p-3.5 rounded-2xl bg-slate-800/80 w-fit mb-6 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{f.title}</h3>
                <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4">{f.subtitle}</div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">{f.description}</p>
              </div>

              <div className="border-t border-slate-800/80 pt-4 space-y-2">
                {f.bullets.map((b, i) => (
                  <div key={i} className="flex items-center text-xs text-slate-400 gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brain Game Feature Special Section */}
      <section className="py-16 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border-y border-purple-800/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase mb-4">
                <Brain className="h-4 w-4 text-purple-400" />
                <span>Interactive Learning & Cognitive Training</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                Brain Game Assistant — Learn While Playing
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Participate in interactive games designed to test and sharpen memory, logical reasoning, word power, pattern recognition, and quick-thinking challenges.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Memory Challenges", "Logical Reasoning", "Word Games", "Pattern Recognition", "Math Puzzles", "Concentration"].map((game, idx) => (
                  <span key={idx} className="text-xs bg-purple-900/40 text-purple-200 border border-purple-700/40 px-3 py-1.5 rounded-xl font-semibold">
                    🎮 {game}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-purple-500/30 text-center w-full md:w-auto shrink-0 shadow-2xl">
              <div className="text-4xl mb-2">🧠⚡</div>
              <div className="text-lg font-bold text-white">Brain-Training AI</div>
              <div className="text-xs text-purple-300 mt-1">Hints, Feedback & Error Guidance</div>
            </div>
          </div>
        </div>
      </section>

      {/* Who Can Use AI ZAYA? Section */}
      <section className="py-20 container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            UNIVERSAL ACCESSIBILITY
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 mb-4">
            Who Can Use <span className="text-purple-400">AI ZAYA</span>?
          </h2>
          <p className="text-slate-400 text-base">
            Designed for anyone looking to learn, think, create, communicate, and solve daily challenges faster.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {targetAudiences.map((aud, index) => (
            <div key={index} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="text-3xl mb-3">{aud.emoji}</div>
              <h3 className="text-lg font-bold text-white mb-2">{aud.role}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{aud.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vision & Developed By ZAYA CODE HUB */}
      <section className="py-20 bg-slate-900/50 border-t border-slate-800">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase mb-4">
                <Rocket className="h-4 w-4 text-blue-400" />
                <span>OUR VISION</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white mb-6">
                Making Artificial Intelligence Accessible & Useful for Everyone
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
                The vision behind <strong>AI ZAYA</strong> is to make artificial intelligence accessible, interactive, multilingual, and useful for everyone around the world.
              </p>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Instead of limiting AI to a single chatbot purpose, <strong>ZAYA CODE HUB</strong> built AI ZAYA as a comprehensive digital assistant combining intelligent conversations, learning support, brain games, voice interaction, and productivity.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-blue-500/30 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Cpu className="h-5 w-5 text-blue-400" />
                Developed by ZAYA CODE HUB
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                AI ZAYA is proudly developed by <strong>ZAYA CODE HUB</strong>, a technology and software development team focused on building innovative digital products and practical AI solutions.
              </p>

              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Future Roadmap Capabilities:</h4>
              <div className="space-y-2">
                {futureRoadmap.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                    <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Download Section & QR Code Box */}
      <section id="download-section" className="py-20 container mx-auto px-6">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-blue-900/50 via-indigo-900/50 to-purple-900/50 border border-blue-500/40 p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="flex-1 text-center md:text-left">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">GET THE APP NOW</span>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-white mt-2 mb-4">
                Install AI ZAYA Today
              </h3>
              <p className="text-slate-200 text-sm sm:text-base mb-6 max-w-lg">
                Experience AI-powered conversations, brain games, and productivity assistance directly on your Android phone.
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <a
                  href={playStoreLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base transition-all shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95"
                >
                  Install from Google Play
                </a>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center p-6 rounded-2xl bg-white text-slate-900 shadow-2xl shrink-0">
              <QrCode className="h-28 w-28 text-slate-900 mb-2" />
              <span className="text-xs font-bold text-slate-800">Scan to Install on Android</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Tagline Banner */}
      <div className="text-center pt-8 border-t border-slate-800/80">
        <p className="text-lg font-bold text-white">AI ZAYA — Learn. Think. Create. Communicate.</p>
        <p className="text-sm text-slate-400 mt-1 font-semibold">Developed by ZAYA CODE HUB.</p>
      </div>
    </div>
  );
}
