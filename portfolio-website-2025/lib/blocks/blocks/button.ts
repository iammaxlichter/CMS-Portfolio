import type { ButtonVariant } from "../core";

export type ButtonData = {
  text: string;
  href: string;
  variant?: ButtonVariant;
  paddingTop?: number;
  paddingBottom?: number;
};

export const buttonDefault: ButtonData = {
  text: "Learn more",
  href: "/",
  variant: "outline",
  paddingTop: 0,
  paddingBottom: 0,
};
