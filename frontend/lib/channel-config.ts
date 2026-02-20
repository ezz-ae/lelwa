/**
 * channel-config.ts
 * Outreach channel definitions for the Connect page.
 */

export interface ChannelField {
  key: string
  type: "text" | "password" | "tel"
  label: string
}

export interface ChannelDef {
  id: string
  title: string
  detail: string
  status: "available" | "unavailable"
  iconColor: string
  iconLabel: string
  accentColor: string
  bgAccent: string
  channel: string
  prompt: string
  fields: ChannelField[]
}

export const CHANNELS: ChannelDef[] = [
  {
    id: "whatsapp",
    title: "WhatsApp",
    detail: "Send replies and offers directly from the console.",
    status: "available",
    iconColor: "bg-[#25D366]/15 text-[#25D366] border-[#25D366]/20",
    iconLabel: "W",
    accentColor: "border-[#25D366]/30",
    bgAccent: "from-[#25D366]/5",
    channel: "whatsapp",
    prompt: "Connect your WhatsApp Business number via Twilio.",
    fields: [
      { key: "account_sid", type: "text", label: "Twilio Account SID" },
      { key: "auth_token", type: "password", label: "Twilio Auth Token" },
      { key: "from_number", type: "tel", label: "WhatsApp sender (e.g. whatsapp:+14155238886)" },
    ],
  },
  {
    id: "voice",
    title: "Voice calls",
    detail: "Call leads with a scripted outbound call from the console.",
    status: "available",
    iconColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    iconLabel: "☎",
    accentColor: "border-border/60",
    bgAccent: "",
    channel: "voice",
    prompt: "Connect your Twilio caller number for outbound calls.",
    fields: [
      { key: "account_sid", type: "text", label: "Twilio Account SID" },
      { key: "auth_token", type: "password", label: "Twilio Auth Token" },
      { key: "from_number", type: "tel", label: "Caller number (e.g. +971XXXXXXXXX)" },
    ],
  },
  {
    id: "instagram",
    title: "Instagram",
    detail: "Handle DMs and keep every inquiry active from the console.",
    status: "available",
    iconColor: "bg-[#E1306C]/15 text-[#E1306C] border-[#E1306C]/20",
    iconLabel: "In",
    accentColor: "border-[#E1306C]/30",
    bgAccent: "from-[#E1306C]/5",
    channel: "instagram",
    prompt: "Connect your Instagram Business account.",
    fields: [
      { key: "page_access_token", type: "password", label: "Page Access Token (long-lived)" },
      { key: "instagram_account_id", type: "text", label: "Instagram Business Account ID" },
    ],
  },
  {
    id: "facebook",
    title: "Facebook",
    detail: "Respond to page inquiries without leaving the console.",
    status: "available",
    iconColor: "bg-[#1877F2]/15 text-[#1877F2] border-[#1877F2]/20",
    iconLabel: "f",
    accentColor: "border-[#1877F2]/30",
    bgAccent: "from-[#1877F2]/5",
    channel: "facebook",
    prompt: "Connect your Facebook Business Page.",
    fields: [
      { key: "page_access_token", type: "password", label: "Page Access Token" },
      { key: "page_id", type: "text", label: "Facebook Page ID" },
    ],
  },
  {
    id: "email",
    title: "Email",
    detail: "Send documents and follow-ups from the console.",
    status: "available",
    iconColor: "bg-violet-500/15 text-violet-400 border-violet-500/20",
    iconLabel: "@",
    accentColor: "border-violet-500/30",
    bgAccent: "from-violet-500/5",
    channel: "email",
    prompt: "Configure your outbound email account.",
    fields: [
      { key: "smtp_host", type: "text", label: "SMTP Host (e.g. smtp.gmail.com)" },
      { key: "smtp_port", type: "text", label: "SMTP Port (e.g. 587)" },
      { key: "smtp_user", type: "text", label: "Username or email address" },
      { key: "smtp_pass", type: "password", label: "App password or SMTP password" },
    ],
  },
  {
    id: "portals",
    title: "Listing portals",
    detail: "Post, refresh, and update listings from the console.",
    status: "available",
    iconColor: "bg-sky-500/15 text-sky-400 border-sky-500/20",
    iconLabel: "⊞",
    accentColor: "border-sky-500/30",
    bgAccent: "from-sky-500/5",
    channel: "portals",
    prompt: "Connect your listing portal account.",
    fields: [
      { key: "portal_name", type: "text", label: "Portal name (e.g. Bayut, Property Finder)" },
      { key: "api_key", type: "password", label: "API Key" },
      { key: "agency_ref", type: "text", label: "Agency or reference ID" },
    ],
  },
]
