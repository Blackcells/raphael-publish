/**
 * Local theme skill configs — hand-written to MATCH the actual reference HTML
 * files produced by 摸鱼风 / 苹果范 / 石墨极简风 skills.
 *
 * Reference files used to derive these styles:
 *   - 苹果范: 公众号文案-MacTools-苹果范主题.html (LSGMac Apple style design tokens)
 *   - 摸鱼绿: iPhone与Mac联动完全指南_排版_摸鱼绿(moyu-green).html + ~/Desktop/公众号技能/摸鱼风/references/moyu-green.md
 *   - 石墨极简: 今日新闻简报20260807_排版_石墨极简风(graphite-minimal).html + ~/Desktop/公众号技能/摸鱼风/references/graphite-minimal.md
 *
 * Unlike the factory-generated themes in md2wechat.ts, these three use
 * hand-tuned values (font-size 14-15px, line-height 1.8-1.9, text-align,
 * 677px width, gradient borders) so they render visually identical to the
 * skill-produced HTML.
 */

import type { Theme } from './types';

// ============================================================
// 苹果范 (Apple)
// Source: 公众号文案-MacTools-苹果范主题.html
// Palette: 蓝 #007aff · 紫 #5856d6 · 粉 #ff2d55 · 文字 #1d1d1f/#333333/#595959
// ============================================================
const appleStyles: Record<string, string> = {
  container: 'max-width: 677px; margin: 0 auto; padding: 32px 12px 64px; background: #f2f4f7; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; font-size: 16px; line-height: 1.8 !important; color: #1d1d1f !important; background-color: #f2f4f7 !important; -webkit-font-smoothing: antialiased; word-wrap: break-word; box-shadow: 0 8px 40px rgba(29,29,31,0.10); border-radius: 20px; overflow: hidden;',
  h1: 'font-size: 23px !important; font-weight: 900 !important; color: #1d1d1f !important; line-height: 1.38 !important; margin: 18px 0 0 !important; letter-spacing: -0.02em !important; padding: 0 !important;',
  h2: 'padding: 0.4em 0 0.5em 0.8em !important; margin: 6px 0 1em !important; color: #1d1d1f !important; font-size: 18px !important; font-weight: 600 !important; line-height: 1.4 !important; text-align: left !important; border-left: 3px solid #007aff !important; border-image: linear-gradient(to bottom, #007aff, #5856d6) 1 !important; background: transparent !important;',
  h3: 'margin: 24px 0 12px !important; color: #1d1d1f !important; font-size: 16px !important; font-weight: 600 !important; line-height: 1.4 !important; text-align: left !important;',
  h4: 'margin: 16px 0 8px !important; color: #1d1d1f !important; font-size: 15px !important; font-weight: 800 !important; line-height: 1.4 !important; text-align: left !important;',
  p: 'margin: 0 0 16px !important; font-size: 15px !important; line-height: 1.8 !important; color: #333333 !important; text-align: left !important;',
  strong: 'font-weight: 700 !important; color: #1d1d1f !important; background: transparent !important; padding: 0 !important; border-radius: 0 !important;',
  em: 'font-style: italic !important; color: #595959 !important;',
  a: 'color: #007aff !important; text-decoration: none !important; border-bottom: 1px solid rgba(0,122,255,0.3) !important; padding-bottom: 1px !important;',
  ul: 'margin: 16px 0 !important; padding-left: 28px !important; list-style: disc !important;',
  ol: 'margin: 16px 0 !important; padding-left: 28px !important; list-style: decimal !important;',
  li: 'margin: 8px 0 !important; line-height: 1.8 !important; color: #333333 !important; font-size: 15px !important;',
  blockquote: 'margin: 1.5em 0 !important; padding: 1em 1.2em !important; font-style: normal !important; border-left: 4px solid #007aff !important; border-image: linear-gradient(to bottom, #007aff, #5856d6, #ff2d55) 1 !important; color: #333333 !important; background: rgba(0,0,0,0.02) !important; border-radius: 8px !important;',
  code: 'font-family: "SFMono-Regular", Consolas, Menlo, monospace !important; padding: 2px 6px !important; background: #e0eefd !important; color: #007aff !important; border-radius: 4px !important; font-size: 12px !important; line-height: 1.5 !important;',
  pre: 'margin: 16px 0 !important; padding: 12px 14px !important; background: #fff !important; border: 1px solid rgba(0,0,0,0.06) !important; border-radius: 10px !important; font-family: "SFMono-Regular", Consolas, Menlo, monospace !important; font-size: 12px !important; line-height: 1.7 !important; color: #24292e !important; overflow-x: auto !important; white-space: pre !important;',
  hr: 'height: 2px !important; margin: 2em 18px !important; border: none !important; background-image: linear-gradient(to right, rgba(0,122,255,0), #007aff, #5856d6, #ff2d55, rgba(255,45,85,0)) !important;',
  img: 'max-width: 100% !important; height: auto !important; display: block !important; margin: 16px auto !important; border-radius: 8px !important;',
  table: 'width: 100% !important; margin: 1.5em 0 !important; border-collapse: collapse !important; font-size: 13px !important; border-radius: 8px !important; overflow: hidden !important; box-shadow: 0 4px 15px rgba(0,0,0,0.08) !important;',
  th: 'padding: 9px 10px !important; text-align: left !important; font-weight: 600 !important; color: #1d1d1f !important; border-bottom: 1.5px solid rgba(0,0,0,0.1) !important; background: #fbfbfd !important;',
  td: 'padding: 8px 10px !important; border-bottom: 1px solid rgba(0,0,0,0.05) !important; color: #333333 !important;',
  tr: 'border: none !important;',
};

