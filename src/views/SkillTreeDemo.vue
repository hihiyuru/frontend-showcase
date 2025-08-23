<script setup lang="ts">
import SkillTreeSelector from '@/components/SkillTreeSelector.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-center mb-8">
          技能樹選擇器展示
        </h1>

        <!-- 使用技能選擇器組件 -->
        <SkillTreeSelector />
      </div>
    </div>
  </div>
</template>
