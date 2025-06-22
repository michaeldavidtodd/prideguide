"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Share2, Twitter, Facebook, Mail, Copy, Check, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ShareModalProps {
  flag: {
    id: string
    name: string
    description: string
    colors: string[]
  }
  isOpen: boolean
  onClose: () => void
}

export function ShareModal({ flag, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  if (!isOpen || !flag) return null

  // Generate shareable content
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/flag/${flag.id}`
  const shareTitle = `Check out the ${flag.name}! 🏳️‍🌈`
  const shareText = `${flag.description} Learn more about LGBTQIA+ flags and their meanings.`
  const hashtags = "LGBTQIA,Pride,Diversity,Inclusion"

  // Social media sharing URLs
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}&hashtags=${hashtags}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareTitle + " " + shareText)}`
  const emailSubject = encodeURIComponent(shareTitle)
  const emailBody = encodeURIComponent(`${shareText}\n\nLearn more: ${shareUrl}`)
  const emailUrl = `mailto:?subject=${emailSubject}&body=${emailBody}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast({
        title: "Link copied!",
        description: "The flag link has been copied to your clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy link. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSocialShare = (url: string, platform: string) => {
    try {
      window.open(url, "_blank", "width=600,height=400,scrollbars=yes,resizable=yes")
      toast({
        title: `Shared to ${platform}!`,
        description: "Opening share dialog...",
      })
    } catch (error) {
      toast({
        title: "Share failed",
        description: `Unable to open ${platform}. Please try again.`,
        variant: "destructive",
      })
    }
  }

  const shareOptions = [
    {
      name: "Twitter",
      icon: Twitter,
      action: () => handleSocialShare(twitterUrl, "Twitter"),
      color: "hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20",
    },
    {
      name: "Facebook",
      icon: Facebook,
      action: () => handleSocialShare(facebookUrl, "Facebook"),
      color: "hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20",
    },
    {
      name: "Email",
      icon: Mail,
      action: () => {
        window.location.href = emailUrl
        toast({
          title: "Opening email client...",
          description: "Composing email with flag information.",
        })
      },
      color: "hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20",
    },
    {
      name: "Copy Link",
      icon: copied ? Check : Copy,
      action: handleCopyLink,
      color: copied
        ? "bg-green-50 text-green-600 dark:bg-green-900/20"
        : "hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/20",
    },
  ]

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Share2 className="w-5 h-5" />
              Share {flag.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">Spread awareness and celebrate diversity</p>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Share URL Display */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Share Link</label>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="text-sm" />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyLink}
                  className={copied ? "bg-green-50 text-green-600 dark:bg-green-900/20" : ""}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Share Options */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Share via</label>
              <div className="grid grid-cols-2 gap-2">
                {shareOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <Button
                      key={option.name}
                      variant="outline"
                      onClick={option.action}
                      className={`justify-start gap-2 h-12 transition-colors ${option.color}`}
                    >
                      <Icon className="w-4 h-4" />
                      {option.name}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Preview</label>
              <div className="p-3 border rounded-lg bg-muted/30">
                <div className="font-medium text-sm">{shareTitle}</div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{shareText}</div>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <ExternalLink className="w-3 h-3" />
                  Pride Guide
                </div>
              </div>
            </div>

            {/* Close Button */}
            <Button variant="outline" onClick={onClose} className="w-full">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
