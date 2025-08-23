<script setup lang="ts">
import { computed, ref } from 'vue'

// 技能資料介面
interface Skill {
    id: number
    name: string
    level: number
    points: number
    parentId: number | null
    isCustom?: boolean
}

interface SkillLevel {
    id: number
    name: string
    required: boolean
    allowCustom: boolean
}

// 響應式資料
const selectedSkills = ref<Skill[]>([])
const currentSelectLevel = ref<number>(0)
const emptySkillString = '[無此技能]'


const allSkills = ref<Skill[]>([
    // Level 1: 基礎技能
    { id: 1, name: 'HTML基礎', level: 1, points: 1, parentId: null },
    { id: 2, name: 'CSS基礎', level: 1, points: 1, parentId: null },
    { id: 3, name: 'API 基礎', level: 1, points: 1, parentId: null },

    // Level 2: 進階技能
    { id: 4, name: 'JavaScript', level: 2, points: 2, parentId: 1 },
    { id: 5, name: 'TypeScript', level: 2, points: 2, parentId: 1 },
    { id: 6, name: 'ES6+語法', level: 2, points: 2, parentId: 1 },
    { id: 7, name: '', level: 2, points: 2, parentId: 2 },
    { id: 8, name: 'CSS預處理器', level: 2, points: 2, parentId: 2 },

    // Level 3: 框架技能
    { id: 9, name: 'Vue.js', level: 3, points: 3, parentId: 4 },
    { id: 10, name: 'React', level: 3, points: 3, parentId: 4 },
    { id: 11, name: 'Angular', level: 3, points: 3, parentId: 4 },
    { id: 12, name: 'Bootstrap', level: 3, points: 3, parentId: 7 },
    { id: 13, name: 'Tailwind CSS', level: 3, points: 3, parentId: 7 },
    { id: 14, name: 'Webpack', level: 3, points: 3, parentId: 6 },
    { id: 15, name: 'Vite', level: 3, points: 3, parentId: 6 },
    { id: 16, name: 'API Framework', level: 3, points: 3, parentId: 3 },
])

const skillLevels: SkillLevel[] = [
    { id: 1, name: '基礎技能', required: true, allowCustom: false },
    { id: 2, name: '進階技能', required: true, allowCustom: true },
    { id: 3, name: '框架技能', required: false, allowCustom: true },
    { id: 4, name: '專家技能', required: false, allowCustom: true },
]

// 自定義技能對話框
const showCustomDialog = ref(false)
const showResultDialog = ref(false)
const resultDialogSkills = ref<{ level: number; name: string }[]>([])
const customSkillName = ref('')
const customSkillDescription = ref('')
const currentCustomLevel = ref(0)
const nextSkillId = ref((allSkills.value.length + 1) * -1) // 自定義技能 id 從 -1 開始，遞減

// 最後層級的自定義輸入
const lastLevelInput = ref('')

const visibleSkillLevels = computed(() => {
    return skillLevels // 所有層級都顯示，不過濾
})

// 核心邏輯函數
function getAvailableSkills(levelId: number): Skill[] {
    const parentSkillId = getParentSkillId(levelId)

    if (parentSkillId === null && levelId !== 1)
        return []

    const currentLevelSkills = allSkills.value.filter(
        skill => skill.level === levelId && skill.parentId === parentSkillId
    )

    if (hasNonEmptyValue(currentLevelSkills) && levelId > currentSelectLevel.value && levelId >= 3) {
        // 若當前查看層級高於已選擇層級，且為可選層級（框架），
        // 在現有技能陣列的最前面添加一個 [無此技能] 選項，讓用戶可以選擇跳過此可選層級
        return prependEmptySkill(currentLevelSkills, levelId)
    }
    else {
        // 後端有回傳技能資料但 name 欄位為空值，需將空值取代為[無此技能]字串顯示
        return replaceEmptyValues(currentLevelSkills)
    }
}

function getParentSkillId(level: number): number | null {
    return level === 1 ? null : getSelectedSkillAtLevel(level - 1)
}

function hasNonEmptyValue(skills: Skill[]): boolean {
    return skills.length > 0 && skills[0] && skills[0].name !== ''
}

// 在技能陣列前面添加空選項
// 用於高層級技能，當後端只返回實際技能而沒有「跳過」選項時使用
function prependEmptySkill(skills: Skill[], level: number): Skill[] {
    // 創建空技能
    const emptySkill = createEmptySkill(level)
    // 將空技能放在陣列最前面，後面跟著所有原始技能
    return [emptySkill, ...skills]
}

function replaceEmptyValues(skills: Skill[]): Skill[] {
    return skills.map(skill => ({
        ...skill,
        name: skill.name === '' ? emptySkillString : skill.name,
    }))
}

