import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Heart, Target, Users, Clock, Trophy, Mail, Globe } from "lucide-react"

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">About Us</h1>
            <p className="text-xl text-gray-300">Passionate about rugby, GAA, and bringing sports fans together</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Our Story */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Heart className="w-6 h-6 mr-3 text-red-400" />
                Our Story
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                The Rugby Quiz Game Platform was born from a simple passion: the love of rugby and GAA sports, combined
                with the thrill of testing knowledge against fellow fans. As lifelong supporters of these incredible
                sports, we noticed that while there were plenty of general trivia games, there was a gap for dedicated,
                high-quality quiz platforms that truly celebrated the depth and richness of rugby and GAA culture.
              </p>
              <p>
                We wanted to create something special – a place where fans could not only test their knowledge but also
                learn new facts, discover historical moments, and connect with a global community of sports enthusiasts.
                Whether you're a casual fan or someone who knows every statistic from the last century, our platform is
                designed to challenge, educate, and entertain.
              </p>
            </CardContent>
          </Card>

          {/* Our Mission */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Target className="w-6 h-6 mr-3 text-blue-400" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                Our mission is to create the ultimate destination for rugby and GAA knowledge testing, where accuracy
                meets entertainment, and where every question is crafted with care and respect for these magnificent
                sports.
              </p>
              <p>
                We believe that sports knowledge should be celebrated, shared, and tested in fair and engaging ways.
                That's why we've built our platform with innovative features like smart answer matching, curated daily
                challenges, and games that reward both speed and accuracy.
              </p>
            </CardContent>
          </Card>

          {/* What Makes Us Different */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Users className="w-6 h-6 mr-3 text-green-400" />
                What Makes Us Different
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">Smart Answer Matching</h4>
                  <p className="text-sm">
                    Our advanced system recognizes different ways of saying the same answer, making gameplay fair and
                    frustration-free.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">Curated Content</h4>
                  <p className="text-sm">
                    Every question is carefully researched and fact-checked by sports enthusiasts who share your
                    passion.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">Fair Play Focus</h4>
                  <p className="text-sm">
                    We prioritize integrity and sportsmanship, creating a welcoming environment for all skill levels.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">Daily Challenges</h4>
                  <p className="text-sm">
                    Fresh content every day keeps the experience exciting and gives you new reasons to return.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Our Games */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* TenaBall */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Trophy className="w-6 h-6 mr-3 text-yellow-400" />
                  TenaBall
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  Inspired by the classic TV format, TenaBall challenges you to climb a ladder of 10 increasingly
                  difficult questions. Start at position 10 and work your way to the coveted #1 spot, but be careful –
                  three wrong answers and you're out!
                </p>
                <p>
                  What makes TenaBall special is our smart answer system that recognizes multiple correct ways to answer
                  the same question. Whether you say "Ireland" or "Irish national team," our system understands context
                  and intent, making the game fair and enjoyable.
                </p>
                <p>
                  Each day brings a new ladder with fresh questions, and you can build streaks by completing consecutive
                  daily challenges. It's not just about what you know – it's about strategy, risk management, and
                  knowing when to trust your instincts.
                </p>
                <div className="flex gap-2 mt-4">
                  <Link href="/game/rugby-tenable">
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      Play Rugby TenaBall
                    </Button>
                  </Link>
                  <Link href="/gaa/tenable">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Play GAA TenaBall
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Against the Clock */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Clock className="w-6 h-6 mr-3 text-orange-400" />
                  Against the Clock
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  For those who thrive under pressure, Against the Clock is the ultimate test of quick thinking and
                  sports knowledge. You start with 30 seconds on the clock, and every correct answer adds 20 precious
                  seconds to keep you in the game.
                </p>
                <p>
                  This isn't just about speed – it's about finding the perfect balance between quick responses and
                  accuracy. Rush too much and you'll make mistakes; take too long and the clock runs out. The tension
                  builds with every question as you race against time.
                </p>
                <p>
                  The game rewards both knowledge and strategy. Do you go for the obvious answer quickly, or take a
                  moment to think of a more specific response? Every second counts, and every decision matters in this
                  high-intensity format.
                </p>
                <div className="flex gap-2 mt-4">
                  <Link href="/game/against-the-clock">
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      Play Rugby Clock
                    </Button>
                  </Link>
                  <Link href="/gaa/against-the-clock">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Play GAA Clock
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Community */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Globe className="w-6 h-6 mr-3 text-cyan-400" />
                Our Community
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                We're building more than just a quiz platform – we're creating a global community of rugby and GAA
                enthusiasts. From seasoned supporters who remember every World Cup final to newcomers just discovering
                the beauty of these sports, everyone has a place here.
              </p>
              <p>
                Our community values knowledge, respect, and good sportsmanship. We celebrate both the incredible depth
                of veteran fans and the enthusiasm of those just starting their journey. Every player contributes to the
                vibrant atmosphere that makes our platform special.
              </p>
              <p>
                Looking ahead, we're excited to introduce features like leaderboards, community challenges, and ways for
                fans to connect and share their passion for rugby and GAA. The future holds exciting possibilities for
                bringing our community even closer together.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Mail className="w-6 h-6 mr-3 text-pink-400" />
                Get in Touch
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                We love hearing from our community! Whether you have suggestions for new features, questions about the
                games, feedback on our content, or just want to share your passion for rugby and GAA, we're always
                excited to connect.
              </p>
              <p>
                Your input helps shape the future of our platform. We regularly implement suggestions from our users and
                are always looking for ways to improve the experience for everyone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Link href="/contact">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Us
                  </Button>
                </Link>
                <Link href="/terms">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Terms of Service
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/rugby" className="hover:text-white transition-colors">
              Rugby Games
            </Link>
            <Link href="/gaa" className="hover:text-white transition-colors">
              GAA Games
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
