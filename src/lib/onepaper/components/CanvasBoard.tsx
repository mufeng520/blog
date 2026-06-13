import React, { useRef, useState, useEffect, useLayoutEffect, useCallback, memo } from 'react';
import type { Artboard, ArtboardGroup, LangType, DesignSystem, GeneratedImage } from '../types';
import { I18N } from '../constants';
import DesignSpecRenderer from './DesignSpecRenderer';
import IconLoader from './IconLoader';
import DevRequestMonitor from './DevRequestMonitor';
import UISplitModal from './modals/UISplitModal';

interface Props {
    artboards: Artboard[];
    groups: ArtboardGroup[];
    onSelectArtboard: (id: string) => void;
    onInspectArtboard?: (image: GeneratedImage) => void;
    onMoveArtboard: (id: string, x: number, y: number) => void;
    onMoveGroup?: (id: string, dx: number, dy: number) => void;
    onDeleteArtboard: (id: string) => void;
    onUploadImage: (file: File, x: number, y: number) => void;
    onAddImagesToCanvas?: (
        images: GeneratedImage[],
        origin: { x: number; y: number },
        options?: { groupLabel?: string; columns?: number }
    ) => Promise<void> | void;
    onAutoArrange: () => void;
    onRegenerateArtboard: (id: string) => void;
    onUpdateArtboard?: (id: string, updates: Partial<Artboard>) => void;
    lang: LangType;
    regeneratingId?: string | null;
    onRequestConfirm: (title: string, message: string, onConfirm: () => void) => void;
    onDeleteHistoryItem?: (artboardId: string, historyItemId: string) => void;
    onCopyImage?: (base64: string) => void;
    devMode?: boolean;
    scale: number;
    setScale: React.Dispatch<React.SetStateAction<number>>;
    position: { x: number; y: number };
    setPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
}


const SNAP_THRESHOLD = 2;

type SlicedAnimationFrames = {
    frames: GeneratedImage[];
    columns: number;
    rows: number;
    detectedGrid: boolean;
    xLines: number[];
    yLines: number[];
};

type AnimationPreviewState = {
    artboardId: string;
    frames: GeneratedImage[];
    fps: number;
    columns: number;
    source: 'sliced' | 'batch';
    groupLabel: string;
};

type FrameRect = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type AxisLineCluster = {
    start: number;
    end: number;
    center: number;
    score: number;
};

type FrameOffset = {
    x: number;
    y: number;
};

type SliceAdjustState = {
    artboardId: string;
    imageUrl: string;
    width: number;
    height: number;
    frameCount: number;
    grid: { cols: number; rows: number };
    xLines: number[];
    yLines: number[];
    offsets: FrameOffset[];
    fps: number;
    selectedFrame: number;
    selectedLine: { axis: 'x' | 'y'; index: number } | null;
    groupLabel: string;
};

const createClientId = (prefix: string) => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const getAnimationConfig = (board?: Artboard) => {
    return board?.image.details?.skillConfig?.animationSequence;
};

const isAnimationArtboard = (board?: Artboard) => {
    const details = board?.image.details;
    return Boolean(
        details?.skillType === 'animation-sequence' ||
        details?.activeRole === 'animation-sequence' ||
        details?.animationFrame
    );
};

const getAnimationFrameCount = (board: Artboard) => {
    return Math.max(1, getAnimationConfig(board)?.frameCount || board.image.details?.animationFrame?.frameCount || 4);
};

const getAnimationFps = (board: Artboard) => {
    return Math.max(1, getAnimationConfig(board)?.fps || board.image.details?.animationFrame?.fps || 12);
};

const getAnimationFrameOrder = (board: Artboard) => {
    const metaIndex = board.image.details?.animationFrame?.frameIndex;
    if (typeof metaIndex === 'number') return metaIndex;

    const text = [
        board.label,
        board.id,
        board.image.prompt,
        board.image.details?.fullPrompt,
    ].filter(Boolean).join(' ');
    const match = text.match(/(?:keyframe|frame)\s*#?\s*(\d+)/i);
    return match ? Number(match[1]) - 1 : Number.MAX_SAFE_INTEGER;
};

const getAnimationBatchBoards = (boards: Artboard[], board: Artboard) => {
    const batchId = board.image.details?.batchId;
    if (!batchId) return [];

    return boards
        .filter(item => item.image.details?.batchId === batchId && isAnimationArtboard(item))
        .sort((a, b) => {
            const orderDelta = getAnimationFrameOrder(a) - getAnimationFrameOrder(b);
            if (orderDelta !== 0) return orderDelta;
            return a.image.timestamp - b.image.timestamp;
        });
};

const isStoryboardSheet = (board: Artboard, boards: Artboard[]) => {
    if (!isAnimationArtboard(board) || board.image.details?.animationFrame) return false;

    const promptText = `${board.image.prompt || ''}\n${board.image.details?.fullPrompt || ''}`;
    if (/KEYFRAME\s+\d+\s+OF/i.test(promptText)) return false;
    if (/STORYBOARD SHEET/i.test(promptText)) return true;

    return getAnimationBatchBoards(boards, board).length <= 1 && getAnimationFrameCount(board) > 1;
};

const canPreviewAnimation = (board: Artboard, boards: Artboard[]) => {
    return isStoryboardSheet(board, boards) || getAnimationBatchBoards(boards, board).length > 1;
};

const isUIDesignArtboard = (board?: Artboard) => {
    if (!board) return false;
    const details = board.image.details;
    if (details?.skillType || details?.animationFrame) return false;
    return !details?.activeRole || details.activeRole === 'designer';
};

const inferFrameGrid = (imageWidth: number, imageHeight: number, frameCount: number) => {
    const sheetRatio = imageWidth / Math.max(1, imageHeight);
    let best = { cols: frameCount, rows: 1, score: Number.POSITIVE_INFINITY };

    for (let rows = 1; rows <= frameCount; rows++) {
        for (let cols = 1; cols <= frameCount; cols++) {
            const cells = cols * rows;
            if (cells < frameCount) continue;

            const emptyCells = cells - frameCount;
            const gridRatio = cols / rows;
            const ratioPenalty = Math.abs(gridRatio - sheetRatio) * 2;
            const emptyPenalty = emptyCells * 0.7;
            const shapePenalty = Math.abs(cols - rows) * 0.04;
            const score = ratioPenalty + emptyPenalty + shapePenalty;

            if (score < best.score) {
                best = { cols, rows, score };
            }
        }
    }

    return { cols: best.cols, rows: best.rows };
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const medianNumber = (values: number[], fallback: number) => {
    const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
    if (sorted.length === 0) return fallback;
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
};

const getLuminance = (r: number, g: number, b: number) => (0.2126 * r) + (0.7152 * g) + (0.0722 * b);

const getDarkLineWeight = (data: Uint8ClampedArray, offset: number) => {
    const alpha = data[offset + 3];
    if (alpha < 60) return 0;

    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    const luminance = getLuminance(r, g, b);
    const channelRange = Math.max(r, g, b) - Math.min(r, g, b);

    if (luminance < 85) return 1;
    if (luminance < 130 && channelRange < 48) return 0.65;
    return 0;
};

const buildAxisDarkScores = (imageData: ImageData, axis: 'x' | 'y') => {
    const { width, height, data } = imageData;
    const length = axis === 'x' ? width : height;
    const crossLength = axis === 'x' ? height : width;
    const step = Math.max(1, Math.floor(crossLength / 900));
    const scores = new Array<number>(length).fill(0);

    for (let pos = 0; pos < length; pos++) {
        let sum = 0;
        let samples = 0;
        for (let cross = 0; cross < crossLength; cross += step) {
            const x = axis === 'x' ? pos : cross;
            const y = axis === 'x' ? cross : pos;
            const offset = ((y * width) + x) * 4;
            sum += getDarkLineWeight(data, offset);
            samples++;
        }
        scores[pos] = samples ? sum / samples : 0;
    }

    return scores;
};

const findLineClusters = (scores: number[], threshold: number): AxisLineCluster[] => {
    const clusters: AxisLineCluster[] = [];
    let start = -1;
    let sum = 0;
    let weighted = 0;
    let peak = 0;

    const pushCluster = (end: number) => {
        if (start < 0) return;
        const width = end - start + 1;
        const score = sum / Math.max(1, width);
        clusters.push({
            start,
            end,
            center: sum > 0 ? weighted / sum : (start + end) / 2,
            score: Math.max(score, peak),
        });
        start = -1;
        sum = 0;
        weighted = 0;
        peak = 0;
    };

    scores.forEach((score, index) => {
        if (score >= threshold) {
            if (start < 0) start = index;
            sum += score;
            weighted += score * index;
            peak = Math.max(peak, score);
        } else {
            pushCluster(index - 1);
        }
    });
    pushCluster(scores.length - 1);

    return clusters;
};

const chooseBestLineSet = (clusters: AxisLineCluster[], expectedCount: number, size: number) => {
    if (expectedCount <= 1 || clusters.length < expectedCount) return null;

    const maxClusterWidth = Math.max(10, size * 0.035);
    const candidates = [...clusters]
        .filter(cluster => (cluster.end - cluster.start + 1) <= maxClusterWidth || cluster.score > 0.7)
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.min(clusters.length, expectedCount + 10))
        .sort((a, b) => a.center - b.center);

    if (candidates.length < expectedCount) return null;

    let best: { lines: number[]; score: number } | null = null;
    const combo: AxisLineCluster[] = [];

    const scoreCombo = (items: AxisLineCluster[]) => {
        const centers = items.map(item => item.center);
        const first = centers[0];
        const last = centers[centers.length - 1];
        const span = Math.max(1, last - first);
        if (span < size * 0.55) return Number.POSITIVE_INFINITY;

        const expectedStep = span / Math.max(1, expectedCount - 1);
        const spacingErrors = centers.slice(1).map((center, index) => {
            const prev = centers[index];
            return Math.abs((center - prev) - expectedStep) / expectedStep;
        });
        const spacingPenalty = spacingErrors.reduce((sum, value) => sum + value, 0) / Math.max(1, spacingErrors.length);
        const edgePenalty = (first / size) + ((size - last) / size);
        const targetPenalty = centers.reduce((sum, center, index) => {
            const target = first + (expectedStep * index);
            return sum + Math.abs(center - target) / size;
        }, 0) / centers.length;
        const strengthReward = items.reduce((sum, item) => sum + item.score, 0) / items.length;

        return (spacingPenalty * 2.4) + (edgePenalty * 1.4) + (targetPenalty * 3) - (strengthReward * 0.2);
    };

    const visit = (startIndex: number) => {
        if (combo.length === expectedCount) {
            const score = scoreCombo(combo);
            if (!best || score < best.score) {
                best = { lines: combo.map(item => item.center), score };
            }
            return;
        }

        const remainingNeeded = expectedCount - combo.length;
        for (let index = startIndex; index <= candidates.length - remainingNeeded; index++) {
            combo.push(candidates[index]);
            visit(index + 1);
            combo.pop();
        }
    };

    visit(0);
    return best?.lines.map(line => Math.round(line)).sort((a, b) => a - b) || null;
};

const detectAxisLines = (imageData: ImageData, axis: 'x' | 'y', expectedCount: number) => {
    const size = axis === 'x' ? imageData.width : imageData.height;
    const scores = buildAxisDarkScores(imageData, axis);
    const maxScore = Math.max(...scores);
    if (maxScore < 0.12) return null;

    const mean = scores.reduce((sum, value) => sum + value, 0) / Math.max(1, scores.length);
    const threshold = clamp(mean + ((maxScore - mean) * 0.58), 0.18, 0.64);
    const clusters = findLineClusters(scores, threshold);

    return chooseBestLineSet(clusters, expectedCount, size);
};

const buildFixedFrameRects = (width: number, height: number, grid: { cols: number; rows: number }, frameCount: number): FrameRect[] => {
    const rects: FrameRect[] = [];
    for (let index = 0; index < frameCount; index++) {
        const col = index % grid.cols;
        const row = Math.floor(index / grid.cols);
        const sx = Math.round((col * width) / grid.cols);
        const sy = Math.round((row * height) / grid.rows);
        const ex = Math.round(((col + 1) * width) / grid.cols);
        const ey = Math.round(((row + 1) * height) / grid.rows);
        rects.push({ x: sx, y: sy, width: Math.max(1, ex - sx), height: Math.max(1, ey - sy) });
    }
    return rects;
};

const buildEvenLines = (size: number, divisions: number) => {
    return Array.from({ length: divisions + 1 }, (_, index) => Math.round((index * size) / divisions));
};

const buildFrameRectsFromLines = (
    xLines: number[],
    yLines: number[],
    frameCount: number,
    imageWidth: number,
    imageHeight: number
): FrameRect[] => {
    const cols = Math.max(1, xLines.length - 1);
    const rects: FrameRect[] = [];

    for (let index = 0; index < frameCount; index++) {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const left = clamp(xLines[col] ?? 0, 0, imageWidth - 1);
        const top = clamp(yLines[row] ?? 0, 0, imageHeight - 1);
        const right = clamp(xLines[col + 1] ?? imageWidth, left + 1, imageWidth);
        const bottom = clamp(yLines[row + 1] ?? imageHeight, top + 1, imageHeight);
        const borderInset = Math.max(3, Math.min(12, Math.round(Math.min(right - left, bottom - top) * 0.018)));

        rects.push({
            x: clamp(left + borderInset, 0, imageWidth - 1),
            y: clamp(top + borderInset, 0, imageHeight - 1),
            width: Math.max(1, clamp(right - left - (borderInset * 2), 1, imageWidth)),
            height: Math.max(1, clamp(bottom - top - (borderInset * 2), 1, imageHeight)),
        });
    }

    return rects;
};

const detectAnimationFrameRects = (
    sourceImage: HTMLImageElement,
    grid: { cols: number; rows: number },
    frameCount: number
) => {
    const width = sourceImage.naturalWidth || sourceImage.width;
    const height = sourceImage.naturalHeight || sourceImage.height;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
        const xLines = buildEvenLines(width, grid.cols);
        const yLines = buildEvenLines(height, grid.rows);
        return { rects: buildFixedFrameRects(width, height, grid, frameCount), xLines, yLines, detectedGrid: false };
    }

    ctx.drawImage(sourceImage, 0, 0);
    const imageData = ctx.getImageData(0, 0, width, height);
    const xLines = detectAxisLines(imageData, 'x', grid.cols + 1);
    const yLines = detectAxisLines(imageData, 'y', grid.rows + 1);

    if (!xLines || !yLines) {
        const fallbackXLines = buildEvenLines(width, grid.cols);
        const fallbackYLines = buildEvenLines(height, grid.rows);
        return { rects: buildFixedFrameRects(width, height, grid, frameCount), xLines: fallbackXLines, yLines: fallbackYLines, detectedGrid: false };
    }

    const rects = buildFrameRectsFromLines(xLines, yLines, frameCount, width, height);
    return { rects, xLines, yLines, detectedGrid: true };
};

const sampleCanvasBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const samples = [
        [2, 2],
        [Math.max(0, width - 3), 2],
        [2, Math.max(0, height - 3)],
        [Math.max(0, width - 3), Math.max(0, height - 3)],
        [Math.floor(width / 2), 2],
        [Math.floor(width / 2), Math.max(0, height - 3)],
    ];
    const data = ctx.getImageData(0, 0, width, height).data;
    const total = samples.reduce((acc, [x, y]) => {
        const offset = ((clamp(y, 0, height - 1) * width) + clamp(x, 0, width - 1)) * 4;
        return {
            r: acc.r + data[offset],
            g: acc.g + data[offset + 1],
            b: acc.b + data[offset + 2],
        };
    }, { r: 0, g: 0, b: 0 });
    const count = Math.max(1, samples.length);
    return `rgb(${Math.round(total.r / count)}, ${Math.round(total.g / count)}, ${Math.round(total.b / count)})`;
};

const detectRegistrationAnchor = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    const marginX = Math.max(2, Math.round(width * 0.035));
    const marginY = Math.max(2, Math.round(height * 0.035));

    const scan = (mode: 'dark' | 'nonBackground') => {
        let minX = width;
        let minY = height;
        let maxX = 0;
        let maxY = 0;
        let count = 0;

        for (let y = marginY; y < height - marginY; y++) {
            for (let x = marginX; x < width - marginX; x++) {
                if (x < width * 0.22 && y < height * 0.22) continue;
                const offset = ((y * width) + x) * 4;
                const alpha = data[offset + 3];
                if (alpha < 70) continue;

                const r = data[offset];
                const g = data[offset + 1];
                const b = data[offset + 2];
                const luminance = getLuminance(r, g, b);
                const channelRange = Math.max(r, g, b) - Math.min(r, g, b);
                const isInk = mode === 'dark'
                    ? luminance < 105
                    : luminance < 232 || channelRange > 34;

                if (!isInk) continue;

                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
                count++;
            }
        }

        if (count < Math.max(24, width * height * 0.00045)) return null;
        return { minX, minY, maxX, maxY, count };
    };

    const bounds = scan('dark') || scan('nonBackground');
    if (!bounds) return null;

    return {
        centerX: (bounds.minX + bounds.maxX) / 2,
        bottomY: bounds.maxY,
    };
};

const getRegistrationStrength = (board: Artboard) => {
    const motion = getAnimationConfig(board)?.motion;
    if (motion === 'camera-move') return { x: 0, y: 0 };
    if (motion === 'character-action') return { x: 0.35, y: 0.85 };
    if (motion === 'transformation') return { x: 0.65, y: 0.65 };
    if (motion === 'explainer-flow') return { x: 0.2, y: 0.45 };
    return { x: 0.75, y: 0.85 };
};

const drawTranslatedCanvasWithBleed = (
    ctx: CanvasRenderingContext2D,
    sourceCanvas: HTMLCanvasElement,
    dx: number,
    dy: number
) => {
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(sourceCanvas, dx, dy);

    if (dy > 0) {
        ctx.drawImage(sourceCanvas, 0, 0, width, 1, 0, 0, width, dy);
    } else if (dy < 0) {
        ctx.drawImage(sourceCanvas, 0, height - 1, width, 1, 0, height + dy, width, -dy);
    }

    if (dx > 0) {
        ctx.drawImage(sourceCanvas, 0, 0, 1, height, 0, 0, dx, height);
    } else if (dx < 0) {
        ctx.drawImage(sourceCanvas, width - 1, 0, 1, height, width + dx, 0, -dx, height);
    }
};

const getEdgeDarkLineScore = (
    imageData: ImageData,
    side: 'top' | 'right' | 'bottom' | 'left',
    inset: number
) => {
    const { width, height, data } = imageData;
    const isHorizontal = side === 'top' || side === 'bottom';
    const length = isHorizontal ? width : height;
    const step = Math.max(1, Math.floor(length / 900));
    let sum = 0;
    let samples = 0;

    for (let pos = 0; pos < length; pos += step) {
        const x = side === 'left' ? inset : side === 'right' ? width - 1 - inset : pos;
        const y = side === 'top' ? inset : side === 'bottom' ? height - 1 - inset : pos;
        const offset = ((clamp(y, 0, height - 1) * width) + clamp(x, 0, width - 1)) * 4;
        sum += getDarkLineWeight(data, offset);
        samples++;
    }

    return samples ? sum / samples : 0;
};

const getDarkEdgeInset = (imageData: ImageData, side: 'top' | 'right' | 'bottom' | 'left', maxInset: number) => {
    let inset = 0;
    for (let index = 0; index < maxInset; index++) {
        const score = getEdgeDarkLineScore(imageData, side, index);
        if (score < 0.08) break;
        inset = index + 1;
    }
    return inset;
};

const cleanFrameCanvasEdges = (sourceCanvas: HTMLCanvasElement) => {
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;
    const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
    if (!sourceCtx || width < 8 || height < 8) return sourceCanvas;

    const maxDynamicInset = Math.max(1, Math.min(12, Math.round(Math.min(width, height) * 0.025)));
    const imageData = sourceCtx.getImageData(0, 0, width, height);
    const baseInset = Math.max(1, Math.min(3, Math.round(Math.min(width, height) * 0.004)));
    const left = Math.max(baseInset, getDarkEdgeInset(imageData, 'left', maxDynamicInset));
    const top = Math.max(baseInset, getDarkEdgeInset(imageData, 'top', maxDynamicInset));
    const right = Math.max(baseInset, getDarkEdgeInset(imageData, 'right', maxDynamicInset));
    const bottom = Math.max(baseInset, getDarkEdgeInset(imageData, 'bottom', maxDynamicInset));

    if (left + right >= width - 2 || top + bottom >= height - 2) return sourceCanvas;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return sourceCanvas;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
        sourceCanvas,
        left,
        top,
        width - left - right,
        height - top - bottom,
        0,
        0,
        width,
        height
    );
    return canvas;
};

