const STYLE_PROMPTS = {
  cny: {
    prefix: 'A festive Chinese New Year themed pet portrait',
    details: 'wearing traditional red Tang suit, surrounded by red lanterns, golden coins, cherry blossoms, warm red and gold lighting, festive celebration atmosphere',
    suffix: 'ultra-detailed, vibrant colors, professional pet photography, 8k',
  },
  cool: {
    prefix: 'A cool and edgy pet portrait',
    details: 'wearing dark sunglasses, leather jacket, gold chain necklace, urban street background, dramatic neon lighting, hip-hop style',
    suffix: 'cinematic lighting, highly detailed, professional photography, 8k',
  },
  makeup: {
    prefix: 'A glamorous pet beauty portrait',
    details: 'with colorful dyed fur in pastel gradients, subtle eye shadow makeup, glitter accessories, beauty salon setting, soft studio lighting',
    suffix: 'fashion photography, beauty editorial style, pastel colors, 8k',
  },
  intern: {
    prefix: 'A funny pet dressed as a tech intern',
    details: 'wearing oversized glasses, company ID badge lanyard, headphones around neck, sitting at a desk with laptop, office cubicle background, tired but cute expression',
    suffix: 'humorous, detailed office setting, warm fluorescent lighting, 8k',
  },
}

export function buildPrompt(style) {
  const tpl = STYLE_PROMPTS[style.id]
  if (!tpl) throw new Error(`Unknown style: ${style.id}`)
  return `${tpl.prefix}, ${tpl.details}, ${tpl.suffix}`
}
