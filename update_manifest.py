#!/usr/bin/env python3
"""
results 폴더의 JSON 파일들을 스캔하여 manifest.json을 자동으로 업데이트하는 스크립트
"""

import json
import os
from pathlib import Path


def update_manifest():
    """results 폴더를 스캔하여 manifest.json 업데이트"""
    
    # 경로 설정
    script_dir = Path(__file__).parent
    results_dir = script_dir / "results"
    manifest_path = results_dir / "manifest.json"
    
    # results 폴더 확인
    if not results_dir.exists():
        print(f"❌ results 폴더를 찾을 수 없습니다: {results_dir}")
        return False
    
    # .json 파일 목록 가져오기 (manifest.json 제외)
    json_files = []
    for file_path in sorted(results_dir.glob("*.json")):
        # manifest.json은 제외
        if file_path.name != "manifest.json":
            # 확장자 제거하고 파일명만 추가
            file_name = file_path.stem
            json_files.append(file_name)
    
    if not json_files:
        print("⚠️  results 폴더에 JSON 파일이 없습니다.")
        return False
    
    # manifest 데이터 생성
    manifest_data = {
        "files": json_files
    }
    
    # manifest.json 저장
    try:
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ manifest.json 업데이트 완료!")
        print(f"📁 총 {len(json_files)}개 파일 발견:")
        
        # 파일 목록 출력 (타입별로 그룹화)
        page_files = [f for f in json_files if f.startswith("page_")]
        grammar_files = [f for f in json_files if f.startswith("grammar_")]
        other_files = [f for f in json_files if not (f.startswith("page_") or f.startswith("grammar_"))]
        
        if page_files:
            print(f"   - page: {len(page_files)}개 ({page_files[0]} ~ {page_files[-1]})")
        if grammar_files:
            print(f"   - grammar: {len(grammar_files)}개 ({grammar_files[0]} ~ {grammar_files[-1]})")
        if other_files:
            print(f"   - 기타: {len(other_files)}개 ({', '.join(other_files)})")
        
        return True
        
    except Exception as e:
        print(f"❌ manifest.json 저장 실패: {e}")
        return False


if __name__ == "__main__":
    print("🔄 manifest.json 업데이트 중...")
    print()
    
    success = update_manifest()
    
    print()
    if success:
        print("✨ 완료! 이제 애플리케이션을 새로고침하세요.")
    else:
        print("⚠️  업데이트 실패. 위의 오류를 확인하세요.")

