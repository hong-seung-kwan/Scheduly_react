# Scheduly [개인 플래너 웹사이트]
<p align="center"><img width="1920" height="992" alt="Image" src="https://github.com/user-attachments/assets/e425f047-92c6-4303-a487-b0d6340729fc" /></p>


## 프로젝트 소개 📝


◦ 프로젝트 명 : Scheduly [팀 프로젝트(2인)]


◦ 프로젝트 간단 소개 : 개인 공부 계획 수동 일정 생성 및 GPT API를 활용하여 자동 생성이 가능한 플래너 웹사이트


◦ 프로젝트 기간 : 2025.7.2 ~ 2025.7.30


## 담당역할 및 기여 👨‍💻

   ◦ ERD 설계
   
   ◦ FullCalendar, Drag & Drop 기능을 이용한 일정 관리 화면 구현
   
   ◦ Redux 상태관리로 일정/플랜 데이터 동기화
   
   ◦ Axios를 활용한 API 연동 및 데이터 CRUD 기능 구현
   
   ◦ 사용자별 권한에 따른 UI 노출 제어 및 Spring Security 403 에러 처리
   
   ◦ KakaoPay 결제 API 연동 및 결제 완료 후 상태 반영
   
   ◦ GPT API를 활용해 대화형 UI로 일정 생성 기능 구현

## 주요 기능 및 인터페이스 📱
|회원가입|로그인|API 일정 생성|
|:---:|:---:|:---:|
|<img width="1920" height="993" alt="Image" src="https://github.com/user-attachments/assets/b2d148bc-e5e8-41e7-bd27-b8a62784d590" />|<img width="1920" height="990" alt="Image" src="https://github.com/user-attachments/assets/e3cd3eab-a5ac-431f-b885-3e1cd7241b85" />|<img width="1920" height="992" alt="Image" src="https://github.com/user-attachments/assets/9cfcf4b5-8d46-40a6-8068-89373b661c94" />|
|회원가입 시 아이디 중복일 경우 알림창|로그인 아이디 비밀번호 틀릴경우 알림창 및 구글 로그인 가능|결제 회원인 경우 GPT API을 활용하여 학습 계획 생성|

|일정추가|일정조회|카카오결제API|
|:---:|:---:|:---:|
|<img width="1920" height="993" alt="Image" src="https://github.com/user-attachments/assets/38b64eff-21e4-4c3a-8f74-4385ca8d5a3a" />|<img width="1920" height="993" alt="Image" src="https://github.com/user-attachments/assets/81754dac-8efb-49ac-93e6-8cfb7c32c3b2" />|<img width="1920" height="953" alt="Image" src="https://github.com/user-attachments/assets/87e33f12-cc72-4251-8986-9600b2ecf7cc" />|
|비결제 회원이 경우에도 일정 생성 가능|일정 수정 삭제 및 진행률 확인, 날짜 미루기 당기기 가능|결제회원으로 많은 기능을 활용하고 싶다면 카카오결제API로 결제|

|게시판|게시판 작성|게시판 조회|
|:---:|:---:|:---:|
|<img width="1920" height="990" alt="Image" src="https://github.com/user-attachments/assets/b0367877-36d3-42fc-95fc-f3cb957a5812" />|<img width="1920" height="992" alt="Image" src="https://github.com/user-attachments/assets/b6d36f7f-7575-400e-b538-64bcc39241a7" />|<img width="1920" height="988" alt="Image" src="https://github.com/user-attachments/assets/181267b5-6964-4b8a-b107-2d2b98cc19c2" />|
|결제회원들만 API를 활용하여 생성한 일정을 공유하는 게시판|자신의 일정을 게시판에 등록|결제회원은 다른 사용자의 일정을 조회하여 자신의 일정으로 저장 가능|



## ⚙️ 기술 스택
### FrontEnd
◦ HTML, CSS, JS

◦ React

### BackEnd
◦ Java

◦ Springboot, Spring Tools 4

◦ MariaDB, DBeaver

◦ KakaoPay, Google API


## BackEnd Git

https://github.com/hong-seung-kwan/Scheduly-back

