"use client"

import type React from "react"

import { useEffect } from "react"

interface AdBannerProps {
  adSlot: string
  adFormat?: string
  adLayoutKey?: string
  style?: React.CSSProperties
  className?: string
  isTestAd?: boolean // For showing a placeholder in development/v0
}

// Ensure adsbygoogle is declared on the window object
declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

export function AdBanner({
  adSlot,
  adFormat = "auto",
  adLayoutKey = "",
  style = { display: "block", textAlign: "center" },
  className = "",
  isTestAd = false, // Default to not being a test ad
}: AdBannerProps) {
  useEffect(() => {
    // Don't push to adsbygoogle if it's just a test/placeholder ad
    if (isTestAd || !adSlot) return

    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (err) {
      console.error("AdSense push error:", err)
    }
  }, [adSlot, isTestAd]) // Re-run if adSlot or isTestAd changes

  if (isTestAd) {
    return (
      <div className={`bg-slate-700 text-slate-300 p-6 text-center rounded-md my-4 ${className}`} style={style}>
        
        
      </div>
    )
  }

  if (!adSlot) {
    return (
      <div
        className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4 ${className}`}
        role="alert"
        style={style}
      >
        <strong className="font-bold">AdBanner Error: </strong>
        <span className="block sm:inline">`adSlot` prop is missing. Please provide a valid AdSense ad slot ID.</span>
      </div>
    )
  }

  return (
    <div
      className={`ad-container my-4 ${className}`}
      style={{ ...style, minHeight: "100px" /* Ensure space for ad */ }}
    >
      <ins
        key={adSlot} // Key helps React identify the element if props change
        className="adsbygoogle"
        style={{ display: "block" }} // AdSense often requires display:block
        data-ad-client="ca-pub-5376222361913675" // Your AdSense Publisher ID
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-ad-layout-key={adLayoutKey}
        data-full-width-responsive="true"
      ></ins>
    </div>
  )
}
