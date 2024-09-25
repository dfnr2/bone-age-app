<template>
  <div class="clinical-panel">
    <!-- Gender Slider -->
    <div class="gender-slider">
      <div
        :class="['gender-option', selectedGender === 'M' ? 'active' : 'inactive']"
        @click="setGender('M')"
      >
        Male
      </div>
      <div
        :class="['gender-option', selectedGender === 'F' ? 'active' : 'inactive']"
        @click="setGender('F')"
      >
        Female
      </div>
    </div>

    <!-- Birth Date Selector -->
    <label for="birth-date">Birth Date:</label>
    <input type="date" v-model="birthDate" @change="updateReport" />

    <!-- Imaging Date Selector -->
    <label for="imaging-date">Imaging Date:</label>
    <input type="date" v-model="imagingDate" @change="updateReport" />

    <!-- Report Display (inside clinical panel now) -->
    <div class="report">
      Report Data: {{ reportData }}
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedGender: "M",
      birthDate: "",
      imagingDate: "",
    };
  },
  computed: {
    reportData() {
      return {
        gender: this.selectedGender,
        birthDate: this.birthDate,
        imagingDate: this.imagingDate,
      };
    },
  },
  methods: {
    setGender(gender) {
      this.selectedGender = gender;
      this.updateReport();
    },
    updateReport() {
      this.$emit('update-report', this.reportData);
    },
  },
};
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

.gender-slider {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #333;
  border-radius: 10px;
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
