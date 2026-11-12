#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
zico 图标库本地化 + 子集化构建脚本。

作用：
  1. 扫描 docs/ 下所有 Markdown，找出实际用到的 zico 图标类（zi_xxx）；
  2. 按需裁剪 zico 官方 CSS：只保留这些图标的映射规则 + 基础/尺寸/动画规则；
  3. 把字体子集化成只含被用到的字形，输出 woff2 + woff；
  4. 清理 public/zico/fonts 下的历史文件（幂等）。

输出（供 VuePress 直接静态托管）：
  docs/.vuepress/public/zico/zico.min.css
  docs/.vuepress/public/zico/fonts/zi-regular.woff2 / .woff
  docs/.vuepress/public/zico/fonts/zi-tm.woff2 / .woff

页面新增/删除图标后，重跑本脚本即可：
  python3 utils/zico-subset.py

依赖：fonttools、brotli
  python3 -m pip install --user fonttools brotli

源文件（勿删，离线重建用）：utils/zico-src/{zico.min.css, zi-regular.woff, zi-tm.woff}
"""

import os
import re
import sys
import shutil

try:
    from fontTools import subset
    from fontTools.ttLib import TTFont
except ImportError:
    sys.exit('缺少 fonttools，请先执行：python3 -m pip install --user fonttools brotli')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(ROOT, 'utils', 'zico-src')
OUT_DIR = os.path.join(ROOT, 'docs', '.vuepress', 'public', 'zico')
OUT_FONTS = os.path.join(OUT_DIR, 'fonts')
SRC_CSS = os.path.join(SRC_DIR, 'zico.min.css')

# 源字体 -> 输出文件名前缀
FONTS = [
    ('zico', 'zi-regular'),
    ('zicoTm', 'zi-tm'),
]


def parse_rules(css):
    """把压缩 CSS 拆成 [(header, body)]，支持 @keyframes 之类的一层嵌套。"""
    rules, i, n = [], 0, len(css)
    while True:
        j = css.find('{', i)
        if j == -1:
            break
        header = css[i:j].strip()
        depth, k = 1, j + 1
        while k < n and depth:
            c = css[k]
            if c == '{':
                depth += 1
            elif c == '}':
                depth -= 1
            k += 1
        rules.append((header, css[j + 1:k - 1]))
        i = k
    return rules


def icon_classes_of(header):
    """从选择器里取出所有 zi_ 开头的类名。"""
    return set(re.findall(r'\.(zi_[A-Za-z0-9]+)', header))


def class_pattern(name):
    # .zi_envelope 不能匹配到 .zi_envelopeBold
    return re.compile(r'\.' + re.escape(name) + r'(?![\w-])')


def collect_used_icons():
    """扫描 Markdown 里出现的 class="... zi_xxx ..."。"""
    used = set()
    docs = os.path.join(ROOT, 'docs')
    for dirpath, dirnames, filenames in os.walk(docs):
        dirnames[:] = [d for d in dirnames if d not in ('dist', 'node_modules', '.git')]
        for fn in filenames:
            if not fn.endswith('.md'):
                continue
            path = os.path.join(dirpath, fn)
            with open(path, encoding='utf-8') as f:
                text = f.read()
            for attr in re.findall(r'class\s*=\s*["\']([^"\']*)["\']', text):
                for token in attr.split():
                    if token.startswith('zi_'):
                        used.add(token)
    return used


def main():
    if not os.path.exists(SRC_CSS):
        sys.exit('缺少源文件：%s' % SRC_CSS)

    src_css = open(SRC_CSS, encoding='utf-8').read()
    src_css = re.sub(r'/\*.*?\*/', '', src_css, flags=re.S)   # 去掉原站注释，署名已写入新文件头
    rules = parse_rules(src_css)

    # 1) 统计 CSS 里每个图标类定义了什么码点
    icon_rule_of = {}       # class -> (header, body)
    defined_icons = set()
    for header, body in rules:
        if ':before' not in header:
            continue
        classes = icon_classes_of(header)
        defined_icons |= classes
        for cls in classes:
            icon_rule_of.setdefault(cls, (header, body))

    # 2) 页面实际用到的图标类
    used_raw = collect_used_icons()
    used = {c for c in used_raw if c in defined_icons}
    missing = sorted(used_raw - defined_icons)
    if missing:
        print('⚠ 这些 class 在 zico 里找不到图标定义（当作普通样式忽略）：%s' % ', '.join(missing))
    if not used:
        sys.exit('没有在 Markdown 里检测到任何 zico 图标，中止以免产出空字体')

    # 3) 每个目标类对应的码点
    codepoints, keep_headers = {}, set()
    for cls in sorted(used):
        header, body = icon_rule_of[cls]
        m = re.search(r'content\s*:\s*"\\([0-9a-fA-F]+)"', body)
        if not m:
            sys.exit('无法解析 %s 的 content 码点：%s' % (cls, body[:80]))
        cp = int(m.group(1), 16)
        codepoints[cls] = cp
        keep_headers.add(header)

    # 4) 组装裁剪后的 CSS：保留非图标规则 + 命中的图标规则
    kept = []
    for header, body in rules:
        if header.startswith('@font-face'):
            continue                                    # 稍后重建
        if ':before' in header and header not in keep_headers:
            continue                                    # 未被使用的图标映射，丢弃
        kept.append('%s{%s}' % (header, body))

    # 5) 子集化字体
    os.makedirs(OUT_FONTS, exist_ok=True)
    face_css, report = [], []
    wanted = set(codepoints.values())
    for family, base in FONTS:
        src_path = os.path.join(SRC_DIR, base + '.woff')
        src_font = TTFont(src_path)
        have = set(src_font.getBestCmap().keys())
        src_font.close()
        subset_cps = wanted & have
        if not subset_cps:
            report.append('  %-12s 0 个字形（跳过）' % base)
            continue

        srcs = []
        for fmt in ('woff2', 'woff'):
            opts = subset.Options()
            opts.flavor = fmt
            opts.name_IDs = ['*']
            opts.name_languages = ['*']
            opts.notdef_outline = True
            opts.recalc_bounds = True
            opts.drop_tables += ['DSIG']
            font = subset.load_font(src_path, opts)
            sub = subset.Subsetter(opts)
            sub.populate(unicodes=subset_cps)
            sub.subset(font)
            out_path = os.path.join(OUT_FONTS, '%s.%s' % (base, fmt))
            subset.save_font(font, out_path, opts)
            font.close()
            srcs.append('url("fonts/%s.%s") format("%s")' % (base, fmt, fmt))
        face_css.append('@font-face{font-family:"%s";src:%s;font-display:swap;'
                        'font-style:normal;font-weight:normal}'
                        % (family, ','.join(srcs)))
        report.append('  %-12s %d 个字形 -> %s' % (
            base, len(subset_cps),
            ' + '.join('%.1fKB' % (os.path.getsize(os.path.join(OUT_FONTS, '%s.%s' % (base, f))) / 1024)
                       for f in ('woff2', 'woff'))))

    # 未被任何字体覆盖的码点，说明源字体缺失
    covered = set()
    for _, base in FONTS:
        f = TTFont(os.path.join(SRC_DIR, base + '.woff'))
        covered |= set(f.getBestCmap().keys())
        f.close()
    uncovered = sorted(wanted - covered)
    if uncovered:
        print('⚠ 源字体缺少这些码点：%s' % ', '.join(hex(c) for c in uncovered))

    # 6) 清理不再需要的字体文件，写 CSS
    for fn in os.listdir(OUT_FONTS):
        if fn not in {('%s.%s' % (b, f)) for _, b in FONTS for f in ('woff2', 'woff')}:
            os.remove(os.path.join(OUT_FONTS, fn))

    header_comment = (
        '/*! zico 图标库（本地子集版）\n'
        ' * 源自 http://ico.z01.com  zico v1.9（MIT 见原站）\n'
        ' * 由 utils/zico-subset.py 自动生成，请勿手工修改；\n'
        ' * 页面新增图标后重跑该脚本即可。\n'
        ' * 收录图标（%d）：%s\n'
        ' */\n'
        % (len(used), ', '.join(sorted(used)))
    )
    body_css = ''.join(face_css) + ''.join(kept)
    body_css = body_css.replace(',"zicoGov"', '')       # gov 字体未使用，移出回退链
    out_css = header_comment + body_css
    css_path = os.path.join(OUT_DIR, 'zico.min.css')
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(out_css)

    print('图标（%d）：%s' % (len(used), ', '.join('%s=U+%04X' % (c, codepoints[c]) for c in sorted(used))))
    print('字体：')
    print('\n'.join(report))
    print('输出：')
    print('  %s  %.1fKB' % (os.path.relpath(css_path, ROOT), os.path.getsize(css_path) / 1024))
    print('  %s/ （%d 个文件，合计 %.1fKB）' % (
        os.path.relpath(OUT_FONTS, ROOT), len(os.listdir(OUT_FONTS)),
        sum(os.path.getsize(os.path.join(OUT_FONTS, f)) for f in os.listdir(OUT_FONTS)) / 1024))


if __name__ == '__main__':
    main()
