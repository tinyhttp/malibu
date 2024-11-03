import defaultConfig from '@commitlint/config-conventional'

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    ...defaultConfig.rules,
    'type-enum': [
      2,
      'always',
      ['fix', 'test', 'tooling', 'refactor', 'revert', 'example', 'docs', 'format', 'feat', 'chore']
    ]
  }
}
