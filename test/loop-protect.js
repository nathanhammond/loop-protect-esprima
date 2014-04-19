var loopProtect = require('../loop-protect');

var code = {
  stupid: 'while(1);',
  simple: 'return "remy";',
  simplefor: 'var mul = 1; for (var i = 0; i < 10; i++) {\nmul = i;\n}\nreturn i',
  simplefor2: 'for (var i = 0; i < 10; i++) {\nmul = i;\n}\nreturn i',
  onelinefor: 'var i = 0, j = 0;\nfor (; i < 10; i++) j = i * 10;\nreturn i;',
  onelinefor2: 'var i=0;\nfor(i=0; i<10; ++i){ break; }\nreturn i;',
  simplewhile: 'var i = 0; while (i < 100) {\ni += 10;\n}\nreturn i;',
  onelinewhile: 'var i = 0; while (i < 100) i += 10;\nreturn i;',
  onelinewhile2: 'function noop(){}; while (1) noop("Ha.");',
  whiletrue: 'var i = 0;\nwhile(true) {\ni++;\n}\nreturn true;',
  irl1: 'var nums = [0,1];\n var total = 8;\n for(var i = 0; i <= total; i++){\n var newest = nums[i--]\n nums.push(newest);\n }\n return i;',
  irl2: 'var a = 0;\n for(var j=1;j<=2;j++){\n for(var i=1;i<=60000;i++) {\n a += 1;\n }\n }\n return a;',
  notloops: 'console.log("do");\nconsole.log("while");\nconsole.log(" foo do bar ");\nconsole.log(" foo while bar ");\nreturn true;',
  notprops: 'var foo = { "do": "bar" }; if (foo["do"] && foo.do) {}\nreturn true;',
  notcomments: 'var foo = {}; // do the awesome-ness!\nreturn true;',
  dirtybraces: 'var a = 0; for(var i=1;i<=10000; i++)\n {\n a += 1;\n }\nreturn a;',
  onelinenewliner: 'var b=0;\n function f(){b+=1;}\n for(var j=1;j<10000; j++)\n f();\nreturn j;',
  brackets: 'var NUM=103, i, sqrt;\nfor(i=2; i<=Math.sqrt(NUM); i+=1){\n if(NUM % i === 0){\n  console.log(NUM + " can be divided by " + i + ".");\n  break;\n }\n}\nreturn i;',
  lotolines: 'var LIMIT = 10;\nvar num, lastNum, tmp;\nfor(num = 1, lastNum = 0;\n  num < LIMIT;\n  lastNum = num, num = tmp){\n\n    tmp = num + lastNum;\n}\nreturn lastNum;',
  ignorecomments: '\n/**\n * This function handles the click for every button.\n *\n * Using the same function reduces code duplication and makes the\n */\nreturn true;',
  dowhile: 'var x=0;\ndo\n {\n x++;\n } while (x < 3);\nreturn x;',
  dowhilenested: 'var x=0;\n do\n {\n x++;\n var b = 0;\n do {\n b++; \n } while (b < 3);\n } while (x < 3);\nreturn x;',
  disabled: '// noprotect\nvar x=0;\ndo\n {\n x++;\n } while (x < 3);\nreturn x;',
  continues: 'var n = 0,\n i = 0,\n j = 0;\n \n outside:\n for (i; i < 10; i += 1) {\n for (j; j < 10; j += 1) {\n if (i === 5 && j === 5) {\n continue outside;\n }\n n += 1;\n }\n }\n \n return n;\n;',
  labelWithComment: 'label:\n// here be a label\n/*\n and there\'s some good examples in the loop - poop\n*/\nfor (var i = 0; i < 10; i++) {\n}\nreturn i;',
  continues2: 'var x = 0;\nLABEL1: do {\n  x = x + 2;\n  if (x < 100) break LABEL1;\n  if (x < 100) continue LABEL1;\n} \nwhile(0);\n\nreturn x;',
  onelineforinline: 'function init() {\n  for (var i=0;i<2;i++) (function(n) {\nconsole.log(i)})(i);\n}return true;',
  notlabels: 'var foo = {\n bar: 1\n };\n \n function doit(i){}\n \n for (var i=0; i<10; i++) {\n doit(i);\n }\n return i;',
  notlabels2: '// Weird:\nfor (var i = 0; i < 10; i++) {}\nreturn i;',
  cs: 'var bar, foo;\n\nfoo = function(i) {\n  return {\n    id: i\n  };\n};\n\nbar = function(i) {\n\n  var j, _i, _results;\n\n  _results = [];\n  for (j = _i = 1; 1 <= i ? _i < i : _i > i; j = 1 <= i ? ++_i : --_i) {\n    _results.push(j);\n  }\n  return _results;\n};',
  switchtest1: 'var a; switch (a) { case "something": while(1); break; default: while(1); break; }',
  switchtest2: 'var a; switch (a) { case "something": while(1); default: while(1); break; }',
  trytest: 'try { while(1); } catch (e) { while(1); }',
  expressions1: 'if(true) { while(1); }',
  expressions2: 'if(true) while(1);',
  expressions3: 'if(true) { while(1); } else { while(1); }',
  expressions4: 'if(true) { while(1); } else while(1);',
  expressions5: 'if(true) { while(1) true; }',
  expressions6: 'if(true) thing1: thing2: while(1);',
  expressions7: 'while(1) asdf: fdsa: true;'
};

for (var x in code) {
  code[x] = "function a() {\n" + code[x] + "\n}";
  eval(loopProtect.rewriteLoops(code[x]));
  a();
}
