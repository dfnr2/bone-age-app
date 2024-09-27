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
      <p>Bone Age: {{ this.boneAge }} months</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    boneAge: {   // Receive the current image's age from the parent component
      type: Number,
      // default: 0
    }
  },
  data() {
    return {
      selectedGender: "male",
      birthDate: "",
      imagingDate: this.getLocalDate(),  // Set to today's date by default
    };
  },
  computed: {
    ageInMonths() {
      if (!this.birthDate || !this.imagingDate) return "N/A";

      const birth = new Date(this.birthDate);
      const imaging = new Date(this.imagingDate);
      let yearDiff = imaging.getFullYear() - birth.getFullYear();
      let monthDiff = imaging.getMonth() - birth.getMonth();
      let dayDiff = imaging.getDate() - birth.getDate();

      // Adjust monthDiff if the imaging day is before the birth day in the current month
      if (dayDiff < 0) {
        monthDiff -= 1;
      }

      return yearDiff * 12 + monthDiff;  // Total age in months
    }
  },
  methods: {
    getLocalDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');  // Correct month
      const day = String(today.getDate()).padStart(2, '0');  // Correct day

      return `${year}-${month}-${day}`;  // Return local date in YYYY-MM-DD
    },
    setGender(gender) {
      this.selectedGender = gender;
      this.updateReport();
    },
    updateReport() {
      this.$emit('update-report', {
        gender: this.selectedGender,
        ageInMonths: this.ageInMonths,
        birthDate: this.birthDate,
        imagingDate: this.imagingDate
      });
    },
    resetDates() {
      this.birthDate = "";  // Reset birth date to unset
      this.imagingDate = this.getLocalDate();  // Reset imaging date to today's date
      this.updateReport();  // Update the report to reflect the changes
    }
  },
  watch: {
    birthDate() {
      this.updateReport();  // Ensure birthDate change triggers report update
    },
    imagingDate() {
      this.updateReport();  // Ensure imagingDate change triggers report update
    },
    boneAge() {
      console.log('New Age', this.boneAge);
    }
  }
}
</script>

<style scoped>
.clinical-panel {
  width: 300px;
  background-color: #1e1e1e;
  padding: 20px;
  display: flex;
  flex-direction: column;
  color: white;
  border-radius: 8px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.reset-container {
  width: 25%;  /* 25% of the panel width */
}

.reset-button {
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  border-radius: 10px;  /* Rounded rectangle */
  height: 100%;
  width: 100%;
  text-align: center;
}

.gender-slider {
  display: flex;
  justify-content: space-around;
  padding: 10px;
  background-color: #333;
  border-radius: 10px;  /* Bigger rounded rect */
  width: 50%;  /* 50% of the panel width */
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
