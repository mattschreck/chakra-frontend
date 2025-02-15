// js/main.js
document.addEventListener('DOMContentLoaded', () => {
  const BACKEND_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : 'https://chakra-backend-3783b443f623.herokuapp.com';

  const userId = localStorage.getItem('userId');
  const calendarEl = document.getElementById('calendar');
  const exerciseForm = document.getElementById('exercise-form');

  // FULLCALENDAR
  if (calendarEl) {
    if (!userId) {
      calendarEl.innerHTML = `
        <div class="bg-red-100 text-red-700 p-4 rounded">
          Bitte logge dich ein oder registriere dich, um deinen persönlichen Trainingsplan zu sehen.
        </div>
      `;
    } else {
      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'de',
        firstDay: 1,           // Montag als Wochenstart
        dayMaxEventRows: 3,    // begrenzt Höhe pro Tag
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,listWeek'
        },
        events: {
          url: `${BACKEND_URL}/api/exercises/${userId}`,
          method: 'GET',
          failure: () => {
            alert('Fehler beim Laden der Events vom Backend!');
          }
        },
        eventContent: (info) => {
          const { title, extendedProps } = info.event;
          return {
            html: `
              <div>
                <strong>${title}</strong><br />
                Gewicht: ${extendedProps.weight} kg<br />
                Sätze: ${extendedProps.sets}<br />
                Wiederholungen: ${extendedProps.repetitions}
              </div>
            `
          };
        },
        eventClick: (info) => {
          // Klick -> Modal
          window.currentExerciseId = info.event.id;

          document.getElementById('modal-title').textContent = info.event.title || '-';
          document.getElementById('modal-date').textContent = info.event.startStr || '-';
          document.getElementById('modal-weight').textContent = info.event.extendedProps.weight ?? '-';
          document.getElementById('modal-sets').textContent = info.event.extendedProps.sets ?? '-';
          document.getElementById('modal-reps').textContent = info.event.extendedProps.repetitions ?? '-';

          document.getElementById('delete-modal').classList.remove('hidden');
        }
      });
      calendar.render();

      // Formular -> Neue Übung
      if (exerciseForm) {
        exerciseForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          if (!userId) {
            alert("Bitte logge dich ein, um eine Übung hinzuzufügen!");
            return;
          }

          const title = document.getElementById('ex-title').value.trim();
          const date = document.getElementById('ex-date').value;
          const weight = parseInt(document.getElementById('ex-weight').value, 10);
          const repetitions = parseInt(document.getElementById('ex-repetitions').value, 10);
          const sets = parseInt(document.getElementById('ex-sets').value, 10);
          const bodyPart = document.getElementById('ex-bodypart').value;

          const newEvent = { 
            title,
            start: date,
            weight,
            repetitions,
            sets,
            bodyPart
          };

          try {
            const response = await fetch(`${BACKEND_URL}/api/exercises/${userId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newEvent)
            });
            if (!response.ok) {
              throw new Error(`Server error: ${response.status}`);
            }
            calendar.refetchEvents();
            exerciseForm.reset();
          } catch (err) {
            console.error('Fehler beim Anlegen einer Übung:', err);
            alert('Konnte die neue Übung nicht speichern!');
          }
        });
      }

      // MODAL -> Löschen
      const deleteModal = document.getElementById('delete-modal');
      const btnCloseModal = document.getElementById('btn-close-modal');
      const btnDeleteExercise = document.getElementById('btn-delete-exercise');

      btnCloseModal.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
      });

      btnDeleteExercise.addEventListener('click', async () => {
        const sure = confirm("Wirklich löschen?");
        if (!sure) return;
        const exerciseId = window.currentExerciseId;
        if (!exerciseId) {
          alert("Kein Event selektiert?");
          return;
        }
        try {
          const deleteUrl = `${BACKEND_URL}/api/exercises/${userId}/${exerciseId}`;
          const response = await fetch(deleteUrl, { method: 'DELETE' });
          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }
          const data = await response.json();
          if (data.success) {
            calendar.refetchEvents();
            deleteModal.classList.add('hidden');
          } else {
            alert('Fehler beim Löschen: ' + data.message);
          }
        } catch (err) {
          console.error('Löschfehler:', err);
          alert('Konnte nicht löschen!');
        }
      });
    }
  }

  // WETTER
  const loadWeatherBtn = document.getElementById('load-weather-btn');
  const weatherCityInput = document.getElementById('weather-city');
  const weatherWidget = document.getElementById('weather-widget');
  const weatherIcon = document.getElementById('weather-icon');
  const weatherTemp = document.getElementById('weather-temp');
  const weatherDesc = document.getElementById('weather-desc');
  const weatherCityResult = document.getElementById('weather-city-result');
  const weatherError = document.getElementById('weather-error');

  if (loadWeatherBtn && weatherCityInput && weatherWidget) {
    loadWeatherBtn.addEventListener('click', async () => {
      weatherError.textContent = '';
      weatherWidget.classList.add('hidden');

      const city = weatherCityInput.value.trim() || 'Berlin';
      try {
        const response = await fetch(`${BACKEND_URL}/api/weather?city=${city}`);
        if (!response.ok) {
          throw new Error(`Fehler vom Backend: ${response.status}`);
        }
        const data = await response.json();
        if (data.error) {
          weatherError.textContent = 'Fehler: ' + data.error;
          weatherError.style.color = 'red';
        } else {
          weatherIcon.src = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;
          weatherTemp.textContent = data.temperature.toFixed(1) + ' °C';
          weatherDesc.textContent = data.description;
          weatherCityResult.textContent = data.city;
          weatherWidget.classList.remove('hidden');
        }
      } catch (err) {
        weatherError.textContent = 'Konnte Wetter nicht laden: ' + err.message;
        weatherError.style.color = 'red';
      }
    });
  }

  // STATISTIK (Doughnut)
  const statsBtn = document.getElementById('stats-btn');
  const statsResult = document.getElementById('stats-result');
  const statsChartCanvas = document.getElementById('stats-chart');
  let statsChart;

  if (statsBtn && statsResult && statsChartCanvas) {
    statsBtn.addEventListener('click', async () => {
      if (!userId) {
        statsResult.textContent = "Bitte einloggen!";
        statsResult.style.color = 'red';
        return;
      }
      const startDate = document.getElementById('stats-start').value;
      const endDate = document.getElementById('stats-end').value;
      if (!startDate || !endDate) {
        statsResult.textContent = "Bitte Start- und Enddatum auswählen!";
        statsResult.style.color = 'red';
        return;
      }

      try {
        const statsUrl = `${BACKEND_URL}/api/exercises/${userId}/stats?start=${startDate}&end=${endDate}`;
        const response = await fetch(statsUrl);
        if (!response.ok) {
          throw new Error(`Server-Fehler: ${response.status}`);
        }
        const data = await response.json();
        const keys = Object.keys(data);

        if (keys.length === 0) {
          statsResult.textContent = "Keine Einträge im gewählten Zeitraum!";
          statsResult.style.color = 'red';
          if (statsChart) statsChart.destroy();
          statsChart = null;
          return;
        }

        statsResult.textContent = "Verteilung der Körperpartien:";
        statsResult.style.color = 'black';

        const labels = [];
        const values = [];
        for (const bp of keys) {
          labels.push(bp);
          values.push(data[bp]);
        }

        // ggf. alten Chart zerstören
        if (statsChart) statsChart.destroy();

        // Chart.js 2.x syntax
        statsChart = new Chart(statsChartCanvas, {
          type: 'doughnut',
          data: {
            labels,
            datasets: [{
              data: values,
              backgroundColor: [
                '#f87171', '#fbbf24', '#34d399', '#60a5fa',
                '#a78bfa', '#f472b6',
              ]
            }]
          },
          options: {
            responsive: false, // wir wollen feste Größe
            legend: {
              position: 'bottom'
            }
          }
        });
      } catch (err) {
        statsResult.textContent = `Fehler beim Laden der Statistik: ${err.message}`;
        statsResult.style.color = 'red';
      }
    });
  }
});
