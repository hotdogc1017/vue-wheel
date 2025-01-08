import process from 'node:process'
import { defineConfig } from '@rsbuild/core'
import { pluginVue as vue } from '@rsbuild/plugin-vue'
import { RsdoctorRspackPlugin } from '@rsdoctor/rspack-plugin'

export default defineConfig({
  plugins: [vue()],
  output: {
    target: 'node',
    distPath: {
      root: './dist/rsbuild',
    },
  },
  performance: {
    buildCache: false,
  },
  tools: {
    bundlerChain: (chain) => {
      if (process.env.RSDOCTOR) {
        chain.plugin('Rsdoctor').use(RsdoctorRspackPlugin, [
          {
            // 插件选项
          },
        ])
      }
    },
  },
})