function createEmptySkill(level: number, parentSkillId: number | null = null): Skill {

    return {
        id: level * -1, // 因為每個level只會有一個無技能所以可以這樣用
        name: emptySkillString,
        level,
        points: 0,
        parentId: parentSkillId || getParentSkillId(level),
        isCustom: false,
    }
}

function getSelectedSkillAtLevel(level: number): number | null {
    const skillAtLevel = selectedSkills.value.find(skill => skill.level === level)
    return skillAtLevel ? skillAtLevel.id : null
}

function isLevelEnabled(levelId: number): boolean {
    // 第一層永遠啟用
    if (levelId === 1)
        return true

    // 其他層級：檢查上一層是否有選擇
    const parentSkillId = getSelectedSkillAtLevel(levelId - 1)
    return parentSkillId !== null
}

function isSkillSelected(skillId: number): boolean {
    return selectedSkills.value.some(skill => skill.id === skillId)
}

function selectSkill(skill: Skill) {
    const isSelected = isSkillSelected(skill.id)
    if (isSelected) {
        // 取消選擇：移除該技能（用 Skill 物件）
        selectedSkills.value = selectedSkills.value.filter(s => s.id !== skill.id)
        resetLowerLevels(skill.level)
    } else {
        // 單選：先移除同層級其他選擇，再 push Skill 物件
        removeSkillsAtLevel(skill.level)
        selectedSkills.value.push(skill)
        resetLowerLevels(skill.level)
    }
}

function removeSkillsAtLevel(level: number) {
    // 移除指定層級的所有選擇
    selectedSkills.value = selectedSkills.value.filter(skill => skill.level !== level)
}

function resetLowerLevels(currentLevel: number) {
    // 重置所有比當前層級更高的技能選擇
    selectedSkills.value = selectedSkills.value.filter(skill => skill.level <= currentLevel)
    lastLevelInput.value = ''
}

// 自定義技能功能
function openCustomSkillDialog(levelId: number) {
    if (!isLevelEnabled(levelId))
        return

    currentCustomLevel.value = levelId
    currentSelectLevel.value = levelId
    showCustomDialog.value = true
}

function closeCustomDialog() {
    showCustomDialog.value = false
    customSkillName.value = ''
    customSkillDescription.value = ''
}

function checkNextSkillLevelParentId(parentsNewId: number, parentOldId: number | null) {
    if (!parentOldId)
        return

    // 檢查下一層級的父技能ID
    const nextLevel = currentCustomLevel.value + 1
    const nextLevelSkill = allSkills.value.find(skill => skill.level === nextLevel && skill.parentId === parentOldId)
    if (!nextLevelSkill)
        return

    if (nextLevelSkill) {
        // 更新下一層級技能的 parentId 為新技能ID
        nextLevelSkill.parentId = parentsNewId
    }
}

function addCustomSkill() {
    if (!customSkillName.value.trim())
        return

    const parentSkillId = getSelectedSkillAtLevel(currentCustomLevel.value - 1)
    const newSkill: Skill = {
        id: nextSkillId.value--,
        name: customSkillName.value.trim(),
        level: currentCustomLevel.value,
        points: currentCustomLevel.value,
        parentId: parentSkillId,
        isCustom: true,
    }
    checkNextSkillLevelParentId(newSkill.id, parentSkillId)
    allSkills.value.push(newSkill)
    removeSkillsAtLevel(newSkill.level)
    selectedSkills.value.push(newSkill)
    closeCustomDialog()
}

// 處理最後層級的自定義輸入
function handleLastLevelInput() {
    if (!lastLevelInput.value.trim()) {
        // 如果輸入為空，移除第4層的選擇
        removeSkillsAtLevel(4)
        return
    }

    // 獲取第3層選擇的技能作為父節點
    const parentSkillId = getSelectedSkillAtLevel(3)
    if (!parentSkillId)
        return

    // 先移除第4層現有選擇
    removeSkillsAtLevel(4)

    // 創建自定義技能
    const customSkill: Skill = {
        id: nextSkillId.value--,
        name: lastLevelInput.value.trim(),
        level: 4,
        points: 4,
        parentId: parentSkillId,
        isCustom: true,
    }
    allSkills.value.push(customSkill)
    selectedSkills.value.push(customSkill)
}

// 送出技能選擇的結果
function submitSkillSelection() {
    // 只取 level 和 name
    resultDialogSkills.value = selectedSkills.value.map(skill => ({
        level: skill.level,
        name: skill.name,
    }))
    showResultDialog.value = true
}

// 重置選擇
function resetSelection() {
    selectedSkills.value = []
    lastLevelInput.value = ''
    allSkills.value = allSkills.value.filter(skill => !skill.isCustom)
    showResultDialog.value = false
    resultDialogSkills.value = []
    currentSelectLevel.value = 0
    customSkillName.value = ''
    customSkillDescription.value = ''
    showCustomDialog.value = false
}
</script>

