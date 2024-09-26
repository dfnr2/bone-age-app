<template>
  <div class="image-container">
    <!-- Image and Interpretation Panel -->
    <div class="image-and-notes">
      <!-- Image Display with click handling -->
      <div
        class="image-content"
        @click="handleImageClick"
        @mousedown.prevent="startDrag"
        @mousemove="onDrag"
        @mouseup="endDrag"
      >
        <img :src="currentImage.src" alt="Bone Age Image" />
        <div class="image-text">{{ currentImage.text }}</div>
      </div>

      <!-- Interpretation Notes Panel -->
      <div class="interpretation-notes">
        <h3>Interpretation Notes</h3>
        <div v-if="currentImage.interpretationNotes" v-html="currentImage.interpretationNotes"></div>
        <div v-else>No interpretation notes available.</div>
      </div>
    </div>
  </div>
</template>

<script>
import { images } from '@/data/images.js';

export default {
  props: ['selectedGender', 'ageInMonths'],  // Gender and age props
  data() {
    return {
      images,
      currentIndex: 0,  // Tracks current image index
      isDragging: false,
      startX: 0,
    };
  },
  computed: {
    filteredImages() {
      return this.images.filter(image => image.gender === this.selectedGender.toLowerCase());
    },
    currentImage() {
      return this.filteredImages[this.currentIndex] || {};
    },
    isFirstImage() {
      return this.currentIndex === 0;
    },
    isLastImage() {
      return this.currentIndex === this.filteredImages.length - 1;
    }
  },
  methods: {
    nextImage() {
      if (!this.isLastImage) {
        this.currentIndex++;
      }
    },
    previousImage() {
      if (!this.isFirstImage) {
        this.currentIndex--;
      }
    },
    // Handle image click to navigate
    handleImageClick(event) {
      const imageWidth = event.target.offsetWidth; // Get image width
      const clickX = event.offsetX; // Get x-coordinate of the click relative to the image

      // Check if clicked on the right-most third, left-most third, or center
      if (clickX > (3 * imageWidth) / 5) {
        this.nextImage(); // Right-most 1/3: move forward
      } else if (clickX < (2 * imageWidth) / 5) {
        this.previousImage(); // Left-most 1/3: move backward
      }
    },
    startDrag(event) {
      this.isDragging = true;
      this.startX = event.clientX;
    },
    onDrag(event) {
      if (!this.isDragging) return;
      const dragDistance = event.clientX - this.startX;
      if (dragDistance > 50) {
        this.previousImage();
        this.isDragging = false;
      } else if (dragDistance < -50) {
        this.nextImage();
        this.isDragging = false;
      }
    },
    endDrag() {
      this.isDragging = false;
    },
    handleKeyPress(event) {
      if (event.key === "ArrowRight") {
        this.nextImage();
      } else if (event.key === "ArrowLeft") {
        this.previousImage();
      }
    },
    updateClosestImage() {
      if (!this.ageInMonths || this.filteredImages.length === 0) return;

      let closestIndex = 0;
      let minDiff = Math.abs(this.filteredImages[0].ageInMonths - this.ageInMonths);

      this.filteredImages.forEach((image, index) => {
        const diff = Math.abs(image.ageInMonths - this.ageInMonths);
        if (diff < minDiff) {
          closestIndex = index;
          minDiff = diff;
        }
      });

      this.currentIndex = closestIndex;
    }
  },
  watch: {
    ageInMonths() {
      this.updateClosestImage();
    },
    selectedGender() {
      this.updateClosestImage();
    }
  },
  mounted() {
    window.addEventListener("keydown", this.handleKeyPress);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeyPress);
  }
};
</script>

<style scoped>
.image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #1e1e1e;
  color: white;
}

.image-and-notes {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.image-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer; /* Add cursor pointer to indicate the image is clickable */
}

.interpretation-notes {
  width: 30%;
  padding: 20px;
  background-color: #333;
  color: white;
  margin-left: 20px;
}
</style>
