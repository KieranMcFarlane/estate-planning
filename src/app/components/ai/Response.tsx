"use client";

import { Streamdown } from "streamdown";

type ResponseProps = {
  children: string;
  className?: string;
  streaming?: boolean;
};

export function Response({ children, className, streaming = true }: ResponseProps) {
  return (
    <Streamdown className={className} controls={false} mode={streaming ? "streaming" : "static"}>
      {children}
    </Streamdown>
  );
}