<template>
    <div class="skill-tree-selector p-6 bg-gray-50 rounded-lg">
        <h2 class="text-2xl font-bold mb-6">
            技能樹選擇器
        </h2>

        <!-- 技能等級選擇 -->
        <div v-for="level in visibleSkillLevels" :key="level.id" class="skill-level mb-6">
            <h3 class="text-lg font-semibold mb-3 flex items-center">
                {{ level.name }}
                <span v-if="level.required" class="text-red-500 ml-1">*</span>
                <span v-if="level.id !== 4" class="text-sm text-gray-500 ml-2">(單選)</span>
            </h3>

            <!-- 技能選項 -->
            <div v-if="level.id === 4" class="space-y-3">
                <!-- 最後層級：自定義輸入欄位 -->

                <input v-model="lastLevelInput" type="text" placeholder="請輸入您的專家技能..."
                    class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:border-gray-200 disabled:placeholder:text-gray-400"
                    :disabled="!isLevelEnabled(level.id)" @input="handleLastLevelInput">

            </div>
            <div v-else class="grid grid-cols-2 gap-3">
                <button v-for="skill in getAvailableSkills(level.id)" :key="skill.id"
                    :disabled="!isLevelEnabled(level.id)" class="p-4 rounded-lg border text-left transition-all" :class="[
                        isSkillSelected(skill.id)
                            ? 'bg-blue-500 text-white border-blue-600'
                            : !isLevelEnabled(level.id)
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-white hover:bg-blue-50 border-gray-300',
                    ]" @click="selectSkill(skill)">
                    <div class="font-medium">
                        {{ skill.name }}
                    </div>
                </button>

                <!-- 自定義技能按鈕 -->
                <button v-if="level.allowCustom" :disabled="!isLevelEnabled(level.id)"
                    class="p-4 rounded-lg border-2 border-dashed text-center transition-all" :class="[
                        !isLevelEnabled(level.id)
                            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'border-blue-300 hover:border-blue-500 text-blue-600',
                    ]" @click="openCustomSkillDialog(level.id)">
                    <i class="pi pi-plus text-xl mb-2" />
                    <div>新增自定義技能</div>
                </button>
            </div>
        </div>

        <!-- 自定義技能對話框 -->
        <div v-if="showCustomDialog" class="fixed inset-0 bg-[#1f1d1d45] flex items-center justify-center z-50"
            @click="closeCustomDialog">
            <div class="bg-white p-6 rounded-lg w-96" @click.stop>
                <h3 class="text-lg font-semibold mb-4">
                    新增自定義技能
                    <div class="text-sm font-normal text-gray-500 mt-1">
                        將自動繼承上層已選技能為依賴
                    </div>
                </h3>

                <input v-model="customSkillName" type="text" placeholder="技能名稱" class="w-full p-2 border rounded mb-3">

                <div class="flex justify-end gap-2">
                    <button class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded" @click="closeCustomDialog">
                        取消
                    </button>
                    <button :disabled="!customSkillName.trim()"
                        class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50" @click="addCustomSkill">
                        確認
                    </button>
                </div>
            </div>
        </div>

        <!-- 送出技能選擇與清理按鈕 -->
        <div class="mt-8 flex justify-end gap-4">
            <button class="px-6 py-3 bg-green-600 text-white rounded shadow hover:bg-green-700 transition-all font-bold"
                @click="submitSkillSelection">
                送出技能選擇
            </button>
            <button class="px-6 py-3 bg-gray-400 text-white rounded shadow hover:bg-gray-500 transition-all font-bold"
                @click="resetSelection">
                清理
            </button>
        </div>
        </div>

        <!-- 技能選擇結果彈窗 -->
        <div v-if="showResultDialog" class="fixed inset-0 bg-[#1f1d1d45] flex items-center justify-center z-50" @click="showResultDialog = false">
            <div class="bg-white p-6 rounded-lg w-96" @click.stop>
                <h3 class="text-lg font-semibold mb-4">技能選擇結果</h3>
                <ul class="mb-4">
                    <li v-for="(skill, idx) in resultDialogSkills" :key="idx" class="mb-2">
                        <span class="font-bold">Level {{ skill.level }}：</span>
                        <span>{{ skill.name }}</span>
                    </li>
                </ul>
                <div class="flex justify-end">
                    <button class="px-4 py-2 bg-blue-500 text-white rounded" @click="showResultDialog = false">關閉</button>
                </div>
            </div>
        </div>
</template>

<style scoped>
.skill-tree-selector {
    max-width: 800px;
    margin: 0 auto;
}

.skill-level {
    border-left: 3px solid #e5e7eb;
    padding-left: 1rem;
}

.skill-level:first-child {
    border-left-color: #3b82f6;
}
</style>