// ============================================================
// 摸鱼绿 (moyu-green)
// Source: iPhone与Mac联动完全指南_排版_摸鱼绿(moyu-green).html + moyu-green.md
// Palette: 主色 #059669 · 渐变 #10B981/#34D399 · 黄荧光 #FDE68A · 文字 #374151/#111827
// ============================================================
const moyuGreenStyles: Record<string, string> = {
  container: 'max-width: 677px; margin: 0 auto; background: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; font-size: 16px; line-height: 1.75 !important; color: #374151 !important; letter-spacing: 0.5px; word-wrap: break-word; overflow-x: hidden;',
  h1: 'font-size: 24px !important; font-weight: 900 !important; color: #111827 !important; line-height: 1.05 !important; margin: 0 0 16px !important; letter-spacing: -2px !important; padding: 0 !important;',
  h2: 'margin: 32px 0 16px !important; font-size: 17px !important; font-weight: 900 !important; color: #111827 !important; line-height: 1.4 !important; letter-spacing: 0.3px !important; padding: 0 !important;',
  h3: 'margin: 24px 0 12px !important; font-size: 15px !important; font-weight: 900 !important; color: #111827 !important; line-height: 1.4 !important; padding: 0 !important; background: linear-gradient(180deg, transparent 65%, #FDE68A 65%) !important;',
  h4: 'margin: 16px 0 8px !important; font-size: 15px !important; font-weight: 800 !important; color: #111827 !important; line-height: 1.4 !important; padding: 0 !important;',
  p: 'margin: 0 0 16px !important; font-size: 14px !important; line-height: 1.9 !important; color: #374151 !important; text-align: justify !important;',
  strong: 'font-weight: 700 !important; color: #059669 !important; background: transparent !important; padding: 0 !important; border-radius: 0 !important;',
  em: 'font-style: italic !important; color: #4B5563 !important;',
  a: 'color: #059669 !important; text-decoration: none !important; border-bottom: 1px solid #A7F3D0 !important; padding-bottom: 1px !important;',
  ul: 'margin: 16px 0 !important; padding-left: 28px !important; list-style: disc !important;',
  ol: 'margin: 16px 0 !important; padding-left: 28px !important; list-style: decimal !important;',
  li: 'margin: 8px 0 !important; line-height: 1.9 !important; color: #374151 !important; font-size: 14px !important;',
  blockquote: 'margin: 16px 0 !important; padding: 12px 16px !important; background: #F0FDF4 !important; border: 1px solid #BBF7D0 !important; border-radius: 8px !important; color: #374151 !important; font-style: normal !important; line-height: 1.7 !important;',
  code: 'font-family: "SF Mono", Consolas, monospace !important; padding: 2px 6px !important; background: #F3F4F6 !important; color: #1F2937 !important; border-radius: 4px !important; font-size: 13px !important; font-weight: 600 !important;',
  pre: 'margin: 0 0 20px !important; padding: 11px 14px !important; background: #1E293B !important; border-radius: 8px !important; font-family: "SF Mono", Consolas, Monaco, monospace !important; font-size: 13px !important; line-height: 1.6 !important; color: #E2E8F0 !important; overflow-x: auto !important; box-shadow: 0 4px 16px -8px rgba(15,23,42,0.4) !important;',
  hr: 'margin: 36px auto !important; border: none !important; height: 1px !important; background: linear-gradient(to right, transparent, #059669, #10B981, transparent) !important;',
  img: 'max-width: 100% !important; height: auto !important; display: block !important; margin: 24px auto !important; border-radius: 8px !important;',
  table: 'width: 100% !important; margin: 24px 0 !important; border-collapse: collapse !important; font-size: 13px !important; overflow-x: auto !important;',
  th: 'background: #059669 !important; color: #fff !important; font-weight: 700 !important; padding: 8px 12px !important; text-align: left !important; border-bottom: 1.5px solid #059669 !important;',
  td: 'padding: 8px 12px !important; border-bottom: 1px solid #E5E7EB !important; color: #374151 !important;',
  tr: 'border: none !important; background: transparent !important;',
};

