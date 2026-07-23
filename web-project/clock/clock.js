document.addEventListener("DOMContentLoaded", () => {
  let battery = 100;
  let batteryInterval = null;
  let clockInterval = null;
  let alarms = [];

  const batteryBar = document.getElementById("battery-bar");
  const batteryText = document.getElementById("battery-text");
  const chargeBtn = document.getElementById("charge-btn");
  const clockDisplay = document.getElementById("clock-display");
  const blackoutOverlay = document.getElementById("blackout-overlay");
  const addAlarmBtn = document.getElementById("add-alarm-btn");
  const alarmList = document.getElementById("alarm-list");
  const alarmCount = document.getElementById("alarm-count");
  const themeToggleBtn = document.getElementById("theme-toggle-btn");

  const padTwo = (num) => String(num).padStart(2, "0");

  // 🔊 Web Audio API를 활용한 알람 소리(전자음 3회) 생성 함수
  const playAlarmSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const audioCtx = new AudioContext();

      // 0.25초 간격으로 3번 "삐-" 소리 출력
      [0, 0.25, 0.5].forEach((delay) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = "sine";
        osc.frequency.value = 880; // 880Hz (A5 비프음 톤)

        gain.gain.setValueAtTime(0.15, audioCtx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + delay + 0.18);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(audioCtx.currentTime + delay);
        osc.stop(audioCtx.currentTime + delay + 0.18);
      });
    } catch (e) {
      console.warn("오디오 재생 오류:", e);
    }
  };

  // FR1: 시계 실시간 표시
  const updateClock = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = padTwo(now.getMonth() + 1);
    const dd = padTwo(now.getDate());
    const hh = padTwo(now.getHours());
    const min = padTwo(now.getMinutes());
    const ss = padTwo(now.getSeconds());

    if (clockDisplay) {
      clockDisplay.textContent = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    }

    checkAlarms(hh, min, ss);
  };

  // FR1 & FR2: 타이머 시작 및 배터리 감소
  const startTimers = () => {
    updateClock();
    clockInterval = setInterval(updateClock, 1000);

    batteryInterval = setInterval(() => {
      if (battery > 0) {
        battery--;
        renderBattery();
      } else {
        handleBlackout();
      }
    }, 1000);
  };

  const renderBattery = () => {
    if (batteryText) batteryText.textContent = `${battery}%`;
    if (batteryBar) {
      batteryBar.style.width = `${battery}%`;
      batteryBar.style.backgroundColor = battery <= 20 ? "var(--color-danger)" : "var(--color-success)";
    }
  };

  // FR2: 배터리 0% 처리
  const handleBlackout = () => {
    clearInterval(clockInterval);
    clearInterval(batteryInterval);
    blackoutOverlay?.classList.remove("hidden");
    chargeBtn?.classList.remove("hidden");
  };

  const rechargeBattery = () => {
    battery = 100;
    renderBattery();
    blackoutOverlay?.classList.add("hidden");
    chargeBtn?.classList.add("hidden");
    startTimers();
  };

  // FR3: 알람 추가
  const addAlarm = () => {
    if (alarms.length >= 3) {
      alert("알람은 최대 3개까지만 가능합니다.");
      return;
    }

    const h = parseInt(document.getElementById("alarm-hour")?.value || "0", 10);
    const m = parseInt(document.getElementById("alarm-min")?.value || "0", 10);
    const s = parseInt(document.getElementById("alarm-sec")?.value || "0", 10);

    if (h < 0 || h > 23 || m < 0 || m > 59 || s < 0 || s > 59) {
      alert("올바른 알람 시간을 입력해주세요.");
      return;
    }

    alarms.push({ id: Date.now(), hour: padTwo(h), min: padTwo(m), sec: padTwo(s) });
    renderAlarmList();
  };

  // FR4: 알람 현황 업데이트
  const renderAlarmList = () => {
    if (!alarmList) return;
    alarmList.innerHTML = "";
    if (alarmCount) alarmCount.textContent = `${alarms.length} / 3`;

    alarms.forEach((alarm) => {
      const li = document.createElement("li");
      li.className = "alarm-item";
      li.innerHTML = `
        <span>🔔 ${alarm.hour}:${alarm.min}:${alarm.sec}</span>
        <button class="btn-danger-sm" data-id="${alarm.id}">삭제</button>
      `;
      alarmList.appendChild(li);
    });
  };

  // 알람 시간 확인 및 소리 재생
  const checkAlarms = (hh, mm, ss) => {
    alarms.forEach((alarm) => {
      if (alarm.hour === hh && alarm.min === mm && alarm.sec === ss) {
        playAlarmSound(); // 🔊 알람 소리 출력
        alert(`⏰ 알람! (${alarm.hour}:${alarm.min}:${alarm.sec})`);
      }
    });
  };

  // FR5: 테마 변경 토글
  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  themeToggleBtn?.addEventListener("click", toggleTheme);
  chargeBtn?.addEventListener("click", rechargeBattery);
  addAlarmBtn?.addEventListener("click", addAlarm);
  alarmList?.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-danger-sm")) {
      const id = Number(e.target.getAttribute("data-id"));
      alarms = alarms.filter((a) => a.id !== id);
      renderAlarmList();
    }
  });

  startTimers();
});