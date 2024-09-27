<template>
  <div class="clinical-panel">
    <div class="panel-header">
      <!-- Reset Button -->
      <div class="reset-container">
        <button @click="resetDates" class="reset-button">Reset</button>
      </div>

      <!-- Gender Slider -->
      <div class="gender-slider">
        <div
          :class="['gender-option', selectedGender === 'male' ? 'active' : 'inactive']"
          @click="setGender('male')"
        >
          Male
        </div>
        <div
          :class="['gender-option', selectedGender === 'female' ? 'active' : 'inactive']"
          @click="setGender('female')"
        >
          Female
        </div>
      </div>
    </div>

    <!-- Birth Date Selector -->
    <label for="birth-date">Birth Date:</label>
    <input type="date" v-model="birthDate" @change="updateReport" />

    <!-- Imaging Date Selector -->
    <label for="imaging-date">Imaging Date:</label>
    <input type="date" v-model="imagingDate" @change="updateReport" />

    <!-- Report Display -->
    <div class="report">
      <h3>Report Data</h3>
      <p>Gender: {{ selectedGender }}</p>
      <p>Birth Date: {{ birthDate }}</p>
      <p>Imaging Date: {{ imagingDate }}</p>
      <p>Age in Months: {{ ageInMonths }}</p>
      <p>Bone Age: {{ boneAge }} months</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  name: 'ClinicalPanel',
  props: {
    boneAge: {
      type: Number,
      required: true,
    },
  },
  emits: ['update-report'],
  setup(props, { emit }) {
    // Reactive State
    const selectedGender = ref('male');
    const birthDate = ref('');
    const imagingDate = ref(getLocalDate());

    // Helper Function to Get Today's Date in YYYY-MM-DD Format
    function getLocalDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // Computed Property to Calculate Age in Months
    const ageInMonths = computed(() => {
      if (!birthDate.value || !imagingDate.value) return 'N/A';

      const birth = new Date(birthDate.value);
      const imaging = new Date(imagingDate.value);
      let yearDiff = imaging.getFullYear() - birth.getFullYear();
      let monthDiff = imaging.getMonth() - birth.getMonth();
      let dayDiff = imaging.getDate() - birth.getDate();

      // Adjust monthDiff if the imaging day is before the birth day in the current month
      if (dayDiff < 0) {
        monthDiff -= 1;
      }

      return yearDiff * 12 + monthDiff; // Total age in months
    });

    // Method to Set Gender and Update Report
    const setGender = (gender) => {
      selectedGender.value = gender;
      updateReport();
    };

    // Method to Emit Updated Report Data to Parent
    const updateReport = () => {
      emit('update-report', {
        gender: selectedGender.value,
        ageInMonths: ageInMonths.value,
        birthDate: birthDate.value,
        imagingDate: imagingDate.value,
      });
    };

    // Method to Reset Dates to Default Values
    const resetDates = () => {
      birthDate.value = ''; // Reset birth date to unset
      imagingDate.value = getLocalDate(); // Reset imaging date to today's date
      updateReport(); // Emit updated report
    };

    // Watchers to Reactively Emit Report Updates When Dates Change
    watch(birthDate, () => {
      updateReport();
    });

    watch(imagingDate, () => {
      updateReport();
    });

    // Watcher for boneAge Prop Changes
    watch(
      () => props.boneAge,
      (newVal) => {
        console.log('New Age', newVal);
      }
    );

    // Return Variables and Methods to Template
    return {
      selectedGender,
      birthDate,
      imagingDate,
      ageInMonths,
      setGender,
      updateReport,
      resetDates,
    };
  },
};
</script>

<style scoped>
.clinical-panel {
  background-color: #1e1e1e;
  padding: 20px;
  color: white;
  border-radius: 8px;
  width: 100%; /* Ensure it takes full width */
  box-sizing: border-box;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.reset-container {
  width: 25%; /* 25% of the panel width */
}

.reset-button {
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  border-radius: 10px; /* Rounded rectangle */
  height: 100%;
  width: 100%;
  text-align: center;
}

.gender-slider {
  display: flex;
  justify-content: space-around;
  padding: 10px;
  background-color: #333;
  border-radius: 10px; /* Bigger rounded rect */
  width: 50%; /* 50% of the panel width */
  height: 100%;
}

.gender-option {
  cursor: pointer;
  padding: 10px;
  border-radius: 5px;
  font-size: 1.2rem;
  color: gray;
}

.gender-option.active {
  background-color: green;
  color: white;
}

.gender-option.inactive {
  background-color: #555;
  color: gray;
}

label {
  margin-top: 20px;
}

input {
  margin-top: 5px;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 5px;
}

.report {
  margin-top: 20px;
  padding: 10px;
  background-color: #444;
  color: white;
  border-radius: 5px;
}
</style>
