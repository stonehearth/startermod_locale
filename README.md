stoneHearth_locale_ko (한글판)
========

### 1. 업데이트
해당 오버라이드 메소드들은 어떠한 모드에서도 적용될 수 있습니다.

### 2. 모드에 대해서
이 모드는 스톤하스 바닐라 상태에서 새로운 언어를 추가하는 기능을 가지고 있습니다.

### 3. 모드가 작동하기 위해 설정해야 할 부분

 * startermod_locale / manifest.json 언어 모딩 라인 추가.
 * added_languages.json - 새로운 언어 추가.
 * startermod_locale / manifest.json - 번역될 json 파일과 font 파일을 오버라이드.

**※이후 인터페이스 오작동에 대한 소스 수정이 가해지면 *.html , *.less 파일을 오버라이드에 추가합니다.**

### 4. en.json 파일은 어떻게 번역해야 하나요?
json 파일의 콜론 ' : ' 오른쪽에 오는 문장만 변경하면 됩니다.  <br>
콜론 ' : ' 왼쪽의 단어와  대괄호 '[ ] ' 에 둘러쌓인 변수명은 변경하지 마세요.<br>
http://codebeautify.org/jsonviewer  웹사이트를 사용하여 해당 데이터 구조를 더욱 쉽게 볼 수 있습니다.

### 5. 참조
이 가이드는 [네이버 스톤하스 포럼 카페](http://http://cafe.naver.com/stonehearth)에서 작성되었습니다.<br>
