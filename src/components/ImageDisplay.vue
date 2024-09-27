<template>
  <div class="image-display"
    @keydown="handleKeyPress"
    tabindex="0"
  >
    <div class="image-display">
      <!-- Image Content -->
      <div
        class="image-content"
        @click="handleImageClick"
        @mousedown.prevent="startDrag"
        @mousemove="onDrag"
        @mouseup="endDrag"
        @wheel.prevent="handleWheel"
        tabindex="0"
        @keydown.enter="handleImageClick"
        aria-label="Bone Age Image Container"
      >
        <img
          :src="currentImage.src"
          alt="Bone Age Image"
          loading="lazy"
          aria-label="Bone Age Image"
        />
        <div class="image-text">{{ currentImage.text }}</div>
      </div>

      <!-- Interpretation Notes -->
      <div class="interpretation-notes">
        <h3>Interpretation Notes</h3>
        <div
          v-if="currentImage.interpretationNotes"
          v-html="renderedNotes"
        ></div>
        <div v-else>No interpretation notes available.</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { marked } from 'marked' // marked is a lightweight markdown rendering engine
import DOMPurify from 'dompurify'; // To sanitize rendered HTML
import { images } from '@/data/images.js'; // static image data
import debounce from 'lodash/debounce'; // Import debounce from lodash

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
    const debounceDelay = 25; // msec

    // Computed Property: Age-specific Interpretation notes based on selected image
    const renderedNotes = computed(() => {
      const rawMarkdown = currentImage.value.interpretationNotes || '';
      const rawHTML = marked(rawMarkdown);
      return DOMPurify.sanitize(rawHTML); // Sanitize the HTML output
    });

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

    /**
     * Binary Search Function to Find the Closest boneAge
     * Assumes that filteredImages is sorted in ascending order by boneAge
     * @param {Array} arr - Array of image objects
     * @param {number} target - Patient's age in months
     * @returns {number} - Index of the closest image
     */
    const binarySearchClosest = (arr, target) => {
      console.log('searching for bone age:', target)
      let left = 0;
      let right = arr.length - 1;

      if (arr.length === 0) return -1;
      if (target < arr[0].boneAge) return 0;
      if (target > arr[right].boneAge) return right;

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid].boneAge === target) {
          return mid;
        } else if (arr[mid].boneAge < target) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }

      // After loop, left is the insertion point
      // Compare arr[left] and arr[left -1] to find closest
      if (left >= arr.length) return arr.length - 1;
      if (left === 0) return 0;
      const prev = arr[left - 1];
      const next = arr[left];
      return Math.abs(prev.boneAge - target) <= Math.abs(next.boneAge - target)
        ? left - 1
        : left;
    };

    // Method: Set Image Index and Emit Bone Age
    const setImageIndex = (newImageIndex) => {
      if (newImageIndex < 0 || newImageIndex >= filteredImages.value.length) return;
      currentIndex.value = newImageIndex;
      const boneAge = filteredImages.value[currentIndex.value].boneAge;
      console.log('Setting new bone age to:', boneAge);
      emit('update-bone-age', boneAge);
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

      const handleKeyPress = (event) => {
      const activeElement = document.activeElement;
      const activeTag = activeElement.tagName.toLowerCase();

      // If an input field, textarea, or contenteditable element is focused, do not navigate images
      if (
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        activeTag === 'select' ||
        activeElement.isContentEditable
      ) {
        return; // Exit the function without handling the key press
      }

      // Handle left and right arrow keys
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        nextImage();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        previousImage();
      }
    };


    /**
     * Update to the Closest Image Based on Age in Months using Binary Search
     */
    const updateClosestImage = () => {
      if (!props.ageInMonths || filteredImages.value.length === 0) return;

      const closestIndex = binarySearchClosest(filteredImages.value, props.ageInMonths);
      console.log('Closest index found:', closestIndex);
      setImageIndex(closestIndex);
    };

    // Debounce the scroll handler to prevent rapid navigation
    const debouncedHandleWheel = debounce((event) => {
      const { deltaY } = event;
      if (deltaY > 0) {
        // Scrolling down
        nextImage();
      } else if (deltaY < 0) {
        // Scrolling up
        previousImage();
      }
    }, debounceDelay); // Adjust the delay (ms) as needed

    // Method: Handle Wheel Event for Navigation
    const handleWheel = (event) => {
      debouncedHandleWheel(event);
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
      handleWheel, // Expose handleWheel to template
      renderedNotes,
    };
  },
};
</script>

<style scoped>
.image-display {
  display: flex;
  flex-wrap: nowrap;
  gap: 20px;
}

.image-content {
  flex: 1 1 50%;
  max-width: 100%;
  min-width: 240px; /* Minimum image width (60% of original image width) */
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.image-content img {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.image-display:focus {
  outline: 2px solid #007BFF; /* Or any other focus indicator */
}

.image-text {
  margin-top: 10px;
  font-size: 1.1rem;
}

.interpretation-notes {
  flex: 1 1 50%;
  padding: 20px;
  background-color: #333;
  color: white;
  border-radius: 8px;
  overflow-y: auto;
}

/* Ensure image and notes stay side by side above breakpoint */
@media (max-width: var(--breakpoint-width)) {
  .image-display {
    flex-direction: row;
  }
}
</style>
