class CheckerCategoryInfo {
  constructor(public name: string, public description: string) {
  }
}


const checkerCategories: Map<string, CheckerCategoryInfo> = new Map<string, CheckerCategoryInfo>([
    [
      'core',
      {
        name: 'Core Checkers',
        description: 'Core Checkers model core language features and perform general-purpose checks such as division by zero, null ' +
          'pointer dereference, usage of uninitialized values, etc.'
      }
    ],
    [
      'alpha.core',
      {
        name: 'Core Alpha Checkers',
        description: ''
      }
    ],
    [
      'cplusplus',
      {
        name: 'C++ Checkers',
        description: 'C++ Checkers perform C++-specific checks.'
      }
    ],
    [
      'alpha.cplusplus',
      {
        name: 'C++ Alpha Checkers',
        description: ''
      }
    ],
    [
      'deadcode',
      {
        name: 'Dead Code Checkers',
        description: 'Dead Code Checkers check for unused code.'
      }
    ],
    [
      'alpha.deadcode',
      {
        name: 'Dead Code Alpha Checkers',
        description: '',
      }
    ],
    [
      'nullability',
      {
        name: 'Nullability Checkers',
        description: ''
      }
    ],
    [
      'alpha.nullability',
      {
        name: 'Nullability Alpha Checkers',
        description: ''
      }
    ],
    [
      'optin',
      {
        name: 'Optin Checkers',
        description: ''
      }
    ],
    [
      'osx',
      {
        name: 'OS X Checkers',
        description: 'OS X Checkers perform Objective-C-specific checks and check the use of Apple\'s SDKs (OS X and iOS).'
      }
    ],
    [
      'alpha.osx',
      {
        name: 'OS X Alpha Checkers',
        description: ''
      }
    ],
    [
      'security',
      {
        name: 'Security Checkers',
        description: 'Security Checkers check for insecure API usage and perform checks based on the CERT Secure Coding Standards.'
      }
    ],
    [
      'alpha.security',
      {
        name: 'Security Alpha Checkers',
        description: ''
      }
    ],
    [
      'unix',
      {
        name: 'Unix Checkers',
        description: 'Unix Checkers check the use of Unix and POSIX APIs.'
      }
    ],
    [
      'alpha.unix',
      {
        name: 'Unix Alpha Checkers',
        description: ''
      }
    ],
    [
      'clone',
      {
        name: 'Clone Checkers',
        description: ''
      }
    ],
    [
      'alpha.clone',
      {
        name: 'Clone Alpha Checkers',
        description: ''
      }
    ],
    [
      'valist',
      {
        name: 'Variable Argument Checkers',
        description: ''
      }
    ],
    [
      'alpha.valist',
      {
        name: 'Variable Argument Alpha Checkers',
        description: ''
      }
    ],
    [
      'debug',
      {
        name: 'Debugging Checkers',
        description: ''
      }
    ],
    [
      'ci',
      {
        name: 'CI Checkers',
        description: ''
      }
    ],
    [
      'demo',
      {
        name: 'Demo Checkers',
        description: ''
      }
    ],
    [
      'llvm',
      {
        name: 'LLVM Checkers',
        description: ''
      }
    ],
    [
      'apiModeling',
      {
        name: 'API Modeling Checkers',
        description: ''
      }
    ]
  ]
);


export class Checker {
  name: string;
  description: string;
  enabled: boolean;
  defaultEnabled: boolean;

  constructor(checkerInfo: string[]) {
    if (checkerInfo[0].startsWith('+')) {
      const splits = checkerInfo[0].split(/\s/);
      this.defaultEnabled = true;
      this.name = splits[1];
    } else {
      this.defaultEnabled = false;
      this.name = checkerInfo[0];
    }
    this.enabled = this.defaultEnabled;
  }
}


export class CheckerCategory {
  _allEnabled = false;

  constructor(public tag: string, public info: CheckerCategoryInfo, public checkers: Checker[]) {
  }

  set allEnabled(enabled: boolean) {
    if (enabled) {
      this.checkers.map(checker => {
        checker.enabled = true;
        return checker;
      });
    } else {
      this.checkers.map(checker => {
        checker.enabled = false;
        return checker;
      });
    }
    this._allEnabled = enabled;
  }

  get allEnabled() {
    return this._allEnabled;
  }
}


export class Checkers {
  default: CheckerCategory[];
  alpha: CheckerCategory[];

