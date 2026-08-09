document.addEventListener('DOMContentLoaded', () => {
    let elements = [];
    let selectedId = null;
    const SCALE = 40; // пікселів на одну одиницю координат

    // DOM елементи
    const canvasEl = document.getElementById('canvas');
    const paletteList = document.getElementById('element-list');
    const propsPanel = document.getElementById('props-content');
    const layerList = document.getElementById('layer-list');
    const btnGenerate = document.getElementById('btn-generate');
    const outputArea = document.getElementById('output-formspec');
    const btnDelete = document.getElementById('btn-delete-selected');
    const canvasWidthInput = document.getElementById('canvas-width');
    const canvasHeightInput = document.getElementById('canvas-height');
    const bgInput = document.getElementById('bg-input');
    const versionSelect = document.getElementById('formspec-version');
    const exportTypeSelect = document.getElementById('export-type');
    const bookFields = document.getElementById('book-fields');
    const bookOwnerInput = document.getElementById('book-owner');
    const bookDescInput = document.getElementById('book-desc');
    const bookTextInput = document.getElementById('book-text');
    const bookTitleInput = document.getElementById('book-title');

    // Показати/сховати поля книги
    exportTypeSelect.addEventListener('change', () => {
        bookFields.style.display = exportTypeSelect.value === 'book_written' ? 'block' : 'none';
    });

    // Заповнення палітри
    ELEMENT_TYPES.forEach(typeObj => {
        const div = document.createElement('div');
        div.className = 'element-item';
        div.textContent = typeObj.label;
        div.draggable = true;
        div.dataset.type = typeObj.type;
        div.addEventListener('dragstart', handleDragStart);
        paletteList.appendChild(div);
    });

    // Drag & Drop
    canvasEl.addEventListener('dragover', e => e.preventDefault());
    canvasEl.addEventListener('drop', handleDrop);

    // Оновлення розміру полотна
    function updateCanvasSize() {
        const w = parseFloat(canvasWidthInput.value) || 8;
        const h = parseFloat(canvasHeightInput.value) || 9;
        canvasEl.style.width = (w * SCALE) + 'px';
        canvasEl.style.height = (h * SCALE) + 'px';
    }
    
    canvasWidthInput.addEventListener('input', updateCanvasSize);
    canvasHeightInput.addEventListener('input', updateCanvasSize);
    updateCanvasSize();

    // Drag start
    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.type);
        e.dataTransfer.effectAllowed = 'copy';
    }

    // Drop на полотно
    function handleDrop(e) {
        e.preventDefault();
        const type = e.dataTransfer.getData('text/plain');
        const typeObj = ELEMENT_TYPES.find(t => t.type === type);
        if (!typeObj) return;

        const rect = canvasEl.getBoundingClientRect();
        const x = (e.clientX - rect.left) / SCALE;
        const y = (e.clientY - rect.top) / SCALE;

        const newEl = createElementData(typeObj);
        newEl.x = Math.round(x * 10) / 10;
        newEl.y = Math.round(y * 10) / 10;
        elements.push(newEl);
        selectElement(newEl.id);
        renderAll();
    }

    // Виділення
    function selectElement(id) {
        selectedId = id;
        renderAll();
    }

    // Видалення
    function deleteSelected() {
        if (selectedId) {
            elements = elements.filter(el => el.id !== selectedId);
            selectedId = null;
            renderAll();
        }
    }
    
    btnDelete.addEventListener('click', deleteSelected);
    document.addEventListener('keydown', e => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && document.activeElement === document.body) {
            deleteSelected();
        }
    });

    // Список шарів
    function updateLayerList() {
        layerList.innerHTML = '';
        const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
        sorted.forEach((el, index) => {
            const li = document.createElement('li');
            const typeDef = ELEMENT_TYPES.find(t => t.type === el.type);
            li.textContent = `${index + 1}. ${typeDef ? typeDef.label : el.type}`;
            li.className = el.id === selectedId ? 'active-layer' : '';
            li.addEventListener('click', () => selectElement(el.id));
            layerList.appendChild(li);
        });
    }

    // Панель властивостей
    function updatePropertiesPanel() {
        if (!selectedId) {
            propsPanel.innerHTML = '<p style="color: #888;">Виберіть елемент на полотні</p>';
            return;
        }
        
        const el = elements.find(e => e.id === selectedId);
        if (!el) return;
        
        const typeDef = ELEMENT_TYPES.find(t => t.type === el.type);
        if (!typeDef) return;
        
        let html = `<strong style="color: #00ff88;">${typeDef.label}</strong><br><br>`;
        
        typeDef.props.forEach(prop => {
            let value = el[prop] !== undefined ? el[prop] : '';
            html += `<label>${prop}:</label>`;
            
            if (prop === 'color') {
                html += `<input type="color" data-prop="${prop}" value="${value}" onchange="updateProperty(this)" style="height: 30px;">`;
            } else if (prop === 'text' || prop === 'label' || prop === 'default') {
                html += `<textarea data-prop="${prop}" onchange="updateProperty(this)" rows="2">${value}</textarea>`;
            } else {
                html += `<input type="text" data-prop="${prop}" value="${value}" onchange="updateProperty(this)">`;
            }
        });
        
        html += `<label>zIndex:</label>`;
        html += `<input type="number" data-prop="zIndex" value="${el.zIndex || 0}" onchange="updateProperty(this)">`;
        
        propsPanel.innerHTML = html;
    }

    // Глобальна функція для onchange
    window.updateProperty = function(input) {
        if (!selectedId) return;
        const el = elements.find(e => e.id === selectedId);
        if (!el) return;
        
        const prop = input.dataset.prop;
        let val = input.value;
        
        if (prop === 'zIndex' || prop === 'selected' || prop === 'columns' || prop === 'rows') {
            val = Number(val);
        }
        if (prop === 'x' || prop === 'y' || prop === 'width' || prop === 'height') {
            val = parseFloat(val) || 0;
        }
        
        el[prop] = val;
        renderAll();
    };

    // Малювання полотна
    function renderCanvas() {
        canvasEl.innerHTML = '<div id="grid-overlay"></div>';
        
        const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
        
        sorted.forEach(el => {
            const div = document.createElement('div');
            div.className = 'canvas-element' + (el.id === selectedId ? ' selected' : '');
            div.style.left = (el.x * SCALE) + 'px';
            div.style.top = (el.y * SCALE) + 'px';
            div.style.width = ((el.width || 1) * SCALE) + 'px';
            div.style.height = ((el.height || 1) * SCALE) + 'px';
            div.style.zIndex = el.zIndex || 0;
            div.dataset.id = el.id;

            // Текст на елементі
            let displayText = el.label || el.text || el.name || el.type;
            if (el.type === 'box') displayText = '';
            if (el.type === 'list' || el.type === 'playerlist') displayText = `📦 ${el.columns}x${el.rows}`;
            div.textContent = displayText;

            // Кнопка видалення
            const delBtn = document.createElement('span');
            delBtn.className = 'delete-btn';
            delBtn.textContent = '×';
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                elements = elements.filter(e => e.id !== el.id);
                if (selectedId === el.id) selectedId = null;
                renderAll();
            });
            div.appendChild(delBtn);

            // Перетягування
            div.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('delete-btn')) return;
                e.preventDefault();
                selectElement(el.id);

                const startX = e.clientX;
                const startY = e.clientY;
                const origX = el.x;
                const origY = el.y;

                function onMouseMove(e) {
                    const dx = (e.clientX - startX) / SCALE;
                    const dy = (e.clientY - startY) / SCALE;
                    el.x = Math.max(0, Math.round((origX + dx) * 10) / 10);
                    el.y = Math.max(0, Math.round((origY + dy) * 10) / 10);
                    renderCanvas();
                }

                function onMouseUp() {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                    renderAll();
                }

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            });

            canvasEl.appendChild(div);
        });
    }

    function renderAll() {
        renderCanvas();
        updateLayerList();
        updatePropertiesPanel();
    }

    // Генерація
    btnGenerate.addEventListener('click', () => {
        const w = canvasWidthInput.value;
        const h = canvasHeightInput.value;
        const ver = versionSelect.value;
        const bg = bgInput.value.trim();
        const exportType = exportTypeSelect.value;

        let bookFieldsData = {};
        if (exportType === 'book_written') {
            bookFieldsData = {
                owner: bookOwnerInput.value,
                desc: bookDescInput.value,
                text: bookTextInput.value,
                title: bookTitleInput.value
            };
        }

        const result = generateExportString(elements, w, h, ver, bg, exportType, bookFieldsData);
        outputArea.value = result;
    });

    // Початкове відображення
    renderAll();
});
