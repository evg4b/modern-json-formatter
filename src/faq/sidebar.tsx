import { ChromeWebStoreButton, GithubButton, KoFiButton } from '@core/ui/buttons';
import { Column, Row } from '@core/ui/flex';
import { Logo } from '@core/ui/logo';
import { clsx } from 'clsx';
import { logo } from './sidebar.module.css';

export const Sidebar = ({ className }: { className: string }) => (
  <div className={ clsx('sidebar', className) }>
    <div className="header">
      <Column align="center">
        <Logo size="128" className={logo}/>
        <div className="name">
          Modern JSON Formatter
        </div>
      </Column>
      <Row className="links" justify="center">
        <GithubButton />
        <ChromeWebStoreButton />
        <KoFiButton />
      </Row>
    </div>
    <div className="menu">
      <div className="section">
        <a href="#basic-filters" className="item section-header">Basic filters</a>
        <div className="children section">
          <a href="#identity" className="item"> Identity: <code>.</code> </a>
          <a href="#object-identifier-index" className="item">
            Object Identifier-Index: <code>.foo</code>, <code>.foo.bar</code>
          </a>
          <a href="#optional-object-identifier-index" className="item">
            Optional Object Identifier-Index: <code>.foo?</code>
          </a>
          <a href="#object-index" className="item"> Object Index: <code>.[&lt;string&gt;]</code> </a>
          <a href="#array-index" className="item"> Array Index: <code>.[&lt;number&gt;]</code> </a>
          <a href="#array-string-slice" className="item">
            Array/String Slice: <code>.[&lt;number&gt;:&lt;number&gt;]</code>
          </a>
          <a href="#array-object-value-iterator" className="item"> Array/Object Value Iterator: <code>.[]</code> </a>
          <a href="#.[]?" className="item"><code>.[]?</code></a>
          <a href="#comma" className="item">Comma: <code>,</code></a>
          <a href="#pipe" className="item">Pipe: <code>|</code></a>
          <a href="#parenthesis" className="item">Parenthesis</a>
        </div>
      </div>
      <div className="section">
        <a href="#types-and-values" className="item section-header">Types and Values</a>
        <div className="children section">
          <a href="#array-construction" className="item">Array construction: <code>[]</code></a>
          <a href="#object-construction" className="item">Object Construction: <code>{ }</code></a>
          <a href="#recursive-descent" className="item">Recursive Descent: <code>..</code></a>
        </div>
      </div>
      <div className="section">
        <a href="#builtin-operators-and-functions" className="item section-header">Builtin operators and functions</a>
        <div className="children section">
          <a href="#addition" className="item">Addition: <code>+</code></a>
          <a href="#subtraction" className="item">Subtraction: <code>-</code></a>
          <a href="#multiplication-division-modulo" className="item">
            Multiplication, division, modulo: <code>*</code>, <code>/</code>, <code>%</code>
          </a>
          <a href="#abs" className="item"><code>abs</code></a>
          <a href="#length" className="item"><code>length</code></a>
          <a href="#utf8bytelength" className="item"><code>utf8bytelength</code></a>
          <a href="#keys-keys_unsorted" className="item"><code>keys</code>, <code>keys_unsorted</code></a>
          <a href="#has" className="item"><code>has(key)</code></a>
          <a href="#in" className="item"><code>in</code></a>
          <a href="#map-map_values" className="item"><code>map(f)</code>, <code>map_values(f)</code></a>
          <a href="#pick" className="item"><code>pick(pathexps)</code></a>
          <a href="#path" className="item"><code>path(path_expression)</code></a>
          <a href="#del" className="item"><code>del(path_expression)</code></a>
          <a href="#getpath" className="item"><code>getpath(PATHS)</code></a>
          <a href="#setpath" className="item"><code>setpath(PATHS; VALUE)</code></a>
          <a href="#delpaths" className="item"><code>delpaths(PATHS)</code></a>
          <a href="#to_entries-from_entries-with_entries" className="item">
            <code>to_entries</code>, <code>from_entries</code>, <code>with_entries(f)</code>
          </a>
          <a href="#select" className="item"><code>select(boolean_expression)</code></a>
          <a
            href="#arrays-objects-iterables-booleans-numbers-normals-finites-strings-nulls-values-scalars"
            className="item">
            <code>arrays</code>, <code>objects</code>, <code>iterables</code>, <code>booleans</code>,
            <code>numbers</code>, <code>normals</code>, <code>finites</code>, <code>strings</code>,
            <code>nulls</code>, <code>values</code>, <code>scalars</code>
          </a>
          <a href="#empty" className="item"><code>empty</code></a>
          <a href="#error" className="item"><code>error</code>, <code>error(message)</code></a>
          <a href="#halt" className="item"><code>halt</code></a>
          <a href="#halt_error" className="item"><code>halt_error</code>, <code>halt_error(exit_code)</code></a>
          <a href="#paths" className="item"><code>paths</code>, <code>paths(node_filter)</code></a>
          <a href="#add" className="item"><code>add</code></a>
          <a href="#any" className="item">
            <code>any</code>, <code>any(condition)</code>, <code>any(generator; condition)</code>
          </a>
          <a href="#all" className="item">
            <code>all</code>, <code>all(condition)</code>, <code>all(generator; condition)</code>
          </a>
          <a href="#flatten" className="item"><code>flatten</code>, <code>flatten(depth)</code></a>
          <a href="#range" className="item">
            <code>range(upto)</code>, <code>range(from; upto)</code>, <code> range(from; upto; by)</code>
          </a>
          <a href="#floor" className="item"><code>floor</code></a>
          <a href="#sqrt" className="item"><code>sqrt</code></a>
          <a href="#tonumber" className="item"><code>tonumber</code></a>
          <a href="#tostring" className="item"><code>tostring</code></a>
          <a href="#type" className="item"><code>type</code></a>
          <a href="#infinite-nan-isinfinite-isnan-isfinite-isnormal" className="item">
            <code>infinite</code>, <code>nan</code>, <code>isinfinite</code>, <code>isnan</code>,
            <code>isfinite</code>, <code>isnormal</code>
          </a>
          <a href="#sort-sort_by" className="item"><code>sort</code>, <code>sort_by(path_expression)</code></a>
          <a href="#group_by" className="item"><code>group_by(path_expression)</code></a>
          <a href="#min-max-min_by-max_by" className="item">
            <code>min</code>, <code>max</code>, <code>min_by(path_exp)</code>, <code>max_by(path_exp)</code>
          </a>
          <a href="#unique-unique_by" className="item"><code>unique</code>, <code>unique_by(path_exp)</code></a>
          <a href="#reverse" className="item"><code>reverse</code></a>
          <a href="#contains" className="item"><code>contains(element)</code></a>
          <a href="#indices" className="item"><code>indices(s)</code></a>
          <a href="#index-rindex" className="item"><code>index(s)</code>, <code>rindex(s)</code></a>
          <a href="#inside" className="item"><code>inside</code></a>
          <a href="#startswith" className="item"><code>startswith(str)</code></a>
          <a href="#endswith" className="item"><code>endswith(str)</code></a>
          <a href="#combinations" className="item"><code>combinations</code>, <code>combinations(n)</code></a>
          <a href="#ltrimstr" className="item"><code>ltrimstr(str)</code></a>
          <a href="#rtrimstr" className="item"><code>rtrimstr(str)</code></a>
          <a href="#explode" className="item"><code>explode</code></a>
          <a href="#implode" className="item"><code>implode</code></a>
          <a href="#split-1" className="item"><code>split(str)</code></a>
          <a href="#join" className="item"><code>join(str)</code></a>
          <a href="#ascii_downcase-ascii_upcase" className="item">
            <code>ascii_downcase</code>, <code>ascii_upcase</code>
          </a>
          <a href="#while" className="item"><code>while(cond; update)</code></a>
          <a href="#repeat" className="item"><code>repeat(exp)</code></a>
          <a href="#until" className="item"><code>until(cond; next)</code></a>
          <a href="#recurse" className="item">
            <code>recurse(f)</code>, <code>recurse</code>, <code>recurse(f; condition)</code>
          </a>
          <a href="#walk" className="item"><code>walk(f)</code></a>
          <a href="#$env-env" className="item" style={{display: 'none'}}><code>$ENV</code>, <code>env</code></a>
          <a href="#transpose" className="item"><code>transpose</code></a>
          <a href="#bsearch" className="item"><code>bsearch(x)</code></a>
          <a href="#string-interpolation" className="item">String interpolation: <code>\(exp)</code></a>
          <a href="#convert-to-from-json" className="item">Convert to/from JSON</a>
          <a href="#format-strings-and-escaping" className="item">Format strings and escaping</a>
          <a href="#dates" className="item">Dates</a>
          <a href="#sql-style-operators" className="item" style={ { display: 'none' } }>SQL-Style Operators</a>
          <a href="#builtins" className="item"><code>builtins</code></a>
        </div>
      </div>
      <div className="section">
        <a href="#conditionals-and-comparisons" className="item section-header">Conditionals and Comparisons</a>
        <div className="children section">
          <a href="#==-!=" className="item"><code>==</code>, <code>!=</code></a>
          <a href="#if-then-else-end" className="item">if-then-else-end</a>
          <a href="#>->=-<=-<" className="item">
            <code>&gt;</code>, <code>&gt;=</code>, <code>&lt;=</code>, <code>&lt;</code>
          </a>
          <a href="#and-or-not" className="item"><code>and</code>, <code>or</code>, <code>not</code></a>
          <a href="#alternative-operator" className="item">Alternative operator: <code>//</code></a>
          <a href="#try-catch" className="item">try-catch</a>
          <a href="#breaking-out-of-control-structures" className="item">Breaking out of control structures</a>
          <a href="#error-suppression-optional-operator" className="item">
            Error Suppression / Optional Operator: <code>?</code>
          </a>
        </div>
      </div>
      <div className="section">
        <a href="#regular-expressions" className="item section-header">Regular expressions</a>
        <div className="children section">
          <a href="#test" className="item"><code>test(val)</code>, <code>test(regex; flags)</code></a>
          <a href="#match" className="item"><code>match(val)</code>, <code>match(regex; flags)</code></a>
          <a href="#capture" className="item"><code>capture(val)</code>, <code>capture(regex; flags)</code></a>
          <a href="#scan" className="item"><code>scan(regex)</code>, <code>scan(regex; flags)</code></a>
          <a href="#split-2" className="item"><code>split(regex; flags)</code></a>
          <a href="#splits" className="item"><code>splits(regex)</code>, <code>splits(regex; flags)</code></a>
          <a href="#sub" className="item"><code>sub(regex; tostring)</code>, <code>sub(regex; tostring;
            flags)</code></a>
          <a href="#gsub" className="item">
            <code>gsub(regex; tostring)</code>, <code>gsub(regex; tostring; flags)</code>
          </a>
        </div>
      </div>
      <div className="section">
        <a href="#advanced-features" className="item section-header">Advanced features</a>
        <div className="children section">
          <a href="#variable-symbolic-binding-operator" className="item">
            Variable / Symbolic Binding Operator: <code>... as $identifier | ...</code>
          </a>
          <a href="#destructuring-alternative-operator" className="item">
            Destructuring Alternative Operator: <code>?//</code>
          </a>
          <a href="#defining-functions" className="item">Defining Functions</a>
          <a href="#scoping" className="item">Scoping</a>
          <a href="#isempty" className="item"><code>isempty(exp)</code></a>
          <a href="#limit" className="item"><code>limit(n; exp)</code></a>
          <a href="#first-last-nth-2" className="item">
            <code>first(expr)</code>, <code>last(expr)</code>, <code>nth(n; expr)</code>
          </a>
          <a href="#first-last-nth-1" className="item"><code>first</code>, <code>last</code>, <code>nth(n)</code></a>
          <a href="#reduce" className="item"><code>reduce</code></a>
          <a href="#foreach" className="item"><code>foreach</code></a>
          <a href="#recursion" className="item">Recursion</a>
          <a href="#generators-and-iterators" className="item">Generators and iterators</a>
        </div>
      </div>
      <div className="section">
        <a href="#math" className="item section-header">Math</a>
      </div>
      <div className="section">
        <a href="#assignment" className="item section-header">Assignment</a>
        <div className="children section">
          <a href="#update-assignment" className="item">Update-assignment: <code>|=</code></a>
          <a href="#arithmetic-update-assignment" className="item">
            Arithmetic update-assignment: <code>+=</code>, <code>-=</code>, <code>*=</code>, <code>/=</code>,
            <code>%=</code>, <code>//=</code>
          </a>
          <a href="#plain-assignment" className="item">Plain assignment: <code>=</code></a>
          <a href="#complex-assignments" className="item">Complex assignments</a>
        </div>
      </div>
    </div>
  </div>
);