const stabilizeFrameCanvases = (canvases: HTMLCanvasElement[], board: Artboard) => {
    const anchors = canvases.map(detectRegistrationAnchor);
    const validAnchors = anchors.filter((anchor): anchor is NonNullable<typeof anchor> => Boolean(anchor));
    if (validAnchors.length < 2) return canvases;

    const width = canvases[0]?.width || 1;
    const height = canvases[0]?.height || 1;
    const targetX = medianNumber(validAnchors.map(anchor => anchor.centerX), width / 2);
    const targetBottom = medianNumber(validAnchors.map(anchor => anchor.bottomY), height * 0.86);
    const strength = getRegistrationStrength(board);

    return canvases.map((sourceCanvas, index) => {
        const anchor = anchors[index];
        if (!anchor || (strength.x === 0 && strength.y === 0)) return sourceCanvas;

        const dx = Math.round(clamp((targetX - anchor.centerX) * strength.x, -width * 0.12, width * 0.12));
        const dy = Math.round(clamp((targetBottom - anchor.bottomY) * strength.y, -height * 0.12, height * 0.12));
        if (dx === 0 && dy === 0) return sourceCanvas;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return sourceCanvas;

        drawTranslatedCanvasWithBleed(ctx, sourceCanvas, dx, dy);
        return canvas;
    });
};

const applyFrameOffsets = (canvases: HTMLCanvasElement[], offsets: FrameOffset[] = []) => {
    return canvases.map((sourceCanvas, index) => {
        const offset = offsets[index];
        if (!offset || (offset.x === 0 && offset.y === 0)) return sourceCanvas;

        const canvas = document.createElement('canvas');
        canvas.width = sourceCanvas.width;
        canvas.height = sourceCanvas.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return sourceCanvas;

        drawTranslatedCanvasWithBleed(ctx, sourceCanvas, offset.x, offset.y);
        return canvas;
    });
};

const renderFrameCanvases = (
    sourceImage: HTMLImageElement,
    rects: FrameRect[],
    board: Artboard,
    offsets: FrameOffset[] = []
) => {
    const targetWidth = Math.max(1, Math.round(medianNumber(rects.map(rect => rect.width), rects[0]?.width || 1)));
    const targetHeight = Math.max(1, Math.round(medianNumber(rects.map(rect => rect.height), rects[0]?.height || 1)));

    const canvases = rects.map(rect => {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas is not available');

        ctx.drawImage(sourceImage, rect.x, rect.y, rect.width, rect.height, 0, 0, targetWidth, targetHeight);
        return canvas;
    });

    return applyFrameOffsets(stabilizeFrameCanvases(canvases, board), offsets).map(cleanFrameCanvasEdges);
};

const loadImageElement = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        if (src.startsWith('http://') || src.startsWith('https://')) {
            img.crossOrigin = 'anonymous';
        }
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = src;
    });
};

const blobToPngBlob = async (blob: Blob) => {
    if (blob.type === 'image/png') return blob;

    const url = URL.createObjectURL(blob);
    try {
        const image = await loadImageElement(url);
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth || image.width;
        canvas.height = image.naturalHeight || image.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return blob;
        ctx.drawImage(image, 0, 0);
        return await new Promise<Blob>((resolve) => {
            canvas.toBlob((pngBlob) => resolve(pngBlob || blob), 'image/png');
        });
    } finally {
        URL.revokeObjectURL(url);
    }
};

const getGeneratedImageDetails = (
    image: GeneratedImage,
    resolution: string,
    fallbackStyle = 'Animation'
): NonNullable<GeneratedImage['details']> => ({
    platform: image.details?.platform || 'custom',
    resolution,
    style: image.details?.style || fallbackStyle,
    tokens: image.details?.tokens || {
        primaryColor: '#14b8a6',
        backgroundColor: '#ffffff',
        accentColor: '#06b6d4',
        decorativeColor: '#f59e0b',
        borderRadius: 'medium',
        spacing: 'comfortable',
    },
    fullPrompt: image.details?.fullPrompt || image.prompt || '',
    ...(image.details || {}),
});

const sliceAnimationSheet = async (board: Artboard): Promise<SlicedAnimationFrames> => {
    const sourceImage = await loadImageElement(board.image.url);
    const frameCount = getAnimationFrameCount(board);
    const fps = getAnimationFps(board);
    const grid = inferFrameGrid(sourceImage.naturalWidth || sourceImage.width, sourceImage.naturalHeight || sourceImage.height, frameCount);
    const { rects, xLines, yLines, detectedGrid } = detectAnimationFrameRects(sourceImage, grid, frameCount);
    const frameCanvases = renderFrameCanvases(sourceImage, rects, board);
    const width = frameCanvases[0]?.width || Math.max(1, Math.round((sourceImage.naturalWidth || sourceImage.width) / grid.cols));
    const height = frameCanvases[0]?.height || Math.max(1, Math.round((sourceImage.naturalHeight || sourceImage.height) / grid.rows));
    const batchId = createClientId(`frames-${board.image.id}`);
    const now = Date.now();

    const frames: GeneratedImage[] = [];
    for (let index = 0; index < frameCount; index++) {
        const canvas = frameCanvases[index];
        if (!canvas) continue;
        frames.push({
            id: createClientId(`${board.image.id}-frame-${index + 1}`),
            url: canvas.toDataURL('image/png'),
            prompt: `${board.image.prompt || board.label}\nFrame ${index + 1}/${frameCount}`,
            timestamp: now + index,
            details: {
                ...getGeneratedImageDetails(board.image, `${width}x${height}`),
                resolution: `${width}x${height}`,
                batchId,
                animationFrame: {
                    sourceImageId: board.image.id,
                    frameIndex: index,
                    frameCount,
                    fps,
                    sourceGrid: { cols: grid.cols, rows: grid.rows },
                },
            },
        });
    }

    return { frames, columns: grid.cols, rows: grid.rows, xLines, yLines, detectedGrid };
};

const cloneFramesForCanvas = (frames: GeneratedImage[], fps: number) => {
    const batchId = createClientId('animation-preview');
    const now = Date.now();

    return frames.map((frame, index) => {
        const previousFrameMeta = frame.details?.animationFrame;
        return {
            ...frame,
            id: createClientId(`${frame.id}-copy-${index + 1}`),
            timestamp: now + index,
            details: {
                ...getGeneratedImageDetails(frame, frame.details?.resolution || '1000x1000'),
                batchId,
                animationFrame: {
                    ...previousFrameMeta,
                    sourceImageId: previousFrameMeta?.sourceImageId || frame.id,
                    frameIndex: index,
                    frameCount: frames.length,
                    fps,
                    sourceGrid: previousFrameMeta?.sourceGrid,
                },
            },
        };
    });
};

const updateLineAt = (lines: number[], index: number, value: number, max: number) => {
    const next = [...lines];
    const minValue = index === 0 ? 0 : next[index - 1] + 8;
    const maxValue = index === next.length - 1 ? max : next[index + 1] - 8;
    next[index] = Math.round(clamp(value, minValue, maxValue));
    return next;
};

const buildFramesFromSliceAdjust = async (board: Artboard, state: SliceAdjustState): Promise<GeneratedImage[]> => {
    const sourceImage = await loadImageElement(state.imageUrl);
    const rects = buildFrameRectsFromLines(state.xLines, state.yLines, state.frameCount, state.width, state.height);
    const frameCanvases = renderFrameCanvases(sourceImage, rects, board, state.offsets);
    const width = frameCanvases[0]?.width || Math.max(1, Math.round(state.width / state.grid.cols));
    const height = frameCanvases[0]?.height || Math.max(1, Math.round(state.height / state.grid.rows));
    const batchId = createClientId(`frames-${board.image.id}`);
    const now = Date.now();

    return frameCanvases.map((canvas, index) => ({
        id: createClientId(`${board.image.id}-frame-${index + 1}`),
        url: canvas.toDataURL('image/png'),
        prompt: `${board.image.prompt || board.label}\nFrame ${index + 1}/${state.frameCount}`,
        timestamp: now + index,
        details: {
            ...getGeneratedImageDetails(board.image, `${width}x${height}`),
            resolution: `${width}x${height}`,
            batchId,
            animationFrame: {
                sourceImageId: board.image.id,
                frameIndex: index,
                frameCount: state.frameCount,
                fps: state.fps,
                sourceGrid: state.grid,
            },
        },
    }));
};

