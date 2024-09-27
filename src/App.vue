<template>
  <div id="app">
    <!-- Title -->
    <h1>Greulich and Pyle Bone Age Calculator, v1.3</h1>

    <!-- Main Content -->
    <div class="main-container">
      <!-- Clinical Panel and Image Display -->
      <div class="clinical-panel-container">
        <ClinicalPanel
          :boneAge="report.boneAge"
          @update-report="handleReportUpdate"
        />
      </div>
      <div class="image-display-container">
        <ImageDisplay
          :selectedGender="report.gender || 'male'"
          :ageInMonths="report.ageInMonths || 0"
          @update-bone-age="handleImageAgeUpdate" />
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, computed } from 'vue';
import ClinicalPanel from './components/ClinicalPanel.vue';
import ImageDisplay from './components/ImageDisplay.vue';

export default {
  name: 'App',
  components: {
    ClinicalPanel,
    ImageDisplay,
  },
  setup() {
    // Reactive State using reactive for the report object, including boneAge
    const report = reactive({
      gender: 'male',      // Default to Male
      birthDate: '',
      imagingDate: '',
      ageInMonths: 0,     // Calculated age in months
      boneAge: 0,         // Bone Age of current image
    });

    // Computed Properties for Formatted Dates
    const formattedBirthDate = computed(() =>
      report.birthDate
        ? new Date(report.birthDate).toLocaleDateString()
        : 'N/A'
    );

    const formattedImagingDate = computed(() =>
      report.imagingDate
        ? new Date(report.imagingDate).toLocaleDateString()
        : 'N/A'
    );

    // Method: Calculate Age in Months
    const calculateAgeInMonths = (birthDate, imagingDate) => {
      if (!birthDate || !imagingDate) return 0;

      const birth = new Date(birthDate);
      const imaging = new Date(imagingDate);

      let yearDiff = imaging.getFullYear() - birth.getFullYear();
      let monthDiff = imaging.getMonth() - birth.getMonth();
      let dayDiff = imaging.getDate() - birth.getDate();

      if (dayDiff < 0) {
        monthDiff -= 1;
      }

      return yearDiff * 12 + monthDiff;
    };

    // Method: Handle Report Updates from ClinicalPanel
    const handleReportUpdate = (data) => {
      console.log('Received report update:', data);

      // Update report object properties
      report.gender = data.gender;
      report.birthDate = data.birthDate;
      report.imagingDate = data.imagingDate;
      report.ageInMonths = calculateAgeInMonths(
        data.birthDate,
        data.imagingDate
      );
    };

    // Method: Handle Bone Age Updates from ImageDisplay
    const handleImageAgeUpdate = (age) => {
      console.log('Updating bone age:', age);
      report.boneAge = age; // Update boneAge within report object
    };

    return {
      report,
      formattedBirthDate,
      formattedImagingDate,
      handleReportUpdate,
      handleImageAgeUpdate,
    };
  },
};
</script>

<style>
#app {
  background-color: #121212;
  color: #ffffff;
  font-family: Arial, sans-serif;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.main-container {
  display: flex;
  justify-content: space-between;
  gap: 20px;
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

.report-section {
  margin-top: 30px;
  padding: 15px;
  background-color: #1e1e1e;
  border-radius: 8px;
}

.report-section h2 {
  margin-bottom: 10px;
}

.report-section p {
  margin: 5px 0;
}
</style>
