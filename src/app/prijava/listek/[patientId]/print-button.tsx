"use client";

import { Printer } from "lucide-react";
import { BigButton } from "@/components/shell";

export function PrintButton() {
  return (
    <BigButton icon={<Printer />} onClick={() => window.print()}>
      Natisni listek
    </BigButton>
  );
}
