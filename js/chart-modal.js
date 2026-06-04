/* Chart expand modal: click a chart to view larger, ESC/click-outside/close to exit */
(() => {
  const CLICK_TARGETS = ['.chart-card', '.chart-box', '.responsive-svg-container'];
  const IGNORE = 'a, button, select, option, input, textarea, label';

  const state = {
    isOpen: false,
    activeSvg: null,
    placeholder: null,
    originalParent: null,
    originalNextSibling: null,
    lastActiveElement: null
  };

  function ensureModal() {
    let modal = document.getElementById('chart-modal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'chart-modal';
    modal.className = 'chart-modal';
    modal.hidden = true;
    // Force hidden state even if CSS is cached/misapplied
    modal.style.display = 'none';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'chart-modal-title');

    modal.innerHTML = `
      <div class="chart-modal__dialog" role="document">
        <div class="chart-modal__header">
          <div class="chart-modal__title" id="chart-modal-title">Expanded chart</div>
          <button type="button" class="btn chart-modal__close" aria-label="Close expanded chart">Close</button>
        </div>
        <div class="chart-modal__body"></div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close when clicking backdrop (not the dialog)
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    modal.querySelector('.chart-modal__close')?.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.isOpen) closeModal();
    });

    return modal;
  }

  function openModal(svg, contextEl) {
    if (!svg) return;

    const modal = ensureModal();
    const body = modal.querySelector('.chart-modal__body');
    const title = modal.querySelector('#chart-modal-title');

    state.lastActiveElement = document.activeElement;
    state.originalParent = svg.parentNode;
    state.originalNextSibling = svg.nextSibling;

    state.placeholder = document.createElement('span');
    state.placeholder.className = 'chart-modal__placeholder';
    state.placeholder.style.display = 'none';
    state.originalParent.insertBefore(state.placeholder, svg);

    state.activeSvg = svg;

    // Clear modal body and move the SAME svg node into it (keeps event listeners)
    while (body.firstChild) body.removeChild(body.firstChild);
    body.appendChild(svg);

    const h3 = contextEl?.querySelector('h3');
    title.textContent = h3 ? `Expanded: ${h3.textContent.trim()}` : 'Expanded chart';

    document.body.classList.add('modal-open');
    modal.hidden = false;
    modal.style.display = 'flex';
    state.isOpen = true;

    // Focus close button for accessibility
    const closeBtn = modal.querySelector('.chart-modal__close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!state.isOpen) return;

    const modal = ensureModal();
    const body = modal.querySelector('.chart-modal__body');

    // Move SVG back to where the placeholder sits (robust even if siblings change)
    try {
      const svg = state.activeSvg;
      const placeholder = state.placeholder;
      const restoreParent = (placeholder && placeholder.parentNode) ? placeholder.parentNode : state.originalParent;

      if (svg && restoreParent) {
        restoreParent.insertBefore(svg, placeholder || null);
      }

      if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
      }
    } catch (err) {
      // If restore fails, still close the modal to avoid trapping the user.
      // Chart may need a page refresh if its DOM was replaced while expanded.
      console.warn('Failed to restore chart from modal:', err);
    }

    // Cleanup modal body (should now be empty)
    while (body.firstChild) body.removeChild(body.firstChild);

    modal.hidden = true;
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');

    // Restore focus
    if (state.lastActiveElement && typeof state.lastActiveElement.focus === 'function') {
      state.lastActiveElement.focus();
    }

    state.isOpen = false;
    state.activeSvg = null;
    state.placeholder = null;
    state.originalParent = null;
    state.originalNextSibling = null;
    state.lastActiveElement = null;
  }

  function findSvg(el) {
    if (!el) return null;
    if (el.tagName && el.tagName.toLowerCase() === 'svg') return el;
    return el.querySelector('svg');
  }

  document.addEventListener('click', (e) => {
    if (state.isOpen) return;

    const ignore = e.target.closest(IGNORE);
    if (ignore) return;

    const selector = CLICK_TARGETS.join(',');
    const container = e.target.closest(selector);
    if (!container) return;

    const svg = findSvg(container);
    if (!svg) return;

    openModal(svg, container);
  });
})();