const CanvasBoard: React.FC<Props> = ({
    artboards, groups, onSelectArtboard, onInspectArtboard,
    onMoveArtboard, onMoveGroup, onDeleteArtboard, onUploadImage, onAddImagesToCanvas,
    onAutoArrange, onRegenerateArtboard, onUpdateArtboard,
    lang, regeneratingId, onRequestConfirm, onDeleteHistoryItem, onCopyImage,
    devMode,
    scale, setScale, position, setPosition
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sliceAdjustImageRef = useRef<HTMLDivElement>(null);
    const t = I18N[lang];

    const [historyModalOpen, setHistoryModalOpen] = useState<string | null>(null);

    // Interaction State
    const [isPanning, setIsPanning] = useState(false);
    const [movingArtboard, setMovingArtboard] = useState<string | null>(null);
    const [movingGroup, setMovingGroup] = useState<string | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const [isDragOver, setIsDragOver] = useState(false);
    const transformLayerRef = useRef<HTMLDivElement>(null);
    const dotGridRef = useRef<HTMLDivElement>(null);
    const transitionRemovedRef = useRef(false);
    const isPanningRef = useRef(false);
    const syncTimeoutRef = useRef<ReturnType<typeof setTimeout>>(0 as any);
    const [guides, setGuides] = useState<{ type: 'v' | 'h'; pos: number }[]>([]);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, artboardId: string } | null>(null);

    const [editingLabel, setEditingLabel] = useState<{ id: string, text: string } | null>(null);
    const [animationPreview, setAnimationPreview] = useState<AnimationPreviewState | null>(null);
    const [animationFrameIndex, setAnimationFrameIndex] = useState(0);
    const [isAnimationPlaying, setIsAnimationPlaying] = useState(true);
    const [isSlicingAnimation, setIsSlicingAnimation] = useState(false);
    const [animationError, setAnimationError] = useState<string | null>(null);
    const [clipboardMessage, setClipboardMessage] = useState<string | null>(null);
    const [sliceAdjust, setSliceAdjust] = useState<SliceAdjustState | null>(null);
    const [uiSplitArtboard, setUiSplitArtboard] = useState<Artboard | null>(null);
    const clipboardMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => () => {
        if (clipboardMessageTimeoutRef.current) clearTimeout(clipboardMessageTimeoutRef.current);
    }, []);

    const showClipboardMessage = useCallback((message: string) => {
        setClipboardMessage(message);
        if (clipboardMessageTimeoutRef.current) clearTimeout(clipboardMessageTimeoutRef.current);
        clipboardMessageTimeoutRef.current = setTimeout(() => setClipboardMessage(null), 2200);
    }, []);

    const copyImageToClipboard = useCallback(async (imageUrl: string) => {
        try {
            const ClipboardItemCtor = (window as any).ClipboardItem;
            if (!navigator.clipboard?.write || !ClipboardItemCtor) {
                throw new Error('Image clipboard is not supported');
            }

            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error(`Image fetch failed: ${response.status}`);
            const sourceBlob = await response.blob();
            const pngBlob = await blobToPngBlob(sourceBlob);
            await navigator.clipboard.write([
                new ClipboardItemCtor({ [pngBlob.type || 'image/png']: pngBlob }),
            ]);
            showClipboardMessage(lang === 'zh' ? '\u5df2\u590d\u5236\u56fe\u7247\u5230\u526a\u8d34\u677f' : 'Image copied to clipboard');
        } catch (error) {
            try {
                await navigator.clipboard?.writeText(imageUrl);
                showClipboardMessage(lang === 'zh' ? '\u5df2\u590d\u5236\u56fe\u7247\u94fe\u63a5' : 'Image link copied');
            } catch {
                console.error(error);
                showClipboardMessage(lang === 'zh' ? '\u590d\u5236\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5\u6d4f\u89c8\u5668\u526a\u8d34\u677f\u6743\u9650' : 'Copy failed. Check clipboard permission.');
            }
        }
    }, [lang, showClipboardMessage]);

    const handleSaveLabel = () => {
        if (editingLabel && onUpdateArtboard) {
            onUpdateArtboard(editingLabel.id, { label: editingLabel.text });
            setEditingLabel(null);
        }
    };

    // Refs for Event Listeners (to avoid stale closures without re-binding)
    const scaleRef = useRef(scale);
    const posRef = useRef(position);
    useEffect(() => { scaleRef.current = scale; }, [scale]);
    useEffect(() => { posRef.current = position; }, [position]);

    // Direct DOM update — bypasses React render for smooth panning/zooming
    const applyTransformToDOM = (pos: { x: number; y: number }, s: number) => {
        if (transformLayerRef.current) {
            transformLayerRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${s})`;
        }
        if (dotGridRef.current) {
            dotGridRef.current.style.opacity = '0';
        }
    };

    // Guard: if React re-renders during panning, re-apply the ref-based transform
    // so React's stale inline style doesn't overwrite our DOM position
    useLayoutEffect(() => {
        if (isPanningRef.current && transformLayerRef.current) {
            transformLayerRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px) scale(${scaleRef.current})`;
        }
    });

    // Sync React state after interaction ends (debounced)
    const scheduleSyncToReact = (pos: { x: number; y: number }, s: number) => {
        clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(() => {
            setScale(s);
            setPosition(pos);
            if (dotGridRef.current) {
                dotGridRef.current.style.opacity = '';
            }
        }, 300);
    };

    // ... (Keep existing Wheel, toWorld, Mouse handlers same as before) ...
    useEffect(() => {
        const node = containerRef.current;
        if (!node) return;
        const handleNativeWheel = (e: WheelEvent) => {
            e.preventDefault();
            setContextMenu(null);
            const deltaUnit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 240 : 1;
            const deltaY = e.deltaY * deltaUnit;
            const prevScale = scaleRef.current;
            const prevPos = posRef.current;
            const zoomFactor = Math.exp(-deltaY * 0.0012);
            const nextScale = Math.min(Math.max(0.1, prevScale * zoomFactor), 5);

            const rect = node.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const worldX = (mouseX - prevPos.x) / prevScale;
            const worldY = (mouseY - prevPos.y) / prevScale;

            const newPos = {
                x: mouseX - worldX * nextScale,
                y: mouseY - worldY * nextScale,
            };

            scaleRef.current = nextScale;
            posRef.current = newPos;
            applyTransformToDOM(newPos, nextScale);
            scheduleSyncToReact(newPos, nextScale);
        };
        node.addEventListener('wheel', handleNativeWheel, { passive: false });
        return () => node.removeEventListener('wheel', handleNativeWheel);
    }, []);


    const toWorld = (screenX: number, screenY: number) => {
        if (!containerRef.current) return { x: 0, y: 0 };
        const rect = containerRef.current.getBoundingClientRect();
        return { x: (screenX - rect.left - position.x) / scale, y: (screenY - rect.top - position.y) / scale };
    };

    const handleMouseDown = (e: React.MouseEvent, artboardId?: string) => {
        if (e.button !== 0 && e.button !== 1) return;
        setContextMenu(null);
        if (artboardId) {
            e.stopPropagation();
            setSelectedGroup(artboards.find(a => a.id === artboardId)?.groupId || null);
            setMovingArtboard(artboardId);
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            // Clear isNew flag when user clicks the artboard
            const board = artboards.find(a => a.id === artboardId);
            if (board?.isNew && onUpdateArtboard) {
                onUpdateArtboard(artboardId, { isNew: false });
            }
        } else {
            setSelectedGroup(null);
            setIsPanning(true);
            isPanningRef.current = true;
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            if (transformLayerRef.current) {
                transformLayerRef.current.style.transition = 'none';
                transformLayerRef.current.style.pointerEvents = 'none';
                transitionRemovedRef.current = true;
            }
        }
    };

    const handleGroupMouseDown = (e: React.MouseEvent, groupId: string) => {
        if (e.button !== 0 && e.button !== 1) return;
        e.stopPropagation();
        setContextMenu(null);
        setSelectedGroup(groupId);
        setMovingGroup(groupId);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        const currentScale = scaleRef.current || scale;
        if (movingGroup && onMoveGroup) {
            onMoveGroup(movingGroup, dx / currentScale, dy / currentScale);
            lastMousePos.current = { x: e.clientX, y: e.clientY };
        } else if (movingArtboard) {
            const deltaX = dx / currentScale;
            const deltaY = dy / currentScale;
            const target = artboards.find(a => a.id === movingArtboard);
            if (target) {
                let newX = target.x + deltaX;
                let newY = target.y + deltaY;
                const activeGuides: { type: 'v' | 'h'; pos: number }[] = [];
                const edgesX = [newX, newX + target.width / 2, newX + target.width];
                const edgesY = [newY, newY + target.height / 2, newY + target.height];
                let snappedX = false, snappedY = false;

                for (const other of artboards) {
                    if (other.id === movingArtboard) continue;
                    const otherEdgesX = [other.x, other.x + other.width / 2, other.x + other.width];
                    const otherEdgesY = [other.y, other.y + other.height / 2, other.y + other.height];
                    if (!snappedX) {
                        for (let i = 0; i < 3; i++) {
                            for (const ox of otherEdgesX) {
                                if (Math.abs(edgesX[i] - ox) < SNAP_THRESHOLD / currentScale) {
                                    newX = ox - (i === 1 ? target.width / 2 : i === 2 ? target.width : 0);
                                    activeGuides.push({ type: 'v', pos: ox });
                                    snappedX = true; break;
                                }
                            }
                            if (snappedX) break;
                        }
                    }
                    if (!snappedY) {
                        for (let i = 0; i < 3; i++) {
                            for (const oy of otherEdgesY) {
                                if (Math.abs(edgesY[i] - oy) < SNAP_THRESHOLD / currentScale) {
                                    newY = oy - (i === 1 ? target.height / 2 : i === 2 ? target.height : 0);
                                    activeGuides.push({ type: 'h', pos: oy });
                                    snappedY = true; break;
                                }
                            }
                            if (snappedY) break;
                        }
                    }
                }
                setGuides(activeGuides);
                onMoveArtboard(movingArtboard, newX, newY);
            }
            lastMousePos.current = { x: e.clientX, y: e.clientY };
        } else if (isPanningRef.current) {
            const newPos = { x: posRef.current.x + dx, y: posRef.current.y + dy };
            posRef.current = newPos;
            applyTransformToDOM(newPos, scaleRef.current);
            lastMousePos.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseUp = () => {
        const wasPanning = isPanningRef.current;
        const wasMoving = movingArtboard;
        setIsPanning(false);
        isPanningRef.current = false;
        setMovingArtboard(null);
        setMovingGroup(null);
        setGuides([]);
        // Sync final position to React state after panning
        if (wasPanning) {
            clearTimeout(syncTimeoutRef.current);
            const finalPos = { ...posRef.current };
            const finalScale = scaleRef.current;
            setScale(finalScale);
            setPosition(finalPos);
            // Restore dot grid
            if (dotGridRef.current) {
                dotGridRef.current.style.opacity = '';
            }
        }
        if (transitionRemovedRef.current && transformLayerRef.current) {
            transformLayerRef.current.style.transition = 'transform 0.1s ease-out';
            transformLayerRef.current.style.pointerEvents = '';
            transitionRemovedRef.current = false;
        }
    };
    const handleContextMenu = (e: React.MouseEvent, artboardId: string) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, artboardId }); };
    const handleRegenerateClick = () => { if (contextMenu) { onRegenerateArtboard(contextMenu.artboardId); setContextMenu(null); } };

    const openAnimationPreview = async (artboardId: string, preferSlicing = false) => {
        const board = artboards.find(item => item.id === artboardId);
        if (!board) return;

        setContextMenu(null);
        setAnimationError(null);
        setIsSlicingAnimation(true);

        try {
            const shouldSlice = preferSlicing || isStoryboardSheet(board, artboards);
            if (shouldSlice) {
                const sliced = await sliceAnimationSheet(board);
                setAnimationPreview({
                    artboardId,
                    frames: sliced.frames,
                    fps: getAnimationFps(board),
                    columns: sliced.columns,
                    source: 'sliced',
                    groupLabel: `${board.label || 'Animation'} Frames`,
                });
            } else {
                const batchBoards = getAnimationBatchBoards(artboards, board);
                const frames = (batchBoards.length > 1 ? batchBoards : [board]).map(item => item.image);
                setAnimationPreview({
                    artboardId,
                    frames,
                    fps: getAnimationFps(board),
                    columns: Math.max(1, Math.ceil(Math.sqrt(frames.length))),
                    source: 'batch',
                    groupLabel: board.groupId || board.label || 'Animation',
                });
            }

            setAnimationFrameIndex(0);
            setIsAnimationPlaying(true);
        } catch (error) {
            console.error(error);
            setAnimationError(lang === 'zh' ? '切图失败，请确认图片已加载完成' : 'Failed to slice frames. Make sure the image is loaded.');
        } finally {
            setIsSlicingAnimation(false);
        }
    };

    const addAnimationFramesToCanvas = async () => {
        if (!animationPreview || !onAddImagesToCanvas) return;

        const sourceBoard = artboards.find(item => item.id === animationPreview.artboardId);
        const origin = sourceBoard
            ? { x: sourceBoard.x + sourceBoard.width + 80, y: sourceBoard.y }
            : toWorld(window.innerWidth / 2, window.innerHeight / 2);
        const framesToAdd = cloneFramesForCanvas(animationPreview.frames, animationPreview.fps);

        await onAddImagesToCanvas(framesToAdd, origin, {
            groupLabel: animationPreview.groupLabel,
            columns: animationPreview.columns,
        });
        setAnimationPreview(null);
    };

    const sliceAnimationFramesToCanvas = async (artboardId: string) => {
        if (!onAddImagesToCanvas) return;

        const board = artboards.find(item => item.id === artboardId);
        if (!board) return;

        setContextMenu(null);
        setAnimationError(null);
        setIsSlicingAnimation(true);

        try {
            const sliced = await sliceAnimationSheet(board);
            const framesToAdd = cloneFramesForCanvas(sliced.frames, getAnimationFps(board));

            await onAddImagesToCanvas(
                framesToAdd,
                { x: board.x + board.width + 80, y: board.y },
                {
                    groupLabel: `${board.label || 'Animation'} Frames`,
                    columns: sliced.columns,
                }
            );
        } catch (error) {
            console.error(error);
            setAnimationError(lang === 'zh' ? '切图失败，请确认图片已加载完成' : 'Failed to slice frames. Make sure the image is loaded.');
        } finally {
            setIsSlicingAnimation(false);
        }
    };

    const openSliceAdjust = async (artboardId: string) => {
        const board = artboards.find(item => item.id === artboardId);
        if (!board) return;

        setContextMenu(null);
        setAnimationPreview(null);
        setAnimationError(null);
        setIsSlicingAnimation(true);

        try {
            const sourceImage = await loadImageElement(board.image.url);
            const width = sourceImage.naturalWidth || sourceImage.width;
            const height = sourceImage.naturalHeight || sourceImage.height;
            const frameCount = getAnimationFrameCount(board);
            const grid = inferFrameGrid(width, height, frameCount);
            const detected = detectAnimationFrameRects(sourceImage, grid, frameCount);

            setSliceAdjust({
                artboardId,
                imageUrl: board.image.url,
                width,
                height,
                frameCount,
                grid,
                xLines: detected.xLines,
                yLines: detected.yLines,
                offsets: Array.from({ length: frameCount }, () => ({ x: 0, y: 0 })),
                fps: getAnimationFps(board),
                selectedFrame: 0,
                selectedLine: null,
                groupLabel: `${board.label || 'Animation'} Frames`,
            });
        } catch (error) {
            console.error(error);
            setAnimationError(lang === 'zh' ? '无法打开切图校准，请确认图片已加载完成' : 'Failed to open slice adjustment. Make sure the image is loaded.');
        } finally {
            setIsSlicingAnimation(false);
        }
    };

    const previewSliceAdjust = async () => {
        if (!sliceAdjust) return;
        const board = artboards.find(item => item.id === sliceAdjust.artboardId);
        if (!board) return;

        setIsSlicingAnimation(true);
        try {
            const frames = await buildFramesFromSliceAdjust(board, sliceAdjust);
            setAnimationPreview({
                artboardId: sliceAdjust.artboardId,
                frames,
                fps: sliceAdjust.fps,
                columns: sliceAdjust.grid.cols,
                source: 'sliced',
                groupLabel: sliceAdjust.groupLabel,
            });
            setAnimationFrameIndex(0);
            setIsAnimationPlaying(true);
            setSliceAdjust(null);
        } catch (error) {
            console.error(error);
            setAnimationError(lang === 'zh' ? '校准预览失败' : 'Failed to preview adjusted frames.');
        } finally {
            setIsSlicingAnimation(false);
        }
    };

    const addAdjustedFramesToCanvas = async () => {
        if (!sliceAdjust || !onAddImagesToCanvas) return;
        const board = artboards.find(item => item.id === sliceAdjust.artboardId);
        if (!board) return;

        setIsSlicingAnimation(true);
        try {
            const frames = await buildFramesFromSliceAdjust(board, sliceAdjust);
            const framesToAdd = cloneFramesForCanvas(frames, sliceAdjust.fps);
            await onAddImagesToCanvas(
                framesToAdd,
                { x: board.x + board.width + 80, y: board.y },
                { groupLabel: sliceAdjust.groupLabel, columns: sliceAdjust.grid.cols }
            );
            setSliceAdjust(null);
        } catch (error) {
            console.error(error);
            setAnimationError(lang === 'zh' ? '添加校准帧失败' : 'Failed to add adjusted frames.');
        } finally {
            setIsSlicingAnimation(false);
        }
    };

    const updateSliceAdjustOffset = (dx: number, dy: number) => {
        setSliceAdjust(prev => {
            if (!prev) return prev;
            const offsets = [...prev.offsets];
            const current = offsets[prev.selectedFrame] || { x: 0, y: 0 };
            offsets[prev.selectedFrame] = {
                x: clamp(current.x + dx, -80, 80),
                y: clamp(current.y + dy, -80, 80),
            };
            return { ...prev, offsets };
        });
    };

    const resetSliceAdjustOffset = () => {
        setSliceAdjust(prev => {
            if (!prev) return prev;
            const offsets = [...prev.offsets];
            offsets[prev.selectedFrame] = { x: 0, y: 0 };
            return { ...prev, offsets };
        });
    };

    const handleSliceAdjustPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!sliceAdjust?.selectedLine || !sliceAdjustImageRef.current) return;
        const rect = sliceAdjustImageRef.current.getBoundingClientRect();
        const { axis, index } = sliceAdjust.selectedLine;

        if (axis === 'x') {
            const value = ((event.clientX - rect.left) / Math.max(1, rect.width)) * sliceAdjust.width;
            setSliceAdjust(prev => prev ? { ...prev, xLines: updateLineAt(prev.xLines, index, value, prev.width) } : prev);
        } else {
            const value = ((event.clientY - rect.top) / Math.max(1, rect.height)) * sliceAdjust.height;
            setSliceAdjust(prev => prev ? { ...prev, yLines: updateLineAt(prev.yLines, index, value, prev.height) } : prev);
        }
    };

    useEffect(() => {
        if (!animationPreview || !isAnimationPlaying || animationPreview.frames.length <= 1) return;

        const delay = Math.max(40, 1000 / Math.max(1, animationPreview.fps));
        const timer = window.setInterval(() => {
            setAnimationFrameIndex(index => (index + 1) % animationPreview.frames.length);
        }, delay);

        return () => window.clearInterval(timer);
    }, [animationPreview, isAnimationPlaying]);

    const handleDoubleClick = (e: React.MouseEvent, artboardId: string) => {
        e.stopPropagation();
        const board = artboards.find(b => b.id === artboardId);
        if (!board || !containerRef.current) return;

        const container = containerRef.current;
        const cW = container.clientWidth;
        const cH = container.clientHeight;

        // Padding around the focused board
        const padding = 60;

        // Calculate scale to fit
        const scaleX = (cW - padding) / board.width;
        const scaleY = (cH - padding) / board.height;
        // Cap scale at 1.5 or 2 (don't zoom in crazy amounts on tiny elements)
        const newScale = Math.min(Math.min(scaleX, scaleY), 2.0);

        // Center it
        // Center of screen X = newPos.x + (board.x + board.width/2) * newScale
        const newX = (cW / 2) - (board.x + board.width / 2) * newScale;
        const newY = (cH / 2) - (board.y + board.height / 2) * newScale;

        setScale(newScale);
        setPosition({ x: newX, y: newY });
    };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
    const handleDragLeave = () => { setIsDragOver(false); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files).filter((f: File) => f.type.startsWith('image/'));
        if (files.length > 0) { const { x, y } = toWorld(e.clientX, e.clientY); onUploadImage(files[0], x, y); }
    };

    const resetView = () => { setPosition({ x: 50, y: 50 }); setScale(0.8); };
    const fitToScreen = () => {
        if (artboards.length === 0) return;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        artboards.forEach(ab => { minX = Math.min(minX, ab.x); minY = Math.min(minY, ab.y); maxX = Math.max(maxX, ab.x + ab.width); maxY = Math.max(maxY, ab.y + ab.height); });
        if (!containerRef.current) return;
        const cW = containerRef.current.clientWidth, cH = containerRef.current.clientHeight;
        const contentW = maxX - minX + 200, contentH = maxY - minY + 200;
        const newScale = Math.min(cW / contentW, cH / contentH, 1);
        setScale(newScale);
        setPosition({ x: (cW - contentW * newScale) / 2 - minX * newScale + 100 * newScale, y: (cH - contentH * newScale) / 2 - minY * newScale + 100 * newScale });
    };

    useEffect(() => { const closeMenu = () => setContextMenu(null); window.addEventListener('click', closeMenu); return () => window.removeEventListener('click', closeMenu); }, []);
    const handleSpecUpdate = (id: string, newDs: DesignSystem) => { if (onUpdateArtboard) { const target = artboards.find(a => a.id === id); if (target && target.image.details) { onUpdateArtboard(id, { image: { ...target.image, details: { ...target.image.details, designSystem: newDs } } }); } } };

    return (
        <div className="relative w-full h-full overflow-hidden bg-[#e5e5e5] dark:bg-[#1c1917] select-none touch-pan-x touch-pan-y">
            <div ref={dotGridRef} className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #888 1px, transparent 1px)', backgroundSize: `${Math.max(2, 20 * scale)}px ${Math.max(2, 20 * scale)}px`, backgroundPosition: `${position?.x ?? 0}px ${position?.y ?? 0}px`, transition: 'opacity 0.15s ease-out' }} />
            {isDragOver && (<div className="absolute inset-0 bg-teal-500/20 z-50 flex items-center justify-center border-4 border-teal-500 border-dashed pointer-events-none"><span className="text-2xl font-bold text-teal-600 bg-white/80 px-4 py-2 rounded">{lang === 'zh' ? '释放以上传图片到画布' : 'Drop to add image to canvas'}</span></div>)}

            <div ref={containerRef} className={`w-full h-full ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`} onMouseDown={(e) => handleMouseDown(e)} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                <div
                    ref={transformLayerRef}
                    style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, transformOrigin: '0 0', willChange: 'transform' }}
                >
                    {groups.map(group => (
                        <div
                            key={group.id}
                            style={{ position: 'absolute', left: group.x - 20, top: group.y - 40, width: group.width + 40, height: group.height + 60 }}
                            className={`rounded-xl border-2 border-dashed bg-stone-100/50 dark:bg-stone-800/30 cursor-grab active:cursor-grabbing ${
                                selectedGroup === group.id || movingGroup === group.id
                                    ? 'border-teal-500 ring-4 ring-teal-500/20'
                                    : 'border-stone-300 dark:border-stone-700 hover:border-teal-400'
                            }`}
                            onMouseDown={(e) => handleGroupMouseDown(e, group.id)}
                        >
                            <div className="absolute -top-12 left-0 text-lg font-bold text-stone-400 uppercase tracking-widest bg-stone-200 dark:bg-stone-800 px-4 py-1.5 rounded-lg shadow-sm flex items-center gap-2">
                                <IconLoader name="drag" size={16} />
                                {group.label}
                            </div>
                        </div>
                    ))}
                    {artboards.map(board => (
                        <div key={board.id} style={{ position: 'absolute', left: board.x, top: board.y, width: board.width, height: board.height, contain: 'layout style' }} className={`bg-white shadow-md dark:shadow-black/40 group hover:ring-2 ring-teal-500/50 ${movingArtboard === board.id ? 'ring-4 ring-teal-500 cursor-grabbing z-50' : 'cursor-grab'} rounded-lg ${board.isNew ? 'flash-new' : ''}`} onMouseDown={(e) => handleMouseDown(e, board.id)} onContextMenu={(e) => handleContextMenu(e, board.id)} onDoubleClick={(e) => handleDoubleClick(e, board.id)}>

                            {/* Floating Toolbar & Label */}
                            <div
                                className="absolute bottom-full mb-2 left-0 w-full flex items-center justify-start z-[60] pointer-events-auto"
                                onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, board.id); }}
                            >
                                <div
                                    style={{ transform: `scale(${Math.min(5, 1 / Math.max(0.01, scale))})`, transformOrigin: 'bottom left' }}
                                    className="bg-white dark:bg-stone-800 shadow-lg border border-stone-200 dark:border-stone-700 rounded-lg flex items-center p-1.5 gap-2 transition-[opacity,transform] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-200"
                                >
                                    {/* Editable Label */}
                                    <div className="flex items-center">
                                        {editingLabel?.id === board.id ? (
                                            <input
                                                autoFocus
                                                className="bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded px-1 py-0.5 text-xs font-bold text-stone-800 dark:text-stone-200 w-32 outline-none focus:ring-2 ring-teal-500"
                                                value={editingLabel.text}
                                                onChange={e => setEditingLabel({ ...editingLabel, text: e.target.value })}
                                                onBlur={handleSaveLabel}
                                                onKeyDown={e => e.key === 'Enter' && handleSaveLabel()}
                                                onMouseDown={e => e.stopPropagation()}
                                                onClick={e => e.stopPropagation()}
                                            />
                                        ) : (
                                            <span
                                                className="text-xs font-bold text-stone-600 dark:text-stone-300 px-1 cursor-text hover:text-teal-500 max-w-[120px] truncate"
                                                onDoubleClick={(e) => { e.stopPropagation(); setEditingLabel({ id: board.id, text: board.label }); }}
                                                title={lang === 'zh' ? '双击重命名' : 'Double click to rename'}
                                            >
                                                {board.label || "Untitled"}
                                            </span>
                                        )}
                                    </div>

                                    <div className="w-px h-3 bg-stone-300 dark:bg-stone-600"></div>

                                    {/* Toolbar Actions */}
                                    <div className="flex items-center gap-1">
                                        {/* History */}
                                        {board.history && board.history.length > 1 && (
                                            <div className="flex items-center bg-stone-100 dark:bg-stone-700 rounded overflow-hidden">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const hist = board.history!;
                                                        const currIdx = hist.findIndex(h => h.id === board.image.id);
                                                        if (currIdx > 0 && onUpdateArtboard) onUpdateArtboard(board.id, { image: hist[currIdx - 1] });
                                                    }}
                                                    disabled={!onUpdateArtboard || board.history.findIndex(h => h.id === board.image.id) <= 0}
                                                    className="p-1 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-500 disabled:opacity-30"
                                                    title={lang === 'zh' ? '上一版' : 'Previous Version'}
                                                >
                                                    <IconLoader name="chevron-left" size={12} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const hist = board.history!;
                                                        const currIdx = hist.findIndex(h => h.id === board.image.id);
                                                        if (currIdx < hist.length - 1 && onUpdateArtboard) onUpdateArtboard(board.id, { image: hist[currIdx + 1] });
                                                    }}
                                                    disabled={!onUpdateArtboard || board.history.findIndex(h => h.id === board.image.id) >= board.history.length - 1}
                                                    className="p-1 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-500 disabled:opacity-30"
                                                    title={lang === 'zh' ? '下一版' : 'Next Version'}
                                                >
                                                    <IconLoader name="chevron-right" size={12} />
                                                </button>
                                            </div>
                                        )}

                                        {onInspectArtboard && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onInspectArtboard(board.image); }}
                                                className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 rounded text-stone-500 hover:text-teal-500 transition-colors"
                                                title={lang === 'zh' ? '详情' : 'Info'}
                                            >
                                                <IconLoader name="info" size={14} />
                                            </button>
                                        )}

                                        {isUIDesignArtboard(board) && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setUiSplitArtboard(board); }}
                                                className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 rounded text-stone-500 hover:text-indigo-500 transition-colors"
                                                title={lang === 'zh' ? '拆分 UI' : 'Split UI'}
                                            >
                                                <IconLoader name="code" size={14} />
                                            </button>
                                        )}

                                        {/* History Modal Toggle */}
                                        {board.history && board.history.length > 0 && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setHistoryModalOpen(board.id); }}
                                                className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 rounded text-stone-500 hover:text-cyan-500 transition-colors"
                                                title={lang === 'zh' ? '历史版本' : 'History'}
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </button>
                                        )}

                                        {/* Download Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Download the image
                                                const link = document.createElement('a');
                                                link.href = board.image.url;
                                                link.download = `${board.label || 'artboard'}-${Date.now()}.png`;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                            className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 rounded text-stone-500 hover:text-cyan-500 transition-colors"
                                            title={lang === 'zh' ? '下载图片' : 'Download Image'}
                                        >
                                            <IconLoader name="download" size={14} />
                                        </button>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); copyImageToClipboard(board.image.url); }}
                                            className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 rounded text-stone-500 hover:text-teal-500 transition-colors"
                                            title={lang === 'zh' ? '\u590d\u5236\u56fe\u7247\u5230\u526a\u8d34\u677f' : 'Copy Image to Clipboard'}
                                        >
                                            <IconLoader name="clipboard" size={14} />
                                        </button>

                                        {onCopyImage && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onCopyImage(board.image.url); }}
                                                className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 rounded text-stone-500 hover:text-teal-500 transition-colors"
                                                title={lang === 'zh' ? '复制到参考图' : 'Copy to Reference'}
                                            >
                                                <IconLoader name="copy" size={14} />
                                            </button>
                                        )}

                                        <button
                                            onClick={(e) => { e.stopPropagation(); onRegenerateArtboard(board.id); }}
                                            className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 rounded text-stone-500 hover:text-teal-500 transition-colors"
                                            title={lang === 'zh' ? '重新生成' : 'Regenerate'}
                                        >
                                            <IconLoader name="magic-wand" size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRequestConfirm(
                                                    lang === 'zh' ? '删除画板' : 'Delete Artboard',
                                                    lang === 'zh' ? '确定删除此画板吗？' : 'Delete this artboard?',
                                                    () => onDeleteArtboard(board.id)
                                                );
                                            }}
                                            className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-stone-500 hover:text-red-500 transition-colors"
                                            title={lang === 'zh' ? '删除' : 'Delete'}
                                        >
                                            <IconLoader name="trash" size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            {
                                board.image.details?.designSystem ? (
                                    <div className="w-full h-full flex flex-col bg-white overflow-hidden rounded-lg border border-stone-200 dark:border-stone-800">
                                        <div
                                            className="h-4 bg-stone-100 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors z-20"
                                            onMouseDown={(e) => handleMouseDown(e, board.id)}
                                        >
                                            <div className="w-8 h-1 rounded-full bg-stone-300 dark:bg-stone-600 opacity-50"></div>
                                        </div>
                                        <div className="flex-1 overflow-hidden relative cursor-default" onMouseDown={(e) => e.stopPropagation()}>
                                            <DesignSpecRenderer designSystem={board.image.details.designSystem} lang={lang} editable={true} onUpdate={(ds) => handleSpecUpdate(board.id, ds)} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-white/50 flex items-center justify-center pointer-events-none rounded-lg overflow-hidden">
                                        <img src={board.image.url} alt={board.label} className="w-full h-full object-contain" />
                                    </div>
                                )
                            }

                            {regeneratingId === board.id && (<div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-sm z-50 rounded-lg"><div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent mb-3"></div><span className="text-xs font-bold animate-pulse">{lang === 'zh' ? '生成中...' : 'Generating...'}</span></div>)}
                        </div>
                    ))}
                    {guides.map((g, idx) => (<div key={idx} className="absolute bg-red-500 pointer-events-none z-[60]" style={{ left: g.type === 'v' ? g.pos : -10000, top: g.type === 'h' ? g.pos : -10000, width: g.type === 'v' ? 1 : '20000px', height: g.type === 'h' ? 1 : '20000px' }} />))}
                </div>
            </div>

            {/* Controls */}
            <div className="absolute left-3 right-3 bottom-3 md:left-auto md:right-6 md:bottom-6 flex items-center gap-2 bg-white dark:bg-stone-800 p-2 rounded-lg shadow-lg border border-stone-200 dark:border-stone-700 overflow-x-auto custom-scrollbar max-w-[calc(100%-1.5rem)] md:max-w-none pb-[max(0.5rem,env(safe-area-inset-bottom))] md:pb-2">
                <button onClick={() => setScale(s => Math.max(0.1, s - 0.1))} className="shrink-0 min-w-10 min-h-10 p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded text-stone-600 dark:text-stone-300">-</button>
                <span className="shrink-0 text-xs font-mono w-10 text-center text-stone-600 dark:text-stone-300">{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale(s => Math.min(5, s + 0.1))} className="shrink-0 min-w-10 min-h-10 p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded text-stone-600 dark:text-stone-300">+</button>
                <div className="w-px h-4 bg-stone-300 dark:bg-stone-600 mx-1 shrink-0"></div>
                <button onClick={onAutoArrange} className="shrink-0 min-h-10 text-xs px-3 py-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded text-stone-600 dark:text-stone-300 flex items-center gap-1"><IconLoader name="tidy" size={14} /> {lang === 'zh' ? '整理' : 'Tidy'}</button>
                <button onClick={fitToScreen} className="shrink-0 min-h-10 text-xs px-3 py-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded text-stone-600 dark:text-stone-300">{t.fitToScreen}</button>
                <button onClick={resetView} className="shrink-0 min-h-10 text-xs px-3 py-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded text-stone-600 dark:text-stone-300">{t.resetView}</button>
            </div>

            {contextMenu && (() => {
                const board = artboards.find(item => item.id === contextMenu.artboardId);
                const showAnimationActions = Boolean(board && canPreviewAnimation(board, artboards));
                const shouldSlice = Boolean(board && isStoryboardSheet(board, artboards));
                const showUISplitAction = Boolean(board && isUIDesignArtboard(board));

                return (
                    <div
                        className="fixed bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded shadow-xl py-1 z-[100] w-56"
                        style={{ left: contextMenu.x, top: contextMenu.y }}
                    >
                        {showAnimationActions && (
                            <>
                                {shouldSlice && onAddImagesToCanvas && (
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center gap-2 disabled:opacity-50"
                                        onClick={() => sliceAnimationFramesToCanvas(contextMenu.artboardId)}
                                        disabled={isSlicingAnimation}
                                    >
                                        <IconLoader name="scissors" size={14} />
                                        {lang === 'zh' ? '切图到画布' : 'Slice to Canvas'}
                                    </button>
                                )}
                                {shouldSlice && (
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center gap-2 disabled:opacity-50"
                                        onClick={() => openSliceAdjust(contextMenu.artboardId)}
                                        disabled={isSlicingAnimation}
                                    >
                                        <IconLoader name="scissors" size={14} />
                                        {lang === 'zh' ? '校准切图' : 'Adjust Slicing'}
                                    </button>
                                )}
                                <button
                                    className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center gap-2 disabled:opacity-50"
                                    onClick={() => openAnimationPreview(contextMenu.artboardId, shouldSlice)}
                                    disabled={isSlicingAnimation}
                                >
                                    <IconLoader name="play" size={14} />
                                    {lang === 'zh' ? '预览动画' : 'Preview Animation'}
                                </button>
                                <div className="my-1 h-px bg-stone-100 dark:bg-stone-700" />
                            </>
                        )}
                        {showUISplitAction && board && (
                            <>
                                <button
                                    className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center gap-2"
                                    onClick={() => { setUiSplitArtboard(board); setContextMenu(null); }}
                                >
                                    <IconLoader name="code" size={14} />
                                    {lang === 'zh' ? '拆分 UI' : 'Split UI'}
                                </button>
                                <div className="my-1 h-px bg-stone-100 dark:bg-stone-700" />
                            </>
                        )}
                        {board && (
                            <button
                                className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center gap-2"
                                onClick={() => { copyImageToClipboard(board.image.url); setContextMenu(null); }}
                            >
                                <IconLoader name="clipboard" size={14} />
                                {lang === 'zh' ? '\u590d\u5236\u56fe\u7247\u5230\u526a\u8d34\u677f' : 'Copy Image to Clipboard'}
                            </button>
                        )}
                        {board && onCopyImage && (
                            <button
                                className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center gap-2"
                                onClick={() => { onCopyImage(board.image.url); setContextMenu(null); }}
                            >
                                <IconLoader name="copy" size={14} />
                                {lang === 'zh' ? '\u590d\u5236\u5230\u53c2\u8003\u56fe' : 'Copy to Reference'}
                            </button>
                        )}
                        <div className="my-1 h-px bg-stone-100 dark:bg-stone-700" />
                        <button
                            className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center gap-2"
                            onClick={handleRegenerateClick}
                        >
                            <IconLoader name="refresh" size={14} />
                            {lang === 'zh' ? '重新生成' : 'Regenerate'}
                        </button>
                        <button
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center gap-2"
                            onClick={() => { onDeleteArtboard(contextMenu.artboardId); setContextMenu(null); }}
                        >
                            <IconLoader name="trash" size={14} />
                            {lang === 'zh' ? '从画布移除' : 'Remove from Canvas'}
                        </button>
                    </div>
                );
            })()}
            {animationError && (
                <div className="fixed top-4 left-1/2 z-[120] -translate-x-1/2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-xl">
                    {animationError}
                </div>
            )}
            {clipboardMessage && (
                <div className="fixed top-4 left-1/2 z-[120] -translate-x-1/2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white shadow-xl dark:bg-stone-100 dark:text-stone-900">
                    {clipboardMessage}
                </div>
            )}
            {sliceAdjust && (() => {
                const selectedOffset = sliceAdjust.offsets[sliceAdjust.selectedFrame] || { x: 0, y: 0 };
                const selectedCol = sliceAdjust.selectedFrame % sliceAdjust.grid.cols;
                const selectedRow = Math.floor(sliceAdjust.selectedFrame / sliceAdjust.grid.cols);

                return (
                    <div
                        className="fixed inset-0 z-[112] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
                        onMouseDown={() => setSliceAdjust(null)}
                    >
                        <div
                            className="bg-white dark:bg-stone-900 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-700 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden"
                            onMouseDown={(event) => event.stopPropagation()}
                        >
                            <div className="flex items-center justify-between gap-3 p-3 sm:p-4 border-b border-stone-200 dark:border-stone-800">
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                                        {lang === 'zh' ? '校准切图' : 'Adjust Slicing'}
                                    </h3>
                                    <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                                        {sliceAdjust.frameCount} {lang === 'zh' ? '关键帧' : 'keyframes'} · {sliceAdjust.grid.cols}x{sliceAdjust.grid.rows}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSliceAdjust(null)}
                                    className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
                                    title={lang === 'zh' ? '关闭' : 'Close'}
                                >
                                    <IconLoader name="x" size={18} />
                                </button>
                            </div>

                            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 sm:p-4">
                                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-4">
                                    <div className="rounded-lg bg-stone-950 p-3 overflow-hidden">
                                        <div
                                            ref={sliceAdjustImageRef}
                                            className="relative mx-auto w-full max-h-[66vh] max-w-full select-none touch-none"
                                            style={{ aspectRatio: `${sliceAdjust.width} / ${sliceAdjust.height}` }}
                                            onPointerMove={handleSliceAdjustPointerMove}
                                            onPointerUp={() => setSliceAdjust(prev => prev ? { ...prev, selectedLine: null } : prev)}
                                            onPointerLeave={() => setSliceAdjust(prev => prev ? { ...prev, selectedLine: null } : prev)}
                                        >
                                            <img
                                                src={sliceAdjust.imageUrl}
                                                alt=""
                                                className="absolute inset-0 h-full w-full object-contain"
                                                draggable={false}
                                            />

                                            {Array.from({ length: sliceAdjust.frameCount }).map((_, index) => {
                                                const col = index % sliceAdjust.grid.cols;
                                                const row = Math.floor(index / sliceAdjust.grid.cols);
                                                const left = (sliceAdjust.xLines[col] / sliceAdjust.width) * 100;
                                                const top = (sliceAdjust.yLines[row] / sliceAdjust.height) * 100;
                                                const cellWidth = ((sliceAdjust.xLines[col + 1] - sliceAdjust.xLines[col]) / sliceAdjust.width) * 100;
                                                const cellHeight = ((sliceAdjust.yLines[row + 1] - sliceAdjust.yLines[row]) / sliceAdjust.height) * 100;
                                                return (
                                                    <button
                                                        key={index}
                                                        className={`absolute z-10 border-2 text-left transition-colors ${
                                                            index === sliceAdjust.selectedFrame
                                                                ? 'border-teal-400 bg-teal-400/15'
                                                                : 'border-transparent hover:border-white/60'
                                                        }`}
                                                        style={{ left: `${left}%`, top: `${top}%`, width: `${cellWidth}%`, height: `${cellHeight}%` }}
                                                        onClick={() => setSliceAdjust(prev => prev ? { ...prev, selectedFrame: index } : prev)}
                                                        title={`${lang === 'zh' ? '帧' : 'Frame'} ${index + 1}`}
                                                    >
                                                        <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                                            {index + 1}
                                                        </span>
                                                    </button>
                                                );
                                            })}

                                            {sliceAdjust.xLines.map((line, index) => (
                                                <button
                                                    key={`x-${index}`}
                                                    className={`absolute top-0 z-30 h-full w-3 -translate-x-1/2 cursor-ew-resize ${
                                                        sliceAdjust.selectedLine?.axis === 'x' && sliceAdjust.selectedLine.index === index
                                                            ? 'bg-amber-300/70'
                                                            : 'bg-sky-400/50 hover:bg-sky-300/70'
                                                    }`}
                                                    style={{ left: `${(line / sliceAdjust.width) * 100}%` }}
                                                    onPointerDown={(event) => {
                                                        event.preventDefault();
                                                        event.currentTarget.setPointerCapture(event.pointerId);
                                                        setSliceAdjust(prev => prev ? { ...prev, selectedLine: { axis: 'x', index } } : prev);
                                                    }}
                                                    title={lang === 'zh' ? '拖动竖向切线' : 'Drag vertical slice line'}
                                                />
                                            ))}

                                            {sliceAdjust.yLines.map((line, index) => (
                                                <button
                                                    key={`y-${index}`}
                                                    className={`absolute left-0 z-30 h-3 w-full -translate-y-1/2 cursor-ns-resize ${
                                                        sliceAdjust.selectedLine?.axis === 'y' && sliceAdjust.selectedLine.index === index
                                                            ? 'bg-amber-300/70'
                                                            : 'bg-sky-400/50 hover:bg-sky-300/70'
                                                    }`}
                                                    style={{ top: `${(line / sliceAdjust.height) * 100}%` }}
                                                    onPointerDown={(event) => {
                                                        event.preventDefault();
                                                        event.currentTarget.setPointerCapture(event.pointerId);
                                                        setSliceAdjust(prev => prev ? { ...prev, selectedLine: { axis: 'y', index } } : prev);
                                                    }}
                                                    title={lang === 'zh' ? '拖动横向切线' : 'Drag horizontal slice line'}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="rounded-lg border border-stone-200 dark:border-stone-800 p-3">
                                            <div className="text-xs font-bold uppercase text-stone-500">
                                                {lang === 'zh' ? '当前帧' : 'Selected Frame'}
                                            </div>
                                            <div className="mt-1 text-sm font-bold text-stone-900 dark:text-stone-100">
                                                {sliceAdjust.selectedFrame + 1}/{sliceAdjust.frameCount}
                                            </div>
                                            <div className="mt-1 text-xs text-stone-500">
                                                {lang === 'zh' ? '位置' : 'Cell'}: {selectedCol + 1}, {selectedRow + 1}
                                            </div>
                                            <div className="mt-1 text-xs text-stone-500">
                                                Offset: {Math.round(selectedOffset.x)}, {Math.round(selectedOffset.y)}
                                            </div>
                                        </div>

                                        <div className="rounded-lg border border-stone-200 dark:border-stone-800 p-3">
                                            <div className="mb-2 text-xs font-bold uppercase text-stone-500">
                                                {lang === 'zh' ? '注册点微调' : 'Registration Nudge'}
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <span />
                                                <button className="h-9 rounded border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-sm" onClick={() => updateSliceAdjustOffset(0, -2)}>^</button>
                                                <span />
                                                <button className="h-9 rounded border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-sm" onClick={() => updateSliceAdjustOffset(-2, 0)}>&lt;</button>
                                                <button className="h-9 rounded border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs" onClick={resetSliceAdjustOffset}>0</button>
                                                <button className="h-9 rounded border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-sm" onClick={() => updateSliceAdjustOffset(2, 0)}>&gt;</button>
                                                <span />
                                                <button className="h-9 rounded border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-sm" onClick={() => updateSliceAdjustOffset(0, 2)}>v</button>
                                                <span />
                                            </div>
                                        </div>

                                        <label className="block">
                                            <span className="mb-1 block text-xs font-bold uppercase text-stone-500">
                                                {lang === 'zh' ? '预览 FPS' : 'Preview FPS'}
                                            </span>
                                            <input
                                                type="range"
                                                min={1}
                                                max={24}
                                                value={sliceAdjust.fps}
                                                onChange={(event) => setSliceAdjust(prev => prev ? { ...prev, fps: Number(event.target.value) } : prev)}
                                                className="w-full accent-teal-600"
                                            />
                                            <div className="mt-1 text-xs text-stone-500">{sliceAdjust.fps} FPS</div>
                                        </label>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={previewSliceAdjust}
                                                disabled={isSlicingAnimation}
                                                className="min-h-10 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-sm font-bold text-stone-700 dark:text-stone-200 disabled:opacity-50"
                                            >
                                                {lang === 'zh' ? '预览动画' : 'Preview'}
                                            </button>
                                            {onAddImagesToCanvas && (
                                                <button
                                                    onClick={addAdjustedFramesToCanvas}
                                                    disabled={isSlicingAnimation}
                                                    className="min-h-10 rounded-lg bg-teal-600 hover:bg-teal-500 text-sm font-bold text-white disabled:opacity-50"
                                                >
                                                    {lang === 'zh' ? '添加到画布' : 'Add to Canvas'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
            {animationPreview && (() => {
                const currentFrame = animationPreview.frames[animationFrameIndex % animationPreview.frames.length];

                return (
                    <div
                        className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
                        onMouseDown={() => setAnimationPreview(null)}
                    >
                        <div
                            className="bg-white dark:bg-stone-900 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-700 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden"
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between gap-3 p-3 sm:p-4 border-b border-stone-200 dark:border-stone-800">
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                                        {lang === 'zh' ? '动画预览' : 'Animation Preview'}
                                    </h3>
                                    <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                                        {animationPreview.frames.length} {lang === 'zh' ? '帧' : 'frames'} · {animationPreview.fps} FPS
                                    </p>
                                </div>
                                <button
                                    onClick={() => setAnimationPreview(null)}
                                    className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
                                    title={lang === 'zh' ? '关闭' : 'Close'}
                                >
                                    <IconLoader name="x" size={18} />
                                </button>
                            </div>

                            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 sm:p-4">
                                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-4">
                                    <div className="min-h-[280px] sm:min-h-[420px] rounded-lg bg-stone-950 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={currentFrame.url}
                                            alt="Animation frame preview"
                                            className="max-w-full max-h-[62vh] object-contain"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setIsAnimationPlaying(value => !value)}
                                                className="h-10 w-10 rounded-lg bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center"
                                                title={isAnimationPlaying ? (lang === 'zh' ? '暂停' : 'Pause') : (lang === 'zh' ? '播放' : 'Play')}
                                            >
                                                <IconLoader name={isAnimationPlaying ? 'pause' : 'play'} size={16} />
                                            </button>
                                            <button
                                                onClick={() => setAnimationFrameIndex(index => Math.max(0, index - 1))}
                                                className="h-10 w-10 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center"
                                                title={lang === 'zh' ? '上一帧' : 'Previous frame'}
                                            >
                                                <IconLoader name="chevron-left" size={16} />
                                            </button>
                                            <button
                                                onClick={() => setAnimationFrameIndex(index => (index + 1) % animationPreview.frames.length)}
                                                className="h-10 w-10 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center"
                                                title={lang === 'zh' ? '下一帧' : 'Next frame'}
                                            >
                                                <IconLoader name="chevron-right" size={16} />
                                            </button>
                                            <span className="text-xs font-mono text-stone-500">
                                                {animationFrameIndex + 1}/{animationPreview.frames.length}
                                            </span>
                                        </div>

                                        <label className="block">
                                            <span className="mb-1 block text-xs font-bold uppercase text-stone-500">FPS</span>
                                            <input
                                                type="range"
                                                min={1}
                                                max={24}
                                                value={animationPreview.fps}
                                                onChange={(event) => setAnimationPreview(prev => prev ? { ...prev, fps: Number(event.target.value) } : prev)}
                                                className="w-full accent-teal-600"
                                            />
                                        </label>

                                        {onAddImagesToCanvas && (
                                            <div className="space-y-2">
                                                {animationPreview.source === 'sliced' && (
                                                    <button
                                                        onClick={() => openSliceAdjust(animationPreview.artboardId)}
                                                        className="w-full min-h-10 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-sm font-bold text-stone-700 dark:text-stone-200 flex items-center justify-center gap-2"
                                                    >
                                                        <IconLoader name="scissors" size={16} />
                                                        {lang === 'zh' ? '校准切图' : 'Adjust Slicing'}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={addAnimationFramesToCanvas}
                                                    className="w-full min-h-10 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:opacity-90 text-sm font-bold flex items-center justify-center gap-2"
                                                >
                                                    <IconLoader name="plus" size={16} />
                                                    {lang === 'zh' ? '添加帧到画布' : 'Add Frames to Canvas'}
                                                </button>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-3 gap-2">
                                            {animationPreview.frames.map((frame, index) => (
                                                <button
                                                    key={frame.id}
                                                    onClick={() => {
                                                        setAnimationFrameIndex(index);
                                                        setIsAnimationPlaying(false);
                                                    }}
                                                    className={`relative aspect-square overflow-hidden rounded border-2 bg-stone-100 dark:bg-stone-800 ${
                                                        index === animationFrameIndex
                                                            ? 'border-teal-500'
                                                            : 'border-transparent hover:border-stone-300 dark:hover:border-stone-600'
                                                    }`}
                                                    title={`${lang === 'zh' ? '帧' : 'Frame'} ${index + 1}`}
                                                >
                                                    <img src={frame.url} alt="" className="h-full w-full object-cover" />
                                                    <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                                        {index + 1}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
            {uiSplitArtboard && (
                <UISplitModal
                    artboard={uiSplitArtboard}
                    lang={lang}
                    onClose={() => setUiSplitArtboard(null)}
                />
            )}
            {artboards.length === 0 && (<div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="text-center text-stone-400 dark:text-stone-600"><div className="mb-4 flex justify-center"><IconLoader name="palette" size={64} /></div><h2 className="text-xl font-bold mb-2">{t.ready}</h2><p>{t.readyDesc}</p></div></div>)}

            {/* History Modal Overlay */}
            {
                historyModalOpen && (() => {
                    const board = artboards.find(b => b.id === historyModalOpen);
                    if (!board || !board.history) return null;
                    const sortedHistory = [...board.history].reverse(); // Newest first

                    return (
                        <div
                            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200"
                            onMouseDown={() => setHistoryModalOpen(null)}
                        >
                            <div
                                className="bg-white dark:bg-stone-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col overflow-hidden border border-stone-200 dark:border-stone-800"
                                onMouseDown={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950">
                                    <h3 className="font-bold text-lg text-stone-800 dark:text-stone-200">
                                        {lang === 'zh' ? '版本历史' : 'Version History'}
                                        <span className="ml-2 text-sm font-normal text-stone-500">({board.history.length})</span>
                                    </h3>
                                    <button onClick={() => setHistoryModalOpen(null)} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-full text-stone-500">
                                        <IconLoader name="x" size={20} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {sortedHistory.map(img => (
                                            <div
                                                key={img.id}
                                                className={`relative group rounded-lg overflow-hidden border-2 transition-all ${board.image.id === img.id ? 'border-teal-500 ring-2 ring-teal-200 dark:ring-teal-900/30' : 'border-transparent hover:border-stone-300 dark:hover:border-stone-600'}`}
                                                onContextMenu={(e) => {
                                                    e.preventDefault();
                                                    if (onDeleteHistoryItem) {
                                                        onDeleteHistoryItem(board.id, img.id);
                                                    }
                                                }}
                                            >
                                                <div
                                                    className="aspect-[3/4] bg-stone-100 dark:bg-stone-800 cursor-pointer relative"
                                                    onClick={() => {
                                                        if (onUpdateArtboard) onUpdateArtboard(board.id, { image: img });
                                                    }}
                                                >
                                                    <img src={img.url} className="w-full h-full object-cover" loading="lazy" />
                                                    {board.image.id === img.id && (
                                                        <div className="absolute top-2 left-2 bg-teal-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">Current</div>
                                                    )}
                                                </div>

                                                {/* Info Footer */}
                                                <div className="p-2 bg-stone-50 dark:bg-stone-900/80 text-[10px] text-stone-500 flex justify-between items-center">
                                                    <span className="truncate max-w-[80px]">{new Date(img.timestamp).toLocaleTimeString()}</span>
                                                    {onDeleteHistoryItem && (
                                                        <button
                                                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 text-stone-400 hover:text-red-500 rounded"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteHistoryItem(board.id, img.id);
                                                            }}
                                                            title={lang === 'zh' ? '删除此版本' : 'Delete Version'}
                                                        >
                                                            <IconLoader name="trash" size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-3 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 text-xs text-stone-400 flex justify-center">
                                    {lang === 'zh' ? '右键点击图片可快速删除' : 'Right-click image to delete'}
                                </div>
                            </div>
                        </div>
                    );
                })()
            }

            {devMode && <DevRequestMonitor lang={lang} />}
        </div>
    );
};

export default CanvasBoard;
