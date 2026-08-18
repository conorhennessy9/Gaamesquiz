import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield, UserCheck, Database, Cookie, Mail } from "lucide-react"

export default function PrivacyPolicyPage() {
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
            <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
            <p className="text-xl text-gray-300">Your privacy is important to us</p>
            <p className="text-sm text-gray-400 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Privacy Content */}
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="text-gray-300 space-y-4 p-6">
              <p>
                Welcome to GaamesQuiz.com ("we", "our", or "us"). We are committed to protecting your personal
                information and your right to privacy. If you have any questions or concerns about this privacy notice,
                or our practices with regards to your personal information, please contact us.
              </p>
              <p>
                This privacy notice describes how we might use your information if you visit our website at
                gaamesquiz.com, or otherwise engage with us. Reading this privacy notice will help you understand your
                privacy rights and choices.
              </p>
            </CardContent>
          </Card>

          {/* 1. Information We Collect */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Database className="w-6 h-6 mr-3 text-blue-400" />
                1. What Information Do We Collect?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <h3 className="font-semibold text-white">Personal Information You Disclose to Us</h3>
              <p>
                We collect personal information that you voluntarily provide to us when you register on the Platform,
                express an interest in obtaining information about us or our products and Services, when you participate
                in activities on the Platform (such as playing games or posting messages in our online forums or
                otherwise contacting us).
              </p>
              <p>
                The personal information that we collect depends on the context of your interactions with us and the
                Platform, the choices you make, and the products and features you use. The personal information we
                collect may include the following: usernames, email addresses (optional), and game scores/progress.
              </p>
              <h3 className="font-semibold text-white mt-4">Information Automatically Collected</h3>
              <p>
                We automatically collect certain information when you visit, use, or navigate the Platform. This
                information does not reveal your specific identity (like your name or contact information) but may
                include device and usage information, such as your IP address, browser and device characteristics,
                operating system, language preferences, referring URLs, device name, country, location, information
                about how and when you use our Platform, and other technical information. This information is primarily
                needed to maintain the security and operation of our Platform, and for our internal analytics and
                reporting purposes.
              </p>
            </CardContent>
          </Card>

          {/* 2. How We Use Your Information */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <UserCheck className="w-6 h-6 mr-3 text-green-400" />
                2. How Do We Use Your Information?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                We use personal information collected via our Platform for a variety of business purposes described
                below. We process your personal information for these purposes in reliance on our legitimate business
                interests, in order to enter into or perform a contract with you, with your consent, and/or for
                compliance with our legal obligations.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>To facilitate account creation and logon process.</strong> If you choose to link your account
                  with us to a third-party account (such as your Google or Facebook account), we use the information you
                  allowed us to collect from those third parties to facilitate account creation and the logon process
                  for the performance of the contract.
                </li>
                <li>
                  <strong>To manage user accounts.</strong> We may use your information for the purposes of managing
                  your account and keeping it in working order.
                </li>
                <li>
                  <strong>To send administrative information to you.</strong> We may use your personal information to
                  send you product, service, and new feature information and/or information about changes to our terms,
                  conditions, and policies.
                </li>
                <li>
                  <strong>To protect our Services.</strong> We may use your information as part of our efforts to keep
                  our Platform safe and secure (for example, for fraud monitoring and prevention).
                </li>
                <li>
                  <strong>For other Business Purposes.</strong> We may use your information for other Business Purposes,
                  such as data analysis, identifying usage trends, determining the effectiveness of our promotional
                  campaigns, and to evaluate and improve our Platform, products, marketing, and your experience.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 3. Cookies and Similar Technologies */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Cookie className="w-6 h-6 mr-3 text-yellow-400" />
                3. Do We Use Cookies and Other Tracking Technologies?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                We may use cookies and similar tracking technologies (like web beacons and pixels) to access or store
                information. Specific information about how we use such technologies and how you can refuse certain
                cookies is set out in our Cookie Notice (if applicable, otherwise this section covers it).
              </p>
              <p>
                We use cookies primarily to save your game progress, remember your preferences (like dark mode), and for
                anonymous analytics to improve game functionality and loading speed. You can control the use of cookies
                at the individual browser level.
              </p>
            </CardContent>
          </Card>

          {/* 4. Data Security */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Shield className="w-6 h-6 mr-3 text-red-400" />
                4. How Do We Keep Your Information Safe?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                We have implemented appropriate technical and organizational security measures designed to protect the
                security of any personal information we process. However, despite our safeguards and efforts to secure
                your information, no electronic transmission over the Internet or information storage technology can be
                guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other
                unauthorized third parties will not be able to defeat our security and improperly collect, access,
                steal, or modify your information.
              </p>
            </CardContent>
          </Card>

          {/* 5. Your Privacy Rights */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <UserCheck className="w-6 h-6 mr-3 text-purple-400" />
                5. What Are Your Privacy Rights?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                In some regions (like the EEA, UK, and Canada), you have certain rights under applicable data protection
                laws. These may include the right (i) to request access and obtain a copy of your personal information,
                (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information;
                and (iv) if applicable, to data portability. In certain circumstances, you may also have the right to
                object to the processing of your personal information. To make such a request, please use the contact
                details provided below.
              </p>
            </CardContent>
          </Card>

          {/* 6. Contact Us */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Mail className="w-6 h-6 mr-3 text-pink-400" />
                6. How Can You Contact Us About This Notice?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                If you have questions or comments about this notice, you may contact us by email at
                privacy@gaamesquiz.com or through our{" "}
                <Link href="/contact" className="text-blue-400 hover:text-blue-300 underline">
                  Contact Page
                </Link>
                .
              </p>
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
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
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
