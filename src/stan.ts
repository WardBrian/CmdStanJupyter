import { IEditorLanguage } from '@jupyterlab/codemirror';
import { LanguageSupport, StreamLanguage } from '@codemirror/language';
import { simpleMode } from '@codemirror/legacy-modes/mode/simple-mode';

const stanSimpleMode = simpleMode({
  // The start state contains the rules that are intially used
  // Rules are matched in order. I am using the same order as vscode/atom
  start: [
    // comments
    {
      // include directives
      regex: /(\s*)(#)(\s*)(include)(\b)(\s*)/,
      token: ['', 'string-2', '', 'string-2', '', ''],
      push: 'include',
      sol: true
    },
    { regex: /\/\/\/?.*$/, token: 'comment' },
    { regex: /#.*$/, token: 'comment' }, //deprecated # comments
    { regex: /\/\*\*/, token: 'comment', push: 'doc_comment_block' },
    { regex: /\/\*/, token: 'comment', push: 'comment_block' },
    // numbers
    { regex: /(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?i?/, token: 'number' },
    //string literal
    { regex: /"/, token: 'string', push: 'string' },
    // blocks
    {
      regex:
        /(functions|data|transformed\s+data|parameters|transformed\s+parameters|model|generated\s+quantities)(\b\s*{)/,
      token: ['keyword', ''],
      indent: true
    },
    //types
    {
      regex:
        /(\b)(int|real|complex|vector|array|simplex|unit_vector|ordered|positive_ordered|row_vector|matrix|corr_matrix|cov_matrix|cholesky_factor_cov|cholesky_factor_corr|void)(\b)/,
      token: ['', 'def', '']
    },
    {
      regex: /(\b|<|,)(lower|upper|offset|multiplier)(\s*)(=)/,
      token: ['', 'keyword', '', 'operator']
    },
    // control flow
    {
      regex: /\b(for|in|while|if|else|return)\b/,
      token: 'keyword'
    },
    // target
    {
      regex: /(\b)(target)(\s*)([+][=])/,
      token: ['', 'keyword', '', 'operator']
    },
    // truncation
    {
      regex: /\bT(?=\s*\[)/,
      token: 'keyword'
    },
    // distributions
    {
      regex:
        /([~])(\s*\b)(bernoulli|bernoulli_logit|bernoulli_logit_glm|beta|beta_binomial|binomial|binomial_logit|categorical|categorical_logit|categorical_logit_glm|cauchy|chi_square|dirichlet|discrete_range|double_exponential|exp_mod_normal|exponential|frechet|gamma|gaussian_dlm_obs|gumbel|hypergeometric|inv_chi_square|inv_gamma|inv_wishart|lkj_corr|lkj_corr_cholesky|logistic|lognormal|multi_gp|multi_gp_cholesky|multi_normal|multi_normal_cholesky|multi_normal_prec|multi_student_t|multinomial|multinomial_logit|neg_binomial|neg_binomial_2|neg_binomial_2_log|neg_binomial_2_log_glm|normal|normal_id_glm|ordered_logistic|ordered_logistic_glm|ordered_probit|pareto|pareto_type_2|poisson|poisson_log|poisson_log_glm|rayleigh|scaled_inv_chi_square|skew_double_exponential|skew_normal|std_normal|student_t|uniform|von_mises|weibull|wiener|wishart)(\b)/,
      token: ['operator', '', 'builtin', '']
    },
    // print and reject
    {
      regex: /\b(print|reject)\b/,
      token: 'builtin'
    },
    // stan functions
    {
      // deprecated
      regex:
        /\b(binomial_coefficient_log|get_lp|if_else|increment_log_prob|integrate_ode|lkj_cov|multiply_log)\b/,
      token: 'variable-2'
    },
    {
      // builtint
      regex:
        /\b(Phi|Phi_approx|abs|acos|acosh|add_diag|algebra_solver|append_array|append_col|append_row|asin|asinh|atan|atan2|atanh|bernoulli_cdf|bernoulli_lccdf|bernoulli_lcdf|bernoulli_logit_glm_lpmf|bernoulli_logit_glm_lupmf|bernoulli_logit_lpmf|bernoulli_logit_lupmf|bernoulli_logit_rng|bernoulli_lpmf|bernoulli_lupmf|bernoulli_rng|bessel_first_kind|bessel_second_kind|beta|beta_binomial_cdf|beta_binomial_lccdf|beta_binomial_lcdf|beta_binomial_lpmf|beta_binomial_lupmf|beta_binomial_rng|beta_cdf|beta_lccdf|beta_lcdf|beta_lpdf|beta_lupdf|beta_proportion_lccdf|beta_proportion_lcdf|beta_proportion_rng|beta_rng|binary_log_loss|binomial_cdf|binomial_coefficient_log|binomial_lccdf|binomial_lcdf|binomial_logit_lpmf|binomial_logit_lupmf|binomial_lpmf|binomial_lupmf|binomial_rng|block|categorical_logit_glm_lpmf|categorical_logit_glm_lupmf|categorical_logit_lpmf|categorical_logit_lupmf|categorical_logit_rng|categorical_lpmf|categorical_lupmf|categorical_rng|cauchy_cdf|cauchy_lccdf|cauchy_lcdf|cauchy_lpdf|cauchy_lupdf|cauchy_rng|cbrt|ceil|chi_square_cdf|chi_square_lccdf|chi_square_lcdf|chi_square_lpdf|chi_square_lupdf|chi_square_rng|chol2inv|cholesky_decompose|choose|col|cols|columns_dot_product|columns_dot_self|cos|cosh|cov_exp_quad|crossprod|csr_extract_u|csr_extract_v|csr_extract_w|csr_matrix_times_vector|csr_to_dense_matrix|cumulative_sum|determinant|diag_matrix|diag_post_multiply|diag_pre_multiply|diagonal|digamma|dims|dirichlet_lpdf|dirichlet_lupdf|dirichlet_rng|discrete_range_cdf|discrete_range_lccdf|discrete_range_lcdf|discrete_range_lpmf|discrete_range_lupmf|discrete_range_rng|distance|dot_product|dot_self|double_exponential_cdf|double_exponential_lccdf|double_exponential_lcdf|double_exponential_lpdf|double_exponential_lupdf|double_exponential_rng|eigenvalues_sym|eigenvectors_sym|erf|erfc|exp|exp2|exp_mod_normal_cdf|exp_mod_normal_lccdf|exp_mod_normal_lcdf|exp_mod_normal_lpdf|exp_mod_normal_lupdf|exp_mod_normal_rng|expm1|exponential_cdf|exponential_lccdf|exponential_lcdf|exponential_lpdf|exponential_lupdf|exponential_rng|fabs|falling_factorial|fdim|floor|fma|fmax|fmin|fmod|frechet_cdf|frechet_lccdf|frechet_lcdf|frechet_lpdf|frechet_lupdf|frechet_rng|gamma_cdf|gamma_lccdf|gamma_lcdf|gamma_lpdf|gamma_lupdf|gamma_p|gamma_q|gamma_rng|gaussian_dlm_obs_lpdf|gaussian_dlm_obs_lupdf|generalized_inverse|gumbel_cdf|gumbel_lccdf|gumbel_lcdf|gumbel_lpdf|gumbel_lupdf|gumbel_rng|head|hmm_marginal|hypergeometric_lpmf|hypergeometric_lupmf|hypergeometric_rng|hypot|identity_matrix|inc_beta|int_step|integrate_1d|integrate_ode|integrate_ode_adams|integrate_ode_bdf|integrate_ode_rk45|inv|inv_Phi|inv_chi_square_cdf|inv_chi_square_lccdf|inv_chi_square_lcdf|inv_chi_square_lpdf|inv_chi_square_lupdf|inv_chi_square_rng|inv_cloglog|inv_gamma_cdf|inv_gamma_lccdf|inv_gamma_lcdf|inv_gamma_lpdf|inv_gamma_lupdf|inv_gamma_rng|inv_logit|inv_sqrt|inv_square|inv_wishart_lpdf|inv_wishart_lupdf|inv_wishart_rng|inverse|inverse_spd|is_inf|is_nan|lambert_w0|lambert_wm1|lbeta|lchoose|ldexp|lgamma|linspaced_array|linspaced_int_array|linspaced_row_vector|linspaced_vector|lkj_corr_cholesky_lpdf|lkj_corr_cholesky_lupdf|lkj_corr_cholesky_rng|lkj_corr_lpdf|lkj_corr_lupdf|lkj_corr_rng|lmgamma|lmultiply|log|log10|log1m|log1m_exp|log1m_inv_logit|log1p|log1p_exp|log2|log_determinant|log_diff_exp|log_falling_factorial|log_inv_logit|log_inv_logit_diff|log_mix|log_modified_bessel_first_kind|log_rising_factorial|log_softmax|log_sum_exp|logistic_cdf|logistic_lccdf|logistic_lcdf|logistic_lpdf|logistic_lupdf|logistic_rng|logit|lognormal_cdf|lognormal_lccdf|lognormal_lcdf|lognormal_lpdf|lognormal_lupdf|lognormal_rng|map_rect|matrix_exp|matrix_exp_multiply|matrix_power|max|mdivide_left_spd|mdivide_left_tri_low|mdivide_right_spd|mdivide_right_tri_low|mean|min|modified_bessel_first_kind|modified_bessel_second_kind|multi_gp_cholesky_lpdf|multi_gp_cholesky_lupdf|multi_gp_lpdf|multi_gp_lupdf|multi_normal_cholesky_lpdf|multi_normal_cholesky_lupdf|multi_normal_cholesky_rng|multi_normal_lpdf|multi_normal_lupdf|multi_normal_prec_lpdf|multi_normal_prec_lupdf|multi_normal_rng|multi_student_t_lpdf|multi_student_t_lupdf|multi_student_t_rng|multinomial_logit_lpmf|multinomial_logit_lupmf|multinomial_logit_rng|multinomial_lpmf|multinomial_lupmf|multinomial_rng|multiply_log|multiply_lower_tri_self_transpose|neg_binomial_2_cdf|neg_binomial_2_lccdf|neg_binomial_2_lcdf|neg_binomial_2_log_glm_lpmf|neg_binomial_2_log_glm_lupmf|neg_binomial_2_log_lpmf|neg_binomial_2_log_lupmf|neg_binomial_2_log_rng|neg_binomial_2_lpmf|neg_binomial_2_lupmf|neg_binomial_2_rng|neg_binomial_cdf|neg_binomial_lccdf|neg_binomial_lcdf|neg_binomial_lpmf|neg_binomial_lupmf|neg_binomial_rng|normal_cdf|normal_id_glm_lpdf|normal_id_glm_lupdf|normal_lccdf|normal_lcdf|normal_lpdf|normal_lupdf|normal_rng|num_elements|ode_adams|ode_adams_tol|ode_adjoint_tol_ctl|ode_bdf|ode_bdf_tol|ode_ckrk|ode_ckrk_tol|ode_rk45|ode_rk45_tol|one_hot_array|one_hot_int_array|one_hot_row_vector|one_hot_vector|ones_array|ones_int_array|ones_row_vector|ones_vector|ordered_logistic_glm_lpmf|ordered_logistic_glm_lupmf|ordered_logistic_lpmf|ordered_logistic_lupmf|ordered_logistic_rng|ordered_probit_lpmf|ordered_probit_lupmf|ordered_probit_rng|owens_t|pareto_cdf|pareto_lccdf|pareto_lcdf|pareto_lpdf|pareto_lupdf|pareto_rng|pareto_type_2_cdf|pareto_type_2_lccdf|pareto_type_2_lcdf|pareto_type_2_lpdf|pareto_type_2_lupdf|pareto_type_2_rng|poisson_cdf|poisson_lccdf|poisson_lcdf|poisson_log_glm_lpmf|poisson_log_glm_lupmf|poisson_log_lpmf|poisson_log_lupmf|poisson_log_rng|poisson_lpmf|poisson_lupmf|poisson_rng|pow|prod|qr_Q|qr_R|qr_thin_Q|qr_thin_R|quad_form|quad_form_diag|quad_form_sym|quantile|rank|rayleigh_cdf|rayleigh_lccdf|rayleigh_lcdf|rayleigh_lpdf|rayleigh_lupdf|rayleigh_rng|reduce_sum|rep_array|rep_matrix|rep_row_vector|rep_vector|reverse|rising_factorial|round|row|rows|rows_dot_product|rows_dot_self|scale_matrix_exp_multiply|scaled_inv_chi_square_cdf|scaled_inv_chi_square_lccdf|scaled_inv_chi_square_lcdf|scaled_inv_chi_square_lpdf|scaled_inv_chi_square_lupdf|scaled_inv_chi_square_rng|sd|segment|sin|singular_values|sinh|size|skew_double_exponential_cdf|skew_double_exponential_lccdf|skew_double_exponential_lcdf|skew_double_exponential_lpdf|skew_double_exponential_lupdf|skew_double_exponential_rng|skew_normal_cdf|skew_normal_lccdf|skew_normal_lcdf|skew_normal_lpdf|skew_normal_lupdf|skew_normal_rng|softmax|sort_asc|sort_desc|sort_indices_asc|sort_indices_desc|sqrt|square|squared_distance|std_normal_cdf|std_normal_lccdf|std_normal_lcdf|std_normal_lpdf|std_normal_lupdf|std_normal_rng|step|student_t_cdf|student_t_lccdf|student_t_lcdf|student_t_lpdf|student_t_lupdf|student_t_rng|sub_col|sub_row|sum|svd_U|svd_V|symmetrize_from_lower_tri|tail|tan|tanh|tcrossprod|tgamma|to_array_1d|to_array_2d|to_matrix|to_row_vector|to_vector|trace|trace_gen_quad_form|trace_quad_form|trigamma|trunc|uniform_cdf|uniform_lccdf|uniform_lcdf|uniform_lpdf|uniform_lupdf|uniform_rng|uniform_simplex|variance|von_mises_lpdf|von_mises_lupdf|von_mises_rng|weibull_cdf|weibull_lccdf|weibull_lcdf|weibull_lpdf|weibull_lupdf|weibull_rng|wiener_lpdf|wiener_lupdf|wishart_lpdf|wishart_lupdf|wishart_rng|zeros_array|zeros_int_array|zeros_row_vector)\b/,
      token: 'builtin'
    },
    // reserved words
    {
      // c++ keywords
      regex:
        /\b(alignas|alignof|and|and_eq|asm|auto|bitand|bitor|bool|break|case|catch|char|char16_t|char32_t|class|compl|const|constexpr|const_cast|continue|decltype|default|delete|do|double|dynamic_cast|else|enum|explicit|export|extern|false|float|for|friend|goto|if|inline|int|long|mutable|namespace|new|noexcept|not|not_eq|''ptr|operator|or|or_eq|private|protected|public|register|reinterpret_cast|return|short|signed|sizeof|static|static_assert|static_cast|struct|switch|template|this|thread_local|throw|true|try|typedef|typeid|typename|union|unsigned|using|virtual|void|volatile|wchar_t|while|xor|xor_eq)\b/,
      token: 'string-2'
    },
    {
      //stan internal use
      regex:
        /\b(for|in|while|repeat|until|if|then|else|true|false|var|fvar|STAN_MAJOR|STAN_MINOR|STAN_PATCH|STAN_MATH_MAJOR|STAN_MATH_MINOR|STAN_MATH_PATCH)\b/,
      token: 'string-2'
    },
    {
      // reserved for blocks
      regex:
        /\b(functions|data|transformed\s+data|parameters|transformed\s+parameters|model|generated\s+quantities)\b\s[=+-]/,
      token: 'string-2'
    },

    // illegal variables
    {
      regex: /\b([a-zA-Z0-9_]*__|[0-9_][A-Za-z0-9_]+|_)\b/,
      token: 'variable-2'
    },
    // variables
    {
      regex: /\b[A-Za-z][0-9A-Za-z_]*\b/,
      token: 'variable'
    },

    // operators
    {
      // deprecated
      regex: /<-/,
      token: 'operator'
    },
    {
      regex:
        /~|:|[?]|[|]{2}|&&|==|!=|<=?|>=?|!|\+|-|\.?\*|\.?\/|%|\\|\^|'|[+-]=|\.?[*/]=|=/,
      token: 'operator'
    },

    // end of blocks, local blocks
    {
      regex: /{/,
      indent: true
    },
    {
      regex: /}/,
      dedent: true
    },
    // punctuation
    { regex: /(\;|\||,)/, token: 'punctuation' }
  ],

  include: [
    { regex: /\s*(?=(?:\/\/|\/\*|#)|\n|$)/, pop: true },
    { regex: /[<>]/, token: 'punctuation' },
    { regex: /./, token: 'string' }
  ],

  doc_comment_block: [
    { regex: /(?<!\w)@(param|return)\b/, token: 'atom' },

    { regex: /(\*\/\s+\*(?!\/)[^\n]*)|(\*\/)/, token: 'comment', pop: true },
    // Match anything else as a character inside the comment
    { regex: /./, token: 'comment' }
  ],

  comment_block: [
    { regex: /\/\*/, token: 'comment', push: 'comment_block' },
    // this ends and restarts a comment block. but need to catch this so
    // that it doesn\'t start _another_ level of comment blocks
    { regex: /\*\/\*/, token: 'comment' },
    { regex: /(\*\/\s+\*(?!\/)[^\n]*)|(\*\/)/, token: 'comment', pop: true },
    // Match anything else as a character inside the comment
    { regex: /./, token: 'comment' }
  ],

  string: [
    { regex: /"/, token: 'string', pop: true },
    { regex: /./, token: 'string' }
  ]
});

stanSimpleMode.languageData = {
  commentTokens: {
    line: '//',
    block: { open: '/*', close: '*/' }
  },
  closeBrackets: {
    brackets: ['(', '[', '{', "'", '"'],
    before: ')]}:;>'
  }
};

const stanStreamLanguage = StreamLanguage.define(stanSimpleMode);

const stanCodeMirrorSupport = new LanguageSupport(stanStreamLanguage);

const stanLanguage: IEditorLanguage = {
  name: 'stan',
  displayName: 'Stan',
  extensions: ['.stan'],
  mime: 'text/x-stan',
  filename: /.*\.stan$/,
  load: async () => new LanguageSupport(stanStreamLanguage)
};

export { stanLanguage, stanCodeMirrorSupport };
