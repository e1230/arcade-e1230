export function BackgroundEffects() {
  return (
    <>
      <div
        className="motion-safe:animate-grid pointer-events-none fixed -left-1/2 -right-1/2 -bottom-[10vh] z-0 h-[60vh] origin-bottom bg-synthwave-grid [-webkit-mask-image:linear-gradient(to_top,#000_10%,transparent_90%)] [mask-image:linear-gradient(to_top,#000_10%,transparent_90%)] [transform:perspective(420px)_rotateX(62deg)]"
        aria-hidden
      />
      <div className="bg-top-glow pointer-events-none fixed inset-0 z-0" aria-hidden />
      <div
        className="bg-scanlines pointer-events-none fixed inset-0 z-[100] [mix-blend-mode:multiply]"
        aria-hidden
      />
    </>
  );
}
