<template>
  <div id="app">
    <!-- Main Content -->
    <div class="main-container">
      <!-- Clinical Panel -->
      <div class="clinical-panel-container">
        <ClinicalPanel
          :boneAge="report.boneAge"
          @update-report="handleReportUpdate"
        />
      </div>

      <!-- Image Display -->
      <div class="image-display-container">
        <ImageDisplay
          :selectedGender="report.gender || 'male'"
          :ageInMonths="report.ageInMonths || 0"
          @update-bone-age="handleImageAgeUpdate"
        />
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
:root {
  --breakpoint-width: 720px; /* Configurable breakpoint */
  --image-aspect-ratio: 5 / 8; /* Represented as width / height */
  --threshold-aspect-ratio: calc(2 * var(--image-aspect-ratio)); /* 1.25 */
}

#app {
  background-color: #121212;
  color: #ffffff;
  font-family: Arial, sans-serif;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

.main-container {
  display: flex;
  flex-wrap: nowrap;
  gap: 20px;
  height: 80vh; /* Example height: adjust as needed */
}

.clinical-panel-container,
.image-display-container {
  display: flex;
  flex-direction: column;
}

/* Default Flex Basis for Containers */
.clinical-panel-container {
  flex: 0 0 25%; /* 25% of the window width */
}

.image-display-container {
  flex: 0 0 75%; /* 75% of the window width */
  display: flex;
  flex-direction: row;
  gap: 20px;
}

/* Image Display Sizing */
.image-display-container .image-content {
  flex: 1; /* Takes up available space */
}

.image-display-container .interpretation-notes {
  flex: 0 0 25%; /* 25% of the window width */
  height: 100%;
}

/* Responsive Layout Based on Aspect Ratio */
@media (min-aspect-ratio: 5/4) {
  /* Window aspect ratio ≥ 1.25 */
  .image-display-container {
    flex-direction: row;
  }

  .image-display-container .image-content {
    width: 50%; /* 50% of window width */
    height: 100vh; /* 100% of window height */
  }

  .image-display-container .interpretation-notes {
    width: 25%; /* 25% of window width */
    height: 100vh; /* 100% of window height */
  }

  .clinical-panel-container {
    width: 25%; /* 25% of window width */
  }
}

@media (max-aspect-ratio: 5/4) {
  /* Window aspect ratio < 1.25 */
  .image-display-container {
    flex-direction: column;
    align-items: center;
  }

  .image-display-container .image-content {
    width: 50%; /* 50% of window width */
    height: calc((50% / (5 / 8))); /* Height based on aspect ratio */
  }

  .image-display-container .interpretation-notes {
    width: 25%; /* 25% of window width */
    height: 100vh; /* 100% of window height */
  }

  .clinical-panel-container {
    width: 25%; /* 25% of window width */
  }
}

.clinical-panel-container,
.image-display-container {
  box-sizing: border-box;
}

/* Ensure image and notes fill their containers */
.image-display-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
