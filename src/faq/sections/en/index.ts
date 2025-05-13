import { FaqSection } from '../models';
import advancedFeatures from './advanced-features.md';
import assignment from './assignment.md';
import basicFilters from './basic-filters.md';
import builtinOperatorsAndFunctions from './builtin-operators-and-functions.md';
import conditionalsAndComparisons from './conditionals-and-comparisons.md';
import intro from './intro.md';
import math from './math.md';
import regularExpressions from './regular-expressions.md';
import typesAndValues from './types-and-values.md';

export default {
  intro,
  basicFilters,
  typesAndValues,
  builtinOperatorsAndFunctions,
  conditionalsAndComparisons,
  regularExpressions,
  advancedFeatures,
  math,
  assignment,
} satisfies FaqSection;
