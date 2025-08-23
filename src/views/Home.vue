<template>
  <div class="w-full h-full flex justify-center items-center">
    <div class="w-[500px] mx-auto p-8 bg-white rounded-xl shadow text-center">
      <h1 class="text-2xl font-bold mb-6">展示功能選單</h1>
      <ul class="space-y-4">
        <li>
          <router-link to="/skill-tree-demo">
            <button
              class="px-6 py-2 text-lg rounded bg-yellow-500 text-white hover:bg-yellow-700 transition">技能選擇器</button>
          </router-link>
        </li>
        <li>
          <router-link to="/dropdown">
            <button
              class="px-6 py-2 text-lg rounded bg-yellow-500 text-white hover:bg-yellow-700 transition">下拉選單</button>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>
