/**
 * Local theme skill configs from ~/Desktop/公众号技能/
 * - 苹果风 apple  (LSGMac Apple style design tokens)
 * - 摸鱼绿 moyu-green (tutorial/long-form green palette)
 * - 石墨极简风 graphite-minimal (news brief gray + orange accent)
 *
 * These themes reuse the styles schema defined in types.ts.
 */

import type { Theme } from './types';
import { makeStyles, type Palette } from './md2wechat';

const applePalette: Palette = {
  id: 'apple',
  name: '苹果范',
  description: '苹果风 · LSGMac 公众号风格（蓝紫粉渐变系统）',
  font: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  bg: '#ffffff',
  text: '#333333',
  heading: '#1d1d1f',
  subheading: '#1d1d1f',
  primary: '#007aff',
  surface: '#f2f4f7',
  surfaceText: '#333333',
  border: '#eaeaea',
  divider: '#f0f0f0',
  codeBg: '#f2f4f7',
  codeText: '#007aff',
  emphasisBg: '#e0eefd',
  emphasisText: '#1d1d1f',
  surfaceBorder: '#007aff',
};

const moyuGreenPalette: Palette = {
  id: 'moyu-green',
  name: '摸鱼绿',
  description: '摸鱼风 · 教程工具类长文（翠绿+荧光笔黄）',
  font: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  bg: '#ffffff',
  text: '#374151',
  heading: '#111827',
  subheading: '#1f2937',
  primary: '#059669',
  surface: '#f0fdf4',
  surfaceText: '#374151',
  border: '#e5e7eb',
  divider: '#f3f4f6',
  codeBg: '#1e293b',
  codeText: '#a7f3d0',
  emphasisBg: 'rgba(5,150,105,0.08)',
  emphasisText: '#059669',
  surfaceBorder: '#059669',
};

const graphiteMinimalPalette: Palette = {
  id: 'graphite-minimal',
  name: '石墨极简',
  description: '石墨极简风 · 新闻简报日报（灰黑极简+橙色点睛）',
  font: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  bg: '#ffffff',
  text: '#52525b',
  heading: '#27272a',
  subheading: '#3f3f46',
  primary: '#52525b',
  surface: '#fafafa',
  surfaceText: '#52525b',
  border: '#e4e4e7',
  divider: '#e4e4e7',
  codeBg: '#fafafa',
  codeText: '#27272a',
  emphasisBg: 'transparent',
  emphasisText: '#27272a',
  surfaceBorder: '#52525b',
};

export const localSkillThemes: Theme[] = [
  { id: applePalette.id, name: applePalette.name, description: applePalette.description, styles: makeStyles(applePalette) },
  { id: moyuGreenPalette.id, name: moyuGreenPalette.name, description: moyuGreenPalette.description, styles: makeStyles(moyuGreenPalette) },
  { id: graphiteMinimalPalette.id, name: graphiteMinimalPalette.name, description: graphiteMinimalPalette.description, styles: makeStyles(graphiteMinimalPalette) },
];