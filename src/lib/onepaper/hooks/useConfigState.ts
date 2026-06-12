import { useRef, useState } from 'react';
import type { PlatformType, ResolutionPreset, UIStyle, DesignTokens, BackgroundConfig, PageRequest, CreatorRole, MediaAspectRatio, MediaType, MediaResolutionPreset, SkillConfig, SkillType } from '../types';
import {
    DEFAULT_RESOLUTION,
    DEFAULT_STYLE,
    getDefaultMediaResolutionForRatio,
    getDefaultResolutionForPlatform,
} from '../config/runtimeDefaults';
import { isOnePaperSkill } from '../skills/skillTypes';

export const useConfigState = () => {

    // Creator Role
    const [activeRole, setActiveRole] = useState<CreatorRole>('designer');

    const [skillMode, setSkillMode] = useState(false);
    const [activeSkill, setActiveSkill] = useState<SkillType | null>(null);
    const [skillConfig, setSkillConfig] = useState<SkillConfig | null>(null);
    const roleChangeRequestRef = useRef(0);

    // Config
    const [platform, setPlatform] = useState<PlatformType>('mobile');
    const [resolution, setResolution] = useState<ResolutionPreset>(DEFAULT_RESOLUTION);
    const [customSize, setCustomSize] = useState({ width: 390, height: 844, active: false });
    const [customStyles, setCustomStyles] = useState<UIStyle[]>([]);
    const [style, setStyle] = useState<UIStyle>(DEFAULT_STYLE);
    const [description, setDescription] = useState('');
    const [pageName, setPageName] = useState('');
    const [keywords, setKeywords] = useState<string[]>([]);
    const [enableDesignTokens, setEnableDesignTokens] = useState(false);
    const [designTokens, setDesignTokens] = useState<DesignTokens>({
        aiColor: false, primaryColor: '#3B82F6', backgroundColor: '#FFFFFF', accentColor: '#F59E0B', decorativeColor: '#10B981', borderRadius: 'medium', spacing: 'comfortable'
    });
    const [background, setBackground] = useState<BackgroundConfig>({ type: 'color', value: '#FFFFFF' });
    const [highQuality, setHighQuality] = useState(false);
    const [forceChinese, setForceChinese] = useState(false);
    const [promptLanguage, setPromptLanguage] = useState<string | null>(null);
    const [preferredImageApiId, setPreferredImageApiId] = useState<string | null>(null);
    const [designMdId, setDesignMdId] = useState<string | null>(null);
    const [designMdContent, setDesignMdContent] = useState<string | null>(null);
    const [visualStyleId, setVisualStyleId] = useState<string | null>(null);
    const [visualStyleContent, setVisualStyleContent] = useState<string | null>(null);
    const [layoutDensityId, setLayoutDensityId] = useState<string | null>(null);
    const [layoutDensityContent, setLayoutDensityContent] = useState<string | null>(null);

    // Batch & Pages (Config related)
    const [isBatchMode, setIsBatchMode] = useState(false);
    const [batchOutputMode, setBatchOutputMode] = useState<'separate' | 'grid'>('separate');
    const [specMode, setSpecMode] = useState<'image' | 'code'>('image');
    const [pages, setPages] = useState<PageRequest[]>([]);
    const [isAutoGeneratingPages, setIsAutoGeneratingPages] = useState(false);

    // Media Mode
    const [mediaAspectRatio, setMediaAspectRatio] = useState<MediaAspectRatio>('3:4');
    const [mediaResolution, setMediaResolution] = useState<MediaResolutionPreset>(getDefaultMediaResolutionForRatio('3:4'));
    const [mediaType, setMediaType] = useState<MediaType>('poster');

    // Images (Inputs)
    const [colorImage, setColorImage] = useState<File | null>(null);
    const [referenceImages, setReferenceImages] = useState<string[]>([]);
    const [copiedImageBase64, setCopiedImageBase64] = useState<string | null>(null);

    // Actions
    const handleRoleChange = (role: CreatorRole) => {
        const requestId = roleChangeRequestRef.current + 1;
        roleChangeRequestRef.current = requestId;
        setActiveRole(role);
        if (isOnePaperSkill(role)) {
            setSkillMode(true);
            setActiveSkill(role);
            setSkillConfig(null);
            import('../skills/skillRegistry').then(({ createDefaultSkillConfig }) => {
                if (roleChangeRequestRef.current === requestId) {
                    setSkillConfig(createDefaultSkillConfig(role));
                }
            });
        } else {
            setSkillMode(false);
            setActiveSkill(null);
            setSkillConfig(null);
        }
    };

    const handlePlatformChange = (p: PlatformType) => {
        setPlatform(p);
        setResolution(getDefaultResolutionForPlatform(p));
    };

    const handleMediaAspectRatioChange = (ratio: MediaAspectRatio) => {
        setMediaAspectRatio(ratio);
        setMediaResolution(getDefaultMediaResolutionForRatio(ratio));
    };

    return {
        // Role
        activeRole, setActiveRole: handleRoleChange,

        // Skill Mode
        skillMode, activeSkill, skillConfig,
        setSkillMode, setActiveSkill, setSkillConfig,

        // State
        platform, resolution, customSize, customStyles, style, description, pageName, keywords,
        enableDesignTokens, designTokens, background, highQuality, forceChinese,
        promptLanguage, preferredImageApiId,
        designMdId, designMdContent, visualStyleId, visualStyleContent, layoutDensityId, layoutDensityContent,
        isBatchMode, batchOutputMode, specMode, pages, isAutoGeneratingPages,
        mediaAspectRatio, mediaResolution, mediaType,
        colorImage, referenceImages, copiedImageBase64,

        // Actions
        setPlatform: handlePlatformChange, setResolution, setCustomSize, setStyle, setCustomStyles,
        setDescription, setPageName, setKeywords, setEnableDesignTokens, setDesignTokens, setBackground,
        setHighQuality, setForceChinese,
        setPromptLanguage, setPreferredImageApiId,
        setDesignMdId, setDesignMdContent, setVisualStyleId, setVisualStyleContent, setLayoutDensityId, setLayoutDensityContent,
        setIsBatchMode, setBatchOutputMode, setSpecMode, setPages, setIsAutoGeneratingPages,
        setMediaAspectRatio: handleMediaAspectRatioChange, setMediaResolution, setMediaType,
        setColorImage, setReferenceImages, setCopiedImageBase64
    };
};
