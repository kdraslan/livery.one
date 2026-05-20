<script setup lang="ts">
</script>

<template>
  <footer class="footer">
    <div class="disclaimer">
      <svg class="icon" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
        <path
          fill-rule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
          clip-rule="evenodd"
        />
      </svg>
      <span>
        This tool is still under active development. Predictions should be used in conjunction
        with professional medical judgment and clinical expertise.
      </span>
    </div>
    <div class="credits">
      <span>&copy; {{ new Date().getFullYear() }} Livery.one</span>
      <span class="separator">&middot;</span>
      <span>Built by Kadir Aslan</span>
      <span class="separator">&middot;</span>
      <span>Supervised by Prof. Dr. R. Sarper Ökten</span>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  padding: 0 0 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.disclaimer {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 204, 0, 0.06);
  border: 1px solid rgba(255, 204, 0, 0.15);
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  color: rgba(255, 204, 0, 0.8);
  line-height: 1.5;
}

.disclaimer .icon {
  flex-shrink: 0;
  margin-top: 1px;
  opacity: 0.7;
}

.credits {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.separator {
  opacity: 0.5;
}
</style>
