import { LoadingScreen } from "../components/layout/LoadingScreen";

export default function Loading() {
  // Used by Next.js App Router while route segments are loading
  return (
    <LoadingScreen fullscreen={false}>
      <></>
    </LoadingScreen>
  );
}
