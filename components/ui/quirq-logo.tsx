import Image, { type ImageProps } from "next/image";

const LOGO_WIDTH = 296;
const LOGO_HEIGHT = 119;

export type QuirqLogoProps = Omit<
  ImageProps,
  "src" | "width" | "height" | "alt" | "unoptimized"
> & {
  alt?: string;
  width?: number;
  height?: number;
};

/** The canonical Quirq wordmark supplied by the brand team. */
export function QuirqLogo({
  alt = "quirq",
  width = LOGO_WIDTH,
  height = LOGO_HEIGHT,
  ...props
}: QuirqLogoProps) {
  return (
    <Image
      src="/assets/quirq-logo.svg"
      alt={alt}
      width={width}
      height={height}
      {...props}
      unoptimized
    />
  );
}
