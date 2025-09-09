export type ParagraphData = {
  html: string;
  fontSize?: number;
  marginTop?: number;
  marginBottom?: number;
};

export const paragraphDefault: ParagraphData = {
  html: "Write something…",
  fontSize: 16,
  marginTop: 16,
  marginBottom: 16,
};
