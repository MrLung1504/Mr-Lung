
export interface Question {
  id: number;
  competency: string;
  competencyExplanation: string;
  cognitiveLevel: string;
  questionType: 'D1' | 'D2' | 'D3';
  questionText: string; // For D1: the question. For D2: the leading statement. For D3: the essay prompt.
  options: string[]; // For D1: A,B,C,D choices. For D2: A,B,C,D statements. Empty for D3.
  answer: string; // For D1: 'A'. For D2: JSON string. For D3: Suggested answer.
}

export type ImageContent = {
  mimeType: string;
  content: string; // base64
};

export type CombinedFileContent = {
  text: string;
  images: ImageContent[];
};

export interface QuestionCounts {
  multipleChoice: {
    [key: string]: number;
  };
  trueFalse: number;
  essay: {
    [key: string]: number;
  };
}
