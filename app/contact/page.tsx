"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Mail, MessageSquare, User, Send, Info, Shield } from "lucide-react"

export default function ContactPage() {
  // Basic form submission handler (can be expanded with server action)
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // In a real app, you'd send this data to a server/API
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData.entries())
    console.log("Form submitted:", data)
    alert("Message sent! (This is a demo, no email was actually sent)")
    event.currentTarget.reset()
  }

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
            <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
            <p className="text-xl text-gray-300">We'd love to hear from you!</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Contact Information */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Get In Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Contact Details</h3>
                <div className="flex items-start space-x-3 text-gray-300">
                  <Mail className="w-5 h-5 mt-1 text-blue-400" />
                  <div>
                    <p className="font-medium text-white">Email</p>
                    <p>gaamesquiz@outlook.com</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 text-gray-300">
                  <MessageSquare className="w-5 h-5 mt-1 text-green-400" />
                  <div>
                    <p className="font-medium text-white">Response Time</p>
                    <p>We typically respond within 24-48 hours.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">What We Can Help With</h3>
                <ul className="text-gray-300 space-y-2 list-disc list-inside">
                  <li>Game feedback and suggestions</li>
                  <li>Technical issues and bug reports</li>
                  <li>Questions about our games or platform</li>
                  <li>Partnership inquiries</li>
                  <li>General support questions</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Social Media</h3>
                <div className="space-y-2 text-gray-300">
                  <p>
                    Twitter:{" "}
                    <a
                      href="https://twitter.com/GAAmesquiz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      @GAAmesquiz
                    </a>
                  </p>
                  <p>
                    Instagram:{" "}
                    <a
                      href="https://instagram.com/gaamesquiz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-400 hover:text-pink-300 underline"
                    >
                      @gaamesquiz
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-white font-medium">
                    Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your name"
                      required
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-white font-medium">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      required
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-white font-medium">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="What's this about?"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-white font-medium">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us more..."
                    rows={5}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-500"
                  />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
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
              <Info className="w-4 h-4 inline mr-1" /> About Us
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              <Shield className="w-4 h-4 inline mr-1" /> Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              <Shield className="w-4 h-4 inline mr-1" /> Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
