module.exports = {
  VARIABLE_REG: /^[a-zA-Z_]+[a-zA-Z_0-9]*$/,
  PARAM_SPECIAL_KEYS: [
    // inline
    'lt', 'lte', 'gt', 'gte', 'ne', 'in', 'nin',
    // array
    'push', 'pop', 'slice', 'size',
    // outline
    'inc', 'set', 'unset', 'sort', 'limit', 'skip', 'or', 'not', 'all', 'exists',
    'page', 'pageCount',
  ],
};
