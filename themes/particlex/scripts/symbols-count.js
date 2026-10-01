/**
 * 字数统计 / 预估阅读时长
 *
 * 在模板里这样用：
 *     <%= symbolsCount(post) %> 字
 *     <%= symbolsTime(post) %> 分钟
 *
 * 统计口径：
 *   - 中日韩文字按「字」计；
 *   - 英文/数字按「词」计；
 *   - <pre> 代码块不计入；
 *   - 阅读速度按每分钟 300 字，不足 1 分钟也算 1 分钟。
 *
 * 放在 themes/<主题>/scripts/ 下的 .js 会被 Hexo 自动当成插件加载，
 * 所以主题升级时这个文件要自己保留。
 */
"use strict";

var CJK = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u3040-\u30ff\uac00-\ud7af]/g;
var LATIN_WORD = /[A-Za-z0-9][A-Za-z0-9'’_-]*/g;
var WORDS_PER_MINUTE = 300;

function toPlainText(html) {
    return String(html || "")
        .replace(/<pre[\s\S]*?<\/pre>/gi, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(/&[a-z]+;|&#\d+;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function count(text) {
    var cjk = (text.match(CJK) || []).length;
    var words = (text.replace(CJK, " ").match(LATIN_WORD) || []).length;
    return cjk + words;
}

function countOf(post) {
    return count(toPlainText(post && post.content));
}

hexo.extend.helper.register("symbolsCount", function (post) {
    return countOf(post);
});

hexo.extend.helper.register("symbolsTime", function (post) {
    return Math.max(1, Math.round(countOf(post) / WORDS_PER_MINUTE));
});
