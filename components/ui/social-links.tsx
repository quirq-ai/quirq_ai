import { GithubIcon } from "./brand-icons";

export const SOCIAL_LINKS = [
  { label: "X", href: "https://x.com/quirq_ai" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/quirqai" },
  { label: "GitHub", href: "https://github.com/quirq-ai" },
  { label: "Instagram", href: "https://github.com/quirq-ai" },
] as const;

type SocialIconProps = {
  className?: string;
};

function XIcon({ className }: SocialIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 43 43"
      fill="currentColor"
    >
      <path d="M29.886 8.6h4.396l-9.604 10.93L35.977 34.4H27.13l-6.927-9.02-7.929 9.02H7.876L18.148 22.71 7.31 8.6h9.071l6.262 8.245L29.886 8.6Zm-1.542 23.181h2.436L15.057 11.082h-2.613l15.9 20.7Z" />
    </svg>
  );
}

function LinkedInIcon({ className }: SocialIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

function InstagramIcon({ className }: SocialIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const SOCIAL_ICONS = {
  X: XIcon,
  LinkedIn: LinkedInIcon,
  GitHub: GithubIcon,
  Instagram: InstagramIcon,
} as const;

export function SocialLinks({ className }: { className?: string } = {}) {
  const classes = ["flex items-center gap-1", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} role="group" aria-label="Quirq social links">
      {SOCIAL_LINKS.map((link) => {
        const Icon = SOCIAL_ICONS[link.label];

        return (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Quirq on ${link.label} (opens in a new tab)`}
            className="grid size-11 shrink-0 place-items-center rounded-full text-faint transition-colors hover:text-ink focus-visible:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Icon className="size-[18px]" />
          </a>
        );
      })}
    </div>
  );
}
