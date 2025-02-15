// js/main.js
document.addEventListener('DOMContentLoaded', () => {
  const BACKEND_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : 'https://chakra-backend-3783b443f623.herokuapp.com';

  const userId = localStorage.getItem('userId');
  const calendarEl = document.getElementById('calendar');
  const exerciseForm = document.getElementById('exercise-form');

  // =======================
  // A) FullCalendar
  // =======================
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
          // 1) Hol Daten
          const exId = info.event.id;
          const title = info.event.title;
          const start = info.event.startStr; // oder info.event.start
          const weight = info.event.extendedProps.weight;
          const sets = info.event.extendedProps.sets;
          const reps = info.event.extendedProps.repetitions;

          // 2) Fülle Modal-Felder
          document.getElementById('modal-title').textContent = title || 'Keine Angabe';
          document.getElementById('modal-date').textContent = start || '-';
          document.getElementById('modal-weight').textContent = weight != null ? weight : '-';
          document.getElementById('modal-sets').textContent = sets != null ? sets : '-';
          document.getElementById('modal-reps').textContent = reps != null ? reps : '-';

          // 3) Speichere exerciseId in einer globalen / closure-Variablen
          //    oder setze es in dataset
          window.currentExerciseId = exId;

          // 4) Modal anzeigen
          const deleteModal = document.getElementById('delete-modal');
          deleteModal.classList.remove('hidden');
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

          const newEvent = { title, start: date, weight, repetitions, sets };
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

      // =======================
      // MODAL-Logik
      // =======================
      const deleteModal = document.getElementById('delete-modal');
      const btnCloseModal = document.getElementById('btn-close-modal');
      const btnDeleteExercise = document.getElementById('btn-delete-exercise');

      // Close-Button: einfach Modal verstecken
      btnCloseModal.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
      });

      // Löschen-Button
      btnDeleteExercise.addEventListener('click', async () => {
        // Nochmal fragen?
        const sure = confirm("Wirklich löschen?");
        if (!sure) return;

        const exerciseId = window.currentExerciseId;
        if (!exerciseId) {
          alert("Kein Event selektiert?");
          return;
        }

        try {
          const url = `${BACKEND_URL}/api/exercises/${userId}/${exerciseId}`;
          const response = await fetch(url, {
            method: 'DELETE'
          });
          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }
          const data = await response.json();
          if (data.success) {
            // Erfolg => Kalender aktualisieren
            calendar.refetchEvents();
            // Modal schließen
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
  // Falls nur ein Formular ohne Calendar...
  else if (exerciseForm) {
    // ...
  }

  // =======================
  // B) WETTER-WIDGET (wie gehabt)
  // =======================
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
          const iconCode = data.icon;
          weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
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
});
