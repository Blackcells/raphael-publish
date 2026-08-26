import type { Theme } from './types';
import { classicThemes } from './classic';
import { modernThemes } from './modern';
import { extraThemes } from './extra';
import { md2wechatThemes } from './md2wechat';
import { localSkillThemes } from './localSkills';

export type { Theme };
export const THEMES: Theme[] = [
  ...classicThemes,
  ...modernThemes,
  ...extraThemes,
  ...md2wechatThemes,
  ...localSkillThemes,
];

export interface ThemeGroup {
  label: string;
  themes: Theme[];
}

export const THEME_GROUPS: ThemeGroup[] = [
  { label: '经典', themes: classicThemes },
  { label: '潮流', themes: modernThemes },
  { label: '更多风格', themes: extraThemes },
  { label: '主题画廊', themes: md2wechatThemes },
  { label: '我的技能主题', themes: localSkillThemes },
];