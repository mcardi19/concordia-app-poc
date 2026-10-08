import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-native-web-vite';
import { mergeConfig } from 'vite';

const configDir = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ['../src/components/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-native-web-vite',
    options: {
      modulesToTranspile: [
        'expo-linear-gradient',
        'expo-font',
        'material-symbols-react-native',
        '@material-symbols-react-native',
      ],
      pluginReactOptions: {
        babel: {
          plugins: [
            [
              'module-resolver',
              {
                root: ['.'],
                alias: {
                  '@': './src',
                },
              },
            ],
            '@babel/plugin-transform-export-namespace-from',
            'react-native-reanimated/plugin',
          ],
        },
      },
    },
  },
  async viteFinal(viteConfig) {
    return mergeConfig(viteConfig, {
      resolve: {
        alias: {
          '@': path.resolve(configDir, '../src'),
          'expo-secure-store': path.resolve(configDir, 'secureStoreMock.ts'),
          'expo-glass-effect': path.resolve(configDir, 'expoGlassMock.tsx'),
          'expo-blur': path.resolve(configDir, 'expoBlurMock.tsx'),
        },
      },
    });
  },
};

export default config;
