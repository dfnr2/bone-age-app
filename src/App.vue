<template>
  <div id="app">
    <!-- Title -->
    <h1>Greulich and Pyle Bone Age Calculator, v1.3</h1>

    <!-- Main Content -->
    <div class="main-container">
      <!-- Clinical Panel and Image Display -->
      <div class="clinical-panel-container">
        <ClinicalPanel
          :currentImageAge="currentImage.ageInMonths"
          @update-report="handleReportUpdate"
        />
      </div>
      <div class="image-display-container">
        <ImageDisplay
          :selectedGender="report.gender || 'male'"
          :ageInMonths="report.ageInMonths || 0"
          @update-image="updateCurrentImage"
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
      report: {
        gender: 'male',  // Default to Male
        birthDate: '',
        imagingDate: '',
        ageInMonths: 0,  // Calculated age in months
      },
      currentImage: {
        ageInMonths: 0  // Default to 0
      }
    };
  },
  methods: {
    handleReportUpdate(data) {
      console.log('Received report update:', data);  // <-- Ensure this log appears when the event is emitted
      this.report = data;  // Update the report object with the new data

      // Calculate ageInMonths if birthDate and imagingDate are present
      if (this.report.birthDate && this.report.imagingDate) {
        this.report.ageInMonths = this.calculateAgeInMonths(this.report.birthDate, this.report.imagingDate);
      }
    },
    updateCurrentImage(imageData) {
      console.log('Updating current image:', imageData);
      this.currentImage = imageData;  // Update currentImage with the selected image data
    },
    calculateAgeInMonths(birthDate, imagingDate) {
      const birth = new Date(birthDate);
      const imaging = new Date(imagingDate);

      let yearDiff = imaging.getFullYear() - birth.getFullYear();
      let monthDiff = imaging.getMonth() - birth.getMonth();
      let dayDiff = imaging.getDate() - birth.getDate();

      if (dayDiff < 0) {
        monthDiff -= 1;
      }

      return yearDiff * 12 + monthDiff;
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
