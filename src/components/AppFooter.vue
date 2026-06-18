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
      <span class="separator separator-supervised">&middot;</span>
      <span class="supervised">Supervised by Prof. Dr. R. Sarper Ökten</span>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.footer {
  background: var(--color-chrome);
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 20px;
  width: 100%;
}

.disclaimer {
  align-items: flex-start;
  background: var(--color-warning-soft);
  border-radius: var(--radius-md);
  color: var(--color-warning);
  display: flex;
  font-size: 0.8rem;
  gap: 8px;
  line-height: 1.5;
  margin: 0 auto;
  padding: 12px;
  width: auto;

  .icon {
    flex-shrink: 0;
    margin-top: 1px;
    opacity: 0.7;
  }
}

.credits {
  align-items: center;
  color: var(--color-text-muted);
  display: flex;
  flex-wrap: nowrap; // Stay one line until the breakpoint switches to stacked.
  font-size: 0.8rem;
  gap: 8px;
  justify-content: center;
  margin: 0 auto;
  max-width: 720px;
  padding: 0 20px;
  width: 100%;

  @media (max-width: 600px) {
    flex-wrap: wrap;
  }
}

.separator {
  opacity: 0.5;
}

@media (max-width: 600px) {
  .separator-supervised {
    display: none;
  }

  .supervised {
    border-top: 1px solid var(--color-border);
    flex-basis: 100%;
    padding-top: 8px;
    text-align: center;
  }
}
</style>
