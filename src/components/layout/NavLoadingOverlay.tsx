"use client";

import { LoadingScreen } from "./LoadingScreen";
import { useNavLoading } from "~/contexts/NavLoadingContext";

export default function NavLoadingOverlay() {
  const { isNavLoading } = useNavLoading();
  if (!isNavLoading) return null;
  return (
    <LoadingScreen durationMs={null}>
      <></>
    </LoadingScreen>
  );
}
