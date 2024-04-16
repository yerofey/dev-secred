<template>
  <div
    v-if="isLoading"
    class="flex animate-pulse align-top text-center text-4xl text-bold text-gray-500 dark:text-gray-200"
  >
    ...
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  loading: {
    type: Boolean,
    required: false,
    default: true,
  },
});
const isLoading = computed(() => {
  return props.loading;
});
</script>
