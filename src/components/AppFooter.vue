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
        This tool is still under active development. Predictions should be used in conjunction with
        professional medical judgment and clinical expertise.
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
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  background: linear-gradient(180deg, rgb(10, 22, 40, 0.85) 0%, rgb(10, 22, 40, 0.95) 100%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  left: 0;
  padding: 12px 20px;
  right: 0;
  width: 100%;
}

.disclaimer {
  align-items: flex-start;
  background: rgb(255, 204, 0, 0.06);
  border-radius: var(--radius-md);
  color: rgb(255, 204, 0, 0.8);
  display: flex;
  font-size: 0.8rem;
  gap: 8px;
  line-height: 1.5;
  margin: 0 auto;
  padding: 12px;
  width: auto;
}

.disclaimer .icon {
  flex-shrink: 0;
  margin-top: 1px;
  opacity: 0.7;
}

.credits {
  align-items: center;
  color: var(--color-text-muted);
  display: flex;
  font-size: 0.8rem;
  gap: 8px;
  justify-content: center;
  margin: 0 auto;
  max-width: 720px;
  padding: 0 20px;
  width: 100%;
}

.separator {
  opacity: 0.5;
}
</style>
