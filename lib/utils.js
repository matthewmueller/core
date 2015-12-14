
'use strict';

let path = require('path');

const pwd = process.cwd();


exports.relative = abs => path.relative(pwd, abs);
