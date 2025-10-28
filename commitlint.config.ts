module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test', 'draft']
    ],
    'scope-empty': [2, 'never'],
    'scope-min-length': [2, 'always', 2],
    'subject-min-length': [2, 'always', 4]
  }
}
