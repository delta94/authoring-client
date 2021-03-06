// Generated by BUCKLESCRIPT, PLEASE EDIT WITH CARE
'use strict';

var Char = require("bs-platform/lib/js/char.js");
var List = require("bs-platform/lib/js/list.js");
var Curry = require("bs-platform/lib/js/curry.js");
var $$String = require("bs-platform/lib/js/string.js");
var Caml_string = require("bs-platform/lib/js/caml_string.js");

function findIndex(_$staropt$star, str, cb) {
  while(true) {
    var $staropt$star = _$staropt$star;
    var start = $staropt$star !== undefined ? $staropt$star : 0;
    if (start >= str.length) {
      return ;
    } else if (Curry._1(cb, Caml_string.get(str, start))) {
      return start;
    } else {
      _$staropt$star = start + 1 | 0;
      continue ;
    }
  };
}

function toList(str) {
  var charList = /* record */[/* contents : [] */0];
  $$String.iter((function (c) {
          charList[0] = List.append(charList[0], /* :: */[
                c,
                /* [] */0
              ]);
          return /* () */0;
        }), str);
  return charList[0];
}

function fromList(charList) {
  return List.fold_left((function (acc, c) {
                return acc + Char.escaped(c);
              }), "", charList);
}

function remove(str, index, count) {
  var i = /* record */[/* contents */0];
  return fromList(List.filter((function (param) {
                      if (i[0] >= index && i[0] < (index + count | 0)) {
                        i[0] = i[0] + 1 | 0;
                        return false;
                      } else {
                        i[0] = i[0] + 1 | 0;
                        return true;
                      }
                    }))(toList(str)));
}

function removeAll(str, find) {
  return fromList(List.filter((function (c) {
                      return c !== find;
                    }))(toList(str)));
}

function substr(str, start, count) {
  var i = /* record */[/* contents */0];
  return fromList(List.filter((function (_c) {
                      if (i[0] >= start && i[0] < (start + count | 0)) {
                        i[0] = i[0] + 1 | 0;
                        return true;
                      } else {
                        i[0] = i[0] + 1 | 0;
                        return false;
                      }
                    }))(toList(str)));
}

exports.findIndex = findIndex;
exports.toList = toList;
exports.fromList = fromList;
exports.remove = remove;
exports.removeAll = removeAll;
exports.substr = substr;
/* No side effect */
