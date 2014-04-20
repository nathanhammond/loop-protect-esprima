/* Universal Module Definition */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as a named AMD module.
    define('loopProtect', ['esprima', 'escodegen'], function (esprima, escodegen) {
      return (root.loopProtect = factory(esprima, escodegen));
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory(require('esprima'), require('escodegen'));
  } else {
    // Browser globals
    root.loopProtect = factory(esprima, escodegen);
  }
}(this, function (esprima, escodegen) {
  if (!esprima && !escodegen) { return; }

  /* Utility function. */
  var clone = function(obj) { return JSON.parse(JSON.stringify(obj)); }

  var loopProtect = {
    counters: {},
    method: "loopProtect.protect",
    rewriteLoops: function(code) {
      if (~code.indexOf('// noprotect')) {
        return code;
      } else {
        var ast = esprima.parse(code);
        process(ast);
        return escodegen.generate(ast);
      }
    },
    protect: function(state) {
      this.counters[state.line] = this.counters[state.line] || {};
      var line = this.counters[state.line];
      var now = (new Date()).getTime();

      if (state.reset) {
        line.time = now;
        line.hit = 0;
        line.last = 0;
      }

      line.hit++;
      if ((now - line.time) > 100) {//} && line.hit !== line.last+1) {
        // We've spent over 100ms on this loop... smells infinite.
        var msg = 'Exiting potential infinite loop at line ' + state.line + '. To disable loop protection: add "// noprotect" to your code';
        console.error(msg);

        // Returning true prevents the loop running again
        return true;
      }
      line.last++;
      return false;
    },
    reset: function() {
      this.counters = {};
    }
  };


  var inline = esprima.parse("while (1) { if ("+loopProtect.method+"({ line: 1 })) { break; } }").body[0].body.body[0];
  function processInline(object, counter) {
    // Save off the counter value.
    var inlinefn = clone(inline);
    inlinefn.test.arguments[0].properties[0].value = { type: 'Literal', value: counter, raw: counter+'' }

    if (object.body.type != "BlockStatement") {
      var cache = object.body
      object.body = {
        type: 'BlockStatement',
        body: []
      }
      object.body.body.push(cache);
    }

    object.body.body.unshift(inlinefn);
  }


  var before = esprima.parse(loopProtect.method + "({ line: 1, reset: true })").body[0];
  function processBefore(object, counter) {
    // Save off the counter value.
    var beforefn = clone(before)
    beforefn.expression.arguments[0].properties[0].value = { type: 'Literal', value: counter, raw: counter+'' }

    // Only three possible places that a loop can appear.
    Array("body", "consequent", "alternate").forEach(function(location) {
      if (!object.parent[location]) { return; }

      // If the loop appears in an array then we simply need to add the prep in front of it.
      if (object.parent[location] instanceof Array) {
        var index = object.parent[location].indexOf(object);
        if (~index) {
          object.parent[location].splice(index,0,beforefn);
        }

      // Alternatively if the loop *is* stored directly at that location
      // we need to do the right thing based upon the type.
      } else if (object.parent[location] == object) {
        switch (object.parent.type) {
          case "IfStatement":
            object.parent[location] = { type: "BlockStatement", body: [beforefn, object] };
          break;
          case "LabeledStatement":
            // Recurse up until we can handle it.
            processBefore(object.parent, counter);
          break;
          default:
            throw new Error("Unknown statement type.");
          break;
        }
      }
    });
  }


  var counter = 0;
  function process(object) {
    // Skip all the things we don't need to process.
    if (!object || !object.type || object.processed) { return; }

    // If it's a loop we need to process it.
    if (~["ForStatement", "ForInStatement", "WhileStatement", "DoWhileStatement"].indexOf(object.type)) {
      // Only count the loops.
      counter++;

      processInline(object, counter);
      processBefore(object, counter);

      object.processed = true;
    }

    // Continue traversal.
    for (var x in object) {
      if (!object[x]) { continue; }
      if (x == "parent") { continue; }
      if (typeof object[x] != "object") { continue; }

      if (object[x] instanceof Array) {
        object[x].forEach(function(item) {
          if (item && item.type) {
            item.parent = object;
          }
        });
        object[x].forEach(process);
      } else {
        object[x].parent = object;
        process(object[x]);
      }
    }
  }

  return loopProtect;

}));
