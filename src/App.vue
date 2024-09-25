<template>
  <div id="app">
    <!-- Title -->
    <h1>Grelich and Pyle Bone Age Calculator, v1.2</h1>

    <!-- Main Content -->
    <div class="main-container">
      <!-- Clinical Panel and Image Display -->
      <div class="clinical-panel-container">
        <ClinicalPanel @update-report="generateReport" />
      </div>
      <div class="image-display-container">
        <ImageDisplay
          :selectedGender="selectedGender"
          :age="ageInMonths"
          :report="report"
        />
      </div>
    </div>
  </div>
</template>

<script>
// Import the correct components
import ClinicalPanel from './components/ClinicalPanel.vue';
import ImageDisplay from './components/ImageDisplay.vue';

export default {
  // Register components
  components: {
    ClinicalPanel,
    ImageDisplay,
  },
  data() {
    return {
      selectedGender: 'M',  // Default to Male
      birthDate: '',
      imagingDate: '',
      report: '',
      ageInMonths: 0
    };
  },
  methods: {
    generateReport(data) {
      this.selectedGender = data.gender;
      this.birthDate = data.birthDate;
      this.imagingDate = data.imagingDate;

      if (this.birthDate && this.imagingDate) {
        this.ageInMonths = this.calculateAgeInMonths(this.birthDate, this.imagingDate);
      }

      this.report = `Gender: ${data.gender}, Birth Date: ${data.birthDate}, Imaging Date: ${data.imagingDate}, Age in Months: ${this.ageInMonths}`;
    },
    calculateAgeInMonths(birthDate, imagingDate) {
      const birth = new Date(birthDate);
      const imaging = new Date(imagingDate);

      const yearsDifference = imaging.getFullYear() - birth.getFullYear();
      const monthsDifference = imaging.getMonth() - birth.getMonth();

      // Calculate the total difference in months and round to the nearest integer
      const ageInMonths = yearsDifference * 12 + monthsDifference;

      return ageInMonths;
    }
  },
};
</script>

<style>
#app {
  background-color: #121212;
  color: #ffffff;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.main-container {
  display: flex;
  justify-content: space-between;
}

.clinical-panel-container {
  flex: 1;
}

.image-display-container {
  flex: 3;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
