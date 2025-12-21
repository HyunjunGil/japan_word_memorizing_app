#!/bin/bash
# Git hooks 설치 스크립트

echo "🔧 Git hooks 설치 중..."

# .git/hooks 디렉토리 확인
if [ ! -d ".git" ]; then
  echo "❌ Git 저장소가 아닙니다. git init을 먼저 실행하세요."
  exit 1
fi

# pre-commit hook 복사
cp .githooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

echo "✅ Git hooks 설치 완료!"
echo ""
echo "이제 results/ 폴더의 JSON 파일을 커밋할 때마다"
echo "manifest.json이 자동으로 업데이트됩니다."
echo ""
echo "테스트 방법:"
echo "  1. results/ 폴더에 새 JSON 파일 추가"
echo "  2. git add results/your_file.json"
echo "  3. git commit -m 'Add new file'"
echo "  4. manifest.json이 자동으로 업데이트되고 커밋에 포함됩니다"

