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
        <img :src="currentImage.src" alt="Bone Age Image" loading="lazy" />
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
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { images } from '@/data/images.js'; // Correct Named Import

export default {
  name: 'ImageDisplay',
  props: {
    selectedGender: {
      type: String,
      required: true,
    },
    ageInMonths: {
      type: Number,
      required: true,
    },
  },
  emits: ['update-bone-age'],
  setup(props, { emit }) {
    // Reactive State
    const currentIndex = ref(0);
    const isDragging = ref(false);
    const startX = ref(0);

    // Computed Property: Filtered Images Based on Selected Gender
    const filteredImages = computed(() => {
      const filtered = images.filter(
        (image) => image.gender.toLowerCase() === props.selectedGender.toLowerCase()
      );
      console.log('Filtered Images:', filtered);
      return filtered;
    });

    // Computed Property: Current Image
    const currentImage = computed(() => {
      return filteredImages.value[currentIndex.value] || {};
    });

    // Computed Properties: Navigation Flags
    const isFirstImage = computed(() => currentIndex.value === 0);
    const isLastImage = computed(() => currentIndex.value === filteredImages.value.length - 1);

    // Method: Set Image Index and Emit Bone Age
    const setImageIndex = (newImageIndex) => {
      if (newImageIndex < 0 || newImageIndex >= filteredImages.value.length) return;
      currentIndex.value = newImageIndex;
      const boneAge = filteredImages.value[currentIndex.value].boneAge; // Correct Property
      console.log('Setting new bone age to:', boneAge);
      emit('update-bone-age', boneAge); // Emit Correct Event
      console.log('Emitting update-bone-age with:', boneAge);
    };

    // Method: Navigate to Next Image
    const nextImage = () => {
      if (!isLastImage.value) {
        setImageIndex(currentIndex.value + 1);
      }
    };

    // Method: Navigate to Previous Image
    const previousImage = () => {
      if (!isFirstImage.value) {
        setImageIndex(currentIndex.value - 1);
      }
    };

    // Method: Handle Image Click for Navigation
    const handleImageClick = (event) => {
      const imageContent = event.currentTarget;
      const imageWidth = imageContent.clientWidth;
      const clickX = event.offsetX;

      if (clickX > (3 * imageWidth) / 5) {
        nextImage(); // Clicked on the right-most third
      } else if (clickX < (2 * imageWidth) / 5) {
        previousImage(); // Clicked on the left-most third
      }
      // Clicked on the middle third: No action
    };

    // Methods: Handle Dragging for Navigation
    const startDrag = (event) => {
      isDragging.value = true;
      startX.value = event.clientX;
    };

    const onDrag = (event) => {
      if (!isDragging.value) return;
      const dragDistance = event.clientX - startX.value;

      if (dragDistance > 50) {
        previousImage();
        isDragging.value = false;
      } else if (dragDistance < -50) {
        nextImage();
        isDragging.value = false;
      }
    };

    const endDrag = () => {
      isDragging.value = false;
    };

    // Method: Handle Keyboard Navigation
    const handleKeyPress = (event) => {
      if (event.key === 'ArrowRight') {
        nextImage();
      } else if (event.key === 'ArrowLeft') {
        previousImage();
      }
    };

    // Method: Update to the Closest Image Based on Age in Months
    const updateClosestImage = () => {
      if (!props.ageInMonths || filteredImages.value.length === 0) return;

      let closestIndex = 0;
      let minDiff = Math.abs(filteredImages.value[0].boneAge - props.ageInMonths);

      filteredImages.value.forEach((image, index) => {
        const diff = Math.abs(image.boneAge - props.ageInMonths);
        if (diff < minDiff) {
          closestIndex = index;
          minDiff = diff;
          console.log('Finding closest bone age:', image.boneAge);
        }
      });

      setImageIndex(closestIndex);
    };

    // Watchers: Update Closest Image When Age or Gender Changes
    watch(
      () => props.ageInMonths,
      (newAge) => {
        console.log('ageInMonths changed to:', newAge);
        updateClosestImage();
      }
    );

    watch(
      () => props.selectedGender,
      (newGender) => {
        console.log('selectedGender changed to:', newGender);
        updateClosestImage();
      }
    );

    // Lifecycle Hooks: Add and Remove Keyboard Event Listeners
    onMounted(() => {
      window.addEventListener('keydown', handleKeyPress);
      // Initialize to the closest image on mount
      updateClosestImage();
    });

    onBeforeUnmount(() => {
      window.removeEventListener('keydown', handleKeyPress);
    });

    // Return Variables and Methods to Template
    return {
      currentImage,
      filteredImages,
      isFirstImage,
      isLastImage,
      handleImageClick,
      startDrag,
      onDrag,
      endDrag,
    };
  },
};
</script>

<style scoped>
.image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #1e1e1e;
  color: white;
  padding: 20px;
  border-radius: 8px;
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
  cursor: pointer; /* Indicates the image is clickable */
  position: relative;
}

.image-content img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.image-text {
  margin-top: 10px;
  font-size: 1.1rem;
}

.interpretation-notes {
  width: 30%;
  padding: 20px;
  background-color: #333;
  color: white;
  margin-left: 20px;
  border-radius: 8px;
}

.interpretation-notes h3 {
  margin-bottom: 10px;
}

.interpretation-notes ul {
  list-style-type: disc;
  padding-left: 20px;
}
</style>
