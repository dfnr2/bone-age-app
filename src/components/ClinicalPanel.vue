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

    <!-- Report Section with Tabs -->
    <div class="report-section">
      <!-- Tab Buttons -->
      <div class="report-tabs" role="tablist">
        <button
          :class="{ active: activeTab === 'summary' }"
          @click="activeTab = 'summary'"
          role="tab"
          :aria-selected="activeTab === 'summary'"
        >
          Summary
        </button>
        <button
          :class="{ active: activeTab === 'report' }"
          @click="activeTab = 'report'"
          role="tab"
          :aria-selected="activeTab === 'report'"
        >
          Full Report
        </button>
      </div>

      <!-- Report Content -->
      <div class="report-content">
        <div v-if="activeTab === 'report'" v-html="renderedReport"></div>
        <div v-else-if="activeTab === 'summary'" v-html="renderedSummary"></div>
      </div>

      <!-- Copy to Clipboard Button -->
      <div class="copy-button-container">
        <button
          class="copy-button"
          @click="copyReportToClipboard"
          aria-label="Copy full bone age report to clipboard"
        >
          {{ copyButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { getStandardDeviation } from '@/data/BrushFoundationData.js';
import { useToast } from 'vue-toastification';
import removeMarkdown from 'remove-markdown'; // Used for the copy-report function.
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

    const activeTab = ref('summary'); // Default to 'summary' tab
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
      let shortConclusion = 'N/A';
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
          lowerRange = Math.max(0, (ageInMonths.value - 2 * stdDevForAge).toFixed(2));
          upperRange = (ageInMonths.value + 2 * stdDevForAge).toFixed(2);

          // Ensure boneAgeMonths is a number
          const boneAgeValue = parseFloat(boneAgeMonths);
          const lowerRangeValue = parseFloat(lowerRange);
          const upperRangeValue = parseFloat(upperRange);

          if (!isNaN(boneAgeValue)) {
            if (boneAgeValue < lowerRangeValue) {
              const excursion = ((ageInMonths.value - boneAgeValue) / stdDevForAge).toFixed(2);
              conclusion = `*Delayed* bone age, ${excursion} standard deviations below the mean for chronological age.`;
              shortConclusion = 'Delayed';
            } else if (boneAgeValue > upperRangeValue) {
              const excursion = ((boneAgeValue - ageInMonths.value) / stdDevForAge).toFixed(2);
              conclusion = `*Advanced* bone age, ${excursion} standard deviations above the mean for chronological age.`;
              shortConclusion = 'Advanced'
            } else {
              conclusion = 'Normal bone age, within two standard deviations of the mean for chronological age.';
              shortConclusion = 'Normal'
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

**Standard Deviation for age**: ${stdDevForAge} months. (Based on the closest chronological age and gender group in the Brush Foundation data set). Two standard deviations at this age is ${twoStdDev} months, giving a normal range of ${lowerRange} to ${upperRange} months (+/- 2 standard deviations).

**IMPRESSION**:

1. ${conclusion}

_End of report_
`;

      const clinicalSummary = `**HISTORY**: ${reportedHistory || "None Provided"}

**Gender**: ${genderCapitalized}

**Chronological age**: ${ageInMonths.value} months

**Bone Age (estimated by the method of Greulich and Pyle)**: ${boneAgeMonths} months

**Standard Deviation for age**: ${stdDevForAge} months.

**Range**: ${lowerRange} to ${upperRange} months.

**Conclusion**: ${shortConclusion}`;

      return { clinicalReport, clinicalSummary };
    });

    // Render the markdown to HTML
    const renderedReport = computed(() => {
      const rawHTML = marked(reportMarkdown.value.clinicalReport);
      return DOMPurify.sanitize(rawHTML);
    });


    // Rendered Summary
    const renderedSummary = computed(() => {
      if (reportMarkdown.value.clinicalSummary) {
        const rawHTML = marked(reportMarkdown.value.clinicalSummary);
        return DOMPurify.sanitize(rawHTML);
      }
      return '';
    });

    const copyReportToClipboard = async () => {
      console.log('Clinical Report:', reportMarkdown.value.clinicalReport);
      console.log('Type of Clinical Report:', typeof reportMarkdown.value.clinicalReport);

      const plainTextReport = removeMarkdown(reportMarkdown.value.clinicalReport);

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
      renderedSummary,
      copyReportToClipboard,
      copyButtonText,
      handleHistoryChange,
      selectedHistory,
      customHistory,
      activeTab,
      historyOptions,
    };
  },
};
</script>

<style scoped>
.clinical-panel {
  display: flex;
  flex-direction: column;
  height: 100%; /* Ensure it fills the parent container's height */
  background-color: #1e1e1e;
  padding: 20px;
  color: white;
  border-radius: 8px;
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

/* Report Section */
.report-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Tab Buttons */
.report-tabs {
  display: flex;
  border-bottom: 2px solid #007bff; /* Blue underline for tabs */
  margin-bottom: 10px;
  border-radius: 5px 5px 0 0; /* Rounded top corners */
  overflow: hidden; /* Ensures border-radius works on child buttons */
}

/* Individual Tab Buttons */
.report-tabs button {
  flex: 1;
  padding: 10px 20px;
  background-color: white; /* Default background */
  color: #007bff; /* Blue text */
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease, color 0.3s ease;
  outline: none; /* Remove default focus outline */
}

/* Active Tab */
.report-tabs button.active {
  background-color: #007bff; /* Blue background */
  color: white; /* White text */
  font-weight: bold;
}

/* Hover Effect for Unselected Tabs */
.report-tabs button:not(.active):hover {
  background-color: #f0f0f0; /* Light gray on hover */
}

/* Focus State for Accessibility */
.report-tabs button:focus {
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.5); /* Blue focus ring */
}

/* Report Content */
.report-content {
  flex: 1;
  overflow-y: auto; /* Scrollbar for overflowing content */
  padding-right: 10px; /* Space for scrollbar */
  background-color: black; /* Optional: Different background for report content */
  padding: 15px;
  border: 1px solid #ddd; /* Light border around report content */
  border-radius: 0 0 5px 5px; /* Rounded bottom corners */
}


.copy-button-container {
  /* Optional: Add padding or background if needed */
  padding-top: 0px;
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
