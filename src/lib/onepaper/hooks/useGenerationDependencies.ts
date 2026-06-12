import type { SkillConstants } from '../skills/promptBuilders';

export const loadGeminiService = () => import('../services/geminiService');

export async function loadSkillPromptTools() {
  const [
    promptBuilders,
    cover,
    infographic,
    xhsImages,
    comic,
    articleIllustrator,
    slideDeck,
    logo,
    stickerDesign,
    animationSequence,
  ] = await Promise.all([
    import('../skills/promptBuilders'),
    import('../skills/cover-image/constants'),
    import('../skills/infographic/constants'),
    import('../skills/xhs-images/constants'),
    import('../skills/comic/constants'),
    import('../skills/article-illustrator/constants'),
    import('../skills/slide-deck/constants'),
    import('../skills/logo/constants'),
    import('../skills/sticker-design/constants'),
    import('../skills/animation-sequence/constants'),
  ]);

  const constants: SkillConstants = {
    coverImage: {
      types: cover.COVER_TYPES,
      palettes: cover.COVER_PALETTES,
      renderings: cover.COVER_RENDERINGS,
      texts: cover.COVER_TEXTS,
      moods: cover.COVER_MOODS,
      fonts: cover.COVER_FONTS,
    },
    infographic: {
      layouts: infographic.INFOGRAPHIC_LAYOUTS,
      styles: infographic.INFOGRAPHIC_STYLES,
    },
    xhsImages: {
      styles: xhsImages.XHS_STYLES,
      layouts: xhsImages.XHS_LAYOUTS,
      strategies: xhsImages.XHS_STRATEGIES,
    },
    comic: {
      artStyles: comic.COMIC_ART_STYLES,
      tones: comic.COMIC_TONES,
      layouts: comic.COMIC_LAYOUTS,
      presets: comic.COMIC_PRESETS,
    },
    articleIllustrator: {
      types: articleIllustrator.ARTICLE_TYPES,
      styles: articleIllustrator.ARTICLE_STYLES,
      densities: articleIllustrator.ARTICLE_DENSITIES,
    },
    slideDeck: {
      presets: slideDeck.SLIDE_PRESETS,
      audiences: slideDeck.SLIDE_AUDIENCES,
    },
    logo: {
      types: logo.LOGO_TYPES,
      styles: logo.LOGO_STYLES,
      palettes: logo.LOGO_PALETTES,
      industries: logo.LOGO_INDUSTRIES,
      moods: logo.LOGO_MOODS,
    },
    stickerDesign: {
      formats: stickerDesign.STICKER_FORMATS,
      styles: stickerDesign.STICKER_STYLES,
      shapes: stickerDesign.STICKER_SHAPES,
      themes: stickerDesign.STICKER_THEMES,
      sizes: stickerDesign.STICKER_SIZES,
      textStyles: stickerDesign.STICKER_TEXT_STYLES,
      backgrounds: stickerDesign.STICKER_BACKGROUNDS,
      aspects: stickerDesign.STICKER_ASPECTS,
    },
    animationSequence: {
      styles: animationSequence.ANIMATION_SEQUENCE_STYLES,
      motions: animationSequence.ANIMATION_SEQUENCE_MOTIONS,
      framings: animationSequence.ANIMATION_SEQUENCE_FRAMINGS,
      continuity: animationSequence.ANIMATION_SEQUENCE_CONTINUITY,
    },
  };

  return {
    buildSkillPrompt: promptBuilders.buildSkillPrompt,
    constants,
  };
}
