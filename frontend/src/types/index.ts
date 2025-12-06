export interface Profession {
  id: string;
  name: string;
  description: string;
  salary: string;
  demand: string;
  duration: string;
}

export interface RoadmapStep {
  icon: string;
  title: string;
  description: string;
}

export interface UserData {
  name: string;
  age: string;
  interests: string;
}

export interface ConversationStep {
  id: number;
  question: string;
  answer?: string;
}