// ============================================================
// 石墨极简 (graphite-minimal)
// Source: 今日新闻简报20260807_排版_石墨极简风(graphite-minimal).html + graphite-minimal.md
// Palette: 主文字 #27272A/#52525B · 次级 #A1A1AA · 点睛 #F97316 · 左竖线 #52525B
// ============================================================
const graphiteMinimalStyles: Record<string, string> = {
  container: 'max-width: 677px; margin: 0 auto; background: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; font-size: 16px; line-height: 1.8 !important; color: #52525B !important; letter-spacing: 0.3px; word-wrap: break-word; overflow-x: hidden;',
  h1: 'margin: 24px 0 12px !important; font-size: 22px !important; font-weight: 700 !important; color: #27272A !important; line-height: 1.35 !important; padding: 0 !important; letter-spacing: -0.01em !important;',
  h2: 'margin: 32px 0 16px !important; padding-left: 14px !important; font-size: 18px !important; font-weight: 700 !important; color: #27272A !important; line-height: 1.4 !important; border-left: 3px solid #52525B !important;',
  h3: 'margin: 24px 0 12px !important; padding-left: 12px !important; font-size: 16px !important; font-weight: 600 !important; color: #27272A !important; line-height: 1.4 !important; border-left: 2px solid #A1A1AA !important;',
  h4: 'margin: 20px 0 10px !important; font-size: 15px !important; font-weight: 700 !important; color: #27272A !important; line-height: 1.4 !important;',
  p: 'margin: 0 0 16px !important; font-size: 15px !important; line-height: 1.8 !important; color: #52525B !important; text-align: justify !important;',
  strong: 'font-weight: 700 !important; color: #27272A !important; background: transparent !important; padding: 0 !important;',
  em: 'font-style: italic !important; color: #A1A1AA !important;',
  a: 'color: #27272A !important; text-decoration: none !important; border-bottom: 1px solid #A1A1AA !important; padding-bottom: 1px !important;',
  ul: 'margin: 16px 0 !important; padding-left: 28px !important; list-style: disc !important;',
  ol: 'margin: 16px 0 !important; padding-left: 28px !important; list-style: decimal !important;',
  li: 'margin: 8px 0 !important; line-height: 1.8 !important; color: #52525B !important; font-size: 15px !important;',
  blockquote: 'margin: 20px 0 !important; padding: 14px 18px !important; background: #FAFAFA !important; border-left: 3px solid #52525B !important; color: #27272A !important; font-style: normal !important; line-height: 1.7 !important; border-radius: 0 !important;',
  code: 'font-family: "SF Mono", Consolas, monospace !important; padding: 2px 6px !important; background: #FAFAFA !important; color: #27272A !important; border-radius: 3px !important; font-size: 13px !important; font-weight: 600 !important; border: 1px solid #E4E4E7 !important;',
  pre: 'margin: 16px 0 !important; padding: 14px 16px !important; background: #FAFAFA !important; border: 1px solid #E4E4E7 !important; border-radius: 6px !important; font-family: "SF Mono", Consolas, monospace !important; font-size: 13px !important; line-height: 1.6 !important; color: #27272A !important; overflow-x: auto !important;',
  hr: 'margin: 32px auto !important; border: none !important; height: 1px !important; background: #E4E4E7 !important;',
  img: 'max-width: 100% !important; height: auto !important; display: block !important; margin: 24px auto !important; border-radius: 4px !important;',
  table: 'width: 100% !important; margin: 24px 0 !important; border-collapse: collapse !important; font-size: 13px !important; overflow-x: auto !important;',
  th: 'background: #FAFAFA !important; color: #27272A !important; font-weight: 700 !important; padding: 10px 12px !important; text-align: left !important; border-bottom: 1.5px solid #27272A !important;',
  td: 'padding: 8px 12px !important; border-bottom: 1px solid #E4E4E7 !important; color: #52525B !important;',
  tr: 'border: none !important; background: transparent !important;',
};

export const localSkillThemes: Theme[] = [
  { id: 'apple', name: '苹果范', description: '苹果范 · LSGMac 公众号风格（蓝紫粉渐变系统）', styles: appleStyles },
  { id: 'moyu-green', name: '摸鱼绿', description: '摸鱼风 · 教程工具类长文（翠绿+荧光笔黄）', styles: moyuGreenStyles },
  { id: 'graphite-minimal', name: '石墨极简', description: '石墨极简风 · 新闻简报日报（灰黑+橙色点睛）', styles: graphiteMinimalStyles },
];