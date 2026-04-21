"use client"

import { useEffect, useRef } from "react"

export default function RadioPlayer() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      // Create script to load the radio player
      const script = document.createElement('script')
      script.innerHTML = `
        (function() {
          var iframe = document.createElement('iframe');
          iframe.src = 'http://84.8.135.135/public/newsline/embed?autoplay=1';
          iframe.frameBorder = '0';
          iframe.allowTransparency = true;
          iframe.allow = 'autoplay';
          iframe.style.width = '100%';
          iframe.style.minHeight = '150px';
          iframe.style.height = '150px';
          iframe.style.border = '0';
          document.getElementById('radio-player-container').appendChild(iframe);
        })();
      `
      containerRef.current.appendChild(script)
    }
  }, [])

  return (
    <div 
      id="radio-player-container" 
      ref={containerRef}
      className="w-full"
      style={{ minHeight: '150px', height: '150px' }}
    />
  )
}
