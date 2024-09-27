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
    <div class="form-group">
      <label for="birthDate">Birth Date</label>
      <input type="date" id="birthDate" v-model="birthDate" @change="updateReport" />
    </div>

    <!-- Imaging Date Selector -->
    <div class="form-group">
      <label for="imaging-date">Imaging Date:</label>
      <input type="date" v-model="imagingDate" @change="updateReport" />
    </div>

    <!-- Report Section -->
    <div class="report-section">
      <label for="report">Report:</label>
      <div
        id="report"
        v-html="renderedReport"
        class="report-textbox"
        aria-readonly="true"
      ></div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { getStandardDeviation  } from '@/data/BrushFoundationData.js';

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
    const birthDate = ref(getLocalDate());
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
      birthDate.value = getLocalDate(); // Reset birth date to unset
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

    // Create the report markdown
    const reportMarkdown = computed(() => {

      let stdDevForAge = 'N/A';
      let twoStdDev = 'N/A';
      let lowerRange = 'N/A';
      let upperRange = 'N/A';
      let conclusion = 'N/A';

      const genderCapitalized = selectedGender.value.charAt(0).toUpperCase() + selectedGender.value.slice(1);
      const boneAgeMonths = props.boneAge || 'N/A';
      if (ageInMonths.value !== 'N/A' && selectedGender.value) {
        stdDevForAge = getStandardDeviation(selectedGender.value, ageInMonths.value);

        twoStdDev = (2 * stdDevForAge).toFixed(2);
        lowerRange = (ageInMonths.value - 2 * stdDevForAge).toFixed(2);
        upperRange = (ageInMonths.value+ 2 * stdDevForAge).toFixed(2);

        if (boneAgeMonths < lowerRange) {
          const excursion = (ageInMonths.value - boneAgeMonths) / stdDevForAge;
          conclusion = `*Delayed* bone age, ${excursion} below the mean for chronological age.`;
        } else if (boneAgeMonths > upperRange) {
          const excursion = (boneAgeMonths - ageInMonths.value) / stdDevForAge;
          conclusion = `*Advanced* bone age, ${excursion} above the mean for chronological age.`;
        } else {
          conclusion = 'Normal bone age, within two standard deviations of the mean for chronological age.';
        }

      }
      const clinicalReport = `**EXAM**: X-RAY BONE AGE STUDY

**HISTORY**: Short Stature

**TECHNIQUE**: A single frontal view of the LEFT hand was obtained. Bone age was determined according to the method of Greulich and Pyle.

**COMPARISON**: None available.

**FINDINGS**:

- **Gender**: ${genderCapitalized}
- **Chronological age**: ${ageInMonths.value} months
- **Bone Age (estimated by the method of Greulich and Pyle)**: ${boneAgeMonths} months
- **Standard Deviation for age**: ${stdDevForAge} months. (Based on the closest chronological age and gender group in the Brush Foundation data set). Two standard deviations at this age is ${twoStdDev} months, giving a normal range of ${lowerRange} to ${upperRange} (+/- 2 standard deviations).

**IMPRESSION**:

1. ${conclusion}

End of report
`;


    return clinicalReport
    });

    // Render the markdown to HTML
    const renderedReport = computed(() => {
      const rawHTML = marked(reportMarkdown.value);
      return DOMPurify.sanitize(rawHTML);
    });

    return {
      selectedGender,
      birthDate,
      imagingDate,
      ageInMonths,
      setGender,
      updateReport,
      resetDates,
      renderedReport,
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

.form-group {
  display: inline-flex;
  flex-direction: column;
  margin-bottom: 20px;
}

/* Adjust label and input styles if necessary */
.form-group label {
  margin-bottom: 5px;
}

.form-group input {
  /* Existing input styles */
  padding: 10px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 5px;
  width: 100%;
  box-sizing: border-box;
}

.report-textbox {
  border: 1px solid #ccc;
  padding: 8px;
  min-height: 150px;
  overflow-y: auto;
  background-color: #333333;
  color: white;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
}
</style>
