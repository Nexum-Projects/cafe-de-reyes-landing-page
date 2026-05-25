import { Link, Mail } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaPinterest,
  FaSnapchat,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { SiThreads } from "react-icons/si";

import type { ActionButtonType } from "@/lib/action-button-type";

type ActionButtonIconProps = {
  className?: string;
  type: ActionButtonType;
};

export function ActionButtonIcon({ type, className = "h-4 w-4" }: ActionButtonIconProps) {
  switch (type) {
    case "INSTAGRAM":
      return <FaInstagram className={className} />;
    case "FACEBOOK":
      return <FaFacebookF className={className} />;
    case "TIKTOK":
      return <FaTiktok className={className} />;
    case "YOUTUBE":
      return <FaYoutube className={className} />;
    case "WHATSAPP":
      return <FaWhatsapp className={className} />;
    case "X":
      return <FaXTwitter className={className} />;
    case "LINKEDIN":
      return <FaLinkedinIn className={className} />;
    case "THREADS":
      return <SiThreads className={className} />;
    case "PINTEREST":
      return <FaPinterest className={className} />;
    case "SNAPCHAT":
      return <FaSnapchat className={className} />;
    case "EMAIL":
      return <Mail className={className} />;
    default:
      return <Link className={className} />;
  }
}
