<template>
  <div class="image-container">
    <!-- Image Display -->
    <div class="image-content" @mousedown.prevent="startDrag" @mousemove="onDrag" @mouseup="endDrag">
      <img :src="currentImage.src" alt="Bone Age Image" />
      <div class="image-text">{{ currentImage.text }}</div>
    </div>

    <!-- Navigation Arrows -->
    <div class="image-nav">
      <button @click="previousImage" :disabled="isFirstImage">⬅️</button>
      <button @click="nextImage" :disabled="isLastImage">➡️</button>
    </div>

    <div class="report-window">
      <p>{{ report }}</p>
    </div>
  </div>
</template>

<script>
// import the images list
import { images } from '@/data/images.js';
export default {
  props: ['report', 'selectedGender'],
  data() {
    return {
      images,
      currentIndex: 0,
      isDragging: false,
      startX: 0,

    };
  },
  computed: {
    // Filter the images based on selected gender
    filteredImages() {
      const filtered = this.images.filter(image => image.gender === this.selectedGender.toLowerCase());
      console.log('Filtered Images:', filtered);
      return filtered;
    },
    currentImage() {
      const image = this.filteredImages[this.currentIndex] || {};
      console.log('Current Image:', image);
      return image;
    },
    // Check if it's the first image in the filtered list
    isFirstImage() {
      return this.currentIndex === 0;
    },
    // Check if it's the last image in the filtered list
    isLastImage() {
      return this.currentIndex === this.filteredImages.length - 1;
    },
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
    // Handle dragging to switch images
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
    // Handle keyboard navigation
    handleKeyPress(event) {
      if (event.key === "ArrowRight") {
        this.nextImage();
      } else if (event.key === "ArrowLeft") {
        this.previousImage();
      }
    },
  },
  mounted() {
    console.log(this.images);  // This should print the array of images from the imported file
    window.addEventListener("keydown", this.handleKeyPress);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeyPress);
  },
};
</script>

<style scoped>
.image-container {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  background-color: #1e1e1e;
  color: white;
}

.image-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-nav {
  display: flex;
  justify-content: space-between;
  width: 200px;
  margin-top: 20px;
}

.image-nav button {
  background-color: #333;
  color: white;
  font-size: 2rem;
  padding: 10px;
  border: none;
  cursor: pointer;
}

.image-nav button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.report-window {
  margin-top: 20px;
  background-color: #333;
  padding: 10px;
  width: 100%;
  text-align: center;
  border-radius: 5px;
}
</style>
