"use client";

import React from "react";
import { ViewerFallback } from "@/features/three/components/ViewerFallback";
import type { Fabric } from "@/types/domain";

const MODEL_HELP =
  "Нет public/models/suit-configurable-v3.glb. Скачайте phase-1 donors (docs/3D_ATTRIBUTION.md) в assets/3d/donors/, затем pnpm 3d:check-donors && pnpm 3d:build-modular.";

type Props = {
  fabric?: Fabric | null;
  children: React.ReactNode;
};

type State = { error: Error | null };

export class Suit3DErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      const raw = this.state.error.message || "";
      const message =
        /suit-configurable-v3|Could not load|Failed to fetch|404/i.test(raw) ? MODEL_HELP : raw || MODEL_HELP;

      return (
        <ViewerFallback
          fabric={this.props.fabric}
          error={message}
          onRetry={() => this.setState({ error: null })}
        />
      );
    }
    return this.props.children;
  }
}
