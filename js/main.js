// js/main.js
document.addEventListener('DOMContentLoaded', () => {
  // Dynamische Backend-URL
  const BACKEND_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : 'https://chakra-backend-3783b443f623.herokuapp.com'; // ggf. anpassen

  // ID des eingeloggten Users
  const userId = localStorage.getItem('userId');

  // Kalender-Element und Formular
  const calendarEl = document.getElementById('calendar');
  const exerciseForm = document.getElementById('exercise-form');

  // 1) FULLCALENDAR
  if (calendarEl) {
    if (!userId) {
      // Nicht eingeloggt
      calendarEl.innerHTML = `
        <div class="bg-red-100 text-red-700 p-4 rounded">
          Bitte logge dich ein oder registriere dich, um deinen persönlichen Trainingsplan zu sehen.
        </div>
      `;
    } else {
      // Eingeloggt -> FullCalendar
      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'de',
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
          // extendedProps enthält: weight, repetitions, sets, bodyPart, etc.
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
          // Klick auf ein Event -> Modal
          const exId = info.event.id;
          const title = info.event.title;
          const start = info.event.startStr;
          const weight = info.event.extendedProps.weight;
          const sets = info.event.extendedProps.sets;
          const reps = info.event.extendedProps.repetitions;

          // Modal-Felder
          document.getElementById('modal-title').textContent = title || 'Keine Angabe';
          document.getElementById('modal-date').textContent = start || '-';
          document.getElementById('modal-weight').textContent = weight != null ? weight : '-';
          document.getElementById('modal-sets').textContent = sets != null ? sets : '-';
          document.getElementById('modal-reps').textContent = reps != null ? reps : '-';

          // Speichere die ID global
          window.currentExerciseId = exId;

          // Zeige Modal
          document.getElementById('delete-modal').classList.remove('hidden');
        }
      });
      calendar.render();

      // FORMULAR: Neue Übung
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
          // Neu: bodyPart
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
            // Kalender neu laden
            calendar.refetchEvents();
            // Formular leeren
            exerciseForm.reset();
          } catch (err) {
            console.error('Fehler beim Anlegen einer Übung:', err);
            alert('Konnte die neue Übung nicht speichern!');
          }
        });
      }

      // MODAL-Logik (Löschen)
      const deleteModal = document.getElementById('delete-modal');
      const btnCloseModal = document.getElementById('btn-close-modal');
      const btnDeleteExercise = document.getElementById('btn-delete-exercise');

      // Schließen
      btnCloseModal.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
      });

      // Löschen-Button
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
            // Erfolg -> Kalender aktualisieren
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

  // 2) WETTER-WIDGET
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

  // 3) STATISTIK (Kreisdiagramm)
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
        const url = `${BACKEND_URL}/api/exercises/${userId}/stats?start=${startDate}&end=${endDate}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Server-Fehler: ${response.status}`);
        }
        const data = await response.json();
        // z. B. { "Arme": 2, "Beine": 1 }

        const keys = Object.keys(data);
        if (keys.length === 0) {
          statsResult.textContent = "Keine Einträge im gewählten Zeitraum!";
          statsResult.style.color = 'red';
          if (statsChart) {
            statsChart.destroy();
            statsChart = null;
          }
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

        if (statsChart) {
          statsChart.destroy();
        }
        statsChart = new Chart(statsChartCanvas, {
          type: 'pie',
          data: {
            labels,
            datasets: [{
              data: values,
              backgroundColor: [
                '#f87171', // rot
                '#fbbf24', // gelb
                '#34d399', // grün
                '#60a5fa', // blau
                '#a78bfa', // lila
                '#f472b6', // pink
                // mehr Farben, falls nötig
              ]
            }]
          },
          options: {
            responsive: false,
            plugins: {
              legend: {
                position: 'bottom'
              }
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
