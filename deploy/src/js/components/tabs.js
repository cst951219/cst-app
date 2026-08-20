// Tabs 标签页组件
export function createTabs({ tabs = [], defaultIndex = 0, onChange = null } = {}) {
    const container = document.createElement('div');
    container.className = 'tabs-container';

    const tabBar = document.createElement('div');
    tabBar.className = 'tabs';

    const contentArea = document.createElement('div');
    contentArea.className = 'tab-content';

    let activeIndex = defaultIndex;

    function render() {
        tabBar.innerHTML = '';
        tabs.forEach((tab, index) => {
            const tabEl = document.createElement('div');
            tabEl.className = `tab ${index === activeIndex ? 'active' : ''}`;
            tabEl.textContent = tab.label;
            tabEl.addEventListener('click', () => {
                activeIndex = index;
                render();
                if (onChange) onChange(index, tab);
            });
            tabBar.appendChild(tabEl);
        });

        contentArea.innerHTML = '';
        if (tabs[activeIndex] && tabs[activeIndex].content) {
            if (typeof tabs[activeIndex].content === 'string') {
                contentArea.innerHTML = tabs[activeIndex].content;
            } else if (tabs[activeIndex].content instanceof HTMLElement) {
                contentArea.appendChild(tabs[activeIndex].content);
            }
        }
    }

    container.appendChild(tabBar);
    container.appendChild(contentArea);
    render();

    return {
        element: container,
        contentArea,
        setActive: (index) => { activeIndex = index; render(); },
        getActive: () => activeIndex,
        updateTabs: (newTabs) => { tabs = newTabs; render(); },
    };
}
