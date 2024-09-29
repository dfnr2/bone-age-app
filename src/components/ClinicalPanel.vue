<template>
  <div class="clinical-panel">
    <div class="panel-header">
      <!-- Reset Button -->
      <div class="reset-container">
        <div><button @click="resetDates" class="reset-button">Reset</button></div>
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

    <!-- History Selector Dropdown -->
    <div class="form-group">
      <label for="history-select">History:</label>
      <select id="history-select" v-model="selectedHistory" @change="handleHistoryChange">
        <option v-for="option in historyOptions" :key="option" :value="option">
          {{ option }}
        </option>
      </select>
    </div>

    <!-- Custom History Input (Visible Only When "Custom" is Selected) -->
    <div class="form-group" v-if="selectedHistory === 'Custom'">
      <label for="custom-history">Enter Custom History:</label>
      <input
        type="text"
        id="custom-history"
        v-model="customHistory"
        @input="updateReportDebounced"
        placeholder="Type your custom history here"
      />
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
      <!-- Copy to Clipboard Button -->
      <button class="copy-button" @click="copyReportToClipboard" aria-label="Copy full bone age report to clipboard">
        {{ copyButtonText }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { getStandardDeviation } from '@/data/BrushFoundationData.js';
import { useToast } from 'vue-toastification';
import removeMarkdown from 'remove-markdown'; // Import the remove-markdown package
import debounce from 'lodash.debounce';
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
    // Initialize Toast
    const toast = useToast();

    // Reactive State
    const selectedGender = ref('male');
    const birthDate = ref(getLocalDate());
    const imagingDate = ref(getLocalDate());

    const historyOptions = ref([
      'Short Stature',
      'Precocious Puberty',
      'Hyperpituitarism',
      'Growth Hormone Deficiency',
      'Turner Syndrome',
      'Chronic Illness',
      'Custom', // Option to allow custom input
    ]);

    const selectedHistory = ref(historyOptions.value[0]); // Default to the first option
    const customHistory = ref(''); // Holds the custom history input

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
      const avgDaysInMonth = 30.44;

      const months = Math.round((imaging - birth) / (10 * 60 * 60 * 24 * avgDaysInMonth)) / 100;
      console.log('age in msec: ', imaging - birth);
      console.log('age in months: ', months);
      return Math.min(Math.max(months, 0), 240);
    });

    // Method to Set Gender and Update Report
    const setGender = (gender) => {
      selectedGender.value = gender;
      updateReportDebounced();
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

    // Debounced Update Report to Optimize Performance
    const updateReportDebounced = debounce(updateReport, 100);

    // Method to Reset Dates and History to Default Values
    const resetDates = () => {
      birthDate.value = getLocalDate(); // Reset birth date to today's date
      imagingDate.value = getLocalDate(); // Reset imaging date to today's date
      selectedHistory.value = historyOptions.value[0]; // Reset history to default
      customHistory.value = ''; // Reset custom history
      updateReportDebounced(); // Emit updated report
    };

    // Handle History Selection Change
    const handleHistoryChange = () => {
      if (selectedHistory.value !== 'Custom') {
        customHistory.value = ''; // Clear custom history if not in use
        updateReportDebounced();
      }
      // If 'Custom' is selected, wait for user input to update the report
    };

    // Watchers to Reactively Emit Report Updates When Dates Change
    watch(birthDate, () => {
      updateReportDebounced();
    });

    watch(imagingDate, () => {
      updateReportDebounced();
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
      const genderCapitalized = selectedGender.value.charAt(0).toUpperCase() + selectedGender.value.slice(1);
      const boneAgeMonths = props.boneAge || 'N/A';

      let stdDevForAge = 'N/A';
      let twoStdDev = 'N/A';
      let lowerRange = 'N/A';
      let upperRange = 'N/A';
      let conclusion = 'N/A';
      let reportedHistory = selectedHistory.value;

      if ('Custom' === selectedHistory.value ) {
        reportedHistory = customHistory.value;
      }
      console.log('selected Hist: ', selectedHistory.value);
      console.log('custom Hist: ', customHistory.value);
      console.log('reported Hist: ', reportedHistory);

      if (ageInMonths.value !== 'N/A' && selectedGender.value) {
        stdDevForAge = getStandardDeviation(selectedGender.value, ageInMonths.value);

        // Ensure stdDevForAge is a number
        if (typeof stdDevForAge === 'number' && !isNaN(stdDevForAge)) {
          twoStdDev = (2 * stdDevForAge).toFixed(2);
          lowerRange = (ageInMonths.value - 2 * stdDevForAge).toFixed(2);
          upperRange = (ageInMonths.value + 2 * stdDevForAge).toFixed(2);

          // Ensure boneAgeMonths is a number
          const boneAgeValue = parseFloat(boneAgeMonths);
          const lowerRangeValue = parseFloat(lowerRange);
          const upperRangeValue = parseFloat(upperRange);

          if (!isNaN(boneAgeValue)) {
            if (boneAgeValue < lowerRangeValue) {
              const excursion = ((ageInMonths.value - boneAgeValue) / stdDevForAge).toFixed(2);
              conclusion = `*Delayed* bone age, ${excursion} standard deviations below the mean for chronological age.`;
            } else if (boneAgeValue > upperRangeValue) {
              const excursion = ((boneAgeValue - ageInMonths.value) / stdDevForAge).toFixed(2);
              conclusion = `*Advanced* bone age, ${excursion} standard deviations above the mean for chronological age.`;
            } else {
              conclusion = 'Normal bone age, within two standard deviations of the mean for chronological age.';
            }
          } else {
            conclusion = 'Invalid bone age value.';
          }
        } else {
          conclusion = 'Invalid standard deviation value.';
        }
      }

      const clinicalReport = `**EXAM**: X-RAY BONE AGE STUDY

**HISTORY**: ${reportedHistory || "None Provided"}

**TECHNIQUE**: A single frontal view of the LEFT hand was obtained. Bone age was determined according to the method of Greulich and Pyle.

**COMPARISON**: None available.

**FINDINGS**:

**Gender**: ${genderCapitalized}

**Chronological age**: ${ageInMonths.value} months

**Bone Age (estimated by the method of Greulich and Pyle)**: ${boneAgeMonths} months

**Standard Deviation for age**: ${stdDevForAge} months. (Based on the closest chronological age and gender group in the Brush Foundation data set). Two standard deviations at this age is ${twoStdDev} months, giving a normal range of ${lowerRange} to ${upperRange} (+/- 2 standard deviations).

**IMPRESSION**:

1. ${conclusion}

_End of report_
`;

      return clinicalReport;
    });

    // Render the markdown to HTML
    const renderedReport = computed(() => {
      const rawHTML = marked(reportMarkdown.value);
      return DOMPurify.sanitize(rawHTML);
    });

    const copyReportToClipboard = async () => {
      const plainTextReport = removeMarkdown(reportMarkdown.value);

      try {
        await navigator.clipboard.writeText(plainTextReport);
        toast.success('Full report copied to clipboard!');
        // Optional: Change button text
        copyButtonText.value = 'Copied!';
        setTimeout(() => {
          copyButtonText.value = 'Copy Full Report';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
        toast.error('Failed to copy the report to clipboard.');
      }
    };

    const copyButtonText = ref('Copy Full Report');

    return {
      selectedGender,
      birthDate,
      imagingDate,
      ageInMonths,
      setGender,
      updateReport,
      resetDates,
      renderedReport,
      copyReportToClipboard,
      copyButtonText,
      handleHistoryChange,
      selectedHistory,
      customHistory,
      historyOptions,
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

.report-section {
  margin-top: 20px;
}

.report-textbox {
  border: 1px solid #ccc;
  padding: 8px;
  min-height: 150px;
  overflow-y: auto;
  background-color: #333333;
  color: white;
  font-family: inherit;
}

.copy-button {
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #007bff; /* Bootstrap primary color */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px; /* Space between buttons */
}

.copy-button:hover,
.download-button:hover {
  background-color: #0056b3; /* Darken on hover */
}
</style>