  constructor(checkersInfo: string) {
    this.default = [];
    this.alpha = [];
    this.buildCheckerCategories(checkersInfo);
  }

  private static _enableCategory(tag: string, enable: boolean, categories: CheckerCategory[]): CheckerCategory[] {
    for (const category of categories) {
      if (category.tag === tag) {
        category.allEnabled = enable;
      }
    }

    return categories;
  }

  private static _enableChecker(name: string, enable: boolean, categories: CheckerCategory[]): CheckerCategory[] {
    for (const category of categories) {
      if (name.startsWith(category.tag)) {
        for (const checker of category.checkers) {
          if (checker.name === name) {
            checker.enabled = enable;
          }
        }
      }
    }
    return categories;
  }


  /**
   * Determines the category tag from the checker cmd-line argument
   * @param {string} argument
   * @returns {string}
   */

  static getCategoryTag(argument: string): string {
    let tag: string;
    const tags = argument.split('.').slice(0, 2);
    if (tags[0] === 'alpha') {
      tag = tags.join('.');
    } else {
      tag = tags[0];
    }

    return tag;
  }

  /**
   * Group checkers into categories according to argument tags, e.g. 'core', 'alpha.core',...
   * @param checkersInfo
   */

  buildCheckerCategories(checkersInfo: string) {
    const categories = {};

    const checkerList = this.buildCheckerList(checkersInfo);
    checkerList.forEach( checker => {
      const tag = Checkers.getCategoryTag(checker.name);

      categories[tag] = categories[tag] || [];
      categories[tag].push(checker);
    });

    Object.keys(categories).forEach(
      tag => {
        const category = new CheckerCategory(tag, checkerCategories.get(tag), categories[tag]);

        if (tag.startsWith('alpha')) {
          this.alpha.push(category);
        } else {
          this.default.push(category);
        }
      });
  }

  /**
   * Build list of checkers from info string (--help-checkers-verbose)
   * @param checkersInfo
   * @returns {Checker[]}
   */
  buildCheckerList(checkersInfo: string): Checker[] {
    const checkerList: Checker[] = [];
    let currentChecker: Checker = null;

    const noNewLines = checkersInfo.replace(/\n{2,}/, '\n').split('\n');
    noNewLines.splice(0, 3);
    noNewLines.splice(noNewLines.length - 5, 5);
    const noMultiWs = noNewLines.map(line => line.trim().split(/\s{2,}/));

    noMultiWs.forEach( line => {
      // Checker argument and description on same line
      if (line.length === 2) {
        const checker = new Checker(line);
        checker.description = line[1];
        checkerList.push(checker);

        // Checker argument and description seperated in multiple lines
      } else {
        // New checker argument ...
        if (!currentChecker) {
          currentChecker = new Checker(line);
          // following argument description ...
        } else {
          currentChecker.description = line[0];
          checkerList.push(currentChecker);
          currentChecker = null;
        }
      }
    });

    return checkerList;
  }

  /**
   * Return list of Checkers
   * @returns {Checker[]}
   */
  getCheckers(): Checker[] {
    const checkers: Checker[] = [];
    this.default.forEach(category => {
      category.checkers.forEach(checker => {
        checkers.push(checker);
      });
    });
    this.alpha.forEach(category => {
      category.checkers.forEach(checker => {
        checkers.push(checker);
      });
    });
    return checkers;
  }

  /**
   * Return Cmd-Line arguments to enable/disable selected checkers for ci-vulnscan.
   * @returns {string}
   */
  getCmdLineArguments(): string[] {
    const enableCheckers = [];
    const disableCheckers = [];

    this.getCheckers().forEach(checker => {
      if (checker.enabled && !checker.defaultEnabled) {
        enableCheckers.push('--enable-checker', checker.name);
      } else if (!checker.enabled && checker.defaultEnabled) {
        disableCheckers.push('--disable-checker', checker.name);
      }
    });

    return enableCheckers.concat(disableCheckers);
  }

  enableCategory(tag: string, enable: boolean) {
    if (tag.startsWith('alpha')) {
      this.alpha = Checkers._enableCategory(tag, enable, this.alpha);
    } else {
      this.default = Checkers._enableCategory(tag, enable, this.default);
    }
  }

  enableChecker(name: string, enable: boolean) {
    if (name.startsWith('alpha')) {
      this.alpha = Checkers._enableChecker(name, enable, this.alpha);
    } else {
      this.default = Checkers._enableChecker(name, enable, this.default);
    }
  }
}

