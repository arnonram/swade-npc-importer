export interface ParsedActor {
  name: string;
  biography?: string;
  attributes: Attributes;
  skills?: Record<string, Trait>;
  pace?: number;
  parry?: number;
  toughness?: number;
  hindrances?: string[];
  edges?: string[];
  powers?: string[];
  powerPoints?: number;
  specialAbilities?: Record<string, string>;
  superPowers?: Record<string, string>;
  gear?: Record<string, any>;
  size?: number;
  [key: string]: any; // for additional system-defined stats
}

export interface Attributes {
  agility: Trait;
  smarts: Trait & { animal?: boolean };
  spirit: Trait;
  strength: Trait;
  vigor: Trait;
}

export interface Trait {
  sides: number;
  modifier: number;
}

export interface ImportSettings {
  actorType: string;
  isWildCard: string;
  tokenSettings: {
    disposition: number;
    vision: boolean;
    visionRange: number;
    visionAngle: number;
  };
  saveFolder: string;
}

export interface SwadeActorToImport {
  name: string;
  type: string;
  folder: string;
  system: any;
  items: any[];
  prototypeToken: any;
  flags: any;
}
