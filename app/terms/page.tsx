import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileText, Shield, Users, Gavel, Eye, AlertTriangle, Edit, Mail } from "lucide-react"

export default function TermsOfService() {
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
            <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
            <p className="text-xl text-gray-300">Please read these terms carefully before using our platform</p>
            <p className="text-sm text-gray-400 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Terms Content */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 1. Acceptance of Terms */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <FileText className="w-6 h-6 mr-3 text-blue-400" />
                1. Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                By accessing and using the Rugby Quiz Game Platform ("the Platform"), you accept and agree to be bound
                by the terms and provision of this agreement. If you do not agree to abide by the above, please do not
                use this service.
              </p>
              <p>
                These Terms of Service apply to all users of the Platform, including visitors, registered users, and
                contributors. The Platform is owned and operated by the Rugby Quiz Game Platform team.
              </p>
            </CardContent>
          </Card>

          {/* 2. Use License */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Shield className="w-6 h-6 mr-3 text-green-400" />
                2. Use License
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                Permission is granted to temporarily access the Platform for personal, non-commercial transitory viewing
                only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the Platform</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
              <p>
                This license shall automatically terminate if you violate any of these restrictions and may be
                terminated by us at any time.
              </p>
            </CardContent>
          </Card>

          {/* 3. Fair Play and Game Rules */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Users className="w-6 h-6 mr-3 text-purple-400" />
                3. Fair Play and Game Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>Our Platform is built on the principles of fair play and sportsmanship. All users must:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Play games honestly without using external assistance or automated tools</li>
                <li>Respect other players and maintain a positive community environment</li>
                <li>Not attempt to exploit bugs or glitches in the games</li>
                <li>Not create multiple accounts to gain unfair advantages</li>
                <li>Report any suspected cheating or inappropriate behavior</li>
              </ul>
              <p>Violation of fair play rules may result in temporary or permanent suspension of your account.</p>
            </CardContent>
          </Card>

          {/* 4. Intellectual Property */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Gavel className="w-6 h-6 mr-3 text-yellow-400" />
                4. Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                The Platform and its original content, features, and functionality are and will remain the exclusive
                property of the Rugby Quiz Game Platform team and its licensors. The Platform is protected by copyright,
                trademark, and other laws.
              </p>
              <p>
                All rugby and GAA-related information, statistics, and trivia questions are compiled from publicly
                available sources and are used for educational and entertainment purposes only. We respect the
                intellectual property rights of sports organizations and leagues.
              </p>
            </CardContent>
          </Card>

          {/* 5. Privacy and Data Collection */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Eye className="w-6 h-6 mr-3 text-cyan-400" />
                5. Privacy and Data Collection
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                Your privacy is important to us. We collect and use information in accordance with our Privacy Policy.
                By using the Platform, you consent to the collection and use of information as outlined in our Privacy
                Policy.
              </p>
              <p>
                We may collect game statistics, performance data, and usage analytics to improve the Platform and
                provide personalized experiences. All data is handled securely and in compliance with applicable privacy
                laws.
              </p>
              <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                Read our full Privacy Policy →
              </Link>
            </CardContent>
          </Card>

          {/* 6. Disclaimers */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <AlertTriangle className="w-6 h-6 mr-3 text-red-400" />
                6. Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                The information on this Platform is provided on an 'as is' basis. To the fullest extent permitted by
                law, we exclude all representations, warranties, and conditions relating to our Platform and the use of
                this Platform.
              </p>
              <p>
                Sports information and statistics are compiled from various sources and while we strive for accuracy, we
                cannot guarantee that all information is completely accurate or up-to-date. The Platform is provided for
                entertainment purposes only.
              </p>
            </CardContent>
          </Card>

          {/* 7. Modifications */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Edit className="w-6 h-6 mr-3 text-orange-400" />
                7. Modifications
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                We may revise these Terms of Service at any time without notice. By using this Platform, you are
                agreeing to be bound by the then current version of these Terms of Service.
              </p>
              <p>
                We will make reasonable efforts to notify users of significant changes to these terms through the
                Platform or via email if you have provided contact information.
              </p>
            </CardContent>
          </Card>

          {/* 8. Contact Information */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Mail className="w-6 h-6 mr-3 text-pink-400" />
                8. Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                If you have any questions about these Terms of Service, please contact us through our contact page or
                reach out to our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Link href="/contact">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Us
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Learn More About Us
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
            <Link href="/about" className="hover:text-white transition-colors">
              About Us
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
