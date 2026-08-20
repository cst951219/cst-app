// Checkbox 复选框组件
export function createCheckbox({ checked = false, label = '', onChange = null } = {}) {
    const wrapper = document.createElement('label');
    wrapper.style.cssText = 'display:inline-flex;align-items:center;gap:8px;cursor:pointer;user-select:none;';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = checked;
    checkbox.style.cssText = 'width:18px;height:18px;cursor:pointer;accent-color:var(--accent-sage);';
    const labelEl = document.createElement('span');
    labelEl.textContent = label;
    labelEl.style.cssText = 'font-size:0.9rem;color:var(--text-primary);';
    wrapper.appendChild(checkbox);
    if (label) wrapper.appendChild(labelEl);
    if (onChange) checkbox.addEventListener('change', () => onChange(checkbox.checked));
    return { element: wrapper, checkbox, setChecked: (v) => { checkbox.checked = v; } };
}
