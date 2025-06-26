export interface ParsedActor {
  name: string;
  biography?: string;
  attributes: Attributes;
  skills?: Record<string, ImportedDie>;
  pace?: number;
  parry?: number;
  toughness?: {
    value: number;
    armor?: number;
    modifier?: number;
  };
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
  agility: {
    die: ImportedDie;
  };
  smarts: {
    die: ImportedDie;
    animal: boolean;
  };
  spirit: {
    die: ImportedDie;
    unShakeBonus?: number;
  };
  strength: {
    die: ImportedDie;
    encumbranceSteps?: number;
  };
  vigor: {
    die: ImportedDie;
    unStunBonus?: number;
    soakBonus?: number;
    bleedOut?: {
      modifier: number;
      ignoreWounds: boolean;
    };
  };
}

export interface ImportedDie {
  sides: number;
  modifier: number;
}

export interface ImportSettings {
  actorType: string;
  isWildCard: boolean;
  tokenSettings: TokenSettings;
  saveFolder: string;
}

export interface TokenSettings {
  disposition: number;
  vision: boolean;
  visionRange: number;
  visionAngle: number;
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
