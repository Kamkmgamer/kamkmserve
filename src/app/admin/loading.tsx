import { LoadingScreen } from "~/components/layout/LoadingScreen";

export default function Loading() {
  // Used by Next.js App Router while the /admin route segment is loading
  return (
    <LoadingScreen durationMs={null} fullscreen={false}>
      <></>
    </LoadingScreen>
  );
}
