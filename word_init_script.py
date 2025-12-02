#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
일본어 단어장 HTML 파일에 results 폴더의 JSON 파일들을 포함시키는 스크립트
"""

import json
import os
import re

def load_json_files(results_dir='results'):
    """results 폴더의 모든 JSON 파일을 읽어서 배열로 반환"""
    files = sorted([f for f in os.listdir(results_dir) if f.endswith('.json')])
    data_array = []
    
    for filename in files:
        filepath = os.path.join(results_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            data_array.append(data)
    
    return data_array

def update_html_file(html_path='japan_wordbook.html', results_dir='results'):
    """HTML 파일에 기본 단어 데이터를 포함시키는 함수"""
    
    # JSON 데이터 읽기
    json_data = load_json_files(results_dir)
    
    # JavaScript 배열로 변환
    js_array = json.dumps(json_data, ensure_ascii=False, indent=12)
    
    # HTML 파일 읽기
    with open(html_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # DEFAULT_WORD_SETS 배열 전체를 찾아서 덮어쓰기
    # 주석부터 배열 끝(];)까지 전체를 매칭 (non-greedy로 첫 번째 ];를 찾음)
    old_pattern = r'// 기본 단어 데이터 \(results 폴더의 JSON 파일들\)\s+const DEFAULT_WORD_SETS = \[[\s\S]*?\];'
    new_content = f'// 기본 단어 데이터 (results 폴더의 JSON 파일들)\n        const DEFAULT_WORD_SETS = {js_array};'
    
    match = re.search(old_pattern, html_content)
    if match:
        html_content = html_content[:match.start()] + new_content + html_content[match.end():]
    else:
        # 패턴을 찾지 못한 경우, const DEFAULT_WORD_SETS = [ 부터 ]; 까지 찾기
        old_pattern2 = r'const DEFAULT_WORD_SETS = \[[\s\S]*?\];'
        match2 = re.search(old_pattern2, html_content)
        if match2:
            # 주석도 함께 추가
            new_content_with_comment = f'// 기본 단어 데이터 (results 폴더의 JSON 파일들)\n        const DEFAULT_WORD_SETS = {js_array};'
            html_content = html_content[:match2.start()] + new_content_with_comment + html_content[match2.end():]
        else:
            raise ValueError("DEFAULT_WORD_SETS 배열을 찾을 수 없습니다.")
    
    # init 함수 수정 - 기본 데이터 추가
    old_init = r'// 초기화\s+function init\(\) \{\s+loadFromStorage\(\);\s+renderFileList\(\);\s+\}'
    new_init = '''// 초기화
        function init() {
            loadFromStorage();
            
            // LocalStorage에 데이터가 없으면 기본 데이터 추가
            if (wordSets.length === 0) {
                wordSets = [...DEFAULT_WORD_SETS];
                // 기본 데이터의 가중치 초기화
                DEFAULT_WORD_SETS.forEach(set => {
                    set.words.forEach(word => {
                        const key = `${set.fileName}_${word.id}`;
                        if (!weights[key]) {
                            weights[key] = 1;
                        }
                    });
                });
                saveToStorage();
            }
            
            renderFileList();
        }'''
    
    html_content = re.sub(old_init, new_init, html_content, flags=re.DOTALL)
    
    # HTML 파일 저장
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✅ 완료! {len(json_data)}개의 단어묶음이 {html_path}에 포함되었습니다.")

if __name__ == '__main__':
    import sys
    
    # 명령줄 인자 처리
    html_path = sys.argv[1] if len(sys.argv) > 1 else 'japan_wordbook.html'
    results_dir = sys.argv[2] if len(sys.argv) > 2 else 'results'
    
    try:
        update_html_file(html_path, results_dir)
    except FileNotFoundError as e:
        print(f"❌ 오류: 파일을 찾을 수 없습니다 - {e}")
    except json.JSONDecodeError as e:
        print(f"❌ 오류: JSON 파싱 실패 - {e}")
    except Exception as e:
        print(f"❌ 오류: {e}")

