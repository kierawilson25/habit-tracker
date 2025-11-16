import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from "@/components";

const AboutPage = () => {
  return (
    <div className="bg-black min-h-screen text-white">
      {/* Hero Section - Visible without scrolling */}
      <div className="px-6 pt-12 pb-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-green-500 mb-8">About</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div>
          
          {/* Opening */}
          <div className="mb-16 text-lg text-gray-300 leading-relaxed space-y-6">
            <p>
              I built Grains of Sand after listening to a podcast about building a relationship with yourself. The host talked about showing up for yourself in three ways: physically, mentally, and spiritually. She said that this is the key to feeling confident and not depending on other peoples views of you.
            </p>
            <p>
              So I committed to five habits a day: Duolingo for mental growth, reading for knowledge, working out for my body, meditation for my spirit, and 20 minutes of coding to build something I was proud of. Streaks and stats really motivate me so I relied on them alot, but I hated how scattered it was. Duolingo had its own streak, Fable tracked my reading, GitHub showed my contributions. I had a way to track three of my habits but I didn't have a way to track the other ones, and it was all in different places.
            </p>
            <p className="text-xl text-white font-semibold border-l-4 border-green-500 pl-6 py-3 bg-green-950/30">
              I wanted one place to see how I was showing up for myself across all dimensions.
            </p>
          </div>

          {/* The Build */}
          <div className="mb-16 bg-gradient-to-br from-green-950/40 to-black border border-green-900 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-green-500 mb-6">Twenty Minutes a Day</h2>
            <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
              <p>
                In June 2025, I committed to building this app for just 20 minutes every single day. Just 20 minutes. Sometimes all I did was read articles. Sometimes I would just sit and stare at a bug. But I made a promise to myself that I would spend 20 minutes building each day.
              </p>
              <p>
                 And those grains of sand piled up into what you're looking at right now. My github contributions graph has turned almost fully green since June 2025, and I've built something I'm really proud of.
              </p>
              <p className="text-white font-semibold">
                This site is living proof that small, consistent action actually works. It wasn't easy at first, I kept getting stuck and it felt like things were taking forever. But whenever I would look back at a 2 week span I would be so impressed by how much I had completed.
              </p>
            </div>
          </div>

          {/* Philosophy */}
          <div className="mb-16 text-lg text-gray-300 leading-relaxed space-y-6">
            <p>
              There's a saying: <span className="text-green-400 font-semibold">"You can build a tower by gathering grains of sand."</span> Thats the whole idea here. You don't need to make huge changes in your life to see real results. You just need to show up, a little bit, every day.
            </p>
            <p>
              Grains of Sand is a simplified habit tracker that lets you add up to five habits — just five, to keep you focused on what actually matters. You see your streaks, view your stats, and watch your tower grow. But more than that, you build trust with yourself. You become the person who follows through.
              You'll start to notice that its easy to add on other things that you do daily too, and after jsut a few weeks you will see how much impact small action has. Say you commit to 10 pages of reading a day.
              Thats 70 pages a week, 300 pages a month, and over 3,600 pages a year. Thats a whole book every month, just from one small habit.
            </p>
            <p>So what are you waiting for? Start building your tower today.</p>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <div className="inline-block bg-gradient-to-br from-green-950/60 to-black border-2 border-green-500 rounded-xl p-10">
              <p className="text-xl text-gray-300 mb-6">
                Ready to start building your tower?
              </p>
            <Button href="/sign-up">
              {"Start Tracking Today"}
            </Button>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-gray-500 italic mt-12">
            <p>One grain at a time. That's all it takes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;