export type RenderMode = "shape" | "image";

export interface Asset {
  id: string;
  name: string;
  type: string; // 'image/png', 'image/webp', etc.
  dataUrl: string;
  width: number;
  height: number;
}

export interface CharacterProject {
  id: string;
  name: string;
  parts: CharacterPart[];
  animations: AnimationState[];
  assets: Asset[];
  renderQuality?: 'pixel' | 'smooth';
  lastSelectedAnimId?: string;
  lastSelectedPartId?: string;
  version?: number;
}

export interface CharacterPart {
  id: string;
  name: string;
  parentId: string | null;
  origin: { x: number; y: number };
  baseX: number;
  baseY: number;
  baseRotation: number; // in degrees
  baseScaleX: number;
  baseScaleY: number;
  zIndex: number;

  // Render options
  renderMode?: RenderMode;
  shapeType?: string; // rect, roundedRect, circle, ellipse, line, polygon, sword, dagger, staff, hammer, shield, cape
  color?: string; // For placeholder/shape mode
  imageAssetId?: string; // Reference to Asset id
  sourceRect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  opacity?: number;
  flipX?: boolean;
  flipY?: boolean;
  useChromaKey?: boolean;
  chromaColor?: string; // e.g. '#FF00FF'
  visible?: boolean;
  locked?: boolean;
  inheritTransform?: boolean;
  editChildrenTogether?: boolean;
}

export interface AnimationState {
  id: string;
  name: string;
  duration: number;
  loop: boolean;
  controllers: MotionController[];
}

export interface MotionController {
  id: string;
  targetPartId: string;
  property: 'x' | 'y' | 'rotation' | 'scaleX' | 'scaleY' | 'opacity';
  formulaPreset: string;
  params: ControllerParams;
  enabled: boolean;
}

export interface ControllerParams {
  speed: number;
  amplitude: number;
  phase: number;
  offset: number;
  min: number;
  max: number;
}

export interface FormulaPreset {
  id: string;
  name: string;
  description: string;
}

export interface SpriteSheetSource {
  id: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
  frameWidth: number;
  frameHeight: number;
  columns: number;
  rows: number;
  spacingX: number;
  spacingY: number;
  marginX: number;
  marginY: number;
}

export interface ExtractedSpritePart {
  id: string;
  name: string;
  sourceFrameIndex: number;
  sourceRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  pivot: {
    x: number;
    y: number;
  };
  dataUrl: string;
  width: number;
  height: number;
}

