import prisma from "../../../../config/prismaClient";
import { Usuario } from "@prisma/client";
import { QueryError } from "../../../../errors/QueryError";
import { hash } from "bcrypt";
import { InvalidParamError } from "../../../../errors/InvalidParamError";
import crypto from 'crypto';
import { enviaEmail } from "../../../../utils/functions/enviaEmail";
import { deleteObject } from "../../../../utils/functions/aws";

class UsuarioService {

    async encryptPassword(password: string) {
        const saltRounds = 10;
        return await hash(password, saltRounds);
    }

    async criar(body: Usuario, foto: Express.Multer.File) {

        if(await prisma.usuario.findUnique({ where: { email: body.email } })) {
            throw new QueryError('Email já cadastrado.');
        }

        body.senha = await this.encryptPassword(body.senha);

        const novoUsuario = await prisma.usuario.create({
            data: { 
                nome: body.nome,
                email: body.email,
                senha: body.senha,
                tipo: body.tipo,
                foto: (foto as Express.MulterS3.File)?.location,
                chaveAws: (foto as Express.MulterS3.File)?.key,
            }
        });
        return novoUsuario;
    }

    async getUsuario(id: number) {
        const usuario = await prisma.usuario.findUnique({
            where: { id: id }
        });
        return usuario;
    }

    async getListaUsuarios() {
        const usuarios = await prisma.usuario.findMany();
        return usuarios;
    }

    async updateUsuario(body: Usuario, usuarioLogado: Usuario, foto: Express.Multer.File | Express.MulterS3.File) {

        const findUser = await prisma.usuario.findUnique({
            where: { id: usuarioLogado.id }
        });

        if(body.senha) {
            body.senha = await this.encryptPassword(body.senha);
        }
        if (foto) {
            deleteObject(findUser?.chaveAws!);
            body.foto = (foto as Express.MulterS3.File).location;
            body.chaveAws = (foto as Express.MulterS3.File).key;
        } else {
            body.foto = findUser?.foto || null;
            body.chaveAws = findUser?.chaveAws || null;
        }
  
        const usuario = await prisma.usuario.update({
            where: { id: usuarioLogado.id },
            data: body
        });
        return usuario;
    }

    async deleteUsuario(usuarioLogado: Usuario) {


        const usuario = await prisma.usuario.delete({
            where: { id: usuarioLogado.id }
        });
        return usuario;
    }

    async updatePassword(password: string, id: number) {
        const newPass = await this.encryptPassword(password);

        await prisma.usuario.update({
            where: {
                id: id,
            },
            data: {
                senha: newPass,
            },
        });

        return;
    }

    async validateToken(email: string, token: string, password: string) {
        
        const user = await prisma.usuario.findFirst({where: {email: email}});
        const timeNow = new Date();

        if ((user?.tokenRecPass != token) || (user.dateRecPass != null && timeNow > user.dateRecPass)) {
            throw new InvalidParamError('Token Inválido, verifique seus dados e tente novamente!');
        }

        await this.updatePassword(password, user.id);
        return;
    }

    async createToken(email: string) {
        const user = await prisma.usuario.findFirst({ 
            where: {
                email: email
            }
        });

        if (user == null) {
            throw new QueryError('E-mail para recuperação de senha inválido.');
        }

        const token: string = crypto.randomBytes(3).toString('hex');
        const date = new Date();
        date.setHours(date.getHours() + 1);

        await prisma.usuario.update({
            where: {
                email: email,
            },
            data: {
                tokenRecPass: token,
                dateRecPass: date,
            }
        });

        await enviaEmail(email, token, 'Recuperação de Senha', 'Aqui está o seu código para recuperação de senha! Lembre-se de não compartilhar esse código com ninguém.');
    }

}


export default new UsuarioService();


function returnFalse() {
    return false;
  }
  function returnTrue() {
    return true;
  }
  function returnUndefined() {
    return void 0;
  }
  function identity(x) {
    return x;
  }
  function toLowerCase(x) {
    return x.toLowerCase();
  }
  var fileNameLowerCaseRegExp = /[^\u0130\u0131\u00DFa-z0-9\\/:\-_. ]+/g;
  function toFileNameLowerCase(x) {
    return fileNameLowerCaseRegExp.test(x) ? x.replace(fileNameLowerCaseRegExp, toLowerCase) : x;
  }
  function notImplemented() {
    throw new Error("Not implemented");
  }
  function memoize(callback) {
    let value;
    return () => {
      if (callback) {
        value = callback();
        callback = void 0;
      }
      return value;
    };
  }
  function memoizeOne(callback) {
    const map2 = /* @__PURE__ */ new Map();
    return (arg) => {
      const key = `${typeof arg}:${arg}`;
      let value = map2.get(key);
      if (value === void 0 && !map2.has(key)) {
        value = callback(arg);
        map2.set(key, value);
      }
      return value;
    };
  }
  function equateValues(a, b) {
    return a === b;
  }
  function equateStringsCaseInsensitive(a, b) {
    return a === b || a !== void 0 && b !== void 0 && a.toUpperCase() === b.toUpperCase();
  }
  function equateStringsCaseSensitive(a, b) {
    return equateValues(a, b);
  }
  function compareComparableValues(a, b) {
    return a === b ? 0 /* EqualTo */ : a === void 0 ? -1 /* LessThan */ : b === void 0 ? 1 /* GreaterThan */ : a < b ? -1 /* LessThan */ : 1 /* GreaterThan */;
  }
  function compareValues(a, b) {
    return compareComparableValues(a, b);
  }
  function min(items, compare) {
    return reduceLeft(items, (x, y) => compare(x, y) === -1 /* LessThan */ ? x : y);
  }
  function compareStringsCaseInsensitive(a, b) {
    if (a === b)
      return 0 /* EqualTo */;
    if (a === void 0)
      return -1 /* LessThan */;
    if (b === void 0)
      return 1 /* GreaterThan */;
    a = a.toUpperCase();
    b = b.toUpperCase();
    return a < b ? -1 /* LessThan */ : a > b ? 1 /* GreaterThan */ : 0 /* EqualTo */;
  }
  function compareStringsCaseSensitive(a, b) {
    return compareComparableValues(a, b);
  }
  function getStringComparer(ignoreCase) {
    return ignoreCase ? compareStringsCaseInsensitive : compareStringsCaseSensitive;
  }
  var uiComparerCaseSensitive;
  var uiLocale;
  function setUILocale(value) {
    if (uiLocale !== value) {
      uiLocale = value;
      uiComparerCaseSensitive = void 0;
    }
  }
  function compareBooleans(a, b) {
    return compareValues(a ? 1 : 0, b ? 1 : 0);
  }
  function getSpellingSuggestion(name, candidates, getName) {
    const maximumLengthDifference = Math.max(2, Math.floor(name.length * 0.34));
    let bestDistance = Math.floor(name.length * 0.4) + 1;
    let bestCandidate;
    for (const candidate of candidates) {
      const candidateName = getName(candidate);
      if (candidateName !== void 0 && Math.abs(candidateName.length - name.length) <= maximumLengthDifference) {
        if (candidateName === name) {
          continue;
        }
        if (candidateName.length < 3 && candidateName.toLowerCase() !== name.toLowerCase()) {
          continue;
        }
        const distance = levenshteinWithMax(name, candidateName, bestDistance - 0.1);
        if (distance === void 0) {
          continue;
        }
        Debug.assert(distance < bestDistance);
        bestDistance = distance;
        bestCandidate = candidate;
      }
    }
    return bestCandidate;
  }
  function levenshteinWithMax(s1, s2, max) {
    let previous = new Array(s2.length + 1);
    let current = new Array(s2.length + 1);
    const big = max + 0.01;
    for (let i = 0; i <= s2.length; i++) {
      previous[i] = i;
    }
    for (let i = 1; i <= s1.length; i++) {
      const c1 = s1.charCodeAt(i - 1);
      const minJ = Math.ceil(i > max ? i - max : 1);
      const maxJ = Math.floor(s2.length > max + i ? max + i : s2.length);
      current[0] = i;
      let colMin = i;
      for (let j = 1; j < minJ; j++) {
        current[j] = big;
      }
      for (let j = minJ; j <= maxJ; j++) {
        const substitutionDistance = s1[i - 1].toLowerCase() === s2[j - 1].toLowerCase() ? previous[j - 1] + 0.1 : previous[j - 1] + 2;
        const dist = c1 === s2.charCodeAt(j - 1) ? previous[j - 1] : Math.min(
          /*delete*/
          previous[j] + 1,
          /*insert*/
          current[j - 1] + 1,
          /*substitute*/
          substitutionDistance
        );
        current[j] = dist;
        colMin = Math.min(colMin, dist);
      }
      for (let j = maxJ + 1; j <= s2.length; j++) {
        current[j] = big;
      }
      if (colMin > max) {
        return void 0;
      }
      const temp = previous;
      previous = current;
      current = temp;
    }
    const res = previous[s2.length];
    return res > max ? void 0 : res;
  }
  function endsWith(str, suffix, ignoreCase) {
    const expectedPos = str.length - suffix.length;
    return expectedPos >= 0 && (ignoreCase ? equateStringsCaseInsensitive(str.slice(expectedPos), suffix) : str.indexOf(suffix, expectedPos) === expectedPos);
  }
  function removeSuffix(str, suffix) {
    return endsWith(str, suffix) ? str.slice(0, str.length - suffix.length) : str;
  }
  function orderedRemoveItem(array, item) {
    for (let i = 0; i < array.length; i++) {
      if (array[i] === item) {
        orderedRemoveItemAt(array, i);
        return true;
      }
    }
    return false;
  }
  function orderedRemoveItemAt(array, index) {
    for (let i = index; i < array.length - 1; i++) {
      array[i] = array[i + 1];
    }
    array.pop();
  }
  function unorderedRemoveItemAt(array, index) {
    array[index] = array[array.length - 1];
    array.pop();
  }
  function unorderedRemoveItem(array, item) {
    return unorderedRemoveFirstItemWhere(array, (element) => element === item);
  }
  function unorderedRemoveFirstItemWhere(array, predicate) {
    for (let i = 0; i < array.length; i++) {
      if (predicate(array[i])) {
        unorderedRemoveItemAt(array, i);
        return true;
      }
    }
    return false;
  }
  function createGetCanonicalFileName(useCaseSensitiveFileNames2) {
    return useCaseSensitiveFileNames2 ? identity : toFileNameLowerCase;
  }
  function patternText({ prefix, suffix }) {
    return `${prefix}*${suffix}`;
  }
  function matchedText(pattern, candidate) {
    Debug.assert(isPatternMatch(pattern, candidate));
    return candidate.substring(pattern.prefix.length, candidate.length - pattern.suffix.length);
  }
  function findBestPatternMatch(values, getPattern, candidate) {
    let matchedValue;
    let longestMatchPrefixLength = -1;
    for (const v of values) {
      const pattern = getPattern(v);
      if (isPatternMatch(pattern, candidate) && pattern.prefix.length > longestMatchPrefixLength) {
        longestMatchPrefixLength = pattern.prefix.length;
        matchedValue = v;
      }
    }
    return matchedValue;
  }
  function startsWith(str, prefix, ignoreCase) {
    return ignoreCase ? equateStringsCaseInsensitive(str.slice(0, prefix.length), prefix) : str.lastIndexOf(prefix, 0) === 0;
  }
  function removePrefix(str, prefix) {
    return startsWith(str, prefix) ? str.substr(prefix.length) : str;
  }
  function isPatternMatch({ prefix, suffix }, candidate) {
    return candidate.length >= prefix.length + suffix.length && startsWith(candidate, prefix) && endsWith(candidate, suffix);
  }
  function and(f, g) {
    return (arg) => f(arg) && g(arg);
  }
  function or(...fs) {
    return (...args) => {
      let lastResult;
      for (const f of fs) {
        lastResult = f(...args);
        if (lastResult) {
          return lastResult;
        }
      }
      return lastResult;
    };
  }
  function not(fn) {
    return (...args) => !fn(...args);
  }
  function assertType(_) {
  }
  function singleElementArray(t) {
    return t === void 0 ? void 0 : [t];
  }
  function enumerateInsertsAndDeletes(newItems, oldItems, comparer, inserted, deleted, unchanged) {
    unchanged = unchanged || noop;
    let newIndex = 0;
    let oldIndex = 0;
    const newLen = newItems.length;
    const oldLen = oldItems.length;
    let hasChanges = false;
    while (newIndex < newLen && oldIndex < oldLen) {
      const newItem = newItems[newIndex];
      const oldItem = oldItems[oldIndex];
      const compareResult = comparer(newItem, oldItem);
      if (compareResult === -1 /* LessThan */) {
        inserted(newItem);
        newIndex++;
        hasChanges = true;
      } else if (compareResult === 1 /* GreaterThan */) {
        deleted(oldItem);
        oldIndex++;
        hasChanges = true;
      } else {
        unchanged(oldItem, newItem);
        newIndex++;
        oldIndex++;
      }
    }
    while (newIndex < newLen) {
      inserted(newItems[newIndex++]);
      hasChanges = true;
    }
    while (oldIndex < oldLen) {
      deleted(oldItems[oldIndex++]);
      hasChanges = true;
    }
    return hasChanges;
  }
  function cartesianProduct(arrays) {
    const result = [];
    cartesianProductWorker(
      arrays,
      result,
      /*outer*/
      void 0,
      0
    );
    return result;
  }
  function cartesianProductWorker(arrays, result, outer, index) {
    for (const element of arrays[index]) {
      let inner;
      if (outer) {
        inner = outer.slice();
        inner.push(element);
      } else {
        inner = [element];
      }
      if (index === arrays.length - 1) {
        result.push(inner);
      } else {
        cartesianProductWorker(arrays, result, inner, index + 1);
      }
    }
  }
  function takeWhile(array, predicate) {
    if (array) {
      const len = array.length;
      let index = 0;
      while (index < len && predicate(array[index])) {
        index++;
      }
      return array.slice(0, index);
    }
  }
  function skipWhile(array, predicate) {
    if (array) {
      const len = array.length;
      let index = 0;
      while (index < len && predicate(array[index])) {
        index++;
      }
      return array.slice(index);
    }
  }
  function isNodeLikeSystem() {
    return typeof process !== "undefined" && !!process.nextTick && !process.browser && typeof module === "object";
  }
  
  // src/compiler/debug.ts
  var Debug;
  ((Debug2) => {
    let currentAssertionLevel = 0 /* None */;
    Debug2.currentLogLevel = 2 /* Warning */;
    Debug2.isDebugging = false;
    function shouldLog(level) {
      return Debug2.currentLogLevel <= level;
    }
    Debug2.shouldLog = shouldLog;
    function logMessage(level, s) {
      if (Debug2.loggingHost && shouldLog(level)) {
        Debug2.loggingHost.log(level, s);
      }
    }
    function log(s) {
      logMessage(3 /* Info */, s);
    }
    Debug2.log = log;
    ((_log) => {
      function error(s) {
        logMessage(1 /* Error */, s);
      }
      _log.error = error;
      function warn(s) {
        logMessage(2 /* Warning */, s);
      }
      _log.warn = warn;
      function log2(s) {
        logMessage(3 /* Info */, s);
      }
      _log.log = log2;
      function trace2(s) {
        logMessage(4 /* Verbose */, s);
      }
      _log.trace = trace2;
    })(log = Debug2.log || (Debug2.log = {}));
    const assertionCache = {};
    function getAssertionLevel() {
      return currentAssertionLevel;
    }
    Debug2.getAssertionLevel = getAssertionLevel;
    function setAssertionLevel(level) {
      const prevAssertionLevel = currentAssertionLevel;
      currentAssertionLevel = level;
      if (level > prevAssertionLevel) {
        for (const key of getOwnKeys(assertionCache)) {
          const cachedFunc = assertionCache[key];
          if (cachedFunc !== void 0 && Debug2[key] !== cachedFunc.assertion && level >= cachedFunc.level) {
            Debug2[key] = cachedFunc;
            assertionCache[key] = void 0;
          }
        }
      }
    }
    Debug2.setAssertionLevel = setAssertionLevel;
    function shouldAssert(level) {
      return currentAssertionLevel >= level;
    }
    Debug2.shouldAssert = shouldAssert;
    function shouldAssertFunction(level, name) {
      if (!shouldAssert(level)) {
        assertionCache[name] = { level, assertion: Debug2[name] };
        Debug2[name] = noop;
        return false;
      }
      return true;
    }
    function fail(message, stackCrawlMark) {
      debugger;
      const e = new Error(message ? `Debug Failure. ${message}` : "Debug Failure.");
      if (Error.captureStackTrace) {
        Error.captureStackTrace(e, stackCrawlMark || fail);
      }
      throw e;
    }
    Debug2.fail = fail;
    function failBadSyntaxKind(node, message, stackCrawlMark) {
      return fail(
        `${message || "Unexpected node."}\r
  Node ${formatSyntaxKind(node.kind)} was unexpected.`,
        stackCrawlMark || failBadSyntaxKind
      );
    }
    Debug2.failBadSyntaxKind = failBadSyntaxKind;
    function assert(expression, message, verboseDebugInfo, stackCrawlMark) {
      if (!expression) {
        message = message ? `False expression: ${message}` : "False expression.";
        if (verboseDebugInfo) {
          message += "\r\nVerbose Debug Information: " + (typeof verboseDebugInfo === "string" ? verboseDebugInfo : verboseDebugInfo());
        }
        fail(message, stackCrawlMark || assert);
      }
    }
    Debug2.assert = assert;
    function assertEqual(a, b, msg, msg2, stackCrawlMark) {
      if (a !== b) {
        const message = msg ? msg2 ? `${msg} ${msg2}` : msg : "";
        fail(`Expected ${a} === ${b}. ${message}`, stackCrawlMark || assertEqual);
      }
    }
    Debug2.assertEqual = assertEqual;
    function assertLessThan(a, b, msg, stackCrawlMark) {
      if (a >= b) {
        fail(`Expected ${a} < ${b}. ${msg || ""}`, stackCrawlMark || assertLessThan);
      }
    }
    Debug2.assertLessThan = assertLessThan;
    function assertLessThanOrEqual(a, b, stackCrawlMark) {
      if (a > b) {
        fail(`Expected ${a} <= ${b}`, stackCrawlMark || assertLessThanOrEqual);
      }
    }
    Debug2.assertLessThanOrEqual = assertLessThanOrEqual;
    function assertGreaterThanOrEqual(a, b, stackCrawlMark) {
      if (a < b) {
        fail(`Expected ${a} >= ${b}`, stackCrawlMark || assertGreaterThanOrEqual);
      }
    }
    Debug2.assertGreaterThanOrEqual = assertGreaterThanOrEqual;
    function assertIsDefined(value, message, stackCrawlMark) {
      if (value === void 0 || value === null) {
        fail(message, stackCrawlMark || assertIsDefined);
      }
    }
    Debug2.assertIsDefined = assertIsDefined;
    function checkDefined(value, message, stackCrawlMark) {
      assertIsDefined(value, message, stackCrawlMark || checkDefined);
      return value;
    }
    Debug2.checkDefined = checkDefined;
    function assertEachIsDefined(value, message, stackCrawlMark) {
      for (const v of value) {
        assertIsDefined(v, message, stackCrawlMark || assertEachIsDefined);
      }
    }
    Debug2.assertEachIsDefined = assertEachIsDefined;
    function checkEachDefined(value, message, stackCrawlMark) {
      assertEachIsDefined(value, message, stackCrawlMark || checkEachDefined);
      return value;
    }
    Debug2.checkEachDefined = checkEachDefined;
    function assertNever(member, message = "Illegal value:", stackCrawlMark) {
      const detail = typeof member === "object" && hasProperty(member, "kind") && hasProperty(member, "pos") ? "SyntaxKind: " + formatSyntaxKind(member.kind) : JSON.stringify(member);
      return fail(`${message} ${detail}`, stackCrawlMark || assertNever);
    }
    Debug2.assertNever = assertNever;
    function assertEachNode(nodes, test, message, stackCrawlMark) {
      if (shouldAssertFunction(1 /* Normal */, "assertEachNode")) {
        assert(
          test === void 0 || every(nodes, test),
          message || "Unexpected node.",
          () => `Node array did not pass test '${getFunctionName(test)}'.`,
          stackCrawlMark || assertEachNode
        );
      }
    }
    Debug2.assertEachNode = assertEachNode;
    function assertNode(node, test, message, stackCrawlMark) {
      if (shouldAssertFunction(1 /* Normal */, "assertNode")) {
        assert(
          node !== void 0 && (test === void 0 || test(node)),
          message || "Unexpected node.",
          () => `Node ${formatSyntaxKind(node == null ? void 0 : node.kind)} did not pass test '${getFunctionName(test)}'.`,
          stackCrawlMark || assertNode
        );
      }
    }
    Debug2.assertNode = assertNode;
    function assertNotNode(node, test, message, stackCrawlMark) {
      if (shouldAssertFunction(1 /* Normal */, "assertNotNode")) {
        assert(
          node === void 0 || test === void 0 || !test(node),
          message || "Unexpected node.",
          () => `Node ${formatSyntaxKind(node.kind)} should not have passed test '${getFunctionName(test)}'.`,
          stackCrawlMark || assertNotNode
        );
      }
    }
    Debug2.assertNotNode = assertNotNode;
    function assertOptionalNode(node, test, message, stackCrawlMark) {
      if (shouldAssertFunction(1 /* Normal */, "assertOptionalNode")) {
        assert(
          test === void 0 || node === void 0 || test(node),
          message || "Unexpected node.",
          () => `Node ${formatSyntaxKind(node == null ? void 0 : node.kind)} did not pass test '${getFunctionName(test)}'.`,
          stackCrawlMark || assertOptionalNode
        );
      }
    }
    Debug2.assertOptionalNode = assertOptionalNode;
    function assertOptionalToken(node, kind, message, stackCrawlMark) {
      if (shouldAssertFunction(1 /* Normal */, "assertOptionalToken")) {
        assert(
          kind === void 0 || node === void 0 || node.kind === kind,
          message || "Unexpected node.",
          () => `Node ${formatSyntaxKind(node == null ? void 0 : node.kind)} was not a '${formatSyntaxKind(kind)}' token.`,
          stackCrawlMark || assertOptionalToken
        );
      }
    }
    Debug2.assertOptionalToken = assertOptionalToken;
    function assertMissingNode(node, message, stackCrawlMark) {
      if (shouldAssertFunction(1 /* Normal */, "assertMissingNode")) {
        assert(
          node === void 0,
          message || "Unexpected node.",
          () => `Node ${formatSyntaxKind(node.kind)} was unexpected'.`,
          stackCrawlMark || assertMissingNode
        );
      }
    }
    Debug2.assertMissingNode = assertMissingNode;
    function type(_value) {
    }
    Debug2.type = type;
    function getFunctionName(func) {
      if (typeof func !== "function") {
        return "";
      } else if (hasProperty(func, "name")) {
        return func.name;
      } else {
        const text = Function.prototype.toString.call(func);
        const match = /^function\s+([\w$]+)\s*\(/.exec(text);
        return match ? match[1] : "";
      }
    }
    Debug2.getFunctionName = getFunctionName;
    function formatSymbol(symbol) {
      return `{ name: ${unescapeLeadingUnderscores(symbol.escapedName)}; flags: ${formatSymbolFlags(symbol.flags)}; declarations: ${map(symbol.declarations, (node) => formatSyntaxKind(node.kind))} }`;
    }
    Debug2.formatSymbol = formatSymbol;
    function formatEnum(value = 0, enumObject, isFlags) {
      const members = getEnumMembers(enumObject);
      if (value === 0) {
        return members.length > 0 && members[0][0] === 0 ? members[0][1] : "0";
      }
      if (isFlags) {
        const result = [];
        let remainingFlags = value;
        for (const [enumValue, enumName] of members) {
          if (enumValue > value) {
            break;
          }
          if (enumValue !== 0 && enumValue & value) {
            result.push(enumName);
            remainingFlags &= ~enumValue;
          }
        }
        if (remainingFlags === 0) {
          return result.join("|");
        }
      } else {
        for (const [enumValue, enumName] of members) {
          if (enumValue === value) {
            return enumName;
          }
        }
      }
      return value.toString();
    }
    Debug2.formatEnum = formatEnum;
    const enumMemberCache = /* @__PURE__ */ new Map();
    function getEnumMembers(enumObject) {
      const existing = enumMemberCache.get(enumObject);
      if (existing) {
        return existing;
      }
      const result = [];
      for (const name in enumObject) {
        const value = enumObject[name];
        if (typeof value === "number") {
          result.push([value, name]);
        }
      }
      const sorted = stableSort(result, (x, y) => compareValues(x[0], y[0]));
      enumMemberCache.set(enumObject, sorted);
      return sorted;
    }
    function formatSyntaxKind(kind) {
      return formatEnum(
        kind,
        SyntaxKind,
        /*isFlags*/
        false
      );
    }
    Debug2.formatSyntaxKind = formatSyntaxKind;
    function formatSnippetKind(kind) {
      return formatEnum(
        kind,
        SnippetKind,
        /*isFlags*/
        false
      );
    }
    Debug2.formatSnippetKind = formatSnippetKind;
    function formatScriptKind(kind) {
      return formatEnum(
        kind,
        ScriptKind,
        /*isFlags*/
        false
      );
    }
    Debug2.formatScriptKind = formatScriptKind;
    function formatNodeFlags(flags) {
      return formatEnum(
        flags,
        NodeFlags,
        /*isFlags*/
        true
      );
    }
    Debug2.formatNodeFlags = formatNodeFlags;
    function formatModifierFlags(flags) {
      return formatEnum(
        flags,
        ModifierFlags,
        /*isFlags*/
        true
      );
    }
    Debug2.formatModifierFlags = formatModifierFlags;
    function formatTransformFlags(flags) {
      return formatEnum(
        flags,
        TransformFlags,
        /*isFlags*/
        true
      );
    }
    Debug2.formatTransformFlags = formatTransformFlags;
    function formatEmitFlags(flags) {
      return formatEnum(
        flags,
        EmitFlags,
        /*isFlags*/
        true
      );
    }
    Debug2.formatEmitFlags = formatEmitFlags;
    function formatSymbolFlags(flags) {
      return formatEnum(
        flags,
        SymbolFlags,
        /*isFlags*/
        true
      );
    }
    Debug2.formatSymbolFlags = formatSymbolFlags;
    function formatTypeFlags(flags) {
      return formatEnum(
        flags,
        TypeFlags,
        /*isFlags*/
        true
      );
    }
    Debug2.formatTypeFlags = formatTypeFlags;
    function formatSignatureFlags(flags) {
      return formatEnum(
        flags,
        SignatureFlags,
        /*isFlags*/
        true
      );
    }
    Debug2.formatSignatureFlags = formatSignatureFlags;
    function formatObjectFlags(flags) {
      return formatEnum(
        flags,
        ObjectFlags,
        /*isFlags*/
        true
      );
    }
    Debug2.formatObjectFlags = formatObjectFlags;
    function formatFlowFlags(flags) {
      return formatEnum(
        flags,
        FlowFlags,
        /*isFlags*/
        true
      );
    }
    Debug2.formatFlowFlags = formatFlowFlags;
    function formatRelationComparisonResult(result) {
      return formatEnum(
        result,
        RelationComparisonResult,
        /*isFlags*/
        true
      );
    }
    Debug2.formatRelationComparisonResult = formatRelationComparisonResult;
    function formatCheckMode(mode) {
      return formatEnum(
        mode,
        CheckMode,
        /*isFlags*/
        true
      );
    }
    Debug2.formatCheckMode = formatCheckMode;
    function formatSignatureCheckMode(mode) {
      return formatEnum(
        mode,
        SignatureCheckMode,
        /*isFlags*/
        true
      );
    }
    Debug2.formatSignatureCheckMode = formatSignatureCheckMode;
    function formatTypeFacts(facts) {
      return formatEnum(
        facts,
        TypeFacts,
        /*isFlags*/
        true
      );
    }
    Debug2.formatTypeFacts = formatTypeFacts;
    let isDebugInfoEnabled = false;
    let flowNodeProto;
    function attachFlowNodeDebugInfoWorker(flowNode) {
      if (!("__debugFlowFlags" in flowNode)) {
        Object.defineProperties(flowNode, {
          // for use with vscode-js-debug's new customDescriptionGenerator in launch.json
          __tsDebuggerDisplay: {
            value() {
              const flowHeader = this.flags & 2 /* Start */ ? "FlowStart" : this.flags & 4 /* BranchLabel */ ? "FlowBranchLabel" : this.flags & 8 /* LoopLabel */ ? "FlowLoopLabel" : this.flags & 16 /* Assignment */ ? "FlowAssignment" : this.flags & 32 /* TrueCondition */ ? "FlowTrueCondition" : this.flags & 64 /* FalseCondition */ ? "FlowFalseCondition" : this.flags & 128 /* SwitchClause */ ? "FlowSwitchClause" : this.flags & 256 /* ArrayMutation */ ? "FlowArrayMutation" : this.flags & 512 /* Call */ ? "FlowCall" : this.flags & 1024 /* ReduceLabel */ ? "FlowReduceLabel" : this.flags & 1 /* Unreachable */ ? "FlowUnreachable" : "UnknownFlow";
              const remainingFlags = this.flags & ~(2048 /* Referenced */ - 1);
              return `${flowHeader}${remainingFlags ? ` (${formatFlowFlags(remainingFlags)})` : ""}`;
            }
          },
          __debugFlowFlags: {
            get() {
              return formatEnum(
                this.flags,
                FlowFlags,
                /*isFlags*/
                true
              );
            }
          },
          __debugToString: {
            value() {
              return formatControlFlowGraph(this);
            }
          }
        });
      }
    }
    function attachFlowNodeDebugInfo(flowNode) {
      if (isDebugInfoEnabled) {
        if (typeof Object.setPrototypeOf === "function") {
          if (!flowNodeProto) {
            flowNodeProto = Object.create(Object.prototype);
            attachFlowNodeDebugInfoWorker(flowNodeProto);
          }
          Object.setPrototypeOf(flowNode, flowNodeProto);
        } else {
          attachFlowNodeDebugInfoWorker(flowNode);
        }
      }
    }
    Debug2.attachFlowNodeDebugInfo = attachFlowNodeDebugInfo;
    let nodeArrayProto;
    function attachNodeArrayDebugInfoWorker(array) {
      if (!("__tsDebuggerDisplay" in array)) {
        Object.defineProperties(array, {
          __tsDebuggerDisplay: {
            value(defaultValue) {
              defaultValue = String(defaultValue).replace(/(?:,[\s\w\d_]+:[^,]+)+\]$/, "]");
              return `NodeArray ${defaultValue}`;
            }
          }
        });
      }
    }
    function attachNodeArrayDebugInfo(array) {
      if (isDebugInfoEnabled) {
        if (typeof Object.setPrototypeOf === "function") {
          if (!nodeArrayProto) {
            nodeArrayProto = Object.create(Array.prototype);
            attachNodeArrayDebugInfoWorker(nodeArrayProto);
          }
          Object.setPrototypeOf(array, nodeArrayProto);
        } else {
          attachNodeArrayDebugInfoWorker(array);
        }
      }
    }
    Debug2.attachNodeArrayDebugInfo = attachNodeArrayDebugInfo;
    function enableDebugInfo() {
      if (isDebugInfoEnabled)
        return;
      const weakTypeTextMap = /* @__PURE__ */ new WeakMap();
      const weakNodeTextMap = /* @__PURE__ */ new WeakMap();
      Object.defineProperties(objectAllocator.getSymbolConstructor().prototype, {
        // for use with vscode-js-debug's new customDescriptionGenerator in launch.json
        __tsDebuggerDisplay: {
          value() {
            const symbolHeader = this.flags & 33554432 /* Transient */ ? "TransientSymbol" : "Symbol";
            const remainingSymbolFlags = this.flags & ~33554432 /* Transient */;
            return `${symbolHeader} '${symbolName(this)}'${remainingSymbolFlags ? ` (${formatSymbolFlags(remainingSymbolFlags)})` : ""}`;
          }
        },
        __debugFlags: {
          get() {
            return formatSymbolFlags(this.flags);
          }
        }
      });
      Object.defineProperties(objectAllocator.getTypeConstructor().prototype, {
        // for use with vscode-js-debug's new customDescriptionGenerator in launch.json
        __tsDebuggerDisplay: {
          value() {
            const typeHeader = this.flags & 67359327 /* Intrinsic */ ? `IntrinsicType ${this.intrinsicName}${this.debugIntrinsicName ? ` (${this.debugIntrinsicName})` : ""}` : this.flags & 98304 /* Nullable */ ? "NullableType" : this.flags & 384 /* StringOrNumberLiteral */ ? `LiteralType ${JSON.stringify(this.value)}` : this.flags & 2048 /* BigIntLiteral */ ? `LiteralType ${this.value.negative ? "-" : ""}${this.value.base10Value}n` : this.flags & 8192 /* UniqueESSymbol */ ? "UniqueESSymbolType" : this.flags & 32 /* Enum */ ? "EnumType" : this.flags & 1048576 /* Union */ ? "UnionType" : this.flags & 2097152 /* Intersection */ ? "IntersectionType" : this.flags & 4194304 /* Index */ ? "IndexType" : this.flags & 8388608 /* IndexedAccess */ ? "IndexedAccessType" : this.flags & 16777216 /* Conditional */ ? "ConditionalType" : this.flags & 33554432 /* Substitution */ ? "SubstitutionType" : this.flags & 262144 /* TypeParameter */ ? "TypeParameter" : this.flags & 524288 /* Object */ ? this.objectFlags & 3 /* ClassOrInterface */ ? "InterfaceType" : this.objectFlags & 4 /* Reference */ ? "TypeReference" : this.objectFlags & 8 /* Tuple */ ? "TupleType" : this.objectFlags & 16 /* Anonymous */ ? "AnonymousType" : this.objectFlags & 32 /* Mapped */ ? "MappedType" : this.objectFlags & 1024 /* ReverseMapped */ ? "ReverseMappedType" : this.objectFlags & 256 /* EvolvingArray */ ? "EvolvingArrayType" : "ObjectType" : "Type";
            const remainingObjectFlags = this.flags & 524288 /* Object */ ? this.objectFlags & ~1343 /* ObjectTypeKindMask */ : 0;
            return `${typeHeader}${this.symbol ? ` '${symbolName(this.symbol)}'` : ""}${remainingObjectFlags ? ` (${formatObjectFlags(remainingObjectFlags)})` : ""}`;
          }
        },
        __debugFlags: {
          get() {
            return formatTypeFlags(this.flags);
          }
        },
        __debugObjectFlags: {
          get() {
            return this.flags & 524288 /* Object */ ? formatObjectFlags(this.objectFlags) : "";
          }
        },
        __debugTypeToString: {
          value() {
            let text = weakTypeTextMap.get(this);
            if (text === void 0) {
              text = this.checker.typeToString(this);
              weakTypeTextMap.set(this, text);
            }
            return text;
          }
        }
      });
      Object.defineProperties(objectAllocator.getSignatureConstructor().prototype, {
        __debugFlags: {
          get() {
            return formatSignatureFlags(this.flags);
          }
        },
        __debugSignatureToString: {
          value() {
            var _a;
            return (_a = this.checker) == null ? void 0 : _a.signatureToString(this);
          }
        }
      });
      const nodeConstructors = [
        objectAllocator.getNodeConstructor(),
        objectAllocator.getIdentifierConstructor(),
        objectAllocator.getTokenConstructor(),
        objectAllocator.getSourceFileConstructor()
      ];
      for (const ctor of nodeConstructors) {
        if (!hasProperty(ctor.prototype, "__debugKind")) {
          Object.defineProperties(ctor.prototype, {
            // for use with vscode-js-debug's new customDescriptionGenerator in launch.json
            __tsDebuggerDisplay: {
              value() {
                const nodeHeader = isGeneratedIdentifier(this) ? "GeneratedIdentifier" : isIdentifier(this) ? `Identifier '${idText(this)}'` : isPrivateIdentifier(this) ? `PrivateIdentifier '${idText(this)}'` : isStringLiteral(this) ? `StringLiteral ${JSON.stringify(this.text.length < 10 ? this.text : this.text.slice(10) + "...")}` : isNumericLiteral(this) ? `NumericLiteral ${this.text}` : isBigIntLiteral(this) ? `BigIntLiteral ${this.text}n` : isTypeParameterDeclaration(this) ? "TypeParameterDeclaration" : isParameter(this) ? "ParameterDeclaration" : isConstructorDeclaration(this) ? "ConstructorDeclaration" : isGetAccessorDeclaration(this) ? "GetAccessorDeclaration" : isSetAccessorDeclaration(this) ? "SetAccessorDeclaration" : isCallSignatureDeclaration(this) ? "CallSignatureDeclaration" : isConstructSignatureDeclaration(this) ? "ConstructSignatureDeclaration" : isIndexSignatureDeclaration(this) ? "IndexSignatureDeclaration" : isTypePredicateNode(this) ? "TypePredicateNode" : isTypeReferenceNode(this) ? "TypeReferenceNode" : isFunctionTypeNode(this) ? "FunctionTypeNode" : isConstructorTypeNode(this) ? "ConstructorTypeNode" : isTypeQueryNode(this) ? "TypeQueryNode" : isTypeLiteralNode(this) ? "TypeLiteralNode" : isArrayTypeNode(this) ? "ArrayTypeNode" : isTupleTypeNode(this) ? "TupleTypeNode" : isOptionalTypeNode(this) ? "OptionalTypeNode" : isRestTypeNode(this) ? "RestTypeNode" : isUnionTypeNode(this) ? "UnionTypeNode" : isIntersectionTypeNode(this) ? "IntersectionTypeNode" : isConditionalTypeNode(this) ? "ConditionalTypeNode" : isInferTypeNode(this) ? "InferTypeNode" : isParenthesizedTypeNode(this) ? "ParenthesizedTypeNode" : isThisTypeNode(this) ? "ThisTypeNode" : isTypeOperatorNode(this) ? "TypeOperatorNode" : isIndexedAccessTypeNode(this) ? "IndexedAccessTypeNode" : isMappedTypeNode(this) ? "MappedTypeNode" : isLiteralTypeNode(this) ? "LiteralTypeNode" : isNamedTupleMember(this) ? "NamedTupleMember" : isImportTypeNode(this) ? "ImportTypeNode" : formatSyntaxKind(this.kind);
                return `${nodeHeader}${this.flags ? ` (${formatNodeFlags(this.flags)})` : ""}`;
              }
            },
            __debugKind: {
              get() {
                return formatSyntaxKind(this.kind);
              }
            },
            __debugNodeFlags: {
              get() {
                return formatNodeFlags(this.flags);
              }
            },
            __debugModifierFlags: {
              get() {
                return formatModifierFlags(getEffectiveModifierFlagsNoCache(this));
              }
            },
            __debugTransformFlags: {
              get() {
                return formatTransformFlags(this.transformFlags);
              }
            },
            __debugIsParseTreeNode: {
              get() {
                return isParseTreeNode(this);
              }
            },
            __debugEmitFlags: {
              get() {
                return formatEmitFlags(getEmitFlags(this));
              }
            },
            __debugGetText: {
              value(includeTrivia) {
                if (nodeIsSynthesized(this))
                  return "";
                let text = weakNodeTextMap.get(this);
                if (text === void 0) {
                  const parseNode = getParseTreeNode(this);
                  const sourceFile = parseNode && getSourceFileOfNode(parseNode);
                  text = sourceFile ? getSourceTextOfNodeFromSourceFile(sourceFile, parseNode, includeTrivia) : "";
                  weakNodeTextMap.set(this, text);
                }
                return text;
              }
            }
          });
        }
      }
      isDebugInfoEnabled = true;
    }
    Debug2.enableDebugInfo = enableDebugInfo;
    function formatVariance(varianceFlags) {
      const variance = varianceFlags & 7 /* VarianceMask */;
      let result = variance === 0 /* Invariant */ ? "in out" : variance === 3 /* Bivariant */ ? "[bivariant]" : variance === 2 /* Contravariant */ ? "in" : variance === 1 /* Covariant */ ? "out" : variance === 4 /* Independent */ ? "[independent]" : "";
      if (varianceFlags & 8 /* Unmeasurable */) {
        result += " (unmeasurable)";
      } else if (varianceFlags & 16 /* Unreliable */) {
        result += " (unreliable)";
      }
      return result;
    }
    Debug2.formatVariance = formatVariance;
    class DebugTypeMapper {
      __debugToString() {
        var _a;
        type(this);
        switch (this.kind) {
          case 3 /* Function */:
            return ((_a = this.debugInfo) == null ? void 0 : _a.call(this)) || "(function mapper)";
          case 0 /* Simple */:
            return `${this.source.__debugTypeToString()} -> ${this.target.__debugTypeToString()}`;
          case 1 /* Array */:
            return zipWith(
              this.sources,
              this.targets || map(this.sources, () => "any"),
              (s, t) => `${s.__debugTypeToString()} -> ${typeof t === "string" ? t : t.__debugTypeToString()}`
            ).join(", ");
          case 2 /* Deferred */:
            return zipWith(
              this.sources,
              this.targets,
              (s, t) => `${s.__debugTypeToString()} -> ${t().__debugTypeToString()}`
            ).join(", ");
          case 5 /* Merged */:
          case 4 /* Composite */:
            return `m1: ${this.mapper1.__debugToString().split("\n").join("\n    ")}
  m2: ${this.mapper2.__debugToString().split("\n").join("\n    ")}`;
          default:
            return assertNever(this);
        }
      }
    }
    Debug2.DebugTypeMapper = DebugTypeMapper;
    function attachDebugPrototypeIfDebug(mapper) {
      if (Debug2.isDebugging) {
        return Object.setPrototypeOf(mapper, DebugTypeMapper.prototype);
      }
      return mapper;
    }
    Debug2.attachDebugPrototypeIfDebug = attachDebugPrototypeIfDebug;
    function printControlFlowGraph(flowNode) {
      return console.log(formatControlFlowGraph(flowNode));
    }
    Debug2.printControlFlowGraph = printControlFlowGraph;
    function formatControlFlowGraph(flowNode) {
      let nextDebugFlowId = -1;
      function getDebugFlowNodeId(f) {
        if (!f.id) {
          f.id = nextDebugFlowId;
          nextDebugFlowId--;
        }
        return f.id;
      }
      let BoxCharacter;
      ((BoxCharacter2) => {
        BoxCharacter2["lr"] = "\u2500";
        BoxCharacter2["ud"] = "\u2502";
        BoxCharacter2["dr"] = "\u256D";
        BoxCharacter2["dl"] = "\u256E";
        BoxCharacter2["ul"] = "\u256F";
        BoxCharacter2["ur"] = "\u2570";
        BoxCharacter2["udr"] = "\u251C";
        BoxCharacter2["udl"] = "\u2524";
        BoxCharacter2["dlr"] = "\u252C";
        BoxCharacter2["ulr"] = "\u2534";
        BoxCharacter2["udlr"] = "\u256B";
      })(BoxCharacter || (BoxCharacter = {}));
      let Connection;
      ((Connection2) => {
        Connection2[Connection2["None"] = 0] = "None";
        Connection2[Connection2["Up"] = 1] = "Up";
        Connection2[Connection2["Down"] = 2] = "Down";
        Connection2[Connection2["Left"] = 4] = "Left";
        Connection2[Connection2["Right"] = 8] = "Right";
        Connection2[Connection2["UpDown"] = 3] = "UpDown";
        Connection2[Connection2["LeftRight"] = 12] = "LeftRight";
        Connection2[Connection2["UpLeft"] = 5] = "UpLeft";
        Connection2[Connection2["UpRight"] = 9] = "UpRight";
        Connection2[Connection2["DownLeft"] = 6] = "DownLeft";
        Connection2[Connection2["DownRight"] = 10] = "DownRight";
        Connection2[Connection2["UpDownLeft"] = 7] = "UpDownLeft";
        Connection2[Connection2["UpDownRight"] = 11] = "UpDownRight";
        Connection2[Connection2["UpLeftRight"] = 13] = "UpLeftRight";
        Connection2[Connection2["DownLeftRight"] = 14] = "DownLeftRight";
        Connection2[Connection2["UpDownLeftRight"] = 15] = "UpDownLeftRight";
        Connection2[Connection2["NoChildren"] = 16] = "NoChildren";
      })(Connection || (Connection = {}));
      const hasAntecedentFlags = 16 /* Assignment */ | 96 /* Condition */ | 128 /* SwitchClause */ | 256 /* ArrayMutation */ | 512 /* Call */ | 1024 /* ReduceLabel */;
      const hasNodeFlags = 2 /* Start */ | 16 /* Assignment */ | 512 /* Call */ | 96 /* Condition */ | 256 /* ArrayMutation */;
      const links = /* @__PURE__ */ Object.create(
        /*o*/
        null
      );
      const nodes = [];
      const edges = [];
      const root = buildGraphNode(flowNode, /* @__PURE__ */ new Set());
      for (const node of nodes) {
        node.text = renderFlowNode(node.flowNode, node.circular);
        computeLevel(node);
      }
      const height = computeHeight(root);
      const columnWidths = computeColumnWidths(height);
      computeLanes(root, 0);
      return renderGraph();
      function isFlowSwitchClause(f) {
        return !!(f.flags & 128 /* SwitchClause */);
      }
      function hasAntecedents(f) {
        return !!(f.flags & 12 /* Label */) && !!f.antecedents;
      }
      function hasAntecedent(f) {
        return !!(f.flags & hasAntecedentFlags);
      }
      function hasNode(f) {
        return !!(f.flags & hasNodeFlags);
      }
      function getChildren(node) {
        const children = [];
        for (const edge of node.edges) {
          if (edge.source === node) {
            children.push(edge.target);
          }
        }
        return children;
      }
      function getParents(node) {
        const parents = [];
        for (const edge of node.edges) {
          if (edge.target === node) {
            parents.push(edge.source);
          }
        }
        return parents;
      }
      function buildGraphNode(flowNode2, seen) {
        const id = getDebugFlowNodeId(flowNode2);
        let graphNode = links[id];
        if (graphNode && seen.has(flowNode2)) {
          graphNode.circular = true;
          graphNode = {
            id: -1,
            flowNode: flowNode2,
            edges: [],
            text: "",
            lane: -1,
            endLane: -1,
            level: -1,
            circular: "circularity"
          };
          nodes.push(graphNode);
          return graphNode;
        }
        seen.add(flowNode2);
        if (!graphNode) {
          links[id] = graphNode = { id, flowNode: flowNode2, edges: [], text: "", lane: -1, endLane: -1, level: -1, circular: false };
          nodes.push(graphNode);
          if (hasAntecedents(flowNode2)) {
            for (const antecedent of flowNode2.antecedents) {
              buildGraphEdge(graphNode, antecedent, seen);
            }
          } else if (hasAntecedent(flowNode2)) {
            buildGraphEdge(graphNode, flowNode2.antecedent, seen);
          }
        }
        seen.delete(flowNode2);
        return graphNode;
      }
      function buildGraphEdge(source, antecedent, seen) {
        const target = buildGraphNode(antecedent, seen);
        const edge = { source, target };
        edges.push(edge);
        source.edges.push(edge);
        target.edges.push(edge);
      }
      function computeLevel(node) {
        if (node.level !== -1) {
          return node.level;
        }
        let level = 0;
        for (const parent of getParents(node)) {
          level = Math.max(level, computeLevel(parent) + 1);
        }
        return node.level = level;
      }
      function computeHeight(node) {
        let height2 = 0;
        for (const child of getChildren(node)) {
          height2 = Math.max(height2, computeHeight(child));
        }
        return height2 + 1;
      }
      function computeColumnWidths(height2) {
        const columns = fill(Array(height2), 0);
        for (const node of nodes) {
          columns[node.level] = Math.max(columns[node.level], node.text.length);
        }
        return columns;
      }
      function computeLanes(node, lane) {
        if (node.lane === -1) {
          node.lane = lane;
          node.endLane = lane;
          const children = getChildren(node);
          for (let i = 0; i < children.length; i++) {
            if (i > 0)
              lane++;
            const child = children[i];
            computeLanes(child, lane);
            if (child.endLane > node.endLane) {
              lane = child.endLane;
            }
          }
          node.endLane = lane;
        }
      }
      function getHeader2(flags) {
        if (flags & 2 /* Start */)
          return "Start";
        if (flags & 4 /* BranchLabel */)
          return "Branch";
        if (flags & 8 /* LoopLabel */)
          return "Loop";
        if (flags & 16 /* Assignment */)
          return "Assignment";
        if (flags & 32 /* TrueCondition */)
          return "True";
        if (flags & 64 /* FalseCondition */)
          return "False";
        if (flags & 128 /* SwitchClause */)
          return "SwitchClause";
        if (flags & 256 /* ArrayMutation */)
          return "ArrayMutation";
        if (flags & 512 /* Call */)
          return "Call";
        if (flags & 1024 /* ReduceLabel */)
          return "ReduceLabel";
        if (flags & 1 /* Unreachable */)
          return "Unreachable";
        throw new Error();
      }
      function getNodeText(node) {
        const sourceFile = getSourceFileOfNode(node);
        return getSourceTextOfNodeFromSourceFile(
          sourceFile,
          node,
          /*includeTrivia*/
          false
        );
      }
      function renderFlowNode(flowNode2, circular) {
        let text = getHeader2(flowNode2.flags);
        if (circular) {
          text = `${text}#${getDebugFlowNodeId(flowNode2)}`;
        }
        if (hasNode(flowNode2)) {
          if (flowNode2.node) {
            text += ` (${getNodeText(flowNode2.node)})`;
          }
        } else if (isFlowSwitchClause(flowNode2)) {
          const clauses = [];
          for (let i = flowNode2.clauseStart; i < flowNode2.clauseEnd; i++) {
            const clause = flowNode2.switchStatement.caseBlock.clauses[i];
            if (isDefaultClause(clause)) {
              clauses.push("default");
            } else {
              clauses.push(getNodeText(clause.expression));
            }
          }
          text += ` (${clauses.join(", ")})`;
        }
        return circular === "circularity" ? `Circular(${text})` : text;
      }
      function renderGraph() {
        const columnCount = columnWidths.length;
        const laneCount = nodes.reduce((x, n) => Math.max(x, n.lane), 0) + 1;
        const lanes = fill(Array(laneCount), "");
        const grid = columnWidths.map(() => Array(laneCount));
        const connectors = columnWidths.map(() => fill(Array(laneCount), 0));
        for (const node of nodes) {
          grid[node.level][node.lane] = node;
          const children = getChildren(node);
          for (let i = 0; i < children.length; i++) {
            const child = children[i];
            let connector = 8 /* Right */;
            if (child.lane === node.lane)
              connector |= 4 /* Left */;
            if (i > 0)
              connector |= 1 /* Up */;
            if (i < children.length - 1)
              connector |= 2 /* Down */;
            connectors[node.level][child.lane] |= connector;
          }
          if (children.length === 0) {
            connectors[node.level][node.lane] |= 16 /* NoChildren */;
          }
          const parents = getParents(node);
          for (let i = 0; i < parents.length; i++) {
            const parent = parents[i];
            let connector = 4 /* Left */;
            if (i > 0)
              connector |= 1 /* Up */;
            if (i < parents.length - 1)
              connector |= 2 /* Down */;
            connectors[node.level - 1][parent.lane] |= connector;
          }
        }
        for (let column = 0; column < columnCount; column++) {
          for (let lane = 0; lane < laneCount; lane++) {
            const left = column > 0 ? connectors[column - 1][lane] : 0;
            const above = lane > 0 ? connectors[column][lane - 1] : 0;
            let connector = connectors[column][lane];
            if (!connector) {
              if (left & 8 /* Right */)
                connector |= 12 /* LeftRight */;
              if (above & 2 /* Down */)
                connector |= 3 /* UpDown */;
              connectors[column][lane] = connector;
            }
          }
        }
        for (let column = 0; column < columnCount; column++) {
          for (let lane = 0; lane < lanes.length; lane++) {
            const connector = connectors[column][lane];
            const fill2 = connector & 4 /* Left */ ? "\u2500" /* lr */ : " ";
            const node = grid[column][lane];
            if (!node) {
              if (column < columnCount - 1) {
                writeLane(lane, repeat(fill2, columnWidths[column] + 1));
              }
            } else {
              writeLane(lane, node.text);
              if (column < columnCount - 1) {
                writeLane(lane, " ");
                writeLane(lane, repeat(fill2, columnWidths[column] - node.text.length));
              }
            }
            writeLane(lane, getBoxCharacter(connector));
            writeLane(lane, connector & 8 /* Right */ && column < columnCount - 1 && !grid[column + 1][lane] ? "\u2500" /* lr */ : " ");
          }
        }
        return `
  ${lanes.join("\n")}
  `;
        function writeLane(lane, text) {
          lanes[lane] += text;
        }
      }
      function getBoxCharacter(connector) {
        switch (connector) {
          case 3 /* UpDown */:
            return "\u2502" /* ud */;
          case 12 /* LeftRight */:
            return "\u2500" /* lr */;
          case 5 /* UpLeft */:
            return "\u256F" /* ul */;
          case 9 /* UpRight */:
            return "\u2570" /* ur */;
          case 6 /* DownLeft */:
            return "\u256E" /* dl */;
          case 10 /* DownRight */:
            return "\u256D" /* dr */;
          case 7 /* UpDownLeft */:
            return "\u2524" /* udl */;
          case 11 /* UpDownRight */:
            return "\u251C" /* udr */;
          case 13 /* UpLeftRight */:
            return "\u2534" /* ulr */;
          case 14 /* DownLeftRight */:
            return "\u252C" /* dlr */;
          case 15 /* UpDownLeftRight */:
            return "\u256B" /* udlr */;
        }
        return " ";
      }
      function fill(array, value) {
        if (array.fill) {
          array.fill(value);
        } else {
          for (let i = 0; i < array.length; i++) {
            array[i] = value;
          }
        }
        return array;
      }
      function repeat(ch, length2) {
        if (ch.repeat) {
          return length2 > 0 ? ch.repeat(length2) : "";
        }
        let s = "";
        while (s.length < length2) {
          s += ch;
        }
        return s;
      }
    }
    Debug2.formatControlFlowGraph = formatControlFlowGraph;
  })(Debug || (Debug = {}));
  
  // src/compiler/semver.ts
  var versionRegExp = /^(0|[1-9]\d*)(?:\.(0|[1-9]\d*)(?:\.(0|[1-9]\d*)(?:-([a-z0-9-.]+))?(?:\+([a-z0-9-.]+))?)?)?$/i;
  var prereleaseRegExp = /^(?:0|[1-9]\d*|[a-z-][a-z0-9-]*)(?:\.(?:0|[1-9]\d*|[a-z-][a-z0-9-]*))*$/i;
  var prereleasePartRegExp = /^(?:0|[1-9]\d*|[a-z-][a-z0-9-]*)$/i;
  var buildRegExp = /^[a-z0-9-]+(?:\.[a-z0-9-]+)*$/i;
  var buildPartRegExp = /^[a-z0-9-]+$/i;
  var numericIdentifierRegExp = /^(0|[1-9]\d*)$/;
  var _Version = class _Version {
    constructor(major, minor = 0, patch = 0, prerelease = "", build2 = "") {
      if (typeof major === "string") {
        const result = Debug.checkDefined(tryParseComponents(major), "Invalid version");
        ({ major, minor, patch, prerelease, build: build2 } = result);
      }
      Debug.assert(major >= 0, "Invalid argument: major");
      Debug.assert(minor >= 0, "Invalid argument: minor");
      Debug.assert(patch >= 0, "Invalid argument: patch");
      const prereleaseArray = prerelease ? isArray(prerelease) ? prerelease : prerelease.split(".") : emptyArray;
      const buildArray = build2 ? isArray(build2) ? build2 : build2.split(".") : emptyArray;
      Debug.assert(every(prereleaseArray, (s) => prereleasePartRegExp.test(s)), "Invalid argument: prerelease");
      Debug.assert(every(buildArray, (s) => buildPartRegExp.test(s)), "Invalid argument: build");
      this.major = major;
      this.minor = minor;
      this.patch = patch;
      this.prerelease = prereleaseArray;
      this.build = buildArray;
    }
    static tryParse(text) {
      const result = tryParseComponents(text);
      if (!result)
        return void 0;
      const { major, minor, patch, prerelease, build: build2 } = result;
      return new _Version(major, minor, patch, prerelease, build2);
    }
    compareTo(other) {
      if (this === other)
        return 0 /* EqualTo */;
      if (other === void 0)
        return 1 /* GreaterThan */;
      return compareValues(this.major, other.major) || compareValues(this.minor, other.minor) || compareValues(this.patch, other.patch) || comparePrereleaseIdentifiers(this.prerelease, other.prerelease);
    }
    increment(field) {
      switch (field) {
        case "major":
          return new _Version(this.major + 1, 0, 0);
        case "minor":
          return new _Version(this.major, this.minor + 1, 0);
        case "patch":
          return new _Version(this.major, this.minor, this.patch + 1);
        default:
          return Debug.assertNever(field);
      }
    }
    with(fields) {
      const {
        major = this.major,
        minor = this.minor,
        patch = this.patch,
        prerelease = this.prerelease,
        build: build2 = this.build
      } = fields;
      return new _Version(major, minor, patch, prerelease, build2);
    }
    toString() {
      let result = `${this.major}.${this.minor}.${this.patch}`;
      if (some(this.prerelease))
        result += `-${this.prerelease.join(".")}`;
      if (some(this.build))
        result += `+${this.build.join(".")}`;
      return result;
    }
  };
  _Version.zero = new _Version(0, 0, 0, ["0"]);
  var Version = _Version;
  function tryParseComponents(text) {
    const match = versionRegExp.exec(text);
    if (!match)
      return void 0;
    const [, major, minor = "0", patch = "0", prerelease = "", build2 = ""] = match;
    if (prerelease && !prereleaseRegExp.test(prerelease))
      return void 0;
    if (build2 && !buildRegExp.test(build2))
      return void 0;
    return {
      major: parseInt(major, 10),
      minor: parseInt(minor, 10),
      patch: parseInt(patch, 10),
      prerelease,
      build: build2
    };
  }
  function comparePrereleaseIdentifiers(left, right) {
    if (left === right)
      return 0 /* EqualTo */;
    if (left.length === 0)
      return right.length === 0 ? 0 /* EqualTo */ : 1 /* GreaterThan */;
    if (right.length === 0)
      return -1 /* LessThan */;
    const length2 = Math.min(left.length, right.length);
    for (let i = 0; i < length2; i++) {
      const leftIdentifier = left[i];
      const rightIdentifier = right[i];
      if (leftIdentifier === rightIdentifier)
        continue;
      const leftIsNumeric = numericIdentifierRegExp.test(leftIdentifier);
      const rightIsNumeric = numericIdentifierRegExp.test(rightIdentifier);
      if (leftIsNumeric || rightIsNumeric) {
        if (leftIsNumeric !== rightIsNumeric)
          return leftIsNumeric ? -1 /* LessThan */ : 1 /* GreaterThan */;
        const result = compareValues(+leftIdentifier, +rightIdentifier);
        if (result)
          return result;
      } else {
        const result = compareStringsCaseSensitive(leftIdentifier, rightIdentifier);
        if (result)
          return result;
      }
    }
    return compareValues(left.length, right.length);
  }
  var VersionRange = class _VersionRange {
    constructor(spec) {
      this._alternatives = spec ? Debug.checkDefined(parseRange(spec), "Invalid range spec.") : emptyArray;
    }
    static tryParse(text) {
      const sets = parseRange(text);
      if (sets) {
        const range = new _VersionRange("");
        range._alternatives = sets;
        return range;
      }
      return void 0;
    }
    /**
     * Tests whether a version matches the range. This is equivalent to `satisfies(version, range, { includePrerelease: true })`.
     * in `node-semver`.
     */
    test(version2) {
      if (typeof version2 === "string")
        version2 = new Version(version2);
      return testDisjunction(version2, this._alternatives);
    }
    toString() {
      return formatDisjunction(this._alternatives);
    }
  };
  var logicalOrRegExp = /\|\|/g;
  var whitespaceRegExp = /\s+/g;
  var partialRegExp = /^([xX*0]|[1-9]\d*)(?:\.([xX*0]|[1-9]\d*)(?:\.([xX*0]|[1-9]\d*)(?:-([a-z0-9-.]+))?(?:\+([a-z0-9-.]+))?)?)?$/i;
  var hyphenRegExp = /^\s*([a-z0-9-+.*]+)\s+-\s+([a-z0-9-+.*]+)\s*$/i;
  var rangeRegExp = /^(~|\^|<|<=|>|>=|=)?\s*([a-z0-9-+.*]+)$/i;
  function parseRange(text) {
    const alternatives = [];
    for (let range of text.trim().split(logicalOrRegExp)) {
      if (!range)
        continue;
      const comparators = [];
      range = range.trim();
      const match = hyphenRegExp.exec(range);
      if (match) {
        if (!parseHyphen(match[1], match[2], comparators))
          return void 0;
      } else {
        for (const simple of range.split(whitespaceRegExp)) {
          const match2 = rangeRegExp.exec(simple.trim());
          if (!match2 || !parseComparator(match2[1], match2[2], comparators))
            return void 0;
        }
      }
      alternatives.push(comparators);
    }
    return alternatives;
  }
  function parsePartial(text) {
    const match = partialRegExp.exec(text);
    if (!match)
      return void 0;
    const [, major, minor = "*", patch = "*", prerelease, build2] = match;
    const version2 = new Version(
      isWildcard(major) ? 0 : parseInt(major, 10),
      isWildcard(major) || isWildcard(minor) ? 0 : parseInt(minor, 10),
      isWildcard(major) || isWildcard(minor) || isWildcard(patch) ? 0 : parseInt(patch, 10),
      prerelease,
      build2
    );
    return { version: version2, major, minor, patch };
  }
  function parseHyphen(left, right, comparators) {
    const leftResult = parsePartial(left);
    if (!leftResult)
      return false;
    const rightResult = parsePartial(right);
    if (!rightResult)
      return false;
    if (!isWildcard(leftResult.major)) {
      comparators.push(createComparator(">=", leftResult.version));
    }
    if (!isWildcard(rightResult.major)) {
      comparators.push(
        isWildcard(rightResult.minor) ? createComparator("<", rightResult.version.increment("major")) : isWildcard(rightResult.patch) ? createComparator("<", rightResult.version.increment("minor")) : createComparator("<=", rightResult.version)
      );
    }
    return true;
  }
  function parseComparator(operator, text, comparators) {
    const result = parsePartial(text);
    if (!result)
      return false;
    const { version: version2, major, minor, patch } = result;
    if (!isWildcard(major)) {
      switch (operator) {
        case "~":
          comparators.push(createComparator(">=", version2));
          comparators.push(createComparator(
            "<",
            version2.increment(
              isWildcard(minor) ? "major" : "minor"
            )
          ));
          break;
        case "^":
          comparators.push(createComparator(">=", version2));
          comparators.push(createComparator(
            "<",
            version2.increment(
              version2.major > 0 || isWildcard(minor) ? "major" : version2.minor > 0 || isWildcard(patch) ? "minor" : "patch"
            )
          ));
          break;
        case "<":
        case ">=":
          comparators.push(
            isWildcard(minor) || isWildcard(patch) ? createComparator(operator, version2.with({ prerelease: "0" })) : createComparator(operator, version2)
          );
          break;
        case "<=":
        case ">":
          comparators.push(
            isWildcard(minor) ? createComparator(operator === "<=" ? "<" : ">=", version2.increment("major").with({ prerelease: "0" })) : isWildcard(patch) ? createComparator(operator === "<=" ? "<" : ">=", version2.increment("minor").with({ prerelease: "0" })) : createComparator(operator, version2)
          );
          break;
        case "=":
        case void 0:
          if (isWildcard(minor) || isWildcard(patch)) {
            comparators.push(createComparator(">=", version2.with({ prerelease: "0" })));
            comparators.push(createComparator("<", version2.increment(isWildcard(minor) ? "major" : "minor").with({ prerelease: "0" })));
          } else {
            comparators.push(createComparator("=", version2));
          }
          break;
        default:
          return false;
      }
    } else if (operator === "<" || operator === ">") {
      comparators.push(createComparator("<", Version.zero));
    }
    return true;
  }
  function isWildcard(part) {
    return part === "*" || part === "x" || part === "X";
  }
  function createComparator(operator, operand) {
    return { operator, operand };
  }
  function testDisjunction(version2, alternatives) {
    if (alternatives.length === 0)
      return true;
    for (const alternative of alternatives) {
      if (testAlternative(version2, alternative))
        return true;
    }
    return false;
  }
  function testAlternative(version2, comparators) {
    for (const comparator of comparators) {
      if (!testComparator(version2, comparator.operator, comparator.operand))
        return false;
    }
    return true;
  }
  function testComparator(version2, operator, operand) {
    const cmp = version2.compareTo(operand);
    switch (operator) {
      case "<":
        return cmp < 0;
      case "<=":
        return cmp <= 0;
      case ">":
        return cmp > 0;
      case ">=":
        return cmp >= 0;
      case "=":
        return cmp === 0;
      default:
        return Debug.assertNever(operator);
    }
  }
  function formatDisjunction(alternatives) {
    return map(alternatives, formatAlternative).join(" || ") || "*";
  }
  function formatAlternative(comparators) {
    return map(comparators, formatComparator).join(" ");
  }
  function formatComparator(comparator) {
    return `${comparator.operator}${comparator.operand}`;
  }
  
  // src/compiler/performanceCore.ts
  function hasRequiredAPI(performance2, PerformanceObserver2) {
    return typeof performance2 === "object" && typeof performance2.timeOrigin === "number" && typeof performance2.mark === "function" && typeof performance2.measure === "function" && typeof performance2.now === "function" && typeof performance2.clearMarks === "function" && typeof performance2.clearMeasures === "function" && typeof PerformanceObserver2 === "function";
  }
  function tryGetWebPerformanceHooks() {
    if (typeof performance === "object" && typeof PerformanceObserver === "function" && hasRequiredAPI(performance, PerformanceObserver)) {
      return {
        // For now we always write native performance events when running in the browser. We may
        // make this conditional in the future if we find that native web performance hooks
        // in the browser also slow down compilation.
        shouldWriteNativeEvents: true,
        performance,
        PerformanceObserver
      };
    }
  }
  function tryGetNodePerformanceHooks() {
    if (isNodeLikeSystem()) {
      try {
        const { performance: performance2, PerformanceObserver: PerformanceObserver2 } = require("perf_hooks");
        if (hasRequiredAPI(performance2, PerformanceObserver2)) {
          return {
            // By default, only write native events when generating a cpu profile or using the v8 profiler.
            shouldWriteNativeEvents: false,
            performance: performance2,
            PerformanceObserver: PerformanceObserver2
          };
        }
      } catch {
      }
    }
  }
  var nativePerformanceHooks = tryGetWebPerformanceHooks() || tryGetNodePerformanceHooks();
  var nativePerformance = nativePerformanceHooks == null ? void 0 : nativePerformanceHooks.performance;
  function tryGetNativePerformanceHooks() {
    return nativePerformanceHooks;
  }
  var timestamp = nativePerformance ? () => nativePerformance.now() : Date.now ? Date.now : () => +/* @__PURE__ */ new Date();
  
  // src/compiler/perfLogger.ts
  var etwModule;
  try {
    const etwModulePath = process.env.TS_ETW_MODULE_PATH ?? "./node_modules/@microsoft/typescript-etw";
    etwModule = require(etwModulePath);
  } catch (e) {
    etwModule = void 0;
  }
  var perfLogger = (etwModule == null ? void 0 : etwModule.logEvent) ? etwModule : void 0;
  
  // src/compiler/performance.ts
  var perfHooks;
  var performanceImpl;
  function createTimerIf(condition, measureName, startMarkName, endMarkName) {
    return condition ? createTimer(measureName, startMarkName, endMarkName) : nullTimer;
  }
  function createTimer(measureName, startMarkName, endMarkName) {
    let enterCount = 0;
    return {
      enter,
      exit
    };
    function enter() {
      if (++enterCount === 1) {
        mark(startMarkName);
      }
    }
    function exit() {
      if (--enterCount === 0) {
        mark(endMarkName);
        measure(measureName, startMarkName, endMarkName);
      } else if (enterCount < 0) {
        Debug.fail("enter/exit count does not match.");
      }
    }
  }
  var nullTimer = { enter: noop, exit: noop };
  var enabled = false;
  var timeorigin = timestamp();
  var marks = /* @__PURE__ */ new Map();
  var counts = /* @__PURE__ */ new Map();
  var durations = /* @__PURE__ */ new Map();
  function mark(markName) {
    if (enabled) {
      const count = counts.get(markName) ?? 0;
      counts.set(markName, count + 1);
      marks.set(markName, timestamp());
      performanceImpl == null ? void 0 : performanceImpl.mark(markName);
      if (typeof onProfilerEvent === "function") {
        onProfilerEvent(markName);
      }
    }
  }
  function measure(measureName, startMarkName, endMarkName) {
    if (enabled) {
      const end = (endMarkName !== void 0 ? marks.get(endMarkName) : void 0) ?? timestamp();
      const start = (startMarkName !== void 0 ? marks.get(startMarkName) : void 0) ?? timeorigin;
      const previousDuration = durations.get(measureName) || 0;
      durations.set(measureName, previousDuration + (end - start));
      performanceImpl == null ? void 0 : performanceImpl.measure(measureName, startMarkName, endMarkName);
    }
  }
  function getCount(markName) {
    return counts.get(markName) || 0;
  }
  function getDuration(measureName) {
    return durations.get(measureName) || 0;
  }
  function forEachMeasure(cb) {
    durations.forEach((duration, measureName) => cb(measureName, duration));
  }
  function forEachMark(cb) {
    marks.forEach((_time, markName) => cb(markName));
  }
  function clearMeasures(name) {
    if (name !== void 0)
      durations.delete(name);
    else
      durations.clear();
    performanceImpl == null ? void 0 : performanceImpl.clearMeasures(name);
  }
  function clearMarks(name) {
    if (name !== void 0) {
      counts.delete(name);
      marks.delete(name);
    } else {
      counts.clear();
      marks.clear();
    }
    performanceImpl == null ? void 0 : performanceImpl.clearMarks(name);
  }
  function isEnabled() {
    return enabled;
  }
  function enable(system = sys) {
    var _a;
    if (!enabled) {
      enabled = true;
      perfHooks || (perfHooks = tryGetNativePerformanceHooks());
      if (perfHooks) {
        timeorigin = perfHooks.performance.timeOrigin;
        if (perfHooks.shouldWriteNativeEvents || ((_a = system == null ? void 0 : system.cpuProfilingEnabled) == null ? void 0 : _a.call(system)) || (system == null ? void 0 : system.debugMode)) {
          performanceImpl = perfHooks.performance;
        }
      }
    }
    return true;
  }
  function disable() {
    if (enabled) {
      marks.clear();
      counts.clear();
      durations.clear();
      performanceImpl = void 0;
      enabled = false;
    }
  }
  
  // src/compiler/tracing.ts
  var tracing;
  var tracingEnabled;
  ((tracingEnabled2) => {
    let fs;
    let traceCount = 0;
    let traceFd = 0;
    let mode;
    const typeCatalog = [];
    let legendPath;
    const legend = [];
    function startTracing2(tracingMode, traceDir, configFilePath) {
      Debug.assert(!tracing, "Tracing already started");
      if (fs === void 0) {
        try {
          fs = require("fs");
        } catch (e) {
          throw new Error(`tracing requires having fs
  (original error: ${e.message || e})`);
        }
      }
      mode = tracingMode;
      typeCatalog.length = 0;
      if (legendPath === void 0) {
        legendPath = combinePaths(traceDir, "legend.json");
      }
      if (!fs.existsSync(traceDir)) {
        fs.mkdirSync(traceDir, { recursive: true });
      }
      const countPart = mode === "build" ? `.${process.pid}-${++traceCount}` : mode === "server" ? `.${process.pid}` : ``;
      const tracePath = combinePaths(traceDir, `trace${countPart}.json`);
      const typesPath = combinePaths(traceDir, `types${countPart}.json`);
      legend.push({
        configFilePath,
        tracePath,
        typesPath
      });
      traceFd = fs.openSync(tracePath, "w");
      tracing = tracingEnabled2;
      const meta = { cat: "__metadata", ph: "M", ts: 1e3 * timestamp(), pid: 1, tid: 1 };
      fs.writeSync(
        traceFd,
        "[\n" + [{ name: "process_name", args: { name: "tsc" }, ...meta }, { name: "thread_name", args: { name: "Main" }, ...meta }, { name: "TracingStartedInBrowser", ...meta, cat: "disabled-by-default-devtools.timeline" }].map((v) => JSON.stringify(v)).join(",\n")
      );
    }
    tracingEnabled2.startTracing = startTracing2;
    function stopTracing() {
      Debug.assert(tracing, "Tracing is not in progress");
      Debug.assert(!!typeCatalog.length === (mode !== "server"));
      fs.writeSync(traceFd, `
  ]
  `);
      fs.closeSync(traceFd);
      tracing = void 0;
      if (typeCatalog.length) {
        dumpTypes(typeCatalog);
      } else {
        legend[legend.length - 1].typesPath = void 0;
      }
    }
    tracingEnabled2.stopTracing = stopTracing;
    function recordType(type) {
      if (mode !== "server") {
        typeCatalog.push(type);
      }
    }
    tracingEnabled2.recordType = recordType;
    let Phase;
    ((Phase2) => {
      Phase2["Parse"] = "parse";
      Phase2["Program"] = "program";
      Phase2["Bind"] = "bind";
      Phase2["Check"] = "check";
      Phase2["CheckTypes"] = "checkTypes";
      Phase2["Emit"] = "emit";
      Phase2["Session"] = "session";
    })(Phase = tracingEnabled2.Phase || (tracingEnabled2.Phase = {}));
    function instant(phase, name, args) {
      writeEvent("I", phase, name, args, `"s":"g"`);
    }
    tracingEnabled2.instant = instant;
    const eventStack = [];
    function push(phase, name, args, separateBeginAndEnd = false) {
      if (separateBeginAndEnd) {
        writeEvent("B", phase, name, args);
      }
      eventStack.push({ phase, name, args, time: 1e3 * timestamp(), separateBeginAndEnd });
    }
    tracingEnabled2.push = push;
    function pop(results) {
      Debug.assert(eventStack.length > 0);
      writeStackEvent(eventStack.length - 1, 1e3 * timestamp(), results);
      eventStack.length--;
    }
    tracingEnabled2.pop = pop;
    function popAll() {
      const endTime = 1e3 * timestamp();
      for (let i = eventStack.length - 1; i >= 0; i--) {
        writeStackEvent(i, endTime);
      }
      eventStack.length = 0;
    }
    tracingEnabled2.popAll = popAll;
    const sampleInterval = 1e3 * 10;
    function writeStackEvent(index, endTime, results) {
      const { phase, name, args, time, separateBeginAndEnd } = eventStack[index];
      if (separateBeginAndEnd) {
        Debug.assert(!results, "`results` are not supported for events with `separateBeginAndEnd`");
        writeEvent(
          "E",
          phase,
          name,
          args,
          /*extras*/
          void 0,
          endTime
        );
      } else if (sampleInterval - time % sampleInterval <= endTime - time) {
        writeEvent("X", phase, name, { ...args, results }, `"dur":${endTime - time}`, time);
      }
    }
    function writeEvent(eventType, phase, name, args, extras, time = 1e3 * timestamp()) {
      if (mode === "server" && phase === "checkTypes" /* CheckTypes */)
        return;
      mark("beginTracing");
      fs.writeSync(traceFd, `,
  {"pid":1,"tid":1,"ph":"${eventType}","cat":"${phase}","ts":${time},"name":"${name}"`);
      if (extras)
        fs.writeSync(traceFd, `,${extras}`);
      if (args)
        fs.writeSync(traceFd, `,"args":${JSON.stringify(args)}`);
      fs.writeSync(traceFd, `}`);
      mark("endTracing");
      measure("Tracing", "beginTracing", "endTracing");
    }
    function getLocation(node) {
      const file = getSourceFileOfNode(node);
      return !file ? void 0 : {
        path: file.path,
        start: indexFromOne(getLineAndCharacterOfPosition(file, node.pos)),
        end: indexFromOne(getLineAndCharacterOfPosition(file, node.end))
      };
      function indexFromOne(lc) {
        return {
          line: lc.line + 1,
          character: lc.character + 1
        };
      }
    }
    function dumpTypes(types) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s;
      mark("beginDumpTypes");
      const typesPath = legend[legend.length - 1].typesPath;
      const typesFd = fs.openSync(typesPath, "w");
      const recursionIdentityMap = /* @__PURE__ */ new Map();
      fs.writeSync(typesFd, "[");
      const numTypes = types.length;
      for (let i = 0; i < numTypes; i++) {
        const type = types[i];
        const objectFlags = type.objectFlags;
        const symbol = type.aliasSymbol ?? type.symbol;
        let display;
        if (objectFlags & 16 /* Anonymous */ | type.flags & 2944 /* Literal */) {
          try {
            display = (_a = type.checker) == null ? void 0 : _a.typeToString(type);
          } catch {
            display = void 0;
          }
        }
        let indexedAccessProperties = {};
        if (type.flags & 8388608 /* IndexedAccess */) {
          const indexedAccessType = type;
          indexedAccessProperties = {
            indexedAccessObjectType: (_b = indexedAccessType.objectType) == null ? void 0 : _b.id,
            indexedAccessIndexType: (_c = indexedAccessType.indexType) == null ? void 0 : _c.id
          };
        }
        let referenceProperties = {};
        if (objectFlags & 4 /* Reference */) {
          const referenceType = type;
          referenceProperties = {
            instantiatedType: (_d = referenceType.target) == null ? void 0 : _d.id,
            typeArguments: (_e = referenceType.resolvedTypeArguments) == null ? void 0 : _e.map((t) => t.id),
            referenceLocation: getLocation(referenceType.node)
          };
        }
        let conditionalProperties = {};
        if (type.flags & 16777216 /* Conditional */) {
          const conditionalType = type;
          conditionalProperties = {
            conditionalCheckType: (_f = conditionalType.checkType) == null ? void 0 : _f.id,
            conditionalExtendsType: (_g = conditionalType.extendsType) == null ? void 0 : _g.id,
            conditionalTrueType: ((_h = conditionalType.resolvedTrueType) == null ? void 0 : _h.id) ?? -1,
            conditionalFalseType: ((_i = conditionalType.resolvedFalseType) == null ? void 0 : _i.id) ?? -1
          };
        }
        let substitutionProperties = {};
        if (type.flags & 33554432 /* Substitution */) {
          const substitutionType = type;
          substitutionProperties = {
            substitutionBaseType: (_j = substitutionType.baseType) == null ? void 0 : _j.id,
            constraintType: (_k = substitutionType.constraint) == null ? void 0 : _k.id
          };
        }
        let reverseMappedProperties = {};
        if (objectFlags & 1024 /* ReverseMapped */) {
          const reverseMappedType = type;
          reverseMappedProperties = {
            reverseMappedSourceType: (_l = reverseMappedType.source) == null ? void 0 : _l.id,
            reverseMappedMappedType: (_m = reverseMappedType.mappedType) == null ? void 0 : _m.id,
            reverseMappedConstraintType: (_n = reverseMappedType.constraintType) == null ? void 0 : _n.id
          };
        }
        let evolvingArrayProperties = {};
        if (objectFlags & 256 /* EvolvingArray */) {
          const evolvingArrayType = type;
          evolvingArrayProperties = {
            evolvingArrayElementType: evolvingArrayType.elementType.id,
            evolvingArrayFinalType: (_o = evolvingArrayType.finalArrayType) == null ? void 0 : _o.id
          };
        }
        let recursionToken;
        const recursionIdentity = type.checker.getRecursionIdentity(type);
        if (recursionIdentity) {
          recursionToken = recursionIdentityMap.get(recursionIdentity);
          if (!recursionToken) {
            recursionToken = recursionIdentityMap.size;
            recursionIdentityMap.set(recursionIdentity, recursionToken);
          }
        }
        const descriptor = {
          id: type.id,
          intrinsicName: type.intrinsicName,
          symbolName: (symbol == null ? void 0 : symbol.escapedName) && unescapeLeadingUnderscores(symbol.escapedName),
          recursionId: recursionToken,
          isTuple: objectFlags & 8 /* Tuple */ ? true : void 0,
          unionTypes: type.flags & 1048576 /* Union */ ? (_p = type.types) == null ? void 0 : _p.map((t) => t.id) : void 0,
          intersectionTypes: type.flags & 2097152 /* Intersection */ ? type.types.map((t) => t.id) : void 0,
          aliasTypeArguments: (_q = type.aliasTypeArguments) == null ? void 0 : _q.map((t) => t.id),
          keyofType: type.flags & 4194304 /* Index */ ? (_r = type.type) == null ? void 0 : _r.id : void 0,
          ...indexedAccessProperties,
          ...referenceProperties,
          ...conditionalProperties,
          ...substitutionProperties,
          ...reverseMappedProperties,
          ...evolvingArrayProperties,
          destructuringPattern: getLocation(type.pattern),
          firstDeclaration: getLocation((_s = symbol == null ? void 0 : symbol.declarations) == null ? void 0 : _s[0]),
          flags: Debug.formatTypeFlags(type.flags).split("|"),
          display
        };
        fs.writeSync(typesFd, JSON.stringify(descriptor));
        if (i < numTypes - 1) {
          fs.writeSync(typesFd, ",\n");
        }
      }
      fs.writeSync(typesFd, "]\n");
      fs.closeSync(typesFd);
      mark("endDumpTypes");
      measure("Dump types", "beginDumpTypes", "endDumpTypes");
    }
    function dumpLegend() {
      if (!legendPath) {
        return;
      }
      fs.writeFileSync(legendPath, JSON.stringify(legend));
    }
    tracingEnabled2.dumpLegend = dumpLegend;
  })(tracingEnabled || (tracingEnabled = {}));
  var startTracing = tracingEnabled.startTracing;
  var dumpTracingLegend = tracingEnabled.dumpLegend;
  
  // src/compiler/types.ts
  var SyntaxKind = /* @__PURE__ */ ((SyntaxKind4) => {
    SyntaxKind4[SyntaxKind4["Unknown"] = 0] = "Unknown";
    SyntaxKind4[SyntaxKind4["EndOfFileToken"] = 1] = "EndOfFileToken";
    SyntaxKind4[SyntaxKind4["SingleLineCommentTrivia"] = 2] = "SingleLineCommentTrivia";
    SyntaxKind4[SyntaxKind4["MultiLineCommentTrivia"] = 3] = "MultiLineCommentTrivia";
    SyntaxKind4[SyntaxKind4["NewLineTrivia"] = 4] = "NewLineTrivia";
    SyntaxKind4[SyntaxKind4["WhitespaceTrivia"] = 5] = "WhitespaceTrivia";
    SyntaxKind4[SyntaxKind4["ShebangTrivia"] = 6] = "ShebangTrivia";
    SyntaxKind4[SyntaxKind4["ConflictMarkerTrivia"] = 7] = "ConflictMarkerTrivia";
    SyntaxKind4[SyntaxKind4["NonTextFileMarkerTrivia"] = 8] = "NonTextFileMarkerTrivia";
    SyntaxKind4[SyntaxKind4["NumericLiteral"] = 9] = "NumericLiteral";
    SyntaxKind4[SyntaxKind4["BigIntLiteral"] = 10] = "BigIntLiteral";
    SyntaxKind4[SyntaxKind4["StringLiteral"] = 11] = "StringLiteral";
    SyntaxKind4[SyntaxKind4["JsxText"] = 12] = "JsxText";
    SyntaxKind4[SyntaxKind4["JsxTextAllWhiteSpaces"] = 13] = "JsxTextAllWhiteSpaces";
    SyntaxKind4[SyntaxKind4["RegularExpressionLiteral"] = 14] = "RegularExpressionLiteral";
    SyntaxKind4[SyntaxKind4["NoSubstitutionTemplateLiteral"] = 15] = "NoSubstitutionTemplateLiteral";
    SyntaxKind4[SyntaxKind4["TemplateHead"] = 16] = "TemplateHead";
    SyntaxKind4[SyntaxKind4["TemplateMiddle"] = 17] = "TemplateMiddle";
    SyntaxKind4[SyntaxKind4["TemplateTail"] = 18] = "TemplateTail";
    SyntaxKind4[SyntaxKind4["OpenBraceToken"] = 19] = "OpenBraceToken";
    SyntaxKind4[SyntaxKind4["CloseBraceToken"] = 20] = "CloseBraceToken";
    SyntaxKind4[SyntaxKind4["OpenParenToken"] = 21] = "OpenParenToken";
    SyntaxKind4[SyntaxKind4["CloseParenToken"] = 22] = "CloseParenToken";
    SyntaxKind4[SyntaxKind4["OpenBracketToken"] = 23] = "OpenBracketToken";
    SyntaxKind4[SyntaxKind4["CloseBracketToken"] = 24] = "CloseBracketToken";
    SyntaxKind4[SyntaxKind4["DotToken"] = 25] = "DotToken";
    SyntaxKind4[SyntaxKind4["DotDotDotToken"] = 26] = "DotDotDotToken";
    SyntaxKind4[SyntaxKind4["SemicolonToken"] = 27] = "SemicolonToken";
    SyntaxKind4[SyntaxKind4["CommaToken"] = 28] = "CommaToken";
    SyntaxKind4[SyntaxKind4["QuestionDotToken"] = 29] = "QuestionDotToken";
    SyntaxKind4[SyntaxKind4["LessThanToken"] = 30] = "LessThanToken";
    SyntaxKind4[SyntaxKind4["LessThanSlashToken"] = 31] = "LessThanSlashToken";
    SyntaxKind4[SyntaxKind4["GreaterThanToken"] = 32] = "GreaterThanToken";
    SyntaxKind4[SyntaxKind4["LessThanEqualsToken"] = 33] = "LessThanEqualsToken";
    SyntaxKind4[SyntaxKind4["GreaterThanEqualsToken"] = 34] = "GreaterThanEqualsToken";
    SyntaxKind4[SyntaxKind4["EqualsEqualsToken"] = 35] = "EqualsEqualsToken";
    SyntaxKind4[SyntaxKind4["ExclamationEqualsToken"] = 36] = "ExclamationEqualsToken";
    SyntaxKind4[SyntaxKind4["EqualsEqualsEqualsToken"] = 37] = "EqualsEqualsEqualsToken";
    SyntaxKind4[SyntaxKind4["ExclamationEqualsEqualsToken"] = 38] = "ExclamationEqualsEqualsToken";
    SyntaxKind4[SyntaxKind4["EqualsGreaterThanToken"] = 39] = "EqualsGreaterThanToken";
    SyntaxKind4[SyntaxKind4["PlusToken"] = 40] = "PlusToken";
    SyntaxKind4[SyntaxKind4["MinusToken"] = 41] = "MinusToken";
    SyntaxKind4[SyntaxKind4["AsteriskToken"] = 42] = "AsteriskToken";
    SyntaxKind4[SyntaxKind4["AsteriskAsteriskToken"] = 43] = "AsteriskAsteriskToken";
    SyntaxKind4[SyntaxKind4["SlashToken"] = 44] = "SlashToken";
    SyntaxKind4[SyntaxKind4["PercentToken"] = 45] = "PercentToken";
    SyntaxKind4[SyntaxKind4["PlusPlusToken"] = 46] = "PlusPlusToken";
    SyntaxKind4[SyntaxKind4["MinusMinusToken"] = 47] = "MinusMinusToken";
    SyntaxKind4[SyntaxKind4["LessThanLessThanToken"] = 48] = "LessThanLessThanToken";
    SyntaxKind4[SyntaxKind4["GreaterThanGreaterThanToken"] = 49] = "GreaterThanGreaterThanToken";
    SyntaxKind4[SyntaxKind4["GreaterThanGreaterThanGreaterThanToken"] = 50] = "GreaterThanGreaterThanGreaterThanToken";
    SyntaxKind4[SyntaxKind4["AmpersandToken"] = 51] = "AmpersandToken";
    SyntaxKind4[SyntaxKind4["BarToken"] = 52] = "BarToken";
    SyntaxKind4[SyntaxKind4["CaretToken"] = 53] = "CaretToken";
    SyntaxKind4[SyntaxKind4["ExclamationToken"] = 54] = "ExclamationToken";
    SyntaxKind4[SyntaxKind4["TildeToken"] = 55] = "TildeToken";
    SyntaxKind4[SyntaxKind4["AmpersandAmpersandToken"] = 56] = "AmpersandAmpersandToken";
    SyntaxKind4[SyntaxKind4["BarBarToken"] = 57] = "BarBarToken";
    SyntaxKind4[SyntaxKind4["QuestionToken"] = 58] = "QuestionToken";
    SyntaxKind4[SyntaxKind4["ColonToken"] = 59] = "ColonToken";
    SyntaxKind4[SyntaxKind4["AtToken"] = 60] = "AtToken";
    SyntaxKind4[SyntaxKind4["QuestionQuestionToken"] = 61] = "QuestionQuestionToken";
    SyntaxKind4[SyntaxKind4["BacktickToken"] = 62] = "BacktickToken";
    SyntaxKind4[SyntaxKind4["HashToken"] = 63] = "HashToken";
    SyntaxKind4[SyntaxKind4["EqualsToken"] = 64] = "EqualsToken";
    SyntaxKind4[SyntaxKind4["PlusEqualsToken"] = 65] = "PlusEqualsToken";
    SyntaxKind4[SyntaxKind4["MinusEqualsToken"] = 66] = "MinusEqualsToken";
    SyntaxKind4[SyntaxKind4["AsteriskEqualsToken"] = 67] = "AsteriskEqualsToken";
    SyntaxKind4[SyntaxKind4["AsteriskAsteriskEqualsToken"] = 68] = "AsteriskAsteriskEqualsToken";
    SyntaxKind4[SyntaxKind4["SlashEqualsToken"] = 69] = "SlashEqualsToken";
    SyntaxKind4[SyntaxKind4["PercentEqualsToken"] = 70] = "PercentEqualsToken";
    SyntaxKind4[SyntaxKind4["LessThanLessThanEqualsToken"] = 71] = "LessThanLessThanEqualsToken";
    SyntaxKind4[SyntaxKind4["GreaterThanGreaterThanEqualsToken"] = 72] = "GreaterThanGreaterThanEqualsToken";
    SyntaxKind4[SyntaxKind4["GreaterThanGreaterThanGreaterThanEqualsToken"] = 73] = "GreaterThanGreaterThanGreaterThanEqualsToken";
    SyntaxKind4[SyntaxKind4["AmpersandEqualsToken"] = 74] = "AmpersandEqualsToken";
    SyntaxKind4[SyntaxKind4["BarEqualsToken"] = 75] = "BarEqualsToken";
    SyntaxKind4[SyntaxKind4["BarBarEqualsToken"] = 76] = "BarBarEqualsToken";
    SyntaxKind4[SyntaxKind4["AmpersandAmpersandEqualsToken"] = 77] = "AmpersandAmpersandEqualsToken";
    SyntaxKind4[SyntaxKind4["QuestionQuestionEqualsToken"] = 78] = "QuestionQuestionEqualsToken";
    SyntaxKind4[SyntaxKind4["CaretEqualsToken"] = 79] = "CaretEqualsToken";
    SyntaxKind4[SyntaxKind4["Identifier"] = 80] = "Identifier";
    SyntaxKind4[SyntaxKind4["PrivateIdentifier"] = 81] = "PrivateIdentifier";
    SyntaxKind4[SyntaxKind4["JSDocCommentTextToken"] = 82] = "JSDocCommentTextToken";
    SyntaxKind4[SyntaxKind4["BreakKeyword"] = 83] = "BreakKeyword";
    SyntaxKind4[SyntaxKind4["CaseKeyword"] = 84] = "CaseKeyword";
    SyntaxKind4[SyntaxKind4["CatchKeyword"] = 85] = "CatchKeyword";
    SyntaxKind4[SyntaxKind4["ClassKeyword"] = 86] = "ClassKeyword";
    SyntaxKind4[SyntaxKind4["ConstKeyword"] = 87] = "ConstKeyword";
    SyntaxKind4[SyntaxKind4["ContinueKeyword"] = 88] = "ContinueKeyword";
    SyntaxKind4[SyntaxKind4["DebuggerKeyword"] = 89] = "DebuggerKeyword";
    SyntaxKind4[SyntaxKind4["DefaultKeyword"] = 90] = "DefaultKeyword";
    SyntaxKind4[SyntaxKind4["DeleteKeyword"] = 91] = "DeleteKeyword";
    SyntaxKind4[SyntaxKind4["DoKeyword"] = 92] = "DoKeyword";
    SyntaxKind4[SyntaxKind4["ElseKeyword"] = 93] = "ElseKeyword";
    SyntaxKind4[SyntaxKind4["EnumKeyword"] = 94] = "EnumKeyword";
    SyntaxKind4[SyntaxKind4["ExportKeyword"] = 95] = "ExportKeyword";
    SyntaxKind4[SyntaxKind4["ExtendsKeyword"] = 96] = "ExtendsKeyword";
    SyntaxKind4[SyntaxKind4["FalseKeyword"] = 97] = "FalseKeyword";
    SyntaxKind4[SyntaxKind4["FinallyKeyword"] = 98] = "FinallyKeyword";
    SyntaxKind4[SyntaxKind4["ForKeyword"] = 99] = "ForKeyword";
    SyntaxKind4[SyntaxKind4["FunctionKeyword"] = 100] = "FunctionKeyword";
    SyntaxKind4[SyntaxKind4["IfKeyword"] = 101] = "IfKeyword";
    SyntaxKind4[SyntaxKind4["ImportKeyword"] = 102] = "ImportKeyword";
    SyntaxKind4[SyntaxKind4["InKeyword"] = 103] = "InKeyword";
    SyntaxKind4[SyntaxKind4["InstanceOfKeyword"] = 104] = "InstanceOfKeyword";
    SyntaxKind4[SyntaxKind4["NewKeyword"] = 105] = "NewKeyword";
    SyntaxKind4[SyntaxKind4["NullKeyword"] = 106] = "NullKeyword";
    SyntaxKind4[SyntaxKind4["ReturnKeyword"] = 107] = "ReturnKeyword";
    SyntaxKind4[SyntaxKind4["SuperKeyword"] = 108] = "SuperKeyword";
    SyntaxKind4[SyntaxKind4["SwitchKeyword"] = 109] = "SwitchKeyword";
    SyntaxKind4[SyntaxKind4["ThisKeyword"] = 110] = "ThisKeyword";
    SyntaxKind4[SyntaxKind4["ThrowKeyword"] = 111] = "ThrowKeyword";
    SyntaxKind4[SyntaxKind4["TrueKeyword"] = 112] = "TrueKeyword";
    SyntaxKind4[SyntaxKind4["TryKeyword"] = 113] = "TryKeyword";
    SyntaxKind4[SyntaxKind4["TypeOfKeyword"] = 114] = "TypeOfKeyword";
    SyntaxKind4[SyntaxKind4["VarKeyword"] = 115] = "VarKeyword";
    SyntaxKind4[SyntaxKind4["VoidKeyword"] = 116] = "VoidKeyword";
    SyntaxKind4[SyntaxKind4["WhileKeyword"] = 117] = "WhileKeyword";
    SyntaxKind4[SyntaxKind4["WithKeyword"] = 118] = "WithKeyword";
    SyntaxKind4[SyntaxKind4["ImplementsKeyword"] = 119] = "ImplementsKeyword";
    SyntaxKind4[SyntaxKind4["InterfaceKeyword"] = 120] = "InterfaceKeyword";
    SyntaxKind4[SyntaxKind4["LetKeyword"] = 121] = "LetKeyword";
    SyntaxKind4[SyntaxKind4["PackageKeyword"] = 122] = "PackageKeyword";
    SyntaxKind4[SyntaxKind4["PrivateKeyword"] = 123] = "PrivateKeyword";
    SyntaxKind4[SyntaxKind4["ProtectedKeyword"] = 124] = "ProtectedKeyword";
    SyntaxKind4[SyntaxKind4["PublicKeyword"] = 125] = "PublicKeyword";
    SyntaxKind4[SyntaxKind4["StaticKeyword"] = 126] = "StaticKeyword";
    SyntaxKind4[SyntaxKind4["YieldKeyword"] = 127] = "YieldKeyword";
    SyntaxKind4[SyntaxKind4["AbstractKeyword"] = 128] = "AbstractKeyword";
    SyntaxKind4[SyntaxKind4["AccessorKeyword"] = 129] = "AccessorKeyword";
    SyntaxKind4[SyntaxKind4["AsKeyword"] = 130] = "AsKeyword";
    SyntaxKind4[SyntaxKind4["AssertsKeyword"] = 131] = "AssertsKeyword";
    SyntaxKind4[SyntaxKind4["AssertKeyword"] = 132] = "AssertKeyword";
    SyntaxKind4[SyntaxKind4["AnyKeyword"] = 133] = "AnyKeyword";
    SyntaxKind4[SyntaxKind4["AsyncKeyword"] = 134] = "AsyncKeyword";
    SyntaxKind4[SyntaxKind4["AwaitKeyword"] = 135] = "AwaitKeyword";
    SyntaxKind4[SyntaxKind4["BooleanKeyword"] = 136] = "BooleanKeyword";
    SyntaxKind4[SyntaxKind4["ConstructorKeyword"] = 137] = "ConstructorKeyword";
    SyntaxKind4[SyntaxKind4["DeclareKeyword"] = 138] = "DeclareKeyword";
    SyntaxKind4[SyntaxKind4["GetKeyword"] = 139] = "GetKeyword";
    SyntaxKind4[SyntaxKind4["InferKeyword"] = 140] = "InferKeyword";
    SyntaxKind4[SyntaxKind4["IntrinsicKeyword"] = 141] = "IntrinsicKeyword";
    SyntaxKind4[SyntaxKind4["IsKeyword"] = 142] = "IsKeyword";
    SyntaxKind4[SyntaxKind4["KeyOfKeyword"] = 143] = "KeyOfKeyword";
    SyntaxKind4[SyntaxKind4["ModuleKeyword"] = 144] = "ModuleKeyword";
    SyntaxKind4[SyntaxKind4["NamespaceKeyword"] = 145] = "NamespaceKeyword";
    SyntaxKind4[SyntaxKind4["NeverKeyword"] = 146] = "NeverKeyword";
    SyntaxKind4[SyntaxKind4["OutKeyword"] = 147] = "OutKeyword";
    SyntaxKind4[SyntaxKind4["ReadonlyKeyword"] = 148] = "ReadonlyKeyword";
    SyntaxKind4[SyntaxKind4["RequireKeyword"] = 149] = "RequireKeyword";
    SyntaxKind4[SyntaxKind4["NumberKeyword"] = 150] = "NumberKeyword";
    SyntaxKind4[SyntaxKind4["ObjectKeyword"] = 151] = "ObjectKeyword";
    SyntaxKind4[SyntaxKind4["SatisfiesKeyword"] = 152] = "SatisfiesKeyword";
    SyntaxKind4[SyntaxKind4["SetKeyword"] = 153] = "SetKeyword";
    SyntaxKind4[SyntaxKind4["StringKeyword"] = 154] = "StringKeyword";
    SyntaxKind4[SyntaxKind4["SymbolKeyword"] = 155] = "SymbolKeyword";
    SyntaxKind4[SyntaxKind4["TypeKeyword"] = 156] = "TypeKeyword";
    SyntaxKind4[SyntaxKind4["UndefinedKeyword"] = 157] = "UndefinedKeyword";
    SyntaxKind4[SyntaxKind4["UniqueKeyword"] = 158] = "UniqueKeyword";
    SyntaxKind4[SyntaxKind4["UnknownKeyword"] = 159] = "UnknownKeyword";
    SyntaxKind4[SyntaxKind4["UsingKeyword"] = 160] = "UsingKeyword";
    SyntaxKind4[SyntaxKind4["FromKeyword"] = 161] = "FromKeyword";
    SyntaxKind4[SyntaxKind4["GlobalKeyword"] = 162] = "GlobalKeyword";
    SyntaxKind4[SyntaxKind4["BigIntKeyword"] = 163] = "BigIntKeyword";
    SyntaxKind4[SyntaxKind4["OverrideKeyword"] = 164] = "OverrideKeyword";
    SyntaxKind4[SyntaxKind4["OfKeyword"] = 165] = "OfKeyword";
    SyntaxKind4[SyntaxKind4["QualifiedName"] = 166] = "QualifiedName";
    SyntaxKind4[SyntaxKind4["ComputedPropertyName"] = 167] = "ComputedPropertyName";
    SyntaxKind4[SyntaxKind4["TypeParameter"] = 168] = "TypeParameter";
    SyntaxKind4[SyntaxKind4["Parameter"] = 169] = "Parameter";
    SyntaxKind4[SyntaxKind4["Decorator"] = 170] = "Decorator";
    SyntaxKind4[SyntaxKind4["PropertySignature"] = 171] = "PropertySignature";
    SyntaxKind4[SyntaxKind4["PropertyDeclaration"] = 172] = "PropertyDeclaration";
    SyntaxKind4[SyntaxKind4["MethodSignature"] = 173] = "MethodSignature";
    SyntaxKind4[SyntaxKind4["MethodDeclaration"] = 174] = "MethodDeclaration";
    SyntaxKind4[SyntaxKind4["ClassStaticBlockDeclaration"] = 175] = "ClassStaticBlockDeclaration";
    SyntaxKind4[SyntaxKind4["Constructor"] = 176] = "Constructor";
    SyntaxKind4[SyntaxKind4["GetAccessor"] = 177] = "GetAccessor";
    SyntaxKind4[SyntaxKind4["SetAccessor"] = 178] = "SetAccessor";
    SyntaxKind4[SyntaxKind4["CallSignature"] = 179] = "CallSignature";
    SyntaxKind4[SyntaxKind4["ConstructSignature"] = 180] = "ConstructSignature";
    SyntaxKind4[SyntaxKind4["IndexSignature"] = 181] = "IndexSignature";
    SyntaxKind4[SyntaxKind4["TypePredicate"] = 182] = "TypePredicate";
    SyntaxKind4[SyntaxKind4["TypeReference"] = 183] = "TypeReference";
    SyntaxKind4[SyntaxKind4["FunctionType"] = 184] = "FunctionType";
    SyntaxKind4[SyntaxKind4["ConstructorType"] = 185] = "ConstructorType";
    SyntaxKind4[SyntaxKind4["TypeQuery"] = 186] = "TypeQuery";
    SyntaxKind4[SyntaxKind4["TypeLiteral"] = 187] = "TypeLiteral";
    SyntaxKind4[SyntaxKind4["ArrayType"] = 188] = "ArrayType";
    SyntaxKind4[SyntaxKind4["TupleType"] = 189] = "TupleType";
    SyntaxKind4[SyntaxKind4["OptionalType"] = 190] = "OptionalType";
    SyntaxKind4[SyntaxKind4["RestType"] = 191] = "RestType";
    SyntaxKind4[SyntaxKind4["UnionType"] = 192] = "UnionType";
    SyntaxKind4[SyntaxKind4["IntersectionType"] = 193] = "IntersectionType";
    SyntaxKind4[SyntaxKind4["ConditionalType"] = 194] = "ConditionalType";
    SyntaxKind4[SyntaxKind4["InferType"] = 195] = "InferType";
    SyntaxKind4[SyntaxKind4["ParenthesizedType"] = 196] = "ParenthesizedType";
    SyntaxKind4[SyntaxKind4["ThisType"] = 197] = "ThisType";
    SyntaxKind4[SyntaxKind4["TypeOperator"] = 198] = "TypeOperator";
    SyntaxKind4[SyntaxKind4["IndexedAccessType"] = 199] = "IndexedAccessType";
    SyntaxKind4[SyntaxKind4["MappedType"] = 200] = "MappedType";
    SyntaxKind4[SyntaxKind4["LiteralType"] = 201] = "LiteralType";
    SyntaxKind4[SyntaxKind4["NamedTupleMember"] = 202] = "NamedTupleMember";
    SyntaxKind4[SyntaxKind4["TemplateLiteralType"] = 203] = "TemplateLiteralType";
    SyntaxKind4[SyntaxKind4["TemplateLiteralTypeSpan"] = 204] = "TemplateLiteralTypeSpan";
    SyntaxKind4[SyntaxKind4["ImportType"] = 205] = "ImportType";
    SyntaxKind4[SyntaxKind4["ObjectBindingPattern"] = 206] = "ObjectBindingPattern";
    SyntaxKind4[SyntaxKind4["ArrayBindingPattern"] = 207] = "ArrayBindingPattern";
    SyntaxKind4[SyntaxKind4["BindingElement"] = 208] = "BindingElement";
    SyntaxKind4[SyntaxKind4["ArrayLiteralExpression"] = 209] = "ArrayLiteralExpression";
    SyntaxKind4[SyntaxKind4["ObjectLiteralExpression"] = 210] = "ObjectLiteralExpression";
    SyntaxKind4[SyntaxKind4["PropertyAccessExpression"] = 211] = "PropertyAccessExpression";
    SyntaxKind4[SyntaxKind4["ElementAccessExpression"] = 212] = "ElementAccessExpression";
    SyntaxKind4[SyntaxKind4["CallExpression"] = 213] = "CallExpression";
    SyntaxKind4[SyntaxKind4["NewExpression"] = 214] = "NewExpression";
    SyntaxKind4[SyntaxKind4["TaggedTemplateExpression"] = 215] = "TaggedTemplateExpression";
    SyntaxKind4[SyntaxKind4["TypeAssertionExpression"] = 216] = "TypeAssertionExpression";
    SyntaxKind4[SyntaxKind4["ParenthesizedExpression"] = 217] = "ParenthesizedExpression";
    SyntaxKind4[SyntaxKind4["FunctionExpression"] = 218] = "FunctionExpression";
    SyntaxKind4[SyntaxKind4["ArrowFunction"] = 219] = "ArrowFunction";
    SyntaxKind4[SyntaxKind4["DeleteExpression"] = 220] = "DeleteExpression";
    SyntaxKind4[SyntaxKind4["TypeOfExpression"] = 221] = "TypeOfExpression";
    SyntaxKind4[SyntaxKind4["VoidExpression"] = 222] = "VoidExpression";
    SyntaxKind4[SyntaxKind4["AwaitExpression"] = 223] = "AwaitExpression";
    SyntaxKind4[SyntaxKind4["PrefixUnaryExpression"] = 224] = "PrefixUnaryExpression";
    SyntaxKind4[SyntaxKind4["PostfixUnaryExpression"] = 225] = "PostfixUnaryExpression";
    SyntaxKind4[SyntaxKind4["BinaryExpression"] = 226] = "BinaryExpression";
    SyntaxKind4[SyntaxKind4["ConditionalExpression"] = 227] = "ConditionalExpression";
    SyntaxKind4[SyntaxKind4["TemplateExpression"] = 228] = "TemplateExpression";
    SyntaxKind4[SyntaxKind4["YieldExpression"] = 229] = "YieldExpression";
    SyntaxKind4[SyntaxKind4["SpreadElement"] = 230] = "SpreadElement";
    SyntaxKind4[SyntaxKind4["ClassExpression"] = 231] = "ClassExpression";
    SyntaxKind4[SyntaxKind4["OmittedExpression"] = 232] = "OmittedExpression";
    SyntaxKind4[SyntaxKind4["ExpressionWithTypeArguments"] = 233] = "ExpressionWithTypeArguments";
    SyntaxKind4[SyntaxKind4["AsExpression"] = 234] = "AsExpression";
    SyntaxKind4[SyntaxKind4["NonNullExpression"] = 235] = "NonNullExpression";
    SyntaxKind4[SyntaxKind4["MetaProperty"] = 236] = "MetaProperty";
    SyntaxKind4[SyntaxKind4["SyntheticExpression"] = 237] = "SyntheticExpression";
    SyntaxKind4[SyntaxKind4["SatisfiesExpression"] = 238] = "SatisfiesExpression";
    SyntaxKind4[SyntaxKind4["TemplateSpan"] = 239] = "TemplateSpan";
    SyntaxKind4[SyntaxKind4["SemicolonClassElement"] = 240] = "SemicolonClassElement";
    SyntaxKind4[SyntaxKind4["Block"] = 241] = "Block";
    SyntaxKind4[SyntaxKind4["EmptyStatement"] = 242] = "EmptyStatement";
    SyntaxKind4[SyntaxKind4["VariableStatement"] = 243] = "VariableStatement";
    SyntaxKind4[SyntaxKind4["ExpressionStatement"] = 244] = "ExpressionStatement";
    SyntaxKind4[SyntaxKind4["IfStatement"] = 245] = "IfStatement";
    SyntaxKind4[SyntaxKind4["DoStatement"] = 246] = "DoStatement";
    SyntaxKind4[SyntaxKind4["WhileStatement"] = 247] = "WhileStatement";
    SyntaxKind4[SyntaxKind4["ForStatement"] = 248] = "ForStatement";
    SyntaxKind4[SyntaxKind4["ForInStatement"] = 249] = "ForInStatement";
    SyntaxKind4[SyntaxKind4["ForOfStatement"] = 250] = "ForOfStatement";
    SyntaxKind4[SyntaxKind4["ContinueStatement"] = 251] = "ContinueStatement";
    SyntaxKind4[SyntaxKind4["BreakStatement"] = 252] = "BreakStatement";
    SyntaxKind4[SyntaxKind4["ReturnStatement"] = 253] = "ReturnStatement";
    SyntaxKind4[SyntaxKind4["WithStatement"] = 254] = "WithStatement";
    SyntaxKind4[SyntaxKind4["SwitchStatement"] = 255] = "SwitchStatement";
    SyntaxKind4[SyntaxKind4["LabeledStatement"] = 256] = "LabeledStatement";
    SyntaxKind4[SyntaxKind4["ThrowStatement"] = 257] = "ThrowStatement";
    SyntaxKind4[SyntaxKind4["TryStatement"] = 258] = "TryStatement";
    SyntaxKind4[SyntaxKind4["DebuggerStatement"] = 259] = "DebuggerStatement";
    SyntaxKind4[SyntaxKind4["VariableDeclaration"] = 260] = "VariableDeclaration";
    SyntaxKind4[SyntaxKind4["VariableDeclarationList"] = 261] = "VariableDeclarationList";
    SyntaxKind4[SyntaxKind4["FunctionDeclaration"] = 262] = "FunctionDeclaration";
    SyntaxKind4[SyntaxKind4["ClassDeclaration"] = 263] = "ClassDeclaration";
    SyntaxKind4[SyntaxKind4["InterfaceDeclaration"] = 264] = "InterfaceDeclaration";
    SyntaxKind4[SyntaxKind4["TypeAliasDeclaration"] = 265] = "TypeAliasDeclaration";
    SyntaxKind4[SyntaxKind4["EnumDeclaration"] = 266] = "EnumDeclaration";
    SyntaxKind4[SyntaxKind4["ModuleDeclaration"] = 267] = "ModuleDeclaration";
    SyntaxKind4[SyntaxKind4["ModuleBlock"] = 268] = "ModuleBlock";
    SyntaxKind4[SyntaxKind4["CaseBlock"] = 269] = "CaseBlock";
    SyntaxKind4[SyntaxKind4["NamespaceExportDeclaration"] = 270] = "NamespaceExportDeclaration";
    SyntaxKind4[SyntaxKind4["ImportEqualsDeclaration"] = 271] = "ImportEqualsDeclaration";
    SyntaxKind4[SyntaxKind4["ImportDeclaration"] = 272] = "ImportDeclaration";
    SyntaxKind4[SyntaxKind4["ImportClause"] = 273] = "ImportClause";
    SyntaxKind4[SyntaxKind4["NamespaceImport"] = 274] = "NamespaceImport";
    SyntaxKind4[SyntaxKind4["NamedImports"] = 275] = "NamedImports";
    SyntaxKind4[SyntaxKind4["ImportSpecifier"] = 276] = "ImportSpecifier";
    SyntaxKind4[SyntaxKind4["ExportAssignment"] = 277] = "ExportAssignment";
    SyntaxKind4[SyntaxKind4["ExportDeclaration"] = 278] = "ExportDeclaration";
    SyntaxKind4[SyntaxKind4["NamedExports"] = 279] = "NamedExports";
    SyntaxKind4[SyntaxKind4["NamespaceExport"] = 280] = "NamespaceExport";
    SyntaxKind4[SyntaxKind4["ExportSpecifier"] = 281] = "ExportSpecifier";
    SyntaxKind4[SyntaxKind4["MissingDeclaration"] = 282] = "MissingDeclaration";
    SyntaxKind4[SyntaxKind4["ExternalModuleReference"] = 283] = "ExternalModuleReference";
    SyntaxKind4[SyntaxKind4["JsxElement"] = 284] = "JsxElement";
    SyntaxKind4[SyntaxKind4["JsxSelfClosingElement"] = 285] = "JsxSelfClosingElement";
    SyntaxKind4[SyntaxKind4["JsxOpeningElement"] = 286] = "JsxOpeningElement";
    SyntaxKind4[SyntaxKind4["JsxClosingElement"] = 287] = "JsxClosingElement";
    SyntaxKind4[SyntaxKind4["JsxFragment"] = 288] = "JsxFragment";
    SyntaxKind4[SyntaxKind4["JsxOpeningFragment"] = 289] = "JsxOpeningFragment";
    SyntaxKind4[SyntaxKind4["JsxClosingFragment"] = 290] = "JsxClosingFragment";
    SyntaxKind4[SyntaxKind4["JsxAttribute"] = 291] = "JsxAttribute";
    SyntaxKind4[SyntaxKind4["JsxAttributes"] = 292] = "JsxAttributes";
    SyntaxKind4[SyntaxKind4["JsxSpreadAttribute"] = 293] = "JsxSpreadAttribute";
    SyntaxKind4[SyntaxKind4["JsxExpression"] = 294] = "JsxExpression";
    SyntaxKind4[SyntaxKind4["JsxNamespacedName"] = 295] = "JsxNamespacedName";
    SyntaxKind4[SyntaxKind4["CaseClause"] = 296] = "CaseClause";
    SyntaxKind4[SyntaxKind4["DefaultClause"] = 297] = "DefaultClause";
    SyntaxKind4[SyntaxKind4["HeritageClause"] = 298] = "HeritageClause";
    SyntaxKind4[SyntaxKind4["CatchClause"] = 299] = "CatchClause";
    SyntaxKind4[SyntaxKind4["ImportAttributes"] = 300] = "ImportAttributes";
    SyntaxKind4[SyntaxKind4["ImportAttribute"] = 301] = "ImportAttribute";
    SyntaxKind4[SyntaxKind4["AssertClause"] = 300 /* ImportAttributes */] = "AssertClause";
    SyntaxKind4[SyntaxKind4["AssertEntry"] = 301 /* ImportAttribute */] = "AssertEntry";
    SyntaxKind4[SyntaxKind4["ImportTypeAssertionContainer"] = 302] = "ImportTypeAssertionContainer";
    SyntaxKind4[SyntaxKind4["PropertyAssignment"] = 303] = "PropertyAssignment";
    SyntaxKind4[SyntaxKind4["ShorthandPropertyAssignment"] = 304] = "ShorthandPropertyAssignment";
    SyntaxKind4[SyntaxKind4["SpreadAssignment"] = 305] = "SpreadAssignment";
    SyntaxKind4[SyntaxKind4["EnumMember"] = 306] = "EnumMember";
    SyntaxKind4[SyntaxKind4["UnparsedPrologue"] = 307] = "UnparsedPrologue";
    SyntaxKind4[SyntaxKind4["UnparsedPrepend"] = 308] = "UnparsedPrepend";
    SyntaxKind4[SyntaxKind4["UnparsedText"] = 309] = "UnparsedText";
    SyntaxKind4[SyntaxKind4["UnparsedInternalText"] = 310] = "UnparsedInternalText";
    SyntaxKind4[SyntaxKind4["UnparsedSyntheticReference"] = 311] = "UnparsedSyntheticReference";
    SyntaxKind4[SyntaxKind4["SourceFile"] = 312] = "SourceFile";
    SyntaxKind4[SyntaxKind4["Bundle"] = 313] = "Bundle";
    SyntaxKind4[SyntaxKind4["UnparsedSource"] = 314] = "UnparsedSource";
    SyntaxKind4[SyntaxKind4["InputFiles"] = 315] = "InputFiles";
    SyntaxKind4[SyntaxKind4["JSDocTypeExpression"] = 316] = "JSDocTypeExpression";
    SyntaxKind4[SyntaxKind4["JSDocNameReference"] = 317] = "JSDocNameReference";
    SyntaxKind4[SyntaxKind4["JSDocMemberName"] = 318] = "JSDocMemberName";
    SyntaxKind4[SyntaxKind4["JSDocAllType"] = 319] = "JSDocAllType";
    SyntaxKind4[SyntaxKind4["JSDocUnknownType"] = 320] = "JSDocUnknownType";
    SyntaxKind4[SyntaxKind4["JSDocNullableType"] = 321] = "JSDocNullableType";
    SyntaxKind4[SyntaxKind4["JSDocNonNullableType"] = 322] = "JSDocNonNullableType";
    SyntaxKind4[SyntaxKind4["JSDocOptionalType"] = 323] = "JSDocOptionalType";
    SyntaxKind4[SyntaxKind4["JSDocFunctionType"] = 324] = "JSDocFunctionType";
    SyntaxKind4[SyntaxKind4["JSDocVariadicType"] = 325] = "JSDocVariadicType";
    SyntaxKind4[SyntaxKind4["JSDocNamepathType"] = 326] = "JSDocNamepathType";
    SyntaxKind4[SyntaxKind4["JSDoc"] = 327] = "JSDoc";
    SyntaxKind4[SyntaxKind4["JSDocComment"] = 327 /* JSDoc */] = "JSDocComment";
    SyntaxKind4[SyntaxKind4["JSDocText"] = 328] = "JSDocText";
    SyntaxKind4[SyntaxKind4["JSDocTypeLiteral"] = 329] = "JSDocTypeLiteral";
    SyntaxKind4[SyntaxKind4["JSDocSignature"] = 330] = "JSDocSignature";
    SyntaxKind4[SyntaxKind4["JSDocLink"] = 331] = "JSDocLink";
    SyntaxKind4[SyntaxKind4["JSDocLinkCode"] = 332] = "JSDocLinkCode";
    SyntaxKind4[SyntaxKind4["JSDocLinkPlain"] = 333] = "JSDocLinkPlain";
    SyntaxKind4[SyntaxKind4["JSDocTag"] = 334] = "JSDocTag";
    SyntaxKind4[SyntaxKind4["JSDocAugmentsTag"] = 335] = "JSDocAugmentsTag";
    SyntaxKind4[SyntaxKind4["JSDocImplementsTag"] = 336] = "JSDocImplementsTag";
    SyntaxKind4[SyntaxKind4["JSDocAuthorTag"] = 337] = "JSDocAuthorTag";
    SyntaxKind4[SyntaxKind4["JSDocDeprecatedTag"] = 338] = "JSDocDeprecatedTag";
    SyntaxKind4[SyntaxKind4["JSDocClassTag"] = 339] = "JSDocClassTag";
    SyntaxKind4[SyntaxKind4["JSDocPublicTag"] = 340] = "JSDocPublicTag";
    SyntaxKind4[SyntaxKind4["JSDocPrivateTag"] = 341] = "JSDocPrivateTag";
    SyntaxKind4[SyntaxKind4["JSDocProtectedTag"] = 342] = "JSDocProtectedTag";
    SyntaxKind4[SyntaxKind4["JSDocReadonlyTag"] = 343] = "JSDocReadonlyTag";
    SyntaxKind4[SyntaxKind4["JSDocOverrideTag"] = 344] = "JSDocOverrideTag";
    SyntaxKind4[SyntaxKind4["JSDocCallbackTag"] = 345] = "JSDocCallbackTag";
    SyntaxKind4[SyntaxKind4["JSDocOverloadTag"] = 346] = "JSDocOverloadTag";
    SyntaxKind4[SyntaxKind4["JSDocEnumTag"] = 347] = "JSDocEnumTag";
    SyntaxKind4[SyntaxKind4["JSDocParameterTag"] = 348] = "JSDocParameterTag";
    SyntaxKind4[SyntaxKind4["JSDocReturnTag"] = 349] = "JSDocReturnTag";
    SyntaxKind4[SyntaxKind4["JSDocThisTag"] = 350] = "JSDocThisTag";
    SyntaxKind4[SyntaxKind4["JSDocTypeTag"] = 351] = "JSDocTypeTag";
    SyntaxKind4[SyntaxKind4["JSDocTemplateTag"] = 352] = "JSDocTemplateTag";
    SyntaxKind4[SyntaxKind4["JSDocTypedefTag"] = 353] = "JSDocTypedefTag";
    SyntaxKind4[SyntaxKind4["JSDocSeeTag"] = 354] = "JSDocSeeTag";
    SyntaxKind4[SyntaxKind4["JSDocPropertyTag"] = 355] = "JSDocPropertyTag";
    SyntaxKind4[SyntaxKind4["JSDocThrowsTag"] = 356] = "JSDocThrowsTag";
    SyntaxKind4[SyntaxKind4["JSDocSatisfiesTag"] = 357] = "JSDocSatisfiesTag";
    SyntaxKind4[SyntaxKind4["SyntaxList"] = 358] = "SyntaxList";
    SyntaxKind4[SyntaxKind4["NotEmittedStatement"] = 359] = "NotEmittedStatement";
    SyntaxKind4[SyntaxKind4["PartiallyEmittedExpression"] = 360] = "PartiallyEmittedExpression";
    SyntaxKind4[SyntaxKind4["CommaListExpression"] = 361] = "CommaListExpression";
    SyntaxKind4[SyntaxKind4["SyntheticReferenceExpression"] = 362] = "SyntheticReferenceExpression";
    SyntaxKind4[SyntaxKind4["Count"] = 363] = "Count";
    SyntaxKind4[SyntaxKind4["FirstAssignment"] = 64 /* EqualsToken */] = "FirstAssignment";
    SyntaxKind4[SyntaxKind4["LastAssignment"] = 79 /* CaretEqualsToken */] = "LastAssignment";
    SyntaxKind4[SyntaxKind4["FirstCompoundAssignment"] = 65 /* PlusEqualsToken */] = "FirstCompoundAssignment";
    SyntaxKind4[SyntaxKind4["LastCompoundAssignment"] = 79 /* CaretEqualsToken */] = "LastCompoundAssignment";
    SyntaxKind4[SyntaxKind4["FirstReservedWord"] = 83 /* BreakKeyword */] = "FirstReservedWord";
    SyntaxKind4[SyntaxKind4["LastReservedWord"] = 118 /* WithKeyword */] = "LastReservedWord";
    SyntaxKind4[SyntaxKind4["FirstKeyword"] = 83 /* BreakKeyword */] = "FirstKeyword";
    SyntaxKind4[SyntaxKind4["LastKeyword"] = 165 /* OfKeyword */] = "LastKeyword";
    SyntaxKind4[SyntaxKind4["FirstFutureReservedWord"] = 119 /* ImplementsKeyword */] = "FirstFutureReservedWord";
    SyntaxKind4[SyntaxKind4["LastFutureReservedWord"] = 127 /* YieldKeyword */] = "LastFutureReservedWord";
    SyntaxKind4[SyntaxKind4["FirstTypeNode"] = 182 /* TypePredicate */] = "FirstTypeNode";
    SyntaxKind4[SyntaxKind4["LastTypeNode"] = 205 /* ImportType */] = "LastTypeNode";
    SyntaxKind4[SyntaxKind4["FirstPunctuation"] = 19 /* OpenBraceToken */] = "FirstPunctuation";
    SyntaxKind4[SyntaxKind4["LastPunctuation"] = 79 /* CaretEqualsToken */] = "LastPunctuation";
    SyntaxKind4[SyntaxKind4["FirstToken"] = 0 /* Unknown */] = "FirstToken";
    SyntaxKind4[SyntaxKind4["LastToken"] = 165 /* LastKeyword */] = "LastToken";
    SyntaxKind4[SyntaxKind4["FirstTriviaToken"] = 2 /* SingleLineCommentTrivia */] = "FirstTriviaToken";
    SyntaxKind4[SyntaxKind4["LastTriviaToken"] = 7 /* ConflictMarkerTrivia */] = "LastTriviaToken";
    SyntaxKind4[SyntaxKind4["FirstLiteralToken"] = 9 /* NumericLiteral */] = "FirstLiteralToken";
    SyntaxKind4[SyntaxKind4["LastLiteralToken"] = 15 /* NoSubstitutionTemplateLiteral */] = "LastLiteralToken";
    SyntaxKind4[SyntaxKind4["FirstTemplateToken"] = 15 /* NoSubstitutionTemplateLiteral */] = "FirstTemplateToken";
    SyntaxKind4[SyntaxKind4["LastTemplateToken"] = 18 /* TemplateTail */] = "LastTemplateToken";
    SyntaxKind4[SyntaxKind4["FirstBinaryOperator"] = 30 /* LessThanToken */] = "FirstBinaryOperator";
    SyntaxKind4[SyntaxKind4["LastBinaryOperator"] = 79 /* CaretEqualsToken */] = "LastBinaryOperator";
    SyntaxKind4[SyntaxKind4["FirstStatement"] = 243 /* VariableStatement */] = "FirstStatement";
    SyntaxKind4[SyntaxKind4["LastStatement"] = 259 /* DebuggerStatement */] = "LastStatement";
    SyntaxKind4[SyntaxKind4["FirstNode"] = 166 /* QualifiedName */] = "FirstNode";
    SyntaxKind4[SyntaxKind4["FirstJSDocNode"] = 316 /* JSDocTypeExpression */] = "FirstJSDocNode";
    SyntaxKind4[SyntaxKind4["LastJSDocNode"] = 357 /* JSDocSatisfiesTag */] = "LastJSDocNode";
    SyntaxKind4[SyntaxKind4["FirstJSDocTagNode"] = 334 /* JSDocTag */] = "FirstJSDocTagNode";
    SyntaxKind4[SyntaxKind4["LastJSDocTagNode"] = 357 /* JSDocSatisfiesTag */] = "LastJSDocTagNode";
    SyntaxKind4[SyntaxKind4["FirstContextualKeyword"] = 128 /* AbstractKeyword */] = "FirstContextualKeyword";
    SyntaxKind4[SyntaxKind4["LastContextualKeyword"] = 165 /* OfKeyword */] = "LastContextualKeyword";
    return SyntaxKind4;
  })(SyntaxKind || {});
  var NodeFlags = /* @__PURE__ */ ((NodeFlags3) => {
    NodeFlags3[NodeFlags3["None"] = 0] = "None";
    NodeFlags3[NodeFlags3["Let"] = 1] = "Let";
    NodeFlags3[NodeFlags3["Const"] = 2] = "Const";
    NodeFlags3[NodeFlags3["Using"] = 4] = "Using";
    NodeFlags3[NodeFlags3["AwaitUsing"] = 6] = "AwaitUsing";
    NodeFlags3[NodeFlags3["NestedNamespace"] = 8] = "NestedNamespace";
    NodeFlags3[NodeFlags3["Synthesized"] = 16] = "Synthesized";
    NodeFlags3[NodeFlags3["Namespace"] = 32] = "Namespace";
    NodeFlags3[NodeFlags3["OptionalChain"] = 64] = "OptionalChain";
    NodeFlags3[NodeFlags3["ExportContext"] = 128] = "ExportContext";
    NodeFlags3[NodeFlags3["ContainsThis"] = 256] = "ContainsThis";
    NodeFlags3[NodeFlags3["HasImplicitReturn"] = 512] = "HasImplicitReturn";
    NodeFlags3[NodeFlags3["HasExplicitReturn"] = 1024] = "HasExplicitReturn";
    NodeFlags3[NodeFlags3["GlobalAugmentation"] = 2048] = "GlobalAugmentation";
    NodeFlags3[NodeFlags3["HasAsyncFunctions"] = 4096] = "HasAsyncFunctions";
    NodeFlags3[NodeFlags3["DisallowInContext"] = 8192] = "DisallowInContext";
    NodeFlags3[NodeFlags3["YieldContext"] = 16384] = "YieldContext";
    NodeFlags3[NodeFlags3["DecoratorContext"] = 32768] = "DecoratorContext";
    NodeFlags3[NodeFlags3["AwaitContext"] = 65536] = "AwaitContext";
    NodeFlags3[NodeFlags3["DisallowConditionalTypesContext"] = 131072] = "DisallowConditionalTypesContext";
    NodeFlags3[NodeFlags3["ThisNodeHasError"] = 262144] = "ThisNodeHasError";
    NodeFlags3[NodeFlags3["JavaScriptFile"] = 524288] = "JavaScriptFile";
    NodeFlags3[NodeFlags3["ThisNodeOrAnySubNodesHasError"] = 1048576] = "ThisNodeOrAnySubNodesHasError";
    NodeFlags3[NodeFlags3["HasAggregatedChildData"] = 2097152] = "HasAggregatedChildData";
    NodeFlags3[NodeFlags3["PossiblyContainsDynamicImport"] = 4194304] = "PossiblyContainsDynamicImport";
    NodeFlags3[NodeFlags3["PossiblyContainsImportMeta"] = 8388608] = "PossiblyContainsImportMeta";
    NodeFlags3[NodeFlags3["JSDoc"] = 16777216] = "JSDoc";
    NodeFlags3[NodeFlags3["Ambient"] = 33554432] = "Ambient";
    NodeFlags3[NodeFlags3["InWithStatement"] = 67108864] = "InWithStatement";
    NodeFlags3[NodeFlags3["JsonFile"] = 134217728] = "JsonFile";
    NodeFlags3[NodeFlags3["TypeCached"] = 268435456] = "TypeCached";
    NodeFlags3[NodeFlags3["Deprecated"] = 536870912] = "Deprecated";
    NodeFlags3[NodeFlags3["BlockScoped"] = 7] = "BlockScoped";
    NodeFlags3[NodeFlags3["Constant"] = 6] = "Constant";
    NodeFlags3[NodeFlags3["ReachabilityCheckFlags"] = 1536] = "ReachabilityCheckFlags";
    NodeFlags3[NodeFlags3["ReachabilityAndEmitFlags"] = 5632] = "ReachabilityAndEmitFlags";
    NodeFlags3[NodeFlags3["ContextFlags"] = 101441536] = "ContextFlags";
    NodeFlags3[NodeFlags3["TypeExcludesFlags"] = 81920] = "TypeExcludesFlags";
    NodeFlags3[NodeFlags3["PermanentlySetIncrementalFlags"] = 12582912] = "PermanentlySetIncrementalFlags";
    NodeFlags3[NodeFlags3["IdentifierHasExtendedUnicodeEscape"] = 256 /* ContainsThis */] = "IdentifierHasExtendedUnicodeEscape";
    NodeFlags3[NodeFlags3["IdentifierIsInJSDocNamespace"] = 4096 /* HasAsyncFunctions */] = "IdentifierIsInJSDocNamespace";
    return NodeFlags3;
  })(NodeFlags || {});
  var ModifierFlags = /* @__PURE__ */ ((ModifierFlags3) => {
    ModifierFlags3[ModifierFlags3["None"] = 0] = "None";
    ModifierFlags3[ModifierFlags3["Public"] = 1] = "Public";
    ModifierFlags3[ModifierFlags3["Private"] = 2] = "Private";
    ModifierFlags3[ModifierFlags3["Protected"] = 4] = "Protected";
    ModifierFlags3[ModifierFlags3["Readonly"] = 8] = "Readonly";
    ModifierFlags3[ModifierFlags3["Override"] = 16] = "Override";
    ModifierFlags3[ModifierFlags3["Export"] = 32] = "Export";
    ModifierFlags3[ModifierFlags3["Abstract"] = 64] = "Abstract";
    ModifierFlags3[ModifierFlags3["Ambient"] = 128] = "Ambient";
    ModifierFlags3[ModifierFlags3["Static"] = 256] = "Static";
    ModifierFlags3[ModifierFlags3["Accessor"] = 512] = "Accessor";
    ModifierFlags3[ModifierFlags3["Async"] = 1024] = "Async";
    ModifierFlags3[ModifierFlags3["Default"] = 2048] = "Default";
    ModifierFlags3[ModifierFlags3["Const"] = 4096] = "Const";
    ModifierFlags3[ModifierFlags3["In"] = 8192] = "In";
    ModifierFlags3[ModifierFlags3["Out"] = 16384] = "Out";
    ModifierFlags3[ModifierFlags3["Decorator"] = 32768] = "Decorator";
    ModifierFlags3[ModifierFlags3["Deprecated"] = 65536] = "Deprecated";
    ModifierFlags3[ModifierFlags3["JSDocPublic"] = 8388608] = "JSDocPublic";
    ModifierFlags3[ModifierFlags3["JSDocPrivate"] = 16777216] = "JSDocPrivate";
    ModifierFlags3[ModifierFlags3["JSDocProtected"] = 33554432] = "JSDocProtected";
    ModifierFlags3[ModifierFlags3["JSDocReadonly"] = 67108864] = "JSDocReadonly";
    ModifierFlags3[ModifierFlags3["JSDocOverride"] = 134217728] = "JSDocOverride";
    ModifierFlags3[ModifierFlags3["SyntacticOrJSDocModifiers"] = 31] = "SyntacticOrJSDocModifiers";
    ModifierFlags3[ModifierFlags3["SyntacticOnlyModifiers"] = 65504] = "SyntacticOnlyModifiers";
    ModifierFlags3[ModifierFlags3["SyntacticModifiers"] = 65535] = "SyntacticModifiers";
    ModifierFlags3[ModifierFlags3["JSDocCacheOnlyModifiers"] = 260046848] = "JSDocCacheOnlyModifiers";
    ModifierFlags3[ModifierFlags3["JSDocOnlyModifiers"] = 65536 /* Deprecated */] = "JSDocOnlyModifiers";
    ModifierFlags3[ModifierFlags3["NonCacheOnlyModifiers"] = 131071] = "NonCacheOnlyModifiers";
    ModifierFlags3[ModifierFlags3["HasComputedJSDocModifiers"] = 268435456] = "HasComputedJSDocModifiers";
    ModifierFlags3[ModifierFlags3["HasComputedFlags"] = 536870912] = "HasComputedFlags";
    ModifierFlags3[ModifierFlags3["AccessibilityModifier"] = 7] = "AccessibilityModifier";
    ModifierFlags3[ModifierFlags3["ParameterPropertyModifier"] = 31] = "ParameterPropertyModifier";
    ModifierFlags3[ModifierFlags3["NonPublicAccessibilityModifier"] = 6] = "NonPublicAccessibilityModifier";
    ModifierFlags3[ModifierFlags3["TypeScriptModifier"] = 28895] = "TypeScriptModifier";
    ModifierFlags3[ModifierFlags3["ExportDefault"] = 2080] = "ExportDefault";
    ModifierFlags3[ModifierFlags3["All"] = 131071] = "All";
    ModifierFlags3[ModifierFlags3["Modifier"] = 98303] = "Modifier";
    return ModifierFlags3;
  })(ModifierFlags || {});
  var RelationComparisonResult = /* @__PURE__ */ ((RelationComparisonResult3) => {
    RelationComparisonResult3[RelationComparisonResult3["None"] = 0] = "None";
    RelationComparisonResult3[RelationComparisonResult3["Succeeded"] = 1] = "Succeeded";
    RelationComparisonResult3[RelationComparisonResult3["Failed"] = 2] = "Failed";
    RelationComparisonResult3[RelationComparisonResult3["Reported"] = 4] = "Reported";
    RelationComparisonResult3[RelationComparisonResult3["ReportsUnmeasurable"] = 8] = "ReportsUnmeasurable";
    RelationComparisonResult3[RelationComparisonResult3["ReportsUnreliable"] = 16] = "ReportsUnreliable";
    RelationComparisonResult3[RelationComparisonResult3["ReportsMask"] = 24] = "ReportsMask";
    return RelationComparisonResult3;
  })(RelationComparisonResult || {});
  var GeneratedIdentifierFlags = /* @__PURE__ */ ((GeneratedIdentifierFlags2) => {
    GeneratedIdentifierFlags2[GeneratedIdentifierFlags2["None"] = 0] = "None";
    GeneratedIdentifierFlags2[GeneratedIdentifierFlags2["Auto"] = 1] = "Auto";
    GeneratedIdentifierFlags2[GeneratedIdentifierFlags2["Loop"] = 2] = "Loop";
    GeneratedIdentifierFlags2[GeneratedIdentifierFlags2["Unique"] = 3] = "Unique";
    GeneratedIdentifierFlags2[GeneratedIdentifierFlags2["Node"] = 4] = "Node";
    GeneratedIdentifierFlags2[GeneratedIdentifierFlags2["KindMask"] = 7] = "KindMask";
    GeneratedIdentifierFlags2[GeneratedIdentifierFlags2["ReservedInNestedScopes"] = 8] = "ReservedInNestedScopes";
    GeneratedIdentifierFlags2[GeneratedIdentifierFlags2["Optimistic"] = 16] = "Optimistic";
    GeneratedIdentifierFlags2[GeneratedIdentifierFlags2["FileLevel"] = 32] = "FileLevel";
    GeneratedIdentifierFlags2[GeneratedIdentifierFlags2["AllowNameSubstitution"] = 64] = "AllowNameSubstitution";
    return GeneratedIdentifierFlags2;
  })(GeneratedIdentifierFlags || {});
  var FlowFlags = /* @__PURE__ */ ((FlowFlags2) => {
    FlowFlags2[FlowFlags2["Unreachable"] = 1] = "Unreachable";
    FlowFlags2[FlowFlags2["Start"] = 2] = "Start";
    FlowFlags2[FlowFlags2["BranchLabel"] = 4] = "BranchLabel";
    FlowFlags2[FlowFlags2["LoopLabel"] = 8] = "LoopLabel";
    FlowFlags2[FlowFlags2["Assignment"] = 16] = "Assignment";
    FlowFlags2[FlowFlags2["TrueCondition"] = 32] = "TrueCondition";
    FlowFlags2[FlowFlags2["FalseCondition"] = 64] = "FalseCondition";
    FlowFlags2[FlowFlags2["SwitchClause"] = 128] = "SwitchClause";
    FlowFlags2[FlowFlags2["ArrayMutation"] = 256] = "ArrayMutation";
    FlowFlags2[FlowFlags2["Call"] = 512] = "Call";
    FlowFlags2[FlowFlags2["ReduceLabel"] = 1024] = "ReduceLabel";
    FlowFlags2[FlowFlags2["Referenced"] = 2048] = "Referenced";
    FlowFlags2[FlowFlags2["Shared"] = 4096] = "Shared";
    FlowFlags2[FlowFlags2["Label"] = 12] = "Label";
    FlowFlags2[FlowFlags2["Condition"] = 96] = "Condition";
    return FlowFlags2;
  })(FlowFlags || {});
  var OperationCanceledException = class {
  };
  var FileIncludeKind = /* @__PURE__ */ ((FileIncludeKind2) => {
    FileIncludeKind2[FileIncludeKind2["RootFile"] = 0] = "RootFile";
    FileIncludeKind2[FileIncludeKind2["SourceFromProjectReference"] = 1] = "SourceFromProjectReference";
    FileIncludeKind2[FileIncludeKind2["OutputFromProjectReference"] = 2] = "OutputFromProjectReference";
    FileIncludeKind2[FileIncludeKind2["Import"] = 3] = "Import";
    FileIncludeKind2[FileIncludeKind2["ReferenceFile"] = 4] = "ReferenceFile";
    FileIncludeKind2[FileIncludeKind2["TypeReferenceDirective"] = 5] = "TypeReferenceDirective";
    FileIncludeKind2[FileIncludeKind2["LibFile"] = 6] = "LibFile";
    FileIncludeKind2[FileIncludeKind2["LibReferenceDirective"] = 7] = "LibReferenceDirective";
    FileIncludeKind2[FileIncludeKind2["AutomaticTypeDirectiveFile"] = 8] = "AutomaticTypeDirectiveFile";
    return FileIncludeKind2;
  })(FileIncludeKind || {});
  var SymbolFlags = /* @__PURE__ */ ((SymbolFlags2) => {
    SymbolFlags2[SymbolFlags2["None"] = 0] = "None";
    SymbolFlags2[SymbolFlags2["FunctionScopedVariable"] = 1] = "FunctionScopedVariable";
    SymbolFlags2[SymbolFlags2["BlockScopedVariable"] = 2] = "BlockScopedVariable";
    SymbolFlags2[SymbolFlags2["Property"] = 4] = "Property";
    SymbolFlags2[SymbolFlags2["EnumMember"] = 8] = "EnumMember";
    SymbolFlags2[SymbolFlags2["Function"] = 16] = "Function";
    SymbolFlags2[SymbolFlags2["Class"] = 32] = "Class";
    SymbolFlags2[SymbolFlags2["Interface"] = 64] = "Interface";
    SymbolFlags2[SymbolFlags2["ConstEnum"] = 128] = "ConstEnum";
    SymbolFlags2[SymbolFlags2["RegularEnum"] = 256] = "RegularEnum";
    SymbolFlags2[SymbolFlags2["ValueModule"] = 512] = "ValueModule";
    SymbolFlags2[SymbolFlags2["NamespaceModule"] = 1024] = "NamespaceModule";
    SymbolFlags2[SymbolFlags2["TypeLiteral"] = 2048] = "TypeLiteral";
    SymbolFlags2[SymbolFlags2["ObjectLiteral"] = 4096] = "ObjectLiteral";
    SymbolFlags2[SymbolFlags2["Method"] = 8192] = "Method";
    SymbolFlags2[SymbolFlags2["Constructor"] = 16384] = "Constructor";
    SymbolFlags2[SymbolFlags2["GetAccessor"] = 32768] = "GetAccessor";
    SymbolFlags2[SymbolFlags2["SetAccessor"] = 65536] = "SetAccessor";
    SymbolFlags2[SymbolFlags2["Signature"] = 131072] = "Signature";
    SymbolFlags2[SymbolFlags2["TypeParameter"] = 262144] = "TypeParameter";
    SymbolFlags2[SymbolFlags2["TypeAlias"] = 524288] = "TypeAlias";
    SymbolFlags2[SymbolFlags2["ExportValue"] = 1048576] = "ExportValue";
    SymbolFlags2[SymbolFlags2["Alias"] = 2097152] = "Alias";
    SymbolFlags2[SymbolFlags2["Prototype"] = 4194304] = "Prototype";
    SymbolFlags2[SymbolFlags2["ExportStar"] = 8388608] = "ExportStar";
    SymbolFlags2[SymbolFlags2["Optional"] = 16777216] = "Optional";
    SymbolFlags2[SymbolFlags2["Transient"] = 33554432] = "Transient";
    SymbolFlags2[SymbolFlags2["Assignment"] = 67108864] = "Assignment";
    SymbolFlags2[SymbolFlags2["ModuleExports"] = 134217728] = "ModuleExports";
    SymbolFlags2[SymbolFlags2["All"] = -1] = "All";
    SymbolFlags2[SymbolFlags2["Enum"] = 384] = "Enum";
    SymbolFlags2[SymbolFlags2["Variable"] = 3] = "Variable";
    SymbolFlags2[SymbolFlags2["Value"] = 111551] = "Value";
    SymbolFlags2[SymbolFlags2["Type"] = 788968] = "Type";
    SymbolFlags2[SymbolFlags2["Namespace"] = 1920] = "Namespace";
    SymbolFlags2[SymbolFlags2["Module"] = 1536] = "Module";
    SymbolFlags2[SymbolFlags2["Accessor"] = 98304] = "Accessor";
    SymbolFlags2[SymbolFlags2["FunctionScopedVariableExcludes"] = 111550] = "FunctionScopedVariableExcludes";
    SymbolFlags2[SymbolFlags2["BlockScopedVariableExcludes"] = 111551 /* Value */] = "BlockScopedVariableExcludes";
    SymbolFlags2[SymbolFlags2["ParameterExcludes"] = 111551 /* Value */] = "ParameterExcludes";
    SymbolFlags2[SymbolFlags2["PropertyExcludes"] = 0 /* None */] = "PropertyExcludes";
    SymbolFlags2[SymbolFlags2["EnumMemberExcludes"] = 900095] = "EnumMemberExcludes";
    SymbolFlags2[SymbolFlags2["FunctionExcludes"] = 110991] = "FunctionExcludes";
    SymbolFlags2[SymbolFlags2["ClassExcludes"] = 899503] = "ClassExcludes";
    SymbolFlags2[SymbolFlags2["InterfaceExcludes"] = 788872] = "InterfaceExcludes";
    SymbolFlags2[SymbolFlags2["RegularEnumExcludes"] = 899327] = "RegularEnumExcludes";
    SymbolFlags2[SymbolFlags2["ConstEnumExcludes"] = 899967] = "ConstEnumExcludes";
    SymbolFlags2[SymbolFlags2["ValueModuleExcludes"] = 110735] = "ValueModuleExcludes";
    SymbolFlags2[SymbolFlags2["NamespaceModuleExcludes"] = 0] = "NamespaceModuleExcludes";
    SymbolFlags2[SymbolFlags2["MethodExcludes"] = 103359] = "MethodExcludes";
    SymbolFlags2[SymbolFlags2["GetAccessorExcludes"] = 46015] = "GetAccessorExcludes";
    SymbolFlags2[SymbolFlags2["SetAccessorExcludes"] = 78783] = "SetAccessorExcludes";
    SymbolFlags2[SymbolFlags2["AccessorExcludes"] = 13247] = "AccessorExcludes";
    SymbolFlags2[SymbolFlags2["TypeParameterExcludes"] = 526824] = "TypeParameterExcludes";
    SymbolFlags2[SymbolFlags2["TypeAliasExcludes"] = 788968 /* Type */] = "TypeAliasExcludes";
    SymbolFlags2[SymbolFlags2["AliasExcludes"] = 2097152 /* Alias */] = "AliasExcludes";
    SymbolFlags2[SymbolFlags2["ModuleMember"] = 2623475] = "ModuleMember";
    SymbolFlags2[SymbolFlags2["ExportHasLocal"] = 944] = "ExportHasLocal";
    SymbolFlags2[SymbolFlags2["BlockScoped"] = 418] = "BlockScoped";
    SymbolFlags2[SymbolFlags2["PropertyOrAccessor"] = 98308] = "PropertyOrAccessor";
    SymbolFlags2[SymbolFlags2["ClassMember"] = 106500] = "ClassMember";
    SymbolFlags2[SymbolFlags2["ExportSupportsDefaultModifier"] = 112] = "ExportSupportsDefaultModifier";
    SymbolFlags2[SymbolFlags2["ExportDoesNotSupportDefaultModifier"] = -113] = "ExportDoesNotSupportDefaultModifier";
    SymbolFlags2[SymbolFlags2["Classifiable"] = 2885600] = "Classifiable";
    SymbolFlags2[SymbolFlags2["LateBindingContainer"] = 6256] = "LateBindingContainer";
    return SymbolFlags2;
  })(SymbolFlags || {});
  var TypeFlags = /* @__PURE__ */ ((TypeFlags2) => {
    TypeFlags2[TypeFlags2["Any"] = 1] = "Any";
    TypeFlags2[TypeFlags2["Unknown"] = 2] = "Unknown";
    TypeFlags2[TypeFlags2["String"] = 4] = "String";
    TypeFlags2[TypeFlags2["Number"] = 8] = "Number";
    TypeFlags2[TypeFlags2["Boolean"] = 16] = "Boolean";
    TypeFlags2[TypeFlags2["Enum"] = 32] = "Enum";
    TypeFlags2[TypeFlags2["BigInt"] = 64] = "BigInt";
    TypeFlags2[TypeFlags2["StringLiteral"] = 128] = "StringLiteral";
    TypeFlags2[TypeFlags2["NumberLiteral"] = 256] = "NumberLiteral";
    TypeFlags2[TypeFlags2["BooleanLiteral"] = 512] = "BooleanLiteral";
    TypeFlags2[TypeFlags2["EnumLiteral"] = 1024] = "EnumLiteral";
    TypeFlags2[TypeFlags2["BigIntLiteral"] = 2048] = "BigIntLiteral";
    TypeFlags2[TypeFlags2["ESSymbol"] = 4096] = "ESSymbol";
    TypeFlags2[TypeFlags2["UniqueESSymbol"] = 8192] = "UniqueESSymbol";
    TypeFlags2[TypeFlags2["Void"] = 16384] = "Void";
    TypeFlags2[TypeFlags2["Undefined"] = 32768] = "Undefined";
    TypeFlags2[TypeFlags2["Null"] = 65536] = "Null";
    TypeFlags2[TypeFlags2["Never"] = 131072] = "Never";
    TypeFlags2[TypeFlags2["TypeParameter"] = 262144] = "TypeParameter";
    TypeFlags2[TypeFlags2["Object"] = 524288] = "Object";
    TypeFlags2[TypeFlags2["Union"] = 1048576] = "Union";
    TypeFlags2[TypeFlags2["Intersection"] = 2097152] = "Intersection";
    TypeFlags2[TypeFlags2["Index"] = 4194304] = "Index";
    TypeFlags2[TypeFlags2["IndexedAccess"] = 8388608] = "IndexedAccess";
    TypeFlags2[TypeFlags2["Conditional"] = 16777216] = "Conditional";
    TypeFlags2[TypeFlags2["Substitution"] = 33554432] = "Substitution";
    TypeFlags2[TypeFlags2["NonPrimitive"] = 67108864] = "NonPrimitive";
    TypeFlags2[TypeFlags2["TemplateLiteral"] = 134217728] = "TemplateLiteral";
    TypeFlags2[TypeFlags2["StringMapping"] = 268435456] = "StringMapping";
    TypeFlags2[TypeFlags2["Reserved1"] = 536870912] = "Reserved1";
    TypeFlags2[TypeFlags2["AnyOrUnknown"] = 3] = "AnyOrUnknown";
    TypeFlags2[TypeFlags2["Nullable"] = 98304] = "Nullable";
    TypeFlags2[TypeFlags2["Literal"] = 2944] = "Literal";
    TypeFlags2[TypeFlags2["Unit"] = 109472] = "Unit";
    TypeFlags2[TypeFlags2["Freshable"] = 2976] = "Freshable";
    TypeFlags2[TypeFlags2["StringOrNumberLiteral"] = 384] = "StringOrNumberLiteral";
    TypeFlags2[TypeFlags2["StringOrNumberLiteralOrUnique"] = 8576] = "StringOrNumberLiteralOrUnique";
    TypeFlags2[TypeFlags2["DefinitelyFalsy"] = 117632] = "DefinitelyFalsy";
    TypeFlags2[TypeFlags2["PossiblyFalsy"] = 117724] = "PossiblyFalsy";
    TypeFlags2[TypeFlags2["Intrinsic"] = 67359327] = "Intrinsic";
    TypeFlags2[TypeFlags2["StringLike"] = 402653316] = "StringLike";
    TypeFlags2[TypeFlags2["NumberLike"] = 296] = "NumberLike";
    TypeFlags2[TypeFlags2["BigIntLike"] = 2112] = "BigIntLike";
    TypeFlags2[TypeFlags2["BooleanLike"] = 528] = "BooleanLike";
    TypeFlags2[TypeFlags2["EnumLike"] = 1056] = "EnumLike";
    TypeFlags2[TypeFlags2["ESSymbolLike"] = 12288] = "ESSymbolLike";
    TypeFlags2[TypeFlags2["VoidLike"] = 49152] = "VoidLike";
    TypeFlags2[TypeFlags2["Primitive"] = 402784252] = "Primitive";
    TypeFlags2[TypeFlags2["DefinitelyNonNullable"] = 470302716] = "DefinitelyNonNullable";
    TypeFlags2[TypeFlags2["DisjointDomains"] = 469892092] = "DisjointDomains";
    TypeFlags2[TypeFlags2["UnionOrIntersection"] = 3145728] = "UnionOrIntersection";
    TypeFlags2[TypeFlags2["StructuredType"] = 3670016] = "StructuredType";
    TypeFlags2[TypeFlags2["TypeVariable"] = 8650752] = "TypeVariable";
    TypeFlags2[TypeFlags2["InstantiableNonPrimitive"] = 58982400] = "InstantiableNonPrimitive";
    TypeFlags2[TypeFlags2["InstantiablePrimitive"] = 406847488] = "InstantiablePrimitive";
    TypeFlags2[TypeFlags2["Instantiable"] = 465829888] = "Instantiable";
    TypeFlags2[TypeFlags2["StructuredOrInstantiable"] = 469499904] = "StructuredOrInstantiable";
    TypeFlags2[TypeFlags2["ObjectFlagsType"] = 3899393] = "ObjectFlagsType";
    TypeFlags2[TypeFlags2["Simplifiable"] = 25165824] = "Simplifiable";
    TypeFlags2[TypeFlags2["Singleton"] = 67358815] = "Singleton";
    TypeFlags2[TypeFlags2["Narrowable"] = 536624127] = "Narrowable";
    TypeFlags2[TypeFlags2["IncludesMask"] = 473694207] = "IncludesMask";
    TypeFlags2[TypeFlags2["IncludesMissingType"] = 262144 /* TypeParameter */] = "IncludesMissingType";
    TypeFlags2[TypeFlags2["IncludesNonWideningType"] = 4194304 /* Index */] = "IncludesNonWideningType";
    TypeFlags2[TypeFlags2["IncludesWildcard"] = 8388608 /* IndexedAccess */] = "IncludesWildcard";
    TypeFlags2[TypeFlags2["IncludesEmptyObject"] = 16777216 /* Conditional */] = "IncludesEmptyObject";
    TypeFlags2[TypeFlags2["IncludesInstantiable"] = 33554432 /* Substitution */] = "IncludesInstantiable";
    TypeFlags2[TypeFlags2["IncludesConstrainedTypeVariable"] = 536870912 /* Reserved1 */] = "IncludesConstrainedTypeVariable";
    TypeFlags2[TypeFlags2["NotPrimitiveUnion"] = 36323331] = "NotPrimitiveUnion";
    return TypeFlags2;
  })(TypeFlags || {});
  var ObjectFlags = /* @__PURE__ */ ((ObjectFlags3) => {
    ObjectFlags3[ObjectFlags3["None"] = 0] = "None";
    ObjectFlags3[ObjectFlags3["Class"] = 1] = "Class";
    ObjectFlags3[ObjectFlags3["Interface"] = 2] = "Interface";
    ObjectFlags3[ObjectFlags3["Reference"] = 4] = "Reference";
    ObjectFlags3[ObjectFlags3["Tuple"] = 8] = "Tuple";
    ObjectFlags3[ObjectFlags3["Anonymous"] = 16] = "Anonymous";
    ObjectFlags3[ObjectFlags3["Mapped"] = 32] = "Mapped";
    ObjectFlags3[ObjectFlags3["Instantiated"] = 64] = "Instantiated";
    ObjectFlags3[ObjectFlags3["ObjectLiteral"] = 128] = "ObjectLiteral";
    ObjectFlags3[ObjectFlags3["EvolvingArray"] = 256] = "EvolvingArray";
    ObjectFlags3[ObjectFlags3["ObjectLiteralPatternWithComputedProperties"] = 512] = "ObjectLiteralPatternWithComputedProperties";
    ObjectFlags3[ObjectFlags3["ReverseMapped"] = 1024] = "ReverseMapped";
    ObjectFlags3[ObjectFlags3["JsxAttributes"] = 2048] = "JsxAttributes";
    ObjectFlags3[ObjectFlags3["JSLiteral"] = 4096] = "JSLiteral";
    ObjectFlags3[ObjectFlags3["FreshLiteral"] = 8192] = "FreshLiteral";
    ObjectFlags3[ObjectFlags3["ArrayLiteral"] = 16384] = "ArrayLiteral";
    ObjectFlags3[ObjectFlags3["PrimitiveUnion"] = 32768] = "PrimitiveUnion";
    ObjectFlags3[ObjectFlags3["ContainsWideningType"] = 65536] = "ContainsWideningType";
    ObjectFlags3[ObjectFlags3["ContainsObjectOrArrayLiteral"] = 131072] = "ContainsObjectOrArrayLiteral";
    ObjectFlags3[ObjectFlags3["NonInferrableType"] = 262144] = "NonInferrableType";
    ObjectFlags3[ObjectFlags3["CouldContainTypeVariablesComputed"] = 524288] = "CouldContainTypeVariablesComputed";
    ObjectFlags3[ObjectFlags3["CouldContainTypeVariables"] = 1048576] = "CouldContainTypeVariables";
    ObjectFlags3[ObjectFlags3["ClassOrInterface"] = 3] = "ClassOrInterface";
    ObjectFlags3[ObjectFlags3["RequiresWidening"] = 196608] = "RequiresWidening";
    ObjectFlags3[ObjectFlags3["PropagatingFlags"] = 458752] = "PropagatingFlags";
    ObjectFlags3[ObjectFlags3["InstantiatedMapped"] = 96] = "InstantiatedMapped";
    ObjectFlags3[ObjectFlags3["ObjectTypeKindMask"] = 1343] = "ObjectTypeKindMask";
    ObjectFlags3[ObjectFlags3["ContainsSpread"] = 2097152] = "ContainsSpread";
    ObjectFlags3[ObjectFlags3["ObjectRestType"] = 4194304] = "ObjectRestType";
    ObjectFlags3[ObjectFlags3["InstantiationExpressionType"] = 8388608] = "InstantiationExpressionType";
    ObjectFlags3[ObjectFlags3["IsClassInstanceClone"] = 16777216] = "IsClassInstanceClone";
    ObjectFlags3[ObjectFlags3["IdenticalBaseTypeCalculated"] = 33554432] = "IdenticalBaseTypeCalculated";
    ObjectFlags3[ObjectFlags3["IdenticalBaseTypeExists"] = 67108864] = "IdenticalBaseTypeExists";
    ObjectFlags3[ObjectFlags3["IsGenericTypeComputed"] = 2097152] = "IsGenericTypeComputed";
    ObjectFlags3[ObjectFlags3["IsGenericObjectType"] = 4194304] = "IsGenericObjectType";
    ObjectFlags3[ObjectFlags3["IsGenericIndexType"] = 8388608] = "IsGenericIndexType";
    ObjectFlags3[ObjectFlags3["IsGenericType"] = 12582912] = "IsGenericType";
    ObjectFlags3[ObjectFlags3["ContainsIntersections"] = 16777216] = "ContainsIntersections";
    ObjectFlags3[ObjectFlags3["IsUnknownLikeUnionComputed"] = 33554432] = "IsUnknownLikeUnionComputed";
    ObjectFlags3[ObjectFlags3["IsUnknownLikeUnion"] = 67108864] = "IsUnknownLikeUnion";
    ObjectFlags3[ObjectFlags3["IsNeverIntersectionComputed"] = 16777216] = "IsNeverIntersectionComputed";
    ObjectFlags3[ObjectFlags3["IsNeverIntersection"] = 33554432] = "IsNeverIntersection";
    ObjectFlags3[ObjectFlags3["IsConstrainedTypeVariable"] = 67108864] = "IsConstrainedTypeVariable";
    return ObjectFlags3;
  })(ObjectFlags || {});
  var SignatureFlags = /* @__PURE__ */ ((SignatureFlags4) => {
    SignatureFlags4[SignatureFlags4["None"] = 0] = "None";
    SignatureFlags4[SignatureFlags4["HasRestParameter"] = 1] = "HasRestParameter";
    SignatureFlags4[SignatureFlags4["HasLiteralTypes"] = 2] = "HasLiteralTypes";
    SignatureFlags4[SignatureFlags4["Abstract"] = 4] = "Abstract";
    SignatureFlags4[SignatureFlags4["IsInnerCallChain"] = 8] = "IsInnerCallChain";
    SignatureFlags4[SignatureFlags4["IsOuterCallChain"] = 16] = "IsOuterCallChain";
    SignatureFlags4[SignatureFlags4["IsUntypedSignatureInJSFile"] = 32] = "IsUntypedSignatureInJSFile";
    SignatureFlags4[SignatureFlags4["IsNonInferrable"] = 64] = "IsNonInferrable";
    SignatureFlags4[SignatureFlags4["IsSignatureCandidateForOverloadFailure"] = 128] = "IsSignatureCandidateForOverloadFailure";
    SignatureFlags4[SignatureFlags4["PropagatingFlags"] = 167] = "PropagatingFlags";
    SignatureFlags4[SignatureFlags4["CallChainFlags"] = 24] = "CallChainFlags";
    return SignatureFlags4;
  })(SignatureFlags || {});
  var DiagnosticCategory = /* @__PURE__ */ ((DiagnosticCategory2) => {
    DiagnosticCategory2[DiagnosticCategory2["Warning"] = 0] = "Warning";
    DiagnosticCategory2[DiagnosticCategory2["Error"] = 1] = "Error";
    DiagnosticCategory2[DiagnosticCategory2["Suggestion"] = 2] = "Suggestion";
    DiagnosticCategory2[DiagnosticCategory2["Message"] = 3] = "Message";
    return DiagnosticCategory2;
  })(DiagnosticCategory || {});
  function diagnosticCategoryName(d, lowerCase = true) {
    const name = DiagnosticCategory[d.category];
    return lowerCase ? name.toLowerCase() : name;
  }
  var ModuleResolutionKind = /* @__PURE__ */ ((ModuleResolutionKind2) => {
    ModuleResolutionKind2[ModuleResolutionKind2["Classic"] = 1] = "Classic";
    ModuleResolutionKind2[ModuleResolutionKind2["NodeJs"] = 2] = "NodeJs";
    ModuleResolutionKind2[ModuleResolutionKind2["Node10"] = 2] = "Node10";
    ModuleResolutionKind2[ModuleResolutionKind2["Node16"] = 3] = "Node16";
    ModuleResolutionKind2[ModuleResolutionKind2["NodeNext"] = 99] = "NodeNext";
    ModuleResolutionKind2[ModuleResolutionKind2["Bundler"] = 100] = "Bundler";
    return ModuleResolutionKind2;
  })(ModuleResolutionKind || {});
  var ModuleKind = /* @__PURE__ */ ((ModuleKind2) => {
    ModuleKind2[ModuleKind2["None"] = 0] = "None";
    ModuleKind2[ModuleKind2["CommonJS"] = 1] = "CommonJS";
    ModuleKind2[ModuleKind2["AMD"] = 2] = "AMD";
    ModuleKind2[ModuleKind2["UMD"] = 3] = "UMD";
    ModuleKind2[ModuleKind2["System"] = 4] = "System";
    ModuleKind2[ModuleKind2["ES2015"] = 5] = "ES2015";
    ModuleKind2[ModuleKind2["ES2020"] = 6] = "ES2020";
    ModuleKind2[ModuleKind2["ES2022"] = 7] = "ES2022";
    ModuleKind2[ModuleKind2["ESNext"] = 99] = "ESNext";
    ModuleKind2[ModuleKind2["Node16"] = 100] = "Node16";
    ModuleKind2[ModuleKind2["NodeNext"] = 199] = "NodeNext";
    ModuleKind2[ModuleKind2["Preserve"] = 200] = "Preserve";
    return ModuleKind2;
  })(ModuleKind || {});
  var ScriptKind = /* @__PURE__ */ ((ScriptKind3) => {
    ScriptKind3[ScriptKind3["Unknown"] = 0] = "Unknown";
    ScriptKind3[ScriptKind3["JS"] = 1] = "JS";
    ScriptKind3[ScriptKind3["JSX"] = 2] = "JSX";
    ScriptKind3[ScriptKind3["TS"] = 3] = "TS";
    ScriptKind3[ScriptKind3["TSX"] = 4] = "TSX";
    ScriptKind3[ScriptKind3["External"] = 5] = "External";
    ScriptKind3[ScriptKind3["JSON"] = 6] = "JSON";
    ScriptKind3[ScriptKind3["Deferred"] = 7] = "Deferred";
    return ScriptKind3;
  })(ScriptKind || {});
  var TransformFlags = /* @__PURE__ */ ((TransformFlags3) => {
    TransformFlags3[TransformFlags3["None"] = 0] = "None";
    TransformFlags3[TransformFlags3["ContainsTypeScript"] = 1] = "ContainsTypeScript";
    TransformFlags3[TransformFlags3["ContainsJsx"] = 2] = "ContainsJsx";
    TransformFlags3[TransformFlags3["ContainsESNext"] = 4] = "ContainsESNext";
    TransformFlags3[TransformFlags3["ContainsES2022"] = 8] = "ContainsES2022";
    TransformFlags3[TransformFlags3["ContainsES2021"] = 16] = "ContainsES2021";
    TransformFlags3[TransformFlags3["ContainsES2020"] = 32] = "ContainsES2020";
    TransformFlags3[TransformFlags3["ContainsES2019"] = 64] = "ContainsES2019";
    TransformFlags3[TransformFlags3["ContainsES2018"] = 128] = "ContainsES2018";
    TransformFlags3[TransformFlags3["ContainsES2017"] = 256] = "ContainsES2017";
    TransformFlags3[TransformFlags3["ContainsES2016"] = 512] = "ContainsES2016";
    TransformFlags3[TransformFlags3["ContainsES2015"] = 1024] = "ContainsES2015";
    TransformFlags3[TransformFlags3["ContainsGenerator"] = 2048] = "ContainsGenerator";
    TransformFlags3[TransformFlags3["ContainsDestructuringAssignment"] = 4096] = "ContainsDestructuringAssignment";
    TransformFlags3[TransformFlags3["ContainsTypeScriptClassSyntax"] = 8192] = "ContainsTypeScriptClassSyntax";
    TransformFlags3[TransformFlags3["ContainsLexicalThis"] = 16384] = "ContainsLexicalThis";
    TransformFlags3[TransformFlags3["ContainsRestOrSpread"] = 32768] = "ContainsRestOrSpread";
    TransformFlags3[TransformFlags3["ContainsObjectRestOrSpread"] = 65536] = "ContainsObjectRestOrSpread";
    TransformFlags3[TransformFlags3["ContainsComputedPropertyName"] = 131072] = "ContainsComputedPropertyName";
    TransformFlags3[TransformFlags3["ContainsBlockScopedBinding"] = 262144] = "ContainsBlockScopedBinding";
    TransformFlags3[TransformFlags3["ContainsBindingPattern"] = 524288] = "ContainsBindingPattern";
    TransformFlags3[TransformFlags3["ContainsYield"] = 1048576] = "ContainsYield";
    TransformFlags3[TransformFlags3["ContainsAwait"] = 2097152] = "ContainsAwait";
    TransformFlags3[TransformFlags3["ContainsHoistedDeclarationOrCompletion"] = 4194304] = "ContainsHoistedDeclarationOrCompletion";
    TransformFlags3[TransformFlags3["ContainsDynamicImport"] = 8388608] = "ContainsDynamicImport";
    TransformFlags3[TransformFlags3["ContainsClassFields"] = 16777216] = "ContainsClassFields";
    TransformFlags3[TransformFlags3["ContainsDecorators"] = 33554432] = "ContainsDecorators";
    TransformFlags3[TransformFlags3["ContainsPossibleTopLevelAwait"] = 67108864] = "ContainsPossibleTopLevelAwait";
    TransformFlags3[TransformFlags3["ContainsLexicalSuper"] = 134217728] = "ContainsLexicalSuper";
    TransformFlags3[TransformFlags3["ContainsUpdateExpressionForIdentifier"] = 268435456] = "ContainsUpdateExpressionForIdentifier";
    TransformFlags3[TransformFlags3["ContainsPrivateIdentifierInExpression"] = 536870912] = "ContainsPrivateIdentifierInExpression";
    TransformFlags3[TransformFlags3["HasComputedFlags"] = -2147483648] = "HasComputedFlags";
    TransformFlags3[TransformFlags3["AssertTypeScript"] = 1 /* ContainsTypeScript */] = "AssertTypeScript";
    TransformFlags3[TransformFlags3["AssertJsx"] = 2 /* ContainsJsx */] = "AssertJsx";
    TransformFlags3[TransformFlags3["AssertESNext"] = 4 /* ContainsESNext */] = "AssertESNext";
    TransformFlags3[TransformFlags3["AssertES2022"] = 8 /* ContainsES2022 */] = "AssertES2022";
    TransformFlags3[TransformFlags3["AssertES2021"] = 16 /* ContainsES2021 */] = "AssertES2021";
    TransformFlags3[TransformFlags3["AssertES2020"] = 32 /* ContainsES2020 */] = "AssertES2020";
    TransformFlags3[TransformFlags3["AssertES2019"] = 64 /* ContainsES2019 */] = "AssertES2019";
    TransformFlags3[TransformFlags3["AssertES2018"] = 128 /* ContainsES2018 */] = "AssertES2018";
    TransformFlags3[TransformFlags3["AssertES2017"] = 256 /* ContainsES2017 */] = "AssertES2017";
    TransformFlags3[TransformFlags3["AssertES2016"] = 512 /* ContainsES2016 */] = "AssertES2016";
    TransformFlags3[TransformFlags3["AssertES2015"] = 1024 /* ContainsES2015 */] = "AssertES2015";
    TransformFlags3[TransformFlags3["AssertGenerator"] = 2048 /* ContainsGenerator */] = "AssertGenerator";
    TransformFlags3[TransformFlags3["AssertDestructuringAssignment"] = 4096 /* ContainsDestructuringAssignment */] = "AssertDestructuringAssignment";
    TransformFlags3[TransformFlags3["OuterExpressionExcludes"] = -2147483648 /* HasComputedFlags */] = "OuterExpressionExcludes";
    TransformFlags3[TransformFlags3["PropertyAccessExcludes"] = -2147483648 /* OuterExpressionExcludes */] = "PropertyAccessExcludes";
    TransformFlags3[TransformFlags3["NodeExcludes"] = -2147483648 /* PropertyAccessExcludes */] = "NodeExcludes";
    TransformFlags3[TransformFlags3["ArrowFunctionExcludes"] = -2072174592] = "ArrowFunctionExcludes";
    TransformFlags3[TransformFlags3["FunctionExcludes"] = -1937940480] = "FunctionExcludes";
    TransformFlags3[TransformFlags3["ConstructorExcludes"] = -1937948672] = "ConstructorExcludes";
    TransformFlags3[TransformFlags3["MethodOrAccessorExcludes"] = -2005057536] = "MethodOrAccessorExcludes";
    TransformFlags3[TransformFlags3["PropertyExcludes"] = -2013249536] = "PropertyExcludes";
    TransformFlags3[TransformFlags3["ClassExcludes"] = -2147344384] = "ClassExcludes";
    TransformFlags3[TransformFlags3["ModuleExcludes"] = -1941676032] = "ModuleExcludes";
    TransformFlags3[TransformFlags3["TypeExcludes"] = -2] = "TypeExcludes";
    TransformFlags3[TransformFlags3["ObjectLiteralExcludes"] = -2147278848] = "ObjectLiteralExcludes";
    TransformFlags3[TransformFlags3["ArrayLiteralOrCallOrNewExcludes"] = -2147450880] = "ArrayLiteralOrCallOrNewExcludes";
    TransformFlags3[TransformFlags3["VariableDeclarationListExcludes"] = -2146893824] = "VariableDeclarationListExcludes";
    TransformFlags3[TransformFlags3["ParameterExcludes"] = -2147483648 /* NodeExcludes */] = "ParameterExcludes";
    TransformFlags3[TransformFlags3["CatchClauseExcludes"] = -2147418112] = "CatchClauseExcludes";
    TransformFlags3[TransformFlags3["BindingPatternExcludes"] = -2147450880] = "BindingPatternExcludes";
    TransformFlags3[TransformFlags3["ContainsLexicalThisOrSuper"] = 134234112] = "ContainsLexicalThisOrSuper";
    TransformFlags3[TransformFlags3["PropertyNamePropagatingFlags"] = 134234112] = "PropertyNamePropagatingFlags";
    return TransformFlags3;
  })(TransformFlags || {});
  var SnippetKind = /* @__PURE__ */ ((SnippetKind3) => {
    SnippetKind3[SnippetKind3["TabStop"] = 0] = "TabStop";
    SnippetKind3[SnippetKind3["Placeholder"] = 1] = "Placeholder";
    SnippetKind3[SnippetKind3["Choice"] = 2] = "Choice";
    SnippetKind3[SnippetKind3["Variable"] = 3] = "Variable";
    return SnippetKind3;
  })(SnippetKind || {});
  var EmitFlags = /* @__PURE__ */ ((EmitFlags3) => {
    EmitFlags3[EmitFlags3["None"] = 0] = "None";
    EmitFlags3[EmitFlags3["SingleLine"] = 1] = "SingleLine";
    EmitFlags3[EmitFlags3["MultiLine"] = 2] = "MultiLine";
    EmitFlags3[EmitFlags3["AdviseOnEmitNode"] = 4] = "AdviseOnEmitNode";
    EmitFlags3[EmitFlags3["NoSubstitution"] = 8] = "NoSubstitution";
    EmitFlags3[EmitFlags3["CapturesThis"] = 16] = "CapturesThis";
    EmitFlags3[EmitFlags3["NoLeadingSourceMap"] = 32] = "NoLeadingSourceMap";
    EmitFlags3[EmitFlags3["NoTrailingSourceMap"] = 64] = "NoTrailingSourceMap";
    EmitFlags3[EmitFlags3["NoSourceMap"] = 96] = "NoSourceMap";
    EmitFlags3[EmitFlags3["NoNestedSourceMaps"] = 128] = "NoNestedSourceMaps";
    EmitFlags3[EmitFlags3["NoTokenLeadingSourceMaps"] = 256] = "NoTokenLeadingSourceMaps";
    EmitFlags3[EmitFlags3["NoTokenTrailingSourceMaps"] = 512] = "NoTokenTrailingSourceMaps";
    EmitFlags3[EmitFlags3["NoTokenSourceMaps"] = 768] = "NoTokenSourceMaps";
    EmitFlags3[EmitFlags3["NoLeadingComments"] = 1024] = "NoLeadingComments";
    EmitFlags3[EmitFlags3["NoTrailingComments"] = 2048] = "NoTrailingComments";
    EmitFlags3[EmitFlags3["NoComments"] = 3072] = "NoComments";
    EmitFlags3[EmitFlags3["NoNestedComments"] = 4096] = "NoNestedComments";
    EmitFlags3[EmitFlags3["HelperName"] = 8192] = "HelperName";
    EmitFlags3[EmitFlags3["ExportName"] = 16384] = "ExportName";
    EmitFlags3[EmitFlags3["LocalName"] = 32768] = "LocalName";
    EmitFlags3[EmitFlags3["InternalName"] = 65536] = "InternalName";
    EmitFlags3[EmitFlags3["Indented"] = 131072] = "Indented";
    EmitFlags3[EmitFlags3["NoIndentation"] = 262144] = "NoIndentation";
    EmitFlags3[EmitFlags3["AsyncFunctionBody"] = 524288] = "AsyncFunctionBody";
    EmitFlags3[EmitFlags3["ReuseTempVariableScope"] = 1048576] = "ReuseTempVariableScope";
    EmitFlags3[EmitFlags3["CustomPrologue"] = 2097152] = "CustomPrologue";
    EmitFlags3[EmitFlags3["NoHoisting"] = 4194304] = "NoHoisting";
    EmitFlags3[EmitFlags3["Iterator"] = 8388608] = "Iterator";
    EmitFlags3[EmitFlags3["NoAsciiEscaping"] = 16777216] = "NoAsciiEscaping";
    return EmitFlags3;
  })(EmitFlags || {});
  var commentPragmas = {
    "reference": {
      args: [
        { name: "types", optional: true, captureSpan: true },
        { name: "lib", optional: true, captureSpan: true },
        { name: "path", optional: true, captureSpan: true },
        { name: "no-default-lib", optional: true },
        { name: "resolution-mode", optional: true }
      ],
      kind: 1 /* TripleSlashXML */
    },
    "amd-dependency": {
      args: [{ name: "path" }, { name: "name", optional: true }],
      kind: 1 /* TripleSlashXML */
    },
    "amd-module": {
      args: [{ name: "name" }],
      kind: 1 /* TripleSlashXML */
    },
    "ts-check": {
      kind: 2 /* SingleLine */
    },
    "ts-nocheck": {
      kind: 2 /* SingleLine */
    },
    "jsx": {
      args: [{ name: "factory" }],
      kind: 4 /* MultiLine */
    },
    "jsxfrag": {
      args: [{ name: "factory" }],
      kind: 4 /* MultiLine */
    },
    "jsximportsource": {
      args: [{ name: "factory" }],
      kind: 4 /* MultiLine */
    },
    "jsxruntime": {
      args: [{ name: "factory" }],
      kind: 4 /* MultiLine */
    }
  };
  
  // src/compiler/sys.ts
  function generateDjb2Hash(data) {
    let acc = 5381;
    for (let i = 0; i < data.length; i++) {
      acc = (acc << 5) + acc + data.charCodeAt(i);
    }
    return acc.toString();
  }
  var PollingInterval = /* @__PURE__ */ ((PollingInterval3) => {
    PollingInterval3[PollingInterval3["High"] = 2e3] = "High";
    PollingInterval3[PollingInterval3["Medium"] = 500] = "Medium";
    PollingInterval3[PollingInterval3["Low"] = 250] = "Low";
    return PollingInterval3;
  })(PollingInterval || {});
  var missingFileModifiedTime = /* @__PURE__ */ new Date(0);
  function getModifiedTime(host, fileName) {
    return host.getModifiedTime(fileName) || missingFileModifiedTime;
  }
  function createPollingIntervalBasedLevels(levels) {
    return {
      [250 /* Low */]: levels.Low,
      [500 /* Medium */]: levels.Medium,
      [2e3 /* High */]: levels.High
    };
  }
  var defaultChunkLevels = { Low: 32, Medium: 64, High: 256 };
  var pollingChunkSize = createPollingIntervalBasedLevels(defaultChunkLevels);
  var unchangedPollThresholds = createPollingIntervalBasedLevels(defaultChunkLevels);
  function setCustomPollingValues(system) {
    if (!system.getEnvironmentVariable) {
      return;
    }
    const pollingIntervalChanged = setCustomLevels("TSC_WATCH_POLLINGINTERVAL", PollingInterval);
    pollingChunkSize = getCustomPollingBasedLevels("TSC_WATCH_POLLINGCHUNKSIZE", defaultChunkLevels) || pollingChunkSize;
    unchangedPollThresholds = getCustomPollingBasedLevels("TSC_WATCH_UNCHANGEDPOLLTHRESHOLDS", defaultChunkLevels) || unchangedPollThresholds;
    function getLevel(envVar, level) {
      return system.getEnvironmentVariable(`${envVar}_${level.toUpperCase()}`);
    }
    function getCustomLevels(baseVariable) {
      let customLevels;
      setCustomLevel("Low");
      setCustomLevel("Medium");
      setCustomLevel("High");
      return customLevels;
      function setCustomLevel(level) {
        const customLevel = getLevel(baseVariable, level);
        if (customLevel) {
          (customLevels || (customLevels = {}))[level] = Number(customLevel);
        }
      }
    }
    function setCustomLevels(baseVariable, levels) {
      const customLevels = getCustomLevels(baseVariable);
      if (customLevels) {
        setLevel("Low");
        setLevel("Medium");
        setLevel("High");
        return true;
      }
      return false;
      function setLevel(level) {
        levels[level] = customLevels[level] || levels[level];
      }
    }
    function getCustomPollingBasedLevels(baseVariable, defaultLevels) {
      const customLevels = getCustomLevels(baseVariable);
      return (pollingIntervalChanged || customLevels) && createPollingIntervalBasedLevels(customLevels ? { ...defaultLevels, ...customLevels } : defaultLevels);
    }
  }
  function pollWatchedFileQueue(host, queue, pollIndex, chunkSize, callbackOnWatchFileStat) {
    let definedValueCopyToIndex = pollIndex;
    for (let canVisit = queue.length; chunkSize && canVisit; nextPollIndex(), canVisit--) {
      const watchedFile = queue[pollIndex];
      if (!watchedFile) {
        continue;
      } else if (watchedFile.isClosed) {
        queue[pollIndex] = void 0;
        continue;
      }
      chunkSize--;
      const fileChanged = onWatchedFileStat(watchedFile, getModifiedTime(host, watchedFile.fileName));
      if (watchedFile.isClosed) {
        queue[pollIndex] = void 0;
        continue;
      }
      callbackOnWatchFileStat == null ? void 0 : callbackOnWatchFileStat(watchedFile, pollIndex, fileChanged);
      if (queue[pollIndex]) {
        if (definedValueCopyToIndex < pollIndex) {
          queue[definedValueCopyToIndex] = watchedFile;
          queue[pollIndex] = void 0;
        }
        definedValueCopyToIndex++;
      }
    }
    return pollIndex;
    function nextPollIndex() {
      pollIndex++;
      if (pollIndex === queue.length) {
        if (definedValueCopyToIndex < pollIndex) {
          queue.length = definedValueCopyToIndex;
        }
        pollIndex = 0;
        definedValueCopyToIndex = 0;
      }
    }
  }
  function createDynamicPriorityPollingWatchFile(host) {
    const watchedFiles = [];
    const changedFilesInLastPoll = [];
    const lowPollingIntervalQueue = createPollingIntervalQueue(250 /* Low */);
    const mediumPollingIntervalQueue = createPollingIntervalQueue(500 /* Medium */);
    const highPollingIntervalQueue = createPollingIntervalQueue(2e3 /* High */);
    return watchFile2;
    function watchFile2(fileName, callback, defaultPollingInterval) {
      const file = {
        fileName,
        callback,
        unchangedPolls: 0,
        mtime: getModifiedTime(host, fileName)
      };
      watchedFiles.push(file);
      addToPollingIntervalQueue(file, defaultPollingInterval);
      return {
        close: () => {
          file.isClosed = true;
          unorderedRemoveItem(watchedFiles, file);
        }
      };
    }
    function createPollingIntervalQueue(pollingInterval) {
      const queue = [];
      queue.pollingInterval = pollingInterval;
      queue.pollIndex = 0;
      queue.pollScheduled = false;
      return queue;
    }
    function pollPollingIntervalQueue(_timeoutType, queue) {
      queue.pollIndex = pollQueue(queue, queue.pollingInterval, queue.pollIndex, pollingChunkSize[queue.pollingInterval]);
      if (queue.length) {
        scheduleNextPoll(queue.pollingInterval);
      } else {
        Debug.assert(queue.pollIndex === 0);
        queue.pollScheduled = false;
      }
    }
    function pollLowPollingIntervalQueue(_timeoutType, queue) {
      pollQueue(
        changedFilesInLastPoll,
        250 /* Low */,
        /*pollIndex*/
        0,
        changedFilesInLastPoll.length
      );
      pollPollingIntervalQueue(_timeoutType, queue);
      if (!queue.pollScheduled && changedFilesInLastPoll.length) {
        scheduleNextPoll(250 /* Low */);
      }
    }
    function pollQueue(queue, pollingInterval, pollIndex, chunkSize) {
      return pollWatchedFileQueue(
        host,
        queue,
        pollIndex,
        chunkSize,
        onWatchFileStat
      );
      function onWatchFileStat(watchedFile, pollIndex2, fileChanged) {
        if (fileChanged) {
          watchedFile.unchangedPolls = 0;
          if (queue !== changedFilesInLastPoll) {
            queue[pollIndex2] = void 0;
            addChangedFileToLowPollingIntervalQueue(watchedFile);
          }
        } else if (watchedFile.unchangedPolls !== unchangedPollThresholds[pollingInterval]) {
          watchedFile.unchangedPolls++;
        } else if (queue === changedFilesInLastPoll) {
          watchedFile.unchangedPolls = 1;
          queue[pollIndex2] = void 0;
          addToPollingIntervalQueue(watchedFile, 250 /* Low */);
        } else if (pollingInterval !== 2e3 /* High */) {
          watchedFile.unchangedPolls++;
          queue[pollIndex2] = void 0;
          addToPollingIntervalQueue(watchedFile, pollingInterval === 250 /* Low */ ? 500 /* Medium */ : 2e3 /* High */);
        }
      }
    }
    function pollingIntervalQueue(pollingInterval) {
      switch (pollingInterval) {
        case 250 /* Low */:
          return lowPollingIntervalQueue;
        case 500 /* Medium */:
          return mediumPollingIntervalQueue;
        case 2e3 /* High */:
          return highPollingIntervalQueue;
      }
    }
    function addToPollingIntervalQueue(file, pollingInterval) {
      pollingIntervalQueue(pollingInterval).push(file);
      scheduleNextPollIfNotAlreadyScheduled(pollingInterval);
    }
    function addChangedFileToLowPollingIntervalQueue(file) {
      changedFilesInLastPoll.push(file);
      scheduleNextPollIfNotAlreadyScheduled(250 /* Low */);
    }
    function scheduleNextPollIfNotAlreadyScheduled(pollingInterval) {
      if (!pollingIntervalQueue(pollingInterval).pollScheduled) {
        scheduleNextPoll(pollingInterval);
      }
    }
    function scheduleNextPoll(pollingInterval) {
      pollingIntervalQueue(pollingInterval).pollScheduled = host.setTimeout(pollingInterval === 250 /* Low */ ? pollLowPollingIntervalQueue : pollPollingIntervalQueue, pollingInterval, pollingInterval === 250 /* Low */ ? "pollLowPollingIntervalQueue" : "pollPollingIntervalQueue", pollingIntervalQueue(pollingInterval));
    }
  }
  function createUseFsEventsOnParentDirectoryWatchFile(fsWatch, useCaseSensitiveFileNames2) {
    const fileWatcherCallbacks = createMultiMap();
    const dirWatchers = /* @__PURE__ */ new Map();
    const toCanonicalName = createGetCanonicalFileName(useCaseSensitiveFileNames2);
    return nonPollingWatchFile;
    function nonPollingWatchFile(fileName, callback, _pollingInterval, fallbackOptions) {
      const filePath = toCanonicalName(fileName);
      fileWatcherCallbacks.add(filePath, callback);
      const dirPath = getDirectoryPath(filePath) || ".";
      const watcher = dirWatchers.get(dirPath) || createDirectoryWatcher(getDirectoryPath(fileName) || ".", dirPath, fallbackOptions);
      watcher.referenceCount++;
      return {
        close: () => {
          if (watcher.referenceCount === 1) {
            watcher.close();
            dirWatchers.delete(dirPath);
          } else {
            watcher.referenceCount--;
          }
          fileWatcherCallbacks.remove(filePath, callback);
        }
      };
    }
    function createDirectoryWatcher(dirName, dirPath, fallbackOptions) {
      const watcher = fsWatch(
        dirName,
        1 /* Directory */,
        (_eventName, relativeFileName, modifiedTime) => {
          if (!isString(relativeFileName))
            return;
          const fileName = getNormalizedAbsolutePath(relativeFileName, dirName);
          const callbacks = fileName && fileWatcherCallbacks.get(toCanonicalName(fileName));
          if (callbacks) {
            for (const fileCallback of callbacks) {
              fileCallback(fileName, 1 /* Changed */, modifiedTime);
            }
          }
        },
        /*recursive*/
        false,
        500 /* Medium */,
        fallbackOptions
      );
      watcher.referenceCount = 0;
      dirWatchers.set(dirPath, watcher);
      return watcher;
    }
  }
  function createFixedChunkSizePollingWatchFile(host) {
    const watchedFiles = [];
    let pollIndex = 0;
    let pollScheduled;
    return watchFile2;
    function watchFile2(fileName, callback) {
      const file = {
        fileName,
        callback,
        mtime: getModifiedTime(host, fileName)
      };
      watchedFiles.push(file);
      scheduleNextPoll();
      return {
        close: () => {
          file.isClosed = true;
          unorderedRemoveItem(watchedFiles, file);
        }
      };
    }
    function pollQueue() {
      pollScheduled = void 0;
      pollIndex = pollWatchedFileQueue(host, watchedFiles, pollIndex, pollingChunkSize[250 /* Low */]);
      scheduleNextPoll();
    }
    function scheduleNextPoll() {
      if (!watchedFiles.length || pollScheduled)
        return;
      pollScheduled = host.setTimeout(pollQueue, 2e3 /* High */, "pollQueue");
    }
  }
  function createSingleWatcherPerName(cache, useCaseSensitiveFileNames2, name, callback, createWatcher) {
    const toCanonicalFileName = createGetCanonicalFileName(useCaseSensitiveFileNames2);
    const path = toCanonicalFileName(name);
    const existing = cache.get(path);
    if (existing) {
      existing.callbacks.push(callback);
    } else {
      cache.set(path, {
        watcher: createWatcher(
          // Cant infer types correctly so lets satisfy checker
          (param1, param2, param3) => {
            var _a;
            return (_a = cache.get(path)) == null ? void 0 : _a.callbacks.slice().forEach((cb) => cb(param1, param2, param3));
          }
        ),
        callbacks: [callback]
      });
    }
    return {
      close: () => {
        const watcher = cache.get(path);
        if (!watcher)
          return;
        if (!orderedRemoveItem(watcher.callbacks, callback) || watcher.callbacks.length)
          return;
        cache.delete(path);
        closeFileWatcherOf(watcher);
      }
    };
  }
  function onWatchedFileStat(watchedFile, modifiedTime) {
    const oldTime = watchedFile.mtime.getTime();
    const newTime = modifiedTime.getTime();
    if (oldTime !== newTime) {
      watchedFile.mtime = modifiedTime;
      watchedFile.callback(watchedFile.fileName, getFileWatcherEventKind(oldTime, newTime), modifiedTime);
      return true;
    }
    return false;
  }
  function getFileWatcherEventKind(oldTime, newTime) {
    return oldTime === 0 ? 0 /* Created */ : newTime === 0 ? 2 /* Deleted */ : 1 /* Changed */;
  }
  var ignoredPaths = ["/node_modules/.", "/.git", "/.#"];
  var curSysLog = noop;
  function sysLog(s) {
    return curSysLog(s);
  }
  function setSysLog(logger) {
    curSysLog = logger;
  }
  function createDirectoryWatcherSupportingRecursive({
    watchDirectory,
    useCaseSensitiveFileNames: useCaseSensitiveFileNames2,
    getCurrentDirectory,
    getAccessibleSortedChildDirectories,
    fileSystemEntryExists,
    realpath,
    setTimeout: setTimeout2,
    clearTimeout: clearTimeout2
  }) {
    const cache = /* @__PURE__ */ new Map();
    const callbackCache = createMultiMap();
    const cacheToUpdateChildWatches = /* @__PURE__ */ new Map();
    let timerToUpdateChildWatches;
    const filePathComparer = getStringComparer(!useCaseSensitiveFileNames2);
    const toCanonicalFilePath = createGetCanonicalFileName(useCaseSensitiveFileNames2);
    return (dirName, callback, recursive, options) => recursive ? createDirectoryWatcher(dirName, options, callback) : watchDirectory(dirName, callback, recursive, options);
    function createDirectoryWatcher(dirName, options, callback) {
      const dirPath = toCanonicalFilePath(dirName);
      let directoryWatcher = cache.get(dirPath);
      if (directoryWatcher) {
        directoryWatcher.refCount++;
      } else {
        directoryWatcher = {
          watcher: watchDirectory(
            dirName,
            (fileName) => {
              if (isIgnoredPath(fileName, options))
                return;
              if (options == null ? void 0 : options.synchronousWatchDirectory) {
                invokeCallbacks(dirPath, fileName);
                updateChildWatches(dirName, dirPath, options);
              } else {
                nonSyncUpdateChildWatches(dirName, dirPath, fileName, options);
              }
            },
            /*recursive*/
            false,
            options
          ),
          refCount: 1,
          childWatches: emptyArray
        };
        cache.set(dirPath, directoryWatcher);
        updateChildWatches(dirName, dirPath, options);
      }
      const callbackToAdd = callback && { dirName, callback };
      if (callbackToAdd) {
        callbackCache.add(dirPath, callbackToAdd);
      }
      return {
        dirName,
        close: () => {
          const directoryWatcher2 = Debug.checkDefined(cache.get(dirPath));
          if (callbackToAdd)
            callbackCache.remove(dirPath, callbackToAdd);
          directoryWatcher2.refCount--;
          if (directoryWatcher2.refCount)
            return;
          cache.delete(dirPath);
          closeFileWatcherOf(directoryWatcher2);
          directoryWatcher2.childWatches.forEach(closeFileWatcher);
        }
      };
    }
    function invokeCallbacks(dirPath, fileNameOrInvokeMap, fileNames) {
      let fileName;
      let invokeMap;
      if (isString(fileNameOrInvokeMap)) {
        fileName = fileNameOrInvokeMap;
      } else {
        invokeMap = fileNameOrInvokeMap;
      }
      callbackCache.forEach((callbacks, rootDirName) => {
        if (invokeMap && invokeMap.get(rootDirName) === true)
          return;
        if (rootDirName === dirPath || startsWith(dirPath, rootDirName) && dirPath[rootDirName.length] === directorySeparator) {
          if (invokeMap) {
            if (fileNames) {
              const existing = invokeMap.get(rootDirName);
              if (existing) {
                existing.push(...fileNames);
              } else {
                invokeMap.set(rootDirName, fileNames.slice());
              }
            } else {
              invokeMap.set(rootDirName, true);
            }
          } else {
            callbacks.forEach(({ callback }) => callback(fileName));
          }
        }
      });
    }
    function nonSyncUpdateChildWatches(dirName, dirPath, fileName, options) {
      const parentWatcher = cache.get(dirPath);
      if (parentWatcher && fileSystemEntryExists(dirName, 1 /* Directory */)) {
        scheduleUpdateChildWatches(dirName, dirPath, fileName, options);
        return;
      }
      invokeCallbacks(dirPath, fileName);
      removeChildWatches(parentWatcher);
    }
    function scheduleUpdateChildWatches(dirName, dirPath, fileName, options) {
      const existing = cacheToUpdateChildWatches.get(dirPath);
      if (existing) {
        existing.fileNames.push(fileName);
      } else {
        cacheToUpdateChildWatches.set(dirPath, { dirName, options, fileNames: [fileName] });
      }
      if (timerToUpdateChildWatches) {
        clearTimeout2(timerToUpdateChildWatches);
        timerToUpdateChildWatches = void 0;
      }
      timerToUpdateChildWatches = setTimeout2(onTimerToUpdateChildWatches, 1e3, "timerToUpdateChildWatches");
    }
    function onTimerToUpdateChildWatches() {
      timerToUpdateChildWatches = void 0;
      sysLog(`sysLog:: onTimerToUpdateChildWatches:: ${cacheToUpdateChildWatches.size}`);
      const start = timestamp();
      const invokeMap = /* @__PURE__ */ new Map();
      while (!timerToUpdateChildWatches && cacheToUpdateChildWatches.size) {
        const result = cacheToUpdateChildWatches.entries().next();
        Debug.assert(!result.done);
        const { value: [dirPath, { dirName, options, fileNames }] } = result;
        cacheToUpdateChildWatches.delete(dirPath);
        const hasChanges = updateChildWatches(dirName, dirPath, options);
        invokeCallbacks(dirPath, invokeMap, hasChanges ? void 0 : fileNames);
      }
      sysLog(`sysLog:: invokingWatchers:: Elapsed:: ${timestamp() - start}ms:: ${cacheToUpdateChildWatches.size}`);
      callbackCache.forEach((callbacks, rootDirName) => {
        const existing = invokeMap.get(rootDirName);
        if (existing) {
          callbacks.forEach(({ callback, dirName }) => {
            if (isArray(existing)) {
              existing.forEach(callback);
            } else {
              callback(dirName);
            }
          });
        }
      });
      const elapsed = timestamp() - start;
      sysLog(`sysLog:: Elapsed:: ${elapsed}ms:: onTimerToUpdateChildWatches:: ${cacheToUpdateChildWatches.size} ${timerToUpdateChildWatches}`);
    }
    function removeChildWatches(parentWatcher) {
      if (!parentWatcher)
        return;
      const existingChildWatches = parentWatcher.childWatches;
      parentWatcher.childWatches = emptyArray;
      for (const childWatcher of existingChildWatches) {
        childWatcher.close();
        removeChildWatches(cache.get(toCanonicalFilePath(childWatcher.dirName)));
      }
    }
    function updateChildWatches(parentDir, parentDirPath, options) {
      const parentWatcher = cache.get(parentDirPath);
      if (!parentWatcher)
        return false;
      let newChildWatches;
      const hasChanges = enumerateInsertsAndDeletes(
        fileSystemEntryExists(parentDir, 1 /* Directory */) ? mapDefined(getAccessibleSortedChildDirectories(parentDir), (child) => {
          const childFullName = getNormalizedAbsolutePath(child, parentDir);
          return !isIgnoredPath(childFullName, options) && filePathComparer(childFullName, normalizePath(realpath(childFullName))) === 0 /* EqualTo */ ? childFullName : void 0;
        }) : emptyArray,
        parentWatcher.childWatches,
        (child, childWatcher) => filePathComparer(child, childWatcher.dirName),
        createAndAddChildDirectoryWatcher,
        closeFileWatcher,
        addChildDirectoryWatcher
      );
      parentWatcher.childWatches = newChildWatches || emptyArray;
      return hasChanges;
      function createAndAddChildDirectoryWatcher(childName) {
        const result = createDirectoryWatcher(childName, options);
        addChildDirectoryWatcher(result);
      }
      function addChildDirectoryWatcher(childWatcher) {
        (newChildWatches || (newChildWatches = [])).push(childWatcher);
      }
    }
    function isIgnoredPath(path, options) {
      return some(ignoredPaths, (searchPath) => isInPath(path, searchPath)) || isIgnoredByWatchOptions(path, options, useCaseSensitiveFileNames2, getCurrentDirectory);
    }
    function isInPath(path, searchPath) {
      if (path.includes(searchPath))
        return true;
      if (useCaseSensitiveFileNames2)
        return false;
      return toCanonicalFilePath(path).includes(searchPath);
    }
  }
  function createFileWatcherCallback(callback) {
    return (_fileName, eventKind, modifiedTime) => callback(eventKind === 1 /* Changed */ ? "change" : "rename", "", modifiedTime);
  }
  function createFsWatchCallbackForFileWatcherCallback(fileName, callback, getModifiedTime3) {
    return (eventName, _relativeFileName, modifiedTime) => {
      if (eventName === "rename") {
        modifiedTime || (modifiedTime = getModifiedTime3(fileName) || missingFileModifiedTime);
        callback(fileName, modifiedTime !== missingFileModifiedTime ? 0 /* Created */ : 2 /* Deleted */, modifiedTime);
      } else {
        callback(fileName, 1 /* Changed */, modifiedTime);
      }
    };
  }
  function isIgnoredByWatchOptions(pathToCheck, options, useCaseSensitiveFileNames2, getCurrentDirectory) {
    return ((options == null ? void 0 : options.excludeDirectories) || (options == null ? void 0 : options.excludeFiles)) && (matchesExclude(pathToCheck, options == null ? void 0 : options.excludeFiles, useCaseSensitiveFileNames2, getCurrentDirectory()) || matchesExclude(pathToCheck, options == null ? void 0 : options.excludeDirectories, useCaseSensitiveFileNames2, getCurrentDirectory()));
  }
  function createFsWatchCallbackForDirectoryWatcherCallback(directoryName, callback, options, useCaseSensitiveFileNames2, getCurrentDirectory) {
    return (eventName, relativeFileName) => {
      if (eventName === "rename") {
        const fileName = !relativeFileName ? directoryName : normalizePath(combinePaths(directoryName, relativeFileName));
        if (!relativeFileName || !isIgnoredByWatchOptions(fileName, options, useCaseSensitiveFileNames2, getCurrentDirectory)) {
          callback(fileName);
        }
      }
    };
  }
  function createSystemWatchFunctions({
    pollingWatchFileWorker,
    getModifiedTime: getModifiedTime3,
    setTimeout: setTimeout2,
    clearTimeout: clearTimeout2,
    fsWatchWorker,
    fileSystemEntryExists,
    useCaseSensitiveFileNames: useCaseSensitiveFileNames2,
    getCurrentDirectory,
    fsSupportsRecursiveFsWatch,
    getAccessibleSortedChildDirectories,
    realpath,
    tscWatchFile,
    useNonPollingWatchers,
    tscWatchDirectory,
    inodeWatching,
    fsWatchWithTimestamp,
    sysLog: sysLog2
  }) {
    const pollingWatches = /* @__PURE__ */ new Map();
    const fsWatches = /* @__PURE__ */ new Map();
    const fsWatchesRecursive = /* @__PURE__ */ new Map();
    let dynamicPollingWatchFile;
    let fixedChunkSizePollingWatchFile;
    let nonPollingWatchFile;
    let hostRecursiveDirectoryWatcher;
    let hitSystemWatcherLimit = false;
    return {
      watchFile: watchFile2,
      watchDirectory
    };
    function watchFile2(fileName, callback, pollingInterval, options) {
      options = updateOptionsForWatchFile(options, useNonPollingWatchers);
      const watchFileKind = Debug.checkDefined(options.watchFile);
      switch (watchFileKind) {
        case 0 /* FixedPollingInterval */:
          return pollingWatchFile(
            fileName,
            callback,
            250 /* Low */,
            /*options*/
            void 0
          );
        case 1 /* PriorityPollingInterval */:
          return pollingWatchFile(
            fileName,
            callback,
            pollingInterval,
            /*options*/
            void 0
          );
        case 2 /* DynamicPriorityPolling */:
          return ensureDynamicPollingWatchFile()(
            fileName,
            callback,
            pollingInterval,
            /*options*/
            void 0
          );
        case 3 /* FixedChunkSizePolling */:
          return ensureFixedChunkSizePollingWatchFile()(
            fileName,
            callback,
            /* pollingInterval */
            void 0,
            /*options*/
            void 0
          );
        case 4 /* UseFsEvents */:
          return fsWatch(
            fileName,
            0 /* File */,
            createFsWatchCallbackForFileWatcherCallback(fileName, callback, getModifiedTime3),
            /*recursive*/
            false,
            pollingInterval,
            getFallbackOptions(options)
          );
        case 5 /* UseFsEventsOnParentDirectory */:
          if (!nonPollingWatchFile) {
            nonPollingWatchFile = createUseFsEventsOnParentDirectoryWatchFile(fsWatch, useCaseSensitiveFileNames2);
          }
          return nonPollingWatchFile(fileName, callback, pollingInterval, getFallbackOptions(options));
        default:
          Debug.assertNever(watchFileKind);
      }
    }
    function ensureDynamicPollingWatchFile() {
      return dynamicPollingWatchFile || (dynamicPollingWatchFile = createDynamicPriorityPollingWatchFile({ getModifiedTime: getModifiedTime3, setTimeout: setTimeout2 }));
    }
    function ensureFixedChunkSizePollingWatchFile() {
      return fixedChunkSizePollingWatchFile || (fixedChunkSizePollingWatchFile = createFixedChunkSizePollingWatchFile({ getModifiedTime: getModifiedTime3, setTimeout: setTimeout2 }));
    }
    function updateOptionsForWatchFile(options, useNonPollingWatchers2) {
      if (options && options.watchFile !== void 0)
        return options;
      switch (tscWatchFile) {
        case "PriorityPollingInterval":
          return { watchFile: 1 /* PriorityPollingInterval */ };
        case "DynamicPriorityPolling":
          return { watchFile: 2 /* DynamicPriorityPolling */ };
        case "UseFsEvents":
          return generateWatchFileOptions(4 /* UseFsEvents */, 1 /* PriorityInterval */, options);
        case "UseFsEventsWithFallbackDynamicPolling":
          return generateWatchFileOptions(4 /* UseFsEvents */, 2 /* DynamicPriority */, options);
        case "UseFsEventsOnParentDirectory":
          useNonPollingWatchers2 = true;
        default:
          return useNonPollingWatchers2 ? (
            // Use notifications from FS to watch with falling back to fs.watchFile
            generateWatchFileOptions(5 /* UseFsEventsOnParentDirectory */, 1 /* PriorityInterval */, options)
          ) : (
            // Default to using fs events
            { watchFile: 4 /* UseFsEvents */ }
          );
      }
    }
    function generateWatchFileOptions(watchFile3, fallbackPolling, options) {
      const defaultFallbackPolling = options == null ? void 0 : options.fallbackPolling;
      return {
        watchFile: watchFile3,
        fallbackPolling: defaultFallbackPolling === void 0 ? fallbackPolling : defaultFallbackPolling
      };
    }
    function watchDirectory(directoryName, callback, recursive, options) {
      if (fsSupportsRecursiveFsWatch) {
        return fsWatch(
          directoryName,
          1 /* Directory */,
          createFsWatchCallbackForDirectoryWatcherCallback(directoryName, callback, options, useCaseSensitiveFileNames2, getCurrentDirectory),
          recursive,
          500 /* Medium */,
          getFallbackOptions(options)
        );
      }
      if (!hostRecursiveDirectoryWatcher) {
        hostRecursiveDirectoryWatcher = createDirectoryWatcherSupportingRecursive({
          useCaseSensitiveFileNames: useCaseSensitiveFileNames2,
          getCurrentDirectory,
          fileSystemEntryExists,
          getAccessibleSortedChildDirectories,
          watchDirectory: nonRecursiveWatchDirectory,
          realpath,
          setTimeout: setTimeout2,
          clearTimeout: clearTimeout2
        });
      }
      return hostRecursiveDirectoryWatcher(directoryName, callback, recursive, options);
    }
    function nonRecursiveWatchDirectory(directoryName, callback, recursive, options) {
      Debug.assert(!recursive);
      const watchDirectoryOptions = updateOptionsForWatchDirectory(options);
      const watchDirectoryKind = Debug.checkDefined(watchDirectoryOptions.watchDirectory);
      switch (watchDirectoryKind) {
        case 1 /* FixedPollingInterval */:
          return pollingWatchFile(
            directoryName,
            () => callback(directoryName),
            500 /* Medium */,
            /*options*/
            void 0
          );
        case 2 /* DynamicPriorityPolling */:
          return ensureDynamicPollingWatchFile()(
            directoryName,
            () => callback(directoryName),
            500 /* Medium */,
            /*options*/
            void 0
          );
        case 3 /* FixedChunkSizePolling */:
          return ensureFixedChunkSizePollingWatchFile()(
            directoryName,
            () => callback(directoryName),
            /* pollingInterval */
            void 0,
            /*options*/
            void 0
          );
        case 0 /* UseFsEvents */:
          return fsWatch(
            directoryName,
            1 /* Directory */,
            createFsWatchCallbackForDirectoryWatcherCallback(directoryName, callback, options, useCaseSensitiveFileNames2, getCurrentDirectory),
            recursive,
            500 /* Medium */,
            getFallbackOptions(watchDirectoryOptions)
          );
        default:
          Debug.assertNever(watchDirectoryKind);
      }
    }
    function updateOptionsForWatchDirectory(options) {
      if (options && options.watchDirectory !== void 0)
        return options;
      switch (tscWatchDirectory) {
        case "RecursiveDirectoryUsingFsWatchFile":
          return { watchDirectory: 1 /* FixedPollingInterval */ };
        case "RecursiveDirectoryUsingDynamicPriorityPolling":
          return { watchDirectory: 2 /* DynamicPriorityPolling */ };
        default:
          const defaultFallbackPolling = options == null ? void 0 : options.fallbackPolling;
          return {
            watchDirectory: 0 /* UseFsEvents */,
            fallbackPolling: defaultFallbackPolling !== void 0 ? defaultFallbackPolling : void 0
          };
      }
    }
    function pollingWatchFile(fileName, callback, pollingInterval, options) {
      return createSingleWatcherPerName(
        pollingWatches,
        useCaseSensitiveFileNames2,
        fileName,
        callback,
        (cb) => pollingWatchFileWorker(fileName, cb, pollingInterval, options)
      );
    }
    function fsWatch(fileOrDirectory, entryKind, callback, recursive, fallbackPollingInterval, fallbackOptions) {
      return createSingleWatcherPerName(
        recursive ? fsWatchesRecursive : fsWatches,
        useCaseSensitiveFileNames2,
        fileOrDirectory,
        callback,
        (cb) => fsWatchHandlingExistenceOnHost(fileOrDirectory, entryKind, cb, recursive, fallbackPollingInterval, fallbackOptions)
      );
    }
    function fsWatchHandlingExistenceOnHost(fileOrDirectory, entryKind, callback, recursive, fallbackPollingInterval, fallbackOptions) {
      let lastDirectoryPartWithDirectorySeparator;
      let lastDirectoryPart;
      if (inodeWatching) {
        lastDirectoryPartWithDirectorySeparator = fileOrDirectory.substring(fileOrDirectory.lastIndexOf(directorySeparator));
        lastDirectoryPart = lastDirectoryPartWithDirectorySeparator.slice(directorySeparator.length);
      }
      let watcher = !fileSystemEntryExists(fileOrDirectory, entryKind) ? watchMissingFileSystemEntry() : watchPresentFileSystemEntry();
      return {
        close: () => {
          if (watcher) {
            watcher.close();
            watcher = void 0;
          }
        }
      };
      function updateWatcher(createWatcher) {
        if (watcher) {
          sysLog2(`sysLog:: ${fileOrDirectory}:: Changing watcher to ${createWatcher === watchPresentFileSystemEntry ? "Present" : "Missing"}FileSystemEntryWatcher`);
          watcher.close();
          watcher = createWatcher();
        }
      }
      function watchPresentFileSystemEntry() {
        if (hitSystemWatcherLimit) {
          sysLog2(`sysLog:: ${fileOrDirectory}:: Defaulting to watchFile`);
          return watchPresentFileSystemEntryWithFsWatchFile();
        }
        try {
          const presentWatcher = (!fsWatchWithTimestamp ? fsWatchWorker : fsWatchWorkerHandlingTimestamp)(
            fileOrDirectory,
            recursive,
            inodeWatching ? callbackChangingToMissingFileSystemEntry : callback
          );
          presentWatcher.on("error", () => {
            callback("rename", "");
            updateWatcher(watchMissingFileSystemEntry);
          });
          return presentWatcher;
        } catch (e) {
          hitSystemWatcherLimit || (hitSystemWatcherLimit = e.code === "ENOSPC");
          sysLog2(`sysLog:: ${fileOrDirectory}:: Changing to watchFile`);
          return watchPresentFileSystemEntryWithFsWatchFile();
        }
      }
      function callbackChangingToMissingFileSystemEntry(event, relativeName) {
        let originalRelativeName;
        if (relativeName && endsWith(relativeName, "~")) {
          originalRelativeName = relativeName;
          relativeName = relativeName.slice(0, relativeName.length - 1);
        }
        if (event === "rename" && (!relativeName || relativeName === lastDirectoryPart || endsWith(relativeName, lastDirectoryPartWithDirectorySeparator))) {
          const modifiedTime = getModifiedTime3(fileOrDirectory) || missingFileModifiedTime;
          if (originalRelativeName)
            callback(event, originalRelativeName, modifiedTime);
          callback(event, relativeName, modifiedTime);
          if (inodeWatching) {
            updateWatcher(modifiedTime === missingFileModifiedTime ? watchMissingFileSystemEntry : watchPresentFileSystemEntry);
          } else if (modifiedTime === missingFileModifiedTime) {
            updateWatcher(watchMissingFileSystemEntry);
          }
        } else {
          if (originalRelativeName)
            callback(event, originalRelativeName);
          callback(event, relativeName);
        }
      }
      function watchPresentFileSystemEntryWithFsWatchFile() {
        return watchFile2(
          fileOrDirectory,
          createFileWatcherCallback(callback),
          fallbackPollingInterval,
          fallbackOptions
        );
      }
      function watchMissingFileSystemEntry() {
        return watchFile2(
          fileOrDirectory,
          (_fileName, eventKind, modifiedTime) => {
            if (eventKind === 0 /* Created */) {
              modifiedTime || (modifiedTime = getModifiedTime3(fileOrDirectory) || missingFileModifiedTime);
              if (modifiedTime !== missingFileModifiedTime) {
                callback("rename", "", modifiedTime);
                updateWatcher(watchPresentFileSystemEntry);
              }
            }
          },
          fallbackPollingInterval,
          fallbackOptions
        );
      }
    }
    function fsWatchWorkerHandlingTimestamp(fileOrDirectory, recursive, callback) {
      let modifiedTime = getModifiedTime3(fileOrDirectory) || missingFileModifiedTime;
      return fsWatchWorker(fileOrDirectory, recursive, (eventName, relativeFileName, currentModifiedTime) => {
        if (eventName === "change") {
          currentModifiedTime || (currentModifiedTime = getModifiedTime3(fileOrDirectory) || missingFileModifiedTime);
          if (currentModifiedTime.getTime() === modifiedTime.getTime())
            return;
        }
        modifiedTime = currentModifiedTime || getModifiedTime3(fileOrDirectory) || missingFileModifiedTime;
        callback(eventName, relativeFileName, modifiedTime);
      });
    }
  }
  function patchWriteFileEnsuringDirectory(sys2) {
    const originalWriteFile = sys2.writeFile;
    sys2.writeFile = (path, data, writeBom) => writeFileEnsuringDirectories(
      path,
      data,
      !!writeBom,
      (path2, data2, writeByteOrderMark) => originalWriteFile.call(sys2, path2, data2, writeByteOrderMark),
      (path2) => sys2.createDirectory(path2),
      (path2) => sys2.directoryExists(path2)
    );
  }
  var sys = (() => {
    const byteOrderMarkIndicator = "\uFEFF";
    function getNodeSystem() {
      const nativePattern = /^native |^\([^)]+\)$|^(internal[\\/]|[a-zA-Z0-9_\s]+(\.js)?$)/;
      const _fs = require("fs");
      const _path = require("path");
      const _os = require("os");
      let _crypto;
      try {
        _crypto = require("crypto");
      } catch {
        _crypto = void 0;
      }
      let activeSession;
      let profilePath = "./profile.cpuprofile";
      const Buffer = require("buffer").Buffer;
      const isMacOs = process.platform === "darwin";
      const isLinuxOrMacOs = process.platform === "linux" || isMacOs;
      const platform = _os.platform();
      const useCaseSensitiveFileNames2 = isFileSystemCaseSensitive();
      const fsRealpath = !!_fs.realpathSync.native ? process.platform === "win32" ? fsRealPathHandlingLongPath : _fs.realpathSync.native : _fs.realpathSync;
      const executingFilePath = __filename.endsWith("sys.js") ? _path.join(_path.dirname(__dirname), "__fake__.js") : __filename;
      const fsSupportsRecursiveFsWatch = process.platform === "win32" || isMacOs;
      const getCurrentDirectory = memoize(() => process.cwd());
      const { watchFile: watchFile2, watchDirectory } = createSystemWatchFunctions({
        pollingWatchFileWorker: fsWatchFileWorker,
        getModifiedTime: getModifiedTime3,
        setTimeout,
        clearTimeout,
        fsWatchWorker,
        useCaseSensitiveFileNames: useCaseSensitiveFileNames2,
        getCurrentDirectory,
        fileSystemEntryExists,
        // Node 4.0 `fs.watch` function supports the "recursive" option on both OSX and Windows
        // (ref: https://github.com/nodejs/node/pull/2649 and https://github.com/Microsoft/TypeScript/issues/4643)
        fsSupportsRecursiveFsWatch,
        getAccessibleSortedChildDirectories: (path) => getAccessibleFileSystemEntries(path).directories,
        realpath,
        tscWatchFile: process.env.TSC_WATCHFILE,
        useNonPollingWatchers: !!process.env.TSC_NONPOLLING_WATCHER,
        tscWatchDirectory: process.env.TSC_WATCHDIRECTORY,
        inodeWatching: isLinuxOrMacOs,
        fsWatchWithTimestamp: isMacOs,
        sysLog
      });
      const nodeSystem = {
        args: process.argv.slice(2),
        newLine: _os.EOL,
        useCaseSensitiveFileNames: useCaseSensitiveFileNames2,
        write(s) {
          process.stdout.write(s);
        },
        getWidthOfTerminal() {
          return process.stdout.columns;
        },
        writeOutputIsTTY() {
          return process.stdout.isTTY;
        },
        readFile,
        writeFile: writeFile2,
        watchFile: watchFile2,
        watchDirectory,
        resolvePath: (path) => _path.resolve(path),
        fileExists,
        directoryExists,
        getAccessibleFileSystemEntries,
        createDirectory(directoryName) {
          if (!nodeSystem.directoryExists(directoryName)) {
            try {
              _fs.mkdirSync(directoryName);
            } catch (e) {
              if (e.code !== "EEXIST") {
                throw e;
              }
            }
          }
        },
        getExecutingFilePath() {
          return executingFilePath;
        },
        getCurrentDirectory,
        getDirectories,
        getEnvironmentVariable(name) {
          return process.env[name] || "";
        },
        readDirectory,
        getModifiedTime: getModifiedTime3,
        setModifiedTime,
        deleteFile,
        createHash: _crypto ? createSHA256Hash : generateDjb2Hash,
        createSHA256Hash: _crypto ? createSHA256Hash : void 0,
        getMemoryUsage() {
          if (global.gc) {
            global.gc();
          }
          return process.memoryUsage().heapUsed;
        },
        getFileSize(path) {
          try {
            const stat = statSync(path);
            if (stat == null ? void 0 : stat.isFile()) {
              return stat.size;
            }
          } catch {
          }
          return 0;
        },
        exit(exitCode) {
          disableCPUProfiler(() => process.exit(exitCode));
        },
        enableCPUProfiler,
        disableCPUProfiler,
        cpuProfilingEnabled: () => !!activeSession || contains(process.execArgv, "--cpu-prof") || contains(process.execArgv, "--prof"),
        realpath,
        debugMode: !!process.env.NODE_INSPECTOR_IPC || !!process.env.VSCODE_INSPECTOR_OPTIONS || some(process.execArgv, (arg) => /^--(inspect|debug)(-brk)?(=\d+)?$/i.test(arg)) || !!process.recordreplay,
        tryEnableSourceMapsForHost() {
          try {
            require("source-map-support").install();
          } catch {
          }
        },
        setTimeout,
        clearTimeout,
        clearScreen: () => {
          process.stdout.write("\x1Bc");
        },
        setBlocking: () => {
          var _a;
          const handle = (_a = process.stdout) == null ? void 0 : _a._handle;
          if (handle && handle.setBlocking) {
            handle.setBlocking(true);
          }
        },
        bufferFrom,
        base64decode: (input) => bufferFrom(input, "base64").toString("utf8"),
        base64encode: (input) => bufferFrom(input).toString("base64"),
        require: (baseDir, moduleName) => {
          try {
            const modulePath = resolveJSModule(moduleName, baseDir, nodeSystem);
            return { module: require(modulePath), modulePath, error: void 0 };
          } catch (error) {
            return { module: void 0, modulePath: void 0, error };
          }
        }
      };
      return nodeSystem;
      function statSync(path) {
        return _fs.statSync(path, { throwIfNoEntry: false });
      }
      function enableCPUProfiler(path, cb) {
        if (activeSession) {
          cb();
          return false;
        }
        const inspector = require("inspector");
        if (!inspector || !inspector.Session) {
          cb();
          return false;
        }
        const session = new inspector.Session();
        session.connect();
        session.post("Profiler.enable", () => {
          session.post("Profiler.start", () => {
            activeSession = session;
            profilePath = path;
            cb();
          });
        });
        return true;
      }
      function cleanupPaths(profile) {
        let externalFileCounter = 0;
        const remappedPaths = /* @__PURE__ */ new Map();
        const normalizedDir = normalizeSlashes(_path.dirname(executingFilePath));
        const fileUrlRoot = `file://${getRootLength(normalizedDir) === 1 ? "" : "/"}${normalizedDir}`;
        for (const node of profile.nodes) {
          if (node.callFrame.url) {
            const url = normalizeSlashes(node.callFrame.url);
            if (containsPath(fileUrlRoot, url, useCaseSensitiveFileNames2)) {
              node.callFrame.url = getRelativePathToDirectoryOrUrl(
                fileUrlRoot,
                url,
                fileUrlRoot,
                createGetCanonicalFileName(useCaseSensitiveFileNames2),
                /*isAbsolutePathAnUrl*/
                true
              );
            } else if (!nativePattern.test(url)) {
              node.callFrame.url = (remappedPaths.has(url) ? remappedPaths : remappedPaths.set(url, `external${externalFileCounter}.js`)).get(url);
              externalFileCounter++;
            }
          }
        }
        return profile;
      }
      function disableCPUProfiler(cb) {
        if (activeSession && activeSession !== "stopping") {
          const s = activeSession;
          activeSession.post("Profiler.stop", (err, { profile }) => {
            var _a;
            if (!err) {
              try {
                if ((_a = statSync(profilePath)) == null ? void 0 : _a.isDirectory()) {
                  profilePath = _path.join(profilePath, `${(/* @__PURE__ */ new Date()).toISOString().replace(/:/g, "-")}+P${process.pid}.cpuprofile`);
                }
              } catch {
              }
              try {
                _fs.mkdirSync(_path.dirname(profilePath), { recursive: true });
              } catch {
              }
              _fs.writeFileSync(profilePath, JSON.stringify(cleanupPaths(profile)));
            }
            activeSession = void 0;
            s.disconnect();
            cb();
          });
          activeSession = "stopping";
          return true;
        } else {
          cb();
          return false;
        }
      }
      function bufferFrom(input, encoding) {
        return Buffer.from && Buffer.from !== Int8Array.from ? Buffer.from(input, encoding) : new Buffer(input, encoding);
      }
      function isFileSystemCaseSensitive() {
        if (platform === "win32" || platform === "win64") {
          return false;
        }
        return !fileExists(swapCase(__filename));
      }
      function swapCase(s) {
        return s.replace(/\w/g, (ch) => {
          const up = ch.toUpperCase();
          return ch === up ? ch.toLowerCase() : up;
        });
      }
      function fsWatchFileWorker(fileName, callback, pollingInterval) {
        _fs.watchFile(fileName, { persistent: true, interval: pollingInterval }, fileChanged);
        let eventKind;
        return {
          close: () => _fs.unwatchFile(fileName, fileChanged)
        };
        function fileChanged(curr, prev) {
          const isPreviouslyDeleted = +prev.mtime === 0 || eventKind === 2 /* Deleted */;
          if (+curr.mtime === 0) {
            if (isPreviouslyDeleted) {
              return;
            }
            eventKind = 2 /* Deleted */;
          } else if (isPreviouslyDeleted) {
            eventKind = 0 /* Created */;
          } else if (+curr.mtime === +prev.mtime) {
            return;
          } else {
            eventKind = 1 /* Changed */;
          }
          callback(fileName, eventKind, curr.mtime);
        }
      }
      function fsWatchWorker(fileOrDirectory, recursive, callback) {
        return _fs.watch(
          fileOrDirectory,
          fsSupportsRecursiveFsWatch ? { persistent: true, recursive: !!recursive } : { persistent: true },
          callback
        );
      }
      function readFileWorker(fileName, _encoding) {
        let buffer;
        try {
          buffer = _fs.readFileSync(fileName);
        } catch (e) {
          return void 0;
        }
        let len = buffer.length;
        if (len >= 2 && buffer[0] === 254 && buffer[1] === 255) {
          len &= ~1;
          for (let i = 0; i < len; i += 2) {
            const temp = buffer[i];
            buffer[i] = buffer[i + 1];
            buffer[i + 1] = temp;
          }
          return buffer.toString("utf16le", 2);
        }
        if (len >= 2 && buffer[0] === 255 && buffer[1] === 254) {
          return buffer.toString("utf16le", 2);
        }
        if (len >= 3 && buffer[0] === 239 && buffer[1] === 187 && buffer[2] === 191) {
          return buffer.toString("utf8", 3);
        }
        return buffer.toString("utf8");
      }
      function readFile(fileName, _encoding) {
        var _a, _b;
        (_a = perfLogger) == null ? void 0 : _a.logStartReadFile(fileName);
        const file = readFileWorker(fileName, _encoding);
        (_b = perfLogger) == null ? void 0 : _b.logStopReadFile();
        return file;
      }
      function writeFile2(fileName, data, writeByteOrderMark) {
        var _a;
        (_a = perfLogger) == null ? void 0 : _a.logEvent("WriteFile: " + fileName);
        if (writeByteOrderMark) {
          data = byteOrderMarkIndicator + data;
        }
        let fd;
        try {
          fd = _fs.openSync(fileName, "w");
          _fs.writeSync(
            fd,
            data,
            /*position*/
            void 0,
            "utf8"
          );
        } finally {
          if (fd !== void 0) {
            _fs.closeSync(fd);
          }
        }
      }
      function getAccessibleFileSystemEntries(path) {
        var _a;
        (_a = perfLogger) == null ? void 0 : _a.logEvent("ReadDir: " + (path || "."));
        try {
          const entries = _fs.readdirSync(path || ".", { withFileTypes: true });
          const files = [];
          const directories = [];
          for (const dirent of entries) {
            const entry = typeof dirent === "string" ? dirent : dirent.name;
            if (entry === "." || entry === "..") {
              continue;
            }
            let stat;
            if (typeof dirent === "string" || dirent.isSymbolicLink()) {
              const name = combinePaths(path, entry);
              try {
                stat = statSync(name);
                if (!stat) {
                  continue;
                }
              } catch (e) {
                continue;
              }
            } else {
              stat = dirent;
            }
            if (stat.isFile()) {
              files.push(entry);
            } else if (stat.isDirectory()) {
              directories.push(entry);
            }
          }
          files.sort();
          directories.sort();
          return { files, directories };
        } catch (e) {
          return emptyFileSystemEntries;
        }
      }
      function readDirectory(path, extensions, excludes, includes, depth) {
        return matchFiles(path, extensions, excludes, includes, useCaseSensitiveFileNames2, process.cwd(), depth, getAccessibleFileSystemEntries, realpath);
      }
      function fileSystemEntryExists(path, entryKind) {
        const originalStackTraceLimit = Error.stackTraceLimit;
        Error.stackTraceLimit = 0;
        try {
          const stat = statSync(path);
          if (!stat) {
            return false;
          }
          switch (entryKind) {
            case 0 /* File */:
              return stat.isFile();
            case 1 /* Directory */:
              return stat.isDirectory();
            default:
              return false;
          }
        } catch (e) {
          return false;
        } finally {
          Error.stackTraceLimit = originalStackTraceLimit;
        }
      }
      function fileExists(path) {
        return fileSystemEntryExists(path, 0 /* File */);
      }
      function directoryExists(path) {
        return fileSystemEntryExists(path, 1 /* Directory */);
      }
      function getDirectories(path) {
        return getAccessibleFileSystemEntries(path).directories.slice();
      }
      function fsRealPathHandlingLongPath(path) {
        return path.length < 260 ? _fs.realpathSync.native(path) : _fs.realpathSync(path);
      }
      function realpath(path) {
        try {
          return fsRealpath(path);
        } catch {
          return path;
        }
      }
      function getModifiedTime3(path) {
        var _a;
        const originalStackTraceLimit = Error.stackTraceLimit;
        Error.stackTraceLimit = 0;
        try {
          return (_a = statSync(path)) == null ? void 0 : _a.mtime;
        } catch (e) {
          return void 0;
        } finally {
          Error.stackTraceLimit = originalStackTraceLimit;
        }
      }
      function setModifiedTime(path, time) {
        try {
          _fs.utimesSync(path, time, time);
        } catch (e) {
          return;
        }
      }
      function deleteFile(path) {
        try {
          return _fs.unlinkSync(path);
        } catch (e) {
          return;
        }
      }
      function createSHA256Hash(data) {
        const hash = _crypto.createHash("sha256");
        hash.update(data);
        return hash.digest("hex");
      }
    }
    let sys2;
    if (isNodeLikeSystem()) {
      sys2 = getNodeSystem();
    }
    if (sys2) {
      patchWriteFileEnsuringDirectory(sys2);
    }
    return sys2;
  })();
  if (sys && sys.getEnvironmentVariable) {
    setCustomPollingValues(sys);
    Debug.setAssertionLevel(
      /^development$/i.test(sys.getEnvironmentVariable("NODE_ENV")) ? 1 /* Normal */ : 0 /* None */
    );
  }
  if (sys && sys.debugMode) {
    Debug.isDebugging = true;
  }
  
  // src/compiler/path.ts
  var directorySeparator = "/";
  var altDirectorySeparator = "\\";
  var urlSchemeSeparator = "://";
  var backslashRegExp = /\\/g;
  function isAnyDirectorySeparator(charCode) {
    return charCode === 47 /* slash */ || charCode === 92 /* backslash */;
  }
  function isRootedDiskPath(path) {
    return getEncodedRootLength(path) > 0;
  }
  function isDiskPathRoot(path) {
    const rootLength = getEncodedRootLength(path);
    return rootLength > 0 && rootLength === path.length;
  }
  function pathIsAbsolute(path) {
    return getEncodedRootLength(path) !== 0;
  }
  function pathIsRelative(path) {
    return /^\.\.?($|[\\/])/.test(path);
  }
  function pathIsBareSpecifier(path) {
    return !pathIsAbsolute(path) && !pathIsRelative(path);
  }
  function hasExtension(fileName) {
    return getBaseFileName(fileName).includes(".");
  }
  function fileExtensionIs(path, extension) {
    return path.length > extension.length && endsWith(path, extension);
  }
  function fileExtensionIsOneOf(path, extensions) {
    for (const extension of extensions) {
      if (fileExtensionIs(path, extension)) {
        return true;
      }
    }
    return false;
  }
  function hasTrailingDirectorySeparator(path) {
    return path.length > 0 && isAnyDirectorySeparator(path.charCodeAt(path.length - 1));
  }
  function isVolumeCharacter(charCode) {
    return charCode >= 97 /* a */ && charCode <= 122 /* z */ || charCode >= 65 /* A */ && charCode <= 90 /* Z */;
  }
  function getFileUrlVolumeSeparatorEnd(url, start) {
    const ch0 = url.charCodeAt(start);
    if (ch0 === 58 /* colon */)
      return start + 1;
    if (ch0 === 37 /* percent */ && url.charCodeAt(start + 1) === 51 /* _3 */) {
      const ch2 = url.charCodeAt(start + 2);
      if (ch2 === 97 /* a */ || ch2 === 65 /* A */)
        return start + 3;
    }
    return -1;
  }
  function getEncodedRootLength(path) {
    if (!path)
      return 0;
    const ch0 = path.charCodeAt(0);
    if (ch0 === 47 /* slash */ || ch0 === 92 /* backslash */) {
      if (path.charCodeAt(1) !== ch0)
        return 1;
      const p1 = path.indexOf(ch0 === 47 /* slash */ ? directorySeparator : altDirectorySeparator, 2);
      if (p1 < 0)
        return path.length;
      return p1 + 1;
    }
    if (isVolumeCharacter(ch0) && path.charCodeAt(1) === 58 /* colon */) {
      const ch2 = path.charCodeAt(2);
      if (ch2 === 47 /* slash */ || ch2 === 92 /* backslash */)
        return 3;
      if (path.length === 2)
        return 2;
    }
    const schemeEnd = path.indexOf(urlSchemeSeparator);
    if (schemeEnd !== -1) {
      const authorityStart = schemeEnd + urlSchemeSeparator.length;
      const authorityEnd = path.indexOf(directorySeparator, authorityStart);
      if (authorityEnd !== -1) {
        const scheme = path.slice(0, schemeEnd);
        const authority = path.slice(authorityStart, authorityEnd);
        if (scheme === "file" && (authority === "" || authority === "localhost") && isVolumeCharacter(path.charCodeAt(authorityEnd + 1))) {
          const volumeSeparatorEnd = getFileUrlVolumeSeparatorEnd(path, authorityEnd + 2);
          if (volumeSeparatorEnd !== -1) {
            if (path.charCodeAt(volumeSeparatorEnd) === 47 /* slash */) {
              return ~(volumeSeparatorEnd + 1);
            }
            if (volumeSeparatorEnd === path.length) {
              return ~volumeSeparatorEnd;
            }
          }
        }
        return ~(authorityEnd + 1);
      }
      return ~path.length;
    }
    return 0;
  }
  function getRootLength(path) {
    const rootLength = getEncodedRootLength(path);
    return rootLength < 0 ? ~rootLength : rootLength;
  }
  function getDirectoryPath(path) {
    path = normalizeSlashes(path);
    const rootLength = getRootLength(path);
    if (rootLength === path.length)
      return path;
    path = removeTrailingDirectorySeparator(path);
    return path.slice(0, Math.max(rootLength, path.lastIndexOf(directorySeparator)));
  }
  function getBaseFileName(path, extensions, ignoreCase) {
    path = normalizeSlashes(path);
    const rootLength = getRootLength(path);
    if (rootLength === path.length)
      return "";
    path = removeTrailingDirectorySeparator(path);
    const name = path.slice(Math.max(getRootLength(path), path.lastIndexOf(directorySeparator) + 1));
    const extension = extensions !== void 0 && ignoreCase !== void 0 ? getAnyExtensionFromPath(name, extensions, ignoreCase) : void 0;
    return extension ? name.slice(0, name.length - extension.length) : name;
  }
  function tryGetExtensionFromPath(path, extension, stringEqualityComparer) {
    if (!startsWith(extension, "."))
      extension = "." + extension;
    if (path.length >= extension.length && path.charCodeAt(path.length - extension.length) === 46 /* dot */) {
      const pathExtension = path.slice(path.length - extension.length);
      if (stringEqualityComparer(pathExtension, extension)) {
        return pathExtension;
      }
    }
  }
  function getAnyExtensionFromPathWorker(path, extensions, stringEqualityComparer) {
    if (typeof extensions === "string") {
      return tryGetExtensionFromPath(path, extensions, stringEqualityComparer) || "";
    }
    for (const extension of extensions) {
      const result = tryGetExtensionFromPath(path, extension, stringEqualityComparer);
      if (result)
        return result;
    }
    return "";
  }
  function getAnyExtensionFromPath(path, extensions, ignoreCase) {
    if (extensions) {
      return getAnyExtensionFromPathWorker(removeTrailingDirectorySeparator(path), extensions, ignoreCase ? equateStringsCaseInsensitive : equateStringsCaseSensitive);
    }
    const baseFileName = getBaseFileName(path);
    const extensionIndex = baseFileName.lastIndexOf(".");
    if (extensionIndex >= 0) {
      return baseFileName.substring(extensionIndex);
    }
    return "";
  }
  function pathComponents(path, rootLength) {
    const root = path.substring(0, rootLength);
    const rest = path.substring(rootLength).split(directorySeparator);
    if (rest.length && !lastOrUndefined(rest))
      rest.pop();
    return [root, ...rest];
  }
  function getPathComponents(path, currentDirectory = "") {
    path = combinePaths(currentDirectory, path);
    return pathComponents(path, getRootLength(path));
  }
  function getPathFromPathComponents(pathComponents2, length2) {
    if (pathComponents2.length === 0)
      return "";
    const root = pathComponents2[0] && ensureTrailingDirectorySeparator(pathComponents2[0]);
    return root + pathComponents2.slice(1, length2).join(directorySeparator);
  }
  function normalizeSlashes(path) {
    return path.includes("\\") ? path.replace(backslashRegExp, directorySeparator) : path;
  }
  function reducePathComponents(components) {
    if (!some(components))
      return [];
    const reduced = [components[0]];
    for (let i = 1; i < components.length; i++) {
      const component = components[i];
      if (!component)
        continue;
      if (component === ".")
        continue;
      if (component === "..") {
        if (reduced.length > 1) {
          if (reduced[reduced.length - 1] !== "..") {
            reduced.pop();
            continue;
          }
        } else if (reduced[0])
          continue;
      }
      reduced.push(component);
    }
    return reduced;
  }
  function combinePaths(path, ...paths) {
    if (path)
      path = normalizeSlashes(path);
    for (let relativePath of paths) {
      if (!relativePath)
        continue;
      relativePath = normalizeSlashes(relativePath);
      if (!path || getRootLength(relativePath) !== 0) {
        path = relativePath;
      } else {
        path = ensureTrailingDirectorySeparator(path) + relativePath;
      }
    }
    return path;
  }
  function resolvePath(path, ...paths) {
    return normalizePath(some(paths) ? combinePaths(path, ...paths) : normalizeSlashes(path));
  }
  function getNormalizedPathComponents(path, currentDirectory) {
    return reducePathComponents(getPathComponents(path, currentDirectory));
  }
  function getNormalizedAbsolutePath(fileName, currentDirectory) {
    return getPathFromPathComponents(getNormalizedPathComponents(fileName, currentDirectory));
  }
  function normalizePath(path) {
    path = normalizeSlashes(path);
    if (!relativePathSegmentRegExp.test(path)) {
      return path;
    }
    const simplified = path.replace(/\/\.\//g, "/").replace(/^\.\//, "");
    if (simplified !== path) {
      path = simplified;
      if (!relativePathSegmentRegExp.test(path)) {
        return path;
      }
    }
    const normalized = getPathFromPathComponents(reducePathComponents(getPathComponents(path)));
    return normalized && hasTrailingDirectorySeparator(path) ? ensureTrailingDirectorySeparator(normalized) : normalized;
  }
  function getPathWithoutRoot(pathComponents2) {
    if (pathComponents2.length === 0)
      return "";
    return pathComponents2.slice(1).join(directorySeparator);
  }
  function getNormalizedAbsolutePathWithoutRoot(fileName, currentDirectory) {
    return getPathWithoutRoot(getNormalizedPathComponents(fileName, currentDirectory));
  }
  function toPath(fileName, basePath, getCanonicalFileName) {
    const nonCanonicalizedPath = isRootedDiskPath(fileName) ? normalizePath(fileName) : getNormalizedAbsolutePath(fileName, basePath);
    return getCanonicalFileName(nonCanonicalizedPath);
  }
  function removeTrailingDirectorySeparator(path) {
    if (hasTrailingDirectorySeparator(path)) {
      return path.substr(0, path.length - 1);
    }
    return path;
  }
  function ensureTrailingDirectorySeparator(path) {
    if (!hasTrailingDirectorySeparator(path)) {
      return path + directorySeparator;
    }
    return path;
  }
  function ensurePathIsNonModuleName(path) {
    return !pathIsAbsolute(path) && !pathIsRelative(path) ? "./" + path : path;
  }
  function changeAnyExtension(path, ext, extensions, ignoreCase) {
    const pathext = extensions !== void 0 && ignoreCase !== void 0 ? getAnyExtensionFromPath(path, extensions, ignoreCase) : getAnyExtensionFromPath(path);
    return pathext ? path.slice(0, path.length - pathext.length) + (startsWith(ext, ".") ? ext : "." + ext) : path;
  }
  var relativePathSegmentRegExp = /(?:\/\/)|(?:^|\/)\.\.?(?:$|\/)/;
  function comparePathsWorker(a, b, componentComparer) {
    if (a === b)
      return 0 /* EqualTo */;
    if (a === void 0)
      return -1 /* LessThan */;
    if (b === void 0)
      return 1 /* GreaterThan */;
    const aRoot = a.substring(0, getRootLength(a));
    const bRoot = b.substring(0, getRootLength(b));
    const result = compareStringsCaseInsensitive(aRoot, bRoot);
    if (result !== 0 /* EqualTo */) {
      return result;
    }
    const aRest = a.substring(aRoot.length);
    const bRest = b.substring(bRoot.length);
    if (!relativePathSegmentRegExp.test(aRest) && !relativePathSegmentRegExp.test(bRest)) {
      return componentComparer(aRest, bRest);
    }
    const aComponents = reducePathComponents(getPathComponents(a));
    const bComponents = reducePathComponents(getPathComponents(b));
    const sharedLength = Math.min(aComponents.length, bComponents.length);
    for (let i = 1; i < sharedLength; i++) {
      const result2 = componentComparer(aComponents[i], bComponents[i]);
      if (result2 !== 0 /* EqualTo */) {
        return result2;
      }
    }
    return compareValues(aComponents.length, bComponents.length);
  }
  function comparePaths(a, b, currentDirectory, ignoreCase) {
    if (typeof currentDirectory === "string") {
      a = combinePaths(currentDirectory, a);
      b = combinePaths(currentDirectory, b);
    } else if (typeof currentDirectory === "boolean") {
      ignoreCase = currentDirectory;
    }
    return comparePathsWorker(a, b, getStringComparer(ignoreCase));
  }
  function containsPath(parent, child, currentDirectory, ignoreCase) {
    if (typeof currentDirectory === "string") {
      parent = combinePaths(currentDirectory, parent);
      child = combinePaths(currentDirectory, child);
    } else if (typeof currentDirectory === "boolean") {
      ignoreCase = currentDirectory;
    }
    if (parent === void 0 || child === void 0)
      return false;
    if (parent === child)
      return true;
    const parentComponents = reducePathComponents(getPathComponents(parent));
    const childComponents = reducePathComponents(getPathComponents(child));
    if (childComponents.length < parentComponents.length) {
      return false;
    }
    const componentEqualityComparer = ignoreCase ? equateStringsCaseInsensitive : equateStringsCaseSensitive;
    for (let i = 0; i < parentComponents.length; i++) {
      const equalityComparer = i === 0 ? equateStringsCaseInsensitive : componentEqualityComparer;
      if (!equalityComparer(parentComponents[i], childComponents[i])) {
        return false;
      }
    }
    return true;
  }
  function startsWithDirectory(fileName, directoryName, getCanonicalFileName) {
    const canonicalFileName = getCanonicalFileName(fileName);
    const canonicalDirectoryName = getCanonicalFileName(directoryName);
    return startsWith(canonicalFileName, canonicalDirectoryName + "/") || startsWith(canonicalFileName, canonicalDirectoryName + "\\");
  }
  function getPathComponentsRelativeTo(from, to, stringEqualityComparer, getCanonicalFileName) {
    const fromComponents = reducePathComponents(getPathComponents(from));
    const toComponents = reducePathComponents(getPathComponents(to));
    let start;
    for (start = 0; start < fromComponents.length && start < toComponents.length; start++) {
      const fromComponent = getCanonicalFileName(fromComponents[start]);
      const toComponent = getCanonicalFileName(toComponents[start]);
      const comparer = start === 0 ? equateStringsCaseInsensitive : stringEqualityComparer;
      if (!comparer(fromComponent, toComponent))
        break;
    }
    if (start === 0) {
      return toComponents;
    }
    const components = toComponents.slice(start);
    const relative = [];
    for (; start < fromComponents.length; start++) {
      relative.push("..");
    }
    return ["", ...relative, ...components];
  }
  function getRelativePathFromDirectory(fromDirectory, to, getCanonicalFileNameOrIgnoreCase) {
    Debug.assert(getRootLength(fromDirectory) > 0 === getRootLength(to) > 0, "Paths must either both be absolute or both be relative");
    const getCanonicalFileName = typeof getCanonicalFileNameOrIgnoreCase === "function" ? getCanonicalFileNameOrIgnoreCase : identity;
    const ignoreCase = typeof getCanonicalFileNameOrIgnoreCase === "boolean" ? getCanonicalFileNameOrIgnoreCase : false;
    const pathComponents2 = getPathComponentsRelativeTo(fromDirectory, to, ignoreCase ? equateStringsCaseInsensitive : equateStringsCaseSensitive, getCanonicalFileName);
    return getPathFromPathComponents(pathComponents2);
  }
  function convertToRelativePath(absoluteOrRelativePath, basePath, getCanonicalFileName) {
    return !isRootedDiskPath(absoluteOrRelativePath) ? absoluteOrRelativePath : getRelativePathToDirectoryOrUrl(
      basePath,
      absoluteOrRelativePath,
      basePath,
      getCanonicalFileName,
      /*isAbsolutePathAnUrl*/
      false
    );
  }
  function getRelativePathFromFile(from, to, getCanonicalFileName) {
    return ensurePathIsNonModuleName(getRelativePathFromDirectory(getDirectoryPath(from), to, getCanonicalFileName));
  }
  function getRelativePathToDirectoryOrUrl(directoryPathOrUrl, relativeOrAbsolutePath, currentDirectory, getCanonicalFileName, isAbsolutePathAnUrl) {
    const pathComponents2 = getPathComponentsRelativeTo(
      resolvePath(currentDirectory, directoryPathOrUrl),
      resolvePath(currentDirectory, relativeOrAbsolutePath),
      equateStringsCaseSensitive,
      getCanonicalFileName
    );
    const firstComponent = pathComponents2[0];
    if (isAbsolutePathAnUrl && isRootedDiskPath(firstComponent)) {
      const prefix = firstComponent.charAt(0) === directorySeparator ? "file://" : "file:///";
      pathComponents2[0] = prefix + firstComponent;
    }
    return getPathFromPathComponents(pathComponents2);
  }
  function forEachAncestorDirectory(directory, callback) {
    while (true) {
      const result = callback(directory);
      if (result !== void 0) {
        return result;
      }
      const parentPath = getDirectoryPath(directory);
      if (parentPath === directory) {
        return void 0;
      }
      directory = parentPath;
    }
  }
  function isNodeModulesDirectory(dirPath) {
    return endsWith(dirPath, "/node_modules");
  }
  
  // src/compiler/diagnosticInformationMap.generated.ts
  function diag(code, category, key, message, reportsUnnecessary, elidedInCompatabilityPyramid, reportsDeprecated) {
    return { code, category, key, message, reportsUnnecessary, elidedInCompatabilityPyramid, reportsDeprecated };
  }
  var Diagnostics = {
    Unterminated_string_literal: diag(1002, 1 /* Error */, "Unterminated_string_literal_1002", "Unterminated string literal."),
    Identifier_expected: diag(1003, 1 /* Error */, "Identifier_expected_1003", "Identifier expected."),
    _0_expected: diag(1005, 1 /* Error */, "_0_expected_1005", "'{0}' expected."),
    A_file_cannot_have_a_reference_to_itself: diag(1006, 1 /* Error */, "A_file_cannot_have_a_reference_to_itself_1006", "A file cannot have a reference to itself."),
    The_parser_expected_to_find_a_1_to_match_the_0_token_here: diag(1007, 1 /* Error */, "The_parser_expected_to_find_a_1_to_match_the_0_token_here_1007", "The parser expected to find a '{1}' to match the '{0}' token here."),
    Trailing_comma_not_allowed: diag(1009, 1 /* Error */, "Trailing_comma_not_allowed_1009", "Trailing comma not allowed."),
    Asterisk_Slash_expected: diag(1010, 1 /* Error */, "Asterisk_Slash_expected_1010", "'*/' expected."),
    An_element_access_expression_should_take_an_argument: diag(1011, 1 /* Error */, "An_element_access_expression_should_take_an_argument_1011", "An element access expression should take an argument."),
    Unexpected_token: diag(1012, 1 /* Error */, "Unexpected_token_1012", "Unexpected token."),
    A_rest_parameter_or_binding_pattern_may_not_have_a_trailing_comma: diag(1013, 1 /* Error */, "A_rest_parameter_or_binding_pattern_may_not_have_a_trailing_comma_1013", "A rest parameter or binding pattern may not have a trailing comma."),
    A_rest_parameter_must_be_last_in_a_parameter_list: diag(1014, 1 /* Error */, "A_rest_parameter_must_be_last_in_a_parameter_list_1014", "A rest parameter must be last in a parameter list."),
    Parameter_cannot_have_question_mark_and_initializer: diag(1015, 1 /* Error */, "Parameter_cannot_have_question_mark_and_initializer_1015", "Parameter cannot have question mark and initializer."),
    A_required_parameter_cannot_follow_an_optional_parameter: diag(1016, 1 /* Error */, "A_required_parameter_cannot_follow_an_optional_parameter_1016", "A required parameter cannot follow an optional parameter."),
    An_index_signature_cannot_have_a_rest_parameter: diag(1017, 1 /* Error */, "An_index_signature_cannot_have_a_rest_parameter_1017", "An index signature cannot have a rest parameter."),
    An_index_signature_parameter_cannot_have_an_accessibility_modifier: diag(1018, 1 /* Error */, "An_index_signature_parameter_cannot_have_an_accessibility_modifier_1018", "An index signature parameter cannot have an accessibility modifier."),
    An_index_signature_parameter_cannot_have_a_question_mark: diag(1019, 1 /* Error */, "An_index_signature_parameter_cannot_have_a_question_mark_1019", "An index signature parameter cannot have a question mark."),
    An_index_signature_parameter_cannot_have_an_initializer: diag(1020, 1 /* Error */, "An_index_signature_parameter_cannot_have_an_initializer_1020", "An index signature parameter cannot have an initializer."),
    An_index_signature_must_have_a_type_annotation: diag(1021, 1 /* Error */, "An_index_signature_must_have_a_type_annotation_1021", "An index signature must have a type annotation."),
    An_index_signature_parameter_must_have_a_type_annotation: diag(1022, 1 /* Error */, "An_index_signature_parameter_must_have_a_type_annotation_1022", "An index signature parameter must have a type annotation."),
    readonly_modifier_can_only_appear_on_a_property_declaration_or_index_signature: diag(1024, 1 /* Error */, "readonly_modifier_can_only_appear_on_a_property_declaration_or_index_signature_1024", "'readonly' modifier can only appear on a property declaration or index signature."),
    An_index_signature_cannot_have_a_trailing_comma: diag(1025, 1 /* Error */, "An_index_signature_cannot_have_a_trailing_comma_1025", "An index signature cannot have a trailing comma."),
    Accessibility_modifier_already_seen: diag(1028, 1 /* Error */, "Accessibility_modifier_already_seen_1028", "Accessibility modifier already seen."),
    _0_modifier_must_precede_1_modifier: diag(1029, 1 /* Error */, "_0_modifier_must_precede_1_modifier_1029", "'{0}' modifier must precede '{1}' modifier."),
    _0_modifier_already_seen: diag(1030, 1 /* Error */, "_0_modifier_already_seen_1030", "'{0}' modifier already seen."),
    _0_modifier_cannot_appear_on_class_elements_of_this_kind: diag(1031, 1 /* Error */, "_0_modifier_cannot_appear_on_class_elements_of_this_kind_1031", "'{0}' modifier cannot appear on class elements of this kind."),
    super_must_be_followed_by_an_argument_list_or_member_access: diag(1034, 1 /* Error */, "super_must_be_followed_by_an_argument_list_or_member_access_1034", "'super' must be followed by an argument list or member access."),
    Only_ambient_modules_can_use_quoted_names: diag(1035, 1 /* Error */, "Only_ambient_modules_can_use_quoted_names_1035", "Only ambient modules can use quoted names."),
    Statements_are_not_allowed_in_ambient_contexts: diag(1036, 1 /* Error */, "Statements_are_not_allowed_in_ambient_contexts_1036", "Statements are not allowed in ambient contexts."),
    A_declare_modifier_cannot_be_used_in_an_already_ambient_context: diag(1038, 1 /* Error */, "A_declare_modifier_cannot_be_used_in_an_already_ambient_context_1038", "A 'declare' modifier cannot be used in an already ambient context."),
    Initializers_are_not_allowed_in_ambient_contexts: diag(1039, 1 /* Error */, "Initializers_are_not_allowed_in_ambient_contexts_1039", "Initializers are not allowed in ambient contexts."),
    _0_modifier_cannot_be_used_in_an_ambient_context: diag(1040, 1 /* Error */, "_0_modifier_cannot_be_used_in_an_ambient_context_1040", "'{0}' modifier cannot be used in an ambient context."),
    _0_modifier_cannot_be_used_here: diag(1042, 1 /* Error */, "_0_modifier_cannot_be_used_here_1042", "'{0}' modifier cannot be used here."),
    _0_modifier_cannot_appear_on_a_module_or_namespace_element: diag(1044, 1 /* Error */, "_0_modifier_cannot_appear_on_a_module_or_namespace_element_1044", "'{0}' modifier cannot appear on a module or namespace element."),
    Top_level_declarations_in_d_ts_files_must_start_with_either_a_declare_or_export_modifier: diag(1046, 1 /* Error */, "Top_level_declarations_in_d_ts_files_must_start_with_either_a_declare_or_export_modifier_1046", "Top-level declarations in .d.ts files must start with either a 'declare' or 'export' modifier."),
    A_rest_parameter_cannot_be_optional: diag(1047, 1 /* Error */, "A_rest_parameter_cannot_be_optional_1047", "A rest parameter cannot be optional."),
    A_rest_parameter_cannot_have_an_initializer: diag(1048, 1 /* Error */, "A_rest_parameter_cannot_have_an_initializer_1048", "A rest parameter cannot have an initializer."),
    A_set_accessor_must_have_exactly_one_parameter: diag(1049, 1 /* Error */, "A_set_accessor_must_have_exactly_one_parameter_1049", "A 'set' accessor must have exactly one parameter."),
    A_set_accessor_cannot_have_an_optional_parameter: diag(1051, 1 /* Error */, "A_set_accessor_cannot_have_an_optional_parameter_1051", "A 'set' accessor cannot have an optional parameter."),
    A_set_accessor_parameter_cannot_have_an_initializer: diag(1052, 1 /* Error */, "A_set_accessor_parameter_cannot_have_an_initializer_1052", "A 'set' accessor parameter cannot have an initializer."),
    A_set_accessor_cannot_have_rest_parameter: diag(1053, 1 /* Error */, "A_set_accessor_cannot_have_rest_parameter_1053", "A 'set' accessor cannot have rest parameter."),
    A_get_accessor_cannot_have_parameters: diag(1054, 1 /* Error */, "A_get_accessor_cannot_have_parameters_1054", "A 'get' accessor cannot have parameters."),
    Type_0_is_not_a_valid_async_function_return_type_in_ES5_SlashES3_because_it_does_not_refer_to_a_Promise_compatible_constructor_value: diag(1055, 1 /* Error */, "Type_0_is_not_a_valid_async_function_return_type_in_ES5_SlashES3_because_it_does_not_refer_to_a_Prom_1055", "Type '{0}' is not a valid async function return type in ES5/ES3 because it does not refer to a Promise-compatible constructor value."),
    Accessors_are_only_available_when_targeting_ECMAScript_5_and_higher: diag(1056, 1 /* Error */, "Accessors_are_only_available_when_targeting_ECMAScript_5_and_higher_1056", "Accessors are only available when targeting ECMAScript 5 and higher."),
    The_return_type_of_an_async_function_must_either_be_a_valid_promise_or_must_not_contain_a_callable_then_member: diag(1058, 1 /* Error */, "The_return_type_of_an_async_function_must_either_be_a_valid_promise_or_must_not_contain_a_callable_t_1058", "The return type of an async function must either be a valid promise or must not contain a callable 'then' member."),
    A_promise_must_have_a_then_method: diag(1059, 1 /* Error */, "A_promise_must_have_a_then_method_1059", "A promise must have a 'then' method."),
    The_first_parameter_of_the_then_method_of_a_promise_must_be_a_callback: diag(1060, 1 /* Error */, "The_first_parameter_of_the_then_method_of_a_promise_must_be_a_callback_1060", "The first parameter of the 'then' method of a promise must be a callback."),
    Enum_member_must_have_initializer: diag(1061, 1 /* Error */, "Enum_member_must_have_initializer_1061", "Enum member must have initializer."),
    Type_is_referenced_directly_or_indirectly_in_the_fulfillment_callback_of_its_own_then_method: diag(1062, 1 /* Error */, "Type_is_referenced_directly_or_indirectly_in_the_fulfillment_callback_of_its_own_then_method_1062", "Type is referenced directly or indirectly in the fulfillment callback of its own 'then' method."),
    An_export_assignment_cannot_be_used_in_a_namespace: diag(1063, 1 /* Error */, "An_export_assignment_cannot_be_used_in_a_namespace_1063", "An export assignment cannot be used in a namespace."),
    The_return_type_of_an_async_function_or_method_must_be_the_global_Promise_T_type_Did_you_mean_to_write_Promise_0: diag(1064, 1 /* Error */, "The_return_type_of_an_async_function_or_method_must_be_the_global_Promise_T_type_Did_you_mean_to_wri_1064", "The return type of an async function or method must be the global Promise<T> type. Did you mean to write 'Promise<{0}>'?"),
    The_return_type_of_an_async_function_or_method_must_be_the_global_Promise_T_type: diag(1065, 1 /* Error */, "The_return_type_of_an_async_function_or_method_must_be_the_global_Promise_T_type_1065", "The return type of an async function or method must be the global Promise<T> type."),
    In_ambient_enum_declarations_member_initializer_must_be_constant_expression: diag(1066, 1 /* Error */, "In_ambient_enum_declarations_member_initializer_must_be_constant_expression_1066", "In ambient enum declarations member initializer must be constant expression."),
    Unexpected_token_A_constructor_method_accessor_or_property_was_expected: diag(1068, 1 /* Error */, "Unexpected_token_A_constructor_method_accessor_or_property_was_expected_1068", "Unexpected token. A constructor, method, accessor, or property was expected."),
    Unexpected_token_A_type_parameter_name_was_expected_without_curly_braces: diag(1069, 1 /* Error */, "Unexpected_token_A_type_parameter_name_was_expected_without_curly_braces_1069", "Unexpected token. A type parameter name was expected without curly braces."),
    _0_modifier_cannot_appear_on_a_type_member: diag(1070, 1 /* Error */, "_0_modifier_cannot_appear_on_a_type_member_1070", "'{0}' modifier cannot appear on a type member."),
    _0_modifier_cannot_appear_on_an_index_signature: diag(1071, 1 /* Error */, "_0_modifier_cannot_appear_on_an_index_signature_1071", "'{0}' modifier cannot appear on an index signature."),
    A_0_modifier_cannot_be_used_with_an_import_declaration: diag(1079, 1 /* Error */, "A_0_modifier_cannot_be_used_with_an_import_declaration_1079", "A '{0}' modifier cannot be used with an import declaration."),
    Invalid_reference_directive_syntax: diag(1084, 1 /* Error */, "Invalid_reference_directive_syntax_1084", "Invalid 'reference' directive syntax."),
    _0_modifier_cannot_appear_on_a_constructor_declaration: diag(1089, 1 /* Error */, "_0_modifier_cannot_appear_on_a_constructor_declaration_1089", "'{0}' modifier cannot appear on a constructor declaration."),
    _0_modifier_cannot_appear_on_a_parameter: diag(1090, 1 /* Error */, "_0_modifier_cannot_appear_on_a_parameter_1090", "'{0}' modifier cannot appear on a parameter."),
    Only_a_single_variable_declaration_is_allowed_in_a_for_in_statement: diag(1091, 1 /* Error */, "Only_a_single_variable_declaration_is_allowed_in_a_for_in_statement_1091", "Only a single variable declaration is allowed in a 'for...in' statement."),
    Type_parameters_cannot_appear_on_a_constructor_declaration: diag(1092, 1 /* Error */, "Type_parameters_cannot_appear_on_a_constructor_declaration_1092", "Type parameters cannot appear on a constructor declaration."),
    Type_annotation_cannot_appear_on_a_constructor_declaration: diag(1093, 1 /* Error */, "Type_annotation_cannot_appear_on_a_constructor_declaration_1093", "Type annotation cannot appear on a constructor declaration."),
    An_accessor_cannot_have_type_parameters: diag(1094, 1 /* Error */, "An_accessor_cannot_have_type_parameters_1094", "An accessor cannot have type parameters."),
    A_set_accessor_cannot_have_a_return_type_annotation: diag(1095, 1 /* Error */, "A_set_accessor_cannot_have_a_return_type_annotation_1095", "A 'set' accessor cannot have a return type annotation."),
    An_index_signature_must_have_exactly_one_parameter: diag(1096, 1 /* Error */, "An_index_signature_must_have_exactly_one_parameter_1096", "An index signature must have exactly one parameter."),
    _0_list_cannot_be_empty: diag(1097, 1 /* Error */, "_0_list_cannot_be_empty_1097", "'{0}' list cannot be empty."),
    Type_parameter_list_cannot_be_empty: diag(1098, 1 /* Error */, "Type_parameter_list_cannot_be_empty_1098", "Type parameter list cannot be empty."),
    Type_argument_list_cannot_be_empty: diag(1099, 1 /* Error */, "Type_argument_list_cannot_be_empty_1099", "Type argument list cannot be empty."),
    Invalid_use_of_0_in_strict_mode: diag(1100, 1 /* Error */, "Invalid_use_of_0_in_strict_mode_1100", "Invalid use of '{0}' in strict mode."),
    with_statements_are_not_allowed_in_strict_mode: diag(1101, 1 /* Error */, "with_statements_are_not_allowed_in_strict_mode_1101", "'with' statements are not allowed in strict mode."),
    delete_cannot_be_called_on_an_identifier_in_strict_mode: diag(1102, 1 /* Error */, "delete_cannot_be_called_on_an_identifier_in_strict_mode_1102", "'delete' cannot be called on an identifier in strict mode."),
    for_await_loops_are_only_allowed_within_async_functions_and_at_the_top_levels_of_modules: diag(1103, 1 /* Error */, "for_await_loops_are_only_allowed_within_async_functions_and_at_the_top_levels_of_modules_1103", "'for await' loops are only allowed within async functions and at the top levels of modules."),
    A_continue_statement_can_only_be_used_within_an_enclosing_iteration_statement: diag(1104, 1 /* Error */, "A_continue_statement_can_only_be_used_within_an_enclosing_iteration_statement_1104", "A 'continue' statement can only be used within an enclosing iteration statement."),
    A_break_statement_can_only_be_used_within_an_enclosing_iteration_or_switch_statement: diag(1105, 1 /* Error */, "A_break_statement_can_only_be_used_within_an_enclosing_iteration_or_switch_statement_1105", "A 'break' statement can only be used within an enclosing iteration or switch statement."),
    The_left_hand_side_of_a_for_of_statement_may_not_be_async: diag(1106, 1 /* Error */, "The_left_hand_side_of_a_for_of_statement_may_not_be_async_1106", "The left-hand side of a 'for...of' statement may not be 'async'."),
    Jump_target_cannot_cross_function_boundary: diag(1107, 1 /* Error */, "Jump_target_cannot_cross_function_boundary_1107", "Jump target cannot cross function boundary."),
    A_return_statement_can_only_be_used_within_a_function_body: diag(1108, 1 /* Error */, "A_return_statement_can_only_be_used_within_a_function_body_1108", "A 'return' statement can only be used within a function body."),
    Expression_expected: diag(1109, 1 /* Error */, "Expression_expected_1109", "Expression expected."),
    Type_expected: diag(1110, 1 /* Error */, "Type_expected_1110", "Type expected."),
    Private_field_0_must_be_declared_in_an_enclosing_class: diag(1111, 1 /* Error */, "Private_field_0_must_be_declared_in_an_enclosing_class_1111", "Private field '{0}' must be declared in an enclosing class."),
    A_default_clause_cannot_appear_more_than_once_in_a_switch_statement: diag(1113, 1 /* Error */, "A_default_clause_cannot_appear_more_than_once_in_a_switch_statement_1113", "A 'default' clause cannot appear more than once in a 'switch' statement."),
    Duplicate_label_0: diag(1114, 1 /* Error */, "Duplicate_label_0_1114", "Duplicate label '{0}'."),
    A_continue_statement_can_only_jump_to_a_label_of_an_enclosing_iteration_statement: diag(1115, 1 /* Error */, "A_continue_statement_can_only_jump_to_a_label_of_an_enclosing_iteration_statement_1115", "A 'continue' statement can only jump to a label of an enclosing iteration statement."),
    A_break_statement_can_only_jump_to_a_label_of_an_enclosing_statement: diag(1116, 1 /* Error */, "A_break_statement_can_only_jump_to_a_label_of_an_enclosing_statement_1116", "A 'break' statement can only jump to a label of an enclosing statement."),
    An_object_literal_cannot_have_multiple_properties_with_the_same_name: diag(1117, 1 /* Error */, "An_object_literal_cannot_have_multiple_properties_with_the_same_name_1117", "An object literal cannot have multiple properties with the same name."),
    An_object_literal_cannot_have_multiple_get_Slashset_accessors_with_the_same_name: diag(1118, 1 /* Error */, "An_object_literal_cannot_have_multiple_get_Slashset_accessors_with_the_same_name_1118", "An object literal cannot have multiple get/set accessors with the same name."),
    An_object_literal_cannot_have_property_and_accessor_with_the_same_name: diag(1119, 1 /* Error */, "An_object_literal_cannot_have_property_and_accessor_with_the_same_name_1119", "An object literal cannot have property and accessor with the same name."),
    An_export_assignment_cannot_have_modifiers: diag(1120, 1 /* Error */, "An_export_assignment_cannot_have_modifiers_1120", "An export assignment cannot have modifiers."),
    Octal_literals_are_not_allowed_Use_the_syntax_0: diag(1121, 1 /* Error */, "Octal_literals_are_not_allowed_Use_the_syntax_0_1121", "Octal literals are not allowed. Use the syntax '{0}'."),
    Variable_declaration_list_cannot_be_empty: diag(1123, 1 /* Error */, "Variable_declaration_list_cannot_be_empty_1123", "Variable declaration list cannot be empty."),
    Digit_expected: diag(1124, 1 /* Error */, "Digit_expected_1124", "Digit expected."),
    Hexadecimal_digit_expected: diag(1125, 1 /* Error */, "Hexadecimal_digit_expected_1125", "Hexadecimal digit expected."),
    Unexpected_end_of_text: diag(1126, 1 /* Error */, "Unexpected_end_of_text_1126", "Unexpected end of text."),
    Invalid_character: diag(1127, 1 /* Error */, "Invalid_character_1127", "Invalid character."),
    Declaration_or_statement_expected: diag(1128, 1 /* Error */, "Declaration_or_statement_expected_1128", "Declaration or statement expected."),
    Statement_expected: diag(1129, 1 /* Error */, "Statement_expected_1129", "Statement expected."),
    case_or_default_expected: diag(1130, 1 /* Error */, "case_or_default_expected_1130", "'case' or 'default' expected."),
    Property_or_signature_expected: diag(1131, 1 /* Error */, "Property_or_signature_expected_1131", "Property or signature expected."),
    Enum_member_expected: diag(1132, 1 /* Error */, "Enum_member_expected_1132", "Enum member expected."),
    Variable_declaration_expected: diag(1134, 1 /* Error */, "Variable_declaration_expected_1134", "Variable declaration expected."),
    Argument_expression_expected: diag(1135, 1 /* Error */, "Argument_expression_expected_1135", "Argument expression expected."),
    Property_assignment_expected: diag(1136, 1 /* Error */, "Property_assignment_expected_1136", "Property assignment expected."),
    Expression_or_comma_expected: diag(1137, 1 /* Error */, "Expression_or_comma_expected_1137", "Expression or comma expected."),
    Parameter_declaration_expected: diag(1138, 1 /* Error */, "Parameter_declaration_expected_1138", "Parameter declaration expected."),
    Type_parameter_declaration_expected: diag(1139, 1 /* Error */, "Type_parameter_declaration_expected_1139", "Type parameter declaration expected."),
    Type_argument_expected: diag(1140, 1 /* Error */, "Type_argument_expected_1140", "Type argument expected."),
    String_literal_expected: diag(1141, 1 /* Error */, "String_literal_expected_1141", "String literal expected."),
    Line_break_not_permitted_here: diag(1142, 1 /* Error */, "Line_break_not_permitted_here_1142", "Line break not permitted here."),
    or_expected: diag(1144, 1 /* Error */, "or_expected_1144", "'{' or ';' expected."),
    or_JSX_element_expected: diag(1145, 1 /* Error */, "or_JSX_element_expected_1145", "'{' or JSX element expected."),
    Declaration_expected: diag(1146, 1 /* Error */, "Declaration_expected_1146", "Declaration expected."),
    Import_declarations_in_a_namespace_cannot_reference_a_module: diag(1147, 1 /* Error */, "Import_declarations_in_a_namespace_cannot_reference_a_module_1147", "Import declarations in a namespace cannot reference a module."),
    Cannot_use_imports_exports_or_module_augmentations_when_module_is_none: diag(1148, 1 /* Error */, "Cannot_use_imports_exports_or_module_augmentations_when_module_is_none_1148", "Cannot use imports, exports, or module augmentations when '--module' is 'none'."),
    File_name_0_differs_from_already_included_file_name_1_only_in_casing: diag(1149, 1 /* Error */, "File_name_0_differs_from_already_included_file_name_1_only_in_casing_1149", "File name '{0}' differs from already included file name '{1}' only in casing."),
    _0_declarations_must_be_initialized: diag(1155, 1 /* Error */, "_0_declarations_must_be_initialized_1155", "'{0}' declarations must be initialized."),
    _0_declarations_can_only_be_declared_inside_a_block: diag(1156, 1 /* Error */, "_0_declarations_can_only_be_declared_inside_a_block_1156", "'{0}' declarations can only be declared inside a block."),
    Unterminated_template_literal: diag(1160, 1 /* Error */, "Unterminated_template_literal_1160", "Unterminated template literal."),
    Unterminated_regular_expression_literal: diag(1161, 1 /* Error */, "Unterminated_regular_expression_literal_1161", "Unterminated regular expression literal."),
    An_object_member_cannot_be_declared_optional: diag(1162, 1 /* Error */, "An_object_member_cannot_be_declared_optional_1162", "An object member cannot be declared optional."),
    A_yield_expression_is_only_allowed_in_a_generator_body: diag(1163, 1 /* Error */, "A_yield_expression_is_only_allowed_in_a_generator_body_1163", "A 'yield' expression is only allowed in a generator body."),
    Computed_property_names_are_not_allowed_in_enums: diag(1164, 1 /* Error */, "Computed_property_names_are_not_allowed_in_enums_1164", "Computed property names are not allowed in enums."),
    A_computed_property_name_in_an_ambient_context_must_refer_to_an_expression_whose_type_is_a_literal_type_or_a_unique_symbol_type: diag(1165, 1 /* Error */, "A_computed_property_name_in_an_ambient_context_must_refer_to_an_expression_whose_type_is_a_literal_t_1165", "A computed property name in an ambient context must refer to an expression whose type is a literal type or a 'unique symbol' type."),
    A_computed_property_name_in_a_class_property_declaration_must_have_a_simple_literal_type_or_a_unique_symbol_type: diag(1166, 1 /* Error */, "A_computed_property_name_in_a_class_property_declaration_must_have_a_simple_literal_type_or_a_unique_1166", "A computed property name in a class property declaration must have a simple literal type or a 'unique symbol' type."),
    A_computed_property_name_in_a_method_overload_must_refer_to_an_expression_whose_type_is_a_literal_type_or_a_unique_symbol_type: diag(1168, 1 /* Error */, "A_computed_property_name_in_a_method_overload_must_refer_to_an_expression_whose_type_is_a_literal_ty_1168", "A computed property name in a method overload must refer to an expression whose type is a literal type or a 'unique symbol' type."),
    A_computed_property_name_in_an_interface_must_refer_to_an_expression_whose_type_is_a_literal_type_or_a_unique_symbol_type: diag(1169, 1 /* Error */, "A_computed_property_name_in_an_interface_must_refer_to_an_expression_whose_type_is_a_literal_type_or_1169", "A computed property name in an interface must refer to an expression whose type is a literal type or a 'unique symbol' type."),
    A_computed_property_name_in_a_type_literal_must_refer_to_an_expression_whose_type_is_a_literal_type_or_a_unique_symbol_type: diag(1170, 1 /* Error */, "A_computed_property_name_in_a_type_literal_must_refer_to_an_expression_whose_type_is_a_literal_type__1170", "A computed property name in a type literal must refer to an expression whose type is a literal type or a 'unique symbol' type."),
    A_comma_expression_is_not_allowed_in_a_computed_property_name: diag(1171, 1 /* Error */, "A_comma_expression_is_not_allowed_in_a_computed_property_name_1171", "A comma expression is not allowed in a computed property name."),
    extends_clause_already_seen: diag(1172, 1 /* Error */, "extends_clause_already_seen_1172", "'extends' clause already seen."),
    extends_clause_must_precede_implements_clause: diag(1173, 1 /* Error */, "extends_clause_must_precede_implements_clause_1173", "'extends' clause must precede 'implements' clause."),
    Classes_can_only_extend_a_single_class: diag(1174, 1 /* Error */, "Classes_can_only_extend_a_single_class_1174", "Classes can only extend a single class."),
    implements_clause_already_seen: diag(1175, 1 /* Error */, "implements_clause_already_seen_1175", "'implements' clause already seen."),
    Interface_declaration_cannot_have_implements_clause: diag(1176, 1 /* Error */, "Interface_declaration_cannot_have_implements_clause_1176", "Interface declaration cannot have 'implements' clause."),
    Binary_digit_expected: diag(1177, 1 /* Error */, "Binary_digit_expected_1177", "Binary digit expected."),
    Octal_digit_expected: diag(1178, 1 /* Error */, "Octal_digit_expected_1178", "Octal digit expected."),
    Unexpected_token_expected: diag(1179, 1 /* Error */, "Unexpected_token_expected_1179", "Unexpected token. '{' expected."),
    Property_destructuring_pattern_expected: diag(1180, 1 /* Error */, "Property_destructuring_pattern_expected_1180", "Property destructuring pattern expected."),
    Array_element_destructuring_pattern_expected: diag(1181, 1 /* Error */, "Array_element_destructuring_pattern_expected_1181", "Array element destructuring pattern expected."),
    A_destructuring_declaration_must_have_an_initializer: diag(1182, 1 /* Error */, "A_destructuring_declaration_must_have_an_initializer_1182", "A destructuring declaration must have an initializer."),
    An_implementation_cannot_be_declared_in_ambient_contexts: diag(1183, 1 /* Error */, "An_implementation_cannot_be_declared_in_ambient_contexts_1183", "An implementation cannot be declared in ambient contexts."),
    Modifiers_cannot_appear_here: diag(1184, 1 /* Error */, "Modifiers_cannot_appear_here_1184", "Modifiers cannot appear here."),
    Merge_conflict_marker_encountered: diag(1185, 1 /* Error */, "Merge_conflict_marker_encountered_1185", "Merge conflict marker encountered."),
    A_rest_element_cannot_have_an_initializer: diag(1186, 1 /* Error */, "A_rest_element_cannot_have_an_initializer_1186", "A rest element cannot have an initializer."),
    A_parameter_property_may_not_be_declared_using_a_binding_pattern: diag(1187, 1 /* Error */, "A_parameter_property_may_not_be_declared_using_a_binding_pattern_1187", "A parameter property may not be declared using a binding pattern."),
    Only_a_single_variable_declaration_is_allowed_in_a_for_of_statement: diag(1188, 1 /* Error */, "Only_a_single_variable_declaration_is_allowed_in_a_for_of_statement_1188", "Only a single variable declaration is allowed in a 'for...of' statement."),
    The_variable_declaration_of_a_for_in_statement_cannot_have_an_initializer: diag(1189, 1 /* Error */, "The_variable_declaration_of_a_for_in_statement_cannot_have_an_initializer_1189", "The variable declaration of a 'for...in' statement cannot have an initializer."),
    The_variable_declaration_of_a_for_of_statement_cannot_have_an_initializer: diag(1190, 1 /* Error */, "The_variable_declaration_of_a_for_of_statement_cannot_have_an_initializer_1190", "The variable declaration of a 'for...of' statement cannot have an initializer."),
    An_import_declaration_cannot_have_modifiers: diag(1191, 1 /* Error */, "An_import_declaration_cannot_have_modifiers_1191", "An import declaration cannot have modifiers."),
    Module_0_has_no_default_export: diag(1192, 1 /* Error */, "Module_0_has_no_default_export_1192", "Module '{0}' has no default export."),
    An_export_declaration_cannot_have_modifiers: diag(1193, 1 /* Error */, "An_export_declaration_cannot_have_modifiers_1193", "An export declaration cannot have modifiers."),
    Export_declarations_are_not_permitted_in_a_namespace: diag(1194, 1 /* Error */, "Export_declarations_are_not_permitted_in_a_namespace_1194", "Export declarations are not permitted in a namespace."),
    export_Asterisk_does_not_re_export_a_default: diag(1195, 1 /* Error */, "export_Asterisk_does_not_re_export_a_default_1195", "'export *' does not re-export a default."),
    Catch_clause_variable_type_annotation_must_be_any_or_unknown_if_specified: diag(1196, 1 /* Error */, "Catch_clause_variable_type_annotation_must_be_any_or_unknown_if_specified_1196", "Catch clause variable type annotation must be 'any' or 'unknown' if specified."),
    Catch_clause_variable_cannot_have_an_initializer: diag(1197, 1 /* Error */, "Catch_clause_variable_cannot_have_an_initializer_1197", "Catch clause variable cannot have an initializer."),
    An_extended_Unicode_escape_value_must_be_between_0x0_and_0x10FFFF_inclusive: diag(1198, 1 /* Error */, "An_extended_Unicode_escape_value_must_be_between_0x0_and_0x10FFFF_inclusive_1198", "An extended Unicode escape value must be between 0x0 and 0x10FFFF inclusive."),
    Unterminated_Unicode_escape_sequence: diag(1199, 1 /* Error */, "Unterminated_Unicode_escape_sequence_1199", "Unterminated Unicode escape sequence."),
    Line_terminator_not_permitted_before_arrow: diag(1200, 1 /* Error */, "Line_terminator_not_permitted_before_arrow_1200", "Line terminator not permitted before arrow."),
    Import_assignment_cannot_be_used_when_targeting_ECMAScript_modules_Consider_using_import_Asterisk_as_ns_from_mod_import_a_from_mod_import_d_from_mod_or_another_module_format_instead: diag(1202, 1 /* Error */, "Import_assignment_cannot_be_used_when_targeting_ECMAScript_modules_Consider_using_import_Asterisk_as_1202", `Import assignment cannot be used when targeting ECMAScript modules. Consider using 'import * as ns from "mod"', 'import {a} from "mod"', 'import d from "mod"', or another module format instead.`),
    Export_assignment_cannot_be_used_when_targeting_ECMAScript_modules_Consider_using_export_default_or_another_module_format_instead: diag(1203, 1 /* Error */, "Export_assignment_cannot_be_used_when_targeting_ECMAScript_modules_Consider_using_export_default_or__1203", "Export assignment cannot be used when targeting ECMAScript modules. Consider using 'export default' or another module format instead."),
    Re_exporting_a_type_when_0_is_enabled_requires_using_export_type: diag(1205, 1 /* Error */, "Re_exporting_a_type_when_0_is_enabled_requires_using_export_type_1205", "Re-exporting a type when '{0}' is enabled requires using 'export type'."),
    Decorators_are_not_valid_here: diag(1206, 1 /* Error */, "Decorators_are_not_valid_here_1206", "Decorators are not valid here."),
    Decorators_cannot_be_applied_to_multiple_get_Slashset_accessors_of_the_same_name: diag(1207, 1 /* Error */, "Decorators_cannot_be_applied_to_multiple_get_Slashset_accessors_of_the_same_name_1207", "Decorators cannot be applied to multiple get/set accessors of the same name."),
    Invalid_optional_chain_from_new_expression_Did_you_mean_to_call_0: diag(1209, 1 /* Error */, "Invalid_optional_chain_from_new_expression_Did_you_mean_to_call_0_1209", "Invalid optional chain from new expression. Did you mean to call '{0}()'?"),
    Code_contained_in_a_class_is_evaluated_in_JavaScript_s_strict_mode_which_does_not_allow_this_use_of_0_For_more_information_see_https_Colon_Slash_Slashdeveloper_mozilla_org_Slashen_US_Slashdocs_SlashWeb_SlashJavaScript_SlashReference_SlashStrict_mode: diag(1210, 1 /* Error */, "Code_contained_in_a_class_is_evaluated_in_JavaScript_s_strict_mode_which_does_not_allow_this_use_of__1210", "Code contained in a class is evaluated in JavaScript's strict mode which does not allow this use of '{0}'. For more information, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode."),
    A_class_declaration_without_the_default_modifier_must_have_a_name: diag(1211, 1 /* Error */, "A_class_declaration_without_the_default_modifier_must_have_a_name_1211", "A class declaration without the 'default' modifier must have a name."),
    Identifier_expected_0_is_a_reserved_word_in_strict_mode: diag(1212, 1 /* Error */, "Identifier_expected_0_is_a_reserved_word_in_strict_mode_1212", "Identifier expected. '{0}' is a reserved word in strict mode."),
    Identifier_expected_0_is_a_reserved_word_in_strict_mode_Class_definitions_are_automatically_in_strict_mode: diag(1213, 1 /* Error */, "Identifier_expected_0_is_a_reserved_word_in_strict_mode_Class_definitions_are_automatically_in_stric_1213", "Identifier expected. '{0}' is a reserved word in strict mode. Class definitions are automatically in strict mode."),
    Identifier_expected_0_is_a_reserved_word_in_strict_mode_Modules_are_automatically_in_strict_mode: diag(1214, 1 /* Error */, "Identifier_expected_0_is_a_reserved_word_in_strict_mode_Modules_are_automatically_in_strict_mode_1214", "Identifier expected. '{0}' is a reserved word in strict mode. Modules are automatically in strict mode."),
    Invalid_use_of_0_Modules_are_automatically_in_strict_mode: diag(1215, 1 /* Error */, "Invalid_use_of_0_Modules_are_automatically_in_strict_mode_1215", "Invalid use of '{0}'. Modules are automatically in strict mode."),
    Identifier_expected_esModule_is_reserved_as_an_exported_marker_when_transforming_ECMAScript_modules: diag(1216, 1 /* Error */, "Identifier_expected_esModule_is_reserved_as_an_exported_marker_when_transforming_ECMAScript_modules_1216", "Identifier expected. '__esModule' is reserved as an exported marker when transforming ECMAScript modules."),
    Export_assignment_is_not_supported_when_module_flag_is_system: diag(1218, 1 /* Error */, "Export_assignment_is_not_supported_when_module_flag_is_system_1218", "Export assignment is not supported when '--module' flag is 'system'."),
    Generators_are_not_allowed_in_an_ambient_context: diag(1221, 1 /* Error */, "Generators_are_not_allowed_in_an_ambient_context_1221", "Generators are not allowed in an ambient context."),
    An_overload_signature_cannot_be_declared_as_a_generator: diag(1222, 1 /* Error */, "An_overload_signature_cannot_be_declared_as_a_generator_1222", "An overload signature cannot be declared as a generator."),
    _0_tag_already_specified: diag(1223, 1 /* Error */, "_0_tag_already_specified_1223", "'{0}' tag already specified."),
    Signature_0_must_be_a_type_predicate: diag(1224, 1 /* Error */, "Signature_0_must_be_a_type_predicate_1224", "Signature '{0}' must be a type predicate."),
    Cannot_find_parameter_0: diag(1225, 1 /* Error */, "Cannot_find_parameter_0_1225", "Cannot find parameter '{0}'."),
    Type_predicate_0_is_not_assignable_to_1: diag(1226, 1 /* Error */, "Type_predicate_0_is_not_assignable_to_1_1226", "Type predicate '{0}' is not assignable to '{1}'."),
    Parameter_0_is_not_in_the_same_position_as_parameter_1: diag(1227, 1 /* Error */, "Parameter_0_is_not_in_the_same_position_as_parameter_1_1227", "Parameter '{0}' is not in the same position as parameter '{1}'."),
    A_type_predicate_is_only_allowed_in_return_type_position_for_functions_and_methods: diag(1228, 1 /* Error */, "A_type_predicate_is_only_allowed_in_return_type_position_for_functions_and_methods_1228", "A type predicate is only allowed in return type position for functions and methods."),
    A_type_predicate_cannot_reference_a_rest_parameter: diag(1229, 1 /* Error */, "A_type_predicate_cannot_reference_a_rest_parameter_1229", "A type predicate cannot reference a rest parameter."),
    A_type_predicate_cannot_reference_element_0_in_a_binding_pattern: diag(1230, 1 /* Error */, "A_type_predicate_cannot_reference_element_0_in_a_binding_pattern_1230", "A type predicate cannot reference element '{0}' in a binding pattern."),
    An_export_assignment_must_be_at_the_top_level_of_a_file_or_module_declaration: diag(1231, 1 /* Error */, "An_export_assignment_must_be_at_the_top_level_of_a_file_or_module_declaration_1231", "An export assignment must be at the top level of a file or module declaration."),
    An_import_declaration_can_only_be_used_at_the_top_level_of_a_namespace_or_module: diag(1232, 1 /* Error */, "An_import_declaration_can_only_be_used_at_the_top_level_of_a_namespace_or_module_1232", "An import declaration can only be used at the top level of a namespace or module."),
    An_export_declaration_can_only_be_used_at_the_top_level_of_a_namespace_or_module: diag(1233, 1 /* Error */, "An_export_declaration_can_only_be_used_at_the_top_level_of_a_namespace_or_module_1233", "An export declaration can only be used at the top level of a namespace or module."),
    An_ambient_module_declaration_is_only_allowed_at_the_top_level_in_a_file: diag(1234, 1 /* Error */, "An_ambient_module_declaration_is_only_allowed_at_the_top_level_in_a_file_1234", "An ambient module declaration is only allowed at the top level in a file."),
    A_namespace_declaration_is_only_allowed_at_the_top_level_of_a_namespace_or_module: diag(1235, 1 /* Error */, "A_namespace_declaration_is_only_allowed_at_the_top_level_of_a_namespace_or_module_1235", "A namespace declaration is only allowed at the top level of a namespace or module."),
    The_return_type_of_a_property_decorator_function_must_be_either_void_or_any: diag(1236, 1 /* Error */, "The_return_type_of_a_property_decorator_function_must_be_either_void_or_any_1236", "The return type of a property decorator function must be either 'void' or 'any'."),
    The_return_type_of_a_parameter_decorator_function_must_be_either_void_or_any: diag(1237, 1 /* Error */, "The_return_type_of_a_parameter_decorator_function_must_be_either_void_or_any_1237", "The return type of a parameter decorator function must be either 'void' or 'any'."),
    Unable_to_resolve_signature_of_class_decorator_when_called_as_an_expression: diag(1238, 1 /* Error */, "Unable_to_resolve_signature_of_class_decorator_when_called_as_an_expression_1238", "Unable to resolve signature of class decorator when called as an expression."),
    Unable_to_resolve_signature_of_parameter_decorator_when_called_as_an_expression: diag(1239, 1 /* Error */, "Unable_to_resolve_signature_of_parameter_decorator_when_called_as_an_expression_1239", "Unable to resolve signature of parameter decorator when called as an expression."),
    Unable_to_resolve_signature_of_property_decorator_when_called_as_an_expression: diag(1240, 1 /* Error */, "Unable_to_resolve_signature_of_property_decorator_when_called_as_an_expression_1240", "Unable to resolve signature of property decorator when called as an expression."),
    Unable_to_resolve_signature_of_method_decorator_when_called_as_an_expression: diag(1241, 1 /* Error */, "Unable_to_resolve_signature_of_method_decorator_when_called_as_an_expression_1241", "Unable to resolve signature of method decorator when called as an expression."),
    abstract_modifier_can_only_appear_on_a_class_method_or_property_declaration: diag(1242, 1 /* Error */, "abstract_modifier_can_only_appear_on_a_class_method_or_property_declaration_1242", "'abstract' modifier can only appear on a class, method, or property declaration."),
    _0_modifier_cannot_be_used_with_1_modifier: diag(1243, 1 /* Error */, "_0_modifier_cannot_be_used_with_1_modifier_1243", "'{0}' modifier cannot be used with '{1}' modifier."),
    Abstract_methods_can_only_appear_within_an_abstract_class: diag(1244, 1 /* Error */, "Abstract_methods_can_only_appear_within_an_abstract_class_1244", "Abstract methods can only appear within an abstract class."),
    Method_0_cannot_have_an_implementation_because_it_is_marked_abstract: diag(1245, 1 /* Error */, "Method_0_cannot_have_an_implementation_because_it_is_marked_abstract_1245", "Method '{0}' cannot have an implementation because it is marked abstract."),
    An_interface_property_cannot_have_an_initializer: diag(1246, 1 /* Error */, "An_interface_property_cannot_have_an_initializer_1246", "An interface property cannot have an initializer."),
    A_type_literal_property_cannot_have_an_initializer: diag(1247, 1 /* Error */, "A_type_literal_property_cannot_have_an_initializer_1247", "A type literal property cannot have an initializer."),
    A_class_member_cannot_have_the_0_keyword: diag(1248, 1 /* Error */, "A_class_member_cannot_have_the_0_keyword_1248", "A class member cannot have the '{0}' keyword."),
    A_decorator_can_only_decorate_a_method_implementation_not_an_overload: diag(1249, 1 /* Error */, "A_decorator_can_only_decorate_a_method_implementation_not_an_overload_1249", "A decorator can only decorate a method implementation, not an overload."),
    Function_declarations_are_not_allowed_inside_blocks_in_strict_mode_when_targeting_ES3_or_ES5: diag(1250, 1 /* Error */, "Function_declarations_are_not_allowed_inside_blocks_in_strict_mode_when_targeting_ES3_or_ES5_1250", "Function declarations are not allowed inside blocks in strict mode when targeting 'ES3' or 'ES5'."),
    Function_declarations_are_not_allowed_inside_blocks_in_strict_mode_when_targeting_ES3_or_ES5_Class_definitions_are_automatically_in_strict_mode: diag(1251, 1 /* Error */, "Function_declarations_are_not_allowed_inside_blocks_in_strict_mode_when_targeting_ES3_or_ES5_Class_d_1251", "Function declarations are not allowed inside blocks in strict mode when targeting 'ES3' or 'ES5'. Class definitions are automatically in strict mode."),
    Function_declarations_are_not_allowed_inside_blocks_in_strict_mode_when_targeting_ES3_or_ES5_Modules_are_automatically_in_strict_mode: diag(1252, 1 /* Error */, "Function_declarations_are_not_allowed_inside_blocks_in_strict_mode_when_targeting_ES3_or_ES5_Modules_1252", "Function declarations are not allowed inside blocks in strict mode when targeting 'ES3' or 'ES5'. Modules are automatically in strict mode."),
    Abstract_properties_can_only_appear_within_an_abstract_class: diag(1253, 1 /* Error */, "Abstract_properties_can_only_appear_within_an_abstract_class_1253", "Abstract properties can only appear within an abstract class."),
    A_const_initializer_in_an_ambient_context_must_be_a_string_or_numeric_literal_or_literal_enum_reference: diag(1254, 1 /* Error */, "A_const_initializer_in_an_ambient_context_must_be_a_string_or_numeric_literal_or_literal_enum_refere_1254", "A 'const' initializer in an ambient context must be a string or numeric literal or literal enum reference."),
    A_definite_assignment_assertion_is_not_permitted_in_this_context: diag(1255, 1 /* Error */, "A_definite_assignment_assertion_is_not_permitted_in_this_context_1255", "A definite assignment assertion '!' is not permitted in this context."),
    A_required_element_cannot_follow_an_optional_element: diag(1257, 1 /* Error */, "A_required_element_cannot_follow_an_optional_element_1257", "A required element cannot follow an optional element."),
    A_default_export_must_be_at_the_top_level_of_a_file_or_module_declaration: diag(1258, 1 /* Error */, "A_default_export_must_be_at_the_top_level_of_a_file_or_module_declaration_1258", "A default export must be at the top level of a file or module declaration."),
    Module_0_can_only_be_default_imported_using_the_1_flag: diag(1259, 1 /* Error */, "Module_0_can_only_be_default_imported_using_the_1_flag_1259", "Module '{0}' can only be default-imported using the '{1}' flag"),
    Keywords_cannot_contain_escape_characters: diag(1260, 1 /* Error */, "Keywords_cannot_contain_escape_characters_1260", "Keywords cannot contain escape characters."),
    Already_included_file_name_0_differs_from_file_name_1_only_in_casing: diag(1261, 1 /* Error */, "Already_included_file_name_0_differs_from_file_name_1_only_in_casing_1261", "Already included file name '{0}' differs from file name '{1}' only in casing."),
    Identifier_expected_0_is_a_reserved_word_at_the_top_level_of_a_module: diag(1262, 1 /* Error */, "Identifier_expected_0_is_a_reserved_word_at_the_top_level_of_a_module_1262", "Identifier expected. '{0}' is a reserved word at the top-level of a module."),
    Declarations_with_initializers_cannot_also_have_definite_assignment_assertions: diag(1263, 1 /* Error */, "Declarations_with_initializers_cannot_also_have_definite_assignment_assertions_1263", "Declarations with initializers cannot also have definite assignment assertions."),
    Declarations_with_definite_assignment_assertions_must_also_have_type_annotations: diag(1264, 1 /* Error */, "Declarations_with_definite_assignment_assertions_must_also_have_type_annotations_1264", "Declarations with definite assignment assertions must also have type annotations."),
    A_rest_element_cannot_follow_another_rest_element: diag(1265, 1 /* Error */, "A_rest_element_cannot_follow_another_rest_element_1265", "A rest element cannot follow another rest element."),
    An_optional_element_cannot_follow_a_rest_element: diag(1266, 1 /* Error */, "An_optional_element_cannot_follow_a_rest_element_1266", "An optional element cannot follow a rest element."),
    Property_0_cannot_have_an_initializer_because_it_is_marked_abstract: diag(1267, 1 /* Error */, "Property_0_cannot_have_an_initializer_because_it_is_marked_abstract_1267", "Property '{0}' cannot have an initializer because it is marked abstract."),
    An_index_signature_parameter_type_must_be_string_number_symbol_or_a_template_literal_type: diag(1268, 1 /* Error */, "An_index_signature_parameter_type_must_be_string_number_symbol_or_a_template_literal_type_1268", "An index signature parameter type must be 'string', 'number', 'symbol', or a template literal type."),
    Cannot_use_export_import_on_a_type_or_type_only_namespace_when_0_is_enabled: diag(1269, 1 /* Error */, "Cannot_use_export_import_on_a_type_or_type_only_namespace_when_0_is_enabled_1269", "Cannot use 'export import' on a type or type-only namespace when '{0}' is enabled."),
    Decorator_function_return_type_0_is_not_assignable_to_type_1: diag(1270, 1 /* Error */, "Decorator_function_return_type_0_is_not_assignable_to_type_1_1270", "Decorator function return type '{0}' is not assignable to type '{1}'."),
    Decorator_function_return_type_is_0_but_is_expected_to_be_void_or_any: diag(1271, 1 /* Error */, "Decorator_function_return_type_is_0_but_is_expected_to_be_void_or_any_1271", "Decorator function return type is '{0}' but is expected to be 'void' or 'any'."),
    A_type_referenced_in_a_decorated_signature_must_be_imported_with_import_type_or_a_namespace_import_when_isolatedModules_and_emitDecoratorMetadata_are_enabled: diag(1272, 1 /* Error */, "A_type_referenced_in_a_decorated_signature_must_be_imported_with_import_type_or_a_namespace_import_w_1272", "A type referenced in a decorated signature must be imported with 'import type' or a namespace import when 'isolatedModules' and 'emitDecoratorMetadata' are enabled."),
    _0_modifier_cannot_appear_on_a_type_parameter: diag(1273, 1 /* Error */, "_0_modifier_cannot_appear_on_a_type_parameter_1273", "'{0}' modifier cannot appear on a type parameter"),
    _0_modifier_can_only_appear_on_a_type_parameter_of_a_class_interface_or_type_alias: diag(1274, 1 /* Error */, "_0_modifier_can_only_appear_on_a_type_parameter_of_a_class_interface_or_type_alias_1274", "'{0}' modifier can only appear on a type parameter of a class, interface or type alias"),
    accessor_modifier_can_only_appear_on_a_property_declaration: diag(1275, 1 /* Error */, "accessor_modifier_can_only_appear_on_a_property_declaration_1275", "'accessor' modifier can only appear on a property declaration."),
    An_accessor_property_cannot_be_declared_optional: diag(1276, 1 /* Error */, "An_accessor_property_cannot_be_declared_optional_1276", "An 'accessor' property cannot be declared optional."),
    _0_modifier_can_only_appear_on_a_type_parameter_of_a_function_method_or_class: diag(1277, 1 /* Error */, "_0_modifier_can_only_appear_on_a_type_parameter_of_a_function_method_or_class_1277", "'{0}' modifier can only appear on a type parameter of a function, method or class"),
    The_runtime_will_invoke_the_decorator_with_1_arguments_but_the_decorator_expects_0: diag(1278, 1 /* Error */, "The_runtime_will_invoke_the_decorator_with_1_arguments_but_the_decorator_expects_0_1278", "The runtime will invoke the decorator with {1} arguments, but the decorator expects {0}."),
    The_runtime_will_invoke_the_decorator_with_1_arguments_but_the_decorator_expects_at_least_0: diag(1279, 1 /* Error */, "The_runtime_will_invoke_the_decorator_with_1_arguments_but_the_decorator_expects_at_least_0_1279", "The runtime will invoke the decorator with {1} arguments, but the decorator expects at least {0}."),
    Namespaces_are_not_allowed_in_global_script_files_when_0_is_enabled_If_this_file_is_not_intended_to_be_a_global_script_set_moduleDetection_to_force_or_add_an_empty_export_statement: diag(1280, 1 /* Error */, "Namespaces_are_not_allowed_in_global_script_files_when_0_is_enabled_If_this_file_is_not_intended_to__1280", "Namespaces are not allowed in global script files when '{0}' is enabled. If this file is not intended to be a global script, set 'moduleDetection' to 'force' or add an empty 'export {}' statement."),
    Cannot_access_0_from_another_file_without_qualification_when_1_is_enabled_Use_2_instead: diag(1281, 1 /* Error */, "Cannot_access_0_from_another_file_without_qualification_when_1_is_enabled_Use_2_instead_1281", "Cannot access '{0}' from another file without qualification when '{1}' is enabled. Use '{2}' instead."),
    An_export_declaration_must_reference_a_value_when_verbatimModuleSyntax_is_enabled_but_0_only_refers_to_a_type: diag(1282, 1 /* Error */, "An_export_declaration_must_reference_a_value_when_verbatimModuleSyntax_is_enabled_but_0_only_refers__1282", "An 'export =' declaration must reference a value when 'verbatimModuleSyntax' is enabled, but '{0}' only refers to a type."),
    An_export_declaration_must_reference_a_real_value_when_verbatimModuleSyntax_is_enabled_but_0_resolves_to_a_type_only_declaration: diag(1283, 1 /* Error */, "An_export_declaration_must_reference_a_real_value_when_verbatimModuleSyntax_is_enabled_but_0_resolve_1283", "An 'export =' declaration must reference a real value when 'verbatimModuleSyntax' is enabled, but '{0}' resolves to a type-only declaration."),
    An_export_default_must_reference_a_value_when_verbatimModuleSyntax_is_enabled_but_0_only_refers_to_a_type: diag(1284, 1 /* Error */, "An_export_default_must_reference_a_value_when_verbatimModuleSyntax_is_enabled_but_0_only_refers_to_a_1284", "An 'export default' must reference a value when 'verbatimModuleSyntax' is enabled, but '{0}' only refers to a type."),
    An_export_default_must_reference_a_real_value_when_verbatimModuleSyntax_is_enabled_but_0_resolves_to_a_type_only_declaration: diag(1285, 1 /* Error */, "An_export_default_must_reference_a_real_value_when_verbatimModuleSyntax_is_enabled_but_0_resolves_to_1285", "An 'export default' must reference a real value when 'verbatimModuleSyntax' is enabled, but '{0}' resolves to a type-only declaration."),
    ESM_syntax_is_not_allowed_in_a_CommonJS_module_when_verbatimModuleSyntax_is_enabled: diag(1286, 1 /* Error */, "ESM_syntax_is_not_allowed_in_a_CommonJS_module_when_verbatimModuleSyntax_is_enabled_1286", "ESM syntax is not allowed in a CommonJS module when 'verbatimModuleSyntax' is enabled."),
    A_top_level_export_modifier_cannot_be_used_on_value_declarations_in_a_CommonJS_module_when_verbatimModuleSyntax_is_enabled: diag(1287, 1 /* Error */, "A_top_level_export_modifier_cannot_be_used_on_value_declarations_in_a_CommonJS_module_when_verbatimM_1287", "A top-level 'export' modifier cannot be used on value declarations in a CommonJS module when 'verbatimModuleSyntax' is enabled."),
    An_import_alias_cannot_resolve_to_a_type_or_type_only_declaration_when_verbatimModuleSyntax_is_enabled: diag(1288, 1 /* Error */, "An_import_alias_cannot_resolve_to_a_type_or_type_only_declaration_when_verbatimModuleSyntax_is_enabl_1288", "An import alias cannot resolve to a type or type-only declaration when 'verbatimModuleSyntax' is enabled."),
    _0_resolves_to_a_type_only_declaration_and_must_be_marked_type_only_in_this_file_before_re_exporting_when_1_is_enabled_Consider_using_import_type_where_0_is_imported: diag(1289, 1 /* Error */, "_0_resolves_to_a_type_only_declaration_and_must_be_marked_type_only_in_this_file_before_re_exporting_1289", "'{0}' resolves to a type-only declaration and must be marked type-only in this file before re-exporting when '{1}' is enabled. Consider using 'import type' where '{0}' is imported."),
    _0_resolves_to_a_type_only_declaration_and_must_be_marked_type_only_in_this_file_before_re_exporting_when_1_is_enabled_Consider_using_export_type_0_as_default: diag(1290, 1 /* Error */, "_0_resolves_to_a_type_only_declaration_and_must_be_marked_type_only_in_this_file_before_re_exporting_1290", "'{0}' resolves to a type-only declaration and must be marked type-only in this file before re-exporting when '{1}' is enabled. Consider using 'export type { {0} as default }'."),
    _0_resolves_to_a_type_and_must_be_marked_type_only_in_this_file_before_re_exporting_when_1_is_enabled_Consider_using_import_type_where_0_is_imported: diag(1291, 1 /* Error */, "_0_resolves_to_a_type_and_must_be_marked_type_only_in_this_file_before_re_exporting_when_1_is_enable_1291", "'{0}' resolves to a type and must be marked type-only in this file before re-exporting when '{1}' is enabled. Consider using 'import type' where '{0}' is imported."),
    _0_resolves_to_a_type_and_must_be_marked_type_only_in_this_file_before_re_exporting_when_1_is_enabled_Consider_using_export_type_0_as_default: diag(1292, 1 /* Error */, "_0_resolves_to_a_type_and_must_be_marked_type_only_in_this_file_before_re_exporting_when_1_is_enable_1292", "'{0}' resolves to a type and must be marked type-only in this file before re-exporting when '{1}' is enabled. Consider using 'export type { {0} as default }'."),
    with_statements_are_not_allowed_in_an_async_function_block: diag(1300, 1 /* Error */, "with_statements_are_not_allowed_in_an_async_function_block_1300", "'with' statements are not allowed in an async function block."),
    await_expressions_are_only_allowed_within_async_functions_and_at_the_top_levels_of_modules: diag(1308, 1 /* Error */, "await_expressions_are_only_allowed_within_async_functions_and_at_the_top_levels_of_modules_1308", "'await' expressions are only allowed within async functions and at the top levels of modules."),
    The_current_file_is_a_CommonJS_module_and_cannot_use_await_at_the_top_level: diag(1309, 1 /* Error */, "The_current_file_is_a_CommonJS_module_and_cannot_use_await_at_the_top_level_1309", "The current file is a CommonJS module and cannot use 'await' at the top level."),
    Did_you_mean_to_use_a_Colon_An_can_only_follow_a_property_name_when_the_containing_object_literal_is_part_of_a_destructuring_pattern: diag(1312, 1 /* Error */, "Did_you_mean_to_use_a_Colon_An_can_only_follow_a_property_name_when_the_containing_object_literal_is_1312", "Did you mean to use a ':'? An '=' can only follow a property name when the containing object literal is part of a destructuring pattern."),
    The_body_of_an_if_statement_cannot_be_the_empty_statement: diag(1313, 1 /* Error */, "The_body_of_an_if_statement_cannot_be_the_empty_statement_1313", "The body of an 'if' statement cannot be the empty statement."),
    Global_module_exports_may_only_appear_in_module_files: diag(1314, 1 /* Error */, "Global_module_exports_may_only_appear_in_module_files_1314", "Global module exports may only appear in module files."),
    Global_module_exports_may_only_appear_in_declaration_files: diag(1315, 1 /* Error */, "Global_module_exports_may_only_appear_in_declaration_files_1315", "Global module exports may only appear in declaration files."),
    Global_module_exports_may_only_appear_at_top_level: diag(1316, 1 /* Error */, "Global_module_exports_may_only_appear_at_top_level_1316", "Global module exports may only appear at top level."),
    A_parameter_property_cannot_be_declared_using_a_rest_parameter: diag(1317, 1 /* Error */, "A_parameter_property_cannot_be_declared_using_a_rest_parameter_1317", "A parameter property cannot be declared using a rest parameter."),
    An_abstract_accessor_cannot_have_an_implementation: diag(1318, 1 /* Error */, "An_abstract_accessor_cannot_have_an_implementation_1318", "An abstract accessor cannot have an implementation."),
    A_default_export_can_only_be_used_in_an_ECMAScript_style_module: diag(1319, 1 /* Error */, "A_default_export_can_only_be_used_in_an_ECMAScript_style_module_1319", "A default export can only be used in an ECMAScript-style module."),
    Type_of_await_operand_must_either_be_a_valid_promise_or_must_not_contain_a_callable_then_member: diag(1320, 1 /* Error */, "Type_of_await_operand_must_either_be_a_valid_promise_or_must_not_contain_a_callable_then_member_1320", "Type of 'await' operand must either be a valid promise or must not contain a callable 'then' member."),
    Type_of_yield_operand_in_an_async_generator_must_either_be_a_valid_promise_or_must_not_contain_a_callable_then_member: diag(1321, 1 /* Error */, "Type_of_yield_operand_in_an_async_generator_must_either_be_a_valid_promise_or_must_not_contain_a_cal_1321", "Type of 'yield' operand in an async generator must either be a valid promise or must not contain a callable 'then' member."),
    Type_of_iterated_elements_of_a_yield_Asterisk_operand_must_either_be_a_valid_promise_or_must_not_contain_a_callable_then_member: diag(1322, 1 /* Error */, "Type_of_iterated_elements_of_a_yield_Asterisk_operand_must_either_be_a_valid_promise_or_must_not_con_1322", "Type of iterated elements of a 'yield*' operand must either be a valid promise or must not contain a callable 'then' member."),
    Dynamic_imports_are_only_supported_when_the_module_flag_is_set_to_es2020_es2022_esnext_commonjs_amd_system_umd_node16_or_nodenext: diag(1323, 1 /* Error */, "Dynamic_imports_are_only_supported_when_the_module_flag_is_set_to_es2020_es2022_esnext_commonjs_amd__1323", "Dynamic imports are only supported when the '--module' flag is set to 'es2020', 'es2022', 'esnext', 'commonjs', 'amd', 'system', 'umd', 'node16', or 'nodenext'."),
    Dynamic_imports_only_support_a_second_argument_when_the_module_option_is_set_to_esnext_node16_or_nodenext: diag(1324, 1 /* Error */, "Dynamic_imports_only_support_a_second_argument_when_the_module_option_is_set_to_esnext_node16_or_nod_1324", "Dynamic imports only support a second argument when the '--module' option is set to 'esnext', 'node16', or 'nodenext'."),
    Argument_of_dynamic_import_cannot_be_spread_element: diag(1325, 1 /* Error */, "Argument_of_dynamic_import_cannot_be_spread_element_1325", "Argument of dynamic import cannot be spread element."),
    This_use_of_import_is_invalid_import_calls_can_be_written_but_they_must_have_parentheses_and_cannot_have_type_arguments: diag(1326, 1 /* Error */, "This_use_of_import_is_invalid_import_calls_can_be_written_but_they_must_have_parentheses_and_cannot__1326", "This use of 'import' is invalid. 'import()' calls can be written, but they must have parentheses and cannot have type arguments."),
    String_literal_with_double_quotes_expected: diag(1327, 1 /* Error */, "String_literal_with_double_quotes_expected_1327", "String literal with double quotes expected."),
    Property_value_can_only_be_string_literal_numeric_literal_true_false_null_object_literal_or_array_literal: diag(1328, 1 /* Error */, "Property_value_can_only_be_string_literal_numeric_literal_true_false_null_object_literal_or_array_li_1328", "Property value can only be string literal, numeric literal, 'true', 'false', 'null', object literal or array literal."),
    _0_accepts_too_few_arguments_to_be_used_as_a_decorator_here_Did_you_mean_to_call_it_first_and_write_0: diag(1329, 1 /* Error */, "_0_accepts_too_few_arguments_to_be_used_as_a_decorator_here_Did_you_mean_to_call_it_first_and_write__1329", "'{0}' accepts too few arguments to be used as a decorator here. Did you mean to call it first and write '@{0}()'?"),
    A_property_of_an_interface_or_type_literal_whose_type_is_a_unique_symbol_type_must_be_readonly: diag(1330, 1 /* Error */, "A_property_of_an_interface_or_type_literal_whose_type_is_a_unique_symbol_type_must_be_readonly_1330", "A property of an interface or type literal whose type is a 'unique symbol' type must be 'readonly'."),
    A_property_of_a_class_whose_type_is_a_unique_symbol_type_must_be_both_static_and_readonly: diag(1331, 1 /* Error */, "A_property_of_a_class_whose_type_is_a_unique_symbol_type_must_be_both_static_and_readonly_1331", "A property of a class whose type is a 'unique symbol' type must be both 'static' and 'readonly'."),
    A_variable_whose_type_is_a_unique_symbol_type_must_be_const: diag(1332, 1 /* Error */, "A_variable_whose_type_is_a_unique_symbol_type_must_be_const_1332", "A variable whose type is a 'unique symbol' type must be 'const'."),
    unique_symbol_types_may_not_be_used_on_a_variable_declaration_with_a_binding_name: diag(1333, 1 /* Error */, "unique_symbol_types_may_not_be_used_on_a_variable_declaration_with_a_binding_name_1333", "'unique symbol' types may not be used on a variable declaration with a binding name."),
    unique_symbol_types_are_only_allowed_on_variables_in_a_variable_statement: diag(1334, 1 /* Error */, "unique_symbol_types_are_only_allowed_on_variables_in_a_variable_statement_1334", "'unique symbol' types are only allowed on variables in a variable statement."),
    unique_symbol_types_are_not_allowed_here: diag(1335, 1 /* Error */, "unique_symbol_types_are_not_allowed_here_1335", "'unique symbol' types are not allowed here."),
    An_index_signature_parameter_type_cannot_be_a_literal_type_or_generic_type_Consider_using_a_mapped_object_type_instead: diag(1337, 1 /* Error */, "An_index_signature_parameter_type_cannot_be_a_literal_type_or_generic_type_Consider_using_a_mapped_o_1337", "An index signature parameter type cannot be a literal type or generic type. Consider using a mapped object type instead."),
    infer_declarations_are_only_permitted_in_the_extends_clause_of_a_conditional_type: diag(1338, 1 /* Error */, "infer_declarations_are_only_permitted_in_the_extends_clause_of_a_conditional_type_1338", "'infer' declarations are only permitted in the 'extends' clause of a conditional type."),
    Module_0_does_not_refer_to_a_value_but_is_used_as_a_value_here: diag(1339, 1 /* Error */, "Module_0_does_not_refer_to_a_value_but_is_used_as_a_value_here_1339", "Module '{0}' does not refer to a value, but is used as a value here."),
    Module_0_does_not_refer_to_a_type_but_is_used_as_a_type_here_Did_you_mean_typeof_import_0: diag(1340, 1 /* Error */, "Module_0_does_not_refer_to_a_type_but_is_used_as_a_type_here_Did_you_mean_typeof_import_0_1340", "Module '{0}' does not refer to a type, but is used as a type here. Did you mean 'typeof import('{0}')'?"),
    Class_constructor_may_not_be_an_accessor: diag(1341, 1 /* Error */, "Class_constructor_may_not_be_an_accessor_1341", "Class constructor may not be an accessor."),
    The_import_meta_meta_property_is_only_allowed_when_the_module_option_is_es2020_es2022_esnext_system_node16_or_nodenext: diag(1343, 1 /* Error */, "The_import_meta_meta_property_is_only_allowed_when_the_module_option_is_es2020_es2022_esnext_system__1343", "The 'import.meta' meta-property is only allowed when the '--module' option is 'es2020', 'es2022', 'esnext', 'system', 'node16', or 'nodenext'."),
    A_label_is_not_allowed_here: diag(1344, 1 /* Error */, "A_label_is_not_allowed_here_1344", "'A label is not allowed here."),
    An_expression_of_type_void_cannot_be_tested_for_truthiness: diag(1345, 1 /* Error */, "An_expression_of_type_void_cannot_be_tested_for_truthiness_1345", "An expression of type 'void' cannot be tested for truthiness."),
    This_parameter_is_not_allowed_with_use_strict_directive: diag(1346, 1 /* Error */, "This_parameter_is_not_allowed_with_use_strict_directive_1346", "This parameter is not allowed with 'use strict' directive."),
    use_strict_directive_cannot_be_used_with_non_simple_parameter_list: diag(1347, 1 /* Error */, "use_strict_directive_cannot_be_used_with_non_simple_parameter_list_1347", "'use strict' directive cannot be used with non-simple parameter list."),
    Non_simple_parameter_declared_here: diag(1348, 1 /* Error */, "Non_simple_parameter_declared_here_1348", "Non-simple parameter declared here."),
    use_strict_directive_used_here: diag(1349, 1 /* Error */, "use_strict_directive_used_here_1349", "'use strict' directive used here."),
    Print_the_final_configuration_instead_of_building: diag(1350, 3 /* Message */, "Print_the_final_configuration_instead_of_building_1350", "Print the final configuration instead of building."),
    An_identifier_or_keyword_cannot_immediately_follow_a_numeric_literal: diag(1351, 1 /* Error */, "An_identifier_or_keyword_cannot_immediately_follow_a_numeric_literal_1351", "An identifier or keyword cannot immediately follow a numeric literal."),
    A_bigint_literal_cannot_use_exponential_notation: diag(1352, 1 /* Error */, "A_bigint_literal_cannot_use_exponential_notation_1352", "A bigint literal cannot use exponential notation."),
    A_bigint_literal_must_be_an_integer: diag(1353, 1 /* Error */, "A_bigint_literal_must_be_an_integer_1353", "A bigint literal must be an integer."),
    readonly_type_modifier_is_only_permitted_on_array_and_tuple_literal_types: diag(1354, 1 /* Error */, "readonly_type_modifier_is_only_permitted_on_array_and_tuple_literal_types_1354", "'readonly' type modifier is only permitted on array and tuple literal types."),
    A_const_assertions_can_only_be_applied_to_references_to_enum_members_or_string_number_boolean_array_or_object_literals: diag(1355, 1 /* Error */, "A_const_assertions_can_only_be_applied_to_references_to_enum_members_or_string_number_boolean_array__1355", "A 'const' assertions can only be applied to references to enum members, or string, number, boolean, array, or object literals."),
    Did_you_mean_to_mark_this_function_as_async: diag(1356, 1 /* Error */, "Did_you_mean_to_mark_this_function_as_async_1356", "Did you mean to mark this function as 'async'?"),
    An_enum_member_name_must_be_followed_by_a_or: diag(1357, 1 /* Error */, "An_enum_member_name_must_be_followed_by_a_or_1357", "An enum member name must be followed by a ',', '=', or '}'."),
    Tagged_template_expressions_are_not_permitted_in_an_optional_chain: diag(1358, 1 /* Error */, "Tagged_template_expressions_are_not_permitted_in_an_optional_chain_1358", "Tagged template expressions are not permitted in an optional chain."),
    Identifier_expected_0_is_a_reserved_word_that_cannot_be_used_here: diag(1359, 1 /* Error */, "Identifier_expected_0_is_a_reserved_word_that_cannot_be_used_here_1359", "Identifier expected. '{0}' is a reserved word that cannot be used here."),
    Type_0_does_not_satisfy_the_expected_type_1: diag(1360, 1 /* Error */, "Type_0_does_not_satisfy_the_expected_type_1_1360", "Type '{0}' does not satisfy the expected type '{1}'."),
    _0_cannot_be_used_as_a_value_because_it_was_imported_using_import_type: diag(1361, 1 /* Error */, "_0_cannot_be_used_as_a_value_because_it_was_imported_using_import_type_1361", "'{0}' cannot be used as a value because it was imported using 'import type'."),
    _0_cannot_be_used_as_a_value_because_it_was_exported_using_export_type: diag(1362, 1 /* Error */, "_0_cannot_be_used_as_a_value_because_it_was_exported_using_export_type_1362", "'{0}' cannot be used as a value because it was exported using 'export type'."),
    A_type_only_import_can_specify_a_default_import_or_named_bindings_but_not_both: diag(1363, 1 /* Error */, "A_type_only_import_can_specify_a_default_import_or_named_bindings_but_not_both_1363", "A type-only import can specify a default import or named bindings, but not both."),
    Convert_to_type_only_export: diag(1364, 3 /* Message */, "Convert_to_type_only_export_1364", "Convert to type-only export"),
    Convert_all_re_exported_types_to_type_only_exports: diag(1365, 3 /* Message */, "Convert_all_re_exported_types_to_type_only_exports_1365", "Convert all re-exported types to type-only exports"),
    Split_into_two_separate_import_declarations: diag(1366, 3 /* Message */, "Split_into_two_separate_import_declarations_1366", "Split into two separate import declarations"),
    Split_all_invalid_type_only_imports: diag(1367, 3 /* Message */, "Split_all_invalid_type_only_imports_1367", "Split all invalid type-only imports"),
    Class_constructor_may_not_be_a_generator: diag(1368, 1 /* Error */, "Class_constructor_may_not_be_a_generator_1368", "Class constructor may not be a generator."),
    Did_you_mean_0: diag(1369, 3 /* Message */, "Did_you_mean_0_1369", "Did you mean '{0}'?"),
    This_import_is_never_used_as_a_value_and_must_use_import_type_because_importsNotUsedAsValues_is_set_to_error: diag(1371, 1 /* Error */, "This_import_is_never_used_as_a_value_and_must_use_import_type_because_importsNotUsedAsValues_is_set__1371", "This import is never used as a value and must use 'import type' because 'importsNotUsedAsValues' is set to 'error'."),
    await_expressions_are_only_allowed_at_the_top_level_of_a_file_when_that_file_is_a_module_but_this_file_has_no_imports_or_exports_Consider_adding_an_empty_export_to_make_this_file_a_module: diag(1375, 1 /* Error */, "await_expressions_are_only_allowed_at_the_top_level_of_a_file_when_that_file_is_a_module_but_this_fi_1375", "'await' expressions are only allowed at the top level of a file when that file is a module, but this file has no imports or exports. Consider adding an empty 'export {}' to make this file a module."),
    _0_was_imported_here: diag(1376, 3 /* Message */, "_0_was_imported_here_1376", "'{0}' was imported here."),
    _0_was_exported_here: diag(1377, 3 /* Message */, "_0_was_exported_here_1377", "'{0}' was exported here."),
    Top_level_await_expressions_are_only_allowed_when_the_module_option_is_set_to_es2022_esnext_system_node16_nodenext_or_preserve_and_the_target_option_is_set_to_es2017_or_higher: diag(1378, 1 /* Error */, "Top_level_await_expressions_are_only_allowed_when_the_module_option_is_set_to_es2022_esnext_system_n_1378", "Top-level 'await' expressions are only allowed when the 'module' option is set to 'es2022', 'esnext', 'system', 'node16', 'nodenext', or 'preserve', and the 'target' option is set to 'es2017' or higher."),
    An_import_alias_cannot_reference_a_declaration_that_was_exported_using_export_type: diag(1379, 1 /* Error */, "An_import_alias_cannot_reference_a_declaration_that_was_exported_using_export_type_1379", "An import alias cannot reference a declaration that was exported using 'export type'."),
    An_import_alias_cannot_reference_a_declaration_that_was_imported_using_import_type: diag(1380, 1 /* Error */, "An_import_alias_cannot_reference_a_declaration_that_was_imported_using_import_type_1380", "An import alias cannot reference a declaration that was imported using 'import type'."),
    Unexpected_token_Did_you_mean_or_rbrace: diag(1381, 1 /* Error */, "Unexpected_token_Did_you_mean_or_rbrace_1381", "Unexpected token. Did you mean `{'}'}` or `&rbrace;`?"),
    Unexpected_token_Did_you_mean_or_gt: diag(1382, 1 /* Error */, "Unexpected_token_Did_you_mean_or_gt_1382", "Unexpected token. Did you mean `{'>'}` or `&gt;`?"),
    Function_type_notation_must_be_parenthesized_when_used_in_a_union_type: diag(1385, 1 /* Error */, "Function_type_notation_must_be_parenthesized_when_used_in_a_union_type_1385", "Function type notation must be parenthesized when used in a union type."),
    Constructor_type_notation_must_be_parenthesized_when_used_in_a_union_type: diag(1386, 1 /* Error */, "Constructor_type_notation_must_be_parenthesized_when_used_in_a_union_type_1386", "Constructor type notation must be parenthesized when used in a union type."),
    Function_type_notation_must_be_parenthesized_when_used_in_an_intersection_type: diag(1387, 1 /* Error */, "Function_type_notation_must_be_parenthesized_when_used_in_an_intersection_type_1387", "Function type notation must be parenthesized when used in an intersection type."),
    Constructor_type_notation_must_be_parenthesized_when_used_in_an_intersection_type: diag(1388, 1 /* Error */, "Constructor_type_notation_must_be_parenthesized_when_used_in_an_intersection_type_1388", "Constructor type notation must be parenthesized when used in an intersection type."),
    _0_is_not_allowed_as_a_variable_declaration_name: diag(1389, 1 /* Error */, "_0_is_not_allowed_as_a_variable_declaration_name_1389", "'{0}' is not allowed as a variable declaration name."),
    _0_is_not_allowed_as_a_parameter_name: diag(1390, 1 /* Error */, "_0_is_not_allowed_as_a_parameter_name_1390", "'{0}' is not allowed as a parameter name."),
    An_import_alias_cannot_use_import_type: diag(1392, 1 /* Error */, "An_import_alias_cannot_use_import_type_1392", "An import alias cannot use 'import type'"),
    Imported_via_0_from_file_1: diag(1393, 3 /* Message */, "Imported_via_0_from_file_1_1393", "Imported via {0} from file '{1}'"),
    Imported_via_0_from_file_1_with_packageId_2: diag(1394, 3 /* Message */, "Imported_via_0_from_file_1_with_packageId_2_1394", "Imported via {0} from file '{1}' with packageId '{2}'"),
    Imported_via_0_from_file_1_to_import_importHelpers_as_specified_in_compilerOptions: diag(1395, 3 /* Message */, "Imported_via_0_from_file_1_to_import_importHelpers_as_specified_in_compilerOptions_1395", "Imported via {0} from file '{1}' to import 'importHelpers' as specified in compilerOptions"),
    Imported_via_0_from_file_1_with_packageId_2_to_import_importHelpers_as_specified_in_compilerOptions: diag(1396, 3 /* Message */, "Imported_via_0_from_file_1_with_packageId_2_to_import_importHelpers_as_specified_in_compilerOptions_1396", "Imported via {0} from file '{1}' with packageId '{2}' to import 'importHelpers' as specified in compilerOptions"),
    Imported_via_0_from_file_1_to_import_jsx_and_jsxs_factory_functions: diag(1397, 3 /* Message */, "Imported_via_0_from_file_1_to_import_jsx_and_jsxs_factory_functions_1397", "Imported via {0} from file '{1}' to import 'jsx' and 'jsxs' factory functions"),
    Imported_via_0_from_file_1_with_packageId_2_to_import_jsx_and_jsxs_factory_functions: diag(1398, 3 /* Message */, "Imported_via_0_from_file_1_with_packageId_2_to_import_jsx_and_jsxs_factory_functions_1398", "Imported via {0} from file '{1}' with packageId '{2}' to import 'jsx' and 'jsxs' factory functions"),
    File_is_included_via_import_here: diag(1399, 3 /* Message */, "File_is_included_via_import_here_1399", "File is included via import here."),
    Referenced_via_0_from_file_1: diag(1400, 3 /* Message */, "Referenced_via_0_from_file_1_1400", "Referenced via '{0}' from file '{1}'"),
    File_is_included_via_reference_here: diag(1401, 3 /* Message */, "File_is_included_via_reference_here_1401", "File is included via reference here."),
    Type_library_referenced_via_0_from_file_1: diag(1402, 3 /* Message */, "Type_library_referenced_via_0_from_file_1_1402", "Type library referenced via '{0}' from file '{1}'"),
    Type_library_referenced_via_0_from_file_1_with_packageId_2: diag(1403, 3 /* Message */, "Type_library_referenced_via_0_from_file_1_with_packageId_2_1403", "Type library referenced via '{0}' from file '{1}' with packageId '{2}'"),
    File_is_included_via_type_library_reference_here: diag(1404, 3 /* Message */, "File_is_included_via_type_library_reference_here_1404", "File is included via type library reference here."),
    Library_referenced_via_0_from_file_1: diag(1405, 3 /* Message */, "Library_referenced_via_0_from_file_1_1405", "Library referenced via '{0}' from file '{1}'"),
    File_is_included_via_library_reference_here: diag(1406, 3 /* Message */, "File_is_included_via_library_reference_here_1406", "File is included via library reference here."),
    Matched_by_include_pattern_0_in_1: diag(1407, 3 /* Message */, "Matched_by_include_pattern_0_in_1_1407", "Matched by include pattern '{0}' in '{1}'"),
    File_is_matched_by_include_pattern_specified_here: diag(1408, 3 /* Message */, "File_is_matched_by_include_pattern_specified_here_1408", "File is matched by include pattern specified here."),
    Part_of_files_list_in_tsconfig_json: diag(1409, 3 /* Message */, "Part_of_files_list_in_tsconfig_json_1409", "Part of 'files' list in tsconfig.json"),
    File_is_matched_by_files_list_specified_here: diag(1410, 3 /* Message */, "File_is_matched_by_files_list_specified_here_1410", "File is matched by 'files' list specified here."),
    Output_from_referenced_project_0_included_because_1_specified: diag(1411, 3 /* Message */, "Output_from_referenced_project_0_included_because_1_specified_1411", "Output from referenced project '{0}' included because '{1}' specified"),
    Output_from_referenced_project_0_included_because_module_is_specified_as_none: diag(1412, 3 /* Message */, "Output_from_referenced_project_0_included_because_module_is_specified_as_none_1412", "Output from referenced project '{0}' included because '--module' is specified as 'none'"),
    File_is_output_from_referenced_project_specified_here: diag(1413, 3 /* Message */, "File_is_output_from_referenced_project_specified_here_1413", "File is output from referenced project specified here."),
    Source_from_referenced_project_0_included_because_1_specified: diag(1414, 3 /* Message */, "Source_from_referenced_project_0_included_because_1_specified_1414", "Source from referenced project '{0}' included because '{1}' specified"),
    Source_from_referenced_project_0_included_because_module_is_specified_as_none: diag(1415, 3 /* Message */, "Source_from_referenced_project_0_included_because_module_is_specified_as_none_1415", "Source from referenced project '{0}' included because '--module' is specified as 'none'"),
    File_is_source_from_referenced_project_specified_here: diag(1416, 3 /* Message */, "File_is_source_from_referenced_project_specified_here_1416", "File is source from referenced project specified here."),
    Entry_point_of_type_library_0_specified_in_compilerOptions: diag(1417, 3 /* Message */, "Entry_point_of_type_library_0_specified_in_compilerOptions_1417", "Entry point of type library '{0}' specified in compilerOptions"),
    Entry_point_of_type_library_0_specified_in_compilerOptions_with_packageId_1: diag(1418, 3 /* Message */, "Entry_point_of_type_library_0_specified_in_compilerOptions_with_packageId_1_1418", "Entry point of type library '{0}' specified in compilerOptions with packageId '{1}'"),
    File_is_entry_point_of_type_library_specified_here: diag(1419, 3 /* Message */, "File_is_entry_point_of_type_library_specified_here_1419", "File is entry point of type library specified here."),
    Entry_point_for_implicit_type_library_0: diag(1420, 3 /* Message */, "Entry_point_for_implicit_type_library_0_1420", "Entry point for implicit type library '{0}'"),
    Entry_point_for_implicit_type_library_0_with_packageId_1: diag(1421, 3 /* Message */, "Entry_point_for_implicit_type_library_0_with_packageId_1_1421", "Entry point for implicit type library '{0}' with packageId '{1}'"),
    Library_0_specified_in_compilerOptions: diag(1422, 3 /* Message */, "Library_0_specified_in_compilerOptions_1422", "Library '{0}' specified in compilerOptions"),
    File_is_library_specified_here: diag(1423, 3 /* Message */, "File_is_library_specified_here_1423", "File is library specified here."),
    Default_library: diag(1424, 3 /* Message */, "Default_library_1424", "Default library"),
    Default_library_for_target_0: diag(1425, 3 /* Message */, "Default_library_for_target_0_1425", "Default library for target '{0}'"),
    File_is_default_library_for_target_specified_here: diag(1426, 3 /* Message */, "File_is_default_library_for_target_specified_here_1426", "File is default library for target specified here."),
    Root_file_specified_for_compilation: diag(1427, 3 /* Message */, "Root_file_specified_for_compilation_1427", "Root file specified for compilation"),
    File_is_output_of_project_reference_source_0: diag(1428, 3 /* Message */, "File_is_output_of_project_reference_source_0_1428", "File is output of project reference source '{0}'"),
    File_redirects_to_file_0: diag(1429, 3 /* Message */, "File_redirects_to_file_0_1429", "File redirects to file '{0}'"),
    The_file_is_in_the_program_because_Colon: diag(1430, 3 /* Message */, "The_file_is_in_the_program_because_Colon_1430", "The file is in the program because:"),
    for_await_loops_are_only_allowed_at_the_top_level_of_a_file_when_that_file_is_a_module_but_this_file_has_no_imports_or_exports_Consider_adding_an_empty_export_to_make_this_file_a_module: diag(1431, 1 /* Error */, "for_await_loops_are_only_allowed_at_the_top_level_of_a_file_when_that_file_is_a_module_but_this_file_1431", "'for await' loops are only allowed at the top level of a file when that file is a module, but this file has no imports or exports. Consider adding an empty 'export {}' to make this file a module."),
    Top_level_for_await_loops_are_only_allowed_when_the_module_option_is_set_to_es2022_esnext_system_node16_nodenext_or_preserve_and_the_target_option_is_set_to_es2017_or_higher: diag(1432, 1 /* Error */, "Top_level_for_await_loops_are_only_allowed_when_the_module_option_is_set_to_es2022_esnext_system_nod_1432", "Top-level 'for await' loops are only allowed when the 'module' option is set to 'es2022', 'esnext', 'system', 'node16', 'nodenext', or 'preserve', and the 'target' option is set to 'es2017' or higher."),
    Neither_decorators_nor_modifiers_may_be_applied_to_this_parameters: diag(1433, 1 /* Error */, "Neither_decorators_nor_modifiers_may_be_applied_to_this_parameters_1433", "Neither decorators nor modifiers may be applied to 'this' parameters."),
    Unexpected_keyword_or_identifier: diag(1434, 1 /* Error */, "Unexpected_keyword_or_identifier_1434", "Unexpected keyword or identifier."),
    Unknown_keyword_or_identifier_Did_you_mean_0: diag(1435, 1 /* Error */, "Unknown_keyword_or_identifier_Did_you_mean_0_1435", "Unknown keyword or identifier. Did you mean '{0}'?"),
    Decorators_must_precede_the_name_and_all_keywords_of_property_declarations: diag(1436, 1 /* Error */, "Decorators_must_precede_the_name_and_all_keywords_of_property_declarations_1436", "Decorators must precede the name and all keywords of property declarations."),
    Namespace_must_be_given_a_name: diag(1437, 1 /* Error */, "Namespace_must_be_given_a_name_1437", "Namespace must be given a name."),
    Interface_must_be_given_a_name: diag(1438, 1 /* Error */, "Interface_must_be_given_a_name_1438", "Interface must be given a name."),
    Type_alias_must_be_given_a_name: diag(1439, 1 /* Error */, "Type_alias_must_be_given_a_name_1439", "Type alias must be given a name."),
    Variable_declaration_not_allowed_at_this_location: diag(1440, 1 /* Error */, "Variable_declaration_not_allowed_at_this_location_1440", "Variable declaration not allowed at this location."),
    Cannot_start_a_function_call_in_a_type_annotation: diag(1441, 1 /* Error */, "Cannot_start_a_function_call_in_a_type_annotation_1441", "Cannot start a function call in a type annotation."),
    Expected_for_property_initializer: diag(1442, 1 /* Error */, "Expected_for_property_initializer_1442", "Expected '=' for property initializer."),
    Module_declaration_names_may_only_use_or_quoted_strings: diag(1443, 1 /* Error */, "Module_declaration_names_may_only_use_or_quoted_strings_1443", `Module declaration names may only use ' or " quoted strings.`),
    _0_is_a_type_and_must_be_imported_using_a_type_only_import_when_preserveValueImports_and_isolatedModules_are_both_enabled: diag(1444, 1 /* Error */, "_0_is_a_type_and_must_be_imported_using_a_type_only_import_when_preserveValueImports_and_isolatedMod_1444", "'{0}' is a type and must be imported using a type-only import when 'preserveValueImports' and 'isolatedModules' are both enabled."),
    _0_resolves_to_a_type_only_declaration_and_must_be_imported_using_a_type_only_import_when_preserveValueImports_and_isolatedModules_are_both_enabled: diag(1446, 1 /* Error */, "_0_resolves_to_a_type_only_declaration_and_must_be_imported_using_a_type_only_import_when_preserveVa_1446", "'{0}' resolves to a type-only declaration and must be imported using a type-only import when 'preserveValueImports' and 'isolatedModules' are both enabled."),
    _0_resolves_to_a_type_only_declaration_and_must_be_re_exported_using_a_type_only_re_export_when_1_is_enabled: diag(1448, 1 /* Error */, "_0_resolves_to_a_type_only_declaration_and_must_be_re_exported_using_a_type_only_re_export_when_1_is_1448", "'{0}' resolves to a type-only declaration and must be re-exported using a type-only re-export when '{1}' is enabled."),
    Preserve_unused_imported_values_in_the_JavaScript_output_that_would_otherwise_be_removed: diag(1449, 3 /* Message */, "Preserve_unused_imported_values_in_the_JavaScript_output_that_would_otherwise_be_removed_1449", "Preserve unused imported values in the JavaScript output that would otherwise be removed."),
    Dynamic_imports_can_only_accept_a_module_specifier_and_an_optional_set_of_attributes_as_arguments: diag(1450, 3 /* Message */, "Dynamic_imports_can_only_accept_a_module_specifier_and_an_optional_set_of_attributes_as_arguments_1450", "Dynamic imports can only accept a module specifier and an optional set of attributes as arguments"),
    Private_identifiers_are_only_allowed_in_class_bodies_and_may_only_be_used_as_part_of_a_class_member_declaration_property_access_or_on_the_left_hand_side_of_an_in_expression: diag(1451, 1 /* Error */, "Private_identifiers_are_only_allowed_in_class_bodies_and_may_only_be_used_as_part_of_a_class_member__1451", "Private identifiers are only allowed in class bodies and may only be used as part of a class member declaration, property access, or on the left-hand-side of an 'in' expression"),
    resolution_mode_should_be_either_require_or_import: diag(1453, 1 /* Error */, "resolution_mode_should_be_either_require_or_import_1453", "`resolution-mode` should be either `require` or `import`."),
    resolution_mode_can_only_be_set_for_type_only_imports: diag(1454, 1 /* Error */, "resolution_mode_can_only_be_set_for_type_only_imports_1454", "`resolution-mode` can only be set for type-only imports."),
    resolution_mode_is_the_only_valid_key_for_type_import_assertions: diag(1455, 1 /* Error */, "resolution_mode_is_the_only_valid_key_for_type_import_assertions_1455", "`resolution-mode` is the only valid key for type import assertions."),
    Type_import_assertions_should_have_exactly_one_key_resolution_mode_with_value_import_or_require: diag(1456, 1 /* Error */, "Type_import_assertions_should_have_exactly_one_key_resolution_mode_with_value_import_or_require_1456", "Type import assertions should have exactly one key - `resolution-mode` - with value `import` or `require`."),
    Matched_by_default_include_pattern_Asterisk_Asterisk_Slash_Asterisk: diag(1457, 3 /* Message */, "Matched_by_default_include_pattern_Asterisk_Asterisk_Slash_Asterisk_1457", "Matched by default include pattern '**/*'"),
    File_is_ECMAScript_module_because_0_has_field_type_with_value_module: diag(1458, 3 /* Message */, "File_is_ECMAScript_module_because_0_has_field_type_with_value_module_1458", `File is ECMAScript module because '{0}' has field "type" with value "module"`),
    File_is_CommonJS_module_because_0_has_field_type_whose_value_is_not_module: diag(1459, 3 /* Message */, "File_is_CommonJS_module_because_0_has_field_type_whose_value_is_not_module_1459", `File is CommonJS module because '{0}' has field "type" whose value is not "module"`),
    File_is_CommonJS_module_because_0_does_not_have_field_type: diag(1460, 3 /* Message */, "File_is_CommonJS_module_because_0_does_not_have_field_type_1460", `File is CommonJS module because '{0}' does not have field "type"`),
    File_is_CommonJS_module_because_package_json_was_not_found: diag(1461, 3 /* Message */, "File_is_CommonJS_module_because_package_json_was_not_found_1461", "File is CommonJS module because 'package.json' was not found"),
    resolution_mode_is_the_only_valid_key_for_type_import_attributes: diag(1463, 1 /* Error */, "resolution_mode_is_the_only_valid_key_for_type_import_attributes_1463", "'resolution-mode' is the only valid key for type import attributes."),
    Type_import_attributes_should_have_exactly_one_key_resolution_mode_with_value_import_or_require: diag(1464, 1 /* Error */, "Type_import_attributes_should_have_exactly_one_key_resolution_mode_with_value_import_or_require_1464", "Type import attributes should have exactly one key - 'resolution-mode' - with value 'import' or 'require'."),
    The_import_meta_meta_property_is_not_allowed_in_files_which_will_build_into_CommonJS_output: diag(1470, 1 /* Error */, "The_import_meta_meta_property_is_not_allowed_in_files_which_will_build_into_CommonJS_output_1470", "The 'import.meta' meta-property is not allowed in files which will build into CommonJS output."),
    Module_0_cannot_be_imported_using_this_construct_The_specifier_only_resolves_to_an_ES_module_which_cannot_be_imported_with_require_Use_an_ECMAScript_import_instead: diag(1471, 1 /* Error */, "Module_0_cannot_be_imported_using_this_construct_The_specifier_only_resolves_to_an_ES_module_which_c_1471", "Module '{0}' cannot be imported using this construct. The specifier only resolves to an ES module, which cannot be imported with 'require'. Use an ECMAScript import instead."),
    catch_or_finally_expected: diag(1472, 1 /* Error */, "catch_or_finally_expected_1472", "'catch' or 'finally' expected."),
    An_import_declaration_can_only_be_used_at_the_top_level_of_a_module: diag(1473, 1 /* Error */, "An_import_declaration_can_only_be_used_at_the_top_level_of_a_module_1473", "An import declaration can only be used at the top level of a module."),
    An_export_declaration_can_only_be_used_at_the_top_level_of_a_module: diag(1474, 1 /* Error */, "An_export_declaration_can_only_be_used_at_the_top_level_of_a_module_1474", "An export declaration can only be used at the top level of a module."),
    Control_what_method_is_used_to_detect_module_format_JS_files: diag(1475, 3 /* Message */, "Control_what_method_is_used_to_detect_module_format_JS_files_1475", "Control what method is used to detect module-format JS files."),
    auto_Colon_Treat_files_with_imports_exports_import_meta_jsx_with_jsx_Colon_react_jsx_or_esm_format_with_module_Colon_node16_as_modules: diag(1476, 3 /* Message */, "auto_Colon_Treat_files_with_imports_exports_import_meta_jsx_with_jsx_Colon_react_jsx_or_esm_format_w_1476", '"auto": Treat files with imports, exports, import.meta, jsx (with jsx: react-jsx), or esm format (with module: node16+) as modules.'),
    An_instantiation_expression_cannot_be_followed_by_a_property_access: diag(1477, 1 /* Error */, "An_instantiation_expression_cannot_be_followed_by_a_property_access_1477", "An instantiation expression cannot be followed by a property access."),
    Identifier_or_string_literal_expected: diag(1478, 1 /* Error */, "Identifier_or_string_literal_expected_1478", "Identifier or string literal expected."),
    The_current_file_is_a_CommonJS_module_whose_imports_will_produce_require_calls_however_the_referenced_file_is_an_ECMAScript_module_and_cannot_be_imported_with_require_Consider_writing_a_dynamic_import_0_call_instead: diag(1479, 1 /* Error */, "The_current_file_is_a_CommonJS_module_whose_imports_will_produce_require_calls_however_the_reference_1479", `The current file is a CommonJS module whose imports will produce 'require' calls; however, the referenced file is an ECMAScript module and cannot be imported with 'require'. Consider writing a dynamic 'import("{0}")' call instead.`),
    To_convert_this_file_to_an_ECMAScript_module_change_its_file_extension_to_0_or_create_a_local_package_json_file_with_type_Colon_module: diag(1480, 3 /* Message */, "To_convert_this_file_to_an_ECMAScript_module_change_its_file_extension_to_0_or_create_a_local_packag_1480", 'To convert this file to an ECMAScript module, change its file extension to \'{0}\' or create a local package.json file with `{ "type": "module" }`.'),
    To_convert_this_file_to_an_ECMAScript_module_change_its_file_extension_to_0_or_add_the_field_type_Colon_module_to_1: diag(1481, 3 /* Message */, "To_convert_this_file_to_an_ECMAScript_module_change_its_file_extension_to_0_or_add_the_field_type_Co_1481", `To convert this file to an ECMAScript module, change its file extension to '{0}', or add the field \`"type": "module"\` to '{1}'.`),
    To_convert_this_file_to_an_ECMAScript_module_add_the_field_type_Colon_module_to_0: diag(1482, 3 /* Message */, "To_convert_this_file_to_an_ECMAScript_module_add_the_field_type_Colon_module_to_0_1482", 'To convert this file to an ECMAScript module, add the field `"type": "module"` to \'{0}\'.'),
    To_convert_this_file_to_an_ECMAScript_module_create_a_local_package_json_file_with_type_Colon_module: diag(1483, 3 /* Message */, "To_convert_this_file_to_an_ECMAScript_module_create_a_local_package_json_file_with_type_Colon_module_1483", 'To convert this file to an ECMAScript module, create a local package.json file with `{ "type": "module" }`.'),
    _0_is_a_type_and_must_be_imported_using_a_type_only_import_when_verbatimModuleSyntax_is_enabled: diag(1484, 1 /* Error */, "_0_is_a_type_and_must_be_imported_using_a_type_only_import_when_verbatimModuleSyntax_is_enabled_1484", "'{0}' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled."),
    _0_resolves_to_a_type_only_declaration_and_must_be_imported_using_a_type_only_import_when_verbatimModuleSyntax_is_enabled: diag(1485, 1 /* Error */, "_0_resolves_to_a_type_only_declaration_and_must_be_imported_using_a_type_only_import_when_verbatimMo_1485", "'{0}' resolves to a type-only declaration and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled."),
    Decorator_used_before_export_here: diag(1486, 1 /* Error */, "Decorator_used_before_export_here_1486", "Decorator used before 'export' here."),
    Octal_escape_sequences_are_not_allowed_Use_the_syntax_0: diag(1487, 1 /* Error */, "Octal_escape_sequences_are_not_allowed_Use_the_syntax_0_1487", "Octal escape sequences are not allowed. Use the syntax '{0}'."),
    Escape_sequence_0_is_not_allowed: diag(1488, 1 /* Error */, "Escape_sequence_0_is_not_allowed_1488", "Escape sequence '{0}' is not allowed."),
    Decimals_with_leading_zeros_are_not_allowed: diag(1489, 1 /* Error */, "Decimals_with_leading_zeros_are_not_allowed_1489", "Decimals with leading zeros are not allowed."),
    File_appears_to_be_binary: diag(1490, 1 /* Error */, "File_appears_to_be_binary_1490", "File appears to be binary."),
    _0_modifier_cannot_appear_on_a_using_declaration: diag(1491, 1 /* Error */, "_0_modifier_cannot_appear_on_a_using_declaration_1491", "'{0}' modifier cannot appear on a 'using' declaration."),
    _0_declarations_may_not_have_binding_patterns: diag(1492, 1 /* Error */, "_0_declarations_may_not_have_binding_patterns_1492", "'{0}' declarations may not have binding patterns."),
    The_left_hand_side_of_a_for_in_statement_cannot_be_a_using_declaration: diag(1493, 1 /* Error */, "The_left_hand_side_of_a_for_in_statement_cannot_be_a_using_declaration_1493", "The left-hand side of a 'for...in' statement cannot be a 'using' declaration."),
    The_left_hand_side_of_a_for_in_statement_cannot_be_an_await_using_declaration: diag(1494, 1 /* Error */, "The_left_hand_side_of_a_for_in_statement_cannot_be_an_await_using_declaration_1494", "The left-hand side of a 'for...in' statement cannot be an 'await using' declaration."),
    _0_modifier_cannot_appear_on_an_await_using_declaration: diag(1495, 1 /* Error */, "_0_modifier_cannot_appear_on_an_await_using_declaration_1495", "'{0}' modifier cannot appear on an 'await using' declaration."),
    Identifier_string_literal_or_number_literal_expected: diag(1496, 1 /* Error */, "Identifier_string_literal_or_number_literal_expected_1496", "Identifier, string literal, or number literal expected."),
    The_types_of_0_are_incompatible_between_these_types: diag(2200, 1 /* Error */, "The_types_of_0_are_incompatible_between_these_types_2200", "The types of '{0}' are incompatible between these types."),
    The_types_returned_by_0_are_incompatible_between_these_types: diag(2201, 1 /* Error */, "The_types_returned_by_0_are_incompatible_between_these_types_2201", "The types returned by '{0}' are incompatible between these types."),
    Call_signature_return_types_0_and_1_are_incompatible: diag(
      2202,
      1 /* Error */,
      "Call_signature_return_types_0_and_1_are_incompatible_2202",
      "Call signature return types '{0}' and '{1}' are incompatible.",
      /*reportsUnnecessary*/
      void 0,
      /*elidedInCompatabilityPyramid*/
      true
    ),
    Construct_signature_return_types_0_and_1_are_incompatible: diag(
      2203,
      1 /* Error */,
      "Construct_signature_return_types_0_and_1_are_incompatible_2203",
      "Construct signature return types '{0}' and '{1}' are incompatible.",
      /*reportsUnnecessary*/
      void 0,
      /*elidedInCompatabilityPyramid*/
      true
    ),
    Call_signatures_with_no_arguments_have_incompatible_return_types_0_and_1: diag(
      2204,
      1 /* Error */,
      "Call_signatures_with_no_arguments_have_incompatible_return_types_0_and_1_2204",
      "Call signatures with no arguments have incompatible return types '{0}' and '{1}'.",
      /*reportsUnnecessary*/
      void 0,
      /*elidedInCompatabilityPyramid*/
      true
    ),
    Construct_signatures_with_no_arguments_have_incompatible_return_types_0_and_1: diag(
      2205,
      1 /* Error */,
      "Construct_signatures_with_no_arguments_have_incompatible_return_types_0_and_1_2205",
      "Construct signatures with no arguments have incompatible return types '{0}' and '{1}'.",
      /*reportsUnnecessary*/
      void 0,
      /*elidedInCompatabilityPyramid*/
      true
    ),
    The_type_modifier_cannot_be_used_on_a_named_import_when_import_type_is_used_on_its_import_statement: diag(2206, 1 /* Error */, "The_type_modifier_cannot_be_used_on_a_named_import_when_import_type_is_used_on_its_import_statement_2206", "The 'type' modifier cannot be used on a named import when 'import type' is used on its import statement."),
    The_type_modifier_cannot_be_used_on_a_named_export_when_export_type_is_used_on_its_export_statement: diag(2207, 1 /* Error */, "The_type_modifier_cannot_be_used_on_a_named_export_when_export_type_is_used_on_its_export_statement_2207", "The 'type' modifier cannot be used on a named export when 'export type' is used on its export statement."),
    This_type_parameter_might_need_an_extends_0_constraint: diag(2208, 1 /* Error */, "This_type_parameter_might_need_an_extends_0_constraint_2208", "This type parameter might need an `extends {0}` constraint."),
    The_project_root_is_ambiguous_but_is_required_to_resolve_export_map_entry_0_in_file_1_Supply_the_rootDir_compiler_option_to_disambiguate: diag(2209, 1 /* Error */, "The_project_root_is_ambiguous_but_is_required_to_resolve_export_map_entry_0_in_file_1_Supply_the_roo_2209", "The project root is ambiguous, but is required to resolve export map entry '{0}' in file '{1}'. Supply the `rootDir` compiler option to disambiguate."),
    The_project_root_is_ambiguous_but_is_required_to_resolve_import_map_entry_0_in_file_1_Supply_the_rootDir_compiler_option_to_disambiguate: diag(2210, 1 /* Error */, "The_project_root_is_ambiguous_but_is_required_to_resolve_import_map_entry_0_in_file_1_Supply_the_roo_2210", "The project root is ambiguous, but is required to resolve import map entry '{0}' in file '{1}'. Supply the `rootDir` compiler option to disambiguate."),
    Add_extends_constraint: diag(2211, 3 /* Message */, "Add_extends_constraint_2211", "Add `extends` constraint."),
    Add_extends_constraint_to_all_type_parameters: diag(2212, 3 /* Message */, "Add_extends_constraint_to_all_type_parameters_2212", "Add `extends` constraint to all type parameters"),
    Duplicate_identifier_0: diag(2300, 1 /* Error */, "Duplicate_identifier_0_2300", "Duplicate identifier '{0}'."),
    Initializer_of_instance_member_variable_0_cannot_reference_identifier_1_declared_in_the_constructor: diag(2301, 1 /* Error */, "Initializer_of_instance_member_variable_0_cannot_reference_identifier_1_declared_in_the_constructor_2301", "Initializer of instance member variable '{0}' cannot reference identifier '{1}' declared in the constructor."),
    Static_members_cannot_reference_class_type_parameters: diag(2302, 1 /* Error */, "Static_members_cannot_reference_class_type_parameters_2302", "Static members cannot reference class type parameters."),
    Circular_definition_of_import_alias_0: diag(2303, 1 /* Error */, "Circular_definition_of_import_alias_0_2303", "Circular definition of import alias '{0}'."),
    Cannot_find_name_0: diag(2304, 1 /* Error */, "Cannot_find_name_0_2304", "Cannot find name '{0}'."),
    Module_0_has_no_exported_member_1: diag(2305, 1 /* Error */, "Module_0_has_no_exported_member_1_2305", "Module '{0}' has no exported member '{1}'."),
    File_0_is_not_a_module: diag(2306, 1 /* Error */, "File_0_is_not_a_module_2306", "File '{0}' is not a module."),
    Cannot_find_module_0_or_its_corresponding_type_declarations: diag(2307, 1 /* Error */, "Cannot_find_module_0_or_its_corresponding_type_declarations_2307", "Cannot find module '{0}' or its corresponding type declarations."),
    Module_0_has_already_exported_a_member_named_1_Consider_explicitly_re_exporting_to_resolve_the_ambiguity: diag(2308, 1 /* Error */, "Module_0_has_already_exported_a_member_named_1_Consider_explicitly_re_exporting_to_resolve_the_ambig_2308", "Module {0} has already exported a member named '{1}'. Consider explicitly re-exporting to resolve the ambiguity."),
    An_export_assignment_cannot_be_used_in_a_module_with_other_exported_elements: diag(2309, 1 /* Error */, "An_export_assignment_cannot_be_used_in_a_module_with_other_exported_elements_2309", "An export assignment cannot be used in a module with other exported elements."),
    Type_0_recursively_references_itself_as_a_base_type: diag(2310, 1 /* Error */, "Type_0_recursively_references_itself_as_a_base_type_2310", "Type '{0}' recursively references itself as a base type."),
    Cannot_find_name_0_Did_you_mean_to_write_this_in_an_async_function: diag(2311, 1 /* Error */, "Cannot_find_name_0_Did_you_mean_to_write_this_in_an_async_function_2311", "Cannot find name '{0}'. Did you mean to write this in an async function?"),
    An_interface_can_only_extend_an_object_type_or_intersection_of_object_types_with_statically_known_members: diag(2312, 1 /* Error */, "An_interface_can_only_extend_an_object_type_or_intersection_of_object_types_with_statically_known_me_2312", "An interface can only extend an object type or intersection of object types with statically known members."),
    Type_parameter_0_has_a_circular_constraint: diag(2313, 1 /* Error */, "Type_parameter_0_has_a_circular_constraint_2313", "Type parameter '{0}' has a circular constraint."),
    Generic_type_0_requires_1_type_argument_s: diag(2314, 1 /* Error */, "Generic_type_0_requires_1_type_argument_s_2314", "Generic type '{0}' requires {1} type argument(s)."),
    Type_0_is_not_generic: diag(2315, 1 /* Error */, "Type_0_is_not_generic_2315", "Type '{0}' is not generic."),
    Global_type_0_must_be_a_class_or_interface_type: diag(2316, 1 /* Error */, "Global_type_0_must_be_a_class_or_interface_type_2316", "Global type '{0}' must be a class or interface type."),
    Global_type_0_must_have_1_type_parameter_s: diag(2317, 1 /* Error */, "Global_type_0_must_have_1_type_parameter_s_2317", "Global type '{0}' must have {1} type parameter(s)."),
    Cannot_find_global_type_0: diag(2318, 1 /* Error */, "Cannot_find_global_type_0_2318", "Cannot find global type '{0}'."),
    Named_property_0_of_types_1_and_2_are_not_identical: diag(2319, 1 /* Error */, "Named_property_0_of_types_1_and_2_are_not_identical_2319", "Named property '{0}' of types '{1}' and '{2}' are not identical."),
    Interface_0_cannot_simultaneously_extend_types_1_and_2: diag(2320, 1 /* Error */, "Interface_0_cannot_simultaneously_extend_types_1_and_2_2320", "Interface '{0}' cannot simultaneously extend types '{1}' and '{2}'."),
    Excessive_stack_depth_comparing_types_0_and_1: diag(2321, 1 /* Error */, "Excessive_stack_depth_comparing_types_0_and_1_2321", "Excessive stack depth comparing types '{0}' and '{1}'."),
    Type_0_is_not_assignable_to_type_1: diag(2322, 1 /* Error */, "Type_0_is_not_assignable_to_type_1_2322", "Type '{0}' is not assignable to type '{1}'."),
    Cannot_redeclare_exported_variable_0: diag(2323, 1 /* Error */, "Cannot_redeclare_exported_variable_0_2323", "Cannot redeclare exported variable '{0}'."),
    Property_0_is_missing_in_type_1: diag(2324, 1 /* Error */, "Property_0_is_missing_in_type_1_2324", "Property '{0}' is missing in type '{1}'."),
    Property_0_is_private_in_type_1_but_not_in_type_2: diag(2325, 1 /* Error */, "Property_0_is_private_in_type_1_but_not_in_type_2_2325", "Property '{0}' is private in type '{1}' but not in type '{2}'."),
    Types_of_property_0_are_incompatible: diag(2326, 1 /* Error */, "Types_of_property_0_are_incompatible_2326", "Types of property '{0}' are incompatible."),
    Property_0_is_optional_in_type_1_but_required_in_type_2: diag(2327, 1 /* Error */, "Property_0_is_optional_in_type_1_but_required_in_type_2_2327", "Property '{0}' is optional in type '{1}' but required in type '{2}'."),
    Types_of_parameters_0_and_1_are_incompatible: diag(2328, 1 /* Error */, "Types_of_parameters_0_and_1_are_incompatible_2328", "Types of parameters '{0}' and '{1}' are incompatible."),
    Index_signature_for_type_0_is_missing_in_type_1: diag(2329, 1 /* Error */, "Index_signature_for_type_0_is_missing_in_type_1_2329", "Index signature for type '{0}' is missing in type '{1}'."),
    _0_and_1_index_signatures_are_incompatible: diag(2330, 1 /* Error */, "_0_and_1_index_signatures_are_incompatible_2330", "'{0}' and '{1}' index signatures are incompatible."),
    this_cannot_be_referenced_in_a_module_or_namespace_body: diag(2331, 1 /* Error */, "this_cannot_be_referenced_in_a_module_or_namespace_body_2331", "'this' cannot be referenced in a module or namespace body."),
    this_cannot_be_referenced_in_current_location: diag(2332, 1 /* Error */, "this_cannot_be_referenced_in_current_location_2332", "'this' cannot be referenced in current location."),
    this_cannot_be_referenced_in_constructor_arguments: diag(2333, 1 /* Error */, "this_cannot_be_referenced_in_constructor_arguments_2333", "'this' cannot be referenced in constructor arguments."),
    this_cannot_be_referenced_in_a_static_property_initializer: diag(2334, 1 /* Error */, "this_cannot_be_referenced_in_a_static_property_initializer_2334", "'this' cannot be referenced in a static property initializer."),
    super_can_only_be_referenced_in_a_derived_class: diag(2335, 1 /* Error */, "super_can_only_be_referenced_in_a_derived_class_2335", "'super' can only be referenced in a derived class."),
    super_cannot_be_referenced_in_constructor_arguments: diag(2336, 1 /* Error */, "super_cannot_be_referenced_in_constructor_arguments_2336", "'super' cannot be referenced in constructor arguments."),
    Super_calls_are_not_permitted_outside_constructors_or_in_nested_functions_inside_constructors: diag(2337, 1 /* Error */, "Super_calls_are_not_permitted_outside_constructors_or_in_nested_functions_inside_constructors_2337", "Super calls are not permitted outside constructors or in nested functions inside constructors."),
    super_property_access_is_permitted_only_in_a_constructor_member_function_or_member_accessor_of_a_derived_class: diag(2338, 1 /* Error */, "super_property_access_is_permitted_only_in_a_constructor_member_function_or_member_accessor_of_a_der_2338", "'super' property access is permitted only in a constructor, member function, or member accessor of a derived class."),
    Property_0_does_not_exist_on_type_1: diag(2339, 1 /* Error */, "Property_0_does_not_exist_on_type_1_2339", "Property '{0}' does not exist on type '{1}'."),
    Only_public_and_protected_methods_of_the_base_class_are_accessible_via_the_super_keyword: diag(2340, 1 /* Error */, "Only_public_and_protected_methods_of_the_base_class_are_accessible_via_the_super_keyword_2340", "Only public and protected methods of the base class are accessible via the 'super' keyword."),
    Property_0_is_private_and_only_accessible_within_class_1: diag(2341, 1 /* Error */, "Property_0_is_private_and_only_accessible_within_class_1_2341", "Property '{0}' is private and only accessible within class '{1}'."),
    This_syntax_requires_an_imported_helper_named_1_which_does_not_exist_in_0_Consider_upgrading_your_version_of_0: diag(2343, 1 /* Error */, "This_syntax_requires_an_imported_helper_named_1_which_does_not_exist_in_0_Consider_upgrading_your_ve_2343", "This syntax requires an imported helper named '{1}' which does not exist in '{0}'. Consider upgrading your version of '{0}'."),
    Type_0_does_not_satisfy_the_constraint_1: diag(2344, 1 /* Error */, "Type_0_does_not_satisfy_the_constraint_1_2344", "Type '{0}' does not satisfy the constraint '{1}'."),
    Argument_of_type_0_is_not_assignable_to_parameter_of_type_1: diag(2345, 1 /* Error */, "Argument_of_type_0_is_not_assignable_to_parameter_of_type_1_2345", "Argument of type '{0}' is not assignable to parameter of type '{1}'."),
    Untyped_function_calls_may_not_accept_type_arguments: diag(2347, 1 /* Error */, "Untyped_function_calls_may_not_accept_type_arguments_2347", "Untyped function calls may not accept type arguments."),
    Value_of_type_0_is_not_callable_Did_you_mean_to_include_new: diag(2348, 1 /* Error */, "Value_of_type_0_is_not_callable_Did_you_mean_to_include_new_2348", "Value of type '{0}' is not callable. Did you mean to include 'new'?"),
    This_expression_is_not_callable: diag(2349, 1 /* Error */, "This_expression_is_not_callable_2349", "This expression is not callable."),
    Only_a_void_function_can_be_called_with_the_new_keyword: diag(2350, 1 /* Error */, "Only_a_void_function_can_be_called_with_the_new_keyword_2350", "Only a void function can be called with the 'new' keyword."),
    This_expression_is_not_constructable: diag(2351, 1 /* Error */, "This_expression_is_not_constructable_2351", "This expression is not constructable."),
    Conversion_of_type_0_to_type_1_may_be_a_mistake_because_neither_type_sufficiently_overlaps_with_the_other_If_this_was_intentional_convert_the_expression_to_unknown_first: diag(2352, 1 /* Error */, "Conversion_of_type_0_to_type_1_may_be_a_mistake_because_neither_type_sufficiently_overlaps_with_the__2352", "Conversion of type '{0}' to type '{1}' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first."),
    Object_literal_may_only_specify_known_properties_and_0_does_not_exist_in_type_1: diag(2353, 1 /* Error */, "Object_literal_may_only_specify_known_properties_and_0_does_not_exist_in_type_1_2353", "Object literal may only specify known properties, and '{0}' does not exist in type '{1}'."),
    This_syntax_requires_an_imported_helper_but_module_0_cannot_be_found: diag(2354, 1 /* Error */, "This_syntax_requires_an_imported_helper_but_module_0_cannot_be_found_2354", "This syntax requires an imported helper but module '{0}' cannot be found."),
    A_function_whose_declared_type_is_neither_undefined_void_nor_any_must_return_a_value: diag(2355, 1 /* Error */, "A_function_whose_declared_type_is_neither_undefined_void_nor_any_must_return_a_value_2355", "A function whose declared type is neither 'undefined', 'void', nor 'any' must return a value."),
    An_arithmetic_operand_must_be_of_type_any_number_bigint_or_an_enum_type: diag(2356, 1 /* Error */, "An_arithmetic_operand_must_be_of_type_any_number_bigint_or_an_enum_type_2356", "An arithmetic operand must be of type 'any', 'number', 'bigint' or an enum type."),
    The_operand_of_an_increment_or_decrement_operator_must_be_a_variable_or_a_property_access: diag(2357, 1 /* Error */, "The_operand_of_an_increment_or_decrement_operator_must_be_a_variable_or_a_property_access_2357", "The operand of an increment or decrement operator must be a variable or a property access."),
    The_left_hand_side_of_an_instanceof_expression_must_be_of_type_any_an_object_type_or_a_type_parameter: diag(2358, 1 /* Error */, "The_left_hand_side_of_an_instanceof_expression_must_be_of_type_any_an_object_type_or_a_type_paramete_2358", "The left-hand side of an 'instanceof' expression must be of type 'any', an object type or a type parameter."),
    The_right_hand_side_of_an_instanceof_expression_must_be_either_of_type_any_a_class_function_or_other_type_assignable_to_the_Function_interface_type_or_an_object_type_with_a_Symbol_hasInstance_method: diag(2359, 1 /* Error */, "The_right_hand_side_of_an_instanceof_expression_must_be_either_of_type_any_a_class_function_or_other_2359", "The right-hand side of an 'instanceof' expression must be either of type 'any', a class, function, or other type assignable to the 'Function' interface type, or an object type with a 'Symbol.hasInstance' method."),
    The_left_hand_side_of_an_arithmetic_operation_must_be_of_type_any_number_bigint_or_an_enum_type: diag(2362, 1 /* Error */, "The_left_hand_side_of_an_arithmetic_operation_must_be_of_type_any_number_bigint_or_an_enum_type_2362", "The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type."),
    The_right_hand_side_of_an_arithmetic_operation_must_be_of_type_any_number_bigint_or_an_enum_type: diag(2363, 1 /* Error */, "The_right_hand_side_of_an_arithmetic_operation_must_be_of_type_any_number_bigint_or_an_enum_type_2363", "The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type."),
    The_left_hand_side_of_an_assignment_expression_must_be_a_variable_or_a_property_access: diag(2364, 1 /* Error */, "The_left_hand_side_of_an_assignment_expression_must_be_a_variable_or_a_property_access_2364", "The left-hand side of an assignment expression must be a variable or a property access."),
    Operator_0_cannot_be_applied_to_types_1_and_2: diag(2365, 1 /* Error */, "Operator_0_cannot_be_applied_to_types_1_and_2_2365", "Operator '{0}' cannot be applied to types '{1}' and '{2}'."),
    Function_lacks_ending_return_statement_and_return_type_does_not_include_undefined: diag(2366, 1 /* Error */, "Function_lacks_ending_return_statement_and_return_type_does_not_include_undefined_2366", "Function lacks ending return statement and return type does not include 'undefined'."),
    This_comparison_appears_to_be_unintentional_because_the_types_0_and_1_have_no_overlap: diag(2367, 1 /* Error */, "This_comparison_appears_to_be_unintentional_because_the_types_0_and_1_have_no_overlap_2367", "This comparison appears to be unintentional because the types '{0}' and '{1}' have no overlap."),
    Type_parameter_name_cannot_be_0: diag(2368, 1 /* Error */, "Type_parameter_name_cannot_be_0_2368", "Type parameter name cannot be '{0}'."),
    A_parameter_property_is_only_allowed_in_a_constructor_implementation: diag(2369, 1 /* Error */, "A_parameter_property_is_only_allowed_in_a_constructor_implementation_2369", "A parameter property is only allowed in a constructor implementation."),
    A_rest_parameter_must_be_of_an_array_type: diag(2370, 1 /* Error */, "A_rest_parameter_must_be_of_an_array_type_2370", "A rest parameter must be of an array type."),
    A_parameter_initializer_is_only_allowed_in_a_function_or_constructor_implementation: diag(2371, 1 /* Error */, "A_parameter_initializer_is_only_allowed_in_a_function_or_constructor_implementation_2371", "A parameter initializer is only allowed in a function or constructor implementation."),
    Parameter_0_cannot_reference_itself: diag(2372, 1 /* Error */, "Parameter_0_cannot_reference_itself_2372", "Parameter '{0}' cannot reference itself."),
    Parameter_0_cannot_reference_identifier_1_declared_after_it: diag(2373, 1 /* Error */, "Parameter_0_cannot_reference_identifier_1_declared_after_it_2373", "Parameter '{0}' cannot reference identifier '{1}' declared after it."),
    Duplicate_index_signature_for_type_0: diag(2374, 1 /* Error */, "Duplicate_index_signature_for_type_0_2374", "Duplicate index signature for type '{0}'."),
    Type_0_is_not_assignable_to_type_1_with_exactOptionalPropertyTypes_Colon_true_Consider_adding_undefined_to_the_types_of_the_target_s_properties: diag(2375, 1 /* Error */, "Type_0_is_not_assignable_to_type_1_with_exactOptionalPropertyTypes_Colon_true_Consider_adding_undefi_2375", "Type '{0}' is not assignable to type '{1}' with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the types of the target's properties."),
    A_super_call_must_be_the_first_statement_in_the_constructor_to_refer_to_super_or_this_when_a_derived_class_contains_initialized_properties_parameter_properties_or_private_identifiers: diag(2376, 1 /* Error */, "A_super_call_must_be_the_first_statement_in_the_constructor_to_refer_to_super_or_this_when_a_derived_2376", "A 'super' call must be the first statement in the constructor to refer to 'super' or 'this' when a derived class contains initialized properties, parameter properties, or private identifiers."),
    Constructors_for_derived_classes_must_contain_a_super_call: diag(2377, 1 /* Error */, "Constructors_for_derived_classes_must_contain_a_super_call_2377", "Constructors for derived classes must contain a 'super' call."),
    A_get_accessor_must_return_a_value: diag(2378, 1 /* Error */, "A_get_accessor_must_return_a_value_2378", "A 'get' accessor must return a value."),
    Argument_of_type_0_is_not_assignable_to_parameter_of_type_1_with_exactOptionalPropertyTypes_Colon_true_Consider_adding_undefined_to_the_types_of_the_target_s_properties: diag(2379, 1 /* Error */, "Argument_of_type_0_is_not_assignable_to_parameter_of_type_1_with_exactOptionalPropertyTypes_Colon_tr_2379", "Argument of type '{0}' is not assignable to parameter of type '{1}' with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the types of the target's properties."),
    Overload_signatures_must_all_be_exported_or_non_exported: diag(2383, 1 /* Error */, "Overload_signatures_must_all_be_exported_or_non_exported_2383", "Overload signatures must all be exported or non-exported."),
    Overload_signatures_must_all_be_ambient_or_non_ambient: diag(2384, 1 /* Error */, "Overload_signatures_must_all_be_ambient_or_non_ambient_2384", "Overload signatures must all be ambient or non-ambient."),
    Overload_signatures_must_all_be_public_private_or_protected: diag(2385, 1 /* Error */, "Overload_signatures_must_all_be_public_private_or_protected_2385", "Overload signatures must all be public, private or protected."),
    Overload_signatures_must_all_be_optional_or_required: diag(2386, 1 /* Error */, "Overload_signatures_must_all_be_optional_or_required_2386", "Overload signatures must all be optional or required."),
    Function_overload_must_be_static: diag(2387, 1 /* Error */, "Function_overload_must_be_static_2387", "Function overload must be static."),
    Function_overload_must_not_be_static: diag(2388, 1 /* Error */, "Function_overload_must_not_be_static_2388", "Function overload must not be static."),
    Function_implementation_name_must_be_0: diag(2389, 1 /* Error */, "Function_implementation_name_must_be_0_2389", "Function implementation name must be '{0}'."),
    Constructor_implementation_is_missing: diag(2390, 1 /* Error */, "Constructor_implementation_is_missing_2390", "Constructor implementation is missing."),
    Function_implementation_is_missing_or_not_immediately_following_the_declaration: diag(2391, 1 /* Error */, "Function_implementation_is_missing_or_not_immediately_following_the_declaration_2391", "Function implementation is missing or not immediately following the declaration."),
    Multiple_constructor_implementations_are_not_allowed: diag(2392, 1 /* Error */, "Multiple_constructor_implementations_are_not_allowed_2392", "Multiple constructor implementations are not allowed."),
    Duplicate_function_implementation: diag(2393, 1 /* Error */, "Duplicate_function_implementation_2393", "Duplicate function implementation."),
    This_overload_signature_is_not_compatible_with_its_implementation_signature: diag(2394, 1 /* Error */, "This_overload_signature_is_not_compatible_with_its_implementation_signature_2394", "This overload signature is not compatible with its implementation signature."),
    Individual_declarations_in_merged_declaration_0_must_be_all_exported_or_all_local: diag(2395, 1 /* Error */, "Individual_declarations_in_merged_declaration_0_must_be_all_exported_or_all_local_2395", "Individual declarations in merged declaration '{0}' must be all exported or all local."),
    Duplicate_identifier_arguments_Compiler_uses_arguments_to_initialize_rest_parameters: diag(2396, 1 /* Error */, "Duplicate_identifier_arguments_Compiler_uses_arguments_to_initialize_rest_parameters_2396", "Duplicate identifier 'arguments'. Compiler uses 'arguments' to initialize rest parameters."),
    Declaration_name_conflicts_with_built_in_global_identifier_0: diag(2397, 1 /* Error */, "Declaration_name_conflicts_with_built_in_global_identifier_0_2397", "Declaration name conflicts with built-in global identifier '{0}'."),
    constructor_cannot_be_used_as_a_parameter_property_name: diag(2398, 1 /* Error */, "constructor_cannot_be_used_as_a_parameter_property_name_2398", "'constructor' cannot be used as a parameter property name."),
    Duplicate_identifier_this_Compiler_uses_variable_declaration_this_to_capture_this_reference: diag(2399, 1 /* Error */, "Duplicate_identifier_this_Compiler_uses_variable_declaration_this_to_capture_this_reference_2399", "Duplicate identifier '_this'. Compiler uses variable declaration '_this' to capture 'this' reference."),
    Expression_resolves_to_variable_declaration_this_that_compiler_uses_to_capture_this_reference: diag(2400, 1 /* Error */, "Expression_resolves_to_variable_declaration_this_that_compiler_uses_to_capture_this_reference_2400", "Expression resolves to variable declaration '_this' that compiler uses to capture 'this' reference."),
    A_super_call_must_be_a_root_level_statement_within_a_constructor_of_a_derived_class_that_contains_initialized_properties_parameter_properties_or_private_identifiers: diag(2401, 1 /* Error */, "A_super_call_must_be_a_root_level_statement_within_a_constructor_of_a_derived_class_that_contains_in_2401", "A 'super' call must be a root-level statement within a constructor of a derived class that contains initialized properties, parameter properties, or private identifiers."),
    Expression_resolves_to_super_that_compiler_uses_to_capture_base_class_reference: diag(2402, 1 /* Error */, "Expression_resolves_to_super_that_compiler_uses_to_capture_base_class_reference_2402", "Expression resolves to '_super' that compiler uses to capture base class reference."),
    Subsequent_variable_declarations_must_have_the_same_type_Variable_0_must_be_of_type_1_but_here_has_type_2: diag(2403, 1 /* Error */, "Subsequent_variable_declarations_must_have_the_same_type_Variable_0_must_be_of_type_1_but_here_has_t_2403", "Subsequent variable declarations must have the same type.  Variable '{0}' must be of type '{1}', but here has type '{2}'."),
    The_left_hand_side_of_a_for_in_statement_cannot_use_a_type_annotation: diag(2404, 1 /* Error */, "The_left_hand_side_of_a_for_in_statement_cannot_use_a_type_annotation_2404", "The left-hand side of a 'for...in' statement cannot use a type annotation."),
    The_left_hand_side_of_a_for_in_statement_must_be_of_type_string_or_any: diag(2405, 1 /* Error */, "The_left_hand_side_of_a_for_in_statement_must_be_of_type_string_or_any_2405", "The left-hand side of a 'for...in' statement must be of type 'string' or 'any'."),
    The_left_hand_side_of_a_for_in_statement_must_be_a_variable_or_a_property_access: diag(2406, 1 /* Error */, "The_left_hand_side_of_a_for_in_statement_must_be_a_variable_or_a_property_access_2406", "The left-hand side of a 'for...in' statement must be a variable or a property access."),
    The_right_hand_side_of_a_for_in_statement_must_be_of_type_any_an_object_type_or_a_type_parameter_but_here_has_type_0: diag(2407, 1 /* Error */, "The_right_hand_side_of_a_for_in_statement_must_be_of_type_any_an_object_type_or_a_type_parameter_but_2407", "The right-hand side of a 'for...in' statement must be of type 'any', an object type or a type parameter, but here has type '{0}'."),
    Setters_cannot_return_a_value: diag(2408, 1 /* Error */, "Setters_cannot_return_a_value_2408", "Setters cannot return a value."),
    Return_type_of_constructor_signature_must_be_assignable_to_the_instance_type_of_the_class: diag(2409, 1 /* Error */, "Return_type_of_constructor_signature_must_be_assignable_to_the_instance_type_of_the_class_2409", "Return type of constructor signature must be assignable to the instance type of the class."),
    The_with_statement_is_not_supported_All_symbols_in_a_with_block_will_have_type_any: diag(2410, 1 /* Error */, "The_with_statement_is_not_supported_All_symbols_in_a_with_block_will_have_type_any_2410", "The 'with' statement is not supported. All symbols in a 'with' block will have type 'any'."),
    Type_0_is_not_assignable_to_type_1_with_exactOptionalPropertyTypes_Colon_true_Consider_adding_undefined_to_the_type_of_the_target: diag(2412, 1 /* Error */, "Type_0_is_not_assignable_to_type_1_with_exactOptionalPropertyTypes_Colon_true_Consider_adding_undefi_2412", "Type '{0}' is not assignable to type '{1}' with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the type of the target."),
    Property_0_of_type_1_is_not_assignable_to_2_index_type_3: diag(2411, 1 /* Error */, "Property_0_of_type_1_is_not_assignable_to_2_index_type_3_2411", "Property '{0}' of type '{1}' is not assignable to '{2}' index type '{3}'."),
    _0_index_type_1_is_not_assignable_to_2_index_type_3: diag(2413, 1 /* Error */, "_0_index_type_1_is_not_assignable_to_2_index_type_3_2413", "'{0}' index type '{1}' is not assignable to '{2}' index type '{3}'."),
    Class_name_cannot_be_0: diag(2414, 1 /* Error */, "Class_name_cannot_be_0_2414", "Class name cannot be '{0}'."),
    Class_0_incorrectly_extends_base_class_1: diag(2415, 1 /* Error */, "Class_0_incorrectly_extends_base_class_1_2415", "Class '{0}' incorrectly extends base class '{1}'."),
    Property_0_in_type_1_is_not_assignable_to_the_same_property_in_base_type_2: diag(2416, 1 /* Error */, "Property_0_in_type_1_is_not_assignable_to_the_same_property_in_base_type_2_2416", "Property '{0}' in type '{1}' is not assignable to the same property in base type '{2}'."),
    Class_static_side_0_incorrectly_extends_base_class_static_side_1: diag(2417, 1 /* Error */, "Class_static_side_0_incorrectly_extends_base_class_static_side_1_2417", "Class static side '{0}' incorrectly extends base class static side '{1}'."),
    Type_of_computed_property_s_value_is_0_which_is_not_assignable_to_type_1: diag(2418, 1 /* Error */, "Type_of_computed_property_s_value_is_0_which_is_not_assignable_to_type_1_2418", "Type of computed property's value is '{0}', which is not assignable to type '{1}'."),
    Types_of_construct_signatures_are_incompatible: diag(2419, 1 /* Error */, "Types_of_construct_signatures_are_incompatible_2419", "Types of construct signatures are incompatible."),
    Class_0_incorrectly_implements_interface_1: diag(2420, 1 /* Error */, "Class_0_incorrectly_implements_interface_1_2420", "Class '{0}' incorrectly implements interface '{1}'."),
    A_class_can_only_implement_an_object_type_or_intersection_of_object_types_with_statically_known_members: diag(2422, 1 /* Error */, "A_class_can_only_implement_an_object_type_or_intersection_of_object_types_with_statically_known_memb_2422", "A class can only implement an object type or intersection of object types with statically known members."),
    Class_0_defines_instance_member_function_1_but_extended_class_2_defines_it_as_instance_member_accessor: diag(2423, 1 /* Error */, "Class_0_defines_instance_member_function_1_but_extended_class_2_defines_it_as_instance_member_access_2423", "Class '{0}' defines instance member function '{1}', but extended class '{2}' defines it as instance member accessor."),
    Class_0_defines_instance_member_property_1_but_extended_class_2_defines_it_as_instance_member_function: diag(2425, 1 /* Error */, "Class_0_defines_instance_member_property_1_but_extended_class_2_defines_it_as_instance_member_functi_2425", "Class '{0}' defines instance member property '{1}', but extended class '{2}' defines it as instance member function."),
    Class_0_defines_instance_member_accessor_1_but_extended_class_2_defines_it_as_instance_member_function: diag(2426, 1 /* Error */, "Class_0_defines_instance_member_accessor_1_but_extended_class_2_defines_it_as_instance_member_functi_2426", "Class '{0}' defines instance member accessor '{1}', but extended class '{2}' defines it as instance member function."),
    Interface_name_cannot_be_0: diag(2427, 1 /* Error */, "Interface_name_cannot_be_0_2427", "Interface name cannot be '{0}'."),
    All_declarations_of_0_must_have_identical_type_parameters: diag(2428, 1 /* Error */, "All_declarations_of_0_must_have_identical_type_parameters_2428", "All declarations of '{0}' must have identical type parameters."),
    Interface_0_incorrectly_extends_interface_1: diag(2430, 1 /* Error */, "Interface_0_incorrectly_extends_interface_1_2430", "Interface '{0}' incorrectly extends interface '{1}'."),
    Enum_name_cannot_be_0: diag(2431, 1 /* Error */, "Enum_name_cannot_be_0_2431", "Enum name cannot be '{0}'."),
    In_an_enum_with_multiple_declarations_only_one_declaration_can_omit_an_initializer_for_its_first_enum_element: diag(2432, 1 /* Error */, "In_an_enum_with_multiple_declarations_only_one_declaration_can_omit_an_initializer_for_its_first_enu_2432", "In an enum with multiple declarations, only one declaration can omit an initializer for its first enum element."),
    A_namespace_declaration_cannot_be_in_a_different_file_from_a_class_or_function_with_which_it_is_merged: diag(2433, 1 /* Error */, "A_namespace_declaration_cannot_be_in_a_different_file_from_a_class_or_function_with_which_it_is_merg_2433", "A namespace declaration cannot be in a different file from a class or function with which it is merged."),
    A_namespace_declaration_cannot_be_located_prior_to_a_class_or_function_with_which_it_is_merged: diag(2434, 1 /* Error */, "A_namespace_declaration_cannot_be_located_prior_to_a_class_or_function_with_which_it_is_merged_2434", "A namespace declaration cannot be located prior to a class or function with which it is merged."),
    Ambient_modules_cannot_be_nested_in_other_modules_or_namespaces: diag(2435, 1 /* Error */, "Ambient_modules_cannot_be_nested_in_other_modules_or_namespaces_2435", "Ambient modules cannot be nested in other modules or namespaces."),
    Ambient_module_declaration_cannot_specify_relative_module_name: diag(2436, 1 /* Error */, "Ambient_module_declaration_cannot_specify_relative_module_name_2436", "Ambient module declaration cannot specify relative module name."),
    Module_0_is_hidden_by_a_local_declaration_with_the_same_name: diag(2437, 1 /* Error */, "Module_0_is_hidden_by_a_local_declaration_with_the_same_name_2437", "Module '{0}' is hidden by a local declaration with the same name."),
    Import_name_cannot_be_0: diag(2438, 1 /* Error */, "Import_name_cannot_be_0_2438", "Import name cannot be '{0}'."),
    Import_or_export_declaration_in_an_ambient_module_declaration_cannot_reference_module_through_relative_module_name: diag(2439, 1 /* Error */, "Import_or_export_declaration_in_an_ambient_module_declaration_cannot_reference_module_through_relati_2439", "Import or export declaration in an ambient module declaration cannot reference module through relative module name."),
    Import_declaration_conflicts_with_local_declaration_of_0: diag(2440, 1 /* Error */, "Import_declaration_conflicts_with_local_declaration_of_0_2440", "Import declaration conflicts with local declaration of '{0}'."),
    Duplicate_identifier_0_Compiler_reserves_name_1_in_top_level_scope_of_a_module: diag(2441, 1 /* Error */, "Duplicate_identifier_0_Compiler_reserves_name_1_in_top_level_scope_of_a_module_2441", "Duplicate identifier '{0}'. Compiler reserves name '{1}' in top level scope of a module."),
    Types_have_separate_declarations_of_a_private_property_0: diag(2442, 1 /* Error */, "Types_have_separate_declarations_of_a_private_property_0_2442", "Types have separate declarations of a private property '{0}'."),
    Property_0_is_protected_but_type_1_is_not_a_class_derived_from_2: diag(2443, 1 /* Error */, "Property_0_is_protected_but_type_1_is_not_a_class_derived_from_2_2443", "Property '{0}' is protected but type '{1}' is not a class derived from '{2}'."),
    Property_0_is_protected_in_type_1_but_public_in_type_2: diag(2444, 1 /* Error */, "Property_0_is_protected_in_type_1_but_public_in_type_2_2444", "Property '{0}' is protected in type '{1}' but public in type '{2}'."),
    Property_0_is_protected_and_only_accessible_within_class_1_and_its_subclasses: diag(2445, 1 /* Error */, "Property_0_is_protected_and_only_accessible_within_class_1_and_its_subclasses_2445", "Property '{0}' is protected and only accessible within class '{1}' and its subclasses."),
    Property_0_is_protected_and_only_accessible_through_an_instance_of_class_1_This_is_an_instance_of_class_2: diag(2446, 1 /* Error */, "Property_0_is_protected_and_only_accessible_through_an_instance_of_class_1_This_is_an_instance_of_cl_2446", "Property '{0}' is protected and only accessible through an instance of class '{1}'. This is an instance of class '{2}'."),
    The_0_operator_is_not_allowed_for_boolean_types_Consider_using_1_instead: diag(2447, 1 /* Error */, "The_0_operator_is_not_allowed_for_boolean_types_Consider_using_1_instead_2447", "The '{0}' operator is not allowed for boolean types. Consider using '{1}' instead."),
    Block_scoped_variable_0_used_before_its_declaration: diag(2448, 1 /* Error */, "Block_scoped_variable_0_used_before_its_declaration_2448", "Block-scoped variable '{0}' used before its declaration."),
    Class_0_used_before_its_declaration: diag(2449, 1 /* Error */, "Class_0_used_before_its_declaration_2449", "Class '{0}' used before its declaration."),
    Enum_0_used_before_its_declaration: diag(2450, 1 /* Error */, "Enum_0_used_before_its_declaration_2450", "Enum '{0}' used before its declaration."),
    Cannot_redeclare_block_scoped_variable_0: diag(2451, 1 /* Error */, "Cannot_redeclare_block_scoped_variable_0_2451", "Cannot redeclare block-scoped variable '{0}'."),
    An_enum_member_cannot_have_a_numeric_name: diag(2452, 1 /* Error */, "An_enum_member_cannot_have_a_numeric_name_2452", "An enum member cannot have a numeric name."),
    Variable_0_is_used_before_being_assigned: diag(2454, 1 /* Error */, "Variable_0_is_used_before_being_assigned_2454", "Variable '{0}' is used before being assigned."),
    Type_alias_0_circularly_references_itself: diag(2456, 1 /* Error */, "Type_alias_0_circularly_references_itself_2456", "Type alias '{0}' circularly references itself."),
    Type_alias_name_cannot_be_0: diag(2457, 1 /* Error */, "Type_alias_name_cannot_be_0_2457", "Type alias name cannot be '{0}'."),
    An_AMD_module_cannot_have_multiple_name_assignments: diag(2458, 1 /* Error */, "An_AMD_module_cannot_have_multiple_name_assignments_2458", "An AMD module cannot have multiple name assignments."),
    Module_0_declares_1_locally_but_it_is_not_exported: diag(2459, 1 /* Error */, "Module_0_declares_1_locally_but_it_is_not_exported_2459", "Module '{0}' declares '{1}' locally, but it is not exported."),
    Module_0_declares_1_locally_but_it_is_exported_as_2: diag(2460, 1 /* Error */, "Module_0_declares_1_locally_but_it_is_exported_as_2_2460", "Module '{0}' declares '{1}' locally, but it is exported as '{2}'."),
    Type_0_is_not_an_array_type: diag(2461, 1 /* Error */, "Type_0_is_not_an_array_type_2461", "Type '{0}' is not an array type."),
    A_rest_element_must_be_last_in_a_destructuring_pattern: diag(2462, 1 /* Error */, "A_rest_element_must_be_last_in_a_destructuring_pattern_2462", "A rest element must be last in a destructuring pattern."),
    A_binding_pattern_parameter_cannot_be_optional_in_an_implementation_signature: diag(2463, 1 /* Error */, "A_binding_pattern_parameter_cannot_be_optional_in_an_implementation_signature_2463", "A binding pattern parameter cannot be optional in an implementation signature."),
    A_computed_property_name_must_be_of_type_string_number_symbol_or_any: diag(2464, 1 /* Error */, "A_computed_property_name_must_be_of_type_string_number_symbol_or_any_2464", "A computed property name must be of type 'string', 'number', 'symbol', or 'any'."),
    this_cannot_be_referenced_in_a_computed_property_name: diag(2465, 1 /* Error */, "this_cannot_be_referenced_in_a_computed_property_name_2465", "'this' cannot be referenced in a computed property name."),
    super_cannot_be_referenced_in_a_computed_property_name: diag(2466, 1 /* Error */, "super_cannot_be_referenced_in_a_computed_property_name_2466", "'super' cannot be referenced in a computed property name."),
    A_computed_property_name_cannot_reference_a_type_parameter_from_its_containing_type: diag(2467, 1 /* Error */, "A_computed_property_name_cannot_reference_a_type_parameter_from_its_containing_type_2467", "A computed property name cannot reference a type parameter from its containing type."),
    Cannot_find_global_value_0: diag(2468, 1 /* Error */, "Cannot_find_global_value_0_2468", "Cannot find global value '{0}'."),
    The_0_operator_cannot_be_applied_to_type_symbol: diag(2469, 1 /* Error */, "The_0_operator_cannot_be_applied_to_type_symbol_2469", "The '{0}' operator cannot be applied to type 'symbol'."),
    Spread_operator_in_new_expressions_is_only_available_when_targeting_ECMAScript_5_and_higher: diag(2472, 1 /* Error */, "Spread_operator_in_new_expressions_is_only_available_when_targeting_ECMAScript_5_and_higher_2472", "Spread operator in 'new' expressions is only available when targeting ECMAScript 5 and higher."),
    Enum_declarations_must_all_be_const_or_non_const: diag(2473, 1 /* Error */, "Enum_declarations_must_all_be_const_or_non_const_2473", "Enum declarations must all be const or non-const."),
    const_enum_member_initializers_must_be_constant_expressions: diag(2474, 1 /* Error */, "const_enum_member_initializers_must_be_constant_expressions_2474", "const enum member initializers must be constant expressions."),
    const_enums_can_only_be_used_in_property_or_index_access_expressions_or_the_right_hand_side_of_an_import_declaration_or_export_assignment_or_type_query: diag(2475, 1 /* Error */, "const_enums_can_only_be_used_in_property_or_index_access_expressions_or_the_right_hand_side_of_an_im_2475", "'const' enums can only be used in property or index access expressions or the right hand side of an import declaration or export assignment or type query."),
    A_const_enum_member_can_only_be_accessed_using_a_string_literal: diag(2476, 1 /* Error */, "A_const_enum_member_can_only_be_accessed_using_a_string_literal_2476", "A const enum member can only be accessed using a string literal."),
    const_enum_member_initializer_was_evaluated_to_a_non_finite_value: diag(2477, 1 /* Error */, "const_enum_member_initializer_was_evaluated_to_a_non_finite_value_2477", "'const' enum member initializer was evaluated to a non-finite value."),
    const_enum_member_initializer_was_evaluated_to_disallowed_value_NaN: diag(2478, 1 /* Error */, "const_enum_member_initializer_was_evaluated_to_disallowed_value_NaN_2478", "'const' enum member initializer was evaluated to disallowed value 'NaN'."),
    let_is_not_allowed_to_be_used_as_a_name_in_let_or_const_declarations: diag(2480, 1 /* Error */, "let_is_not_allowed_to_be_used_as_a_name_in_let_or_const_declarations_2480", "'let' is not allowed to be used as a name in 'let' or 'const' declarations."),
    Cannot_initialize_outer_scoped_variable_0_in_the_same_scope_as_block_scoped_declaration_1: diag(2481, 1 /* Error */, "Cannot_initialize_outer_scoped_variable_0_in_the_same_scope_as_block_scoped_declaration_1_2481", "Cannot initialize outer scoped variable '{0}' in the same scope as block scoped declaration '{1}'."),
    The_left_hand_side_of_a_for_of_statement_cannot_use_a_type_annotation: diag(2483, 1 /* Error */, "The_left_hand_side_of_a_for_of_statement_cannot_use_a_type_annotation_2483", "The left-hand side of a 'for...of' statement cannot use a type annotation."),
    Export_declaration_conflicts_with_exported_declaration_of_0: diag(2484, 1 /* Error */, "Export_declaration_conflicts_with_exported_declaration_of_0_2484", "Export declaration conflicts with exported declaration of '{0}'."),
    The_left_hand_side_of_a_for_of_statement_must_be_a_variable_or_a_property_access: diag(2487, 1 /* Error */, "The_left_hand_side_of_a_for_of_statement_must_be_a_variable_or_a_property_access_2487", "The left-hand side of a 'for...of' statement must be a variable or a property access."),
    Type_0_must_have_a_Symbol_iterator_method_that_returns_an_iterator: diag(2488, 1 /* Error */, "Type_0_must_have_a_Symbol_iterator_method_that_returns_an_iterator_2488", "Type '{0}' must have a '[Symbol.iterator]()' method that returns an iterator."),
    An_iterator_must_have_a_next_method: diag(2489, 1 /* Error */, "An_iterator_must_have_a_next_method_2489", "An iterator must have a 'next()' method."),
    The_type_returned_by_the_0_method_of_an_iterator_must_have_a_value_property: diag(2490, 1 /* Error */, "The_type_returned_by_the_0_method_of_an_iterator_must_have_a_value_property_2490", "The type returned by the '{0}()' method of an iterator must have a 'value' property."),
    The_left_hand_side_of_a_for_in_statement_cannot_be_a_destructuring_pattern: diag(2491, 1 /* Error */, "The_left_hand_side_of_a_for_in_statement_cannot_be_a_destructuring_pattern_2491", "The left-hand side of a 'for...in' statement cannot be a destructuring pattern."),
    Cannot_redeclare_identifier_0_in_catch_clause: diag(2492, 1 /* Error */, "Cannot_redeclare_identifier_0_in_catch_clause_2492", "Cannot redeclare identifier '{0}' in catch clause."),
    Tuple_type_0_of_length_1_has_no_element_at_index_2: diag(2493, 1 /* Error */, "Tuple_type_0_of_length_1_has_no_element_at_index_2_2493", "Tuple type '{0}' of length '{1}' has no element at index '{2}'."),
    Using_a_string_in_a_for_of_statement_is_only_supported_in_ECMAScript_5_and_higher: diag(2494, 1 /* Error */, "Using_a_string_in_a_for_of_statement_is_only_supported_in_ECMAScript_5_and_higher_2494", "Using a string in a 'for...of' statement is only supported in ECMAScript 5 and higher."),
    Type_0_is_not_an_array_type_or_a_string_type: diag(2495, 1 /* Error */, "Type_0_is_not_an_array_type_or_a_string_type_2495", "Type '{0}' is not an array type or a string type."),
    The_arguments_object_cannot_be_referenced_in_an_arrow_function_in_ES3_and_ES5_Consider_using_a_standard_function_expression: diag(2496, 1 /* Error */, "The_arguments_object_cannot_be_referenced_in_an_arrow_function_in_ES3_and_ES5_Consider_using_a_stand_2496", "The 'arguments' object cannot be referenced in an arrow function in ES3 and ES5. Consider using a standard function expression."),
    This_module_can_only_be_referenced_with_ECMAScript_imports_Slashexports_by_turning_on_the_0_flag_and_referencing_its_default_export: diag(2497, 1 /* Error */, "This_module_can_only_be_referenced_with_ECMAScript_imports_Slashexports_by_turning_on_the_0_flag_and_2497", "This module can only be referenced with ECMAScript imports/exports by turning on the '{0}' flag and referencing its default export."),
    Module_0_uses_export_and_cannot_be_used_with_export_Asterisk: diag(2498, 1 /* Error */, "Module_0_uses_export_and_cannot_be_used_with_export_Asterisk_2498", "Module '{0}' uses 'export =' and cannot be used with 'export *'."),
    An_interface_can_only_extend_an_identifier_Slashqualified_name_with_optional_type_arguments: diag(2499, 1 /* Error */, "An_interface_can_only_extend_an_identifier_Slashqualified_name_with_optional_type_arguments_2499", "An interface can only extend an identifier/qualified-name with optional type arguments."),
    A_class_can_only_implement_an_identifier_Slashqualified_name_with_optional_type_arguments: diag(2500, 1 /* Error */, "A_class_can_only_implement_an_identifier_Slashqualified_name_with_optional_type_arguments_2500", "A class can only implement an identifier/qualified-name with optional type arguments."),
    A_rest_element_cannot_contain_a_binding_pattern: diag(2501, 1 /* Error */, "A_rest_element_cannot_contain_a_binding_pattern_2501", "A rest element cannot contain a binding pattern."),
    _0_is_referenced_directly_or_indirectly_in_its_own_type_annotation: diag(2502, 1 /* Error */, "_0_is_referenced_directly_or_indirectly_in_its_own_type_annotation_2502", "'{0}' is referenced directly or indirectly in its own type annotation."),
    Cannot_find_namespace_0: diag(2503, 1 /* Error */, "Cannot_find_namespace_0_2503", "Cannot find namespace '{0}'."),
    Type_0_must_have_a_Symbol_asyncIterator_method_that_returns_an_async_iterator: diag(2504, 1 /* Error */, "Type_0_must_have_a_Symbol_asyncIterator_method_that_returns_an_async_iterator_2504", "Type '{0}' must have a '[Symbol.asyncIterator]()' method that returns an async iterator."),
    A_generator_cannot_have_a_void_type_annotation: diag(2505, 1 /* Error */, "A_generator_cannot_have_a_void_type_annotation_2505", "A generator cannot have a 'void' type annotation."),
    _0_is_referenced_directly_or_indirectly_in_its_own_base_expression: diag(2506, 1 /* Error */, "_0_is_referenced_directly_or_indirectly_in_its_own_base_expression_2506", "'{0}' is referenced directly or indirectly in its own base expression."),
    Type_0_is_not_a_constructor_function_type: diag(2507, 1 /* Error */, "Type_0_is_not_a_constructor_function_type_2507", "Type '{0}' is not a constructor function type."),
    No_base_constructor_has_the_specified_number_of_type_arguments: diag(2508, 1 /* Error */, "No_base_constructor_has_the_specified_number_of_type_arguments_2508", "No base constructor has the specified number of type arguments."),
    Base_constructor_return_type_0_is_not_an_object_type_or_intersection_of_object_types_with_statically_known_members: diag(2509, 1 /* Error */, "Base_constructor_return_type_0_is_not_an_object_type_or_intersection_of_object_types_with_statically_2509", "Base constructor return type '{0}' is not an object type or intersection of object types with statically known members."),
    Base_constructors_must_all_have_the_same_return_type: diag(2510, 1 /* Error */, "Base_constructors_must_all_have_the_same_return_type_2510", "Base constructors must all have the same return type."),
    Cannot_create_an_instance_of_an_abstract_class: diag(2511, 1 /* Error */, "Cannot_create_an_instance_of_an_abstract_class_2511", "Cannot create an instance of an abstract class."),
    Overload_signatures_must_all_be_abstract_or_non_abstract: diag(2512, 1 /* Error */, "Overload_signatures_must_all_be_abstract_or_non_abstract_2512", "Overload signatures must all be abstract or non-abstract."),
    Abstract_method_0_in_class_1_cannot_be_accessed_via_super_expression: diag(2513, 1 /* Error */, "Abstract_method_0_in_class_1_cannot_be_accessed_via_super_expression_2513", "Abstract method '{0}' in class '{1}' cannot be accessed via super expression."),
    A_tuple_type_cannot_be_indexed_with_a_negative_value: diag(2514, 1 /* Error */, "A_tuple_type_cannot_be_indexed_with_a_negative_value_2514", "A tuple type cannot be indexed with a negative value."),
    Non_abstract_class_0_does_not_implement_inherited_abstract_member_1_from_class_2: diag(2515, 1 /* Error */, "Non_abstract_class_0_does_not_implement_inherited_abstract_member_1_from_class_2_2515", "Non-abstract class '{0}' does not implement inherited abstract member '{1}' from class '{2}'."),
    All_declarations_of_an_abstract_method_must_be_consecutive: diag(2516, 1 /* Error */, "All_declarations_of_an_abstract_method_must_be_consecutive_2516", "All declarations of an abstract method must be consecutive."),
    Cannot_assign_an_abstract_constructor_type_to_a_non_abstract_constructor_type: diag(2517, 1 /* Error */, "Cannot_assign_an_abstract_constructor_type_to_a_non_abstract_constructor_type_2517", "Cannot assign an abstract constructor type to a non-abstract constructor type."),
    A_this_based_type_guard_is_not_compatible_with_a_parameter_based_type_guard: diag(2518, 1 /* Error */, "A_this_based_type_guard_is_not_compatible_with_a_parameter_based_type_guard_2518", "A 'this'-based type guard is not compatible with a parameter-based type guard."),
    An_async_iterator_must_have_a_next_method: diag(2519, 1 /* Error */, "An_async_iterator_must_have_a_next_method_2519", "An async iterator must have a 'next()' method."),
    Duplicate_identifier_0_Compiler_uses_declaration_1_to_support_async_functions: diag(2520, 1 /* Error */, "Duplicate_identifier_0_Compiler_uses_declaration_1_to_support_async_functions_2520", "Duplicate identifier '{0}'. Compiler uses declaration '{1}' to support async functions."),
    The_arguments_object_cannot_be_referenced_in_an_async_function_or_method_in_ES3_and_ES5_Consider_using_a_standard_function_or_method: diag(2522, 1 /* Error */, "The_arguments_object_cannot_be_referenced_in_an_async_function_or_method_in_ES3_and_ES5_Consider_usi_2522", "The 'arguments' object cannot be referenced in an async function or method in ES3 and ES5. Consider using a standard function or method."),
    yield_expressions_cannot_be_used_in_a_parameter_initializer: diag(2523, 1 /* Error */, "yield_expressions_cannot_be_used_in_a_parameter_initializer_2523", "'yield' expressions cannot be used in a parameter initializer."),
    await_expressions_cannot_be_used_in_a_parameter_initializer: diag(2524, 1 /* Error */, "await_expressions_cannot_be_used_in_a_parameter_initializer_2524", "'await' expressions cannot be used in a parameter initializer."),
    Initializer_provides_no_value_for_this_binding_element_and_the_binding_element_has_no_default_value: diag(2525, 1 /* Error */, "Initializer_provides_no_value_for_this_binding_element_and_the_binding_element_has_no_default_value_2525", "Initializer provides no value for this binding element and the binding element has no default value."),
    A_this_type_is_available_only_in_a_non_static_member_of_a_class_or_interface: diag(2526, 1 /* Error */, "A_this_type_is_available_only_in_a_non_static_member_of_a_class_or_interface_2526", "A 'this' type is available only in a non-static member of a class or interface."),
    The_inferred_type_of_0_references_an_inaccessible_1_type_A_type_annotation_is_necessary: diag(2527, 1 /* Error */, "The_inferred_type_of_0_references_an_inaccessible_1_type_A_type_annotation_is_necessary_2527", "The inferred type of '{0}' references an inaccessible '{1}' type. A type annotation is necessary."),
    A_module_cannot_have_multiple_default_exports: diag(2528, 1 /* Error */, "A_module_cannot_have_multiple_default_exports_2528", "A module cannot have multiple default exports."),
    Duplicate_identifier_0_Compiler_reserves_name_1_in_top_level_scope_of_a_module_containing_async_functions: diag(2529, 1 /* Error */, "Duplicate_identifier_0_Compiler_reserves_name_1_in_top_level_scope_of_a_module_containing_async_func_2529", "Duplicate identifier '{0}'. Compiler reserves name '{1}' in top level scope of a module containing async functions."),
    Property_0_is_incompatible_with_index_signature: diag(2530, 1 /* Error */, "Property_0_is_incompatible_with_index_signature_2530", "Property '{0}' is incompatible with index signature."),
    Object_is_possibly_null: diag(2531, 1 /* Error */, "Object_is_possibly_null_2531", "Object is possibly 'null'."),
    Object_is_possibly_undefined: diag(2532, 1 /* Error */, "Object_is_possibly_undefined_2532", "Object is possibly 'undefined'."),
    Object_is_possibly_null_or_undefined: diag(2533, 1 /* Error */, "Object_is_possibly_null_or_undefined_2533", "Object is possibly 'null' or 'undefined'."),
    A_function_returning_never_cannot_have_a_reachable_end_point: diag(2534, 1 /* Error */, "A_function_returning_never_cannot_have_a_reachable_end_point_2534", "A function returning 'never' cannot have a reachable end point."),
    Type_0_cannot_be_used_to_index_type_1: diag(2536, 1 /* Error */, "Type_0_cannot_be_used_to_index_type_1_2536", "Type '{0}' cannot be used to index type '{1}'."),
    Type_0_has_no_matching_index_signature_for_type_1: diag(2537, 1 /* Error */, "Type_0_has_no_matching_index_signature_for_type_1_2537", "Type '{0}' has no matching index signature for type '{1}'."),
    Type_0_cannot_be_used_as_an_index_type: diag(2538, 1 /* Error */, "Type_0_cannot_be_used_as_an_index_type_2538", "Type '{0}' cannot be used as an index type."),
    Cannot_assign_to_0_because_it_is_not_a_variable: diag(2539, 1 /* Error */, "Cannot_assign_to_0_because_it_is_not_a_variable_2539", "Cannot assign to '{0}' because it is not a variable."),
    Cannot_assign_to_0_because_it_is_a_read_only_property: diag(2540, 1 /* Error */, "Cannot_assign_to_0_because_it_is_a_read_only_property_2540", "Cannot assign to '{0}' because it is a read-only property."),
    Index_signature_in_type_0_only_permits_reading: diag(2542, 1 /* Error */, "Index_signature_in_type_0_only_permits_reading_2542", "Index signature in type '{0}' only permits reading."),
    Duplicate_identifier_newTarget_Compiler_uses_variable_declaration_newTarget_to_capture_new_target_meta_property_reference: diag(2543, 1 /* Error */, "Duplicate_identifier_newTarget_Compiler_uses_variable_declaration_newTarget_to_capture_new_target_me_2543", "Duplicate identifier '_newTarget'. Compiler uses variable declaration '_newTarget' to capture 'new.target' meta-property reference."),
    Expression_resolves_to_variable_declaration_newTarget_that_compiler_uses_to_capture_new_target_meta_property_reference: diag(2544, 1 /* Error */, "Expression_resolves_to_variable_declaration_newTarget_that_compiler_uses_to_capture_new_target_meta__2544", "Expression resolves to variable declaration '_newTarget' that compiler uses to capture 'new.target' meta-property reference."),
    A_mixin_class_must_have_a_constructor_with_a_single_rest_parameter_of_type_any: diag(2545, 1 /* Error */, "A_mixin_class_must_have_a_constructor_with_a_single_rest_parameter_of_type_any_2545", "A mixin class must have a constructor with a single rest parameter of type 'any[]'."),
    The_type_returned_by_the_0_method_of_an_async_iterator_must_be_a_promise_for_a_type_with_a_value_property: diag(2547, 1 /* Error */, "The_type_returned_by_the_0_method_of_an_async_iterator_must_be_a_promise_for_a_type_with_a_value_pro_2547", "The type returned by the '{0}()' method of an async iterator must be a promise for a type with a 'value' property."),
    Type_0_is_not_an_array_type_or_does_not_have_a_Symbol_iterator_method_that_returns_an_iterator: diag(2548, 1 /* Error */, "Type_0_is_not_an_array_type_or_does_not_have_a_Symbol_iterator_method_that_returns_an_iterator_2548", "Type '{0}' is not an array type or does not have a '[Symbol.iterator]()' method that returns an iterator."),
    Type_0_is_not_an_array_type_or_a_string_type_or_does_not_have_a_Symbol_iterator_method_that_returns_an_iterator: diag(2549, 1 /* Error */, "Type_0_is_not_an_array_type_or_a_string_type_or_does_not_have_a_Symbol_iterator_method_that_returns__2549", "Type '{0}' is not an array type or a string type or does not have a '[Symbol.iterator]()' method that returns an iterator."),
    Property_0_does_not_exist_on_type_1_Do_you_need_to_change_your_target_library_Try_changing_the_lib_compiler_option_to_2_or_later: diag(2550, 1 /* Error */, "Property_0_does_not_exist_on_type_1_Do_you_need_to_change_your_target_library_Try_changing_the_lib_c_2550", "Property '{0}' does not exist on type '{1}'. Do you need to change your target library? Try changing the 'lib' compiler option to '{2}' or later."),
    Property_0_does_not_exist_on_type_1_Did_you_mean_2: diag(2551, 1 /* Error */, "Property_0_does_not_exist_on_type_1_Did_you_mean_2_2551", "Property '{0}' does not exist on type '{1}'. Did you mean '{2}'?"),
    Cannot_find_name_0_Did_you_mean_1: diag(2552, 1 /* Error */, "Cannot_find_name_0_Did_you_mean_1_2552", "Cannot find name '{0}'. Did you mean '{1}'?"),
    Computed_values_are_not_permitted_in_an_enum_with_string_valued_members: diag(2553, 1 /* Error */, "Computed_values_are_not_permitted_in_an_enum_with_string_valued_members_2553", "Computed values are not permitted in an enum with string valued members."),
    Expected_0_arguments_but_got_1: diag(2554, 1 /* Error */, "Expected_0_arguments_but_got_1_2554", "Expected {0} arguments, but got {1}."),
    Expected_at_least_0_arguments_but_got_1: diag(2555, 1 /* Error */, "Expected_at_least_0_arguments_but_got_1_2555", "Expected at least {0} arguments, but got {1}."),
    A_spread_argument_must_either_have_a_tuple_type_or_be_passed_to_a_rest_parameter: diag(2556, 1 /* Error */, "A_spread_argument_must_either_have_a_tuple_type_or_be_passed_to_a_rest_parameter_2556", "A spread argument must either have a tuple type or be passed to a rest parameter."),
    Expected_0_type_arguments_but_got_1: diag(2558, 1 /* Error */, "Expected_0_type_arguments_but_got_1_2558", "Expected {0} type arguments, but got {1}."),
    Type_0_has_no_properties_in_common_with_type_1: diag(2559, 1 /* Error */, "Type_0_has_no_properties_in_common_with_type_1_2559", "Type '{0}' has no properties in common with type '{1}'."),
    Value_of_type_0_has_no_properties_in_common_with_type_1_Did_you_mean_to_call_it: diag(2560, 1 /* Error */, "Value_of_type_0_has_no_properties_in_common_with_type_1_Did_you_mean_to_call_it_2560", "Value of type '{0}' has no properties in common with type '{1}'. Did you mean to call it?"),
    Object_literal_may_only_specify_known_properties_but_0_does_not_exist_in_type_1_Did_you_mean_to_write_2: diag(2561, 1 /* Error */, "Object_literal_may_only_specify_known_properties_but_0_does_not_exist_in_type_1_Did_you_mean_to_writ_2561", "Object literal may only specify known properties, but '{0}' does not exist in type '{1}'. Did you mean to write '{2}'?"),
    Base_class_expressions_cannot_reference_class_type_parameters: diag(2562, 1 /* Error */, "Base_class_expressions_cannot_reference_class_type_parameters_2562", "Base class expressions cannot reference class type parameters."),
    The_containing_function_or_module_body_is_too_large_for_control_flow_analysis: diag(2563, 1 /* Error */, "The_containing_function_or_module_body_is_too_large_for_control_flow_analysis_2563", "The containing function or module body is too large for control flow analysis."),
    Property_0_has_no_initializer_and_is_not_definitely_assigned_in_the_constructor: diag(2564, 1 /* Error */, "Property_0_has_no_initializer_and_is_not_definitely_assigned_in_the_constructor_2564", "Property '{0}' has no initializer and is not definitely assigned in the constructor."),
    Property_0_is_used_before_being_assigned: diag(2565, 1 /* Error */, "Property_0_is_used_before_being_assigned_2565", "Property '{0}' is used before being assigned."),
    A_rest_element_cannot_have_a_property_name: diag(2566, 1 /* Error */, "A_rest_element_cannot_have_a_property_name_2566", "A rest element cannot have a property name."),
    Enum_declarations_can_only_merge_with_namespace_or_other_enum_declarations: diag(2567, 1 /* Error */, "Enum_declarations_can_only_merge_with_namespace_or_other_enum_declarations_2567", "Enum declarations can only merge with namespace or other enum declarations."),
    Property_0_may_not_exist_on_type_1_Did_you_mean_2: diag(2568, 1 /* Error */, "Property_0_may_not_exist_on_type_1_Did_you_mean_2_2568", "Property '{0}' may not exist on type '{1}'. Did you mean '{2}'?"),
    Could_not_find_name_0_Did_you_mean_1: diag(2570, 1 /* Error */, "Could_not_find_name_0_Did_you_mean_1_2570", "Could not find name '{0}'. Did you mean '{1}'?"),
    Object_is_of_type_unknown: diag(2571, 1 /* Error */, "Object_is_of_type_unknown_2571", "Object is of type 'unknown'."),
    A_rest_element_type_must_be_an_array_type: diag(2574, 1 /* Error */, "A_rest_element_type_must_be_an_array_type_2574", "A rest element type must be an array type."),
    No_overload_expects_0_arguments_but_overloads_do_exist_that_expect_either_1_or_2_arguments: diag(2575, 1 /* Error */, "No_overload_expects_0_arguments_but_overloads_do_exist_that_expect_either_1_or_2_arguments_2575", "No overload expects {0} arguments, but overloads do exist that expect either {1} or {2} arguments."),
    Property_0_does_not_exist_on_type_1_Did_you_mean_to_access_the_static_member_2_instead: diag(2576, 1 /* Error */, "Property_0_does_not_exist_on_type_1_Did_you_mean_to_access_the_static_member_2_instead_2576", "Property '{0}' does not exist on type '{1}'. Did you mean to access the static member '{2}' instead?"),
    Return_type_annotation_circularly_references_itself: diag(2577, 1 /* Error */, "Return_type_annotation_circularly_references_itself_2577", "Return type annotation circularly references itself."),
    Unused_ts_expect_error_directive: diag(2578, 1 /* Error */, "Unused_ts_expect_error_directive_2578", "Unused '@ts-expect-error' directive."),
    Cannot_find_name_0_Do_you_need_to_install_type_definitions_for_node_Try_npm_i_save_dev_types_Slashnode: diag(2580, 1 /* Error */, "Cannot_find_name_0_Do_you_need_to_install_type_definitions_for_node_Try_npm_i_save_dev_types_Slashno_2580", "Cannot find name '{0}'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`."),
    Cannot_find_name_0_Do_you_need_to_install_type_definitions_for_jQuery_Try_npm_i_save_dev_types_Slashjquery: diag(2581, 1 /* Error */, "Cannot_find_name_0_Do_you_need_to_install_type_definitions_for_jQuery_Try_npm_i_save_dev_types_Slash_2581", "Cannot find name '{0}'. Do you need to install type definitions for jQuery? Try `npm i --save-dev @types/jquery`."),
    Cannot_find_name_0_Do_you_need_to_install_type_definitions_for_a_test_runner_Try_npm_i_save_dev_types_Slashjest_or_npm_i_save_dev_types_Slashmocha: diag(2582, 1 /* Error */, "Cannot_find_name_0_Do_you_need_to_install_type_definitions_for_a_test_runner_Try_npm_i_save_dev_type_2582", "Cannot find name '{0}'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`."),
    Cannot_find_name_0_Do_you_need_to_change_your_target_library_Try_changing_the_lib_compiler_option_to_1_or_later: diag(2583, 1 /* Error */, "Cannot_find_name_0_Do_you_need_to_change_your_target_library_Try_changing_the_lib_compiler_option_to_2583", "Cannot find name '{0}'. Do you need to change your target library? Try changing the 'lib' compiler option to '{1}' or later."),
    Cannot_find_name_0_Do_you_need_to_change_your_target_library_Try_changing_the_lib_compiler_option_to_include_dom: diag(2584, 1 /* Error */, "Cannot_find_name_0_Do_you_need_to_change_your_target_library_Try_changing_the_lib_compiler_option_to_2584", "Cannot find name '{0}'. Do you need to change your target library? Try changing the 'lib' compiler option to include 'dom'."),
    _0_only_refers_to_a_type_but_is_being_used_as_a_value_here_Do_you_need_to_change_your_target_library_Try_changing_the_lib_compiler_option_to_es2015_or_later: diag(2585, 1 /* Error */, "_0_only_refers_to_a_type_but_is_being_used_as_a_value_here_Do_you_need_to_change_your_target_library_2585", "'{0}' only refers to a type, but is being used as a value here. Do you need to change your target library? Try changing the 'lib' compiler option to es2015 or later."),
    Cannot_assign_to_0_because_it_is_a_constant: diag(2588, 1 /* Error */, "Cannot_assign_to_0_because_it_is_a_constant_2588", "Cannot assign to '{0}' because it is a constant."),
    Type_instantiation_is_excessively_deep_and_possibly_infinite: diag(2589, 1 /* Error */, "Type_instantiation_is_excessively_deep_and_possibly_infinite_2589", "Type instantiation is excessively deep and possibly infinite."),
    Expression_produces_a_union_type_that_is_too_complex_to_represent: diag(2590, 1 /* Error */, "Expression_produces_a_union_type_that_is_too_complex_to_represent_2590", "Expression produces a union type that is too complex to represent."),
    Cannot_find_name_0_Do_you_need_to_install_type_definitions_for_node_Try_npm_i_save_dev_types_Slashnode_and_then_add_node_to_the_types_field_in_your_tsconfig: diag(2591, 1 /* Error */, "Cannot_find_name_0_Do_you_need_to_install_type_definitions_for_node_Try_npm_i_save_dev_types_Slashno_2591", "Cannot find name '{0}'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node` and then add 'node' to the types field in your tsconfig."),
    Cannot_find_name_0_Do_you_need_to_install_type_definitions_for_jQuery_Try_npm_i_save_dev_types_Slashjquery_and_then_add_jquery_to_the_types_field_in_your_tsconfig: diag(2592, 1 /* Error */, "Cannot_find_name_0_Do_you_need_to_install_type_definitions_for_jQuery_Try_npm_i_save_dev_types_Slash_2592", "Cannot find name '{0}'. Do you need to install type definitions for jQuery? Try `npm i --save-dev @types/jquery` and then add 'jquery' to the types field in your tsconfig."),
    Cannot_find_name_0_Do_you_need_to_install_type_definitions_for_a_test_runner_Try_npm_i_save_dev_types_Slashjest_or_npm_i_save_dev_types_Slashmocha_and_then_add_jest_or_mocha_to_the_types_field_in_your_tsconfig: diag(2593, 1 /* Error */, "Cannot_find_name_0_Do_you_need_to_install_type_definitions_for_a_test_runner_Try_npm_i_save_dev_type_2593", "Cannot find name '{0}'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha` and then add 'jest' or 'mocha' to the types field in your tsconfig."),
    This_module_is_declared_with_export_and_can_only_be_used_with_a_default_import_when_using_the_0_flag: diag(2594, 1 /* Error */, "This_module_is_declared_with_export_and_can_only_be_used_with_a_default_import_when_using_the_0_flag_2594", "This module is declared with 'export =', and can only be used with a default import when using the '{0}' flag."),
    _0_can_only_be_imported_by_using_a_default_import: diag(2595, 1 /* Error */, "_0_can_only_be_imported_by_using_a_default_import_2595", "'{0}' can only be imported by using a default import."),
    _0_can_only_be_imported_by_turning_on_the_esModuleInterop_flag_and_using_a_default_import: diag(2596, 1 /* Error */, "_0_can_only_be_imported_by_turning_on_the_esModuleInterop_flag_and_using_a_default_import_2596", "'{0}' can only be imported by turning on the 'esModuleInterop' flag and using a default import."),
    _0_can_only_be_imported_by_using_a_require_call_or_by_using_a_default_import: diag(2597, 1 /* Error */, "_0_can_only_be_imported_by_using_a_require_call_or_by_using_a_default_import_2597", "'{0}' can only be imported by using a 'require' call or by using a default import."),
    _0_can_only_be_imported_by_using_a_require_call_or_by_turning_on_the_esModuleInterop_flag_and_using_a_default_import: diag(2598, 1 /* Error */, "_0_can_only_be_imported_by_using_a_require_call_or_by_turning_on_the_esModuleInterop_flag_and_using__2598", "'{0}' can only be imported by using a 'require' call or by turning on the 'esModuleInterop' flag and using a default import."),
    JSX_element_implicitly_has_type_any_because_the_global_type_JSX_Element_does_not_exist: diag(2602, 1 /* Error */, "JSX_element_implicitly_has_type_any_because_the_global_type_JSX_Element_does_not_exist_2602", "JSX element implicitly has type 'any' because the global type 'JSX.Element' does not exist."),
    Property_0_in_type_1_is_not_assignable_to_type_2: diag(2603, 1 /* Error */, "Property_0_in_type_1_is_not_assignable_to_type_2_2603", "Property '{0}' in type '{1}' is not assignable to type '{2}'."),
    JSX_element_type_0_does_not_have_any_construct_or_call_signatures: diag(2604, 1 /* Error */, "JSX_element_type_0_does_not_have_any_construct_or_call_signatures_2604", "JSX element type '{0}' does not have any construct or call signatures."),
    Property_0_of_JSX_spread_attribute_is_not_assignable_to_target_property: diag(2606, 1 /* Error */, "Property_0_of_JSX_spread_attribute_is_not_assignable_to_target_property_2606", "Property '{0}' of JSX spread attribute is not assignable to target property."),
    JSX_element_class_does_not_support_attributes_because_it_does_not_have_a_0_property: diag(2607, 1 /* Error */, "JSX_element_class_does_not_support_attributes_because_it_does_not_have_a_0_property_2607", "JSX element class does not support attributes because it does not have a '{0}' property."),
    The_global_type_JSX_0_may_not_have_more_than_one_property: diag(2608, 1 /* Error */, "The_global_type_JSX_0_may_not_have_more_than_one_property_2608", "The global type 'JSX.{0}' may not have more than one property."),
    JSX_spread_child_must_be_an_array_type: diag(2609, 1 /* Error */, "JSX_spread_child_must_be_an_array_type_2609", "JSX spread child must be an array type."),
    _0_is_defined_as_an_accessor_in_class_1_but_is_overridden_here_in_2_as_an_instance_property: diag(2610, 1 /* Error */, "_0_is_defined_as_an_accessor_in_class_1_but_is_overridden_here_in_2_as_an_instance_property_2610", "'{0}' is defined as an accessor in class '{1}', but is overridden here in '{2}' as an instance property."),
    _0_is_defined_as_a_property_in_class_1_but_is_overridden_here_in_2_as_an_accessor: diag(2611, 1 /* Error */, "_0_is_defined_as_a_property_in_class_1_but_is_overridden_here_in_2_as_an_accessor_2611", "'{0}' is defined as a property in class '{1}', but is overridden here in '{2}' as an accessor."),
    Property_0_will_overwrite_the_base_property_in_1_If_this_is_intentional_add_an_initializer_Otherwise_add_a_declare_modifier_or_remove_the_redundant_declaration: diag(2612, 1 /* Error */, "Property_0_will_overwrite_the_base_property_in_1_If_this_is_intentional_add_an_initializer_Otherwise_2612", "Property '{0}' will overwrite the base property in '{1}'. If this is intentional, add an initializer. Otherwise, add a 'declare' modifier or remove the redundant declaration."),
    Module_0_has_no_default_export_Did_you_mean_to_use_import_1_from_0_instead: diag(2613, 1 /* Error */, "Module_0_has_no_default_export_Did_you_mean_to_use_import_1_from_0_instead_2613", "Module '{0}' has no default export. Did you mean to use 'import { {1} } from {0}' instead?"),
    Module_0_has_no_exported_member_1_Did_you_mean_to_use_import_1_from_0_instead: diag(2614, 1 /* Error */, "Module_0_has_no_exported_member_1_Did_you_mean_to_use_import_1_from_0_instead_2614", "Module '{0}' has no exported member '{1}'. Did you mean to use 'import {1} from {0}' instead?"),
    Type_of_property_0_circularly_references_itself_in_mapped_type_1: diag(2615, 1 /* Error */, "Type_of_property_0_circularly_references_itself_in_mapped_type_1_2615", "Type of property '{0}' circularly references itself in mapped type '{1}'."),
    _0_can_only_be_imported_by_using_import_1_require_2_or_a_default_import: diag(2616, 1 /* Error */, "_0_can_only_be_imported_by_using_import_1_require_2_or_a_default_import_2616", "'{0}' can only be imported by using 'import {1} = require({2})' or a default import."),
    _0_can_only_be_imported_by_using_import_1_require_2_or_by_turning_on_the_esModuleInterop_flag_and_using_a_default_import: diag(2617, 1 /* Error */, "_0_can_only_be_imported_by_using_import_1_require_2_or_by_turning_on_the_esModuleInterop_flag_and_us_2617", "'{0}' can only be imported by using 'import {1} = require({2})' or by turning on the 'esModuleInterop' flag and using a default import."),
    Source_has_0_element_s_but_target_requires_1: diag(2618, 1 /* Error */, "Source_has_0_element_s_but_target_requires_1_2618", "Source has {0} element(s) but target requires {1}."),
    Source_has_0_element_s_but_target_allows_only_1: diag(2619, 1 /* Error */, "Source_has_0_element_s_but_target_allows_only_1_2619", "Source has {0} element(s) but target allows only {1}."),
    Target_requires_0_element_s_but_source_may_have_fewer: diag(2620, 1 /* Error */, "Target_requires_0_element_s_but_source_may_have_fewer_2620", "Target requires {0} element(s) but source may have fewer."),
    Target_allows_only_0_element_s_but_source_may_have_more: diag(2621, 1 /* Error */, "Target_allows_only_0_element_s_but_source_may_have_more_2621", "Target allows only {0} element(s) but source may have more."),
    Source_provides_no_match_for_required_element_at_position_0_in_target: diag(2623, 1 /* Error */, "Source_provides_no_match_for_required_element_at_position_0_in_target_2623", "Source provides no match for required element at position {0} in target."),
    Source_provides_no_match_for_variadic_element_at_position_0_in_target: diag(2624, 1 /* Error */, "Source_provides_no_match_for_variadic_element_at_position_0_in_target_2624", "Source provides no match for variadic element at position {0} in target."),
    Variadic_element_at_position_0_in_source_does_not_match_element_at_position_1_in_target: diag(2625, 1 /* Error */, "Variadic_element_at_position_0_in_source_does_not_match_element_at_position_1_in_target_2625", "Variadic element at position {0} in source does not match element at position {1} in target."),
    Type_at_position_0_in_source_is_not_compatible_with_type_at_position_1_in_target: diag(2626, 1 /* Error */, "Type_at_position_0_in_source_is_not_compatible_with_type_at_position_1_in_target_2626", "Type at position {0} in source is not compatible with type at position {1} in target."),
    Type_at_positions_0_through_1_in_source_is_not_compatible_with_type_at_position_2_in_target: diag(2627, 1 /* Error */, "Type_at_positions_0_through_1_in_source_is_not_compatible_with_type_at_position_2_in_target_2627", "Type at positions {0} through {1} in source is not compatible with type at position {2} in target."),
    Cannot_assign_to_0_because_it_is_an_enum: diag(2628, 1 /* Error */, "Cannot_assign_to_0_because_it_is_an_enum_2628", "Cannot assign to '{0}' because it is an enum."),
    Cannot_assign_to_0_because_it_is_a_class: diag(2629, 1 /* Error */, "Cannot_assign_to_0_because_it_is_a_class_2629", "Cannot assign to '{0}' because it is a class."),
    Cannot_assign_to_0_because_it_is_a_function: diag(2630, 1 /* Error */, "Cannot_assign_to_0_because_it_is_a_function_2630", "Cannot assign to '{0}' because it is a function."),
    Cannot_assign_to_0_because_it_is_a_namespace: diag(2631, 1 /* Error */, "Cannot_assign_to_0_because_it_is_a_namespace_2631", "Cannot assign to '{0}' because it is a namespace."),
    Cannot_assign_to_0_because_it_is_an_import: diag(2632, 1 /* Error */, "Cannot_assign_to_0_because_it_is_an_import_2632", "Cannot assign to '{0}' because it is an import."),
    JSX_property_access_expressions_cannot_include_JSX_namespace_names: diag(2633, 1 /* Error */, "JSX_property_access_expressions_cannot_include_JSX_namespace_names_2633", "JSX property access expressions cannot include JSX namespace names"),
    _0_index_signatures_are_incompatible: diag(2634, 1 /* Error */, "_0_index_signatures_are_incompatible_2634", "'{0}' index signatures are incompatible."),
    Type_0_has_no_signatures_for_which_the_type_argument_list_is_applicable: diag(2635, 1 /* Error */, "Type_0_has_no_signatures_for_which_the_type_argument_list_is_applicable_2635", "Type '{0}' has no signatures for which the type argument list is applicable."),
    Type_0_is_not_assignable_to_type_1_as_implied_by_variance_annotation: diag(2636, 1 /* Error */, "Type_0_is_not_assignable_to_type_1_as_implied_by_variance_annotation_2636", "Type '{0}' is not assignable to type '{1}' as implied by variance annotation."),
    Variance_annotations_are_only_supported_in_type_aliases_for_object_function_constructor_and_mapped_types: diag(2637, 1 /* Error */, "Variance_annotations_are_only_supported_in_type_aliases_for_object_function_constructor_and_mapped_t_2637", "Variance annotations are only supported in type aliases for object, function, constructor, and mapped types."),
    Type_0_may_represent_a_primitive_value_which_is_not_permitted_as_the_right_operand_of_the_in_operator: diag(2638, 1 /* Error */, "Type_0_may_represent_a_primitive_value_which_is_not_permitted_as_the_right_operand_of_the_in_operato_2638", "Type '{0}' may represent a primitive value, which is not permitted as the right operand of the 'in' operator."),
    React_components_cannot_include_JSX_namespace_names: diag(2639, 1 /* Error */, "React_components_cannot_include_JSX_namespace_names_2639", "React components cannot include JSX namespace names"),
    Cannot_augment_module_0_with_value_exports_because_it_resolves_to_a_non_module_entity: diag(2649, 1 /* Error */, "Cannot_augment_module_0_with_value_exports_because_it_resolves_to_a_non_module_entity_2649", "Cannot augment module '{0}' with value exports because it resolves to a non-module entity."),
    A_member_initializer_in_a_enum_declaration_cannot_reference_members_declared_after_it_including_members_defined_in_other_enums: diag(2651, 1 /* Error */, "A_member_initializer_in_a_enum_declaration_cannot_reference_members_declared_after_it_including_memb_2651", "A member initializer in a enum declaration cannot reference members declared after it, including members defined in other enums."),
    Merged_declaration_0_cannot_include_a_default_export_declaration_Consider_adding_a_separate_export_default_0_declaration_instead: diag(2652, 1 /* Error */, "Merged_declaration_0_cannot_include_a_default_export_declaration_Consider_adding_a_separate_export_d_2652", "Merged declaration '{0}' cannot include a default export declaration. Consider adding a separate 'export default {0}' declaration instead."),
    Non_abstract_class_expression_does_not_implement_inherited_abstract_member_0_from_class_1: diag(2653, 1 /* Error */, "Non_abstract_class_expression_does_not_implement_inherited_abstract_member_0_from_class_1_2653", "Non-abstract class expression does not implement inherited abstract member '{0}' from class '{1}'."),
    JSX_expressions_must_have_one_parent_element: diag(2657, 1 /* Error */, "JSX_expressions_must_have_one_parent_element_2657", "JSX expressions must have one parent element."),
    Type_0_provides_no_match_for_the_signature_1: diag(2658, 1 /* Error */, "Type_0_provides_no_match_for_the_signature_1_2658", "Type '{0}' provides no match for the signature '{1}'."),
    super_is_only_allowed_in_members_of_object_literal_expressions_when_option_target_is_ES2015_or_higher: diag(2659, 1 /* Error */, "super_is_only_allowed_in_members_of_object_literal_expressions_when_option_target_is_ES2015_or_highe_2659", "'super' is only allowed in members of object literal expressions when option 'target' is 'ES2015' or higher."),
    super_can_only_be_referenced_in_members_of_derived_classes_or_object_literal_expressions: diag(2660, 1 /* Error */, "super_can_only_be_referenced_in_members_of_derived_classes_or_object_literal_expressions_2660", "'super' can only be referenced in members of derived classes or object literal expressions."),
    Cannot_export_0_Only_local_declarations_can_be_exported_from_a_module: diag(2661, 1 /* Error */, "Cannot_export_0_Only_local_declarations_can_be_exported_from_a_module_2661", "Cannot export '{0}'. Only local declarations can be exported from a module."),
    Cannot_find_name_0_Did_you_mean_the_static_member_1_0: diag(2662, 1 /* Error */, "Cannot_find_name_0_Did_you_mean_the_static_member_1_0_2662", "Cannot find name '{0}'. Did you mean the static member '{1}.{0}'?"),
    Cannot_find_name_0_Did_you_mean_the_instance_member_this_0: diag(2663, 1 /* Error */, "Cannot_find_name_0_Did_you_mean_the_instance_member_this_0_2663", "Cannot find name '{0}'. Did you mean the instance member 'this.{0}'?"),
    Invalid_module_name_in_augmentation_module_0_cannot_be_found: diag(2664, 1 /* Error */, "Invalid_module_name_in_augmentation_module_0_cannot_be_found_2664", "Invalid module name in augmentation, module '{0}' cannot be found."),
    Invalid_module_name_in_augmentation_Module_0_resolves_to_an_untyped_module_at_1_which_cannot_be_augmented: diag(2665, 1 /* Error */, "Invalid_module_name_in_augmentation_Module_0_resolves_to_an_untyped_module_at_1_which_cannot_be_augm_2665", "Invalid module name in augmentation. Module '{0}' resolves to an untyped module at '{1}', which cannot be augmented."),
    Exports_and_export_assignments_are_not_permitted_in_module_augmentations: diag(2666, 1 /* Error */, "Exports_and_export_assignments_are_not_permitted_in_module_augmentations_2666", "Exports and export assignments are not permitted in module augmentations."),
    Imports_are_not_permitted_in_module_augmentations_Consider_moving_them_to_the_enclosing_external_module: diag(2667, 1 /* Error */, "Imports_are_not_permitted_in_module_augmentations_Consider_moving_them_to_the_enclosing_external_mod_2667", "Imports are not permitted in module augmentations. Consider moving them to the enclosing external module."),
    export_modifier_cannot_be_applied_to_ambient_modules_and_module_augmentations_since_they_are_always_visible: diag(2668, 1 /* Error */, "export_modifier_cannot_be_applied_to_ambient_modules_and_module_augmentations_since_they_are_always__2668", "'export' modifier cannot be applied to ambient modules and module augmentations since they are always visible."),
    Augmentations_for_the_global_scope_can_only_be_directly_nested_in_external_modules_or_ambient_module_declarations: diag(2669, 1 /* Error */, "Augmentations_for_the_global_scope_can_only_be_directly_nested_in_external_modules_or_ambient_module_2669", "Augmentations for the global scope can only be directly nested in external modules or ambient module declarations."),
    Augmentations_for_the_global_scope_should_have_declare_modifier_unless_they_appear_in_already_ambient_context: diag(2670, 1 /* Error */, "Augmentations_for_the_global_scope_should_have_declare_modifier_unless_they_appear_in_already_ambien_2670", "Augmentations for the global scope should have 'declare' modifier unless they appear in already ambient context."),
    Cannot_augment_module_0_because_it_resolves_to_a_non_module_entity: diag(2671, 1 /* Error */, "Cannot_augment_module_0_because_it_resolves_to_a_non_module_entity_2671", "Cannot augment module '{0}' because it resolves to a non-module entity."),
    Cannot_assign_a_0_constructor_type_to_a_1_constructor_type: diag(2672, 1 /* Error */, "Cannot_assign_a_0_constructor_type_to_a_1_constructor_type_2672", "Cannot assign a '{0}' constructor type to a '{1}' constructor type."),
    Constructor_of_class_0_is_private_and_only_accessible_within_the_class_declaration: diag(2673, 1 /* Error */, "Constructor_of_class_0_is_private_and_only_accessible_within_the_class_declaration_2673", "Constructor of class '{0}' is private and only accessible within the class declaration."),
    Constructor_of_class_0_is_protected_and_only_accessible_within_the_class_declaration: diag(2674, 1 /* Error */, "Constructor_of_class_0_is_protected_and_only_accessible_within_the_class_declaration_2674", "Constructor of class '{0}' is protected and only accessible within the class declaration."),
    Cannot_extend_a_class_0_Class_constructor_is_marked_as_private: diag(2675, 1 /* Error */, "Cannot_extend_a_class_0_Class_constructor_is_marked_as_private_2675", "Cannot extend a class '{0}'. Class constructor is marked as private."),
    Accessors_must_both_be_abstract_or_non_abstract: diag(2676, 1 /* Error */, "Accessors_must_both_be_abstract_or_non_abstract_2676", "Accessors must both be abstract or non-abstract."),
    A_type_predicate_s_type_must_be_assignable_to_its_parameter_s_type: diag(2677, 1 /* Error */, "A_type_predicate_s_type_must_be_assignable_to_its_parameter_s_type_2677", "A type predicate's type must be assignable to its parameter's type."),
    Type_0_is_not_comparable_to_type_1: diag(2678, 1 /* Error */, "Type_0_is_not_comparable_to_type_1_2678", "Type '{0}' is not comparable to type '{1}'."),
    A_function_that_is_called_with_the_new_keyword_cannot_have_a_this_type_that_is_void: diag(2679, 1 /* Error */, "A_function_that_is_called_with_the_new_keyword_cannot_have_a_this_type_that_is_void_2679", "A function that is called with the 'new' keyword cannot have a 'this' type that is 'void'."),
    A_0_parameter_must_be_the_first_parameter: diag(2680, 1 /* Error */, "A_0_parameter_must_be_the_first_parameter_2680", "A '{0}' parameter must be the first parameter."),
    A_constructor_cannot_have_a_this_parameter: diag(2681, 1 /* Error */, "A_constructor_cannot_have_a_this_parameter_2681", "A constructor cannot have a 'this' parameter."),
    this_implicitly_has_type_any_because_it_does_not_have_a_type_annotation: diag(2683, 1 /* Error */, "this_implicitly_has_type_any_because_it_does_not_have_a_type_annotation_2683", "'this' implicitly has type 'any' because it does not have a type annotation."),
    The_this_context_of_type_0_is_not_assignable_to_method_s_this_of_type_1: diag(2684, 1 /* Error */, "The_this_context_of_type_0_is_not_assignable_to_method_s_this_of_type_1_2684", "The 'this' context of type '{0}' is not assignable to method's 'this' of type '{1}'."),
    The_this_types_of_each_signature_are_incompatible: diag(2685, 1 /* Error */, "The_this_types_of_each_signature_are_incompatible_2685", "The 'this' types of each signature are incompatible."),
    _0_refers_to_a_UMD_global_but_the_current_file_is_a_module_Consider_adding_an_import_instead: diag(2686, 1 /* Error */, "_0_refers_to_a_UMD_global_but_the_current_file_is_a_module_Consider_adding_an_import_instead_2686", "'{0}' refers to a UMD global, but the current file is a module. Consider adding an import instead."),
    All_declarations_of_0_must_have_identical_modifiers: diag(2687, 1 /* Error */, "All_declarations_of_0_must_have_identical_modifiers_2687", "All declarations of '{0}' must have identical modifiers."),
    Cannot_find_type_definition_file_for_0: diag(2688, 1 /* Error */, "Cannot_find_type_definition_file_for_0_2688", "Cannot find type definition file for '{0}'."),
    Cannot_extend_an_interface_0_Did_you_mean_implements: diag(2689, 1 /* Error */, "Cannot_extend_an_interface_0_Did_you_mean_implements_2689", "Cannot extend an interface '{0}'. Did you mean 'implements'?"),
    _0_only_refers_to_a_type_but_is_being_used_as_a_value_here_Did_you_mean_to_use_1_in_0: diag(2690, 1 /* Error */, "_0_only_refers_to_a_type_but_is_being_used_as_a_value_here_Did_you_mean_to_use_1_in_0_2690", "'{0}' only refers to a type, but is being used as a value here. Did you mean to use '{1} in {0}'?"),
    _0_is_a_primitive_but_1_is_a_wrapper_object_Prefer_using_0_when_possible: diag(2692, 1 /* Error */, "_0_is_a_primitive_but_1_is_a_wrapper_object_Prefer_using_0_when_possible_2692", "'{0}' is a primitive, but '{1}' is a wrapper object. Prefer using '{0}' when possible."),
    _0_only_refers_to_a_type_but_is_being_used_as_a_value_here: diag(2693, 1 /* Error */, "_0_only_refers_to_a_type_but_is_being_used_as_a_value_here_2693", "'{0}' only refers to a type, but is being used as a value here."),
    Namespace_0_has_no_exported_member_1: diag(2694, 1 /* Error */, "Namespace_0_has_no_exported_member_1_2694", "Namespace '{0}' has no exported member '{1}'."),
    Left_side_of_comma_operator_is_unused_and_has_no_side_effects: diag(
      2695,
      1 /* Error */,
      "Left_side_of_comma_operator_is_unused_and_has_no_side_effects_2695",
      "Left side of comma operator is unused and has no side effects.",
      /*reportsUnnecessary*/
      true
    ),
    The_Object_type_is_assignable_to_very_few_other_types_Did_you_mean_to_use_the_any_type_instead: diag(2696, 1 /* Error */, "The_Object_type_is_assignable_to_very_few_other_types_Did_you_mean_to_use_the_any_type_instead_2696", "The 'Object' type is assignable to very few other types. Did you mean to use the 'any' type instead?"),
    An_async_function_or_method_must_return_a_Promise_Make_sure_you_have_a_declaration_for_Promise_or_include_ES2015_in_your_lib_option: diag(2697, 1 /* Error */, "An_async_function_or_method_must_return_a_Promise_Make_sure_you_have_a_declaration_for_Promise_or_in_2697", "An async function or method must return a 'Promise'. Make sure you have a declaration for 'Promise' or include 'ES2015' in your '--lib' option."),
    Spread_types_may_only_be_created_from_object_types: diag(2698, 1 /* Error */, "Spread_types_may_only_be_created_from_object_types_2698", "Spread types may only be created from object types."),
    Static_property_0_conflicts_with_built_in_property_Function_0_of_constructor_function_1: diag(2699, 1 /* Error */, "Static_property_0_conflicts_with_built_in_property_Function_0_of_constructor_function_1_2699", "Static property '{0}' conflicts with built-in property 'Function.{0}' of constructor function '{1}'."),
    Rest_types_may_only_be_created_from_object_types: diag(2700, 1 /* Error */, "Rest_types_may_only_be_created_from_object_types_2700", "Rest types may only be created from object types."),
    The_target_of_an_object_rest_assignment_must_be_a_variable_or_a_property_access: diag(2701, 1 /* Error */, "The_target_of_an_object_rest_assignment_must_be_a_variable_or_a_property_access_2701", "The target of an object rest assignment must be a variable or a property access."),
    _0_only_refers_to_a_type_but_is_being_used_as_a_namespace_here: diag(2702, 1 /* Error */, "_0_only_refers_to_a_type_but_is_being_used_as_a_namespace_here_2702", "'{0}' only refers to a type, but is being used as a namespace here."),
    The_operand_of_a_delete_operator_must_be_a_property_reference: diag(2703, 1 /* Error */, "The_operand_of_a_delete_operator_must_be_a_property_reference_2703", "The operand of a 'delete' operator must be a property reference."),
    The_operand_of_a_delete_operator_cannot_be_a_read_only_property: diag(2704, 1 /* Error */, "The_operand_of_a_delete_operator_cannot_be_a_read_only_property_2704", "The operand of a 'delete' operator cannot be a read-only property."),
    An_async_function_or_method_in_ES5_SlashES3_requires_the_Promise_constructor_Make_sure_you_have_a_declaration_for_the_Promise_constructor_or_include_ES2015_in_your_lib_option: diag(2705, 1 /* Error */, "An_async_function_or_method_in_ES5_SlashES3_requires_the_Promise_constructor_Make_sure_you_have_a_de_2705", "An async function or method in ES5/ES3 requires the 'Promise' constructor.  Make sure you have a declaration for the 'Promise' constructor or include 'ES2015' in your '--lib' option."),
    Required_type_parameters_may_not_follow_optional_type_parameters: diag(2706, 1 /* Error */, "Required_type_parameters_may_not_follow_optional_type_parameters_2706", "Required type parameters may not follow optional type parameters."),
    Generic_type_0_requires_between_1_and_2_type_arguments: diag(2707, 1 /* Error */, "Generic_type_0_requires_between_1_and_2_type_arguments_2707", "Generic type '{0}' requires between {1} and {2} type arguments."),
    Cannot_use_namespace_0_as_a_value: diag(2708, 1 /* Error */, "Cannot_use_namespace_0_as_a_value_2708", "Cannot use namespace '{0}' as a value."),
    Cannot_use_namespace_0_as_a_type: diag(2709, 1 /* Error */, "Cannot_use_namespace_0_as_a_type_2709", "Cannot use namespace '{0}' as a type."),
    _0_are_specified_twice_The_attribute_named_0_will_be_overwritten: diag(2710, 1 /* Error */, "_0_are_specified_twice_The_attribute_named_0_will_be_overwritten_2710", "'{0}' are specified twice. The attribute named '{0}' will be overwritten."),
    A_dynamic_import_call_returns_a_Promise_Make_sure_you_have_a_declaration_for_Promise_or_include_ES2015_in_your_lib_option: diag(2711, 1 /* Error */, "A_dynamic_import_call_returns_a_Promise_Make_sure_you_have_a_declaration_for_Promise_or_include_ES20_2711", "A dynamic import call returns a 'Promise'. Make sure you have a declaration for 'Promise' or include 'ES2015' in your '--lib' option."),
    A_dynamic_import_call_in_ES5_SlashES3_requires_the_Promise_constructor_Make_sure_you_have_a_declaration_for_the_Promise_constructor_or_include_ES2015_in_your_lib_option: diag(2712, 1 /* Error */, "A_dynamic_import_call_in_ES5_SlashES3_requires_the_Promise_constructor_Make_sure_you_have_a_declarat_2712", "A dynamic import call in ES5/ES3 requires the 'Promise' constructor.  Make sure you have a declaration for the 'Promise' constructor or include 'ES2015' in your '--lib' option."),
    Cannot_access_0_1_because_0_is_a_type_but_not_a_namespace_Did_you_mean_to_retrieve_the_type_of_the_property_1_in_0_with_0_1: diag(2713, 1 /* Error */, "Cannot_access_0_1_because_0_is_a_type_but_not_a_namespace_Did_you_mean_to_retrieve_the_type_of_the_p_2713", `Cannot access '{0}.{1}' because '{0}' is a type, but not a namespace. Did you mean to retrieve the type of the property '{1}' in '{0}' with '{0}["{1}"]'?`),
    The_expression_of_an_export_assignment_must_be_an_identifier_or_qualified_name_in_an_ambient_context: diag(2714, 1 /* Error */, "The_expression_of_an_export_assignment_must_be_an_identifier_or_qualified_name_in_an_ambient_context_2714", "The expression of an export assignment must be an identifier or qualified name in an ambient context."),
    Abstract_property_0_in_class_1_cannot_be_accessed_in_the_constructor: diag(2715, 1 /* Error */, "Abstract_property_0_in_class_1_cannot_be_accessed_in_the_constructor_2715", "Abstract property '{0}' in class '{1}' cannot be accessed in the constructor."),
    Type_parameter_0_has_a_circular_default: diag(2716, 1 /* Error */, "Type_parameter_0_has_a_circular_default_2716", "Type parameter '{0}' has a circular default."),
    Subsequent_property_declarations_must_have_the_same_type_Property_0_must_be_of_type_1_but_here_has_type_2: diag(2717, 1 /* Error */, "Subsequent_property_declarations_must_have_the_same_type_Property_0_must_be_of_type_1_but_here_has_t_2717", "Subsequent property declarations must have the same type.  Property '{0}' must be of type '{1}', but here has type '{2}'."),
    Duplicate_property_0: diag(2718, 1 /* Error */, "Duplicate_property_0_2718", "Duplicate property '{0}'."),
    Type_0_is_not_assignable_to_type_1_Two_different_types_with_this_name_exist_but_they_are_unrelated: diag(2719, 1 /* Error */, "Type_0_is_not_assignable_to_type_1_Two_different_types_with_this_name_exist_but_they_are_unrelated_2719", "Type '{0}' is not assignable to type '{1}'. Two different types with this name exist, but they are unrelated."),
    Class_0_incorrectly_implements_class_1_Did_you_mean_to_extend_1_and_inherit_its_members_as_a_subclass: diag(2720, 1 /* Error */, "Class_0_incorrectly_implements_class_1_Did_you_mean_to_extend_1_and_inherit_its_members_as_a_subclas_2720", "Class '{0}' incorrectly implements class '{1}'. Did you mean to extend '{1}' and inherit its members as a subclass?"),
    Cannot_invoke_an_object_which_is_possibly_null: diag(2721, 1 /* Error */, "Cannot_invoke_an_object_which_is_possibly_null_2721", "Cannot invoke an object which is possibly 'null'."),
    Cannot_invoke_an_object_which_is_possibly_undefined: diag(2722, 1 /* Error */, "Cannot_invoke_an_object_which_is_possibly_undefined_2722", "Cannot invoke an object which is possibly 'undefined'."),
    Cannot_invoke_an_object_which_is_possibly_null_or_undefined: diag(2723, 1 /* Error */, "Cannot_invoke_an_object_which_is_possibly_null_or_undefined_2723", "Cannot invoke an object which is possibly 'null' or 'undefined'."),
    _0_has_no_exported_member_named_1_Did_you_mean_2: diag(2724, 1 /* Error */, "_0_has_no_exported_member_named_1_Did_you_mean_2_2724", "'{0}' has no exported member named '{1}'. Did you mean '{2}'?"),
    Class_name_cannot_be_Object_when_targeting_ES5_with_module_0: diag(2725, 1 /* Error */, "Class_name_cannot_be_Object_when_targeting_ES5_with_module_0_2725", "Class name cannot be 'Object' when targeting ES5 with module {0}."),
    Cannot_find_lib_definition_for_0: diag(2726, 1 /* Error */, "Cannot_find_lib_definition_for_0_2726", "Cannot find lib definition for '{0}'."),
    Cannot_find_lib_definition_for_0_Did_you_mean_1: diag(2727, 1 /* Error */, "Cannot_find_lib_definition_for_0_Did_you_mean_1_2727", "Cannot find lib definition for '{0}'. Did you mean '{1}'?"),
    _0_is_declared_here: diag(2728, 3 /* Message */, "_0_is_declared_here_2728", "'{0}' is declared here."),
    Property_0_is_used_before_its_initialization: diag(2729, 1 /* Error */, "Property_0_is_used_before_its_initialization_2729", "Property '{0}' is used before its initialization."),
    An_arrow_function_cannot_have_a_this_parameter: diag(2730, 1 /* Error */, "An_arrow_function_cannot_have_a_this_parameter_2730", "An arrow function cannot have a 'this' parameter."),
    Implicit_conversion_of_a_symbol_to_a_string_will_fail_at_runtime_Consider_wrapping_this_expression_in_String: diag(2731, 1 /* Error */, "Implicit_conversion_of_a_symbol_to_a_string_will_fail_at_runtime_Consider_wrapping_this_expression_i_2731", "Implicit conversion of a 'symbol' to a 'string' will fail at runtime. Consider wrapping this expression in 'String(...)'."),
    Cannot_find_module_0_Consider_using_resolveJsonModule_to_import_module_with_json_extension: diag(2732, 1 /* Error */, "Cannot_find_module_0_Consider_using_resolveJsonModule_to_import_module_with_json_extension_2732", "Cannot find module '{0}'. Consider using '--resolveJsonModule' to import module with '.json' extension."),
    Property_0_was_also_declared_here: diag(2733, 1 /* Error */, "Property_0_was_also_declared_here_2733", "Property '{0}' was also declared here."),
    Are_you_missing_a_semicolon: diag(2734, 1 /* Error */, "Are_you_missing_a_semicolon_2734", "Are you missing a semicolon?"),
    Did_you_mean_for_0_to_be_constrained_to_type_new_args_Colon_any_1: diag(2735, 1 /* Error */, "Did_you_mean_for_0_to_be_constrained_to_type_new_args_Colon_any_1_2735", "Did you mean for '{0}' to be constrained to type 'new (...args: any[]) => {1}'?"),
    Operator_0_cannot_be_applied_to_type_1: diag(2736, 1 /* Error */, "Operator_0_cannot_be_applied_to_type_1_2736", "Operator '{0}' cannot be applied to type '{1}'."),
    BigInt_literals_are_not_available_when_targeting_lower_than_ES2020: diag(2737, 1 /* Error */, "BigInt_literals_are_not_available_when_targeting_lower_than_ES2020_2737", "BigInt literals are not available when targeting lower than ES2020."),
    An_outer_value_of_this_is_shadowed_by_this_container: diag(2738, 3 /* Message */, "An_outer_value_of_this_is_shadowed_by_this_container_2738", "An outer value of 'this' is shadowed by this container."),
    Type_0_is_missing_the_following_properties_from_type_1_Colon_2: diag(2739, 1 /* Error */, "Type_0_is_missing_the_following_properties_from_type_1_Colon_2_2739", "Type '{0}' is missing the following properties from type '{1}': {2}"),
    Type_0_is_missing_the_following_properties_from_type_1_Colon_2_and_3_more: diag(2740, 1 /* Error */, "Type_0_is_missing_the_following_properties_from_type_1_Colon_2_and_3_more_2740", "Type '{0}' is missing the following properties from type '{1}': {2}, and {3} more."),
    Property_0_is_missing_in_type_1_but_required_in_type_2: diag(2741, 1 /* Error */, "Property_0_is_missing_in_type_1_but_required_in_type_2_2741", "Property '{0}' is missing in type '{1}' but required in type '{2}'."),
    The_inferred_type_of_0_cannot_be_named_without_a_reference_to_1_This_is_likely_not_portable_A_type_annotation_is_necessary: diag(2742, 1 /* Error */, "The_inferred_type_of_0_cannot_be_named_without_a_reference_to_1_This_is_likely_not_portable_A_type_a_2742", "The inferred type of '{0}' cannot be named without a reference to '{1}'. This is likely not portable. A type annotation is necessary."),
    No_overload_expects_0_type_arguments_but_overloads_do_exist_that_expect_either_1_or_2_type_arguments: diag(2743, 1 /* Error */, "No_overload_expects_0_type_arguments_but_overloads_do_exist_that_expect_either_1_or_2_type_arguments_2743", "No overload expects {0} type arguments, but overloads do exist that expect either {1} or {2} type arguments."),
    Type_parameter_defaults_can_only_reference_previously_declared_type_parameters: diag(2744, 1 /* Error */, "Type_parameter_defaults_can_only_reference_previously_declared_type_parameters_2744", "Type parameter defaults can only reference previously declared type parameters."),
    This_JSX_tag_s_0_prop_expects_type_1_which_requires_multiple_children_but_only_a_single_child_was_provided: diag(2745, 1 /* Error */, "This_JSX_tag_s_0_prop_expects_type_1_which_requires_multiple_children_but_only_a_single_child_was_pr_2745", "This JSX tag's '{0}' prop expects type '{1}' which requires multiple children, but only a single child was provided."),
    This_JSX_tag_s_0_prop_expects_a_single_child_of_type_1_but_multiple_children_were_provided: diag(2746, 1 /* Error */, "This_JSX_tag_s_0_prop_expects_a_single_child_of_type_1_but_multiple_children_were_provided_2746", "This JSX tag's '{0}' prop expects a single child of type '{1}', but multiple children were provided."),
    _0_components_don_t_accept_text_as_child_elements_Text_in_JSX_has_the_type_string_but_the_expected_type_of_1_is_2: diag(2747, 1 /* Error */, "_0_components_don_t_accept_text_as_child_elements_Text_in_JSX_has_the_type_string_but_the_expected_t_2747", "'{0}' components don't accept text as child elements. Text in JSX has the type 'string', but the expected type of '{1}' is '{2}'."),
    Cannot_access_ambient_const_enums_when_0_is_enabled: diag(2748, 1 /* Error */, "Cannot_access_ambient_const_enums_when_0_is_enabled_2748", "Cannot access ambient const enums when '{0}' is enabled."),
    _0_refers_to_a_value_but_is_being_used_as_a_type_here_Did_you_mean_typeof_0: diag(2749, 1 /* Error */, "_0_refers_to_a_value_but_is_being_used_as_a_type_here_Did_you_mean_typeof_0_2749", "'{0}' refers to a value, but is being used as a type here. Did you mean 'typeof {0}'?"),
    The_implementation_signature_is_declared_here: diag(2750, 1 /* Error */, "The_implementation_signature_is_declared_here_2750", "The implementation signature is declared here."),
    Circularity_originates_in_type_at_this_location: diag(2751, 1 /* Error */, "Circularity_originates_in_type_at_this_location_2751", "Circularity originates in type at this location."),
    The_first_export_default_is_here: diag(2752, 1 /* Error */, "The_first_export_default_is_here_2752", "The first export default is here."),
    Another_export_default_is_here: diag(2753, 1 /* Error */, "Another_export_default_is_here_2753", "Another export default is here."),
    super_may_not_use_type_arguments: diag(2754, 1 /* Error */, "super_may_not_use_type_arguments_2754", "'super' may not use type arguments."),
    No_constituent_of_type_0_is_callable: diag(2755, 1 /* Error */, "No_constituent_of_type_0_is_callable_2755", "No constituent of type '{0}' is callable."),
    Not_all_constituents_of_type_0_are_callable: diag(2756, 1 /* Error */, "Not_all_constituents_of_type_0_are_callable_2756", "Not all constituents of type '{0}' are callable."),
    Type_0_has_no_call_signatures: diag(2757, 1 /* Error */, "Type_0_has_no_call_signatures_2757", "Type '{0}' has no call signatures."),
    Each_member_of_the_union_type_0_has_signatures_but_none_of_those_signatures_are_compatible_with_each_other: diag(2758, 1 /* Error */, "Each_member_of_the_union_type_0_has_signatures_but_none_of_those_signatures_are_compatible_with_each_2758", "Each member of the union type '{0}' has signatures, but none of those signatures are compatible with each other."),
    No_constituent_of_type_0_is_constructable: diag(2759, 1 /* Error */, "No_constituent_of_type_0_is_constructable_2759", "No constituent of type '{0}' is constructable."),
    Not_all_constituents_of_type_0_are_constructable: diag(2760, 1 /* Error */, "Not_all_constituents_of_type_0_are_constructable_2760", "Not all constituents of type '{0}' are constructable."),
    Type_0_has_no_construct_signatures: diag(2761, 1 /* Error */, "Type_0_has_no_construct_signatures_2761", "Type '{0}' has no construct signatures."),
    Each_member_of_the_union_type_0_has_construct_signatures_but_none_of_those_signatures_are_compatible_with_each_other: diag(2762, 1 /* Error */, "Each_member_of_the_union_type_0_has_construct_signatures_but_none_of_those_signatures_are_compatible_2762", "Each member of the union type '{0}' has construct signatures, but none of those signatures are compatible with each other."),
    Cannot_iterate_value_because_the_next_method_of_its_iterator_expects_type_1_but_for_of_will_always_send_0: diag(2763, 1 /* Error */, "Cannot_iterate_value_because_the_next_method_of_its_iterator_expects_type_1_but_for_of_will_always_s_2763", "Cannot iterate value because the 'next' method of its iterator expects type '{1}', but for-of will always send '{0}'."),
    Cannot_iterate_value_because_the_next_method_of_its_iterator_expects_type_1_but_array_spread_will_always_send_0: diag(2764, 1 /* Error */, "Cannot_iterate_value_because_the_next_method_of_its_iterator_expects_type_1_but_array_spread_will_al_2764", "Cannot iterate value because the 'next' method of its iterator expects type '{1}', but array spread will always send '{0}'."),
    Cannot_iterate_value_because_the_next_method_of_its_iterator_expects_type_1_but_array_destructuring_will_always_send_0: diag(2765, 1 /* Error */, "Cannot_iterate_value_because_the_next_method_of_its_iterator_expects_type_1_but_array_destructuring__2765", "Cannot iterate value because the 'next' method of its iterator expects type '{1}', but array destructuring will always send '{0}'."),
    Cannot_delegate_iteration_to_value_because_the_next_method_of_its_iterator_expects_type_1_but_the_containing_generator_will_always_send_0: diag(2766, 1 /* Error */, "Cannot_delegate_iteration_to_value_because_the_next_method_of_its_iterator_expects_type_1_but_the_co_2766", "Cannot delegate iteration to value because the 'next' method of its iterator expects type '{1}', but the containing generator will always send '{0}'."),
    The_0_property_of_an_iterator_must_be_a_method: diag(2767, 1 /* Error */, "The_0_property_of_an_iterator_must_be_a_method_2767", "The '{0}' property of an iterator must be a method."),
    The_0_property_of_an_async_iterator_must_be_a_method: diag(2768, 1 /* Error */, "The_0_property_of_an_async_iterator_must_be_a_method_2768", "The '{0}' property of an async iterator must be a method."),
    No_overload_matches_this_call: diag(2769, 1 /* Error */, "No_overload_matches_this_call_2769", "No overload matches this call."),
    The_last_overload_gave_the_following_error: diag(2770, 1 /* Error */, "The_last_overload_gave_the_following_error_2770", "The last overload gave the following error."),
    The_last_overload_is_declared_here: diag(2771, 1 /* Error */, "The_last_overload_is_declared_here_2771", "The last overload is declared here."),
    Overload_0_of_1_2_gave_the_following_error: diag(2772, 1 /* Error */, "Overload_0_of_1_2_gave_the_following_error_2772", "Overload {0} of {1}, '{2}', gave the following error."),
    Did_you_forget_to_use_await: diag(2773, 1 /* Error */, "Did_you_forget_to_use_await_2773", "Did you forget to use 'await'?"),
    This_condition_will_always_return_true_since_this_function_is_always_defined_Did_you_mean_to_call_it_instead: diag(2774, 1 /* Error */, "This_condition_will_always_return_true_since_this_function_is_always_defined_Did_you_mean_to_call_it_2774", "This condition will always return true since this function is always defined. Did you mean to call it instead?"),
    Assertions_require_every_name_in_the_call_target_to_be_declared_with_an_explicit_type_annotation: diag(2775, 1 /* Error */, "Assertions_require_every_name_in_the_call_target_to_be_declared_with_an_explicit_type_annotation_2775", "Assertions require every name in the call target to be declared with an explicit type annotation."),
    Assertions_require_the_call_target_to_be_an_identifier_or_qualified_name: diag(2776, 1 /* Error */, "Assertions_require_the_call_target_to_be_an_identifier_or_qualified_name_2776", "Assertions require the call target to be an identifier or qualified name."),
    The_operand_of_an_increment_or_decrement_operator_may_not_be_an_optional_property_access: diag(2777, 1 /* Error */, "The_operand_of_an_increment_or_decrement_operator_may_not_be_an_optional_property_access_2777", "The operand of an increment or decrement operator may not be an optional property access."),
    The_target_of_an_object_rest_assignment_may_not_be_an_optional_property_access: diag(2778, 1 /* Error */, "The_target_of_an_object_rest_assignment_may_not_be_an_optional_property_access_2778", "The target of an object rest assignment may not be an optional property access."),
    The_left_hand_side_of_an_assignment_expression_may_not_be_an_optional_property_access: diag(2779, 1 /* Error */, "The_left_hand_side_of_an_assignment_expression_may_not_be_an_optional_property_access_2779", "The left-hand side of an assignment expression may not be an optional property access."),
    The_left_hand_side_of_a_for_in_statement_may_not_be_an_optional_property_access: diag(2780, 1 /* Error */, "The_left_hand_side_of_a_for_in_statement_may_not_be_an_optional_property_access_2780", "The left-hand side of a 'for...in' statement may not be an optional property access."),
    The_left_hand_side_of_a_for_of_statement_may_not_be_an_optional_property_access: diag(2781, 1 /* Error */, "The_left_hand_side_of_a_for_of_statement_may_not_be_an_optional_property_access_2781", "The left-hand side of a 'for...of' statement may not be an optional property access."),
    _0_needs_an_explicit_type_annotation: diag(2782, 3 /* Message */, "_0_needs_an_explicit_type_annotation_2782", "'{0}' needs an explicit type annotation."),
    _0_is_specified_more_than_once_so_this_usage_will_be_overwritten: diag(2783, 1 /* Error */, "_0_is_specified_more_than_once_so_this_usage_will_be_overwritten_2783", "'{0}' is specified more than once, so this usage will be overwritten."),
    get_and_set_accessors_cannot_declare_this_parameters: diag(2784, 1 /* Error */, "get_and_set_accessors_cannot_declare_this_parameters_2784", "'get' and 'set' accessors cannot declare 'this' parameters."),
    This_spread_always_overwrites_this_property: diag(2785, 1 /* Error */, "This_spread_always_overwrites_this_property_2785", "This spread always overwrites this property."),
    _0_cannot_be_used_as_a_JSX_component: diag(2786, 1 /* Error */, "_0_cannot_be_used_as_a_JSX_component_2786", "'{0}' cannot be used as a JSX component."),
    Its_return_type_0_is_not_a_valid_JSX_element: diag(2787, 1 /* Error */, "Its_return_type_0_is_not_a_valid_JSX_element_2787", "Its return type '{0}' is not a valid JSX element."),
    Its_instance_type_0_is_not_a_valid_JSX_element: diag(2788, 1 /* Error */, "Its_instance_type_0_is_not_a_valid_JSX_element_2788", "Its instance type '{0}' is not a valid JSX element."),
    Its_element_type_0_is_not_a_valid_JSX_element: diag(2789, 1 /* Error */, "Its_element_type_0_is_not_a_valid_JSX_element_2789", "Its element type '{0}' is not a valid JSX element."),
    The_operand_of_a_delete_operator_must_be_optional: diag(2790, 1 /* Error */, "The_operand_of_a_delete_operator_must_be_optional_2790", "The operand of a 'delete' operator must be optional."),
    Exponentiation_cannot_be_performed_on_bigint_values_unless_the_target_option_is_set_to_es2016_or_later: diag(2791, 1 /* Error */, "Exponentiation_cannot_be_performed_on_bigint_values_unless_the_target_option_is_set_to_es2016_or_lat_2791", "Exponentiation cannot be performed on 'bigint' values unless the 'target' option is set to 'es2016' or later."),
    Cannot_find_module_0_Did_you_mean_to_set_the_moduleResolution_option_to_nodenext_or_to_add_aliases_to_the_paths_option: diag(2792, 1 /* Error */, "Cannot_find_module_0_Did_you_mean_to_set_the_moduleResolution_option_to_nodenext_or_to_add_aliases_t_2792", "Cannot find module '{0}'. Did you mean to set the 'moduleResolution' option to 'nodenext', or to add aliases to the 'paths' option?"),
    The_call_would_have_succeeded_against_this_implementation_but_implementation_signatures_of_overloads_are_not_externally_visible: diag(2793, 1 /* Error */, "The_call_would_have_succeeded_against_this_implementation_but_implementation_signatures_of_overloads_2793", "The call would have succeeded against this implementation, but implementation signatures of overloads are not externally visible."),
    Expected_0_arguments_but_got_1_Did_you_forget_to_include_void_in_your_type_argument_to_Promise: diag(2794, 1 /* Error */, "Expected_0_arguments_but_got_1_Did_you_forget_to_include_void_in_your_type_argument_to_Promise_2794", "Expected {0} arguments, but got {1}. Did you forget to include 'void' in your type argument to 'Promise'?"),
    The_intrinsic_keyword_can_only_be_used_to_declare_compiler_provided_intrinsic_types: diag(2795, 1 /* Error */, "The_intrinsic_keyword_can_only_be_used_to_declare_compiler_provided_intrinsic_types_2795", "The 'intrinsic' keyword can only be used to declare compiler provided intrinsic types."),
    It_is_likely_that_you_are_missing_a_comma_to_separate_these_two_template_expressions_They_form_a_tagged_template_expression_which_cannot_be_invoked: diag(2796, 1 /* Error */, "It_is_likely_that_you_are_missing_a_comma_to_separate_these_two_template_expressions_They_form_a_tag_2796", "It is likely that you are missing a comma to separate these two template expressions. They form a tagged template expression which cannot be invoked."),
    A_mixin_class_that_extends_from_a_type_variable_containing_an_abstract_construct_signature_must_also_be_declared_abstract: diag(2797, 1 /* Error */, "A_mixin_class_that_extends_from_a_type_variable_containing_an_abstract_construct_signature_must_also_2797", "A mixin class that extends from a type variable containing an abstract construct signature must also be declared 'abstract'."),
    The_declaration_was_marked_as_deprecated_here: diag(2798, 1 /* Error */, "The_declaration_was_marked_as_deprecated_here_2798", "The declaration was marked as deprecated here."),
    Type_produces_a_tuple_type_that_is_too_large_to_represent: diag(2799, 1 /* Error */, "Type_produces_a_tuple_type_that_is_too_large_to_represent_2799", "Type produces a tuple type that is too large to represent."),
    Expression_produces_a_tuple_type_that_is_too_large_to_represent: diag(2800, 1 /* Error */, "Expression_produces_a_tuple_type_that_is_too_large_to_represent_2800", "Expression produces a tuple type that is too large to represent."),
    This_condition_will_always_return_true_since_this_0_is_always_defined: diag(2801, 1 /* Error */, "This_condition_will_always_return_true_since_this_0_is_always_defined_2801", "This condition will always return true since this '{0}' is always defined."),
    Type_0_can_only_be_iterated_through_when_using_the_downlevelIteration_flag_or_with_a_target_of_es2015_or_higher: diag(2802, 1 /* Error */, "Type_0_can_only_be_iterated_through_when_using_the_downlevelIteration_flag_or_with_a_target_of_es201_2802", "Type '{0}' can only be iterated through when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher."),
    Cannot_assign_to_private_method_0_Private_methods_are_not_writable: diag(2803, 1 /* Error */, "Cannot_assign_to_private_method_0_Private_methods_are_not_writable_2803", "Cannot assign to private method '{0}'. Private methods are not writable."),
    Duplicate_identifier_0_Static_and_instance_elements_cannot_share_the_same_private_name: diag(2804, 1 /* Error */, "Duplicate_identifier_0_Static_and_instance_elements_cannot_share_the_same_private_name_2804", "Duplicate identifier '{0}'. Static and instance elements cannot share the same private name."),
    Private_accessor_was_defined_without_a_getter: diag(2806, 1 /* Error */, "Private_accessor_was_defined_without_a_getter_2806", "Private accessor was defined without a getter."),
    This_syntax_requires_an_imported_helper_named_1_with_2_parameters_which_is_not_compatible_with_the_one_in_0_Consider_upgrading_your_version_of_0: diag(2807, 1 /* Error */, "This_syntax_requires_an_imported_helper_named_1_with_2_parameters_which_is_not_compatible_with_the_o_2807", "This syntax requires an imported helper named '{1}' with {2} parameters, which is not compatible with the one in '{0}'. Consider upgrading your version of '{0}'."),
    A_get_accessor_must_be_at_least_as_accessible_as_the_setter: diag(2808, 1 /* Error */, "A_get_accessor_must_be_at_least_as_accessible_as_the_setter_2808", "A get accessor must be at least as accessible as the setter"),
    Declaration_or_statement_expected_This_follows_a_block_of_statements_so_if_you_intended_to_write_a_destructuring_assignment_you_might_need_to_wrap_the_whole_assignment_in_parentheses: diag(2809, 1 /* Error */, "Declaration_or_statement_expected_This_follows_a_block_of_statements_so_if_you_intended_to_write_a_d_2809", "Declaration or statement expected. This '=' follows a block of statements, so if you intended to write a destructuring assignment, you might need to wrap the whole assignment in parentheses."),
    Expected_1_argument_but_got_0_new_Promise_needs_a_JSDoc_hint_to_produce_a_resolve_that_can_be_called_without_arguments: diag(2810, 1 /* Error */, "Expected_1_argument_but_got_0_new_Promise_needs_a_JSDoc_hint_to_produce_a_resolve_that_can_be_called_2810", "Expected 1 argument, but got 0. 'new Promise()' needs a JSDoc hint to produce a 'resolve' that can be called without arguments."),
    Initializer_for_property_0: diag(2811, 1 /* Error */, "Initializer_for_property_0_2811", "Initializer for property '{0}'"),
    Property_0_does_not_exist_on_type_1_Try_changing_the_lib_compiler_option_to_include_dom: diag(2812, 1 /* Error */, "Property_0_does_not_exist_on_type_1_Try_changing_the_lib_compiler_option_to_include_dom_2812", "Property '{0}' does not exist on type '{1}'. Try changing the 'lib' compiler option to include 'dom'."),
    Class_declaration_cannot_implement_overload_list_for_0: diag(2813, 1 /* Error */, "Class_declaration_cannot_implement_overload_list_for_0_2813", "Class declaration cannot implement overload list for '{0}'."),
    Function_with_bodies_can_only_merge_with_classes_that_are_ambient: diag(2814, 1 /* Error */, "Function_with_bodies_can_only_merge_with_classes_that_are_ambient_2814", "Function with bodies can only merge with classes that are ambient."),
    arguments_cannot_be_referenced_in_property_initializers: diag(2815, 1 /* Error */, "arguments_cannot_be_referenced_in_property_initializers_2815", "'arguments' cannot be referenced in property initializers."),
    Cannot_use_this_in_a_static_property_initializer_of_a_decorated_class: diag(2816, 1 /* Error */, "Cannot_use_this_in_a_static_property_initializer_of_a_decorated_class_2816", "Cannot use 'this' in a static property initializer of a decorated class."),
    Property_0_has_no_initializer_and_is_not_definitely_assigned_in_a_class_static_block: diag(2817, 1 /* Error */, "Property_0_has_no_initializer_and_is_not_definitely_assigned_in_a_class_static_block_2817", "Property '{0}' has no initializer and is not definitely assigned in a class static block."),
    Duplicate_identifier_0_Compiler_reserves_name_1_when_emitting_super_references_in_static_initializers: diag(2818, 1 /* Error */, "Duplicate_identifier_0_Compiler_reserves_name_1_when_emitting_super_references_in_static_initializer_2818", "Duplicate identifier '{0}'. Compiler reserves name '{1}' when emitting 'super' references in static initializers."),
    Namespace_name_cannot_be_0: diag(2819, 1 /* Error */, "Namespace_name_cannot_be_0_2819", "Namespace name cannot be '{0}'."),
    Type_0_is_not_assignable_to_type_1_Did_you_mean_2: diag(2820, 1 /* Error */, "Type_0_is_not_assignable_to_type_1_Did_you_mean_2_2820", "Type '{0}' is not assignable to type '{1}'. Did you mean '{2}'?"),
    Import_assertions_are_only_supported_when_the_module_option_is_set_to_esnext_nodenext_or_preserve: diag(2821, 1 /* Error */, "Import_assertions_are_only_supported_when_the_module_option_is_set_to_esnext_nodenext_or_preserve_2821", "Import assertions are only supported when the '--module' option is set to 'esnext', 'nodenext', or 'preserve'."),
    Import_assertions_cannot_be_used_with_type_only_imports_or_exports: diag(2822, 1 /* Error */, "Import_assertions_cannot_be_used_with_type_only_imports_or_exports_2822", "Import assertions cannot be used with type-only imports or exports."),
    Import_attributes_are_only_supported_when_the_module_option_is_set_to_esnext_nodenext_or_preserve: diag(2823, 1 /* Error */, "Import_attributes_are_only_supported_when_the_module_option_is_set_to_esnext_nodenext_or_preserve_2823", "Import attributes are only supported when the '--module' option is set to 'esnext', 'nodenext', or 'preserve'."),
    Cannot_find_namespace_0_Did_you_mean_1: diag(2833, 1 /* Error */, "Cannot_find_namespace_0_Did_you_mean_1_2833", "Cannot find namespace '{0}'. Did you mean '{1}'?"),
    Relative_import_paths_need_explicit_file_extensions_in_ECMAScript_imports_when_moduleResolution_is_node16_or_nodenext_Consider_adding_an_extension_to_the_import_path: diag(2834, 1 /* Error */, "Relative_import_paths_need_explicit_file_extensions_in_ECMAScript_imports_when_moduleResolution_is_n_2834", "Relative import paths need explicit file extensions in ECMAScript imports when '--moduleResolution' is 'node16' or 'nodenext'. Consider adding an extension to the import path."),
    Relative_import_paths_need_explicit_file_extensions_in_ECMAScript_imports_when_moduleResolution_is_node16_or_nodenext_Did_you_mean_0: diag(2835, 1 /* Error */, "Relative_import_paths_need_explicit_file_extensions_in_ECMAScript_imports_when_moduleResolution_is_n_2835", "Relative import paths need explicit file extensions in ECMAScript imports when '--moduleResolution' is 'node16' or 'nodenext'. Did you mean '{0}'?"),
    Import_assertions_are_not_allowed_on_statements_that_compile_to_CommonJS_require_calls: diag(2836, 1 /* Error */, "Import_assertions_are_not_allowed_on_statements_that_compile_to_CommonJS_require_calls_2836", "Import assertions are not allowed on statements that compile to CommonJS 'require' calls."),
    Import_assertion_values_must_be_string_literal_expressions: diag(2837, 1 /* Error */, "Import_assertion_values_must_be_string_literal_expressions_2837", "Import assertion values must be string literal expressions."),
    All_declarations_of_0_must_have_identical_constraints: diag(2838, 1 /* Error */, "All_declarations_of_0_must_have_identical_constraints_2838", "All declarations of '{0}' must have identical constraints."),
    This_condition_will_always_return_0_since_JavaScript_compares_objects_by_reference_not_value: diag(2839, 1 /* Error */, "This_condition_will_always_return_0_since_JavaScript_compares_objects_by_reference_not_value_2839", "This condition will always return '{0}' since JavaScript compares objects by reference, not value."),
    An_interface_cannot_extend_a_primitive_type_like_0_It_can_only_extend_other_named_object_types: diag(2840, 1 /* Error */, "An_interface_cannot_extend_a_primitive_type_like_0_It_can_only_extend_other_named_object_types_2840", "An interface cannot extend a primitive type like '{0}'. It can only extend other named object types."),
    _0_is_an_unused_renaming_of_1_Did_you_intend_to_use_it_as_a_type_annotation: diag(2842, 1 /* Error */, "_0_is_an_unused_renaming_of_1_Did_you_intend_to_use_it_as_a_type_annotation_2842", "'{0}' is an unused renaming of '{1}'. Did you intend to use it as a type annotation?"),
    We_can_only_write_a_type_for_0_by_adding_a_type_for_the_entire_parameter_here: diag(2843, 1 /* Error */, "We_can_only_write_a_type_for_0_by_adding_a_type_for_the_entire_parameter_here_2843", "We can only write a type for '{0}' by adding a type for the entire parameter here."),
    Type_of_instance_member_variable_0_cannot_reference_identifier_1_declared_in_the_constructor: diag(2844, 1 /* Error */, "Type_of_instance_member_variable_0_cannot_reference_identifier_1_declared_in_the_constructor_2844", "Type of instance member variable '{0}' cannot reference identifier '{1}' declared in the constructor."),
    This_condition_will_always_return_0: diag(2845, 1 /* Error */, "This_condition_will_always_return_0_2845", "This condition will always return '{0}'."),
    A_declaration_file_cannot_be_imported_without_import_type_Did_you_mean_to_import_an_implementation_file_0_instead: diag(2846, 1 /* Error */, "A_declaration_file_cannot_be_imported_without_import_type_Did_you_mean_to_import_an_implementation_f_2846", "A declaration file cannot be imported without 'import type'. Did you mean to import an implementation file '{0}' instead?"),
    The_right_hand_side_of_an_instanceof_expression_must_not_be_an_instantiation_expression: diag(2848, 1 /* Error */, "The_right_hand_side_of_an_instanceof_expression_must_not_be_an_instantiation_expression_2848", "The right-hand side of an 'instanceof' expression must not be an instantiation expression."),
    Target_signature_provides_too_few_arguments_Expected_0_or_more_but_got_1: diag(2849, 1 /* Error */, "Target_signature_provides_too_few_arguments_Expected_0_or_more_but_got_1_2849", "Target signature provides too few arguments. Expected {0} or more, but got {1}."),
    The_initializer_of_a_using_declaration_must_be_either_an_object_with_a_Symbol_dispose_method_or_be_null_or_undefined: diag(2850, 1 /* Error */, "The_initializer_of_a_using_declaration_must_be_either_an_object_with_a_Symbol_dispose_method_or_be_n_2850", "The initializer of a 'using' declaration must be either an object with a '[Symbol.dispose]()' method, or be 'null' or 'undefined'."),
    The_initializer_of_an_await_using_declaration_must_be_either_an_object_with_a_Symbol_asyncDispose_or_Symbol_dispose_method_or_be_null_or_undefined: diag(2851, 1 /* Error */, "The_initializer_of_an_await_using_declaration_must_be_either_an_object_with_a_Symbol_asyncDispose_or_2851", "The initializer of an 'await using' declaration must be either an object with a '[Symbol.asyncDispose]()' or '[Symbol.dispose]()' method, or be 'null' or 'undefined'."),
    await_using_statements_are_only_allowed_within_async_functions_and_at_the_top_levels_of_modules: diag(2852, 1 /* Error */, "await_using_statements_are_only_allowed_within_async_functions_and_at_the_top_levels_of_modules_2852", "'await using' statements are only allowed within async functions and at the top levels of modules."),
    await_using_statements_are_only_allowed_at_the_top_level_of_a_file_when_that_file_is_a_module_but_this_file_has_no_imports_or_exports_Consider_adding_an_empty_export_to_make_this_file_a_module: diag(2853, 1 /* Error */, "await_using_statements_are_only_allowed_at_the_top_level_of_a_file_when_that_file_is_a_module_but_th_2853", "'await using' statements are only allowed at the top level of a file when that file is a module, but this file has no imports or exports. Consider adding an empty 'export {}' to make this file a module."),
    Top_level_await_using_statements_are_only_allowed_when_the_module_option_is_set_to_es2022_esnext_system_node16_nodenext_or_preserve_and_the_target_option_is_set_to_es2017_or_higher: diag(2854, 1 /* Error */, "Top_level_await_using_statements_are_only_allowed_when_the_module_option_is_set_to_es2022_esnext_sys_2854", "Top-level 'await using' statements are only allowed when the 'module' option is set to 'es2022', 'esnext', 'system', 'node16', 'nodenext', or 'preserve', and the 'target' option is set to 'es2017' or higher."),
    Class_field_0_defined_by_the_parent_class_is_not_accessible_in_the_child_class_via_super: diag(2855, 1 /* Error */, "Class_field_0_defined_by_the_parent_class_is_not_accessible_in_the_child_class_via_super_2855", "Class field '{0}' defined by the parent class is not accessible in the child class via super."),
    Import_attributes_are_not_allowed_on_statements_that_compile_to_CommonJS_require_calls: diag(2856, 1 /* Error */, "Import_attributes_are_not_allowed_on_statements_that_compile_to_CommonJS_require_calls_2856", "Import attributes are not allowed on statements that compile to CommonJS 'require' calls."),
    Import_attributes_cannot_be_used_with_type_only_imports_or_exports: diag(2857, 1 /* Error */, "Import_attributes_cannot_be_used_with_type_only_imports_or_exports_2857", "Import attributes cannot be used with type-only imports or exports."),
    Import_attribute_values_must_be_string_literal_expressions: diag(2858, 1 /* Error */, "Import_attribute_values_must_be_string_literal_expressions_2858", "Import attribute values must be string literal expressions."),
    Excessive_complexity_comparing_types_0_and_1: diag(2859, 1 /* Error */, "Excessive_complexity_comparing_types_0_and_1_2859", "Excessive complexity comparing types '{0}' and '{1}'."),
    The_left_hand_side_of_an_instanceof_expression_must_be_assignable_to_the_first_argument_of_the_right_hand_side_s_Symbol_hasInstance_method: diag(2860, 1 /* Error */, "The_left_hand_side_of_an_instanceof_expression_must_be_assignable_to_the_first_argument_of_the_right_2860", "The left-hand side of an 'instanceof' expression must be assignable to the first argument of the right-hand side's '[Symbol.hasInstance]' method."),
    An_object_s_Symbol_hasInstance_method_must_return_a_boolean_value_for_it_to_be_used_on_the_right_hand_side_of_an_instanceof_expression: diag(2861, 1 /* Error */, "An_object_s_Symbol_hasInstance_method_must_return_a_boolean_value_for_it_to_be_used_on_the_right_han_2861", "An object's '[Symbol.hasInstance]' method must return a boolean value for it to be used on the right-hand side of an 'instanceof' expression."),
    Type_0_is_generic_and_can_only_be_indexed_for_reading: diag(2862, 1 /* Error */, "Type_0_is_generic_and_can_only_be_indexed_for_reading_2862", "Type '{0}' is generic and can only be indexed for reading."),
    A_class_cannot_extend_a_primitive_type_like_0_Classes_can_only_extend_constructable_values: diag(2863, 1 /* Error */, "A_class_cannot_extend_a_primitive_type_like_0_Classes_can_only_extend_constructable_values_2863", "A class cannot extend a primitive type like '{0}'. Classes can only extend constructable values."),
    A_class_cannot_implement_a_primitive_type_like_0_It_can_only_implement_other_named_object_types: diag(2864, 1 /* Error */, "A_class_cannot_implement_a_primitive_type_like_0_It_can_only_implement_other_named_object_types_2864", "A class cannot implement a primitive type like '{0}'. It can only implement other named object types."),
    Import_0_conflicts_with_local_value_so_must_be_declared_with_a_type_only_import_when_isolatedModules_is_enabled: diag(2865, 1 /* Error */, "Import_0_conflicts_with_local_value_so_must_be_declared_with_a_type_only_import_when_isolatedModules_2865", "Import '{0}' conflicts with local value, so must be declared with a type-only import when 'isolatedModules' is enabled."),
    Import_0_conflicts_with_global_value_used_in_this_file_so_must_be_declared_with_a_type_only_import_when_isolatedModules_is_enabled: diag(2866, 1 /* Error */, "Import_0_conflicts_with_global_value_used_in_this_file_so_must_be_declared_with_a_type_only_import_w_2866", "Import '{0}' conflicts with global value used in this file, so must be declared with a type-only import when 'isolatedModules' is enabled."),
    Cannot_find_name_0_Do_you_need_to_install_type_definitions_for_Bun_Try_npm_i_save_dev_types_Slashbun: diag(2867, 1 /* Error */, "Cannot_find_name_0_Do_you_need_to_install_type_definitions_for_Bun_Try_npm_i_save_dev_types_Slashbun_2867", "Cannot find name '{0}'. Do you need to install type definitions for Bun? Try `npm i --save-dev @types/bun`."),
    Cannot_find_name_0_Do_you_need_to_install_type_definitions_for_Bun_Try_npm_i_save_dev_types_Slashbun_and_then_add_bun_to_the_types_field_in_your_tsconfig: diag(2868, 1 /* Error */, "Cannot_find_name_0_Do_you_need_to_install_type_definitions_for_Bun_Try_npm_i_save_dev_types_Slashbun_2868", "Cannot find name '{0}'. Do you need to install type definitions for Bun? Try `npm i --save-dev @types/bun` and then add 'bun' to the types field in your tsconfig."),
    Import_declaration_0_is_using_private_name_1: diag(4e3, 1 /* Error */, "Import_declaration_0_is_using_private_name_1_4000", "Import declaration '{0}' is using private name '{1}'."),
    Type_parameter_0_of_exported_class_has_or_is_using_private_name_1: diag(4002, 1 /* Error */, "Type_parameter_0_of_exported_class_has_or_is_using_private_name_1_4002", "Type parameter '{0}' of exported class has or is using private name '{1}'."),
    Type_parameter_0_of_exported_interface_has_or_is_using_private_name_1: diag(4004, 1 /* Error */, "Type_parameter_0_of_exported_interface_has_or_is_using_private_name_1_4004", "Type parameter '{0}' of exported interface has or is using private name '{1}'."),
    Type_parameter_0_of_constructor_signature_from_exported_interface_has_or_is_using_private_name_1: diag(4006, 1 /* Error */, "Type_parameter_0_of_constructor_signature_from_exported_interface_has_or_is_using_private_name_1_4006", "Type parameter '{0}' of constructor signature from exported interface has or is using private name '{1}'."),
    Type_parameter_0_of_call_signature_from_exported_interface_has_or_is_using_private_name_1: diag(4008, 1 /* Error */, "Type_parameter_0_of_call_signature_from_exported_interface_has_or_is_using_private_name_1_4008", "Type parameter '{0}' of call signature from exported interface has or is using private name '{1}'."),
    Type_parameter_0_of_public_static_method_from_exported_class_has_or_is_using_private_name_1: diag(4010, 1 /* Error */, "Type_parameter_0_of_public_static_method_from_exported_class_has_or_is_using_private_name_1_4010", "Type parameter '{0}' of public static method from exported class has or is using private name '{1}'."),
    Type_parameter_0_of_public_method_from_exported_class_has_or_is_using_private_name_1: diag(4012, 1 /* Error */, "Type_parameter_0_of_public_method_from_exported_class_has_or_is_using_private_name_1_4012", "Type parameter '{0}' of public method from exported class has or is using private name '{1}'."),
    Type_parameter_0_of_method_from_exported_interface_has_or_is_using_private_name_1: diag(4014, 1 /* Error */, "Type_parameter_0_of_method_from_exported_interface_has_or_is_using_private_name_1_4014", "Type parameter '{0}' of method from exported interface has or is using private name '{1}'."),
    Type_parameter_0_of_exported_function_has_or_is_using_private_name_1: diag(4016, 1 /* Error */, "Type_parameter_0_of_exported_function_has_or_is_using_private_name_1_4016", "Type parameter '{0}' of exported function has or is using private name '{1}'."),
    Implements_clause_of_exported_class_0_has_or_is_using_private_name_1: diag(4019, 1 /* Error */, "Implements_clause_of_exported_class_0_has_or_is_using_private_name_1_4019", "Implements clause of exported class '{0}' has or is using private name '{1}'."),
    extends_clause_of_exported_class_0_has_or_is_using_private_name_1: diag(4020, 1 /* Error */, "extends_clause_of_exported_class_0_has_or_is_using_private_name_1_4020", "'extends' clause of exported class '{0}' has or is using private name '{1}'."),
    extends_clause_of_exported_class_has_or_is_using_private_name_0: diag(4021, 1 /* Error */, "extends_clause_of_exported_class_has_or_is_using_private_name_0_4021", "'extends' clause of exported class has or is using private name '{0}'."),
    extends_clause_of_exported_interface_0_has_or_is_using_private_name_1: diag(4022, 1 /* Error */, "extends_clause_of_exported_interface_0_has_or_is_using_private_name_1_4022", "'extends' clause of exported interface '{0}' has or is using private name '{1}'."),
    Exported_variable_0_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named: diag(4023, 1 /* Error */, "Exported_variable_0_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named_4023", "Exported variable '{0}' has or is using name '{1}' from external module {2} but cannot be named."),
    Exported_variable_0_has_or_is_using_name_1_from_private_module_2: diag(4024, 1 /* Error */, "Exported_variable_0_has_or_is_using_name_1_from_private_module_2_4024", "Exported variable '{0}' has or is using name '{1}' from private module '{2}'."),
    Exported_variable_0_has_or_is_using_private_name_1: diag(4025, 1 /* Error */, "Exported_variable_0_has_or_is_using_private_name_1_4025", "Exported variable '{0}' has or is using private name '{1}'."),
    Public_static_property_0_of_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named: diag(4026, 1 /* Error */, "Public_static_property_0_of_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot__4026", "Public static property '{0}' of exported class has or is using name '{1}' from external module {2} but cannot be named."),
    Public_static_property_0_of_exported_class_has_or_is_using_name_1_from_private_module_2: diag(4027, 1 /* Error */, "Public_static_property_0_of_exported_class_has_or_is_using_name_1_from_private_module_2_4027", "Public static property '{0}' of exported class has or is using name '{1}' from private module '{2}'."),
    Public_static_property_0_of_exported_class_has_or_is_using_private_name_1: diag(4028, 1 /* Error */, "Public_static_property_0_of_exported_class_has_or_is_using_private_name_1_4028", "Public static property '{0}' of exported class has or is using private name '{1}'."),
    Public_property_0_of_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named: diag(4029, 1 /* Error */, "Public_property_0_of_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot_be_name_4029", "Public property '{0}' of exported class has or is using name '{1}' from external module {2} but cannot be named."),
    Public_property_0_of_exported_class_has_or_is_using_name_1_from_private_module_2: diag(4030, 1 /* Error */, "Public_property_0_of_exported_class_has_or_is_using_name_1_from_private_module_2_4030", "Public property '{0}' of exported class has or is using name '{1}' from private module '{2}'."),
    Public_property_0_of_exported_class_has_or_is_using_private_name_1: diag(4031, 1 /* Error */, "Public_property_0_of_exported_class_has_or_is_using_private_name_1_4031", "Public property '{0}' of exported class has or is using private name '{1}'."),
    Property_0_of_exported_interface_has_or_is_using_name_1_from_private_module_2: diag(4032, 1 /* Error */, "Property_0_of_exported_interface_has_or_is_using_name_1_from_private_module_2_4032", "Property '{0}' of exported interface has or is using name '{1}' from private module '{2}'."),
    Property_0_of_exported_interface_has_or_is_using_private_name_1: diag(4033, 1 /* Error */, "Property_0_of_exported_interface_has_or_is_using_private_name_1_4033", "Property '{0}' of exported interface has or is using private name '{1}'."),
    Parameter_type_of_public_static_setter_0_from_exported_class_has_or_is_using_name_1_from_private_module_2: diag(4034, 1 /* Error */, "Parameter_type_of_public_static_setter_0_from_exported_class_has_or_is_using_name_1_from_private_mod_4034", "Parameter type of public static setter '{0}' from exported class has or is using name '{1}' from private module '{2}'."),
    Parameter_type_of_public_static_setter_0_from_exported_class_has_or_is_using_private_name_1: diag(4035, 1 /* Error */, "Parameter_type_of_public_static_setter_0_from_exported_class_has_or_is_using_private_name_1_4035", "Parameter type of public static setter '{0}' from exported class has or is using private name '{1}'."),
    Parameter_type_of_public_setter_0_from_exported_class_has_or_is_using_name_1_from_private_module_2: diag(4036, 1 /* Error */, "Parameter_type_of_public_setter_0_from_exported_class_has_or_is_using_name_1_from_private_module_2_4036", "Parameter type of public setter '{0}' from exported class has or is using name '{1}' from private module '{2}'."),
    Parameter_type_of_public_setter_0_from_exported_class_has_or_is_using_private_name_1: diag(4037, 1 /* Error */, "Parameter_type_of_public_setter_0_from_exported_class_has_or_is_using_private_name_1_4037", "Parameter type of public setter '{0}' from exported class has or is using private name '{1}'."),
    Return_type_of_public_static_getter_0_from_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named: diag(4038, 1 /* Error */, "Return_type_of_public_static_getter_0_from_exported_class_has_or_is_using_name_1_from_external_modul_4038", "Return type of public static getter '{0}' from exported class has or is using name '{1}' from external module {2} but cannot be named."),
    Return_type_of_public_static_getter_0_from_exported_class_has_or_is_using_name_1_from_private_module_2: diag(4039, 1 /* Error */, "Return_type_of_public_static_getter_0_from_exported_class_has_or_is_using_name_1_from_private_module_4039", "Return type of public static getter '{0}' from exported class has or is using name '{1}' from private module '{2}'."),
    Return_type_of_public_static_getter_0_from_exported_class_has_or_is_using_private_name_1: diag(4040, 1 /* Error */, "Return_type_of_public_static_getter_0_from_exported_class_has_or_is_using_private_name_1_4040", "Return type of public static getter '{0}' from exported class has or is using private name '{1}'."),
    Return_type_of_public_getter_0_from_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named: diag(4041, 1 /* Error */, "Return_type_of_public_getter_0_from_exported_class_has_or_is_using_name_1_from_external_module_2_but_4041", "Return type of public getter '{0}' from exported class has or is using name '{1}' from external module {2} but cannot be named."),
    Return_type_of_public_getter_0_from_exported_class_has_or_is_using_name_1_from_private_module_2: diag(4042, 1 /* Error */, "Return_type_of_public_getter_0_from_exported_class_has_or_is_using_name_1_from_private_module_2_4042", "Return type of public getter '{0}' from exported class has or is using name '{1}' from private module '{2}'."),
    Return_type_of_public_getter_0_from_exported_class_has_or_is_using_private_name_1: diag(4043, 1 /* Error */, "Return_type_of_public_getter_0_from_exported_class_has_or_is_using_private_name_1_4043", "Return type of public getter '{0}' from exported class has or is using private name '{1}'."),
    Return_type_of_constructor_signature_from_exported_interface_has_or_is_using_name_0_from_private_module_1: diag(4044, 1 /* Error */, "Return_type_of_constructor_signature_from_exported_interface_has_or_is_using_name_0_from_private_mod_4044", "Return type of constructor signature from exported interface has or is using name '{0}' from private module '{1}'."),
    Return_type_of_constructor_signature_from_exported_interface_has_or_is_using_private_name_0: diag(4045, 1 /* Error */, "Return_type_of_constructor_signature_from_exported_interface_has_or_is_using_private_name_0_4045", "Return type of constructor signature from exported interface has or is using private name '{0}'."),
    Return_type_of_call_signature_from_exported_interface_has_or_is_using_name_0_from_private_module_1: diag(4046, 1 /* Error */, "Return_type_of_call_signature_from_exported_interface_has_or_is_using_name_0_from_private_module_1_4046", "Return type of call signature from exported interface has or is using name '{0}' from private module '{1}'."),
    Return_type_of_call_signature_from_exported_interface_has_or_is_using_private_name_0: diag(4047, 1 /* Error */, "Return_type_of_call_signature_from_exported_interface_has_or_is_using_private_name_0_4047", "Return type of call signature from exported interface has or is using private name '{0}'."),
    Return_type_of_index_signature_from_exported_interface_has_or_is_using_name_0_from_private_module_1: diag(4048, 1 /* Error */, "Return_type_of_index_signature_from_exported_interface_has_or_is_using_name_0_from_private_module_1_4048", "Return type of index signature from exported interface has or is using name '{0}' from private module '{1}'."),
    Return_type_of_index_signature_from_exported_interface_has_or_is_using_private_name_0: diag(4049, 1 /* Error */, "Return_type_of_index_signature_from_exported_interface_has_or_is_using_private_name_0_4049", "Return type of index signature from exported interface has or is using private name '{0}'."),
    Return_type_of_public_static_method_from_exported_class_has_or_is_using_name_0_from_external_module_1_but_cannot_be_named: diag(4050, 1 /* Error */, "Return_type_of_public_static_method_from_exported_class_has_or_is_using_name_0_from_external_module__4050", "Return type of public static method from exported class has or is using name '{0}' from external module {1} but cannot be named."),
    Return_type_of_public_static_method_from_exported_class_has_or_is_using_name_0_from_private_module_1: diag(4051, 1 /* Error */, "Return_type_of_public_static_method_from_exported_class_has_or_is_using_name_0_from_private_module_1_4051", "Return type of public static method from exported class has or is using name '{0}' from private module '{1}'."),
    Return_type_of_public_static_method_from_exported_class_has_or_is_using_private_name_0: diag(4052, 1 /* Error */, "Return_type_of_public_static_method_from_exported_class_has_or_is_using_private_name_0_4052", "Return type of public static method from exported class has or is using private name '{0}'."),
    Return_type_of_public_method_from_exported_class_has_or_is_using_name_0_from_external_module_1_but_cannot_be_named: diag(4053, 1 /* Error */, "Return_type_of_public_method_from_exported_class_has_or_is_using_name_0_from_external_module_1_but_c_4053", "Return type of public method from exported class has or is using name '{0}' from external module {1} but cannot be named."),
    Return_type_of_public_method_from_exported_class_has_or_is_using_name_0_from_private_module_1: diag(4054, 1 /* Error */, "Return_type_of_public_method_from_exported_class_has_or_is_using_name_0_from_private_module_1_4054", "Return type of public method from exported class has or is using name '{0}' from private module '{1}'."),
    Return_type_of_public_method_from_exported_class_has_or_is_using_private_name_0: diag(4055, 1 /* Error */, "Return_type_of_public_method_from_exported_class_has_or_is_using_private_name_0_4055", "Return type of public method from exported class has or is using private name '{0}'."),
    Return_type_of_method_from_exported_interface_has_or_is_using_name_0_from_private_module_1: diag(4056, 1 /* Error */, "Return_type_of_method_from_exported_interface_has_or_is_using_name_0_from_private_module_1_4056", "Return type of method from exported interface has or is using name '{0}' from private module '{1}'."),
    Return_type_of_method_from_exported_interface_has_or_is_using_private_name_0: diag(4057, 1 /* Error */, "Return_type_of_method_from_exported_interface_has_or_is_using_private_name_0_4057", "Return type of method from exported interface has or is using private name '{0}'."),
    Return_type_of_exported_function_has_or_is_using_name_0_from_external_module_1_but_cannot_be_named: diag(4058, 1 /* Error */, "Return_type_of_exported_function_has_or_is_using_name_0_from_external_module_1_but_cannot_be_named_4058", "Return type of exported function has or is using name '{0}' from external module {1} but cannot be named."),
    Return_type_of_exported_function_has_or_is_using_name_0_from_private_module_1: diag(4059, 1 /* Error */, "Return_type_of_exported_function_has_or_is_using_name_0_from_private_module_1_4059", "Return type of exported function has or is using name '{0}' from private module '{1}'."),
    Return_type_of_exported_function_has_or_is_using_private_name_0: diag(4060, 1 /* Error */, "Return_type_of_exported_function_has_or_is_using_private_name_0_4060", "Return type of exported function has or is using private name '{0}'."),
    Parameter_0_of_constructor_from_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named: diag(4061, 1 /* Error */, "Parameter_0_of_constructor_from_exported_class_has_or_is_using_name_1_from_external_module_2_but_can_4061", "Parameter '{0}' of constructor from exported class has or is using name '{1}' from external module {2} but cannot be named."),
    Parameter_0_of_constructor_from_exported_class_has_or_is_using_name_1_from_private_module_2: diag(4062, 1 /* Error */, "Parameter_0_of_constructor_from_exported_class_has_or_is_using_name_1_from_private_module_2_4062", "Parameter '{0}' of constructor from exported class has or is using name '{1}' from private module '{2}'."),
    Parameter_0_of_constructor_from_exported_class_has_or_is_using_private_name_1: diag(4063, 1 /* Error */, "Parameter_0_of_constructor_from_exported_class_has_or_is_using_private_name_1_4063", "Parameter '{0}' of constructor from exported class has or is using private name '{1}'."),
    Parameter_0_of_constructor_signature_from_exported_interface_has_or_is_using_name_1_from_private_module_2: diag(4064, 1 /* Error */, "Parameter_0_of_constructor_signature_from_exported_interface_has_or_is_using_name_1_from_private_mod_4064", "Parameter '{0}' of constructor signature from exported interface has or is using name '{1}' from private module '{2}'."),
    Parameter_0_of_constructor_signature_from_exported_interface_has_or_is_using_private_name_1: diag(4065, 1 /* Error */, "Parameter_0_of_constructor_signature_from_exported_interface_has_or_is_using_private_name_1_4065", "Parameter '{0}' of constructor signature from exported interface has or is using private name '{1}'."),
    Parameter_0_of_call_signature_from_exported_interface_has_or_is_using_name_1_from_private_module_2: diag(4066, 1 /* Error */, "Parameter_0_of_call_signature_from_exported_interface_has_or_is_using_name_1_from_private_module_2_4066", "Parameter '{0}' of call signature from exported interface has or is using name '{1}' from private module '{2}'."),
    Parameter_0_of_call_signature_from_exported_interface_has_or_is_using_private_name_1: diag(4067, 1 /* Error */, "Parameter_0_of_call_signature_from_exported_interface_has_or_is_using_private_name_1_4067", "Parameter '{0}' of call signature from exported interface has or is using private name '{1}'."),
    Parameter_0_of_public_static_method_from_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named: diag(4068, 1 /* Error */, "Parameter_0_of_public_static_method_from_exported_class_has_or_is_using_name_1_from_external_module__4068", "Parameter '{0}' of public static method from exported class has or is using name '{1}' from external module {2} but cannot be named."),
    Parameter_0_of_public_static_method_from_exported_class_has_or_is_using_name_1_from_private_module_2: diag(4069, 1 /* Error */, "Parameter_0_of_public_static_method_from_exported_class_has_or_is_using_name_1_from_private_module_2_4069", "Parameter '{0}' of public static method from exported class has or is using name '{1}' from private module '{2}'."),
    Parameter_0_of_public_static_method_from_exported_class_has_or_is_using_private_name_1: diag(4070, 1 /* Error */, "Parameter_0_of_public_static_method_from_exported_class_has_or_is_using_private_name_1_4070", "Parameter '{0}' of public static method from exported class has or is using private name '{1}'."),
    Parameter_0_of_public_method_from_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named: diag(4071, 1 /* Error */, "Parameter_0_of_public_method_from_exported_class_has_or_is_using_name_1_from_external_module_2_but_c_4071", "Parameter '{0}' of public method from exported class has or is using name '{1}' from external module {2} but cannot be named."),
    Parameter_0_of_public_method_from_exported_class_has_or_is_using_name_1_from_private_module_2: diag(4072, 1 /* Error */, "Parameter_0_of_public_method_from_exported_class_has_or_is_using_name_1_from_private_module_2_4072", "Parameter '{0}' of public method from exported class has or is using name '{1}' from private module '{2}'."),
    Parameter_0_of_public_method_from_exported_class_has_or_is_using_private_name_1: diag(4073, 1 /* Error */, "Parameter_0_of_public_method_from_exported_class_has_or_is_using_private_name_1_4073", "Parameter '{0}' of public method from exported class has or is using private name '{1}'."),
    Parameter_0_of_method_from_exported_interface_has_or_is_using_name_1_from_private_module_2: diag(4074, 1 /* Error */, "Parameter_0_of_method_from_exported_interface_has_or_is_using_name_1_from_private_module_2_4074", "Parameter '{0}' of method from exported interface has or is using name '{1}' from private module '{2}'."),
    Parameter_0_of_method_from_exported_interface_has_or_is_using_private_name_1: diag(4075, 1 /* Error */, "Parameter_0_of_method_from_exported_interface_has_or_is_using_private_name_1_4075", "Parameter '{0}' of method from exported interface has or is using private name '{1}'."),
    Parameter_0_of_exported_function_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named: diag(4076, 1 /* Error */, "Parameter_0_of_exported_function_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named_4076", "Parameter '{0}' of exported function has or is using name '{1}' from external module {2} but cannot be named."),
    Parameter_0_of_exported_function_has_or_is_using_name_1_from_private_module_2: diag(4077, 1 /* Error */, "Parameter_0_of_exported_function_has_or_is_using_name_1_from_private_module_2_4077", "Parameter '{0}' of exported function has or is using name '{1}' from private module '{2}'."),
    Parameter_0_of_exported_function_has_or_is_using_private_name_1: diag(4078, 1 /* Error */, "Parameter_0_of_exported_function_has_or_is_using_private_name_1_4078", "Parameter '{0}' of exported function has or is using private name '{1}'."),
    Exported_type_alias_0_has_or_is_using_private_name_1: diag(4081, 1 /* Error */, "Exported_type_alias_0_has_or_is_using_private_name_1_4081", "Exported type alias '{0}' has or is using private name '{1}'."),
    Default_export_of_the_module_has_or_is_using_private_name_0: diag(4082, 1 /* Error */, "Default_export_of_the_module_has_or_is_using_private_name_0_4082", "Default export of the module has or is using private name '{0}'."),
    Type_parameter_0_of_exported_type_alias_has_or_is_using_private_name_1: diag(4083, 1 /* Error */, "Type_parameter_0_of_exported_type_alias_has_or_is_using_private_name_1_4083", "Type parameter '{0}' of exported type alias has or is using private name '{1}'."),
    Exported_type_alias_0_has_or_is_using_private_name_1_from_module_2: diag(4084, 1 /* Error */, "Exported_type_alias_0_has_or_is_using_private_name_1_from_module_2_4084", "Exported type alias '{0}' has or is using private name '{1}' from module {2}."),
    Extends_clause_for_inferred_type_0_has_or_is_using_private_name_1: diag(4085, 1 /* Error */, "Extends_clause_for_inferred_type_0_has_or_is_using_private_name_1_4085", "Extends clause for inferred type '{0}' has or is using private name '{1}'."),
    Conflicting_definitions_for_0_found_at_1_and_2_Consider_installing_a_specific_version_of_this_library_to_resolve_the_conflict: diag(4090, 1 /* Error */, "Conflicting_definitions_for_0_found_at_1_and_2_Consider_installing_a_specific_version_of_this_librar_4090", "Conflicting definitions for '{0}' found at '{1}' and '{2}'. Consider installing a specific version of this library to resolve the conflict."),
    Parameter_0_of_index_signature_from_exported_interface_has_or_is_using_name_1_from_private_module_2: diag(4091, 1 /* Error */, "Parameter_0_of_index_signature_from_exported_interface_has_or_is_using_name_1_from_private_module_2_4091", "Parameter '{0}' of index signature from exported interface has or is using name '{1}' from private module '{2}'."),
    Parameter_0_of_index_signature_from_exported_interface_has_or_is_using_private_name_1: diag(4092, 1 /* Error */, "Parameter_0_of_index_signature_from_exported_interface_has_or_is_using_private_name_1_4092", "Parameter '{0}' of index signature from exported interface has or is using private name '{1}'."),
    Property_0_of_exported_class_expression_may_not_be_private_or_protected: diag(4094, 1 /* Error */, "Property_0_of_exported_class_expression_may_not_be_private_or_protected_4094", "Property '{0}' of exported class expression may not be private or protected."),
    Public_static_method_0_of_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named: diag(4095, 1 /* Error */, "Public_static_method_0_of_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot_be_4095", "Public static method '{0}' of exported class has or is using name '{1}' from external module {2} but cannot be named."),
    Public_static_method_0_of_exported_class_has_or_is_using_name_1_from_private_module_2: diag(4096, 1 /* Error */, "Public_static_method_0_of_exported_class_has_or_is_using_name_1_from_private_module_2_4096", "Public static method '{0}' of exported class has or is using name '{1}' from private module '{2}'."),
    Public_static_method_0_of_exported_class_has_or_is_using_private_name_1: diag(4097, 1 /* Error */, "Public_static_method_0_of_exported_class_has_or_is_using_private_name_1_4097", "Public static method '{0}' of exported class has or is using private name '{1}'."),
    Public_method_0_of_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named: diag(4098, 1 /* Error */, "Public_method_0_of_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named_4098", "Public method '{0}' of exported class has or is using name '{1}' from external module {2} but cannot be named."),
    Public_method_0_of_exported_class_has_or_is_using_name_1_from_private_module_2: diag(4099, 1 /* Error */, "Public_method_0_of_exported_class_has_or_is_using_name_1_from_private_module_2_4099", "Public method '{0}' of exported class has or is using name '{1}' from private module '{2}'."),
    Public_method_0_of_exported_class_has_or_is_using_private_name_1: diag(4100, 1 /* Error */, "Public_method_0_of_exported_class_has_or_is_using_private_name_1_4100", "Public method '{0}' of exported class has or is using private name '{1}'."),
    Method_0_of_exported_interface_has_or_is_using_name_1_from_private_module_2: diag(4101, 1 /* Error */, "Method_0_of_exported_interface_has_or_is_using_name_1_from_private_module_2_4101", "Method '{0}' of exported interface has or is using name '{1}' from private module '{2}'."),
    Method_0_of_exported_interface_has_or_is_using_private_name_1: diag(4102, 1 /* Error */, "Method_0_of_exported_interface_has_or_is_using_private_name_1_4102", "Method '{0}' of exported interface has or is using private name '{1}'."),
    Type_parameter_0_of_exported_mapped_object_type_is_using_private_name_1: diag(4103, 1 /* Error */, "Type_parameter_0_of_exported_mapped_object_type_is_using_private_name_1_4103", "Type parameter '{0}' of exported mapped object type is using private name '{1}'."),
    The_type_0_is_readonly_and_cannot_be_assigned_to_the_mutable_type_1: diag(4104, 1 /* Error */, "The_type_0_is_readonly_and_cannot_be_assigned_to_the_mutable_type_1_4104", "The type '{0}' is 'readonly' and cannot be assigned to the mutable type '{1}'."),
    Private_or_protected_member_0_cannot_be_accessed_on_a_type_parameter: diag(4105, 1 /* Error */, "Private_or_protected_member_0_cannot_be_accessed_on_a_type_parameter_4105", "Private or protected member '{0}' cannot be accessed on a type parameter."),
    Parameter_0_of_accessor_has_or_is_using_private_name_1: diag(4106, 1 /* Error */, "Parameter_0_of_accessor_has_or_is_using_private_name_1_4106", "Parameter '{0}' of accessor has or is using private name '{1}'."),
    Parameter_0_of_accessor_has_or_is_using_name_1_from_private_module_2: diag(4107, 1 /* Error */, "Parameter_0_of_accessor_has_or_is_using_name_1_from_private_module_2_4107", "Parameter '{0}' of accessor has or is using name '{1}' from private module '{2}'."),
    Parameter_0_of_accessor_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named: diag(4108, 1 /* Error */, "Parameter_0_of_accessor_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named_4108", "Parameter '{0}' of accessor has or is using name '{1}' from external module '{2}' but cannot be named."),
    Type_arguments_for_0_circularly_reference_themselves: diag(4109, 1 /* Error */, "Type_arguments_for_0_circularly_reference_themselves_4109", "Type arguments for '{0}' circularly reference themselves."),
    Tuple_type_arguments_circularly_reference_themselves: diag(4110, 1 /* Error */, "Tuple_type_arguments_circularly_reference_themselves_4110", "Tuple type arguments circularly reference themselves."),
    Property_0_comes_from_an_index_signature_so_it_must_be_accessed_with_0: diag(4111, 1 /* Error */, "Property_0_comes_from_an_index_signature_so_it_must_be_accessed_with_0_4111", "Property '{0}' comes from an index signature, so it must be accessed with ['{0}']."),
    This_member_cannot_have_an_override_modifier_because_its_containing_class_0_does_not_extend_another_class: diag(4112, 1 /* Error */, "This_member_cannot_have_an_override_modifier_because_its_containing_class_0_does_not_extend_another__4112", "This member cannot have an 'override' modifier because its containing class '{0}' does not extend another class."),
    This_member_cannot_have_an_override_modifier_because_it_is_not_declared_in_the_base_class_0: diag(4113, 1 /* Error */, "This_member_cannot_have_an_override_modifier_because_it_is_not_declared_in_the_base_class_0_4113", "This member cannot have an 'override' modifier because it is not declared in the base class '{0}'."),
    This_member_must_have_an_override_modifier_because_it_overrides_a_member_in_the_base_class_0: diag(4114, 1 /* Error */, "This_member_must_have_an_override_modifier_because_it_overrides_a_member_in_the_base_class_0_4114", "This member must have an 'override' modifier because it overrides a member in the base class '{0}'."),
    This_parameter_property_must_have_an_override_modifier_because_it_overrides_a_member_in_base_class_0: diag(4115, 1 /* Error */, "This_parameter_property_must_have_an_override_modifier_because_it_overrides_a_member_in_base_class_0_4115", "This parameter property must have an 'override' modifier because it overrides a member in base class '{0}'."),
    This_member_must_have_an_override_modifier_because_it_overrides_an_abstract_method_that_is_declared_in_the_base_class_0: diag(4116, 1 /* Error */, "This_member_must_have_an_override_modifier_because_it_overrides_an_abstract_method_that_is_declared__4116", "This member must have an 'override' modifier because it overrides an abstract method that is declared in the base class '{0}'."),
    This_member_cannot_have_an_override_modifier_because_it_is_not_declared_in_the_base_class_0_Did_you_mean_1: diag(4117, 1 /* Error */, "This_member_cannot_have_an_override_modifier_because_it_is_not_declared_in_the_base_class_0_Did_you__4117", "This member cannot have an 'override' modifier because it is not declared in the base class '{0}'. Did you mean '{1}'?"),
    The_type_of_this_node_cannot_be_serialized_because_its_property_0_cannot_be_serialized: diag(4118, 1 /* Error */, "The_type_of_this_node_cannot_be_serialized_because_its_property_0_cannot_be_serialized_4118", "The type of this node cannot be serialized because its property '{0}' cannot be serialized."),
    This_member_must_have_a_JSDoc_comment_with_an_override_tag_because_it_overrides_a_member_in_the_base_class_0: diag(4119, 1 /* Error */, "This_member_must_have_a_JSDoc_comment_with_an_override_tag_because_it_overrides_a_member_in_the_base_4119", "This member must have a JSDoc comment with an '@override' tag because it overrides a member in the base class '{0}'."),
    This_parameter_property_must_have_a_JSDoc_comment_with_an_override_tag_because_it_overrides_a_member_in_the_base_class_0: diag(4120, 1 /* Error */, "This_parameter_property_must_have_a_JSDoc_comment_with_an_override_tag_because_it_overrides_a_member_4120", "This parameter property must have a JSDoc comment with an '@override' tag because it overrides a member in the base class '{0}'."),
    This_member_cannot_have_a_JSDoc_comment_with_an_override_tag_because_its_containing_class_0_does_not_extend_another_class: diag(4121, 1 /* Error */, "This_member_cannot_have_a_JSDoc_comment_with_an_override_tag_because_its_containing_class_0_does_not_4121", "This member cannot have a JSDoc comment with an '@override' tag because its containing class '{0}' does not extend another class."),
    This_member_cannot_have_a_JSDoc_comment_with_an_override_tag_because_it_is_not_declared_in_the_base_class_0: diag(4122, 1 /* Error */, "This_member_cannot_have_a_JSDoc_comment_with_an_override_tag_because_it_is_not_declared_in_the_base__4122", "This member cannot have a JSDoc comment with an '@override' tag because it is not declared in the base class '{0}'."),
    This_member_cannot_have_a_JSDoc_comment_with_an_override_tag_because_it_is_not_declared_in_the_base_class_0_Did_you_mean_1: diag(4123, 1 /* Error */, "This_member_cannot_have_a_JSDoc_comment_with_an_override_tag_because_it_is_not_declared_in_the_base__4123", "This member cannot have a JSDoc comment with an 'override' tag because it is not declared in the base class '{0}'. Did you mean '{1}'?"),
    Compiler_option_0_of_value_1_is_unstable_Use_nightly_TypeScript_to_silence_this_error_Try_updating_with_npm_install_D_typescript_next: diag(4124, 1 /* Error */, "Compiler_option_0_of_value_1_is_unstable_Use_nightly_TypeScript_to_silence_this_error_Try_updating_w_4124", "Compiler option '{0}' of value '{1}' is unstable. Use nightly TypeScript to silence this error. Try updating with 'npm install -D typescript@next'."),
    Each_declaration_of_0_1_differs_in_its_value_where_2_was_expected_but_3_was_given: diag(4125, 1 /* Error */, "Each_declaration_of_0_1_differs_in_its_value_where_2_was_expected_but_3_was_given_4125", "Each declaration of '{0}.{1}' differs in its value, where '{2}' was expected but '{3}' was given."),
    One_value_of_0_1_is_the_string_2_and_the_other_is_assumed_to_be_an_unknown_numeric_value: diag(4126, 1 /* Error */, "One_value_of_0_1_is_the_string_2_and_the_other_is_assumed_to_be_an_unknown_numeric_value_4126", "One value of '{0}.{1}' is the string '{2}', and the other is assumed to be an unknown numeric value."),
    The_current_host_does_not_support_the_0_option: diag(5001, 1 /* Error */, "The_current_host_does_not_support_the_0_option_5001", "The current host does not support the '{0}' option."),
    Cannot_find_the_common_subdirectory_path_for_the_input_files: diag(5009, 1 /* Error */, "Cannot_find_the_common_subdirectory_path_for_the_input_files_5009", "Cannot find the common subdirectory path for the input files."),
    File_specification_cannot_end_in_a_recursive_directory_wildcard_Asterisk_Asterisk_Colon_0: diag(5010, 1 /* Error */, "File_specification_cannot_end_in_a_recursive_directory_wildcard_Asterisk_Asterisk_Colon_0_5010", "File specification cannot end in a recursive directory wildcard ('**'): '{0}'."),
    Cannot_read_file_0_Colon_1: diag(5012, 1 /* Error */, "Cannot_read_file_0_Colon_1_5012", "Cannot read file '{0}': {1}."),
    Failed_to_parse_file_0_Colon_1: diag(5014, 1 /* Error */, "Failed_to_parse_file_0_Colon_1_5014", "Failed to parse file '{0}': {1}."),
    Unknown_compiler_option_0: diag(5023, 1 /* Error */, "Unknown_compiler_option_0_5023", "Unknown compiler option '{0}'."),
    Compiler_option_0_requires_a_value_of_type_1: diag(5024, 1 /* Error */, "Compiler_option_0_requires_a_value_of_type_1_5024", "Compiler option '{0}' requires a value of type {1}."),
    Unknown_compiler_option_0_Did_you_mean_1: diag(5025, 1 /* Error */, "Unknown_compiler_option_0_Did_you_mean_1_5025", "Unknown compiler option '{0}'. Did you mean '{1}'?"),
    Could_not_write_file_0_Colon_1: diag(5033, 1 /* Error */, "Could_not_write_file_0_Colon_1_5033", "Could not write file '{0}': {1}."),
    Option_project_cannot_be_mixed_with_source_files_on_a_command_line: diag(5042, 1 /* Error */, "Option_project_cannot_be_mixed_with_source_files_on_a_command_line_5042", "Option 'project' cannot be mixed with source files on a command line."),
    Option_isolatedModules_can_only_be_used_when_either_option_module_is_provided_or_option_target_is_ES2015_or_higher: diag(5047, 1 /* Error */, "Option_isolatedModules_can_only_be_used_when_either_option_module_is_provided_or_option_target_is_ES_5047", "Option 'isolatedModules' can only be used when either option '--module' is provided or option 'target' is 'ES2015' or higher."),
    Option_0_cannot_be_specified_when_option_target_is_ES3: diag(5048, 1 /* Error */, "Option_0_cannot_be_specified_when_option_target_is_ES3_5048", "Option '{0}' cannot be specified when option 'target' is 'ES3'."),
    Option_0_can_only_be_used_when_either_option_inlineSourceMap_or_option_sourceMap_is_provided: diag(5051, 1 /* Error */, "Option_0_can_only_be_used_when_either_option_inlineSourceMap_or_option_sourceMap_is_provided_5051", "Option '{0} can only be used when either option '--inlineSourceMap' or option '--sourceMap' is provided."),
    Option_0_cannot_be_specified_without_specifying_option_1: diag(5052, 1 /* Error */, "Option_0_cannot_be_specified_without_specifying_option_1_5052", "Option '{0}' cannot be specified without specifying option '{1}'."),
    Option_0_cannot_be_specified_with_option_1: diag(5053, 1 /* Error */, "Option_0_cannot_be_specified_with_option_1_5053", "Option '{0}' cannot be specified with option '{1}'."),
    A_tsconfig_json_file_is_already_defined_at_Colon_0: diag(5054, 1 /* Error */, "A_tsconfig_json_file_is_already_defined_at_Colon_0_5054", "A 'tsconfig.json' file is already defined at: '{0}'."),
    Cannot_write_file_0_because_it_would_overwrite_input_file: diag(5055, 1 /* Error */, "Cannot_write_file_0_because_it_would_overwrite_input_file_5055", "Cannot write file '{0}' because it would overwrite input file."),
    Cannot_write_file_0_because_it_would_be_overwritten_by_multiple_input_files: diag(5056, 1 /* Error */, "Cannot_write_file_0_because_it_would_be_overwritten_by_multiple_input_files_5056", "Cannot write file '{0}' because it would be overwritten by multiple input files."),
    Cannot_find_a_tsconfig_json_file_at_the_specified_directory_Colon_0: diag(5057, 1 /* Error */, "Cannot_find_a_tsconfig_json_file_at_the_specified_directory_Colon_0_5057", "Cannot find a tsconfig.json file at the specified directory: '{0}'."),
    The_specified_path_does_not_exist_Colon_0: diag(5058, 1 /* Error */, "The_specified_path_does_not_exist_Colon_0_5058", "The specified path does not exist: '{0}'."),
    Invalid_value_for_reactNamespace_0_is_not_a_valid_identifier: diag(5059, 1 /* Error */, "Invalid_value_for_reactNamespace_0_is_not_a_valid_identifier_5059", "Invalid value for '--reactNamespace'. '{0}' is not a valid identifier."),
    Pattern_0_can_have_at_most_one_Asterisk_character: diag(5061, 1 /* Error */, "Pattern_0_can_have_at_most_one_Asterisk_character_5061", "Pattern '{0}' can have at most one '*' character."),
    Substitution_0_in_pattern_1_can_have_at_most_one_Asterisk_character: diag(5062, 1 /* Error */, "Substitution_0_in_pattern_1_can_have_at_most_one_Asterisk_character_5062", "Substitution '{0}' in pattern '{1}' can have at most one '*' character."),
    Substitutions_for_pattern_0_should_be_an_array: diag(5063, 1 /* Error */, "Substitutions_for_pattern_0_should_be_an_array_5063", "Substitutions for pattern '{0}' should be an array."),
    Substitution_0_for_pattern_1_has_incorrect_type_expected_string_got_2: diag(5064, 1 /* Error */, "Substitution_0_for_pattern_1_has_incorrect_type_expected_string_got_2_5064", "Substitution '{0}' for pattern '{1}' has incorrect type, expected 'string', got '{2}'."),
    File_specification_cannot_contain_a_parent_directory_that_appears_after_a_recursive_directory_wildcard_Asterisk_Asterisk_Colon_0: diag(5065, 1 /* Error */, "File_specification_cannot_contain_a_parent_directory_that_appears_after_a_recursive_directory_wildca_5065", "File specification cannot contain a parent directory ('..') that appears after a recursive directory wildcard ('**'): '{0}'."),
    Substitutions_for_pattern_0_shouldn_t_be_an_empty_array: diag(5066, 1 /* Error */, "Substitutions_for_pattern_0_shouldn_t_be_an_empty_array_5066", "Substitutions for pattern '{0}' shouldn't be an empty array."),
    Invalid_value_for_jsxFactory_0_is_not_a_valid_identifier_or_qualified_name: diag(5067, 1 /* Error */, "Invalid_value_for_jsxFactory_0_is_not_a_valid_identifier_or_qualified_name_5067", "Invalid value for 'jsxFactory'. '{0}' is not a valid identifier or qualified-name."),
    Adding_a_tsconfig_json_file_will_help_organize_projects_that_contain_both_TypeScript_and_JavaScript_files_Learn_more_at_https_Colon_Slash_Slashaka_ms_Slashtsconfig: diag(5068, 1 /* Error */, "Adding_a_tsconfig_json_file_will_help_organize_projects_that_contain_both_TypeScript_and_JavaScript__5068", "Adding a tsconfig.json file will help organize projects that contain both TypeScript and JavaScript files. Learn more at https://aka.ms/tsconfig."),
    Option_0_cannot_be_specified_without_specifying_option_1_or_option_2: diag(5069, 1 /* Error */, "Option_0_cannot_be_specified_without_specifying_option_1_or_option_2_5069", "Option '{0}' cannot be specified without specifying option '{1}' or option '{2}'."),
    Option_resolveJsonModule_cannot_be_specified_when_moduleResolution_is_set_to_classic: diag(5070, 1 /* Error */, "Option_resolveJsonModule_cannot_be_specified_when_moduleResolution_is_set_to_classic_5070", "Option '--resolveJsonModule' cannot be specified when 'moduleResolution' is set to 'classic'."),
    Option_resolveJsonModule_cannot_be_specified_when_module_is_set_to_none_system_or_umd: diag(5071, 1 /* Error */, "Option_resolveJsonModule_cannot_be_specified_when_module_is_set_to_none_system_or_umd_5071", "Option '--resolveJsonModule' cannot be specified when 'module' is set to 'none', 'system', or 'umd'."),
    Unknown_build_option_0: diag(5072, 1 /* Error */, "Unknown_build_option_0_5072", "Unknown build option '{0}'."),
    Build_option_0_requires_a_value_of_type_1: diag(5073, 1 /* Error */, "Build_option_0_requires_a_value_of_type_1_5073", "Build option '{0}' requires a value of type {1}."),
    Option_incremental_can_only_be_specified_using_tsconfig_emitting_to_single_file_or_when_option_tsBuildInfoFile_is_specified: diag(5074, 1 /* Error */, "Option_incremental_can_only_be_specified_using_tsconfig_emitting_to_single_file_or_when_option_tsBui_5074", "Option '--incremental' can only be specified using tsconfig, emitting to single file or when option '--tsBuildInfoFile' is specified."),
    _0_is_assignable_to_the_constraint_of_type_1_but_1_could_be_instantiated_with_a_different_subtype_of_constraint_2: diag(5075, 1 /* Error */, "_0_is_assignable_to_the_constraint_of_type_1_but_1_could_be_instantiated_with_a_different_subtype_of_5075", "'{0}' is assignable to the constraint of type '{1}', but '{1}' could be instantiated with a different subtype of constraint '{2}'."),
    _0_and_1_operations_cannot_be_mixed_without_parentheses: diag(5076, 1 /* Error */, "_0_and_1_operations_cannot_be_mixed_without_parentheses_5076", "'{0}' and '{1}' operations cannot be mixed without parentheses."),
    Unknown_build_option_0_Did_you_mean_1: diag(5077, 1 /* Error */, "Unknown_build_option_0_Did_you_mean_1_5077", "Unknown build option '{0}'. Did you mean '{1}'?"),
    Unknown_watch_option_0: diag(5078, 1 /* Error */, "Unknown_watch_option_0_5078", "Unknown watch option '{0}'."),
    Unknown_watch_option_0_Did_you_mean_1: diag(5079, 1 /* Error */, "Unknown_watch_option_0_Did_you_mean_1_5079", "Unknown watch option '{0}'. Did you mean '{1}'?"),
    Watch_option_0_requires_a_value_of_type_1: diag(5080, 1 /* Error */, "Watch_option_0_requires_a_value_of_type_1_5080", "Watch option '{0}' requires a value of type {1}."),
    Cannot_find_a_tsconfig_json_file_at_the_current_directory_Colon_0: diag(5081, 1 /* Error */, "Cannot_find_a_tsconfig_json_file_at_the_current_directory_Colon_0_5081", "Cannot find a tsconfig.json file at the current directory: {0}."),
    _0_could_be_instantiated_with_an_arbitrary_type_which_could_be_unrelated_to_1: diag(5082, 1 /* Error */, "_0_could_be_instantiated_with_an_arbitrary_type_which_could_be_unrelated_to_1_5082", "'{0}' could be instantiated with an arbitrary type which could be unrelated to '{1}'."),
    Cannot_read_file_0: diag(5083, 1 /* Error */, "Cannot_read_file_0_5083", "Cannot read file '{0}'."),
    A_tuple_member_cannot_be_both_optional_and_rest: diag(5085, 1 /* Error */, "A_tuple_member_cannot_be_both_optional_and_rest_5085", "A tuple member cannot be both optional and rest."),
    A_labeled_tuple_element_is_declared_as_optional_with_a_question_mark_after_the_name_and_before_the_colon_rather_than_after_the_type: diag(5086, 1 /* Error */, "A_labeled_tuple_element_is_declared_as_optional_with_a_question_mark_after_the_name_and_before_the_c_5086", "A labeled tuple element is declared as optional with a question mark after the name and before the colon, rather than after the type."),
    A_labeled_tuple_element_is_declared_as_rest_with_a_before_the_name_rather_than_before_the_type: diag(5087, 1 /* Error */, "A_labeled_tuple_element_is_declared_as_rest_with_a_before_the_name_rather_than_before_the_type_5087", "A labeled tuple element is declared as rest with a '...' before the name, rather than before the type."),
    The_inferred_type_of_0_references_a_type_with_a_cyclic_structure_which_cannot_be_trivially_serialized_A_type_annotation_is_necessary: diag(5088, 1 /* Error */, "The_inferred_type_of_0_references_a_type_with_a_cyclic_structure_which_cannot_be_trivially_serialize_5088", "The inferred type of '{0}' references a type with a cyclic structure which cannot be trivially serialized. A type annotation is necessary."),
    Option_0_cannot_be_specified_when_option_jsx_is_1: diag(5089, 1 /* Error */, "Option_0_cannot_be_specified_when_option_jsx_is_1_5089", "Option '{0}' cannot be specified when option 'jsx' is '{1}'."),
    Non_relative_paths_are_not_allowed_when_baseUrl_is_not_set_Did_you_forget_a_leading_Slash: diag(5090, 1 /* Error */, "Non_relative_paths_are_not_allowed_when_baseUrl_is_not_set_Did_you_forget_a_leading_Slash_5090", "Non-relative paths are not allowed when 'baseUrl' is not set. Did you forget a leading './'?"),
    Option_preserveConstEnums_cannot_be_disabled_when_0_is_enabled: diag(5091, 1 /* Error */, "Option_preserveConstEnums_cannot_be_disabled_when_0_is_enabled_5091", "Option 'preserveConstEnums' cannot be disabled when '{0}' is enabled."),
    The_root_value_of_a_0_file_must_be_an_object: diag(5092, 1 /* Error */, "The_root_value_of_a_0_file_must_be_an_object_5092", "The root value of a '{0}' file must be an object."),
    Compiler_option_0_may_only_be_used_with_build: diag(5093, 1 /* Error */, "Compiler_option_0_may_only_be_used_with_build_5093", "Compiler option '--{0}' may only be used with '--build'."),
    Compiler_option_0_may_not_be_used_with_build: diag(5094, 1 /* Error */, "Compiler_option_0_may_not_be_used_with_build_5094", "Compiler option '--{0}' may not be used with '--build'."),
    Option_0_can_only_be_used_when_module_is_set_to_preserve_or_to_es2015_or_later: diag(5095, 1 /* Error */, "Option_0_can_only_be_used_when_module_is_set_to_preserve_or_to_es2015_or_later_5095", "Option '{0}' can only be used when 'module' is set to 'preserve' or to 'es2015' or later."),
    Option_allowImportingTsExtensions_can_only_be_used_when_either_noEmit_or_emitDeclarationOnly_is_set: diag(5096, 1 /* Error */, "Option_allowImportingTsExtensions_can_only_be_used_when_either_noEmit_or_emitDeclarationOnly_is_set_5096", "Option 'allowImportingTsExtensions' can only be used when either 'noEmit' or 'emitDeclarationOnly' is set."),
    An_import_path_can_only_end_with_a_0_extension_when_allowImportingTsExtensions_is_enabled: diag(5097, 1 /* Error */, "An_import_path_can_only_end_with_a_0_extension_when_allowImportingTsExtensions_is_enabled_5097", "An import path can only end with a '{0}' extension when 'allowImportingTsExtensions' is enabled."),
    Option_0_can_only_be_used_when_moduleResolution_is_set_to_node16_nodenext_or_bundler: diag(5098, 1 /* Error */, "Option_0_can_only_be_used_when_moduleResolution_is_set_to_node16_nodenext_or_bundler_5098", "Option '{0}' can only be used when 'moduleResolution' is set to 'node16', 'nodenext', or 'bundler'."),
    Option_0_is_deprecated_and_will_stop_functioning_in_TypeScript_1_Specify_compilerOption_ignoreDeprecations_Colon_2_to_silence_this_error: diag(5101, 1 /* Error */, "Option_0_is_deprecated_and_will_stop_functioning_in_TypeScript_1_Specify_compilerOption_ignoreDeprec_5101", `Option '{0}' is deprecated and will stop functioning in TypeScript {1}. Specify compilerOption '"ignoreDeprecations": "{2}"' to silence this error.`),
    Option_0_has_been_removed_Please_remove_it_from_your_configuration: diag(5102, 1 /* Error */, "Option_0_has_been_removed_Please_remove_it_from_your_configuration_5102", "Option '{0}' has been removed. Please remove it from your configuration."),
    Invalid_value_for_ignoreDeprecations: diag(5103, 1 /* Error */, "Invalid_value_for_ignoreDeprecations_5103", "Invalid value for '--ignoreDeprecations'."),
    Option_0_is_redundant_and_cannot_be_specified_with_option_1: diag(5104, 1 /* Error */, "Option_0_is_redundant_and_cannot_be_specified_with_option_1_5104", "Option '{0}' is redundant and cannot be specified with option '{1}'."),
    Option_verbatimModuleSyntax_cannot_be_used_when_module_is_set_to_UMD_AMD_or_System: diag(5105, 1 /* Error */, "Option_verbatimModuleSyntax_cannot_be_used_when_module_is_set_to_UMD_AMD_or_System_5105", "Option 'verbatimModuleSyntax' cannot be used when 'module' is set to 'UMD', 'AMD', or 'System'."),
    Use_0_instead: diag(5106, 3 /* Message */, "Use_0_instead_5106", "Use '{0}' instead."),
    Option_0_1_is_deprecated_and_will_stop_functioning_in_TypeScript_2_Specify_compilerOption_ignoreDeprecations_Colon_3_to_silence_this_error: diag(5107, 1 /* Error */, "Option_0_1_is_deprecated_and_will_stop_functioning_in_TypeScript_2_Specify_compilerOption_ignoreDepr_5107", `Option '{0}={1}' is deprecated and will stop functioning in TypeScript {2}. Specify compilerOption '"ignoreDeprecations": "{3}"' to silence this error.`),
    Option_0_1_has_been_removed_Please_remove_it_from_your_configuration: diag(5108, 1 /* Error */, "Option_0_1_has_been_removed_Please_remove_it_from_your_configuration_5108", "Option '{0}={1}' has been removed. Please remove it from your configuration."),
    Option_moduleResolution_must_be_set_to_0_or_left_unspecified_when_option_module_is_set_to_1: diag(5109, 1 /* Error */, "Option_moduleResolution_must_be_set_to_0_or_left_unspecified_when_option_module_is_set_to_1_5109", "Option 'moduleResolution' must be set to '{0}' (or left unspecified) when option 'module' is set to '{1}'."),
    Option_module_must_be_set_to_0_when_option_moduleResolution_is_set_to_1: diag(5110, 1 /* Error */, "Option_module_must_be_set_to_0_when_option_moduleResolution_is_set_to_1_5110", "Option 'module' must be set to '{0}' when option 'moduleResolution' is set to '{1}'."),
    Generates_a_sourcemap_for_each_corresponding_d_ts_file: diag(6e3, 3 /* Message */, "Generates_a_sourcemap_for_each_corresponding_d_ts_file_6000", "Generates a sourcemap for each corresponding '.d.ts' file."),
    Concatenate_and_emit_output_to_single_file: diag(6001, 3 /* Message */, "Concatenate_and_emit_output_to_single_file_6001", "Concatenate and emit output to single file."),
    Generates_corresponding_d_ts_file: diag(6002, 3 /* Message */, "Generates_corresponding_d_ts_file_6002", "Generates corresponding '.d.ts' file."),
    Specify_the_location_where_debugger_should_locate_TypeScript_files_instead_of_source_locations: diag(6004, 3 /* Message */, "Specify_the_location_where_debugger_should_locate_TypeScript_files_instead_of_source_locations_6004", "Specify the location where debugger should locate TypeScript files instead of source locations."),
    Watch_input_files: diag(6005, 3 /* Message */, "Watch_input_files_6005", "Watch input files."),
    Redirect_output_structure_to_the_directory: diag(6006, 3 /* Message */, "Redirect_output_structure_to_the_directory_6006", "Redirect output structure to the directory."),
    Do_not_erase_const_enum_declarations_in_generated_code: diag(6007, 3 /* Message */, "Do_not_erase_const_enum_declarations_in_generated_code_6007", "Do not erase const enum declarations in generated code."),
    Do_not_emit_outputs_if_any_errors_were_reported: diag(6008, 3 /* Message */, "Do_not_emit_outputs_if_any_errors_were_reported_6008", "Do not emit outputs if any errors were reported."),
    Do_not_emit_comments_to_output: diag(6009, 3 /* Message */, "Do_not_emit_comments_to_output_6009", "Do not emit comments to output."),
    Do_not_emit_outputs: diag(6010, 3 /* Message */, "Do_not_emit_outputs_6010", "Do not emit outputs."),
    Allow_default_imports_from_modules_with_no_default_export_This_does_not_affect_code_emit_just_typechecking: diag(6011, 3 /* Message */, "Allow_default_imports_from_modules_with_no_default_export_This_does_not_affect_code_emit_just_typech_6011", "Allow default imports from modules with no default export. This does not affect code emit, just typechecking."),
    Skip_type_checking_of_declaration_files: diag(6012, 3 /* Message */, "Skip_type_checking_of_declaration_files_6012", "Skip type checking of declaration files."),
    Do_not_resolve_the_real_path_of_symlinks: diag(6013, 3 /* Message */, "Do_not_resolve_the_real_path_of_symlinks_6013", "Do not resolve the real path of symlinks."),
    Only_emit_d_ts_declaration_files: diag(6014, 3 /* Message */, "Only_emit_d_ts_declaration_files_6014", "Only emit '.d.ts' declaration files."),
    Specify_ECMAScript_target_version: diag(6015, 3 /* Message */, "Specify_ECMAScript_target_version_6015", "Specify ECMAScript target version."),
    Specify_module_code_generation: diag(6016, 3 /* Message */, "Specify_module_code_generation_6016", "Specify module code generation."),
    Print_this_message: diag(6017, 3 /* Message */, "Print_this_message_6017", "Print this message."),
    Print_the_compiler_s_version: diag(6019, 3 /* Message */, "Print_the_compiler_s_version_6019", "Print the compiler's version."),
    Compile_the_project_given_the_path_to_its_configuration_file_or_to_a_folder_with_a_tsconfig_json: diag(6020, 3 /* Message */, "Compile_the_project_given_the_path_to_its_configuration_file_or_to_a_folder_with_a_tsconfig_json_6020", "Compile the project given the path to its configuration file, or to a folder with a 'tsconfig.json'."),
    Syntax_Colon_0: diag(6023, 3 /* Message */, "Syntax_Colon_0_6023", "Syntax: {0}"),
    options: diag(6024, 3 /* Message */, "options_6024", "options"),
    file: diag(6025, 3 /* Message */, "file_6025", "file"),
    Examples_Colon_0: diag(6026, 3 /* Message */, "Examples_Colon_0_6026", "Examples: {0}"),
    Options_Colon: diag(6027, 3 /* Message */, "Options_Colon_6027", "Options:"),
    Version_0: diag(6029, 3 /* Message */, "Version_0_6029", "Version {0}"),
    Insert_command_line_options_and_files_from_a_file: diag(6030, 3 /* Message */, "Insert_command_line_options_and_files_from_a_file_6030", "Insert command line options and files from a file."),
    Starting_compilation_in_watch_mode: diag(6031, 3 /* Message */, "Starting_compilation_in_watch_mode_6031", "Starting compilation in watch mode..."),
    File_change_detected_Starting_incremental_compilation: diag(6032, 3 /* Message */, "File_change_detected_Starting_incremental_compilation_6032", "File change detected. Starting incremental compilation..."),
    KIND: diag(6034, 3 /* Message */, "KIND_6034", "KIND"),
    FILE: diag(6035, 3 /* Message */, "FILE_6035", "FILE"),
    VERSION: diag(6036, 3 /* Message */, "VERSION_6036", "VERSION"),
    LOCATION: diag(6037, 3 /* Message */, "LOCATION_6037", "LOCATION"),
    DIRECTORY: diag(6038, 3 /* Message */, "DIRECTORY_6038", "DIRECTORY"),
    STRATEGY: diag(6039, 3 /* Message */, "STRATEGY_6039", "STRATEGY"),
    FILE_OR_DIRECTORY: diag(6040, 3 /* Message */, "FILE_OR_DIRECTORY_6040", "FILE OR DIRECTORY"),
    Errors_Files: diag(6041, 3 /* Message */, "Errors_Files_6041", "Errors  Files"),
    Generates_corresponding_map_file: diag(6043, 3 /* Message */, "Generates_corresponding_map_file_6043", "Generates corresponding '.map' file."),
    Compiler_option_0_expects_an_argument: diag(6044, 1 /* Error */, "Compiler_option_0_expects_an_argument_6044", "Compiler option '{0}' expects an argument."),
    Unterminated_quoted_string_in_response_file_0: diag(6045, 1 /* Error */, "Unterminated_quoted_string_in_response_file_0_6045", "Unterminated quoted string in response file '{0}'."),
    Argument_for_0_option_must_be_Colon_1: diag(6046, 1 /* Error */, "Argument_for_0_option_must_be_Colon_1_6046", "Argument for '{0}' option must be: {1}."),
    Locale_must_be_of_the_form_language_or_language_territory_For_example_0_or_1: diag(6048, 1 /* Error */, "Locale_must_be_of_the_form_language_or_language_territory_For_example_0_or_1_6048", "Locale must be of the form <language> or <language>-<territory>. For example '{0}' or '{1}'."),
    Unable_to_open_file_0: diag(6050, 1 /* Error */, "Unable_to_open_file_0_6050", "Unable to open file '{0}'."),
    Corrupted_locale_file_0: diag(6051, 1 /* Error */, "Corrupted_locale_file_0_6051", "Corrupted locale file {0}."),
    Raise_error_on_expressions_and_declarations_with_an_implied_any_type: diag(6052, 3 /* Message */, "Raise_error_on_expressions_and_declarations_with_an_implied_any_type_6052", "Raise error on expressions and declarations with an implied 'any' type."),
    File_0_not_found: diag(6053, 1 /* Error */, "File_0_not_found_6053", "File '{0}' not found."),
    File_0_has_an_unsupported_extension_The_only_supported_extensions_are_1: diag(6054, 1 /* Error */, "File_0_has_an_unsupported_extension_The_only_supported_extensions_are_1_6054", "File '{0}' has an unsupported extension. The only supported extensions are {1}."),
    Suppress_noImplicitAny_errors_for_indexing_objects_lacking_index_signatures: diag(6055, 3 /* Message */, "Suppress_noImplicitAny_errors_for_indexing_objects_lacking_index_signatures_6055", "Suppress noImplicitAny errors for indexing objects lacking index signatures."),
    Do_not_emit_declarations_for_code_that_has_an_internal_annotation: diag(6056, 3 /* Message */, "Do_not_emit_declarations_for_code_that_has_an_internal_annotation_6056", "Do not emit declarations for code that has an '@internal' annotation."),
    Specify_the_root_directory_of_input_files_Use_to_control_the_output_directory_structure_with_outDir: diag(6058, 3 /* Message */, "Specify_the_root_directory_of_input_files_Use_to_control_the_output_directory_structure_with_outDir_6058", "Specify the root directory of input files. Use to control the output directory structure with --outDir."),
    File_0_is_not_under_rootDir_1_rootDir_is_expected_to_contain_all_source_files: diag(6059, 1 /* Error */, "File_0_is_not_under_rootDir_1_rootDir_is_expected_to_contain_all_source_files_6059", "File '{0}' is not under 'rootDir' '{1}'. 'rootDir' is expected to contain all source files."),
    Specify_the_end_of_line_sequence_to_be_used_when_emitting_files_Colon_CRLF_dos_or_LF_unix: diag(6060, 3 /* Message */, "Specify_the_end_of_line_sequence_to_be_used_when_emitting_files_Colon_CRLF_dos_or_LF_unix_6060", "Specify the end of line sequence to be used when emitting files: 'CRLF' (dos) or 'LF' (unix)."),
    NEWLINE: diag(6061, 3 /* Message */, "NEWLINE_6061", "NEWLINE"),
    Option_0_can_only_be_specified_in_tsconfig_json_file_or_set_to_null_on_command_line: diag(6064, 1 /* Error */, "Option_0_can_only_be_specified_in_tsconfig_json_file_or_set_to_null_on_command_line_6064", "Option '{0}' can only be specified in 'tsconfig.json' file or set to 'null' on command line."),
    Enables_experimental_support_for_ES7_decorators: diag(6065, 3 /* Message */, "Enables_experimental_support_for_ES7_decorators_6065", "Enables experimental support for ES7 decorators."),
    Enables_experimental_support_for_emitting_type_metadata_for_decorators: diag(6066, 3 /* Message */, "Enables_experimental_support_for_emitting_type_metadata_for_decorators_6066", "Enables experimental support for emitting type metadata for decorators."),
    Initializes_a_TypeScript_project_and_creates_a_tsconfig_json_file: diag(6070, 3 /* Message */, "Initializes_a_TypeScript_project_and_creates_a_tsconfig_json_file_6070", "Initializes a TypeScript project and creates a tsconfig.json file."),
    Successfully_created_a_tsconfig_json_file: diag(6071, 3 /* Message */, "Successfully_created_a_tsconfig_json_file_6071", "Successfully created a tsconfig.json file."),
    Suppress_excess_property_checks_for_object_literals: diag(6072, 3 /* Message */, "Suppress_excess_property_checks_for_object_literals_6072", "Suppress excess property checks for object literals."),
    Stylize_errors_and_messages_using_color_and_context_experimental: diag(6073, 3 /* Message */, "Stylize_errors_and_messages_using_color_and_context_experimental_6073", "Stylize errors and messages using color and context (experimental)."),
    Do_not_report_errors_on_unused_labels: diag(6074, 3 /* Message */, "Do_not_report_errors_on_unused_labels_6074", "Do not report errors on unused labels."),
    Report_error_when_not_all_code_paths_in_function_return_a_value: diag(6075, 3 /* Message */, "Report_error_when_not_all_code_paths_in_function_return_a_value_6075", "Report error when not all code paths in function return a value."),
    Report_errors_for_fallthrough_cases_in_switch_statement: diag(6076, 3 /* Message */, "Report_errors_for_fallthrough_cases_in_switch_statement_6076", "Report errors for fallthrough cases in switch statement."),
    Do_not_report_errors_on_unreachable_code: diag(6077, 3 /* Message */, "Do_not_report_errors_on_unreachable_code_6077", "Do not report errors on unreachable code."),
    Disallow_inconsistently_cased_references_to_the_same_file: diag(6078, 3 /* Message */, "Disallow_inconsistently_cased_references_to_the_same_file_6078", "Disallow inconsistently-cased references to the same file."),
    Specify_library_files_to_be_included_in_the_compilation: diag(6079, 3 /* Message */, "Specify_library_files_to_be_included_in_the_compilation_6079", "Specify library files to be included in the compilation."),
    Specify_JSX_code_generation: diag(6080, 3 /* Message */, "Specify_JSX_code_generation_6080", "Specify JSX code generation."),
    Only_amd_and_system_modules_are_supported_alongside_0: diag(6082, 1 /* Error */, "Only_amd_and_system_modules_are_supported_alongside_0_6082", "Only 'amd' and 'system' modules are supported alongside --{0}."),
    Base_directory_to_resolve_non_absolute_module_names: diag(6083, 3 /* Message */, "Base_directory_to_resolve_non_absolute_module_names_6083", "Base directory to resolve non-absolute module names."),
    Deprecated_Use_jsxFactory_instead_Specify_the_object_invoked_for_createElement_when_targeting_react_JSX_emit: diag(6084, 3 /* Message */, "Deprecated_Use_jsxFactory_instead_Specify_the_object_invoked_for_createElement_when_targeting_react__6084", "[Deprecated] Use '--jsxFactory' instead. Specify the object invoked for createElement when targeting 'react' JSX emit"),
    Enable_tracing_of_the_name_resolution_process: diag(6085, 3 /* Message */, "Enable_tracing_of_the_name_resolution_process_6085", "Enable tracing of the name resolution process."),
    Resolving_module_0_from_1: diag(6086, 3 /* Message */, "Resolving_module_0_from_1_6086", "======== Resolving module '{0}' from '{1}'. ========"),
    Explicitly_specified_module_resolution_kind_Colon_0: diag(6087, 3 /* Message */, "Explicitly_specified_module_resolution_kind_Colon_0_6087", "Explicitly specified module resolution kind: '{0}'."),
    Module_resolution_kind_is_not_specified_using_0: diag(6088, 3 /* Message */, "Module_resolution_kind_is_not_specified_using_0_6088", "Module resolution kind is not specified, using '{0}'."),
    Module_name_0_was_successfully_resolved_to_1: diag(6089, 3 /* Message */, "Module_name_0_was_successfully_resolved_to_1_6089", "======== Module name '{0}' was successfully resolved to '{1}'. ========"),
    Module_name_0_was_not_resolved: diag(6090, 3 /* Message */, "Module_name_0_was_not_resolved_6090", "======== Module name '{0}' was not resolved. ========"),
    paths_option_is_specified_looking_for_a_pattern_to_match_module_name_0: diag(6091, 3 /* Message */, "paths_option_is_specified_looking_for_a_pattern_to_match_module_name_0_6091", "'paths' option is specified, looking for a pattern to match module name '{0}'."),
    Module_name_0_matched_pattern_1: diag(6092, 3 /* Message */, "Module_name_0_matched_pattern_1_6092", "Module name '{0}', matched pattern '{1}'."),
    Trying_substitution_0_candidate_module_location_Colon_1: diag(6093, 3 /* Message */, "Trying_substitution_0_candidate_module_location_Colon_1_6093", "Trying substitution '{0}', candidate module location: '{1}'."),
    Resolving_module_name_0_relative_to_base_url_1_2: diag(6094, 3 /* Message */, "Resolving_module_name_0_relative_to_base_url_1_2_6094", "Resolving module name '{0}' relative to base url '{1}' - '{2}'."),
    Loading_module_as_file_Slash_folder_candidate_module_location_0_target_file_types_Colon_1: diag(6095, 3 /* Message */, "Loading_module_as_file_Slash_folder_candidate_module_location_0_target_file_types_Colon_1_6095", "Loading module as file / folder, candidate module location '{0}', target file types: {1}."),
    File_0_does_not_exist: diag(6096, 3 /* Message */, "File_0_does_not_exist_6096", "File '{0}' does not exist."),
    File_0_exists_use_it_as_a_name_resolution_result: diag(6097, 3 /* Message */, "File_0_exists_use_it_as_a_name_resolution_result_6097", "File '{0}' exists - use it as a name resolution result."),
    Loading_module_0_from_node_modules_folder_target_file_types_Colon_1: diag(6098, 3 /* Message */, "Loading_module_0_from_node_modules_folder_target_file_types_Colon_1_6098", "Loading module '{0}' from 'node_modules' folder, target file types: {1}."),
    Found_package_json_at_0: diag(6099, 3 /* Message */, "Found_package_json_at_0_6099", "Found 'package.json' at '{0}'."),
    package_json_does_not_have_a_0_field: diag(6100, 3 /* Message */, "package_json_does_not_have_a_0_field_6100", "'package.json' does not have a '{0}' field."),
    package_json_has_0_field_1_that_references_2: diag(6101, 3 /* Message */, "package_json_has_0_field_1_that_references_2_6101", "'package.json' has '{0}' field '{1}' that references '{2}'."),
    Allow_javascript_files_to_be_compiled: diag(6102, 3 /* Message */, "Allow_javascript_files_to_be_compiled_6102", "Allow javascript files to be compiled."),
    Checking_if_0_is_the_longest_matching_prefix_for_1_2: diag(6104, 3 /* Message */, "Checking_if_0_is_the_longest_matching_prefix_for_1_2_6104", "Checking if '{0}' is the longest matching prefix for '{1}' - '{2}'."),
    Expected_type_of_0_field_in_package_json_to_be_1_got_2: diag(6105, 3 /* Message */, "Expected_type_of_0_field_in_package_json_to_be_1_got_2_6105", "Expected type of '{0}' field in 'package.json' to be '{1}', got '{2}'."),
    baseUrl_option_is_set_to_0_using_this_value_to_resolve_non_relative_module_name_1: diag(6106, 3 /* Message */, "baseUrl_option_is_set_to_0_using_this_value_to_resolve_non_relative_module_name_1_6106", "'baseUrl' option is set to '{0}', using this value to resolve non-relative module name '{1}'."),
    rootDirs_option_is_set_using_it_to_resolve_relative_module_name_0: diag(6107, 3 /* Message */, "rootDirs_option_is_set_using_it_to_resolve_relative_module_name_0_6107", "'rootDirs' option is set, using it to resolve relative module name '{0}'."),
    Longest_matching_prefix_for_0_is_1: diag(6108, 3 /* Message */, "Longest_matching_prefix_for_0_is_1_6108", "Longest matching prefix for '{0}' is '{1}'."),
    Loading_0_from_the_root_dir_1_candidate_location_2: diag(6109, 3 /* Message */, "Loading_0_from_the_root_dir_1_candidate_location_2_6109", "Loading '{0}' from the root dir '{1}', candidate location '{2}'."),
    Trying_other_entries_in_rootDirs: diag(6110, 3 /* Message */, "Trying_other_entries_in_rootDirs_6110", "Trying other entries in 'rootDirs'."),
    Module_resolution_using_rootDirs_has_failed: diag(6111, 3 /* Message */, "Module_resolution_using_rootDirs_has_failed_6111", "Module resolution using 'rootDirs' has failed."),
    Do_not_emit_use_strict_directives_in_module_output: diag(6112, 3 /* Message */, "Do_not_emit_use_strict_directives_in_module_output_6112", "Do not emit 'use strict' directives in module output."),
    Enable_strict_null_checks: diag(6113, 3 /* Message */, "Enable_strict_null_checks_6113", "Enable strict null checks."),
    Unknown_option_excludes_Did_you_mean_exclude: diag(6114, 1 /* Error */, "Unknown_option_excludes_Did_you_mean_exclude_6114", "Unknown option 'excludes'. Did you mean 'exclude'?"),
    Raise_error_on_this_expressions_with_an_implied_any_type: diag(6115, 3 /* Message */, "Raise_error_on_this_expressions_with_an_implied_any_type_6115", "Raise error on 'this' expressions with an implied 'any' type."),
    Resolving_type_reference_directive_0_containing_file_1_root_directory_2: diag(6116, 3 /* Message */, "Resolving_type_reference_directive_0_containing_file_1_root_directory_2_6116", "======== Resolving type reference directive '{0}', containing file '{1}', root directory '{2}'. ========"),
    Type_reference_directive_0_was_successfully_resolved_to_1_primary_Colon_2: diag(6119, 3 /* Message */, "Type_reference_directive_0_was_successfully_resolved_to_1_primary_Colon_2_6119", "======== Type reference directive '{0}' was successfully resolved to '{1}', primary: {2}. ========"),
    Type_reference_directive_0_was_not_resolved: diag(6120, 3 /* Message */, "Type_reference_directive_0_was_not_resolved_6120", "======== Type reference directive '{0}' was not resolved. ========"),
    Resolving_with_primary_search_path_0: diag(6121, 3 /* Message */, "Resolving_with_primary_search_path_0_6121", "Resolving with primary search path '{0}'."),
    Root_directory_cannot_be_determined_skipping_primary_search_paths: diag(6122, 3 /* Message */, "Root_directory_cannot_be_determined_skipping_primary_search_paths_6122", "Root directory cannot be determined, skipping primary search paths."),
    Resolving_type_reference_directive_0_containing_file_1_root_directory_not_set: diag(6123, 3 /* Message */, "Resolving_type_reference_directive_0_containing_file_1_root_directory_not_set_6123", "======== Resolving type reference directive '{0}', containing file '{1}', root directory not set. ========"),
    Type_declaration_files_to_be_included_in_compilation: diag(6124, 3 /* Message */, "Type_declaration_files_to_be_included_in_compilation_6124", "Type declaration files to be included in compilation."),
    Looking_up_in_node_modules_folder_initial_location_0: diag(6125, 3 /* Message */, "Looking_up_in_node_modules_folder_initial_location_0_6125", "Looking up in 'node_modules' folder, initial location '{0}'."),
    Containing_file_is_not_specified_and_root_directory_cannot_be_determined_skipping_lookup_in_node_modules_folder: diag(6126, 3 /* Message */, "Containing_file_is_not_specified_and_root_directory_cannot_be_determined_skipping_lookup_in_node_mod_6126", "Containing file is not specified and root directory cannot be determined, skipping lookup in 'node_modules' folder."),
    Resolving_type_reference_directive_0_containing_file_not_set_root_directory_1: diag(6127, 3 /* Message */, "Resolving_type_reference_directive_0_containing_file_not_set_root_directory_1_6127", "======== Resolving type reference directive '{0}', containing file not set, root directory '{1}'. ========"),
    Resolving_type_reference_directive_0_containing_file_not_set_root_directory_not_set: diag(6128, 3 /* Message */, "Resolving_type_reference_directive_0_containing_file_not_set_root_directory_not_set_6128", "======== Resolving type reference directive '{0}', containing file not set, root directory not set. ========"),
    Resolving_real_path_for_0_result_1: diag(6130, 3 /* Message */, "Resolving_real_path_for_0_result_1_6130", "Resolving real path for '{0}', result '{1}'."),
    Cannot_compile_modules_using_option_0_unless_the_module_flag_is_amd_or_system: diag(6131, 1 /* Error */, "Cannot_compile_modules_using_option_0_unless_the_module_flag_is_amd_or_system_6131", "Cannot compile modules using option '{0}' unless the '--module' flag is 'amd' or 'system'."),
    File_name_0_has_a_1_extension_stripping_it: diag(6132, 3 /* Message */, "File_name_0_has_a_1_extension_stripping_it_6132", "File name '{0}' has a '{1}' extension - stripping it."),
    _0_is_declared_but_its_value_is_never_read: diag(
      6133,
      1 /* Error */,
      "_0_is_declared_but_its_value_is_never_read_6133",
      "'{0}' is declared but its value is never read.",
      /*reportsUnnecessary*/
      true
    ),
    Report_errors_on_unused_locals: diag(6134, 3 /* Message */, "Report_errors_on_unused_locals_6134", "Report errors on unused locals."),
    Report_errors_on_unused_parameters: diag(6135, 3 /* Message */, "Report_errors_on_unused_parameters_6135", "Report errors on unused parameters."),
    The_maximum_dependency_depth_to_search_under_node_modules_and_load_JavaScript_files: diag(6136, 3 /* Message */, "The_maximum_dependency_depth_to_search_under_node_modules_and_load_JavaScript_files_6136", "The maximum dependency depth to search under node_modules and load JavaScript files."),
    Cannot_import_type_declaration_files_Consider_importing_0_instead_of_1: diag(6137, 1 /* Error */, "Cannot_import_type_declaration_files_Consider_importing_0_instead_of_1_6137", "Cannot import type declaration files. Consider importing '{0}' instead of '{1}'."),
    Property_0_is_declared_but_its_value_is_never_read: diag(
      6138,
      1 /* Error */,
      "Property_0_is_declared_but_its_value_is_never_read_6138",
      "Property '{0}' is declared but its value is never read.",
      /*reportsUnnecessary*/
      true
    ),
    Import_emit_helpe